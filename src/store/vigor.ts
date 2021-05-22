import {
  fetchRows,
  fetchAllScopes,
  decomposeAsset,
  formatAsset,
  TAsset,
} from "@deltalabs/eos-utils";
import { computed, decorate, observable, action, toJS } from "mobx";
import ualConfig from "../../config/ual";
import {
  TGlobalStatsRow,
  TStatRow,
  TUserRow,
  TConfigRow,
  TActivityLogRow,
  TBailoutLogRow,
  TWhitelistRow,
  TCroneosQeueRow,
} from "../types/eos";
import RootStore from "./index";
import { toast } from "react-toastify";
import keyBy from "lodash/keyBy";
import BigNumber from "bignumber.js";
import ual from "../../config/ual";
import { computeBorrowRateVigor, computeBorrowRateCrypto } from "../utils/math";
import {
  BORROWABLE_TOKEN_SYMBOLS_NO_VIGOR,
  symbolCode2Symbol,
} from "../utils/tokens";
import {
  decomposeAssetNormalized,
  asset2dec,
  dec2asset,
} from "../utils/format";

type UserType = "user" | "final" | "global";

const defaultConfig = {
  alphatest: 900,
  soltarget: 10,
  lsoltarget: 25,
  maxtesprice: 5000,
  mintesprice: 50,
  calibrate: 8,
  maxtesscale: 20,
  mintesscale: 1,
  reservecut: 1,
  savingscut: 10,
  maxlends: 99,
  freezelevel: 0,
  assetouttime: 90,
  initialvig: 100,
  viglifeline: 3,
  vigordaccut: 1,
  newacctlim: 10,
  newacctsec: 86400,
  reqstake: 100,
  staketime: 259200,
  repanniv: 2592000,
  maxdisc: 25,
  exectype: 2,
  minebuffer: 30,
  gasfee: 25000,
  kickseconds: 7776000,
  initmaxsize: 1000000,
  assetintime: 60,
  debtceiling: 10000000,
  logcount: 3000,
  gatekeeper: 2,
  liquidate: 0,
  accountslim: 500,
  mincollat: 111,
  rexswitch: 1,
  dataa: 1000000,
  datab: 1000000,
  datac: 80,
  datad: "extrafield11",
  proxycontr: "vigorrewards",
  proxypay: "genereospool",
  dactoken: "dactoken1111",
  oraclehub: "vigoraclehub",
  daccustodian: "daccustodia1",
  vigordacfund: "vigordacfund",
  finalreserve: "finalreserve",
  bailoutcr: 110,
  bailoutupcr: 110,
};

const defaultConfigWhitelist = [
  {
    sym: "3,IQ",
    contract: "everipediaiq",
    feed: "iqeos",
    assetin: 1,
    assetout: 1,
    maxlends: 10,
    lendable: "19009080.684 IQ",
    lendablepct: "0.05036351844712142",
    lentpct: "0.00000000000000000",
  },
  {
    sym: "4,VIG",
    contract: "vig111111111",
    feed: "vigeos",
    assetin: 1,
    assetout: 1,
    maxlends: 10,
    lendable: "141754472.4851920531 VIG",
    lendablepct: "0.44168123271972781",
    lentpct: "0.00320951642086656",
  },
  {
    sym: "4,EOS",
    contract: "eosio.token",
    feed: "eosusd",
    assetin: 1,
    assetout: 1,
    maxlends: 25,
    lendable: "159456.1638 EOS",
    lendablepct: "0.48284858043692352",
    lentpct: "0.93036035023438834",
  },
  {
    sym: "8,PBTC",
    contract: "btc.ptokens",
    feed: "btcusd",
    assetin: 1,
    assetout: 1,
    maxlends: 25,
    lendable: "0.21789306 PBTC",
    lendablepct: "0.00315673822904730",
    lentpct: "0.00000000000000000",
  },
  {
    sym: "4,USDT",
    contract: "tethertether",
    feed: "eosusdt",
    assetin: 1,
    assetout: 1,
    maxlends: 25,
    lendable: "15845.8616 USDT",
    lendablepct: "0.01759738507333527",
    lentpct: "1.00000000000000000",
  },
  {
    sym: "4,VIGOR",
    contract: "vigortoken11",
    feed: "eosvigor",
    assetin: 1,
    assetout: 1,
    maxlends: 0,
    lendable: "4013.5544 VIGOR",
    lendablepct: "0.00435254509384464",
    lentpct: "0.00000000000000000",
  },
];

