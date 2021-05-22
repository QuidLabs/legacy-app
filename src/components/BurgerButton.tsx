import React from "react";
import styled from "styled-components";

const BurgerButtonWrap = styled.div<any>`
  z-index: 4;
  height: 24px;  
  width: 24px;
  position: relative;
  transform: rotate(0deg);
  cursor: pointer;
  flex-shrink: 0;
  margin-left: 16px;
  top: 8px;
  
  span {
    display: block;
    position: absolute;
    height: 2px;
    width: 100%;
    background: ${props => props.theme.colors.white};
    border-radius: 10px;
    opacity: 1;
    left: 0;
    transform: rotate(0deg);
    transition: .25s ease-in-out;
    
    &:nth-child(1) {
      top: 0;
    }
    
    &:nth-child(2),
    &:nth-child(3) {
      top: 9px;
    }
    
    &:nth-child(4) {
      top: 18px;
    }
    
    ${props => props.isOpen && `
      &:nth-child(1) {
        top: 18px;
        width: 0%;
        left: 50%;
      }
      
      &:nth-child(2) {
        transform: rotate(45deg);
      }
      
      &:nth-child(3) {
        transform: rotate(-45deg);
      }
      
      &:nth-child(4) {
        top: 18px;
        width: 0%;
        left: 50%;
      }
    `}
  }
`;

type Props = {
  open: React.ComponentState,
  setOpen: React.ComponentState,
}

const BurgerButton: React.FC<Props> = props => {
  return (
    <BurgerButtonWrap
      onClick={() => props.setOpen(!props.open)}
      isOpen={props.open}
    >
      <span/>
      <span/>
      <span/>
      <span/>
    </BurgerButtonWrap>
  );
};

export default BurgerButton;
