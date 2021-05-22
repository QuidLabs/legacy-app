import styled from "styled-components";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react";
import Modal, {
  GreenButton,
  ModalTitle,
} from "./ModalBase";
import { ModalItem } from "../../store/modal";
import { HorizontalFlex } from "../shared";
import { useStore } from "../../store/use-store";

const ContentItems = styled.ol`
  margin-top: 16px;

  li {
    margin-top: 8px;
  }
`;
const Note = styled.p`
  margin-top: 16px;

  font-size: 14px;
`;

type Props = {
  modal: ModalItem;
};
const TermsAndConditionsModal: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [ vigorStore] = useStore(store => [ store.vigorStore]);

  return (
    <Modal
      size="md"
      title={<ModalTitle>{t("modal.disclaimer.title")}</ModalTitle>}
      bodyRef={ref}
      footer={
        <HorizontalFlex>
          <GreenButton
            onClick={async () => {
              props.modal.submit({});
            }}
          >
            {t("modal.disclaimer.submitButton")}
          </GreenButton>
        </HorizontalFlex>
      }
    >
      <React.Fragment>
        <ContentItems>
          {Array.from({ length: 6 }, (_, index) => index + 1).map((itemId) => (
            <li key={itemId}>{t(`modal.disclaimer.item${itemId}`, {
              bailoutCr: vigorStore.config.bailoutcr,
              fee: vigorStore.config.bailoutcr - 100
            })}</li>
          ))}
        </ContentItems>
        <Note>{t(`modal.disclaimer.note`)}</Note>
      </React.Fragment>
    </Modal>
  );
};

export default observer(TermsAndConditionsModal);
