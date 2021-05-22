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
  margin-bottom: 24px;
  font-size: 16px;
  line-height: 1.4;
`;

type Props = {
  modal: ModalItem;
};

const ConfirmationModal = ({ modal }: Props) => {
  const { title, body } = modal.data;

  const { t } = useTranslation();

  return (
    <Modal
      size={'md'}
      title={<div>{title}</div>}
      footer={
        <ButtonWrap>
          <RedButton onClick={modal.cancel}>{t("cancel")}</RedButton>
          <GreenButton
            onClick={async () => {
              modal.submit({});
            }}
          >
            {t("confirm")}
          </GreenButton>
        </ButtonWrap>
      }
    >
      <Message>{body}</Message>
    </Modal>
  );
};

export default ConfirmationModal;
