import styled from "styled-components";
import React from "react";

const LoadingEllipsis = styled.div<{size:number}>`
  display: inline-block;
  position: relative;
  width: ${ p => p.size }px;
  height: ${ p => p.size }px;
  
  div {
    position: absolute;
    top: ${ p => Math.ceil(((p.size / 10)*4)+1)}px;
    width: ${ p => Math.ceil(p.size / 6.15)}px;
    height: ${ p => Math.ceil(p.size / 6.15)}px;
    border-radius: 50%;
    background: ${ p => p.theme.colors.primaryLighter };
    animation-timing-function: cubic-bezier(0, 1, 1, 0);
  }
  
  div:nth-child(1) {
    left: ${ p => Math.ceil(p.size / 10)}px;
    animation: lds-ellipsis1 0.6s infinite;
  }
  div:nth-child(2) {
    left: ${ p => Math.ceil(p.size / 10)}px;
    animation: lds-ellipsis2 0.6s infinite;
  }
  div:nth-child(3) {
    left: ${ p => Math.ceil((p.size / 10) * 4)}px;
    animation: lds-ellipsis2 0.6s infinite;
  }
  div:nth-child(4) {
    left: ${ p => Math.ceil((p.size / 10) * 7)}px;
    animation: lds-ellipsis3 0.6s infinite;
  }
  
  @keyframes lds-ellipsis1 {
    0% {
      transform: scale(0);
    }
    100% {
      transform: scale(1);
    }
  }
  @keyframes lds-ellipsis3 {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(0);
    }
  }
  @keyframes lds-ellipsis2 {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(${ p => Math.ceil((p.size / 10) * 3)}px, 0);
    }
  }
`;

type Props = {
  size?: number,
}

const LoadingIndicator: React.FC<Props> = props => {
  return (
    <LoadingEllipsis size={props.size || 80}>
      <div/>
      <div/>
      <div/>
      <div/>
    </LoadingEllipsis>
  );
};

export default LoadingIndicator;
