import {
  TGlobalStatsRow,
  TUserRow,
  TConfigRow,
  TMarketRow,
  TWhitelistRow,
} from "../types/eos";
import erfc from "compute-erfc";
import keyBy from "lodash/keyBy";
import omit from "lodash/omit";
import { TAsset, decomposeAsset, formatAsset } from "@deltalabs/eos-utils";
import RootStore from "../store";
import { asset2dec, decomposeAssetNormalized } from "./format";
import { toJS } from "mobx";

const icdf = (p: number) => {
  const approx = (t: number) => {
    const c = [2.515517, 0.802853, 0.010328];
    const d = [1.432788, 0.189269, 0.001308];
    return (
      t -
      ((c[2] * t + c[1]) * t + c[0]) /
        (((d[2] * t + d[1]) * t + d[0]) * t + 1.0)
    );
  };

  if (p < 0.5) {
    // F^-1(p) = - G^-1(p)
    return -approx(Math.sqrt(-2.0 * Math.log(p)));
  }

  // F^-1(p) = G^-1(1-p)
  return approx(Math.sqrt(-2.0 * Math.log(1 - p)));
};

const computeStresscol = (portfolioVariance: number, config: TConfigRow) => {
  const getAlphaTest = () => config.alphatest / 1000;
  const stresscol =
    -1.0 *
    (Math.exp(
      -1.0 *
        ((Math.exp((-1.0 * Math.pow(icdf(getAlphaTest()), 2.0)) / 2.0) /
          Math.sqrt(2.0 * Math.PI) /
          (1.0 - getAlphaTest())) *
          Math.sqrt(portfolioVariance))
    ) -
      1.0);
  return stresscol;
};

const computeLStresscol = (portfolioVariance: number, config: TConfigRow) => {
  const getAlphaTest = () => config.alphatest / 1000;
  const l_stresscol =
    Math.exp(
      (Math.exp((-1.0 * Math.pow(icdf(getAlphaTest()), 2.0)) / 2.0) /
        Math.sqrt(2.0 * Math.PI) /
        (1.0 - getAlphaTest())) *
        Math.sqrt(portfolioVariance)
    ) - 1.0;
  return l_stresscol;
};

const computePortfolioVariance = (
  userCollaterals: TAsset[],
  marketData: TMarketRow[],
  valueofcol: number
) => {
  const volPrecision = 1000000;
  const corrPrecision = 1000000;
  const pricePrecision = 1000000;
  const getMarketForSymbol = (symbolCode: string) => {
    return marketData.find((d) => d.sym.split(`,`)[1] === symbolCode)!;
  };
  let portVariance = 0;

  userCollaterals.forEach((asset, index) => {
    const market = getMarketForSymbol(asset.symbol.code);
    const iVvol = market.marketdata.vol / volPrecision;
    let iW = market.marketdata.price[0] / pricePrecision;
    iW *= asset2dec(asset);
    iW /= valueofcol;
    userCollaterals.slice(index + 1).forEach((nextAsset) => {
      const c =
        market.marketdata.correlation_matrix.find(
          (entry) => entry.key.split(`,`)[1] === nextAsset.symbol.code
        )!.value / corrPrecision; // corr matrix has VIG 4 not VIG 10
      const nextMarket = getMarketForSymbol(nextAsset.symbol.code);
      const jVvol = nextMarket.marketdata.vol / volPrecision;
      let jW = nextMarket.marketdata.price[0] / pricePrecision;
      jW *= asset2dec(nextAsset);
      jW /= valueofcol;
      portVariance += 2.0 * iW * jW * c * iVvol * jVvol;
    });

    portVariance += Math.pow(iW, 2) * Math.pow(iVvol, 2);
  });

  return portVariance;
};

const computeLScaleliq = (
  userCollaterals: TAsset[],
  userValueofcol: number,
  marketData: TMarketRow[],
  whitelist: TWhitelistRow[]
) => {
  const pricePrecision = 1000000;
  const getMarketForSymbol = (symbolCode: string) => {
    return marketData.find((d) => d.sym.split(`,`)[1] === symbolCode)!;
  };
  const getWhitelistForSymbol = (symbolCode: string) => {
    return whitelist.find((d) => d.sym.split(`,`)[1] === symbolCode)!;
  };
  let l_scaleliq = 0;

  userCollaterals.forEach((asset, index) => {
    const market = getMarketForSymbol(asset.symbol.code);
    const l_valueofcol =
      asset2dec(asset) * (market.marketdata.price[0] / pricePrecision);

    const w = getWhitelistForSymbol(asset.symbol.code);
    const lentpct = Number.parseFloat(w.lentpct);
    l_scaleliq += (l_valueofcol / userValueofcol) * lentpct;
  });

  return l_scaleliq;
};

