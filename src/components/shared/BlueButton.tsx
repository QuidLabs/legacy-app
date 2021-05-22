import styled, { css } from "styled-components";
import React from "react";
import LocalizedLink from "../LocalizedLink";
import { ColorVariantProps, variant2Color, variant2ColorInverted } from "./color-props";

export const BlueButtonStyles = css<any>`
  font-size: 14px;
  line-height: 18px;
  font-weight: bold;
  text-align: center;
  height: 40px;
  padding: 11px 30px;
  margin: ${(props) => (props as any).margin || "0"};
  width: ${(props) => ((props as any).fullWidth ? "100%" : "initial")};
  border-radius: ${p => p.theme.borderRadius};
  color: ${variant2ColorInverted};

  background-color: ${variant2Color};
  cursor: pointer;

  &:hover {
    background-color: ${(props) => props.colorVariant === `secondary`
      ? props.theme.colors.secondaryLighter
      : props.theme.colors.primaryLighter
    };
  }

  &:disabled {
      background-color: #4c5169;
      cursor: not-allowed;
      color: ${p => p.theme.colors.bg};
      
      &:hover {
        background-color: #4c5169;
      }
  }
`;

const BlueButtonButton = styled.button<any>`
  ${BlueButtonStyles}
`;
const BlueButtonAnchor = styled.a`
  ${BlueButtonStyles}
`;

type BlueButtonProps = {
  as?: "a" | "button" | "localizedLink";
  margin?: string;
  fullWidth?: boolean;
  to?: string;
} & Partial<ColorVariantProps>;
export const BlueButton: React.FC<
  BlueButtonProps &
    React.HTMLProps<HTMLButtonElement> &
    React.HTMLProps<HTMLAnchorElement>
> = ({ as, ...otherProps }) => {
  if (as === "a") return <BlueButtonAnchor {...(otherProps as any)} />;
  else if (as === `localizedLink`) {
    return <LocalizedLink css={BlueButtonStyles} {...(otherProps as any)} />;
  }

  return <BlueButtonButton {...(otherProps as any)} />;
};
