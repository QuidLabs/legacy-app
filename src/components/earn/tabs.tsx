import { decomposeAsset, formatAsset, TAsset } from "@deltalabs/eos-utils";
import { observer } from "mobx-react";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { useStore } from "../../store/use-store";
import { BlueButton, StyledLabel } from "../shared";
import AmountInput from "../shared/AmountInput";
import { AssetInfo } from "../shared/AssetInfo";

const Tab = styled.div`
  padding: 32px;
`;

type TabTypeProps = {
  type: "deposit" | "withdraw";
};

const _InsuranceWithdrawDepositTabs: React.FC<TabTypeProps> = ({ type }) => {
  const { t } = useTranslation();
  const [walletStore, vigorStore] = useStore(store => [
    store.walletStore,
    store.vigorStore
  ]);
  const [asset, setAsset] = React.useState<TAsset | undefined>(undefined);
  const typeText = type === `deposit` ? t(`deposit`) : t(`withdraw`);
  const defaultInsuranceValue = decomposeAsset(`0.0000 EOS`);
  const maxValue =
    type === `deposit`
      ? walletStore.tokenBalances.EOS
      : typeof vigorStore.userInsurances['EOS'] === 'undefined' ? defaultInsuranceValue : vigorStore.userInsurances[`EOS`];

  const onSubmit = async () => {
    if (!asset) return;
    if (type === `deposit`) {
      await walletStore.depositInsurance(asset);
    } else {
      await walletStore.withdrawInsurance(asset);
    }
  };

  const totalInsuranceValue = vigorStore.userInsurancesInUsd.totalValue;
  const eosInsuranceAmount = vigorStore.userInsurances[`EOS`];
  const eosInsuranceUsd = vigorStore.userInsurancesInUsd[`EOS`] || 0;
  const eosAmountWallet = walletStore.tokenBalances[`EOS`];
  const eosUsdWallet = walletStore.tokenBalancesUsd[`EOS`] || 0;

  return (
    <Tab>
      <AssetInfo
        name={t(`earnInsure.earningRate`)}
        value={`${(vigorStore.userLendReward * 100).toFixed(2)}%`}
        colorVariant="secondary"
      />
      <AssetInfo
        name={t(`earnInsure.insuranceValue`)}
        value={`$${totalInsuranceValue.toFixed(2)}`}
        colorVariant="secondary"
      />
      {eosInsuranceAmount ? (
        <AssetInfo
          name=""
          value={`${formatAsset(eosInsuranceAmount, {
            separateThousands: true
          })} ($${eosInsuranceUsd.toFixed(2)})`}
          colorVariant="secondary"
          small
        />
      ) : null}
      <AssetInfo
        name={t(`inWallet`)}
        value={`$${eosUsdWallet.toFixed(2)}`}
        colorVariant="secondary"
      />
      <AssetInfo
        name=""
        value={`${formatAsset(eosAmountWallet, {
          separateThousands: true
        })} ($${eosUsdWallet.toFixed(2)})`}
        colorVariant="secondary"
        small
      />
      <StyledLabel css={{ margin: `24px 0 8px 0` }} htmlFor="amount">
        {`${t(typeText)} EOS`}
      </StyledLabel>
      <AmountInput
        id="amount"
        placeholder={`${t(`amountOf`)} EOS`}
        defaultValue={asset}
        maxValue={maxValue}
        onChange={(newAsset: TAsset) => setAsset(newAsset)}
      />
      <BlueButton
        disabled={!maxValue || maxValue.amount.toNumber() === 0 || (!asset || isNaN(asset.amount.toNumber()) || asset.amount.toNumber() === 0)}
        type="button"
        fullWidth
        onClick={onSubmit}
        margin="32px 0 0 0"
      >
        {typeText}
      </BlueButton>
    </Tab>
  );
};

export const InsuranceWithdrawDepositTabs = observer(_InsuranceWithdrawDepositTabs);

const _SavingsWithdrawDepositTabs: React.FC<TabTypeProps> = ({ type }) => {
  const { t } = useTranslation();
  const [walletStore, vigorStore] = useStore(store => [
    store.walletStore,
    store.vigorStore,
  ]);
  const [asset, setAsset] = React.useState<TAsset | undefined>(undefined);
  const typeText = type === `deposit` ? t(`deposit`) : t(`withdraw`);

  const onSubmit = async () => {
    if (!asset) return;
    if (type === `deposit`) {
      await walletStore.depositSavings(asset);
    } else {
      await walletStore.withdrawSavings(asset);
    }
  };

  const savingsTokenName = 'VIGOR';
  const vigorAmountWallet = walletStore.tokenBalances[savingsTokenName];
  const vigorSavingsAmount = vigorStore.userSavings;
  const vigorSavingsValue = vigorStore.userSavingsInUsd;
  const maxValue = type === `deposit` ? walletStore.tokenBalances.VIGOR : vigorSavingsAmount;
  const vigorDebt = vigorStore.userDebt.VIGOR;

  return (
    <Tab>
      <AssetInfo
        name={t(`earnInsure.earningRate`)}
        value={`${(vigorStore.userSavingsReward * 100).toFixed(2)}%`}
        colorVariant="secondary"
      />
      <AssetInfo
        name={t(`earnSavings.totalSavingsVigorValue`)}
        value={`$${vigorSavingsValue.toFixed(2)}`}
        colorVariant="secondary"
      />
      {
        vigorSavingsAmount &&
          <AssetInfo
            key={savingsTokenName}
            name=""
            value={`${formatAsset(vigorSavingsAmount, {
              separateThousands: true
            })} `}
            colorVariant="secondary"
            small
          />
      }
      <AssetInfo
        name={`${savingsTokenName} ${t(`inWallet`)}`}
        value={formatAsset(vigorAmountWallet)}
        colorVariant="secondary"
      />
      <AssetInfo
        name={`${savingsTokenName} ${t(`debt`)}`}
        value={formatAsset(vigorDebt)}
        colorVariant="secondary"
      />
      <StyledLabel css={{ margin: `24px 0 8px 0` }} htmlFor="amount">
        {`${typeText} ${savingsTokenName}`}
      </StyledLabel>
      <AmountInput
        id="amount"
        placeholder={`${t(`amountOf`)} ${savingsTokenName}`}
        defaultValue={asset}
        maxValue={maxValue}
        onChange={(newAsset: TAsset) => setAsset(newAsset)}
      />
      <BlueButton
        disabled={!maxValue || maxValue.amount.toNumber() === 0 || (!asset || isNaN(asset.amount.toNumber()) || asset.amount.toNumber() === 0)}
        type="button"
        fullWidth
        onClick={onSubmit}
        margin="32px 0 0 0"
      >
        {typeText}
      </BlueButton>
    </Tab>
  );
};

export const SavingsWithdrawDepositTabs = observer(_SavingsWithdrawDepositTabs);
