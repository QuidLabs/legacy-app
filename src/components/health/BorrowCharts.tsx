import { ResponsiveLine } from "@nivo/line";
import { observer } from "mobx-react";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { useStore } from "../../store/use-store";
import nivoTheme from "../../utils/nivo-theme";
import theme from "../../utils/theme";
import { media } from "../../utils/breakpoints";
import { useMedia } from "react-use-media";
import { PageSubtitle } from "../shared/PageTitle";
import {
  createFakeUser,
  computeBorrowRateVigor,
  computeBorrowRateCrypto,
} from "../../utils/math";
import { decomposeAsset, TAsset } from "@deltalabs/eos-utils";
import keyBy from "lodash/keyBy";
import { ToggleButton } from "../shared/ToggleButton";
import { HorizontalFlex } from "../shared";
import BigNumber from "bignumber.js";
import { symbolCode2Symbol } from "../../utils/tokens";
import { asset2dec } from "../../utils/format";
import ual from "../../../config/ual";

const Wrapper = styled.div`
  width: 100%;
  max-width: 960px;
  margin: 64px 0 0 0;
`;

const BorrowInfo = styled.div``;

const ChartWrapper = styled.div`
  margin: 0 auto;

  ${media.lessThan(`sm`)} {
    width: 400px;
    height: 300px;
  }
  ${media.between(`sm`, `smd`)} {
    width: ${(props) => props.theme.breakpoints.sm};
    height: 300px;
  }
  ${media.between(`smd`, `md`)} {
    width: ${(props) => props.theme.breakpoints.smd};
    height: 350px;
  }
  ${media.greaterThan(`md`)} {
    width: 960px;
    height: 400px;
  }
`;

const toPercentage = (val: any, decimals = 0) => {
  const number = Number.parseFloat(val.toString());
  return `${(number * 100).toFixed(decimals)}%`;
};

const CRs = [
  1.0,
  1.06,
  1.11,
  1.22,
  1.29,
  1.38,
  1.48,
  1.72,
  2,
  2.33,
  2.66,
  3,
  3.34,
  4,
  5,
  6,
];

const COLORS = [
  `#4468CC`, // 1:1:1
  theme.colors.secondary, // VIG
  theme.colors.white, // EOS
  `#50AF95`, // USDT
  `#388CDE`, // IQ
  `#FF9900`, // PBTC
];

const CHART_TOKENS = Object.values(ual.chain.tokens).filter(
  (extSymbol) => extSymbol.symbol.code !== `VIGOR`
);

