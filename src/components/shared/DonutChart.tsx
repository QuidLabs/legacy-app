import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { media } from "../../utils/breakpoints";
import { renderToString } from 'react-dom/server'
import theme from "../../utils/theme";

const Wrapper = styled.div`
  position: relative;
  display: inline-block;
  width: 150px;
  height: 150px;
  transform: translateX(-51%) translateY(-50%);
  
  ${media.lessThan(`sm`)} {
    transform: translateY(-50%);
  }
`;

const InnerTextWrap = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const InnerText = styled.div`
  text-align: center;
`;

const InnerTextLarge = styled.div`
  color: ${p => p.color};
  font-size: 16px;
`;

const InnerTextSmall = styled.div`
  color: #fff;
  font-size: 14px;
`;

const StyledSvg = styled.svg`
  .loan,
  .collateral,
  .liquidation {
    color: #fff;
    fill: #fff;
    font-size: 4px;
    text-shadow: 2px 1px #333;
  }
  
  circle {
    animation: dash 350ms linear forwards;
  }
  
  @keyframes dash {
    from {
      stroke-dasharray: 0;
      stroke-dashoffset: 0;
    }
  }
`;

type Circle = {
  radius: number,
  color: string,
  className: string,
  strokeWidth: number,
  strokeDashArray: number,
  strokeDashOffset: number,
  transform: string,
};

const getPctValues = (loanVal:number, collateralVal:number, minCrRatio:number) => {
  const maxCollateralUsage = Math.ceil(((minCrRatio * 100) - 100));

  const dangerZone = 33;
  const cr = loanVal > 0 && collateralVal > 0 ? 100 - (loanVal/collateralVal * 100) : 100;

  return [
    {
      name: 'collateral',
      val: cr,
    },
    {
      name: 'liquidation',
      val: maxCollateralUsage,
    },
    {
      name: 'danger',
      val: dangerZone - maxCollateralUsage,
    },
    {
      name: 'ok',
      val: 100 - dangerZone,
    },
  ];
}


const ToolTipLegend = styled.div`
  display: block;
`;

const ToolTipLegendItem = styled.div`
  font-size: 12px;
  padding: 2px;
  
  :not(:last-child) {
    margin-bottom: 4px;
  }
`;

const htmlToolTip: React.FC<{}> = () => {
  const { t } = useTranslation();

  return <ToolTipLegend>
              <ToolTipLegendItem style={{backgroundColor: theme.colors.bgLightest }}>{t('user.donut.ratio')}</ToolTipLegendItem>
              <ToolTipLegendItem style={{backgroundColor: theme.colors.success}}>{t('user.donut.ok')}</ToolTipLegendItem>
              <ToolTipLegendItem style={{backgroundColor: theme.colors.warning}}>{t('user.donut.danger')}</ToolTipLegendItem>
              <ToolTipLegendItem style={{backgroundColor: theme.colors.error}}>{t('user.donut.liquidation')}</ToolTipLegendItem>
          </ToolTipLegend>;
};

type Props = {
  color: string;
  minCollateralRatio: number;
  collateralRatioText: string;
  loanValueUSD: number,
  collateralValueUSD: number,
};

const DonutChart: React.FC<Props> = props => {
  const { t } = useTranslation();

  const { collateralRatioText, minCollateralRatio, loanValueUSD, collateralValueUSD, color } = props;

  const startAngle = -90;
  const circlePosX = 50;
  const circlePosY = 50;
  const baseRadius = 30;
  const baseWidth = 2;

  const config = {
    collateral: {
      label: t('user.donut.ratio'),
      width: baseWidth * 3.5,
      radius: baseRadius - 0.5,
      color: theme.colors.bgLightest,
    },
    liquidation: {
      label: t('user.donut.liquidation'),
      width: baseWidth * 2,
      radius: baseRadius + 1,
      color: theme.colors.error,
    },
    danger: {
      label: t('user.donut.danger'),
      width: baseWidth,
      radius: baseRadius + 2,
      color: theme.colors.warning,
    },
    ok: {
      label: t('user.donut.ok'),
      width: baseWidth - 0.75,
      radius: baseRadius + 2.385,
      color: theme.colors.success,
    },
  };

  const getSegmentData = (loanVal:number, collateralVal:number, minCrRatio:number, segmentConfig:any): Circle[] => {
    let filledPct = 0;

    const fillValues = getPctValues(loanVal, collateralVal, minCrRatio);

    return fillValues.map((fillVal, index) => {
      const segment = segmentConfig[fillVal.name];
      const dashArray = 2*Math.PI*segment.radius;
      const angle = fillVal.name === 'collateral' ? startAngle : (filledPct * 360 / 100) + startAngle;

      let transformString = `rotate(${angle || 0} 0 0) scale(1, -1)`;

      if (fillVal.name === 'danger' || fillVal.name === 'liquidation' || fillVal.name === 'ok') {
        filledPct += fillVal.val;
      }

      if (fillVal.name === 'danger') {
        transformString = 'rotate(-133 0 0) scale(1, -1)';
      }

      if (fillVal.name === 'ok') {
        transformString = 'rotate(-208.6 0 0) scale(1, -1)';
      }

      const dashOffset = dashArray - dashArray * fillVal.val / 100;
      return {
        radius: segment.radius,
        color: segment.color,
        className: fillVal.name,
        strokeWidth: segment.width,
        strokeDashArray: dashArray,
        strokeDashOffset: dashOffset || 0,
        transform: transformString,
      };
    });
  };

  const [ segments, setSegments ] = useState<Circle[]>(getSegmentData(loanValueUSD, collateralValueUSD, minCollateralRatio, config));

  useEffect(() => {
    setSegments(getSegmentData(loanValueUSD, collateralValueUSD, minCollateralRatio, config));
  }, [ collateralValueUSD, loanValueUSD ])

  return (
    // @ts-ignore
    <Wrapper data-tip={renderToString(htmlToolTip())} data-html={true}>
      <InnerTextWrap>
        <InnerText>
          <InnerTextLarge color={color}>{collateralRatioText}</InnerTextLarge>
          <InnerTextSmall>{ t('user.cr') }</InnerTextSmall>
        </InnerText>
      </InnerTextWrap>
      <StyledSvg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        {/* backdrop */}
        <circle r={baseRadius + 6} cx={circlePosX} cy={circlePosY} fill={ theme.colors.bgLight }/>
        {/* inner static circle */}
        <circle strokeWidth={baseWidth + 5} r={baseRadius - 0.6} cx={circlePosX} cy={circlePosY} fill={"transparent" } stroke={ theme.colors.bg }/>
        {/* inner static circle borders */}
        {/*<circle strokeWidth={baseWidth - 1} r={baseRadius + 3.5} cx={circlePosX} cy={circlePosY} fill={"transparent" } stroke={ theme.colors.bgLightest }/>*/}
        {/*<circle strokeWidth={baseWidth - 1} r={baseRadius - 3.5} cx={circlePosX} cy={circlePosY} fill={"transparent" } stroke={ theme.colors.bgLightest }/>*/}
        {/* segments */}
        { segments && segments.map((segment:Circle, index:number) => {
          return (
            <circle key={index}
                    r={segment.radius}
                    cx={circlePosX}
                    cy={circlePosY}
                    fill={"transparent"}
                    stroke={segment.color}
                    strokeWidth={segment.strokeWidth}
                    strokeDasharray={segment.strokeDashArray}
                    strokeDashoffset={segment.strokeDashOffset}
                    transform={segment.transform}
                    transform-origin="center"
            />
          );
        })}


      </StyledSvg>
    </Wrapper>
  );
};

export default DonutChart;