type createFakeUserArg = {
  rootStore: RootStore;
  userCollaterals: TAsset[];
  cryptoDebt: TAsset[];
  reputationPct?: number;
};
export const createFakeUser = ({
  rootStore,
  userCollaterals,
  cryptoDebt,
  reputationPct = 0.5,
}: createFakeUserArg): Partial<TUserRow> => {
  const userCollateralsBySymbol = keyBy(
    userCollaterals,
    (col) => col.symbol.code
  );

  const valueofcol = rootStore.priceFeedStore.convertTokenBalancesToUsd(
    omit(userCollateralsBySymbol, `VIGOR`)
  ).totalValue;
  // pricefeedStore not initialized yet
  if (!Number.isFinite(valueofcol) || !rootStore.priceFeedStore.marketRows) {
    throw new Error(`pricefeedstore not initialized yet`);
  }
  const userCollateralsNoVigor = userCollaterals.filter(
    (asset) => asset.symbol.code !== `VIGOR`
  );
  // return a user that we can use in computeBorrowRateVigor calculation
  // i.e., needs debt (0), volcol, stresscol, collateral, valueofcol, reputation.reputation_pct
  // for computeBorrowRateCrypto calculation in addition:
  // i.e., needs l_collateral ([]), l_valueofcol (0), l_debt, l_volcol, l_stresscol
  const collateral = userCollateralsNoVigor.map((asset) => formatAsset(asset));
  const portVariance = computePortfolioVariance(
    userCollateralsNoVigor,
    rootStore.priceFeedStore.marketRows,
    valueofcol
  );
  const volcol = Math.sqrt(portVariance);

  const l_debt = userCollateralsBySymbol.VIGOR
    ? formatAsset(userCollateralsBySymbol.VIGOR)
    : `0.0000 VIGOR`;
  const l_collateral = cryptoDebt;
  const l_valueofcol = rootStore.priceFeedStore.convertTokenBalancesToUsd(
    keyBy(l_collateral, (col) => col.symbol.code)
  ).totalValue;
  const l_portVariance = computePortfolioVariance(
    l_collateral,
    rootStore.priceFeedStore.marketRows,
    l_valueofcol
  );
  const l_volcol = Math.sqrt(l_portVariance);
  const reputation = { reputation_pct: reputationPct };

  return {
    // borrow VIGOR
    collateral,
    volcol: `${volcol}`,
    valueofcol: `${valueofcol}`,
    debt: `0.0000 VIGOR`,
    // borrow crypto
    l_collateral: l_collateral.map((asset) => formatAsset(asset)),
    l_valueofcol: `${l_valueofcol}`,
    l_debt: `${l_debt}`,
    l_volcol: `${l_volcol}`,
    reputation: reputation as any,
  };
};
type computeBorrowRateArg = {
  collateralAsset: TAsset;
  collateralAmountUsd: number;
  debtAsset: TAsset;
  userRow?: TUserRow;
  globals?: TGlobalStatsRow;
  marketRows?: TMarketRow[];
  config?: TConfigRow;
};

export const computeBorrowRateVigor = ({
  collateralAsset,
  collateralAmountUsd,
  debtAsset,
  userRow,
  globals,
  marketRows,
  config,
}: computeBorrowRateArg) => {
  const { symbol: inputSymbol, amount: debtAmount } = debtAsset;
  let premiumsUsd = 0;
  let rate = 0;
  if (!userRow || !globals || !marketRows || !config)
    return {
      premiumsUsd,
      rate,
    };

  const maxtesprice = config.maxtesprice / 10000; // 0.5; //_config.getMaxTesPrice()
  const mintesprice = config.mintesprice / 10000; //_config.getMinTesPrice()
  const calibrate = config.calibrate / 10; //_config.getCalibrate()
  const datac = config.datac / 100; //_config.getDataC()
  const debtInput = debtAmount; // if buttonclick = 'repay' this should be passed as a negative amount
  const userRowDebt = decomposeAsset(userRow.debt);
  // VIGOR debt is 1:1 with USD
  const newTotalDebt = userRowDebt.amount.toNumber() + debtInput.toNumber();

  const newCollateral = userRow.collateral.map((balance) =>
    decomposeAssetNormalized(balance)
  );
  const foundCollateralIndex = newCollateral.findIndex(
    (asset) => asset.symbol.code === collateralAsset.symbol.code
  );
  if (foundCollateralIndex >= 0) {
    newCollateral[foundCollateralIndex].amount = newCollateral[
      foundCollateralIndex
    ].amount.plus(collateralAsset.amount);
  } else {
    newCollateral.push(collateralAsset);
  }
  const newValueOfCol =
    Number.parseFloat(userRow.valueofcol) + collateralAmountUsd;

  const portVariance = computePortfolioVariance(
    newCollateral,
    marketRows,
    newValueOfCol
  );
  const userStressCol = computeStresscol(portVariance, config);
  const userVolcol = Math.sqrt(portVariance);

  const ivol = userVolcol * calibrate * Number.parseFloat(globals.scale);
  const istresscol =
    -1.0 *
    (Math.exp(
      -1.0 *
        (-1.0 *
          Math.log(1.0 + userStressCol * -1.0) *
          calibrate *
          Number.parseFloat(globals.scale))
    ) -
      1.0);
  const payoff = Math.max(
    0.0,
    1.0 * (newTotalDebt / Math.pow(10.0, 4)) -
      newValueOfCol * (1.0 - istresscol)
  );
  const T = 1.0;
  const d =
    (Math.log(newValueOfCol / (newTotalDebt / Math.pow(10.0, 4))) +
      (-Math.pow(ivol, 2) / 2.0) * T * datac) /
    (ivol * Math.sqrt(T * datac));

  let discount =
    1.0 -
    Number.parseFloat(userRow.reputation.reputation_pct) *
      (config.maxdisc / 100);

  let tesprice =
    discount *
    Math.min(
      Math.max(
        mintesprice,
        (payoff * erfc(d / Math.sqrt(2.0))) /
          2.0 /
          (newTotalDebt / Math.pow(10.0, 4))
      ),
      maxtesprice
    );
  if (isNaN(tesprice)) {
    return {
      rate: 0,
      premiumsUsd,
    };
  }

  // premiums = dollar amount of premiums borrowers would pay in one month to insure their collateral
  premiumsUsd =
    (Math.pow(1.0 + tesprice, 1.0 / 12.0) - 1.0) *
    (newTotalDebt / Math.pow(10.0, 4));

  return {
    rate: tesprice,
    premiumsUsd,
  };
};

