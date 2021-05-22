import React from "react";
import styled from "styled-components";
import { ModalItem } from "../../store/modal";
import Modal, {
  ButtonWrap,
  GreenButton,
  RedButton,
} from "./ModalBase";
import { useTranslation } from "react-i18next";

const Message = styled.div`
  font-size: 16px;
  line-height: 1.4;
`;

const MessageRow = styled.div`
  :not(:last-child) {
    margin-bottom: 16px;
  }
`;

const MessageRowValue = styled.div`
  font-weight: 600;
`;

type Props = {
  modal: ModalItem;
};

const VigFeeBorrowConfirmationModal = ({ modal }: Props) => {
  const { t } = useTranslation();

  const { initialVigFees, vigFeesBalance } = modal.data;

  return (
    <Modal
      title={<div>{t`modal.vigFeeBorrowConfirmation.title`}</div>}
      footer={
        <ButtonWrap>
          <GreenButton
            onClick={async () => {
              modal.submit({});
            }}
          >
            {t('modal.vigFeeBorrowConfirmation.confirm')}
          </GreenButton>
          <RedButton onClick={modal.cancel}>{t("cancel")}</RedButton>
        </ButtonWrap>
      }
    >
      <Message>
        <MessageRow>
          <div>{ t(`modal.vigFeeBorrowConfirmation.agreeInitial`, { initialVig: initialVigFees }) }</div>
        </MessageRow>
        <MessageRow>
          { t`modal.vigFeeBorrowConfirmation.yourBalance` }
          <MessageRowValue>
            { vigFeesBalance }
          </MessageRowValue>
        </MessageRow>
      </Message>
    </Modal>
  );
};

export default VigFeeBorrowConfirmationModal;
