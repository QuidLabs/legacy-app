import styled from "styled-components";
import React from "react";

const Spinner = styled.div<{size:number}>`
  @keyframes spinner {
    0% {
        transform: translate3d(-50%, -50%, 0) rotate(0deg);
    }
    100% {
         transform: translate3d(-50%, -50%, 0) rotate(360deg);
    }
  }
  
  opacity: 1;
  position: relative;
  transition: opacity linear 0.1s;
  text-align: center;
  font-size: 12px;
  font-family: monospace;

  &::before {
    animation: 1s linear infinite spinner;
    border: solid 3px ${p => p.theme.colors.primary};
    border-bottom-color: ${p => p.theme.colors.primaryLighter};
    border-radius: 50%;
    content: "";
    width: ${ p => p.size }px;
    height: ${ p => p.size }px;
    left: 50%;
    top: 50%;
    opacity: inherit;
    position: absolute;
    transform: translate3d(-50%, -50%, 0);
    transform-origin: center;
    will-change: transform;
  }
`;

type Props = {
  text?: string,
  size?: number,
}

const LoadingSpinner: React.FC<Props> = props => {
  return (
    <Spinner size={props.size || 40}>
      {props.text}
    </Spinner>
  );
};

export default LoadingSpinner;
