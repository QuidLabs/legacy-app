import styled from "styled-components";
import React from "react";

const Title = styled.div`
  margin-bottom: 4px;
`;

const EllipsedLink = styled.a`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 285px;
    font-size: 14px;
    font-weight: 400;
    display: block;
`;

type Props = {
  title?: string,
  url: string,
};

const ToastTransactionSuccess: React.FC<Props> = props => {
  return (
    <div>
      <Title>{ props.title ? props.title : 'Transaction sent!' }</Title>
      <EllipsedLink href={props.url} target='_blank' rel='noopener'>{props.url}</EllipsedLink>
    </div>
  );
};

export default ToastTransactionSuccess;
