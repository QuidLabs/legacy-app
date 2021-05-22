import React from "react";
import styled from "styled-components";
import Overlay from "../shared/Overlay";
import { observer } from "mobx-react";
import { media } from "../../utils/breakpoints";

export const ButtonWrap = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
`;

export const ModalButton = styled.button`
  padding: 8px 16px;
  border-radius: ${(p) => p.theme.borderRadius};
`;

export const GreenButton = styled(ModalButton)`
  color: ${(p) => p.theme.colors.bg};
  background-color: ${(p) => p.theme.colors.secondary};

  &:disabled {
    background-color: ${(p) => p.theme.colors.light};
    cursor: not-allowed;
  }
`;

export const RedButton = styled(ModalButton)`
  background-color: ${(p) => p.theme.colors.error};
`;

export const CheckboxContainer = styled.div`
  padding-top: 8px;
`;

const FullscreenOverlay = styled(Overlay)`
  left: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ModalWrap = styled.div`
  text-align: left;
  background: ${(p) => p.theme.colors.bg};
  border-radius: ${(p) => p.theme.borderRadius2x};
  box-shadow: 0 3px 7px rgba(0, 0, 0, 0.3);
  padding: 16px 32px 32px 32px;
`;

export const ModalTitle = styled.div`
  font-size: 1.8rem;
  text-align: center;
`;
const ModalTitleWrapper = styled.div`
  margin-bottom: 16px;
`;

const ModalBody = styled.div<{ size: string }>`
  overflow-x: hidden;
  margin: 16px 0 32px 0;
  padding: 0 8px;
  
  width: ${(p) => (p.size === `md` ? `640px` : 'initial')};
  
  ${media.lessThan(`sm`)} {
    ${p => p.size === 'md' && `
        width: 87vw;
    `}
  }

  ${(p) => p.size === 'md' && `
    font-weight: 400;
    font-size: 14px;
     max-height: 18rem;
  `}
  
  overscroll-behavior: contain;
  /* For firefox: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Scrollbars */
  scrollbar-color: ${(p) => `${p.theme.colors.bg} ${p.theme.colors.white}`};
  scrollbar-width: thin;
  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: ${(p) => p.theme.colors.bgLight};
  }

  &::-webkit-scrollbar-thumb {
    background: ${(p) => p.theme.colors.bgLightest};
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${(p) => p.theme.colors.bgLighter};
  }
`;

const ModalFooter = styled.div``;

type Props = {
  title: React.ReactElement;
  bodyRef?: React.Ref<any>;
  footer?: React.ReactElement;
  size?: "md" | "xlg";
};

const Modal: React.FC<Props> = (props) => {
  const modalSize = props.size || "xlg";
  return (
    <FullscreenOverlay opacity={85}>
      <ModalWrap>
        <div>
          <ModalTitleWrapper>{props.title}</ModalTitleWrapper>
          <ModalBody size={modalSize} ref={props.bodyRef}>
            {props.children}
          </ModalBody>
          <ModalFooter>{props.footer}</ModalFooter>
        </div>
      </ModalWrap>
    </FullscreenOverlay>
  );
};

export default observer(Modal);