export default class VigorStore {
  rootStore: RootStore;
  globalStats?: TGlobalStatsRow;
  config: TConfigRow = defaultConfig;
  configWhitelist: TWhitelistRow[] = defaultConfigWhitelist;
  finalReserveUserStats?: TUserRow;
  userStats?: TUserRow;
  userCron?: TCroneosQeueRow;
  activityLog?: TActivityLogRow[];
  bailoutLog?: TBailoutLogRow[];
  vigorTokenStats?: TStatRow & { holders: number };

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }

  init = async () => {
    return Promise.all([
      this.fetchConfigs(), // only fetch config once
      this.fetchGlobalStats(),
    ]);
  };

  reset = () => {
    this.userStats = undefined;
    this.userCron = undefined;
  };

  refetch = async () => {
    console.log("vigorStore::refetch start");
    console.time("vigorStoreRefetch");
    return Promise.all([
      this.fetchGlobalStats(),
      this.fetchVigorStats(),
      this.fetchUserStats(),
      this.fetchUserLog(),
      this.fetchBailoutLog(),
    ]).then(() => {
      console.timeEnd("vigorStoreRefetch");
      console.log("vigorStore::refetch end");
      // console.log(toJS(this.userStats));
    });
  };

  public fetchGlobalStats = async () => {
    try {
      const [[globalStatsRow], [finalReserveUserRow]] = await Promise.all([
        fetchRows(this.rootStore.rpc)<TGlobalStatsRow>({
          code: ualConfig.chain.contracts.vigorBusiness,
          scope: ualConfig.chain.contracts.vigorBusiness,
          table: `globalstats`,
          limit: 1,
        }),
        fetchRows(this.rootStore.rpc)<TUserRow>({
          code: ualConfig.chain.contracts.vigorBusiness,
          scope: ualConfig.chain.contracts.vigorBusiness,
          table: `user`,
          lower_bound: `finalreserve`,
          upper_bound: `finalreserve`,
          limit: 1,
          key_type: `name`,
        }),
      ]);
      this.globalStats = globalStatsRow;
      this.finalReserveUserStats = finalReserveUserRow;
    } catch (error) {
      toast.error(error.message, { toastId: "fetchGlobalStats" });
      console.error(error.message);
    }
  };

  public fetchConfigs = async () => {
    try {
      const [[configRow], whitelist] = await Promise.all([
        fetchRows(this.rootStore.rpc)<TConfigRow>({
          code: ualConfig.chain.contracts.vigorBusiness,
          scope: ualConfig.chain.contracts.vigorBusiness,
          table: `config`,
          limit: 1,
        }),
        fetchRows(this.rootStore.rpc)<TWhitelistRow>({
          code: ualConfig.chain.contracts.vigorBusiness,
          scope: ualConfig.chain.contracts.vigorBusiness,
          table: `whitelist`,
          limit: 100,
        }),
      ]);
      this.config = configRow;
      this.configWhitelist = whitelist;
    } catch (error) {
      console.error(error.message);
    }
  };

  public fetchUserStats = async () => {
    try {
      const accountName = this.rootStore.walletStore.accountName;
      if (!accountName) return;

      const [userRow] = await fetchRows(this.rootStore.rpc)<TUserRow>({
        code: ualConfig.chain.contracts.vigorBusiness,
        scope: ualConfig.chain.contracts.vigorBusiness,
        table: `user`,
        lower_bound: accountName,
        upper_bound: accountName,
        limit: 1,
        key_type: `name`,
      });
      this.userStats = userRow;
    } catch (error) {
      toast.error(error.message, { toastId: "fetchUserStats" });
      console.error(error.message);
    }
  };

  public fetchVigorStats = async () => {
    try {
      const [[vigorStatRow], vigorAccountHolders] = await Promise.all([
        fetchRows(this.rootStore.rpc)<TStatRow>({
          code: ualConfig.chain.tokens.VIGOR.contract,
          scope: `VIGOR`,
          table: `stat`,
          limit: 1,
        }),
        fetchAllScopes(this.rootStore.rpc)(
          ualConfig.chain.tokens.VIGOR.contract,
          `accounts`
        ),
      ]);

      this.vigorTokenStats = {
        ...vigorStatRow,
        holders: vigorAccountHolders.length,
      };
    } catch (error) {
      toast.error(error.message, { toastId: "fetchVigorStats" });
      console.error(error.message);
    }
  };

  public fetchUserLog = async () => {
    try {
      const [vigorLogRows] = await Promise.all([
        fetchRows(this.rootStore.rpc)<TActivityLogRow>({
          code: ualConfig.chain.contracts.vigorBusiness,
          scope: ualConfig.chain.contracts.vigorBusiness,
          table: "log",
          limit: 100,
          reverse: true,
        }),
      ]);

      this.activityLog = vigorLogRows;
    } catch (error) {
      toast.error(error.message, { toastId: "fetchUserLog" });
      console.error(error.message);
    }
  };

  public fetchBailoutLog = async () => {
    try {
      const [vigorLogRows] = await Promise.all([
        fetchRows(this.rootStore.rpc)<TBailoutLogRow>({
          code: ualConfig.chain.contracts.vigorBusiness,
          scope: ualConfig.chain.contracts.vigorBusiness,
          table: "bailout",
          limit: 10000,
          reverse: true,
          key_type: "name",
          index_position: 5,
          lower_bound: "liquidate",
          upper_bound: "liquidateup",
        }),
      ]);

      const [vigorUserLogRows] = await Promise.all([
        fetchRows(this.rootStore.rpc)<TBailoutLogRow>({
          code: ualConfig.chain.contracts.vigorBusiness,
          scope: ualConfig.chain.contracts.vigorBusiness,
          table: "bailout",
          limit: 10000,
          reverse: true,
          key_type: "name",
          index_position: 3,
          lower_bound: this.rootStore.walletStore.accountName,
          upper_bound: this.rootStore.walletStore.accountName,
        }),
      ]);

      const vigorUserLogRowsFiltered = vigorUserLogRows.filter(
        (logRow) => logRow.type === "recap" || logRow.type === "recapup"
      );
      const newLog = vigorUserLogRowsFiltered.concat(vigorLogRows);

      newLog.sort((a: TBailoutLogRow, b: TBailoutLogRow) => {
        if (b.id < a.id) {
          return -1;
        }

        if (b > a) {
          return 1;
        }

        return 0;
      });

      this.bailoutLog = newLog;
    } catch (error) {
      toast.error(error.message, { toastId: "fetchBailoutLog" });
      console.error(error.message);
    }
  };

  public fetchCroneosQueue = async () => {
    try {
      const accountName = this.rootStore.walletStore.accountName;
      if (!accountName) return;

      const rows = await fetchRows(this.rootStore.rpc)<any>({
        code: ualConfig.chain.contracts.vigorBusiness,
        scope: ualConfig.chain.contracts.vigorBusiness,
        table: `croneosqueue`,
        index_position: `2` /* by tag */,
        lower_bound: accountName,
        upper_bound: accountName,
        key_type: `name`,
        limit: 1,
      });
      // can be undefined which is fine
      this.userCron = rows[0];
    } catch (error) {
      console.error(error.message);
    }
  };

  public clearQueue = () => {
    this.userCron = undefined;
  };

  public get totalBorrowed() {
    if (!this.globalStats) return 0;
    return Number.parseFloat(this.globalStats.l_valueofcol).toFixed(2);
  }

  public get totalCollateralValue() {
    if (!this.globalStats) return 0;
    return Number.parseFloat(this.globalStats.valueofcol).toFixed(2);
  }

  public get totalInsuranceValue() {
    if (!this.globalStats) return 0;
    return Number.parseFloat(this.globalStats.valueofins).toFixed(2);
  }

  public get totalDebt() {
    if (!this.globalStats) return 0;
    // total debt denoted in VIGOR quantity
    return Number.parseFloat(this.globalStats.totaldebt.split(` `)[0]).toFixed(
      2
    );
  }

  public get solvency() {
    if (!this.globalStats) return 0;
    return Number.parseFloat(this.globalStats.solvency);
  }

  public get l_solvency() {
    if (!this.globalStats) return 0;
    return Number.parseFloat(this.globalStats.l_solvency);
  }

  public get vigorSupply() {
    if (!this.vigorTokenStats) return `0`;
    return formatAsset(decomposeAsset(this.vigorTokenStats.supply), {
      withSymbol: false,
      separateThousands: true,
    });
  }

  public get vigorTokenHolders() {
    if (!this.vigorTokenStats) return 0;
    return this.vigorTokenStats.holders;
  }

  public get vigReserve() {
    if (!this.finalReserveUserStats) return `0 VIG`;

    const vigInsuranceString = this.finalReserveUserStats.insurance.find(
      (balanceString) => {
        const decomposed = decomposeAssetNormalized(balanceString);
        return decomposed.symbol.code === `VIG`;
      }
    );
    if (!vigInsuranceString) return `0 VIG`;

    return formatAsset(decomposeAssetNormalized(vigInsuranceString), {
      withSymbol: true,
      separateThousands: true,
    });
  }

  public get userFeesBalance() {
    if (!this.userStats)
      return { amount: new BigNumber(`0`), symbol: symbolCode2Symbol(`VIG`) };

    return decomposeAssetNormalized(
      formatAsset({
        amount: new BigNumber(this.userStats.vigfees),
        symbol: { code: `VIG`, precision: 10 },
      })
    );
  }

  public get userFeesBalanceInUsd() {
    if (!this.userStats || !this.userFeesBalance) return 0;

    return this.rootStore.priceFeedStore.convertToken2Usd(this.userFeesBalance);
  }

  public get userTotalPremiums() {
    if (!this.userStats)
      return { amount: new BigNumber(`0`), symbol: symbolCode2Symbol(`VIG`) };

    return dec2asset(
      Number.parseFloat(this.userStats.prem) +
        Number.parseFloat(this.userStats.l_prem),
      symbolCode2Symbol(`VIG`)
    );
  }

  public get userTotalVigRewards() {
    if (!this.userStats)
      return { amount: new BigNumber(`0`), symbol: symbolCode2Symbol(`VIG`) };

    return dec2asset(
      Number.parseFloat(this.userStats.rewardsave) +
        Number.parseFloat(this.userStats.rewardlend),
      symbolCode2Symbol(`VIG`)
    );
  }

  public get userRexRewards() {
    if (!this.userStats)
      return { amount: new BigNumber(`0`), symbol: symbolCode2Symbol(`EOS`) };

    return dec2asset(
      Number.parseFloat(this.userStats.rewardrexvot),
      symbolCode2Symbol(`EOS`)
    );
  }

  public get userVigorRewards() {
    if (!this.userStats)
      return { amount: new BigNumber(`0`), symbol: symbolCode2Symbol(`VIGOR`) };

    // stored as date: adjust to UTC+1 convert to epoch (ms => s) and treat as number
    const rewardsAsDate = new Date(`${this.userStats.rewardlend2}Z`);
    const vigorRewards = rewardsAsDate.getTime() / 1000 / 10000;

    return dec2asset(vigorRewards, symbolCode2Symbol(`VIGOR`));
  }

  public get userInsurances() {
    return this._insurances(this.userStats);
  }

  public get finalInsurances() {
    return this._insurances(this.finalReserveUserStats);
  }

  public get globalInsurances() {
    return this._insurances(this.globalStats);
  }

  private _insurances(stats?: Pick<TUserRow, "insurance">) {
    if (!stats) return {};
    const insurances = stats.insurance.map((balanceString) =>
      decomposeAssetNormalized(balanceString)
    );
    return keyBy(insurances, (c) => c.symbol.code);
  }

  public get userInsurancesInUsd() {
    return this._insurancesInUsd(`user`);
  }

  public get finalInsurancesInUsd() {
    return this._insurancesInUsd(`final`);
  }

  public get globalInsurancesInUsd() {
    return this._insurancesInUsd(`global`);
  }

  private _insurancesInUsd(type: UserType) {
    const insurances =
      type === `user`
        ? this.userInsurances
        : type === `final`
        ? this.finalInsurances
        : this.globalInsurances;
    let tokenValueMap = this.rootStore.priceFeedStore.convertTokenBalancesToUsd(
      insurances
    );
    tokenValueMap.totalValueNoVigor =
      tokenValueMap.totalValue - (tokenValueMap.VIGOR || 0);
    return tokenValueMap;
  }

  public get userCollaterals() {
    return this._collaterals(this.userStats);
  }

  public get finalCollaterals() {
    return this._collaterals(this.finalReserveUserStats);
  }

  public get globalCollaterals() {
    if (!this.globalStats) return this._collaterals(this.globalStats);
    return this._collaterals({
      ...this.globalStats,
      l_debt: this.globalStats.l_totaldebt,
    });
  }

  private _collaterals(stats?: Pick<TUserRow, "collateral" | "l_debt">) {
    if (!stats) return {};
    const collaterals = stats.collateral!.map((balanceString) =>
      decomposeAssetNormalized(balanceString)
    );
    if (stats.l_debt) {
      collaterals.push(decomposeAsset(stats.l_debt));
    }
    return keyBy(collaterals, (c) => c.symbol.code);
  }

  public get userCollateralsInUsd() {
    return this._collateralsInUsd(`user`);
  }

  public get finalCollateralsInUsd() {
    return this._collateralsInUsd(`final`);
  }

  public get globalCollateralsInUsd() {
    return this._collateralsInUsd(`global`);
  }

  private _collateralsInUsd(type: UserType) {
    const collaterals =
      type === `user`
        ? this.userCollaterals
        : type === `final`
        ? this.finalCollaterals
        : this.globalCollaterals;
    let tokenValueMap = this.rootStore.priceFeedStore.convertTokenBalancesToUsd(
      collaterals
    );

    // overwrite market price of VIGOR in collateral
    // remove market price VIGOR value, add 1:1 vigor value
    tokenValueMap.totalValue -= tokenValueMap.VIGOR || 0;
    tokenValueMap.totalValueNoVigor = tokenValueMap.totalValue;
    tokenValueMap.VIGOR = collaterals.VIGOR ? asset2dec(collaterals.VIGOR) : 0;
    tokenValueMap.totalValue += tokenValueMap.VIGOR || 0;
    return tokenValueMap;
  }

  public get userLendContributions() {
    // pcts = downside "percent contribution to solvency"
    // l_pcts = upside "percent contribution to solvency"
    const down = this.userStats ? Number.parseFloat(this.userStats.pcts) : 0;
    const up = this.userStats ? Number.parseFloat(this.userStats.l_pcts) : 0;
    return { up, down };
  }

  public get userSavingsContributions() {
    if (!this.userStats || !this.globalStats) return 0;

    return (
      Number.parseFloat(this.userStats.savings) /
      Number.parseFloat(this.globalStats.savings)
    );
  }

  public get userLendReward() {
    if (
      !this.rootStore.walletStore.isLoggedIn ||
      Object.keys(this.userInsurances).length === 0
    )
      return this.globalLendReward;
    return this._lendReward(this.userStats);
  }

  public get finalLendReward() {
    return this._lendReward(this.finalReserveUserStats);
  }

  public get globalLendReward() {
    return this.globalStats ? Number.parseFloat(this.globalStats.earnrate) : 0;
  }

  private _lendReward(stats?: TUserRow) {
    return stats ? Number.parseFloat(stats.earnrate) : 0;
  }

  public get userSavingsReward() {
    return this.globalStats ? Number(this.globalStats.savingsrate) : 0;
  }

  public get userSavings() {
    return this._savings(this.userStats);
  }

  public get finalSavings() {
    return this._savings(this.finalReserveUserStats);
  }

  public get globalSavings() {
    return this._savings(this.globalStats);
  }

  private _savings(stats?: Pick<TUserRow, "savings">) {
    if (!stats) {
      return { amount: new BigNumber(`0`), symbol: symbolCode2Symbol(`VIGOR`) };
    }

    return dec2asset(
      Number.parseFloat(stats.savings),
      symbolCode2Symbol(`VIGOR`)
    );
  }

  public get userSavingsInUsd() {
    return this._savingsInUsd(`user`);
  }

  public get finalSavingsInUsd() {
    return this._savingsInUsd(`final`);
  }

  public get globalSavingsInUsd() {
    return this._savingsInUsd(`global`);
  }

  private _savingsInUsd(type: UserType) {
    const savings =
      type === `user`
        ? this.userSavings
        : type === `final`
        ? this.finalSavings
        : this.globalSavings;

    const { priceFeedStore } = this.rootStore;

    return priceFeedStore.convertTokenBalancesToUsd({ VIGOR: savings }).VIGOR;
  }

  public get userDebt(): { [key: string]: TAsset } {
    return this._debt(this.userStats);
  }

  public get finalDebt(): { [key: string]: TAsset } {
    return this._debt(this.finalReserveUserStats);
  }

  public get globalDebt(): { [key: string]: TAsset } {
    if (!this.globalStats) return this._debt(this.globalStats);

    return this._debt({
      ...this.globalStats,
      debt: this.globalStats.totaldebt,
    });
  }

  private _debt(
    stats?: Pick<TUserRow, "debt" | "l_collateral">
  ): { [key: string]: TAsset } {
    const vigorDebt = decomposeAsset((stats && stats.debt) || `0.0000 VIGOR`);
    // crypto debt is stored in l_collateral
    const cryptoDebt = stats
      ? stats.l_collateral!.reduce((acc, col) => {
          const asset = decomposeAssetNormalized(col);
          return {
            ...acc,
            [asset.symbol.code]: asset,
          };
        }, {})
      : {};

    return {
      VIGOR: vigorDebt,
      ...cryptoDebt,
    };
  }

  public get userDebtInUsd() {
    return this._debtInUsd(`user`);
  }

  public get finalDebtInUsd() {
    return this._debtInUsd(`final`);
  }

  public get globalDebtInUsd() {
    return this._debtInUsd(`global`);
  }

  private _debtInUsd(type: UserType) {
    const debt =
      type === `user`
        ? this.userDebt
        : type === `final`
        ? this.finalDebt
        : this.globalDebt;

    let tokenValueMap = this.rootStore.priceFeedStore.convertTokenBalancesToUsd(
      debt
    );

    // overwrite market price of VIGOR in debt
    tokenValueMap.totalValue -= tokenValueMap.VIGOR || 0;
    tokenValueMap.totalValueNoVigor = tokenValueMap.totalValue;
    tokenValueMap.VIGOR = debt[`VIGOR`] ? asset2dec(debt[`VIGOR`]) : 0;
    tokenValueMap.totalValue += tokenValueMap.VIGOR || 0;
    return tokenValueMap;
  }

  public get userDebtLeftToBorrow(): { [key: string]: TAsset } {
    let tokenMap = {} as any;
    // BORROW VIGOR => only non-VIGOR collateral counts
    const vigorUsdLeftToBorrow =
      this.userCollateralsInUsd.totalValueNoVigor /
        (this.config.mincollat / 100) -
      this.userDebtInUsd.VIGOR;
    const VIGOR_SYMBOL = ual.chain.tokens.VIGOR.symbol;
    tokenMap[VIGOR_SYMBOL.code] = vigorUsdLeftToBorrow;

    // BORROW CRYPTO => no VIGOR debt counts
    const cryptoUsdLeftToBorrow =
      this.userCollateralsInUsd.VIGOR / (this.config.mincollat / 100) -
      this.userDebtInUsd.totalValueNoVigor;
    BORROWABLE_TOKEN_SYMBOLS_NO_VIGOR.forEach((symbolCode) => {
      tokenMap[symbolCode] = cryptoUsdLeftToBorrow;
    });

    // convert all USD values to the actual tokenValue
    Object.keys(tokenMap).forEach((symbolCode) => {
      const symbol = symbolCode2Symbol(symbolCode);
      tokenMap[symbolCode] = this.rootStore.priceFeedStore.convertUsd2Token(
        tokenMap[symbolCode],
        symbol
      );
      if (tokenMap[symbolCode].amount.isLessThan(0))
        tokenMap[symbolCode].amount = new BigNumber(`0`);
    });

    return tokenMap;
  }

  public get userWithdrawLimits() {
    const limitUsed = this.userStats
      ? Number.parseFloat(this.userStats.txnvolume)
      : 0;
    const nextResetDate = this.globalStats
      ? new Date(this.globalStats.atimer)
      : new Date();

    const vigFeesInUsd = this.userFeesBalance ? this.userFeesBalanceInUsd : 0;
    const usedAccountValue = this.userStats
      ? this.userCollateralsInUsd.totalValue +
        this.userSavingsInUsd +
        this.userInsurancesInUsd.totalValue +
        vigFeesInUsd
      : 0;

    return {
      totalAllowed: this.config.dataa,
      perTxAllowed: this.config.datab,
      allowedAccountValue: this.config.initmaxsize,
      usedAccountValue: usedAccountValue,
      used: limitUsed,
      available: this.config.dataa - limitUsed,
      nextResetDate: nextResetDate,
    };
  }

  public get userReputation() {
    return this.userStats
      ? Number.parseFloat(this.userStats.reputation.reputation_pct)
      : 0;
  }

  public get userDiscount() {
    const u = this.userStats;
    if (!u) return 0;

    let discount =
      Number.parseFloat(u.reputation.reputation_pct) *
      (this.config.maxdisc / 100);

    return discount;
  }

  public get userBorrowRateVigor() {
    return this.userStats ? Number.parseFloat(this.userStats.tesprice) : 0;
  }

  public get userBorrowRateCrypto() {
    return this.userStats ? Number.parseFloat(this.userStats.l_tesprice) : 0;
  }

  public get userVigorCollateralRatio() {
    return this.computeVigorCollateralRatio();
  }

  public get userCryptoCollateralRatio() {
    return this.computeCryptoCollateralRatio();
  }

  public get userNextTransactionAvailableAt() {
    if (!this.userStats) return new Date(0);

    return new Date(
      new Date(`${this.userStats.lastupdate}Z`).getTime() +
        (Math.max(this.config.assetintime, this.config.assetouttime) +
          this.config.minebuffer) *
          1000
    );
  }

  public get borrowableTokens(): { [key: string]: TAsset } {
    if (!this.configWhitelist) return {};

    return this.configWhitelist.reduce((acc, row) => {
      let asset = row.lendable;

      const lendableAsset = decomposeAssetNormalized(asset);
      lendableAsset.amount = lendableAsset.amount
        .times(1 - Number.parseFloat(row.lentpct))
        .times(row.maxlends / 100);

      return {
        ...acc,
        [row.sym.split(`,`)[1]]: lendableAsset,
      };
    }, {});
  }

  public computeBorrowRateVigor = (
    deltaCollateral: TAsset = {
      amount: new BigNumber(`0`),
      symbol: ual.chain.tokens.VIG.symbol,
    },
    deltaDebt: TAsset = {
      amount: new BigNumber(`0`),
      symbol: ual.chain.tokens.VIGOR.symbol,
    }
  ) => {
    const { rate, premiumsUsd } = computeBorrowRateVigor({
      collateralAsset: deltaCollateral,
      collateralAmountUsd: this.rootStore.priceFeedStore.convertToken2Usd(
        deltaCollateral
      ),
      debtAsset: deltaDebt,
      userRow: this.userStats,
      globals: this.globalStats,
      marketRows: this.rootStore.priceFeedStore.marketRows,
      config: this.config,
    });

    const premiumsVig = this.rootStore.priceFeedStore.convertUsd2Token(
      premiumsUsd,
      ual.chain.tokens.VIG.symbol
    );
    return {
      rate,
      premiumsVig,
    };
  };

  public computeBorrowRateCrypto = (
    deltaCollateral: TAsset = {
      amount: new BigNumber(`0`),
      symbol: ual.chain.tokens.VIGOR.symbol,
    },
    deltaDebt: TAsset = {
      amount: new BigNumber(`0`),
      symbol: ual.chain.tokens.VIG.symbol,
    }
  ) => {
    const debtAmountUsd = this.rootStore.priceFeedStore.convertToken2Usd(
      deltaDebt
    );
    const { rate, premiumsUsd } = computeBorrowRateCrypto({
      // VIGOR collateral is 1:1 with USD
      collateralAmountUsd: asset2dec(deltaCollateral),
      debtAmountUsd,
      debtAsset: deltaDebt,
      userRow: this.userStats,
      globals: this.globalStats,
      marketRows: this.rootStore.priceFeedStore.marketRows,
      config: this.config,
      whitelist: this.configWhitelist,
    });

    const premiumsVig = this.rootStore.priceFeedStore.convertUsd2Token(
      premiumsUsd,
      ual.chain.tokens.VIG.symbol
    );
    return {
      rate,
      premiumsVig,
    };
  };

  public computeVigorCollateralRatio = (
    deltaCollateral: TAsset = {
      amount: new BigNumber(`0`),
      symbol: ual.chain.tokens.VIG.symbol,
    },
    deltaDebt: TAsset = {
      amount: new BigNumber(`0`),
      symbol: ual.chain.tokens.VIGOR.symbol,
    }
  ) => {
    // CR = user.valueofcol/user.debt
    if (!this.userStats) return 0;

    const deltaCollateralUsd = this.rootStore.priceFeedStore.convertToken2Usd(
      deltaCollateral
    );

    const totalDebt = asset2dec({
      amount: this.userDebt.VIGOR.amount.plus(deltaDebt.amount),
      symbol: deltaDebt.symbol,
    });

    if (totalDebt < 0.001) return 0;

    // contract does NOT use market value for VIGOR, 1 VIGOR = 1 USD for contract CR
    const ratio =
      (Number.parseFloat(this.userStats.valueofcol) + deltaCollateralUsd) /
      totalDebt;

    return Math.max(0, ratio);
  };

  public computeCryptoCollateralRatio = (
    deltaCollateral: TAsset = {
      amount: new BigNumber(`0`),
      symbol: ual.chain.tokens.VIGOR.symbol,
    },
    deltaDebt: TAsset = {
      amount: new BigNumber(`0`),
      symbol: ual.chain.tokens.VIG.symbol,
    }
  ) => {
    // l_CR = user.l_debt/user.l_valueofcol
    if (!this.userStats) return 0;

    const deltaDebtUsd = this.rootStore.priceFeedStore.convertToken2Usd(
      deltaDebt
    );

    const totalDebt =
      Number.parseFloat(this.userStats.l_valueofcol) + deltaDebtUsd;
    if (totalDebt < 0.001) return 0;

    // contract does NOT use market value for VIGOR, 1 VIGOR = 1 USD for contract CR
    const ratio =
      asset2dec({
        amount: this.userCollaterals.VIGOR.amount.plus(deltaCollateral.amount),
        symbol: deltaCollateral.symbol,
      }) / totalDebt;

    return Math.max(0, ratio);
  };

  async onLogout() {
    this.reset();
  }
}

