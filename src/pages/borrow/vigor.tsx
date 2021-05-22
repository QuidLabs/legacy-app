import { observer } from "mobx-react";
import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import omit from "lodash/omit";
import pick from "lodash/pick";
import { CenteredHalfWidthHorizontalFlex, HorizontalFlex, Section, VerticalFlex } from '../../components/shared';
import { useStore } from "../../store/use-store";
import Steps, { Slide } from "../../components/shared/Steps";
import donateSrc from "../../assets/images/donate.png";
import moneyBoxSrc from "../../assets/images/money-box.png";
import receiveCashSrc from "../../assets/images/receive-cash.png";
import transactionSrc from "../../assets/images/transaction.png";
import { PageTitle, PageSubtitle } from "../../components/shared/PageTitle";
import AssetTable from "../../components/shared/AssetTable";
import ActionCard from '../../components/user/ActionCard';
import { ValueInfo } from '../../components/user/AssetInfo';
import { formatNumber } from '../../utils/format';
import {
  BorrowVigorCollateralBlock, BorrowVigorLoanBlock,
} from '../../components/user/InteractionBlock';
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
      return `borrowVigor.step3.pageTitle`;
  }
};

const StepTitle = styled.h4`
  text-transform: uppercase;
  margin: 0 0 16px;
  color: ${p => p.theme.colors.primary};
`;

const SlideBottomNote = styled.a`
  display: flex;
  align-items: center;
  margin-top: auto;
  color: ${p => p.theme.colors.tertiary};
  
  & > div {
    margin-right: 4px;
  }
`;
const BorrowStablecoin: React.FC<GlobalProps> = props => {
  const { t } = useTranslation();
  const [ vigorStore] = useStore(store => [ store.vigorStore]);
  const [ activeStep, setStep ] = React.useState<number>(0);

  const handleStepChange = (step: number) => {
    setStep(step);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: {
        return (
          <CenteredHalfWidthHorizontalFlex margin={'32px'}>
            <ActionCard colorVariant="primary" id="vigorLoansBox">
              <ActionCard.Body>
                <ActionCard.Body.Block className="collateral">
                  <VerticalFlex>
                    <ActionCard.Body.Title>
                      {t(`collateral`).toUpperCase()}
                    </ActionCard.Body.Title>
                    <ValueInfo
                      colorVariant="primary"
                      description={t(`value`)}
                      value={`$${formatNumber(
                        vigorStore.userCollateralsInUsd.totalValueNoVigor || 0
                      )}`}
                    />
                    <ActionCard.Body.EndBlock>
                      <BorrowVigorCollateralBlock colorVariant="primary" />
                    </ActionCard.Body.EndBlock>
                    <AssetTable
                      tokens={omit(vigorStore.userCollaterals, "VIGOR")}
                      tokensInUsd={omit(vigorStore.userCollateralsInUsd, "VIGOR")}
                      totalValueInUsd={
                        vigorStore.userCollateralsInUsd.totalValueNoVigor
                      }
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
            <ActionCard colorVariant="primary" id="vigorLoansBox">
              <ActionCard.Header>
                <ActionCard.Header.Stats
                  colorVariant="primary"
                  description={t(`user.vigorLoans.borrowRate`)}
                  value={`${(vigorStore.userBorrowRateVigor * 100).toFixed(2)}%`}
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
                    vigorStore.userBorrowRateVigor === 0
                      ? t("user.discountTooltip_zeroDiscount")
                      : t(`user.discountTooltip`, {
                        before: (
                          (vigorStore.userBorrowRateVigor /
                            (1 - vigorStore.userDiscount)) *
                          100
                        ).toFixed(2),
                        after: (vigorStore.userBorrowRateVigor * 100).toFixed(2),
                      }),
                  ]}
                />
              </ActionCard.Header>
              <ActionCard.Body>
                <ActionCard.Body.Block className="loan">
                  <VerticalFlex>
                    <ActionCard.Body.Title>
                      {t(`loan`).toUpperCase()}
                    </ActionCard.Body.Title>
                    <ValueInfo
                      colorVariant="primary"
                      description={t(`value`)}
                      value={`$${formatNumber(vigorStore.userDebtInUsd[`VIGOR`])}`}
                    />
                    <ActionCard.Body.EndBlock>
                      <BorrowVigorLoanBlock colorVariant="primary" />
                    </ActionCard.Body.EndBlock>
                    <AssetTable
                      tokens={pick(vigorStore.userDebt, "VIGOR")}
                      tokensInUsd={pick(vigorStore.userDebtInUsd, "VIGOR")}
                      totalValueInUsd={vigorStore.userDebtInUsd[`VIGOR`]}
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
    <PageTitle>{t(`borrowVigor.title`)}</PageTitle>
    <PageSubtitle>{t(getPageTitle(activeStep))}</PageSubtitle>

      <Steps
        slidesToStepMap={{ 0: 0, 1: 1, 2: 2, 3: 2 }}
        activeStep={activeStep}
        onStepChange={handleStepChange}
      >
        <Slide
          title={<StepTitle>{`${t(`step`)} 1`}</StepTitle>}
        >
          {t(`borrowVigor.step1Description`)}
        </Slide>
        <Slide
          title={<StepTitle>{`${t(`step`)} 2`}</StepTitle>}
        >
          {t(`borrowVigor.step2Description`)}
        </Slide>
        <Slide
          title={<StepTitle>{`${t(`step`)} 3`}</StepTitle>}
        >
          {t(`borrowVigor.step3Description`)}
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
