import styled, { css } from "styled-components";
import React from "react";

export const BoxedLabel = styled.label`
  text-align: center;
  padding: 12px 16px;
  color: ${(props) => props.theme.colors.secondary};
  background-color: ${(props) => props.theme.colors.bg};
  width: 125px;
  overflow: hidden;
  text-overflow: ellipsis;
`;
