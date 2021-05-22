import React from "react";
import styled from "styled-components";
import { HorizontalFlex, VerticalFlex } from "./helpers";
import { useTranslation } from "react-i18next";
import { TAsset, formatAsset } from "@deltalabs/eos-utils";
import filter from "lodash/filter";
import AssetIcon from "./AssetIcon";
import { variant2Color } from "./color-props";
import { media } from "../../utils/breakpoints";
import { dec2asset } from "../../utils/format";
import { orderBy } from "lodash";

// @ts-ignore
const Wrapper = styled(VerticalFlex)`
  margin-top: 32px;
`;

const TableHeaderRow = styled(HorizontalFlex)`
  text-align: center;
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid ${p => p.theme.colors.bgLighter};
  
  & > * {
    width: 25%;
  }
  
  ${media.lessThan('xs')} {
    & > * {
      width: 33%;
    }
  }
`;

const TableHeaderItem = styled.div`
  text-transform: uppercase;
  color: ${props => props.theme.colors.bgLightest};
  
  ${media.lessThan('md')} {
    font-size: 12px;
  }
`;

const TableHeaderItemHiddenXS = styled(TableHeaderItem)`
  ${media.lessThan('xs')} {
    display: none;
  }
`;

const TableBodyRow = styled(HorizontalFlex)<any>`
  text-align: center;
  padding-bottom: 8px;
  margin-bottom: 8px;
  color: ${(p) => p.colorVariant ? variant2Color(p) : p.theme.colors.whiteDarkened};
  
  &:not(:last-of-type) {
    border-bottom:  1px solid ${p => p.theme.colors.bgLighter};
  }
`;

const TableBodyItem = styled(HorizontalFlex)`
  font-size: 16px;
  align-items: center;
  text-transform: uppercase;
  width: 25%;

  ${media.lessThan('md')} {
    width: 33%;
    font-size: 12px;
  }
`;

const TableBodyItemHiddenXS = styled(TableBodyItem)`
  ${media.lessThan('xs')} {
    display: none;
  }
`;

const TableBodyItemAsset = styled(TableBodyItem)`
  justify-content: flex-start;
  margin-left: 8px;
`;

const AssetCode = styled.div`
  margin-left: 8px;
`;

type AssetTableProps = {
  colorVariant?: string;
  className?: string;
  tokens: { [key: string]: TAsset };
  tokensInUsd: { [key: string]: number };
  totalValueInUsd: number;
};

const AssetTable: React.FC<AssetTableProps> = props => {
  const { className, tokens, tokensInUsd, totalValueInUsd, colorVariant } = props;
  const { t } = useTranslation();

  const tokensSorted = orderBy(tokens, (item) => {
    return (tokensInUsd[item.symbol.code] / totalValueInUsd);
  }, ['desc']);

  const tokensWithBalance = filter(
    tokensSorted,
    (asset: TAsset) => !asset.amount.isZero()
  );

  return (
    <Wrapper className={className}>
      <TableHeaderRow>
        <TableHeaderItem>{t(`asset`).toUpperCase()}</TableHeaderItem>
        <TableHeaderItem>{t(`amount`).toUpperCase()}</TableHeaderItem>
        <TableHeaderItemHiddenXS>{t(`percent`).toUpperCase()}</TableHeaderItemHiddenXS>
        <TableHeaderItem>{t(`value`).toUpperCase()}</TableHeaderItem>
      </TableHeaderRow>
      { Object.keys(tokensWithBalance).length === 0 &&
        <TableBodyRow colorVariant={colorVariant}>
          <TableBodyItem/>
          <TableBodyItem>{t(`noData`)}</TableBodyItem>
          <TableBodyItem/>
        </TableBodyRow>
      }
      {Object.keys(tokensWithBalance).length > 0 && tokensSorted.map(token => {
        return (
          <TableBodyRow key={token.symbol.code} colorVariant={colorVariant}>
            <TableBodyItemAsset>
              <AssetIcon width={24} height={24} symbolCode={token.symbol.code} />
              <AssetCode>{token.symbol.code}</AssetCode>
            </TableBodyItemAsset>
            <TableBodyItem>
              {formatAsset(token, {
                withSymbol: false,
                separateThousands: true,
              })}
            </TableBodyItem>
            <TableBodyItemHiddenXS>
              { ((tokensInUsd[token.symbol.code] / totalValueInUsd) * 100).toFixed(0) }%
            </TableBodyItemHiddenXS>
            <TableBodyItem>
              {`$${formatAsset(dec2asset(tokensInUsd[token.symbol.code], { code: 'USD', precision: 2 }), { separateThousands: true, withSymbol: false })}`}
            </TableBodyItem>
          </TableBodyRow>
        );
      })}
    </Wrapper>
  );
};

export default AssetTable;
