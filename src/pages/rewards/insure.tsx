import { observer } from "mobx-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { CenteredHalfWidthHorizontalFlex, Section, VerticalFlex } from '../../components/shared';
import { useStore } from "../../store/use-store";
import { PageTitle, PageSubtitle } from "../../components/shared/PageTitle";
import AssetTable from "../../components/shared/AssetTable";
import ActionCard from '../../components/user/ActionCard';
import { AssetInfo, AssetInfoRow, ValueInfo } from '../../components/user/AssetInfo';
import { formatNumber } from '../../utils/format';
import { InsuranceLendBlock } from '../../components/user/InteractionBlock';

const Insure: React.FC<GlobalProps> = (props) => {
  const { t } = useTranslation();
  const [vigorStore] = useStore((store) => [store.vigorStore]);

  const hasInsurance = Object.keys(vigorStore.userInsurances).length > 0;

  return (
    <Section>
      <PageTitle>{t(`earnInsure.title`)}</PageTitle>
      <PageSubtitle>{t("earnInsure.subtitle")}</PageSubtitle>

      <CenteredHalfWidthHorizontalFlex margin={'32px'}>
        <ActionCard colorVariant="secondary" id="lendBox">
          <ActionCard.Header>
            {hasInsurance ? (
              <ActionCard.Header.Stats
                tooltip={t(`user.lend.lendRewardTooltip`)}
                colorVariant="secondary"
                description={t(`user.lend.reward`)}
                value={`${(vigorStore.userLendReward * 100).toFixed(2)}%`}
              />
            ) : (
              <ActionCard.Header.Stats
                tooltip={t(`user.lend.lendRewardTooltip`)}
                colorVariant="secondary"
                description={t(`user.lend.reward`)}
                value={`${(vigorStore.userLendReward * 100).toFixed(2)}%*`}
              />
            )}
          </ActionCard.Header>
          <ActionCard.Body>
            <ActionCard.Body.Block className="insurance">
              <VerticalFlex>
                <ValueInfo
                  colorVariant="secondary"
                  description={t(`value`)}
                  value={`$${formatNumber(vigorStore.userInsurancesInUsd.totalValue)}`}
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
                  tokens={vigorStore.userInsurances}
                  tokensInUsd={vigorStore.userInsurancesInUsd}
                  totalValueInUsd={vigorStore.userInsurancesInUsd.totalValue}
                  colorVariant="secondary"
                />
              </VerticalFlex>
            </ActionCard.Body.Block>
          </ActionCard.Body>
        </ActionCard>
      </CenteredHalfWidthHorizontalFlex>
    </Section>
  );
};

export default observer(Insure);
