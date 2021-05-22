import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import theme from "../../utils/theme";
import { renderToString } from "react-dom/server";
import styled, { css, keyframes } from "styled-components";
import { media } from "../../utils/breakpoints";

const Wrapper = styled.div`
  position: absolute;
  width: 110px;
  height: 180px;
  transform: translateX(-51%);
  top: 100px;
  
  ${media.lessThan('md')} {
    top: -20px;
  } 
  
  ${media.lessThan(`xs-max`)} {
    position: relative;
    top: initial;
    transform: translateY(-50%);
  }
`;

const InnerTextWrap = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-end;
`;

const InnerText = styled.div`
  text-align: center;
  background: ${p => p.theme.colors.bgLight};
  z-index: 1;
`;

const InnerTextLarge = styled.div`
  color: ${p => p.color};
  font-size: 16px;
`;

const InnerTextSmall = styled.div`
  color: #fff;
  font-size: 14px;
`;

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

const rotateArrow = (rotation:number) => keyframes`
  100% {
    transform: rotate(${rotation}deg);
  }
`;

const Path = styled.path<{ rotation:number }>`
  animation: ${props => rotateArrow(props.rotation)} 1.25s linear forwards;
`;

const StyledSvg = styled.svg`
  .circle__valueFill {
    animation: dash 1.25s linear forwards; 
  }
  
  @keyframes dash { 
    to {
      stroke-dashoffset: 0;
    }
  }
