import React from "react";
import styled from "styled-components";
import { HorizontalFlex } from ".";
import { ColorVariantProps, variant2Color } from "./color-props";

export const AssetInfoName = styled.div<any>`
  font-size: ${p => (p.small ? `1rem` : `1.1rem`)};
  color: ${p => p.theme.colors.gray};
  text-transform: uppercase;
  text-align: right;
  margin-right: 8px;
`;

export const AssetInfoValue = styled.div<any>`
  font-size: ${p => (p.small ? `1.1rem` : `1.2rem`)};
  text-align: left;
  color: ${variant2Color};
`;

export const AssetInfo: React.FC<{
  name: string;
  value: string;
  small?: boolean;
} & ColorVariantProps> = ({ name, value, small, colorVariant }) => {
  return (
    <HorizontalFlex justifyContent="space-between" margin="0 0 16px 0">
      {name ? <AssetInfoName small={small}>{name}</AssetInfoName> : null}
      <AssetInfoValue small={small} colorVariant={colorVariant}>
        {value}
      </AssetInfoValue>
    </HorizontalFlex>
  );
};
