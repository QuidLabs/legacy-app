import { computed, decorate, observable } from "mobx";
import RootStore from "./index";
import ualConfig from "../../config/ual";
import { toast } from "react-toastify";
import {
  fetchRows,
  TAsset,
  TAssetSymbol,
} from "@deltalabs/eos-utils";
import BigNumber from "bignumber.js";
import { TMarketRow } from "../types/eos";

export default class PriceFeedStore {
  rootStore: RootStore;

  marketRows?: TMarketRow[];
  pairs: {
    [key: string]: number;
  };

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    // need to initialize these for the HTML build
    this.pairs = {
      EOSUSD: 0,
      VIGORUSD: 1.0,
      VIGUSD: 0,
      // only testnet
      IQUSD: 0,
    };
  }

  init = async () => {
    return Promise.all([this.fetchMarketPrices()])
  };

  public fetchMarketPrices = async () => {
    try {
      const rows = await fetchRows(this.rootStore.rpc)<TMarketRow>({
        code: ualConfig.chain.contracts.vigorBusiness,
        scope: ualConfig.chain.contracts.vigorBusiness,
        table: "market",
        limit: 100,
      });

      let pairs: { [key: string]: number } = {};
      rows.forEach((row) => {
        const symbol = row.sym.split(`,`)[1];
        // precision of 6
        const priceInUsd = row.marketdata.price[0] / Math.pow(10, 6);
        pairs[`${symbol}USD`] = priceInUsd;
      });
      this.pairs = pairs;
      this.marketRows = rows;
    } catch (e) {
      toast.error(e.message, { toastId: "fetchMarketPrices" });
      console.error(e.message);
    }
  };

  public get usdPerVig() {
    return this.pairs.VIGUSD.toFixed(6);
  }

  public get eosPerVig() {
    return (this.pairs.VIGUSD / this.pairs.EOSUSD).toFixed(4);
  }

  public convertTokenBalancesToUsd = (tokensMap: { [key: string]: TAsset }) => {
    return Object.keys(tokensMap).reduce(
      (acc, symbolCode) => {
        // VIG has a precision of 10 if it's from the vigor contract (f.i. from the collaterals user field)
        // but if it's from the VIG token contract it has a precision of 4. Always fall-back to the specified precision
        let usd = this.convertToken2Usd(tokensMap[symbolCode]);

        return {
          ...acc,
          [symbolCode]: usd,
          totalValue: acc.totalValue + usd,
        };
      },
      { totalValue: 0 }
    ) as { [key: string]: number } & { totalValue: number };
  };

  public convertToken2Usd = (token: TAsset) => {
    return (
      token.amount.div(Math.pow(10, token.symbol.precision)).toNumber() *
      this.pairs[`${token.symbol.code}USD`]
    );
  };

  public convertUsd2Token = (
    usd: number,
    targetSymbol: TAssetSymbol
  ): TAsset => {
    let amount = new BigNumber(usd)
      .times(Math.pow(10, targetSymbol.precision))
      .div(this.pairs[`${targetSymbol.code}USD`]);

    return {
      amount,
      symbol: targetSymbol,
    };
  };
}

decorate(PriceFeedStore, {
  pairs: observable,
  marketRows: observable,
  // computed properties
  usdPerVig: computed,
  eosPerVig: computed,
  // actions
});