`;

const htmlToolTip: React.FC<{}> = () => {
  const { t } = useTranslation();

  return <ToolTipLegend>
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

const config = {
  baseWidth: 6,
  baseRadius: 50,
  bottomCutout: 120,
  tickDivision: 10,
};

function getDashArrayWithCutout(radius:number) {
  const circumference = 2*Math.PI*radius;
  return [ circumference / (config.bottomCutout / 100), circumference ];
}

function getColor(value:number, segmentValues:{liquidation:number, warning: number, danger:number}) {
  if (value <= segmentValues.liquidation) {
    return theme.colors.error;
  }

  if (value <= segmentValues.danger) {
    return theme.colors.danger;
  }

  if (value <= segmentValues.warning) {
    return theme.colors.warning;
  }

  return theme.colors.primary;
}

function circleBaseAttributes(radius:number, width:number, size:number, fillColor:string, strokeColor:string) {
  return {
    r: radius,
    strokeWidth: width,
    cx: size,
    cy: size,
    fill: fillColor,
    stroke: strokeColor,
  };
}

function createValueCircleFill(radius:number, width:number, fillPercent:number, fillColor:string, withRoundedCaps:boolean=true) {
  const containedRadius = radius - (width / 2);
  const dashArrayWithCutout = getDashArrayWithCutout(containedRadius);
  const filled = fillPercent || 0;
  dashArrayWithCutout[0] = dashArrayWithCutout[0] * filled;

  return (
    <circle {...circleBaseAttributes(containedRadius, width, config.baseRadius, 'transparent', fillColor)}
            strokeDasharray={dashArrayWithCutout.join(',')}
            strokeDashoffset={(360 - config.bottomCutout) * filled}
            strokeLinecap={ withRoundedCaps ? 'round' : 'inherit' }
            className='circle__valueFill'
    />
  )
}

function createValueCircleBackground() {
  const containedRadius = config.baseRadius - (config.baseWidth / 2);

  return (
    <circle {...circleBaseAttributes(containedRadius, config.baseWidth, config.baseRadius, 'transparent', theme.colors.bgLighter)}
            strokeDasharray={getDashArrayWithCutout(containedRadius).join(',')}
            strokeLinecap={ 'round' }
    />
  )
}

function createPointMarkerTemplate() {
  return (
    <line id='tick'
          stroke={theme.colors.light}
          strokeWidth='.85'
          strokeLinecap='round'
          x1='88.5'
          y1={config.baseRadius}
          x2='84.5'
          y2={config.baseRadius}
    />
  )
}

function createPointMarkers() {
  const maxRotation = 360 - (config.bottomCutout / 2); // points to max; respecting cutout
  const rotationIncrement = maxRotation / config.tickDivision;

  const markers = [];

  for (let i = 0; i <= maxRotation; i += rotationIncrement) {
    markers.push(<use key={i} href="#tick" transform={`rotate(${i} ${config.baseRadius} ${config.baseRadius})`} />);
  }

  return (<g>{ markers }</g>);
}

function createNeedleArrow(anchorPoint:number, rotation:number, color:string) {
  return (<Path rotation={rotation}  fill={color} d={`M 0 ${anchorPoint} L ${config.baseRadius / 1.25} 0 L 0 -${anchorPoint} Z`} />);
}

function createNeedleCenter(radius:number, width:number, color:string) {
  return (
    <circle {...circleBaseAttributes(radius, width, 0, theme.colors.bgLight, color)}/>
  );
}

function createNeedleIndicator(fillPercent:number, fillColor:string) {
  const centerRadius = config.baseWidth / 1.5;
  const centerWidth = config.baseWidth / 2;

  const needleCenter = createNeedleCenter(centerRadius, centerWidth, fillColor);

  const maxRotation = 360 - (config.bottomCutout / 2); // points to max
  const needleArrow = createNeedleArrow((centerRadius + centerWidth / 2), maxRotation * fillPercent, fillColor);

  return (
    <g transform={`translate(${config.baseRadius}, ${config.baseRadius}) scale(0.85)`}>
      { needleArrow }
      { needleCenter }
    </g>
  );
}


function createInnerSegments() {
  const okSegment = createValueCircleFill(config.baseRadius - config.baseWidth - 2.55, 2, 1, theme.colors.success, true);
  const warningSegment = createValueCircleFill(config.baseRadius - config.baseWidth - 2.55, 2, 0.33, theme.colors.warning, true);
  const dangerSegment = createValueCircleFill(config.baseRadius - config.baseWidth - 2.55, 2, 0.25, theme.colors.danger, true);
  const liquidationSegment = createValueCircleFill(config.baseRadius - config.baseWidth - 2.55, 2, 0.10, theme.colors.error, true);

  return (
    <g>
      { okSegment }
      { warningSegment }
      { dangerSegment }
      { liquidationSegment }
    </g>
  );
}

const Gauge: React.FC<Props> = props => {
  const { t } = useTranslation();

  const { collateralRatioText, minCollateralRatio, loanValueUSD, collateralValueUSD, color } = props;

  const segmentValues = {
    liquidation: minCollateralRatio * 100,
    danger: 130,
    warning: 150,
  };

  const [ fillPercent, setFillPercent ] = useState(1);
  const [ fillColor, setFillColor ] = useState('');

  useEffect(() => {
    const currentCr = loanValueUSD > 0 && collateralValueUSD > 0 ? 100 - (loanValueUSD/collateralValueUSD * 100) : 0;
    setFillPercent(currentCr > 0 ? currentCr / 100 : 1);
    setFillColor(getColor((collateralValueUSD/loanValueUSD) * 100, segmentValues));
  }, [ loanValueUSD, collateralValueUSD ]);

  return (
    // @ts-ignore
    <Wrapper data-tip={renderToString(htmlToolTip())} data-html={true}>
      <InnerTextWrap>
        <InnerText>
          <InnerTextLarge color={color}>{collateralRatioText}</InnerTextLarge>
          <InnerTextSmall>{ t('user.cr') }</InnerTextSmall>
        </InnerText>
      </InnerTextWrap>
      <StyledSvg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        // transform={`rotate(${config.bottomCutout}deg)`}
        style={{transform: "rotate(120deg)"}}
      >
        <defs>
          { createPointMarkerTemplate() }
        </defs>
        {/* backdrop */}
        <circle r={config.baseRadius + 2} cx={config.baseRadius} cy={config.baseRadius} fill={ theme.colors.bgLight }/>

        { createValueCircleBackground() }
        { createPointMarkers() }
        { createInnerSegments() }

        { (loanValueUSD > 0 || collateralValueUSD > 0) &&
          <React.Fragment>
            { createValueCircleFill(config.baseRadius, config.baseWidth, fillPercent, fillColor) }
            { createNeedleIndicator(fillPercent, fillColor)}
          </React.Fragment>
        }
      </StyledSvg>
    </Wrapper>
  );
};

export default Gauge;
