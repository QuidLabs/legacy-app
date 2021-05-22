import React from "react";
import { observer } from "mobx-react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { Section, ResponsiveFlex } from "../components/shared";
import { ColoredQuickInfoBox } from "../components/index/ColoredBox";
import Stats from "../components/health/Stats";
import { media } from "../utils/breakpoints";
import { useStore } from "../store/use-store";
import { ColorVariantProps, variant2Color } from "../components/shared/color-props";
import GlobalUserStats from "../components/health/GlobalUserStats";
import BorrowCharts from "../components/health/BorrowCharts";

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

const Box = styled.div`
  display: flex;
  width: 100%;
  padding: 32px 32px;
  background-color: ${p => p.theme.colors.bgLight};
`;
const BoxHorizontalFlex = styled(Box)`
  align-items: center;
  justify-content: space-around;
`;

const RateDescription = styled.div<ColorVariantProps>`
  margin-top: auto;
  color: ${variant2Color};
  font-size: 1.6rem;
  
  & > :last-child {
    font-size: 1.2rem;
  }
`;

const Health: React.FC<GlobalProps> = props => {
  const { t } = useTranslation();
  const [walletStore, vigorStore, priceFeedStore] = useStore(store => [store.walletStore, store.vigorStore, store.priceFeedStore]);

  const onConnectClick = () => {
    walletStore.login();
  };

  return (
    <Section>
      <BoxesWrapper
        alignItems="stretch"
        justifyContent="stretch"
        responsiveAlignItems="center"
        margin="48px 0 0 0"
      >
        <ColoredQuickInfoBox
          padding="32px 32px"
          // @ts-ignore
          colorVariant="secondary"
          title={
            <span>
              {t(`index.earn`)}
              <br />
              <RateDescription colorVariant="secondary">
                <div>
                  <span>{(vigorStore.globalLendReward * 100).toFixed(1)}% </span> /
                  <span> {(vigorStore.userSavingsReward * 100).toFixed(1)}%</span>
                </div>
              </RateDescription>
            </span>
          }
          buttonProps={{
            text: walletStore.isLoggedIn
              ? t(`index.earnButton`)
              : t(`connectWallet`),
            onClick: walletStore.isLoggedIn ? undefined : onConnectClick,
            as: walletStore.isLoggedIn ? `localLink` : `button`,
            to: `/rewards`
          }}
        >
          <React.Fragment>
            <Description>{t(`health.earnDescription`)}</Description>
          </React.Fragment>
        </ColoredQuickInfoBox>
        <ColoredQuickInfoBox
          padding="32px 32px"
          // @ts-ignore
          colorVariant="primary"
          title={
            <span>
              {t(`index.borrow`)}
              <br />
              <RateDescription colorVariant="primary">
                <span>*{(vigorStore.config.mintesprice / 100).toFixed(1)}%</span>
              </RateDescription>
            </span>
          }
          buttonProps={{
            text: walletStore.isLoggedIn
              ? t(`index.borrowButton`)
              : t(`connectWallet`),
            onClick: walletStore.isLoggedIn ? undefined : onConnectClick,
            as: walletStore.isLoggedIn ? `localLink` : `button`,
            to: `/borrow`
          }}
        >
          <React.Fragment>
            <Description>{t(`health.borrowDescription`)}</Description>
          </React.Fragment>
        </ColoredQuickInfoBox>
      </BoxesWrapper>

      <BorrowCharts />

      <BoxesWrapper
        alignItems="stretch"
        responsiveAlignItems="center"
        margin="32px 0 32px 0"
      >
        <BoxHorizontalFlex>
          <Stats
            description={t(`health.inReserve`)}
            value={vigorStore.vigReserve}
            tooltip={t('health.inReserve_tooltip')}
          />
          <Stats
            description={t(`health.totalBorrowed`)}
            value={`$${vigorStore.totalBorrowed}`}
            tooltip={t('health.totalBorrowed_tooltip')}
          />
        </BoxHorizontalFlex>
        <BoxHorizontalFlex>
          <Stats
            description={t(`health.vigPrice`)}
            value={`$${priceFeedStore.usdPerVig}`}
            secondaryValue={`${priceFeedStore.eosPerVig} EOS`}
            tooltip={t('health.vigPrice_tooltip')}
          />
          <Stats
            description={t(`health.vigorSupply`)}
            value={vigorStore.vigorSupply}
            secondaryValue={`Holders: ${vigorStore.vigorTokenHolders}`}
            tooltip={t('health.vigorSupply_tooltip')}
          />
        </BoxHorizontalFlex>
      </BoxesWrapper>

      <GlobalUserStats />
    </Section>
  );
};

export default observer(Health);
