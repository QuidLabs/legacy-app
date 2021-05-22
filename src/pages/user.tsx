import React, { useEffect } from "react";
import styled from "styled-components";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { formatAsset, TAsset } from "@deltalabs/eos-utils";
import { MdInfo } from "react-icons/md";
import {
  ResponsiveFlex,
  Section,
  HorizontalFlex,
  VerticalFlex,
} from "../components/shared";
import ActionCard from "../components/user/ActionCard";
import { useStore } from "../store/use-store";
import {
  AssetInfo,
  AssetInfoRow,
  ValueInfo,
} from "../components/user/AssetInfo";
import {
  InsuranceLendBlock,
  InsuranceSavingsBlock,
  BorrowVigorCollateralBlock,
  BorrowVigorLoanBlock,
  BorrowCryptoCollateralBlock,
  BorrowCryptoLoanBlock,
} from "../components/user/InteractionBlock";
import omit from "lodash/omit";
import pick from "lodash/pick";
import ActivityLog from "../components/user/ActivityLog";
import BailoutLog from "../components/user/BailoutLog";
import LimitsInfo from "../components/user/LimitsInfo";
import { dec2asset, formatNumber } from "../utils/format";
import FeesInfo from "../components/user/FeesInfo";
import ualConfig from "../../config/ual";
import FaucetButton from "../components/FaucetButton";
import VoteButton from "../components/VoteButton";
import AssetTable from "../components/shared/AssetTable";
import { symbolCode2Symbol } from "../utils/tokens";
import { variant2Color } from "../components/shared/color-props";
import LiquidateButton from "../components/user/LiquidateButton";
import filter from "lodash/filter";
import { FiExternalLink } from "react-icons/all";
import { MdInfoOutline } from 'react-icons/all';

const TutorialButton = styled.button`
  font-size: 18px;
`;

const StatsEstRate = styled.div<any>`
  margin-top: 4px;
  font-size: 12px;
  text-align: center;
  color: ${variant2Color};
`;

const StyledMdInfoOutlineIcon = styled(MdInfoOutline)`
  margin-left: 4px;
  color: ${p => p.theme.colors.primary};
`;

const SwapLink = styled.a`
  font-family: inherit;
  display: flex;
  color: ${p => p.theme.colors.white};
  align-items: center;
  font-size: 12px;
  line-height: 10px;
  text-align: center;
  padding: 8px 12px;
  border-radius: ${p => p.theme.borderRadius};
  cursor: pointer;
  border: 1px solid ${p => p.theme.colors.white};
  margin-right: 16px;
  
  > svg {
    color: ${p => p.theme.colors.white};
    margin-right: 4px;
    top: -1px;
    position: relative;
  }
  
  :hover,
  :active,
  :focus {
    color: ${p => p.theme.colors.whiteDarkened};
    border-color: ${p => p.theme.colors.whiteDarkened};

    > svg {
      color: ${p => p.theme.colors.whiteDarkened};
    }
  }
`;

const VoteLink = styled.a`
  font-family: inherit;
  display: flex;
  justify-content: space-between;
  color: ${p => p.theme.colors.white};
  align-items: center;
  font-size: 18px;
  line-height: 10px;
  text-align: center;
  padding: 8px 12px;
  cursor: pointer;
  margin-right: 16px;
  
  > svg {
    color: ${p => p.theme.colors.white};
    margin-right: 4px;
    top: -1px;
    position: relative;
  }
  
  :hover,
  :active,
  :focus {
    color: ${p => p.theme.colors.whiteDarkened};

    > svg {
      color: ${p => p.theme.colors.whiteDarkened};
    }
  }
`;

const SwapLiqWrap = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 100%;
  padding-top: 16px;
  margin-top: auto;
`;

// @ts-ignore
const VerticalFlexFullHeight = styled(VerticalFlex)`
  justify-content: flex-start;
  height: 100%;
