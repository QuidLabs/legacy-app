import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useStore } from "../../store/use-store";
import { observer } from "mobx-react";
import { MODAL_TYPES } from "../../store/modal";

const Wrap = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
`;

const Button = styled.button`
  font-size: 12px;
  line-height: 10px;
  text-align: center;
  padding: 9px 12px;
  border-radius: ${p => p.theme.borderRadius};
  cursor: pointer;
  border: 1px solid ${p => p.theme.colors.error};
  color: ${p => p.theme.colors.error};
  
  &:hover {
    background-color: ${p => p.theme.colors.error};
    color: ${p => p.theme.colors.white};
  }
  
  &:disabled {
    border-color: ${p => p.theme.colors.bgLightest};
    background-color: ${p => p.theme.colors.bg};
    cursor: not-allowed;
    color: ${p => p.theme.colors.bgLightest};
  }
`;

type Props = {
  action: 'liquidate' | 'liquidateup';
  isActive: boolean;
}

const LiquidateButton: React.FC<Props> = props => {
  const { action, isActive } = props;
  const { t } = useTranslation();

  const [walletStore, vigorStore, modalStore] = useStore((store) => [ store.walletStore, store.vigorStore, store.modalStore ]);

  const [ feePercentage, setFeePercentage ] = useState(0);

  useEffect(() => {
    if(action === 'liquidate') {
      setFeePercentage(vigorStore.config.bailoutcr - 100);
    } else {
      setFeePercentage(vigorStore.config.bailoutupcr - 100);
    }
  }, [action])

  const handleLiquidate = async () => {
    const response = await modalStore.openModal(
      MODAL_TYPES.CONFIRM,
      {
        title: 'Warning!',
        body: <div>You are about to liquidate this loan. This will incur a <strong>{feePercentage}%</strong> fee!
                <br/><br/>You will need to withdraw your lending/insurances before proceeding.
                <br/><br/>Are you sure you want to do this?
              </div>
      }
    );

    if (response.canceled) {
      return;
    }

    await walletStore.liquidate(action);
  };

  return (
    <Wrap>
      {/*  // @todo: trigger confirmation modal with explanation / requirements */}
      <Button onClick={handleLiquidate} disabled={!isActive}>
        { t('user.liquidate.button') }
      </Button>
    </Wrap>
  );
};

export default observer(LiquidateButton);
