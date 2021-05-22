import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const Description = styled.div`
  font-size: 0.9rem;
  margin-top: 8px;
`;
const Value = styled.div`
  color: ${p => p.theme.colors.secondary};
  font-size: 1.2rem;
`;
const SecondaryValue = styled.div`
  color: ${p => p.theme.colors.gray};
  font-size: 0.9rem;
`;

type Props = {
  description: React.ReactNode;
  value: React.ReactNode;
  secondaryValue?: React.ReactNode;
  tooltip: React.ReactNode;
};
const Stats: React.FC<Props> = props => {
  const { tooltip, description, value, secondaryValue } = props;
  return (
    <Wrapper data-tip={ tooltip }>
      <Value>{value}</Value>
      <SecondaryValue>{secondaryValue}</SecondaryValue>
      <Description>{description}</Description>
    </Wrapper>
  );
};

export default Stats;