`;

const User: React.FC<GlobalProps> = () => {
  const { t } = useTranslation();
  const [vigorStore, tutorialStore, walletStore, priceFeedStore] = useStore((store) => [
    store.vigorStore,
    store.tutorialStore,
    store.walletStore,
    store.priceFeedStore,
  ]);
  useEffect(() => {
    if (!tutorialStore.hasSeenUserDashboardTutorial) {
      tutorialStore.showUserDashboardTutorial(t);
    }
  }, []);

  const userInsurances = vigorStore.userInsurances;
  const userInsurancesInUsd = vigorStore.userInsurancesInUsd;
  const userCollaterals = vigorStore.userCollaterals;
  const userCollateralsInUsd = vigorStore.userCollateralsInUsd;
  const userDebt = vigorStore.userDebt;
  const userSavings = vigorStore.userSavings;
  const userSavingsInUsd = vigorStore.userSavingsInUsd;
  const isLoggedIn = walletStore.isLoggedIn;

  const hasInsurance = Object.keys(userInsurances).length > 0;

  const lendVigPerDayInUsd = (userInsurancesInUsd.totalValue * vigorStore.userLendReward) / 365;
  const lendVigPerDay =  priceFeedStore.convertUsd2Token(lendVigPerDayInUsd, symbolCode2Symbol('VIG'));
  const savingsVigPerDayInUsd = (userSavingsInUsd * vigorStore.userSavingsReward) / 365;
  const savingsVigPerDay = priceFeedStore.convertUsd2Token(savingsVigPerDayInUsd, symbolCode2Symbol('VIG'));
  const borrowCryptoVigPerDayInUsd = ((vigorStore.userDebtInUsd.totalValueNoVigor)* vigorStore.userBorrowRateCrypto) / 365;
  const borrowCryptoVigPerDay = priceFeedStore.convertUsd2Token(borrowCryptoVigPerDayInUsd, symbolCode2Symbol('VIG'));
  const borrowVigorVigPerDayInUsd = ((vigorStore.userDebtInUsd.totalValue - vigorStore.userDebtInUsd.totalValueNoVigor) * vigorStore.userBorrowRateVigor) / 365;
  const borrowVigorVigPerDay = priceFeedStore.convertUsd2Token(borrowVigorVigPerDayInUsd, symbolCode2Symbol('VIG'));

  const netVigEquivalentPerDayInUsd = (lendVigPerDayInUsd + savingsVigPerDayInUsd) - (borrowCryptoVigPerDayInUsd + borrowVigorVigPerDayInUsd);

  const filterTokensWithBalance = (tokens: { [key: string]: TAsset }) => {
    return filter(
      tokens,
      (asset: TAsset) => !asset.amount.isZero()
    );
  }

  return (
    <Section>
      <HorizontalFlex justifyContent="flex-end">
        {ualConfig.isTestNet && isLoggedIn ? <FaucetButton /> : <div />}
        <VoteLink
          rel="noreferrer noopener" target="_blank" href='https://dac.vigor.ai/vote-custodians'
        >
          <FiExternalLink size={18} color={"#6DE4F0"}/>
          { "Vote" }
          <StyledMdInfoOutlineIcon size={19} data-tip={"VIG holders vote and elect custodians to govern the protocol."} data-place='top'/>
        </VoteLink> <div />
        <TutorialButton
          onClick={() => tutorialStore.showUserDashboardTutorial(t)}
        >
          {t(`tutorial.name`)}
          <MdInfo size={18} color={"#6DE4F0"} />
        </TutorialButton>  
      </HorizontalFlex>

      <LimitsInfo />
      <FeesInfo netVigEquivalentPerDayInUsd={netVigEquivalentPerDayInUsd} />

      <ResponsiveFlex alignItems="stretch" respnsiveAlignItems="center">
        <ActionCard colorVariant="secondary" id="lendBox">
          <ActionCard.Header>
            <ActionCard.Header.Title>
              {t(`user.lend.title`)}
            </ActionCard.Header.Title>
            { hasInsurance ? (
              <div>
                <ActionCard.Header.Stats
                  tooltip={t(`user.lend.lendRewardTooltip`)}
                  colorVariant="secondary"
                  description={t(`user.lend.reward`)}
                  value={`${(vigorStore.userLendReward * 100).toFixed(2)}%`}
                />
                <StatsEstRate colorVariant="secondary">+{ formatAsset(lendVigPerDay) }/day</StatsEstRate>
              </div>
            ) : (
              <ActionCard.Header.Stats
                tooltip={t(`user.lend.lendRewardTooltip`)}
                colorVariant="secondary"
                description={t(`user.lend.reward`)}
                value={`${(vigorStore.userLendReward * 100).toFixed(2)}%*`}
              />
            )}
            <ActionCard.Header.WizardLink url="/rewards/insure" />
          </ActionCard.Header>
          <ActionCard.Body>
            <ActionCard.Body.Block className="insurance">
              <VerticalFlex>
                <ValueInfo
                  colorVariant="secondary"
                  description={t(`value`)}
                  value={`$${formatNumber(userInsurancesInUsd.totalValue)}`}
                />
                <AssetInfo>
                  <AssetInfoRow
                    data-tip={t(`user.lend.pctsTooltip`)}
                    colorVariant="secondary"
                    description={t(`user.solvencyContribution`)}
                    value={`${(
                      vigorStore.userLendContributions.down * 100
                    ).toFixed(1)}% / ${(
                      vigorStore.userLendContributions.up * 100
                    ).toFixed(1)}%`}
                  />
                </AssetInfo>
                <ActionCard.Body.EndBlock>
                  <InsuranceLendBlock colorVariant="secondary" />
                </ActionCard.Body.EndBlock>
                <AssetTable
                  tokens={userInsurances}
                  tokensInUsd={userInsurancesInUsd}
                  totalValueInUsd={userInsurancesInUsd.totalValue}
                  colorVariant="secondary"
                />
              </VerticalFlex>
            </ActionCard.Body.Block>
          </ActionCard.Body>
        </ActionCard>

        <ActionCard colorVariant="secondary" id="savingsBox">
          <ActionCard.Header>
            <ActionCard.Header.Title>
              {t(`user.vault.title`)}
            </ActionCard.Header.Title>
            <div>
              <ActionCard.Header.Stats
                colorVariant="secondary"
                description={t(`user.vault.reward`)}
                value={`${(vigorStore.userSavingsReward * 100).toFixed(2)}%`}
              />
              { userSavingsInUsd > 0 &&
                <StatsEstRate colorVariant="secondary">+{ formatAsset(savingsVigPerDay) }/day</StatsEstRate>
              }
            </div>
            <ActionCard.Header.WizardLink url="/rewards/savings" />
          </ActionCard.Header>
          <ActionCard.Body>
            <ActionCard.Body.Block>
              <VerticalFlex>
                <ValueInfo
                  colorVariant="secondary"
                  description={t(`value`)}
                  value={`$${formatNumber(userSavingsInUsd || 0)}`}
                />
                <AssetInfo>
                  <AssetInfoRow
                    data-tip={t(`user.vault.pctsTooltip`)}
                    colorVariant="secondary"
                    description={t(`user.poolContribution`)}
                    value={`${(
                      vigorStore.userSavingsContributions * 100
                    ).toFixed(2)}%`}
                  />
                </AssetInfo>
                <ActionCard.Body.EndBlock>
                  <InsuranceSavingsBlock colorVariant="secondary" />
                </ActionCard.Body.EndBlock>
                <AssetTable
                  tokens={{ VIGOR: userSavings }}
                  tokensInUsd={{ VIGOR: userSavingsInUsd || 0 }}
                  totalValueInUsd={userSavingsInUsd || 0}
                  colorVariant="secondary"
                />
              </VerticalFlex>
            </ActionCard.Body.Block>
          </ActionCard.Body>
        </ActionCard>
      </ResponsiveFlex>

      <HorizontalFlex margin={`32px 0 0 0`}>
        <ActionCard colorVariant="primary" id="vigorLoansBox">
          <ActionCard.Header>
            <ActionCard.Header.Title>
              {t(`user.vigorLoans.title`)}
              <ActionCard.Header.WizardLink url="/borrow/vigor" />
            </ActionCard.Header.Title>
            <div>
              <ActionCard.Header.Stats
                colorVariant="primary"
                description={t(`user.vigorLoans.borrowRate`)}
                value={`${(vigorStore.userBorrowRateVigor * 100).toFixed(2)}%`}
              />
              { vigorStore.userDebtInUsd.totalValue - vigorStore.userDebtInUsd.totalValueNoVigor > 0 &&
                <StatsEstRate colorVariant="primary">-{ formatAsset(borrowVigorVigPerDay) }/day</StatsEstRate>
              }
            </div>
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
            <ActionCard.Body.Block className="collateral">
              <VerticalFlexFullHeight>
                <ActionCard.Body.Title>
                  {t(`collateral`).toUpperCase()}
                </ActionCard.Body.Title>
                <ValueInfo
                  colorVariant="primary"
                  description={t(`value`)}
                  value={`$${formatNumber(
                    userCollateralsInUsd.totalValueNoVigor || 0
                  )}`}
                />
                <ActionCard.Body.EndBlock>
                  <BorrowVigorCollateralBlock colorVariant="primary" />
                </ActionCard.Body.EndBlock>
                <AssetTable
                  tokens={omit(userCollaterals, "VIGOR")}
                  tokensInUsd={omit(userCollateralsInUsd, "VIGOR")}
                  totalValueInUsd={
                    vigorStore.userCollateralsInUsd.totalValueNoVigor
                  }
                  colorVariant="primary"
                />
                <SwapLiqWrap>
                  <SwapLink rel="noreferrer noopener" target="_blank" href='https://defibox.io/pool-market-details/11'>
                    <FiExternalLink size={11}/>
                    { "DefiBox: Swap EOS+VIG" }
                  </SwapLink>
                </SwapLiqWrap>
              </VerticalFlexFullHeight>
            </ActionCard.Body.Block>

            <ActionCard.Body.Divider
              type="cr"
              value={vigorStore.userVigorCollateralRatio}
              loanValueUSD={
                vigorStore.userDebtInUsd.totalValue -
                vigorStore.userDebtInUsd.totalValueNoVigor
              }
              collateralValueUSD={
                vigorStore.userCollateralsInUsd.totalValueNoVigor
              }
            />

            <ActionCard.Body.Block className="loan">
              <VerticalFlexFullHeight>
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
                <SwapLiqWrap>
                  <SwapLink rel="noreferrer noopener" target="_blank" href='https://defibox.io/pool-market-details/1105'>
                    <FiExternalLink size={11}/>
                    { "DefiBox: Swap VIGOR+USDT" }
                  </SwapLink>
                 {/* <LiquidateButton action={'liquidate'} isActive={Object.keys(filterTokensWithBalance(pick(vigorStore.userDebt, "VIGOR"))).length > 0}/>*/}
                </SwapLiqWrap>
              </VerticalFlexFullHeight>
            </ActionCard.Body.Block>
          </ActionCard.Body>
        </ActionCard>
      </HorizontalFlex>

      <HorizontalFlex margin={`32px 0 0 0`}>
        <ActionCard colorVariant="primary" id="cryptoLoansBox">
          <ActionCard.Header>
            <ActionCard.Header.Title>
              {t(`user.cryptoLoans.title`)}
              <ActionCard.Header.WizardLink url="/borrow/crypto" />
            </ActionCard.Header.Title>
            <div>
              <ActionCard.Header.Stats
                colorVariant="primary"
                description={t(`user.vigorLoans.borrowRate`)}
                value={`${(vigorStore.userBorrowRateCrypto * 100).toFixed(2)}%`}
              />
              { vigorStore.userDebtInUsd.totalValueNoVigor > 0 &&
                <StatsEstRate colorVariant="primary">-{ formatAsset(borrowCryptoVigPerDay) }/day</StatsEstRate>
              }
            </div>
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
                      before: (
                        (vigorStore.userBorrowRateCrypto /
                          (1 - vigorStore.userDiscount)) *
                        100
                      ).toFixed(2),
                      after: (vigorStore.userBorrowRateCrypto * 100).toFixed(2),
                    }),
              ]}
            />
          </ActionCard.Header>
          <ActionCard.Body>
            <ActionCard.Body.Block>
              <VerticalFlex>
                <ActionCard.Body.Title>
                  {t(`collateral`).toUpperCase()}
                </ActionCard.Body.Title>
                <ValueInfo
                  colorVariant="primary"
                  description={t(`value`)}
                  value={`$${formatAsset(
                    vigorStore.userCollaterals[`VIGOR`] ||
                      dec2asset(0, symbolCode2Symbol(`VIGOR`)),
                    {
                      withSymbol: false,
                      separateThousands: true,
                    }
                  ).slice(0, -2)}`}
                />
                <ActionCard.Body.EndBlock>
                  <BorrowCryptoCollateralBlock colorVariant="primary" />
                </ActionCard.Body.EndBlock>
                <AssetTable
                  tokens={pick(userCollaterals, "VIGOR")}
                  tokensInUsd={pick(userCollateralsInUsd, "VIGOR")}
                  totalValueInUsd={userCollateralsInUsd.VIGOR || 0}
                  colorVariant="primary"
                />
              </VerticalFlex>
            </ActionCard.Body.Block>

            <ActionCard.Body.Divider
              type="cr"
              value={vigorStore.userCryptoCollateralRatio}
              loanValueUSD={vigorStore.userDebtInUsd.totalValueNoVigor}
              collateralValueUSD={vigorStore.userCollateralsInUsd.VIGOR}
            />

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
                  tokens={omit(userDebt, "VIGOR")}
                  tokensInUsd={omit(vigorStore.userDebtInUsd, "VIGOR")}
                  totalValueInUsd={vigorStore.userDebtInUsd.totalValueNoVigor}
                  colorVariant="primary"
                />{/*
                <SwapLiqWrap>
                  <LiquidateButton action={'liquidateup'} isActive={Object.keys(filterTokensWithBalance(omit(userDebt, "VIGOR"))).length > 0}/>
                </SwapLiqWrap>
                */}
              </VerticalFlex>
            </ActionCard.Body.Block>
          </ActionCard.Body>
        </ActionCard>
      </HorizontalFlex>

      <HorizontalFlex>
        <ActivityLog />
      </HorizontalFlex>

      <HorizontalFlex>
        <BailoutLog />
      </HorizontalFlex>
    </Section>
  );
};

export default observer(User);
