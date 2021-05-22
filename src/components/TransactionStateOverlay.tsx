import React from "react";
import { useStore } from "../store/use-store";
import Overlay from "./shared/Overlay";
import styled from "styled-components";
import { observer } from "mobx-react";
import LoadingIndicator from "./shared/LoadingIndicator";
import { useTranslation } from "react-i18next";
import { MdErrorOutline, MdCheckCircle } from 'react-icons/md';

const FullscreenOverlay = styled(Overlay)`
    left: 0;
    z-index: 3;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const OverlayText = styled.div`
  margin-bottom: 32px;
  font-size: 18px;
  
  &.success {
    color: ${p => p.theme.colors.success};
  }
  &.error {
    color: ${p => p.theme.colors.error};
  }
`;

const IconAnimation = styled.div`
  animation-name: bounce;
  animation-timing-function: ease;
  animation-duration: 1.25s;
  animation-iteration-count: infinite;
  transform-origin: bottom;
        
  @keyframes bounce {
    0%   { transform: scale(1,1)    translateY(0); }
    10%  { transform: scale(1.1,.9) translateY(0); }
    30%  { transform: scale(.9,1.1) translateY(-16px); }
    50%  { transform: scale(1,1)    translateY(0); }
    100% { transform: scale(1,1)    translateY(0); }
  }
`;

const TransactionStateOverlay: React.FC<{}> = props => {
  const { t } = useTranslation();
  const walletStore = useStore(store => store.walletStore);

  return (
    <React.Fragment>
      { walletStore.transactionState !== 'idle' &&
        <FullscreenOverlay>
          <React.Fragment>
            { walletStore.transactionState === 'waiting' &&
              <React.Fragment>
                <OverlayText>{ t('overlay.waiting') }</OverlayText>
                <LoadingIndicator />
              </React.Fragment>
            }
            { walletStore.transactionState === 'success' &&
              <React.Fragment>
                <OverlayText className={'success'}>{ t('overlay.success') }</OverlayText>
                <IconAnimation>
                  <MdCheckCircle size={75} color={'#4ECCAE'}/>
                </IconAnimation>
              </React.Fragment>
            }
            { walletStore.transactionState === 'error' &&
              <React.Fragment>
                <OverlayText className={'error'}>{ t('overlay.error') }</OverlayText>
                <IconAnimation>
                  <MdErrorOutline size={75} color={'#E14852'}/>
                </IconAnimation>
              </React.Fragment>
            }
          </React.Fragment>
        </FullscreenOverlay>
      }
    </React.Fragment>
  );
};

export default observer(TransactionStateOverlay);
