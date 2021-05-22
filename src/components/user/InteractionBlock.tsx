import {
  TAsset,
  TAssetSymbol,
  formatAsset,
  decomposeAsset,
} from "@deltalabs/eos-utils";
import BigNumber from "bignumber.js";
import { observer } from "mobx-react";
import React, { Ref, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from "react-i18next";
import styled, { css } from "styled-components";
import { useStore } from "../../store/use-store";
import {
  symbolCode2Symbol,
  BORROWABLE_TOKEN_SYMBOLS_NO_VIGOR,
  BORROWABLE_TOKEN_SYMBOLS,
} from "../../utils/tokens";
import { HorizontalFlex, InputStyle, BlueButton } from "../shared";
import { ColorVariantProps } from "../shared/color-props";
import { ToggleButton } from "../shared/ToggleButton";
import AmountInput from "../shared/AmountInput";
import { toJS } from "mobx";
import EstimationPopup, { useEstimation } from "./EstimationPopup";
import { media } from "../../utils/breakpoints";

const Wrapper = styled.div<any>`
  width: 100%;
`;

const InputStyles = css<any>`
  ${InputStyle};
  border-radius: ${(p) => p.theme.borderRadius};
  border: 1px solid ${(props) => props.theme.colors.bgLightest};
  background-color: ${(props) => props.theme.colors.bgLight};
  padding: 0 8px;
  height: 40px;
  width: ${(p) => p.width || "140px"};
  color: ${(props) => props.theme.colors.white};

  &:first-child {
    border-top-right-radius: unset;
    border-bottom-right-radius: unset;
  }

  &:not(:only-child):last-child {
    border-top-left-radius: unset;
    border-bottom-left-radius: unset;
    border-left: unset;
  }
`;

const RoundedInput = styled.input`
  ${InputStyles};
` as any;

const RoundedAmountInput = styled(AmountInput)`
  ${InputStyles};

  + button {
    right: 4px;
  }
  
  padding-right: 50px;
  
  ${media.lessThan('xs')} {
    width: 100%;
  }
`;

const Popup = styled.div`
  position: absolute;
  background-color: ${(props) => props.theme.colors.bgLight};
  border: 1px solid ${(props) => props.theme.colors.primary};
  padding: 16px;
  min-width: 360px;
  border-radius: ${(p) => p.theme.borderRadius};
  left: 50%;
  bottom: 0;
  transform: translateX(-50%) translateY(-48px);
  z-index: 1; /* above stats circle */
`;

const BlockBody = styled.div<any>`
  padding: 16px;
  border-radius: 0 0 ${(p) => p.theme.borderRadius}
    ${(p) => p.theme.borderRadius};
  background-color: ${(p) => p.theme.colors.bgLighter};
`;

const DollarEquivalent = styled.div<{ isExceedingLimit: boolean }>`
  font-weight: 400;
  font-size: 14px;
  padding-left: 4px;

  color: ${(p) =>
    p.isExceedingLimit ? p.theme.colors.error : p.theme.colors.whiteDarkened};
`;

const _TokenAmountSelection: React.FC<{
  action: "deposit" | "withdraw" | "borrow" | "repay";
  context: "lend" | "vault" | "loan" | "collateral" | "fees";
  onChange: any;
  possibleSymbols: string[];
  tooltip?: React.ReactNode;
  shouldReset?: boolean;
}> = ({ onChange, possibleSymbols, tooltip, action, context, shouldReset }) => {
  const { t } = useTranslation();
  const [walletStore, vigorStore, priceFeedStore] = useStore((store) => [
    store.walletStore,
    store.vigorStore,
    store.priceFeedStore,
  ]);
  const [isFocused, setFocus] = React.useState<boolean>(false);
  const [selectedSymbol, setSymbol] = React.useState<TAssetSymbol>(
    symbolCode2Symbol(possibleSymbols[0])
  );
  const defaultValue = {
    amount: new BigNumber("0").times(Math.pow(10, selectedSymbol.precision)),
    symbol: selectedSymbol,
  };
  const [selectedAsset, setSelectedAsset] = React.useState<TAsset>(
    defaultValue
  );
  const [amountValue, setAmount] = React.useState<string>("");
  const [isExceedingTxLimit, setIsExceedingTxLimit] = React.useState<boolean>(
    false
  );
  const [
    isExceedingWithdrawalLimit,
    setIsExceedingWithdrawalLimit,
  ] = React.useState<boolean>(false);

  const [ isExceedingAccountValueLimit, setIsExceedingAccountValueLimit ] = React.useState<boolean>(false);

  const [dollarEquivalent, setDollarEquivalent] = React.useState<number>(0.0);

  const applyLimits = (maxAmountToken: TAsset, action: string) => {
    const maxAmountUSD = priceFeedStore.convertToken2Usd(maxAmountToken);
    const txLimitInUSD = vigorStore.userWithdrawLimits.perTxAllowed;

    // only tx limit and no withdrawal limit applies for deposit and repay
    if (action === "deposit" || action === "repay") {
      return maxAmountUSD > txLimitInUSD
        ? priceFeedStore.convertUsd2Token(txLimitInUSD, maxAmountToken.symbol)
        : maxAmountToken // return token here to avoid round-off errors on max button click
    }

    const withdrawalLimitInUSD = vigorStore.userWithdrawLimits.available;
    const availableWithdrawalLimitInUSD =
      txLimitInUSD > withdrawalLimitInUSD ? withdrawalLimitInUSD : txLimitInUSD;

    // withdrawal limit applies for withdraw and borrow
    if (action === "withdraw" || action === "borrow") {
      return maxAmountUSD > availableWithdrawalLimitInUSD
        ? priceFeedStore.convertUsd2Token(
            availableWithdrawalLimitInUSD,
            maxAmountToken.symbol
          )
        : maxAmountToken // return token here to avoid round-off errors on max button click
    }

    return maxAmountToken;
  };

  const getMaxValue = (asset: TAsset, action: string, context: string) => {
    if (action === "deposit") {
      return typeof walletStore.tokenBalances[asset.symbol.code] === "undefined"
        ? defaultValue
        : walletStore.tokenBalances[asset.symbol.code];
    }

    if (action === "repay") {
      const walletBalance = walletStore.tokenBalances[asset.symbol.code];
      const loanBalance = vigorStore.userDebt[asset.symbol.code];

      if (!walletBalance || !loanBalance) {
        return defaultValue;
      }

      if (walletBalance.amount.comparedTo(loanBalance.amount) === 1) {
        return {
          ...walletBalance,
          amount: loanBalance.amount,
        };
      }

      return walletBalance;
    }

    if (context === "vault") {
      return typeof vigorStore.userSavings === "undefined"
        ? defaultValue
        : vigorStore.userSavings;
    }

    if (context === "lend") {
      return typeof vigorStore.userInsurances[asset.symbol.code] === "undefined"
        ? defaultValue
        : vigorStore.userInsurances[asset.symbol.code];
    }

    if (context === "collateral") {
      return typeof vigorStore.userCollaterals[asset.symbol.code] ===
        "undefined"
        ? defaultValue
        : vigorStore.userCollaterals[asset.symbol.code];
    }

    if (context === "fees") {
      return typeof vigorStore.userFeesBalance ===
      "undefined"
        ? defaultValue
        : vigorStore.userFeesBalance;
    }

    return defaultValue;
  };

  const maxValue = useMemo(
    () =>
      toJS(applyLimits(getMaxValue(selectedAsset, action, context), action)),
    [
      selectedAsset,
      action,
      context,
      walletStore.tokenBalances,
      vigorStore.userDebt,
      vigorStore.userSavings,
      vigorStore.userCollaterals,
      vigorStore.userInsurances,
    ]
  );

  useEffect(() => {
    const asset = {
      amount: new BigNumber(amountValue || `0`),
      symbol: selectedSymbol,
    };
    setSelectedAsset(asset);
    walletStore.selectSymbol(selectedSymbol.code);
    onChange(asset);

    const dollarValue = !isNaN(asset.amount.toNumber())
      ? priceFeedStore.convertToken2Usd(asset)
      : 0.0;
    setDollarEquivalent(dollarValue);
    setIsExceedingTxLimit(
      dollarValue > vigorStore.userWithdrawLimits.perTxAllowed
    );
    setIsExceedingWithdrawalLimit(
      dollarValue > vigorStore.userWithdrawLimits.available &&
        (action === "withdraw" || action === "borrow")
    );
    setIsExceedingAccountValueLimit(
      (action === "deposit") && dollarValue > (vigorStore.userWithdrawLimits.allowedAccountValue - vigorStore.userWithdrawLimits.usedAccountValue)
    );
  }, [amountValue, selectedSymbol, action, context]);

  const onAmountChange = (asset: TAsset) => {
    const val = asset.amount;
    setAmount(val.toString());
  };

  const onSymbolChange = (evt: any) => {
    const selectedSymbol = symbolCode2Symbol(evt.target.value);
    setSymbol(selectedSymbol);
  };

  const onFocus = () => {
    setFocus(true);
    walletStore.selectSymbol(selectedSymbol.code);
  };

  return (
    <React.Fragment>
      <HorizontalFlex css={{ position: `relative` }} margin={"0 0 8px 0"}>
        <RoundedAmountInput
          width="100%"
          defaultValue={defaultValue}
          maxValue={maxValue}
          hideMaxButton={action === "borrow"}
          onChange={onAmountChange}
          onFocus={onFocus}
          doReset={shouldReset}
          onBlur={() => setFocus(false)}
        />
        {isFocused && tooltip && <Popup>{tooltip}</Popup>}
        <RoundedInput
          as="select"
          value={selectedSymbol.code}
          width="100px"
          onChange={onSymbolChange}
          onFocus={onFocus}
          onBlur={() => setFocus(false)}
        >
          {possibleSymbols.map((symbolCode) => (
            <option key={symbolCode} value={symbolCode}>
              {symbolCode}
            </option>
          ))}
        </RoundedInput>
      </HorizontalFlex>
      <HorizontalFlex justifyContent="flex-start" margin={"0 0 8px 0"}>
        <DollarEquivalent
          isExceedingLimit={isExceedingTxLimit || isExceedingWithdrawalLimit}
        >
          ≈ ${dollarEquivalent.toFixed(2)}
          {isExceedingTxLimit && (
            <div>
              {t("user.warning.ExceedTxLimit")} ($
              {vigorStore.userWithdrawLimits.perTxAllowed.toFixed(2)})
            </div>
          )}
          {isExceedingWithdrawalLimit && (
            <div>
              {t("user.warning.ExceedWdLimit")} ($
              {vigorStore.userWithdrawLimits.available.toFixed(2)})
            </div>
          )}
          {isExceedingAccountValueLimit && (
            <div>
              {t("user.warning.ExceedAccountValueLimit")} ($
              {(vigorStore.userWithdrawLimits.allowedAccountValue - vigorStore.userWithdrawLimits.usedAccountValue).toFixed(2)})
            </div>
          )}
        </DollarEquivalent>
      </HorizontalFlex>
    </React.Fragment>
  );
};

const TokenAmountSelection = observer(_TokenAmountSelection);


const _InsuranceLendBlock: React.FC<{} & ColorVariantProps> = (props) => {
  const { t } = useTranslation();
  const [walletStore] = useStore((store) => [store.walletStore]);
  const [asset, setAsset] = React.useState<TAsset | undefined>(undefined);
  const [type, setType] = React.useState<string>(`deposit`);
  const [buttonDisabled, setButtonDisabled] = React.useState<boolean>(true);
  const [shouldResetInputs, setShouldResetInputs] = React.useState<boolean>(false);

  useEffect(() => {
    setButtonDisabled(
      !asset ||
        isNaN(asset?.amount.toNumber()) ||
        asset?.amount.toNumber() === 0
    );

    setShouldResetInputs(false);
  }, [asset]);

  const handleSubmit = async () => {
    if (!asset) return;

    if (type === `deposit`) {
      await walletStore.depositInsurance(asset);
    } else {
      await walletStore.withdrawInsurance(asset);
    }

    setShouldResetInputs(true);
  };

  return (
    <Wrapper className="action-block">
      <ToggleButton
        texts={[t(`deposit`), t(`withdraw`)]}
        onChange={setType}
        values={[`deposit`, `withdraw`]}
        activeValue={type}
        colorVariant="secondary"
      />
      <BlockBody colorVariant="secondary">
        <TokenAmountSelection
          possibleSymbols={BORROWABLE_TOKEN_SYMBOLS}
          onChange={(newAsset: TAsset) => {
            setAsset(newAsset);
          }}
          action={type as any}
          context={"lend"}
          shouldReset={shouldResetInputs}
        />
        <HorizontalFlex>
          <BlueButton
            disabled={buttonDisabled}
            type="button"
            fullWidth
            onClick={handleSubmit}
            colorVariant="secondary"
          >
            {t(type)}
          </BlueButton>
        </HorizontalFlex>
      </BlockBody>
    </Wrapper>
  );
};

export const InsuranceLendBlock = observer(_InsuranceLendBlock);

const _InsuranceSavingsBlock: React.FC<{} & ColorVariantProps> = (props) => {
  const { t } = useTranslation();
  const [walletStore] = useStore((store) => [
    store.walletStore,
    store.vigorStore,
  ]);
  const [asset, setAsset] = React.useState<TAsset | undefined>(undefined);
  const [type, setType] = React.useState<string>(`deposit`);
  const [buttonDisabled, setButtonDisabled] = React.useState<boolean>(true);
  const [shouldResetInputs, setShouldResetInputs] = React.useState<boolean>(false);

  useEffect(() => {
    setButtonDisabled(
      !asset ||
        isNaN(asset?.amount.toNumber()) ||
        asset?.amount.toNumber() === 0
    );
    setShouldResetInputs(false);
  }, [asset]);

  const handleSubmit = async () => {
    if (!asset) return;

    if (type === `deposit`) {
      await walletStore.depositSavings(asset);
    } else {
      await walletStore.withdrawSavings(asset);
    }
    setShouldResetInputs(true);
  };

  return (
    <Wrapper className="action-block">
      <ToggleButton
        texts={[t(`deposit`), t(`withdraw`)]}
        onChange={setType}
        values={[`deposit`, `withdraw`]}
        activeValue={type}
        colorVariant="secondary"
      />
      <BlockBody colorVariant="secondary">
        <TokenAmountSelection
          possibleSymbols={[`VIGOR`]}
          onChange={(newAsset: TAsset) => {
            setAsset(newAsset);
          }}
          action={type as any}
          context={"vault"}
          shouldReset={shouldResetInputs}
        />
        <HorizontalFlex>
          <BlueButton
            disabled={buttonDisabled}
            type="button"
            fullWidth
            onClick={handleSubmit}
            colorVariant={props.colorVariant}
          >
            {t(type)}
          </BlueButton>
        </HorizontalFlex>
      </BlockBody>
    </Wrapper>
  );
};

export const InsuranceSavingsBlock = observer(_InsuranceSavingsBlock);

const _BorrowVigorCollateralBlock: React.FC<{} & ColorVariantProps> = (
  props
) => {
  const { t } = useTranslation();
  const [walletStore, vigorStore] = useStore((store) => [store.walletStore, store.vigorStore]);
  const [asset, setAsset] = React.useState<TAsset | undefined>(undefined);
  const [type, setType] = React.useState<string>(`deposit`);
  const [buttonDisabled, setButtonDisabled] = React.useState<boolean>(true);
  const [shouldResetInputs, setShouldResetInputs] = React.useState<boolean>(false);

  useEffect(() => {
    setButtonDisabled(
      !asset ||
        isNaN(asset?.amount.toNumber()) ||
        asset?.amount.toNumber() === 0
    );
    setShouldResetInputs(false);
  }, [asset]);
  const { setRate, ...estimationProps } = useEstimation({
    actionType: type,
    loanType: `vigor`,
    vigorStore,
  });

  const onAssetChange = (newAsset: TAsset) => {
    setAsset(newAsset);
    setRate(newAsset);
  };

  const handleSubmit = async () => {
    if (!asset) return;

    if (type === `deposit`) {
      await walletStore.depositCollateral(asset);
    } else {
      await walletStore.withdrawCollateral(asset);
    }
    setShouldResetInputs(false);
  };

  return (
    <Wrapper className="action-block">
      <ToggleButton
        texts={[t(`deposit`), t(`withdraw`)]}
        onChange={setType}
        values={[`deposit`, `withdraw`]}
        activeValue={type}
        colorVariant="primary"
      />
      <BlockBody colorVariant="primary">
        <TokenAmountSelection
          possibleSymbols={BORROWABLE_TOKEN_SYMBOLS_NO_VIGOR}
          onChange={onAssetChange}
          tooltip={<EstimationPopup {...estimationProps} />}
          action={type as any}
          context={"collateral"}
          shouldReset={shouldResetInputs}
        />
        <HorizontalFlex>
          <BlueButton
            disabled={buttonDisabled}
            type="button"
            fullWidth
            onClick={handleSubmit}
            colorVariant={props.colorVariant}
          >
            {t(type)}
          </BlueButton>
        </HorizontalFlex>
      </BlockBody>
    </Wrapper>
  );
};

export const BorrowVigorCollateralBlock = observer(_BorrowVigorCollateralBlock);

const _BorrowVigorLoanBlock: React.FC<{} & ColorVariantProps> = (props) => {
  const { t } = useTranslation();
  const [walletStore, vigorStore] = useStore((store) => [
    store.walletStore,
    store.vigorStore,
  ]);
  const [asset, setAsset] = React.useState<TAsset | undefined>(undefined);
  const [type, setType] = React.useState<string>(`borrow`);

  const [buttonDisabled, setButtonDisabled] = React.useState<boolean>(true);
  const [shouldResetInputs, setShouldResetInputs] = React.useState<boolean>(false);

  useEffect(() => {
    setButtonDisabled(
      !asset ||
        isNaN(asset?.amount.toNumber()) ||
        asset?.amount.toNumber() === 0
    );
    setShouldResetInputs(false);
  }, [asset]);
  const { setRate, ...estimationProps } = useEstimation({
    actionType: type,
    loanType: `vigor`,
    vigorStore,
  });

  const onAssetChange = (newAsset: TAsset) => {
    setAsset(newAsset);
    setRate(newAsset);
  };

  const handleSubmit = async (evt: any) => {
    if (!asset) return;

    if (type === `borrow`) {
      await walletStore.borrow(asset);
    } else {
      await walletStore.repay(asset);
    }
    setShouldResetInputs(true);
  };

  return (
    <Wrapper className="action-block">
      <ToggleButton
        texts={[t(`borrowText`), t(`repay`)]}
        onChange={setType}
        values={[`borrow`, `repay`]}
        activeValue={type}
        colorVariant="primary"
      />
      <BlockBody colorVariant="primary">
        <TokenAmountSelection
          possibleSymbols={[`VIGOR`]}
          onChange={onAssetChange}
          tooltip={<EstimationPopup {...estimationProps} />}
          action={type as any}
          context={"loan"}
          shouldReset={shouldResetInputs}
        />
        <HorizontalFlex>
          <BlueButton
            disabled={buttonDisabled}
            type="button"
            fullWidth
            onClick={handleSubmit}
            colorVariant={props.colorVariant}
          >
            {t(type === `repay` ? `repay` : `borrowText`)}
          </BlueButton>
        </HorizontalFlex>
      </BlockBody>
    </Wrapper>
  );
};

export const BorrowVigorLoanBlock = observer(_BorrowVigorLoanBlock);

const _BorrowCryptoCollateralBlock: React.FC<{} & ColorVariantProps> = (
  props
) => {
  const { t } = useTranslation();
  const [walletStore, vigorStore] = useStore((store) => [store.walletStore, store.vigorStore]);
  const [asset, setAsset] = React.useState<TAsset | undefined>(undefined);
  const [type, setType] = React.useState<string>(`deposit`);
  const [buttonDisabled, setButtonDisabled] = React.useState<boolean>(true);
  const [shouldResetInputs, setShouldResetInputs] = React.useState<boolean>(false);

  useEffect(() => {
    setButtonDisabled(
      !asset ||
        isNaN(asset?.amount.toNumber()) ||
        asset?.amount.toNumber() === 0
    );
    setShouldResetInputs(false);
  }, [asset]);
  const { setRate, ...estimationProps } = useEstimation({
    actionType: type,
    loanType: `crypto`,
    vigorStore,
  });


  const onAssetChange = (newAsset: TAsset) => {
    setAsset(newAsset);
    setRate(newAsset);
  };

  const handleSubmit = async () => {
    if (!asset) return;

    if (type === `deposit`) {
      await walletStore.depositCollateral(asset);
    } else {
      await walletStore.withdrawCollateral(asset);
    }

    setShouldResetInputs(true);
  };

  return (
    <Wrapper className="action-block">
      <ToggleButton
        texts={[t(`deposit`), t(`withdraw`)]}
        onChange={setType}
        values={[`deposit`, `withdraw`]}
        activeValue={type}
        colorVariant="primary"
      />
      <BlockBody colorVariant="primary">
        <TokenAmountSelection
          possibleSymbols={["VIGOR"]}
          onChange={onAssetChange}
          tooltip={<EstimationPopup {...estimationProps} />}
          action={type as any}
          context={"collateral"}
          shouldReset={shouldResetInputs}
        />
        <HorizontalFlex>
          <BlueButton
            disabled={buttonDisabled}
            type="button"
            fullWidth
            onClick={handleSubmit}
            colorVariant={props.colorVariant}
          >
            {t(type)}
          </BlueButton>
        </HorizontalFlex>
      </BlockBody>
    </Wrapper>
  );
};

export const BorrowCryptoCollateralBlock = observer(
  _BorrowCryptoCollateralBlock
);

const _BorrowCryptoLoanBlock: React.FC<{} & ColorVariantProps> = (props) => {
  const { t } = useTranslation();
  const [walletStore, vigorStore] = useStore((store) => [
    store.walletStore,
    store.vigorStore,
  ]);
  const [asset, setAsset] = React.useState<TAsset | undefined>(undefined);
  const [type, setType] = React.useState<string>(`borrow`);

  const [buttonDisabled, setButtonDisabled] = React.useState<boolean>(true);
  const [shouldResetInputs, setShouldResetInputs] = React.useState<boolean>(false);

  useEffect(() => {
    setButtonDisabled(
      !asset ||
        isNaN(asset?.amount.toNumber()) ||
        asset?.amount.toNumber() === 0
    );
    setShouldResetInputs(false);
  }, [asset]);

  const { setRate, ...estimationProps } = useEstimation({
    actionType: type,
    loanType: `crypto`,
    vigorStore,
  });

  const onAssetChange = (newAsset: TAsset) => {
    setAsset(newAsset);
    setRate(newAsset);
  };

  const handleSubmit = async () => {
    if (!asset) return;

    if (type === `borrow`) {
      await walletStore.borrow(asset);
    } else {
      await walletStore.repay(asset);
    }

    setShouldResetInputs(true);
  };

  return (
    <Wrapper className="action-block">
      <ToggleButton
        texts={[t(`borrowText`), t(`repay`)]}
        onChange={setType}
        values={[`borrow`, `repay`]}
        activeValue={type}
        colorVariant="primary"
      />
      <BlockBody colorVariant="primary">
        <TokenAmountSelection
          possibleSymbols={BORROWABLE_TOKEN_SYMBOLS_NO_VIGOR}
          onChange={onAssetChange}
          tooltip={<EstimationPopup {...estimationProps} />}
          action={type as any}
          context={"loan"}
          shouldReset={shouldResetInputs}
        />
        <HorizontalFlex>
          <BlueButton
            disabled={buttonDisabled}
            type="button"
            fullWidth
            onClick={handleSubmit}
            colorVariant={props.colorVariant}
          >
            {t(type === `repay` ? `repay` : `borrowText`)}
          </BlueButton>
        </HorizontalFlex>
      </BlockBody>
    </Wrapper>
  );
};

export const BorrowCryptoLoanBlock = observer(_BorrowCryptoLoanBlock);

const _VigorFeesBlock: React.FC<{} & ColorVariantProps> = (props) => {
  const { t } = useTranslation();
  const [walletStore] = useStore((store) => [
    store.walletStore,
    store.vigorStore,
  ]);
  const [asset, setAsset] = React.useState<TAsset | undefined>(undefined);
  const [type, setType] = React.useState<string>(`deposit`);
  const [buttonDisabled, setButtonDisabled] = React.useState<boolean>(true);
  const [shouldResetInputs, setShouldResetInputs] = React.useState<boolean>(false);

  useEffect(() => {
    setButtonDisabled(
      !asset ||
      isNaN(asset?.amount.toNumber()) ||
      asset?.amount.toNumber() === 0
    );
    setShouldResetInputs(false);
  }, [asset]);

  const handleSubmit = async () => {
    if (!asset) return;

    if (type === `deposit`) {
      await walletStore.depositFees(asset);
    } else {
      await walletStore.withdrawFees(asset);
    }
    setShouldResetInputs(true);
  };

  return (
    <Wrapper className="action-block">
      <ToggleButton
        texts={[t(`deposit`), t(`withdraw`)]}
        onChange={setType}
        values={[`deposit`, `withdraw`]}
        activeValue={type}
        colorVariant="primary"
      />
      <BlockBody colorVariant="secondary">
        <TokenAmountSelection
          possibleSymbols={[`VIG`]}
          onChange={(newAsset: TAsset) => {
            setAsset(newAsset);
          }}
          action={type as any}
          context={"fees"}
          shouldReset={shouldResetInputs}
        />
        <HorizontalFlex>
          <BlueButton
            disabled={buttonDisabled}
            type="button"
            fullWidth
            onClick={handleSubmit}
            colorVariant={props.colorVariant}
          >
            {t(type)}
          </BlueButton>
        </HorizontalFlex>
      </BlockBody>
    </Wrapper>
  );
};

export const VigorFeesBlock = observer(_VigorFeesBlock);
