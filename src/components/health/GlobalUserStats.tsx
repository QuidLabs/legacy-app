import React from "react";
import { observer } from "mobx-react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useStore } from "../../store/use-store";
import { ToggleButton } from "../shared/ToggleButton";
import { ResponsiveFlex, HorizontalFlex, VerticalFlex } from "../shared";
import ActionCard from "../user/ActionCard";
import { AssetInfo, AssetInfoRow, ValueInfo } from "../user/AssetInfo";
import { formatAsset } from "@deltalabs/eos-utils";
import VigorStore from "../../store/vigor";
import omit from "lodash/omit";
import pick from "lodash/pick";
import { formatNumber } from "../../utils/format";
import AssetTable from "../shared/AssetTable";

const Wrapper = styled.div`
  width: 100%;
  margin: 64px 0 0 0;
`;

const pickData = (vigorStore: VigorStore, type: string) => {
  switch (type) {
    case `finalReserve`: {
      return {
        lendReward: vigorStore.finalLendReward,
        insurances: vigorStore.finalInsurances,
        insurancesInUsd: vigorStore.finalInsurancesInUsd,
        savingsReward: vigorStore.userSavingsReward,
        collaterals: vigorStore.finalCollaterals,
        collateralsInUsd: vigorStore.finalCollateralsInUsd,
        debt: vigorStore.finalDebt,
        debtInUsd: vigorStore.finalDebtInUsd,
        savings: vigorStore.finalSavings,
        savingsInUsd: vigorStore.finalSavingsInUsd,
      };
    }
    case `global`:
    default: {
      return {
        lendReward: vigorStore.globalLendReward,
        insurances: vigorStore.globalInsurances,
        insurancesInUsd: vigorStore.globalInsurancesInUsd,
        savingsReward: vigorStore.userSavingsReward,
        collaterals: vigorStore.globalCollaterals,
        collateralsInUsd: vigorStore.globalCollateralsInUsd,
        debt: vigorStore.globalDebt,
        debtInUsd: vigorStore.globalDebtInUsd,
        savings: vigorStore.globalSavings,
        savingsInUsd: vigorStore.globalSavingsInUsd,
      };
    }
  }
};

