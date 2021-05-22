import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { media } from "../../utils/breakpoints";
import { VerticalFlex } from "../shared";
import { formatCR } from "../../utils/format";
import theme from "../../utils/theme";
import { useStore } from "../../store/use-store";
import Gauge from "../shared/Gauge";

const DIVIDER_CIRCLE_RADIUS = 85;

const getCrColor = ({ value, theme }: any) => {
  // special case for value when no collateral / debt was taken on
  if (value < 0.001) return theme.colors.success;

  if (value < 1.3) return theme.colors.error;
  else if (value < 1.5) return theme.colors.warning;
  else return theme.colors.success;
};

const getSolvencyColor = ({ value, target = 1.0, theme }: any) => {
  if (value > 0 && value < 0.75 * target) return theme.colors.error;
  else if (value < target) return theme.colors.warning;
  else return theme.colors.success;
};

const DividerWrapper = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  width: 1px;
  border-left: 1px solid ${ (props) => props.theme.colors.gray };

  ${ media.lessThan(`xs-max`) } {
    position: static;
    flex-direction: row;
    height: 0;
    width: 100%;
    border-left: none;
    border-top: 1px solid ${ (props) => props.theme.colors.gray };
    margin: 84px 0 114px;
  }
`;

const DividerCircle = styled.div<any>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${DIVIDER_CIRCLE_RADIUS}px;
  height: ${DIVIDER_CIRCLE_RADIUS}px;
  border-radius: 50%;
  border: 2px solid ${(props) => props.color};
  transform: translateX(-50%);
  background-color: ${(props) => props.theme.colors.bgLight};

  ${media.lessThan(`xs-max`)} {
    transform: translateY(-50%);
  }
`;

const DividerColoredText = styled.div<any>`
  color: ${(props) => props.color};
  font-size: 1.5rem;
`;

const DividerSubText = styled.div`
  font-size: 12px;
`;

const ActionCardBodyDivider: React.FC<{
  value: number;
  type: "cr" | "solvency";
  target?: number,
  loanValueUSD?: number,
  collateralValueUSD?: number,
}> & {} = ({ value = 0, target = 1.0, type, collateralValueUSD, loanValueUSD }) => {
  const { t } = useTranslation();
  const [ vigorStore ] = useStore((store) => [ store.vigorStore ]);

  const color = type === `cr` ? getCrColor({ theme, value: value }) : getSolvencyColor({ theme, value, target });
  const formattedText = type === `cr` ? `${formatCR(value)}%` : value.toFixed(2);
  const description = type === `cr` ? t(`user.cr`) : t(`solvency`);
  const tooltip = type === `cr` ? t(`collateralRatio`) : ``;

  return (
    <DividerWrapper>
      { type !== 'cr' ?
          <DividerCircle color={color}>
            <VerticalFlex>
              <DividerColoredText color={color}>{formattedText}</DividerColoredText>
              <DividerSubText data-tip={tooltip}>{description}</DividerSubText>
            </VerticalFlex>
          </DividerCircle>
        :
          <Gauge color={color}
                  loanValueUSD={loanValueUSD || 0}
                  collateralValueUSD={collateralValueUSD || 0}
                  collateralRatioText={formattedText}
                  minCollateralRatio={vigorStore.config.mincollat / 100}
          />
      }
    </DividerWrapper>
  );
};

export default ActionCardBodyDivider;