decorate(VigorStore, {
  globalStats: observable,
  config: observable,
  configWhitelist: observable,
  userStats: observable,
  userCron: observable,
  activityLog: observable,
  bailoutLog: observable,
  vigorTokenStats: observable,
  finalReserveUserStats: observable,
  // computed properties
  totalBorrowed: computed,
  totalCollateralValue: computed,
  totalInsuranceValue: computed,
  totalDebt: computed,
  solvency: computed,
  l_solvency: computed,
  vigorSupply: computed,
  vigorTokenHolders: computed,
  vigReserve: computed,
  userFeesBalance: computed,
  userTotalPremiums: computed,
  userTotalVigRewards: computed,
  userInsurances: computed,
  finalInsurances: computed,
  globalInsurances: computed,
  userInsurancesInUsd: computed,
  finalInsurancesInUsd: computed,
  globalInsurancesInUsd: computed,
  userCollaterals: computed,
  finalCollaterals: computed,
  globalCollaterals: computed,
  userCollateralsInUsd: computed,
  finalCollateralsInUsd: computed,
  globalCollateralsInUsd: computed,
  userDebt: computed,
  finalDebt: computed,
  globalDebt: computed,
  userDebtInUsd: computed,
  finalDebtInUsd: computed,
  globalDebtInUsd: computed,
  userDebtLeftToBorrow: computed,
  userSavings: computed,
  finalSavings: computed,
  globalSavings: computed,
  userSavingsInUsd: computed,
  finalSavingsInUsd: computed,
  globalSavingsInUsd: computed,
  userLendContributions: computed,
  userSavingsContributions: computed,
  userLendReward: computed,
  finalLendReward: computed,
  userSavingsReward: computed,
  userReputation: computed,
  userDiscount: computed,
  userBorrowRateVigor: computed,
  userBorrowRateCrypto: computed,
  userVigorCollateralRatio: computed,
  userCryptoCollateralRatio: computed,
  userNextTransactionAvailableAt: computed,
  userWithdrawLimits: computed,
  // actions
  reset: action,
  fetchConfigs: action,
  fetchGlobalStats: action,
  fetchUserStats: action,
  fetchVigorStats: action,
  fetchUserLog: action,
  fetchCroneosQueue: action,
  clearQueue: action,
});