// https://gitlab.com/vigorstablecoin/vigorui/-/blob/stuffed/src/store/global.js#L49
export const computeBorrowRateCrypto = ({
  collateralAmountUsd,
  debtAsset,
  debtAmountUsd,
  userRow,
  globals,
  marketRows,
  config,
  whitelist,
}: Omit<computeBorrowRateArg, "collateralAsset"> & {
  debtAmountUsd: number;
  whitelist: TWhitelistRow[];
}) => {
  let premiumsUsd = 0;
  let rate = 0;
  if (!userRow || !globals || !marketRows || !config)
    return {
      premiumsUsd,
      rate,
    };

  const maxtesprice = config.maxtesprice / 10000; // 0.5; //_config.getMaxTesPrice()
  const mintesprice = config.mintesprice / 10000; //_config.getMinTesPrice()
  const calibrate = config.calibrate / 10; //_config.getCalibrate()
  const datac = config.datac / 100; //_config.getDataC()
  const userRowLDebt = decomposeAsset(userRow.l_debt);
  let l_collateralInputUsd = debtAmountUsd;
  const newTotalLDebt = userRowLDebt.amount.toNumber() + collateralAmountUsd;

  const new_l_collateral = userRow.l_collateral.map((balance) =>
    decomposeAssetNormalized(balance)
  );
  const foundLCollateralIndex = new_l_collateral.findIndex(
    (asset) => asset.symbol.code === debtAsset.symbol.code
  );
  if (foundLCollateralIndex >= 0) {
    new_l_collateral[foundLCollateralIndex].amount = new_l_collateral[
      foundLCollateralIndex
    ].amount.plus(debtAsset.amount);
  } else {
    new_l_collateral.push(debtAsset);
  }

  const new_l_valueofcol =
    Number.parseFloat(userRow.l_valueofcol) + l_collateralInputUsd;

  const l_portVariance = computePortfolioVariance(
    new_l_collateral,
    marketRows,
    new_l_valueofcol
  );
  const l_volcol = Math.sqrt(l_portVariance);
  const l_stresscol = computeLStresscol(l_portVariance, config);

  // compute l_scaleiq
  // penalty for borrowing scarce tokens, scarce as defined by lentpct
  let l_scaleliq = computeLScaleliq(
    new_l_collateral,
    new_l_valueofcol,
    marketRows,
    whitelist
  );

  const globalScale =
    calibrate * Number.parseFloat(globals.l_scale) +
    Math.pow(l_scaleliq, 2) / 2;
  const l_ivol = l_volcol * globalScale;
  const l_istresscol =
    Math.exp(Math.log(1.0 + l_stresscol) * globalScale) - 1.0;

  const payoff = Math.max(
    0.0,
    1.0 * new_l_valueofcol * (1.0 + l_istresscol) -
      newTotalLDebt / Math.pow(10.0, 4)
  );
  const T = 1.0;
  const d =
    (Math.log(new_l_valueofcol / (newTotalLDebt / Math.pow(10.0, 4))) +
      (-Math.pow(l_ivol, 2) / 2.0) * T * datac) /
    (l_ivol * Math.sqrt(T * datac));

  let discount =
    1.0 -
    Number.parseFloat(userRow.reputation.reputation_pct) *
      (config.maxdisc / 100);

  let l_tesprice =
    discount *
    Math.min(
      Math.max(
        mintesprice,
        (payoff * erfc((-1.0 * d) / Math.sqrt(2.0))) / 2.0 / new_l_valueofcol
      ),
      maxtesprice
    );

  if (isNaN(l_tesprice)) {
    return {
      rate: 0,
      premiumsUsd,
    };
  }

  // premiums = dollar amount of premiums borrowers would pay in one month to insure their collateral
  premiumsUsd =
    (Math.pow(1.0 + l_tesprice, 1.0 / 12.0) - 1.0) *
    (newTotalLDebt / Math.pow(10.0, 4));

  return {
    rate: l_tesprice,
    premiumsUsd,
  };
};
