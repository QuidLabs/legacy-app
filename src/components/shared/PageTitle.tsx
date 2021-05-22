import styled from "styled-components";
import React from "react";

const Header = styled.h2`
  font-size: 2rem;
  margin: 32px 0 16px 0;
`;
const Subheader = styled.h2`
  font-size: 1.6rem;
  margin: 0 0 48px 0;
`;

export const PageTitle: React.FC<{}> = props => {
  return (
    <Header>{ props.children }</Header>
  );
};

export const PageSubtitle: React.FC<{}> = props => {
  return (
    <Subheader>{ props.children }</Subheader>
  );
};

