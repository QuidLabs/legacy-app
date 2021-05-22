import { TAsset, TAssetSymbol, decomposeAsset } from "@deltalabs/eos-utils";
import BigNumber from "bignumber.js";

export const formatCR = (cr: number) => {
  if (cr > 99.99) return `>9999`;
  return (cr * 100).toFixed(0);
};

export const formatPercentage = (value: number, decimals = 2) => {
  return (value * 100).toFixed(decimals)
};

// https://stackoverflow.com/a/2901298/9843487
export const separateThousands = (s: string | number) =>
  String(s).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const formatNumber= (val:number, decimals = 2) => {
  return separateThousands(val.toFixed(2))
}

export const negateAsset = (asset: TAsset) => {
  const negatedAmount = asset.amount.negated()
  return {
    amount: negatedAmount,
    symbol: asset.symbol,
  }
}

export const asset2dec = (quantity: TAsset):number => {
  return quantity.amount.div(
    new BigNumber(`10`).pow(quantity.symbol.precision)
  ).toNumber();
};

export const dec2asset = (val: number, symbol: TAssetSymbol):TAsset => {
  const amount = new BigNumber(val).times(new BigNumber(`10`).pow(symbol.precision))
  return {
    amount,
    symbol,
  }
};


export const decomposeAssetNormalized = (balanceString: string) => {
  try {
    let { amount, symbol } = decomposeAsset(balanceString)
    // change VIG precision to 4 instead of the internal 10
    if (symbol.code === `VIG` && symbol.precision === 10) {
      symbol.precision = 4
      amount = amount.div(new BigNumber(`1000000`))
    }
    return { amount, symbol }
  } catch (error) {
    console.error(error.toString())
    return decomposeAsset("0.0000 MISSING")
  }
}

export const name2Scope = (accountName: string) => {
  // need to add a space in front of account names that consist only of numbers
  // https://github.com/EOSIO/eos/issues/5616
  if (/^\d+$/i.test(accountName)) return ` ${accountName}`
  return accountName
}