import React from "react";
import styled from "styled-components";
import { ModalItem } from "../../store/modal";
import Modal, {
  ButtonWrap,
  GreenButton,
  RedButton,
  ModalTitle,
} from "./ModalBase";
import { useTranslation } from "react-i18next";
import { HorizontalFlex, VerticalFlex } from '../shared';
import ActionCard from '../user/ActionCard';
import { InsuranceSavingsBlock, VigorFeesBlock } from '../user/InteractionBlock';
import { observer } from 'mobx-react';
import AssetTable from '../shared/AssetTable';
import { useStore } from '../../store/use-store';

type ModalProps = {
  // defaultAmount: TAsset;
  // maxAmount: TAsset;
}
type Props = {
  modal: ModalItem<ModalProps>;
};

const DepositWithdrawFeesModal = ({ modal }: Props) => {
  const [vigorStore ] = useStore((store) => [
    store.vigorStore,
  ]);

  const { t } = useTranslation();

  return (
    <Modal
      title={<ModalTitle>{t('modal.depositWithdrawFees.title')}</ModalTitle>}
      footer={
        <ButtonWrap>
          <RedButton onClick={modal.cancel}>{t("cancel")}</RedButton>
          <GreenButton
            onClick={async () => {
              modal.submit({});
            }}
          >
            {t("done")}
          </GreenButton>
        </ButtonWrap>
      }
    >
      <HorizontalFlex margin={"0 0 8px 0"}>
        <ActionCard colorVariant="primary" id="feesBox">
          <ActionCard.Body>
            <ActionCard.Body.Block>
              <VerticalFlex>
                <ActionCard.Body.EndBlock>
                  <VigorFeesBlock colorVariant="primary" />
                </ActionCard.Body.EndBlock>
                <AssetTable
                  tokens={{ VIG: vigorStore.userFeesBalance }}
                  tokensInUsd={{ VIG: vigorStore.userFeesBalanceInUsd || 0 }}
                  totalValueInUsd={vigorStore.userFeesBalanceInUsd || 0}
                  colorVariant="primary"
                />
              </VerticalFlex>
            </ActionCard.Body.Block>
          </ActionCard.Body>
        </ActionCard>
      </HorizontalFlex>
    </Modal>
  );
};

export default observer(DepositWithdrawFeesModal);