type Props = {};
const _BorrowVigorChart: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [vigorStore, priceFeedStore] = useStore((store) => [
    store.vigorStore,
    store.priceFeedStore,
  ]);
  const isMobile = useMedia(media.xs.replace(`@media `, ``));
  const tickValues = isMobile ? 5 : 10;
  const maxtesprice = vigorStore.config.maxtesprice / 10000;

  const borrowRates = useMemo(() => {
    const ratesForCollateral = (userCollaterals: TAsset[]) => {
      const userCollateralsBySymbol = keyBy(
        userCollaterals,
        (col) => col.symbol.code
      );
      try {
        const user = createFakeUser({
          rootStore: vigorStore.rootStore,
          userCollaterals,
          cryptoDebt: [],
          reputationPct: vigorStore.userStats ? vigorStore.userReputation : 0.5,
        });

        return CRs.map((cr) => {
          // CR = collateral / debt <=> debt = collateral / CR
          const debtAmount = Number.parseFloat(user.valueofcol!) / cr;
          const debtAsset = decomposeAsset(`${debtAmount.toFixed(4)} VIGOR`);
          return computeBorrowRateVigor({
            collateralAsset: {
              amount: new BigNumber(`0`),
              symbol: symbolCode2Symbol(`EOS`),
            },
            collateralAmountUsd: 0,
            debtAsset,
            userRow: user as any,
            globals: vigorStore.globalStats,
            marketRows: priceFeedStore.marketRows,
            config: vigorStore.config,
          }).rate;
        });
      } catch (error) {
        return CRs.map((cr) => 0);
      }
    };

    const borrowRatesIndividual = CHART_TOKENS.map((extSymbol) => {
      const rates = ratesForCollateral([
        priceFeedStore.convertUsd2Token(1000, extSymbol.symbol),
      ]);
      const borrowRates = CRs.map((cr, index) => ({
        cr,
        rate: rates[index],
      }));
      return borrowRates;
    });
    const mixedRates = ratesForCollateral(
      CHART_TOKENS.map((extSymbol) =>
        priceFeedStore.convertUsd2Token(500, extSymbol.symbol)
      )
    );
    const borrowRatesMixed = CRs.map((cr, index) => ({
      cr,
      rate: mixedRates[index],
    }));
    return [borrowRatesMixed, ...borrowRatesIndividual];
  }, [
    priceFeedStore.marketRows,
    priceFeedStore.pairs,
    vigorStore.globalStats,
    vigorStore.config,
    vigorStore.userStats, // reputation
  ]);

  // webpack 'invalid token' bug when destructuring directly in the useMemo result
  const [borrowRatesMixed, ...borrowRatesIndividual] = borrowRates;

  const toData = (arr: any[]) =>
    arr.map(({ cr, rate }) => ({ x: cr, y: rate }));

  return (
    <ChartWrapper>
      <ResponsiveLine
        theme={nivoTheme as any}
        data={[
          {
            id: "equal mix",
            data: toData(borrowRatesMixed),
          },
          ...CHART_TOKENS.map((extSymbol, index) => ({
            id: extSymbol.symbol.code,
            data: toData(borrowRatesIndividual[index]),
          })),
        ]}
        margin={{
          top: 50,
          right: 100,
          bottom: 50,
          left: 50,
        }}
        xScale={{
          type: "linear",
          stacked: false,
          reverse: false,
          min: Math.min(...CRs) - 0.01,
          max: Math.max(...CRs) + 0.01,
        }}
        xFormat={(d) => toPercentage(d, 1)}
        yScale={{
          type: "linear",
          stacked: false,
          min: 0,
          max: maxtesprice,
        }}
        yFormat={(d) => toPercentage(d, 1)}
        curve="monotoneX"
        axisTop={null}
        axisBottom={{
          orient: "bottom",
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: t(`collateralRatio`),
          legendOffset: 36,
          legendPosition: "middle",
          format: toPercentage as any,
          tickValues,
        }}
        axisLeft={{
          orient: "left",
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: t(`health.rate`),
          legendOffset: -40,
          legendPosition: "middle",
          format: toPercentage as any,
          tickValues,
        }}
        colors={COLORS}
        pointSize={10}
        pointColor={{ theme: "background" }}
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        pointLabel="y"
        pointLabelYOffset={-12}
        enableGridX={false}
        useMesh={true}
        // tooltip={(input) => {
        //   console.log(input.point)
        //   return (
        //   <HorizontalFlex>
        //     <span>CR:</span><span>{input.point.data.xFormatted}</span>
        //     <span>Rate:</span><span>{input.point.data.yFormatted}</span>
        //   </HorizontalFlex>
        // )}}
        legends={[
          {
            anchor: "bottom-right",
            direction: "column",
            justify: false,
            translateX: 103,
            translateY: 0,
            itemsSpacing: 0,
            itemDirection: "left-to-right",
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12,
            symbolShape: "circle",
            symbolBorderColor: "rgba(0, 0, 0, .5)",
            itemTextColor: `#ffffff`,
            effects: [
              {
                on: "hover",
                style: {
                  itemBackground: "rgba(0, 0, 0, .03)",
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
      />
    </ChartWrapper>
  );
};

const BorrowVigorChart = observer(_BorrowVigorChart);

const _BorrowCryptoChart: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [vigorStore, priceFeedStore] = useStore((store) => [
    store.vigorStore,
    store.priceFeedStore,
  ]);
  const isMobile = useMedia(media.xs.replace(`@media `, ``));
  const tickValues = isMobile ? 5 : 10;
  const maxtesprice = vigorStore.config.maxtesprice / 10000;

  const borrowRatesIndividual = useMemo(() => {
    const ratesForDebt = (cryptoSymbol: string) => {
      const vigorCollateral = {
        symbol: { code: `VIGOR`, precision: 4 },
        amount: new BigNumber(`10000000`),
      };
      const userCollaterals = [vigorCollateral];
      // vigor collateral is 1:1
      const vigorCollateralUsd = asset2dec(vigorCollateral);

      try {
        return CRs.map((cr) => {
          // compute l_collateral
          // CR = collateral / debt <=> debt = collateral / CR
          const debtAmountUsd = vigorCollateralUsd / cr;
          const cryptoDebt = priceFeedStore.convertUsd2Token(
            debtAmountUsd,
            symbolCode2Symbol(cryptoSymbol)
          );
          const user = createFakeUser({
            rootStore: vigorStore.rootStore,
            userCollaterals,
            cryptoDebt: [cryptoDebt],
            reputationPct: vigorStore.userStats
              ? vigorStore.userReputation
              : 0.5,
          });

          return computeBorrowRateCrypto({
            collateralAmountUsd: 0, // no additional VIGOR collateral value
            debtAsset: priceFeedStore.convertUsd2Token(
              0,
              symbolCode2Symbol(`EOS`)
            ),
            debtAmountUsd: 0, // already borrowed in user
            userRow: user as any,
            globals: vigorStore.globalStats,
            marketRows: priceFeedStore.marketRows,
            config: vigorStore.config,
            whitelist: vigorStore.configWhitelist,
          }).rate;
        });
      } catch (error) {
        return CRs.map((cr) => 0);
      }
    };

    const borrowRatesIndividual = CHART_TOKENS.map((extSymbol) => {
      const rates = ratesForDebt(extSymbol.symbol.code);
      const borrowRates = CRs.map((cr, index) => ({
        cr,
        rate: rates[index],
      }));
      return borrowRates;
    });

    return borrowRatesIndividual;
  }, [
    priceFeedStore.marketRows,
    priceFeedStore.pairs,
    vigorStore.globalStats,
    vigorStore.userStats, // reputation
  ]);

  const toData = (arr: any[]) =>
    arr.map(({ cr, rate }) => ({ x: cr, y: rate }));

  return (
    <ChartWrapper>
      <ResponsiveLine
        theme={nivoTheme as any}
        data={CHART_TOKENS.map((extSymbol, index) => ({
          id: extSymbol.symbol.code,
          data: toData(borrowRatesIndividual[index]),
        }))}
        margin={{
          top: 50,
          right: 100,
          bottom: 50,
          left: 50,
        }}
        xScale={{
          type: "linear",
          stacked: false,
          reverse: false,
          min: Math.min(...CRs) - 0.01,
          max: Math.max(...CRs) + 0.01,
        }}
        xFormat={(d) => toPercentage(d, 1)}
        yScale={{
          type: "linear",
          stacked: false,
          min: 0,
          max: maxtesprice,
        }}
        yFormat={(d) => toPercentage(d, 1)}
        curve="monotoneX"
        axisTop={null}
        axisBottom={{
          orient: "bottom",
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: t(`collateralRatio`),
          legendOffset: 36,
          legendPosition: "middle",
          format: toPercentage as any,
          tickValues,
        }}
        axisLeft={{
          orient: "left",
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: t(`health.rate`),
          legendOffset: -40,
          legendPosition: "middle",
          format: toPercentage as any,
          tickValues,
        }}
        colors={COLORS.slice(1)}
        pointSize={10}
        pointColor={{ theme: "background" }}
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        pointLabel="y"
        pointLabelYOffset={-12}
        enableGridX={false}
        useMesh={true}
        legends={[
          {
            anchor: "bottom-right",
            direction: "column",
            justify: false,
            translateX: 103,
            translateY: 0,
            itemsSpacing: 0,
            itemDirection: "left-to-right",
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12,
            symbolShape: "circle",
            symbolBorderColor: "rgba(0, 0, 0, .5)",
            itemTextColor: `#ffffff`,
            effects: [
              {
                on: "hover",
                style: {
                  itemBackground: "rgba(0, 0, 0, .03)",
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
      />
    </ChartWrapper>
  );
};

const BorrowCryptoChart = observer(_BorrowCryptoChart);

const BorrowCharts: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [type, setType] = React.useState<string>(`vigor`);

  return (
    <Wrapper>
      <PageSubtitle>{t(`health.charts.borrowRates`)}</PageSubtitle>
      <BorrowInfo>{t(`health.charts.borrowInfo`)}</BorrowInfo>
      <HorizontalFlex margin="32px 0 0 0">
        <ToggleButton
          texts={[
            t(`health.charts.borrowVigor`),
            t(`health.charts.borrowCrypto`),
          ]}
          onChange={setType}
          values={[`vigor`, `crypto`]}
          activeValue={type}
          colorVariant="primary"
          // @ts-ignore
          style={{ width: 300 }}
        />
      </HorizontalFlex>
      {type === `vigor` ? <BorrowVigorChart /> : <BorrowCryptoChart />}
    </Wrapper>
  );
};

export default BorrowCharts;
