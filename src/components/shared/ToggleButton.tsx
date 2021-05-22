import styled, { css } from "styled-components";
import React from "react";
import LocalizedLink from "../LocalizedLink";
import {
  ColorVariantProps,
  variant2Color,
  variant2ColorInverted,
} from "./color-props";
import { HorizontalFlex } from "./helpers";

const Button = styled.button<any>`
  width: 100%;
  padding: 11px 30px;
  background-color: ${(props) =>
    props.active ? variant2Color(props) : props.theme.colors.bgLighter};
  color: ${(props) =>
    props.active ? variant2ColorInverted(props) : variant2Color(props)};
  white-space: nowrap;

  border: 1px solid ${variant2Color};
  &:first-of-type {
    border-radius: 4px 0 0 0;
  }

  &:last-of-type {
    border-radius: 0 4px 0 0;
  }

  &:focus {
    outline: none;
  }
`;

type Props = {
  texts: string[];
  values: string[];
  activeValue: string;
  onChange: (value: string) => any;
  width?: any;
};
export const ToggleButton: React.FC<Props & ColorVariantProps> = ({
  texts,
  values,
  activeValue,
  onChange,
  colorVariant,
  ...wrapperProps
}) => {
  const handleClick = (event: any) => {
    if (event.target.name === activeValue) return;

    onChange(event.target.name);
  };

  return (
    <HorizontalFlex margin="12px 0 0 0" {...wrapperProps}>
      {values.map((_, index) => (
        <Button
          key={index}
          type="button"
          name={values[index]}
          active={activeValue === values[index]}
          onClick={handleClick}
          colorVariant={colorVariant}
        >
          {texts[index]}
        </Button>
      ))}
    </HorizontalFlex>
  );
};
