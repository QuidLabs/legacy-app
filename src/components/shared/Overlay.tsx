import styled from "styled-components";
import React from "react";
import { TFunction } from "i18next";

const OverlayWrap = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 1;
`;

const OverlayBackdrop = styled.div<{opacity: number}>`
  width: 100%;
  height: 100%;
  position: absolute;
  opacity: ${p => p.opacity}%;
  background: #000;
  pointer-events: none;
`;

const OverlayContentWrap = styled.div`
  z-index: 1;
  text-align: center;
`;

type Props = {
  children?: React.ReactElement,
  className?: string,
  onClick?: TFunction,
  opacity?: number,
}

const Overlay: React.FC<Props> = props => {
  return (
    <OverlayWrap className={props.className} onClick={props.onClick}>
      <OverlayBackdrop opacity={props.opacity || 75}/>
      <OverlayContentWrap>{ props.children }</OverlayContentWrap>
    </OverlayWrap>
  );
};

export default Overlay;
