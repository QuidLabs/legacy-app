import React from "react";
import { observer } from "mobx-react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { BlueButton, Section, ResponsiveFlex } from "../components/shared";
import { ColoredInfoBox } from "../components/index/ColoredBox";
import { media } from "../utils/breakpoints";
import { useStore } from "../store/use-store";
import earnSrc from "../assets/images/icon-earn.svg";
import borrowSrc from "../assets/images/icon-borrow.svg";
import BorrowCharts from "../components/health/BorrowCharts";

const getColor = (props: ColorVariantProps & any) =>
  props.colorVariant === `secondary`
    ? props.theme.colors.secondary
    : props.theme.colors.primary;

const Header = styled.h1`
  font-size: 2rem;
  margin-bottom: 64px;
  white-space: pre-wrap;
  text-align: center;
`;

const Description = styled.div`
  margin-bottom: 16px;
`;

const BoxesWrapper = styled(ResponsiveFlex)`
  & > :first-child {
    margin: 0 32px 0 0;
  }

  ${media.lessThan(`xs-max`)} {
    & > :first-child {
      margin: 0 0 32px 0;
    }
  }
`;

type ColorVariantProps = {
  colorVariant?: "primary" | "secondary";
};
const RateDescription = styled.div<ColorVariantProps>`
  margin-top: auto;
  color: ${getColor};

  & > :last-child {
    font-size: 1.2rem;
  }
`;

const Index: React.FC<GlobalProps> = (props) => {
  const { t } = useTranslation();
  const [walletStore, userStore, vigorStore] = useStore((store) => [
    store.walletStore,
    store.userStore,
    store.vigorStore,
  ]);

  const onConnectClick = async () => {
    await walletStore.login();
  };

  return (
    <Section>
      <Header>{t(`index.header`)}</Header>
      <BlueButton as="localizedLink" to='/user'>{t(`viewDashboard`)}</BlueButton>
      <BoxesWrapper
        alignItems="stretch"
        responsiveAlignItems="center"
        margin="48px 0 0 0"
      >
        <ColoredInfoBox
          width={320}
          padding="32px"
          // @ts-ignore
          colorVariant="secondary"
          icon={<img src={earnSrc} alt="Earn" />}
          title={t(`index.earn`)}
          buttonProps={{
            text: walletStore.isLoggedIn
              ? t(`index.earnButton`)
              : t(`connectWallet`),
            onClick: walletStore.isLoggedIn ? undefined : onConnectClick,
            as: walletStore.isLoggedIn ? `localLink` : `button`,
            to: `/rewards`,
          }}
        >
          <React.Fragment>
            <Description>{t(`index.earnDescription`)}</Description>
            <RateDescription colorVariant="secondary">
              <div>
                <span>{(vigorStore.globalLendReward * 100).toFixed(1)}% </span> /
                <span> {(vigorStore.userSavingsReward * 100).toFixed(1)}%</span>
              </div>
            </RateDescription>
          </React.Fragment>
        </ColoredInfoBox>
        <ColoredInfoBox
          width={320}
          padding="32px"
          // @ts-ignore
          colorVariant="primary"
          icon={<img src={borrowSrc} alt="Borrow" />}
          title={t(`index.borrow`)}
          buttonProps={{
            text: walletStore.isLoggedIn
              ? t(`index.borrowButton`)
              : t(`connectWallet`),
            onClick: walletStore.isLoggedIn ? undefined : onConnectClick,
            as: walletStore.isLoggedIn ? `localLink` : `button`,
            to: `/borrow`,
          }}
        >
          <React.Fragment>
            <Description>{t(`index.borrowDescription`)}</Description>
            <RateDescription colorVariant="primary">
              <div>{t(`index.borrowRateDescription`)}</div>
              <div>*{(vigorStore.config.mintesprice / 100).toFixed(1)}%</div>
            </RateDescription>
          </React.Fragment>
        </ColoredInfoBox>
      </BoxesWrapper>
      <BorrowCharts />
    </Section>
  );
};

export default observer(Index);
