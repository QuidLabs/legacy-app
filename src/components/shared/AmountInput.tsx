import React, { useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { StyledInput } from "./StyledInput";
import { formatAsset, TAsset } from "@deltalabs/eos-utils";
import BigNumber from "bignumber.js";

type Props = {
  onChange: (asset: TAsset) => void;
  defaultValue: TAsset | undefined;
  maxValue: TAsset;
  hideMaxButton?: boolean;
  doReset?: boolean;
};
const AmountInput: React.FC<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, keyof Props> & Props
> = (props) => {
  const { t } = useTranslation();
  const {
    onChange,
    maxValue,
    defaultValue: defaultValueAsset,
    hideMaxButton,
    doReset,
    ...otherProps
  } = props;
  const [val, setVal] = React.useState<string>(() =>
    defaultValueAsset && !defaultValueAsset.amount.isZero()
      ? defaultValueAsset.amount.toString()
      : ``
  );
  const handleChange = (amountString: string) => {
    if (!/^[/\d\.]*$/.test(amountString)) return;

    setVal(amountString);
    // need to use bignumber here, otherwise JS floating point issues when using
    // amountString = 0.0003 => amount = 2
    const amount = new BigNumber(
      new BigNumber(amountString || `0`)
        .times(new BigNumber(`10`).pow(maxValue.symbol.precision))
        .toFixed(0, BigNumber.ROUND_HALF_DOWN)
    );
    onChange({ amount, symbol: maxValue.symbol });
  };

  useEffect(() => {
    if (doReset) {
      handleChange('');
    }
  }, [ doReset ])

  return (
    <StyledInput
      {...(otherProps as any)}
      as="number"
      step={1 / Math.pow(10, maxValue.symbol.precision)}
      lang={"en_EN"}
      value={val}
      autoComplete="off"
      onChange={(evt: any) => handleChange(evt.target.value)}
      suffixButton={
        hideMaxButton
          ? null
          : {
              onClick: () =>
                handleChange(formatAsset(maxValue, { withSymbol: false })),
              text: t(`max`),
            }
      }
    />
  );
};

export default AmountInput;
