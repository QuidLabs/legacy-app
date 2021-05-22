import { formatAsset, TAsset } from "@deltalabs/eos-utils";
import BigNumber from "bignumber.js";
import React, { useEffect, useMemo } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import VigorStore from "../../store/vigor";
import { formatCR, negateAsset } from "../../utils/format";
import { symbolCode2Symbol } from "../../utils/tokens";
import { HorizontalFlex } from "../shared";
import { BoxedLabel } from "../shared/label";

type EstimationProps = {
  rate: number;
  premiumsVig: TAsset;
  cr: number;
  minCr?: number;
  lendable?: TAsset;
};

export const useEstimation = ({
  actionType,
  loanType,
  vigorStore,
}: {
  actionType: string;
  loanType: string;
  vigorStore: VigorStore;
}) => {
  const computeRate = (
    _asset: Parameters<VigorStore["computeBorrowRateVigor"]>[0]
  ) => {
    let deltaCollateral =
      actionType === `deposit`
        ? _asset
        : actionType === `withdraw`
        ? negateAsset(_asset!)
        : undefined;

    let deltaDebt =
      actionType === `borrow`
        ? _asset
        : actionType === `repay`
        ? negateAsset(_asset!)
        : undefined;

    const { rate, premiumsVig } =
      loanType === `crypto`
        ? vigorStore.computeBorrowRateCrypto(deltaCollateral, deltaDebt)
        : vigorStore.computeBorrowRateVigor(deltaCollateral, deltaDebt);
    const cr =
      loanType === `crypto`
        ? vigorStore.computeCryptoCollateralRatio(deltaCollateral, deltaDebt)
        : vigorStore.computeVigorCollateralRatio(deltaCollateral, deltaDebt);
    return {
      rate,
      premiumsVig,
      cr,
    };
  };

  const [asset, _setAsset] = React.useState<TAsset>(() => ({
    amount: new BigNumber(`0`),
    symbol: symbolCode2Symbol(`EOS`),
  }));

  const { rate, premiumsVig, cr } = useMemo(() => computeRate(asset), [
    asset,
    vigorStore.userStats,
    actionType,
  ]);

  const lendable =
    actionType === `borrow` && loanType === `crypto`
      ? vigorStore.borrowableTokens[asset.symbol.code]
      : undefined;
  let minCr = undefined;
  if (actionType === `borrow` && vigorStore.userStats) {
    const minCollat =
      asset.symbol.code === `USDT` ? 1.06 : vigorStore.config.mincollat / 100;
    minCr =
      Math.max(
        1 +
          Number.parseFloat(
            loanType === `crypto`
              ? vigorStore.userStats.l_volcol
              : vigorStore.userStats.volcol
          ) -
          0.6,
        1.0
      ) * minCollat;
  }

  const setRate = (a: TAsset) => {
    _setAsset(a);
  };

  return {
    rate,
    premiumsVig,
    cr,
    minCr,
    lendable,
    setRate,
  };
};

const PopupRow = styled<any>(HorizontalFlex)`
  margin: 16px 0;
  justify-content: space-between;
  & > *:first-child {
    flex: 1;
  }
`;

const EstimationPopup: React.FC<EstimationProps> = ({
  rate,
  premiumsVig,
  cr,
  minCr,
  lendable,
}) => {
  const { t } = useTranslation();
  return (
    <div>
      <PopupRow>
        <div>{t(`borrowVigor.step3.interestRate`)}</div>
        <BoxedLabel>{(rate * 100).toFixed(1)}%</BoxedLabel>
      </PopupRow>
      <PopupRow>
        <div>{t(`borrowVigor.step3.estimatedVig`)}</div>
        <BoxedLabel>{formatAsset(premiumsVig)}</BoxedLabel>
      </PopupRow>
      <PopupRow>
        <div>{t(`collateralRatio`)}</div>
        <BoxedLabel>{formatCR(cr)}%</BoxedLabel>
      </PopupRow>
      {typeof minCr === `number` ? (
        <PopupRow>
          <div>{t(`user.estimations.crBorrowLimit`)}</div>
          <BoxedLabel>{formatCR(minCr)}%</BoxedLabel>
        </PopupRow>
      ) : null}
      {lendable ? (
        <PopupRow>
          <div>{t(`user.estimations.borrowable`)}</div>
          <BoxedLabel>
            {formatAsset(lendable, { separateThousands: true })}
          </BoxedLabel>
        </PopupRow>
      ) : null}
    </div>
  );
};

export default EstimationPopup;