type Props = {};
const GlobalUserStats: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [vigorStore] = useStore((store) => [store.vigorStore]);
  const [type, setType] = React.useState<string>(`global`);

  const data = pickData(vigorStore, type);
  // the value in the config is wrong, seems to have been rescaled in the contract in a dirty way
  // const lsoltarget = vigorStore.config.lsoltarget / 10.0
  const l_soltarget = 1.5

  return (
    <Wrapper>
      <HorizontalFlex margin="0 0 32px 0" justifyContent="center">
        <ToggleButton
          texts={[t(`health.global`), t(`health.finalReserve`)]}
          onChange={setType}
          values={[`global`, `finalReserve`]}
          activeValue={type}
          colorVariant="secondary"
          width="auto"
        />
      </HorizontalFlex>
      <ResponsiveFlex alignItems="stretch" respnsiveAlignItems="center">
        <ActionCard colorVariant="secondary">
          <ActionCard.Header>
            <ActionCard.Header.Title>
              {t(`user.lend.title`)}
            </ActionCard.Header.Title>
            <ActionCard.Header.Stats
              colorVariant="secondary"
              description={t(`user.lend.reward`)}
              value={`${(data.lendReward * 100).toFixed(2)}%`}
            />
          </ActionCard.Header>
          <ActionCard.Body>
            <ActionCard.Body.Block>
              <ValueInfo
                colorVariant="secondary"
                description={t(`value`)}
                value={`$${formatNumber(data.insurancesInUsd.totalValue)}`}
              />
              <AssetTable
                tokens={data.insurances}
                tokensInUsd={data.insurancesInUsd}
                totalValueInUsd={data.insurancesInUsd.totalValue}
                colorVariant="secondary"
              />
            </ActionCard.Body.Block>
          </ActionCard.Body>
        </ActionCard>

        <ActionCard colorVariant="secondary">
          <ActionCard.Header>
            <ActionCard.Header.Title>
              {t(`user.vault.title`)}
            </ActionCard.Header.Title>
            <ActionCard.Header.Stats
              colorVariant="secondary"
              description={t(`user.vault.reward`)}
              value={`${(data.savingsReward * 100).toFixed(2)}%`}
            />
          </ActionCard.Header>
          <ActionCard.Body>
            <ActionCard.Body.Block>
              <ValueInfo
                colorVariant="secondary"
                description={t(`value`)}
                value={`$${formatNumber(data.savingsInUsd || 0)}`}
              />
              <AssetTable
                tokens={{ VIGOR: data.savings }}
                tokensInUsd={{ VIGOR: data.savingsInUsd || 0 }}
                totalValueInUsd={data.savingsInUsd || 0}
                colorVariant="secondary"
              />
            </ActionCard.Body.Block>
          </ActionCard.Body>
        </ActionCard>
      </ResponsiveFlex>

      <HorizontalFlex margin={`32px 0 0 0`}>
        <ActionCard colorVariant="primary">
          <ActionCard.Header>
            <ActionCard.Header.Title>
              {t(`user.vigorLoans.title`)}
            </ActionCard.Header.Title>
          </ActionCard.Header>
          <ActionCard.Body>
            <ActionCard.Body.Block>
              <ActionCard.Body.Title>{t(`collateral`)}</ActionCard.Body.Title>
              <ValueInfo
                colorVariant="primary"
                description={t(`value`)}
                value={`$${formatNumber(
                  data.collateralsInUsd.totalValueNoVigor || 0
                )}`}
              />
              <AssetTable
                tokens={data.collaterals}
                tokensInUsd={data.collateralsInUsd}
                totalValueInUsd={data.collateralsInUsd.totalValue}
                colorVariant="primary"
              />
            </ActionCard.Body.Block>

            <ActionCard.Body.Divider
              type="solvency"
              value={vigorStore.solvency}
              target={vigorStore.config.soltarget / 10.0}
            />

            <ActionCard.Body.Block>
              <ActionCard.Body.Title>{t(`loan`)}</ActionCard.Body.Title>
              <ValueInfo
                colorVariant="primary"
                description={t(`value`)}
                value={`$${formatNumber(data.debtInUsd[`VIGOR`])}`}
              />
              <AssetTable
                tokens={pick(data.debt, "VIGOR")}
                tokensInUsd={pick(data.debtInUsd, "VIGOR")}
                totalValueInUsd={data.debtInUsd.VIGOR || 0}
                colorVariant="primary"
              />
            </ActionCard.Body.Block>
          </ActionCard.Body>
        </ActionCard>
      </HorizontalFlex>

      <HorizontalFlex margin={`32px 0 0 0`}>
        <ActionCard colorVariant="primary">
          <ActionCard.Header>
            <ActionCard.Header.Title>
              {t(`user.cryptoLoans.title`)}
            </ActionCard.Header.Title>
          </ActionCard.Header>
          <ActionCard.Body>
            <ActionCard.Body.Block>
              <ActionCard.Body.Title>{t(`collateral`)}</ActionCard.Body.Title>
              <ValueInfo
                colorVariant="primary"
                description={t(`value`)}
                value={`$${formatNumber(data.collateralsInUsd.VIGOR || 0)}`}
              />
              <AssetTable
                tokens={pick(data.collaterals, "VIGOR")}
                tokensInUsd={pick(data.collateralsInUsd, "VIGOR")}
                totalValueInUsd={data.collateralsInUsd.VIGOR || 0}
                colorVariant="primary"
              />
            </ActionCard.Body.Block>

            <ActionCard.Body.Divider
              type="solvency"
              value={vigorStore.l_solvency}
              target={l_soltarget}
            />

            <ActionCard.Body.Block>
              <ActionCard.Body.Title>{t(`loan`)}</ActionCard.Body.Title>
              <ValueInfo
                colorVariant="primary"
                description={t(`value`)}
                value={`$${formatNumber(data.debtInUsd.totalValueNoVigor)}`}
              />
              <AssetTable
                tokens={omit(data.debt, "VIGOR")}
                tokensInUsd={omit(data.debtInUsd, "VIGOR")}
                totalValueInUsd={data.debtInUsd.totalValueNoVigor || 0}
                colorVariant="primary"
              />
            </ActionCard.Body.Block>
          </ActionCard.Body>
        </ActionCard>
      </HorizontalFlex>
    </Wrapper>
  );
};

export default observer(GlobalUserStats);
