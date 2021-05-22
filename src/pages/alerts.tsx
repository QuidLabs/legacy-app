import { observer } from "mobx-react";
import React, { useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import _Slider, { createSliderWithTooltip } from "rc-slider";
import AlertsSvg from "../assets/svgs/icon-alert.svg";
import {
  BlueButton,
  Section,
  StyledLabel,
  StyledInput,
  StyledInputSuffix,
  HorizontalFlex,
  ResponsiveFlex,
  StyledCheckboxLabel,
} from "../components/shared";
import { useStore } from "../store/use-store";
import LoadingIndicator from "../components/shared/LoadingIndicator";
import { formatPercentage } from "../utils/format";
import StyledSlider from "../components/shared/StyledSlider";
import { media } from "../utils/breakpoints";

const SettingsWrapper = styled.div<any>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 2;
  width: 100%;
  margin: 0 16px;
  padding: 34px 45px;
  background-color: ${(p) => p.theme.colors.bgLight};

  ${media.lessThan(`xs-max`)} {
    margin: 0;
  }

  h3 {
    font-size: 22px;
    text-transform: capitalize;
    margin: 0 0 32px 0;
  }
`;

const AlertBox = styled.div<any>`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
  width: 100%;
  margin: 0 16px;
  padding: 16px 24px;
  background-color: ${(p) => p.theme.colors.bgLight};

  ${media.lessThan(`xs-max`)} {
    margin: 0 0 2rem 0;
    padding: 2rem 0 2rem 0;
    order: -1;
  }

  h2 {
    text-align: center;
    font-size: 26px;
    font-weight: 700;
    margin: 30px 0 26px 0;
  }

  h3 {
    text-align: center;
    font-size: 16px;
    font-weight: 500;
    margin: 0;
  }

  svg {
    max-width: 134px;
    max-height: 134px;
  }
`;

const FormRow = styled.div<any>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  margin: 0 0 24px 0;
  padding: 0 8px;

  & > label {
    margin: 0 0 8px 0;
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${(p) => p.theme.colors.bg}bb;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

// slider's marks can only be padded through a wrapper
const SliderWrapper = styled.div`
  width: 100%;
  margin: 0 0 24px 0;
  padding: 0 16px;
`;

const Alerts: React.FC<GlobalProps> = (props) => {
  const { t } = useTranslation();
  const [backendStore] = useStore((store) => [store.backendStore]);
  useEffect(() => {
    backendStore.fetchBackendUser();
  }, []);

  let overlay = null;
  if (backendStore.loading) {
    overlay = (
      <Overlay>
        <LoadingIndicator />
      </Overlay>
    );
  } else if (!backendStore.isAuthenticated || !backendStore.user) {
    overlay = (
      <Overlay>
        <BlueButton onClick={() => backendStore.authenticate()}>
          {t(`alerts.authenticate`)}
        </BlueButton>
      </Overlay>
    );
  } else if (!backendStore.user) {
    overlay = (
      <Overlay>
        <h3>{t(`alerts.settingsFailed`)}</h3>
        <BlueButton onClick={() => backendStore.authenticate()}>
          {t(`alerts.retry`)}
        </BlueButton>
      </Overlay>
    );
  }

  return (
    <Section>
      <ResponsiveFlex margin="auto 0" alignItems="stretch">
        <SettingsWrapper>
          <h3>{t("alerts.setup")}</h3>
          <FormRow>
            <StyledLabel>{`${t("alerts.notifyAt")} ${formatPercentage(
              backendStore.collateralRatio
            )}%`}</StyledLabel>
            <SliderWrapper>
              <StyledSlider
                padding="0 32px"
                startPoint={1}
                min={0}
                max={3}
                marks={{
                  0: `${formatPercentage(0)}%`,
                  1: `${formatPercentage(1)}%`,
                  2: `${formatPercentage(2)}%`,
                  3: `${formatPercentage(3)}%`,
                }}
                step={0.01}
                value={backendStore.collateralRatio}
                onChange={backendStore.handleCrChange}
              />
            </SliderWrapper>
          </FormRow>
          <FormRow>
            <StyledLabel>{t(`alerts.attachTelegram`)}</StyledLabel>
            {backendStore.user && backendStore.user.telegramVerified ? (
              <StyledInput
                as="text"
                value={backendStore.user.telegramUsername}
                readOnly
              />
            ) : (
              <HorizontalFlex justifyContent="space-between">
                <BlueButton
                  fullWidth
                  as="a"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={backendStore.telegramVerificationLink}
                  onClick={() => backendStore.handleVerifyClick()}
                >
                  {t(`alerts.verify`)}
                </BlueButton>
              </HorizontalFlex>
            )}
          </FormRow>
          <FormRow>
            <StyledCheckboxLabel>
              <input
                type="checkbox"
                onChange={backendStore.handleEnabledChange}
                checked={backendStore.enabled}
              />
              {t(`alerts.enable`)}
            </StyledCheckboxLabel>
          </FormRow>
          <FormRow>
            <BlueButton fullWidth onClick={() => backendStore.changeSettings()}>
              {t(`alerts.updateSettings`)}
            </BlueButton>
          </FormRow>
          {overlay}
        </SettingsWrapper>

        <AlertBox>
          <AlertsSvg />
          <h2>{t(`alerts.title`)}</h2>
          <h3>{t("alerts.subtitle")}</h3>
        </AlertBox>
      </ResponsiveFlex>
    </Section>
  );
};

export default observer(Alerts);
