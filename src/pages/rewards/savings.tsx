import { observer } from "mobx-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { CenteredHalfWidthHorizontalFlex, Section, VerticalFlex } from '../../components/shared';
import { useStore } from "../../store/use-store";
import { PageTitle, PageSubtitle } from "../../components/shared/PageTitle";
import ActionCard from '../../components/user/ActionCard';
import { AssetInfo, AssetInfoRow, ValueInfo } from '../../components/user/AssetInfo';
import { formatNumber } from '../../utils/format';
import { InsuranceSavingsBlock } from '../../components/user/InteractionBlock';
import AssetTable from '../../components/shared/AssetTable';

const Savings: React.FC<GlobalProps> = (props) => {
  const { t } = useTranslation();
  const [vigorStore] = useStore((store) => [store.vigorStore]);

  return (
    <Section>
      <PageTitle>{t(`earnSavings.title`)}</PageTitle>
      <PageSubtitle>{t("earnSavings.subtitle")}</PageSubtitle>

      <CenteredHalfWidthHorizontalFlex margin={'32px'}>
        <ActionCard colorVariant="secondary" id="savingsBox">
          <ActionCard.Header>
            <ActionCard.Header.Stats
              colorVariant="secondary"
              description={t(`user.vault.reward`)}
              value={`${(vigorStore.userSavingsReward * 100).toFixed(2)}%`}
            />
          </ActionCard.Header>
          <ActionCard.Body>
            <ActionCard.Body.Block>
              <VerticalFlex>
                <ValueInfo
                  colorVariant="secondary"
                  description={t(`value`)}
                  value={`$${formatNumber(vigorStore.userSavingsInUsd || 0)}`}
                />
                <AssetInfo>
                  <AssetInfoRow
                    data-tip={t(`user.vault.pctsTooltip`)}
                    colorVariant="secondary"
                    description={t(`user.poolContribution`)}
                    value={`${(vigorStore.userSavingsContributions * 100).toFixed(2)}%`}
                  />
                </AssetInfo>
                <ActionCard.Body.EndBlock>
                  <InsuranceSavingsBlock colorVariant="secondary" />
                </ActionCard.Body.EndBlock>
                <AssetTable
                  tokens={{ VIGOR: vigorStore.userSavings }}
                  tokensInUsd={{ VIGOR: vigorStore.userSavingsInUsd || 0 }}
                  totalValueInUsd={vigorStore.userSavingsInUsd || 0}
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

export default observer(Savings);
