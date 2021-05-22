import styled, { css } from "styled-components";
import React from "react";

const Wrapper = styled.button`
  &:focus,  &:hover {
    filter: brightness(0.6);
  }
  &:active {
    filter: brightness(0.8);
  }
`;

type Props = {};
export const IconButton: React.FC<
  Props & React.HTMLProps<HTMLButtonElement>
> = (props) => {
  const {...otherProps} = props;
  return <Wrapper {...(otherProps as any)} />
};
