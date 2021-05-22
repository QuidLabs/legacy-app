import { observer } from "mobx-react";
import React from "react";
import {
  useTranslation,
} from "react-i18next";
import styled from "styled-components";
import omit from "lodash/omit";
import pick from "lodash/pick";
import { VerticalFlex, HorizontalFlex, Section, CenteredHalfWidthHorizontalFlex } from '../../components/shared';
import { useStore } from "../../store/use-store";
import Steps, { Slide } from "../../components/shared/Steps";
import { PageTitle, PageSubtitle } from "../../components/shared/PageTitle";
import AssetTable from "../../components/shared/AssetTable";
import ActionCard from '../../components/user/ActionCard';
import { BorrowCryptoCollateralBlock, BorrowCryptoLoanBlock } from '../../components/user/InteractionBlock';
import { ValueInfo } from '../../components/user/AssetInfo';
import { formatNumber } from '../../utils/format';
import FeesInfo from '../../components/user/FeesInfo';
import { MdInfoOutline } from "react-icons/all";

const getPageTitle = (step: number) => {
  switch (step) {
    case 0:
      return `borrowVigor.step1.pageTitle`;
    case 1:
      return `borrowVigor.step2.pageTitle`;
    default:
    case 2:
      return `borrowCrypto.step3.pageTitle`;
  }
};

const StepTitle = styled.h4`
  text-transform: uppercase;
  margin: 0 0 16px;
  color: ${p => p.theme.colors.primary};
`;

const SlideBottomNote = styled.div`
  display: flex;
  align-items: center;
  margin-top: auto;
  color: ${p => p.theme.colors.tertiary};
  
  & > div {
    margin-right: 4px;
  }
`;

const BorrowStablecoin: React.FC<GlobalProps> = (props) => {
  const { t } = useTranslation();
  const [ vigorStore ] = useStore((store) => [
    store.vigorStore,
  ]);
  const [activeStep, setStep] = React.useState<number>(0);

  const handleStepChange = (step: number) => {
    setStep(step);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: {
        return (
          <CenteredHalfWidthHorizontalFlex margin={'32px'}>
            <ActionCard colorVariant="primary" id="cryptoLoansBox">
              <ActionCard.Body>
                <ActionCard.Body.Block>
                  <VerticalFlex>
                    <ActionCard.Body.Title>
                      {t(`collateral`).toUpperCase()}
                    </ActionCard.Body.Title>
                    <ValueInfo
                      colorVariant="primary"
                      description={t(`value`)}
                      value={`$${formatNumber(vigorStore.userCollateralsInUsd.VIGOR || 0)}`}
                    />
                    <ActionCard.Body.EndBlock>
                      <BorrowCryptoCollateralBlock colorVariant="primary" />
                    </ActionCard.Body.EndBlock>
                    <AssetTable
                      tokens={pick(vigorStore.userCollaterals, "VIGOR")}
                      tokensInUsd={pick(vigorStore.userCollateralsInUsd, "VIGOR")}
                      totalValueInUsd={vigorStore.userCollateralsInUsd.VIGOR || 0}
                      colorVariant="primary"
                    />
                  </VerticalFlex>
                </ActionCard.Body.Block>
              </ActionCard.Body>
            </ActionCard>
          </CenteredHalfWidthHorizontalFlex>
        );
      }
      case 1: {
        return (
          <HorizontalFlex margin={'32px'}>
            <FeesInfo />
          </HorizontalFlex>
        );
      }
      default:
      case 2:
      case 3: {
        return (
          <CenteredHalfWidthHorizontalFlex margin={'32px'}>
            <ActionCard colorVariant="primary" id="cryptoLoansBox">
              <ActionCard.Header>
                <ActionCard.Header.Stats
                  colorVariant="primary"
                  description={t(`user.vigorLoans.borrowRate`)}
                  value={`${(vigorStore.userBorrowRateCrypto * 100).toFixed(2)}%`}
                />
                <ActionCard.Header.StatsResponsive
                  colorVariant="primary"
                  descriptions={[
                    t(`user.vigorLoans.reputation`),
                    t(`user.vigorLoans.discount`),
                  ]}
                  values={[
                    `${(vigorStore.userReputation * 100).toFixed(0)}%`,
                    `${(vigorStore.userDiscount * 100).toFixed(2)}%`,
                  ]}
                  tooltips={[
                    t(`user.reputationTooltip`, {
                      reputation: (vigorStore.userReputation * 100).toFixed(2),
                    }),
                    vigorStore.userBorrowRateCrypto === 0
                      ? t("user.discountTooltip_zeroDiscount")
                      : t(`user.discountTooltip`, {
                        before: ((vigorStore.userBorrowRateCrypto / (1 - vigorStore.userDiscount)) * 100).toFixed(2),
                        after: (vigorStore.userBorrowRateCrypto * 100).toFixed(2),
                      }),
                  ]}
                />
              </ActionCard.Header>
              <ActionCard.Body>
                <ActionCard.Body.Block>
                  <VerticalFlex>
                    <ActionCard.Body.Title>
                      {t(`loan`).toUpperCase()}
                    </ActionCard.Body.Title>
                    <ValueInfo
                      colorVariant="primary"
                      description={t(`value`)}
                      value={`$${formatNumber(
                        vigorStore.userDebtInUsd.totalValueNoVigor
                      )}`}
                    />
                    <ActionCard.Body.EndBlock>
                      <BorrowCryptoLoanBlock colorVariant="primary" />
                    </ActionCard.Body.EndBlock>
                    <AssetTable
                      tokens={omit(vigorStore.userDebt, "VIGOR")}
                      tokensInUsd={omit(vigorStore.userDebtInUsd, "VIGOR")}
                      totalValueInUsd={vigorStore.userDebtInUsd.totalValueNoVigor}
                      colorVariant="primary"
                    />
                  </VerticalFlex>
                </ActionCard.Body.Block>
              </ActionCard.Body>
            </ActionCard>
          </CenteredHalfWidthHorizontalFlex>
        );
      }
    }
  };

  return (
    <Section>
      <PageTitle>{t(`borrowCrypto.title`)}</PageTitle>
      <PageSubtitle>{t(getPageTitle(activeStep))}</PageSubtitle>

      <Steps
        slidesToStepMap={{ 0: 0, 1: 1, 2: 2, 3: 2 }}
        activeStep={activeStep}
        onStepChange={handleStepChange}
      >
        <Slide
          title={<StepTitle>{`${t(`step`)} 1`}</StepTitle>}
        >
          {t(`borrowCrypto.step1Description`)}
        </Slide>
        <Slide
          title={<StepTitle>{`${t(`step`)} 2`}</StepTitle>}
        >
          {t(`borrowVigor.step2Description`)}
        </Slide>
        <Slide
          title={<StepTitle>{`${t(`step`)} 3`}</StepTitle>}
        >
          {t(`borrowCrypto.step3Description`)}
          <SlideBottomNote data-tip={t('borrowVigor.step4Description')}>
            <div>
              How to avoid Bailout
            </div>
            <MdInfoOutline size={24} />
          </SlideBottomNote>
        </Slide>
      </Steps>

      {renderStepContent()}
    </Section>
  );
};

export default observer(BorrowStablecoin);
