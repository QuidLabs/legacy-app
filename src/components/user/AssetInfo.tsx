import React from "react";
import styled from "styled-components";
import { media } from "../../utils/breakpoints";
import { ColorVariantProps, variant2Color } from "../shared/color-props";
import { HorizontalFlex } from "../shared";

// @ts-ignore
const RowWrapper = styled(HorizontalFlex)<any>`
  margin: 8px 0;

  & > div:first-child {
    font-size: 16px;
    margin-right: 8px;
  }
  & > div:last-child {
    text-align: right;
    font-size: 16px;
    color: ${variant2Color};
  }
`;

const Value = styled.div`
  flex-shrink: 0;
`;

export const AssetInfoRow: React.FC<{description: React.ReactNode, value: React.ReactNode} & ColorVariantProps>= (props) => {
  const { description, value, colorVariant, ...otherProps } = props;

  return (
    <RowWrapper colorVariant={colorVariant} {...otherProps}>
      <div>{description}</div>
      <Value>{value}</Value>
    </RowWrapper>
  );
};


export const AssetInfo = styled.div<any>`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 0 64px;
  
  ${media.lessThan('lg')} {
    padding: 0 32px;
  }
  
  ${media.lessThan('md')} {
    padding: 0 16px;
  }
  
  ${media.lessThan('smd')} {
    padding: 0;
  }
  
  ${media.lessThan('sm')} {
    padding: 0 32px;
  }

  ${media.lessThan('xs')} {
    padding: 0;
  }
`;

const ValueInfoWrapper = styled(HorizontalFlex)`
  justify-content: center;
  margin: 8px 0;
`;

const ValueInfoDescription = styled.div`
    font-size: 22px;
    margin: 0 8px 0 0;
`;

const ValueInfoValue = styled.div<any>`
    text-align: right;
    font-weight: 700;
    font-size: 22px;
    color: ${variant2Color};
`;

export const ValueInfo: React.FC<{description: React.ReactNode, value: React.ReactNode} & ColorVariantProps>= (props) => {
  const { description, value, colorVariant } = props;

  return (
    <ValueInfoWrapper>
      <ValueInfoDescription>{description}</ValueInfoDescription>
      <ValueInfoValue colorVariant={colorVariant}>{value}</ValueInfoValue>
    </ValueInfoWrapper>
  );
};
