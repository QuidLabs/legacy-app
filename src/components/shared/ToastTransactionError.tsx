import styled from "styled-components";
import React from "react";

type Props = {
  title: string,
  text: string,
};

const Title = styled.div`
  margin-bottom: 4px;
`;

const Text = styled.div`
  font-weight: 400;
  font-size: 14px;
`;

const ToastTransactionError: React.FC<Props> = props => {
  return (
    <div>
      <Title>{ props.title }</Title>
      <Text>{ props.text }</Text>
    </div>
  );
};

export default ToastTransactionError;
