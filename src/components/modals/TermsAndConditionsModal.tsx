import styled from "styled-components";
import React, { useRef, useState } from "react";
import Checkbox from "../shared/Checkbox";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react";
import Modal, {
  CheckboxContainer,
  ButtonWrap,
  GreenButton,
  RedButton,
  ModalTitle,
} from "./ModalBase";
import { ModalItem } from "../../store/modal";
import { withPrefix } from "gatsby";

const ModalContentLinkListTitle = styled.div`

`;

const ModalContentLinkList = styled.ul`
  margin-top: 16px;

  li {
    margin-top: 8px;
  }
`;

type Props = {
  modal: ModalItem;
};
const TermsAndConditionsModal: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  const [agreeToTCs, setAgreeToTCs] = useState(false);
  const [agreeToPP, setAgreeToPP] = useState(false);

  return (
    <Modal
      size={'md'}
      title={<ModalTitle>{t("modal.termsAndConditions.title")}</ModalTitle>}
      bodyRef={ref}
      footer={
        <React.Fragment>
          <CheckboxContainer>
            <Checkbox
              label={t("modal.termsAndConditions.checkbox_readAndAgreedToTCs")}
              checked={agreeToTCs}
              onClick={() => setAgreeToTCs(!agreeToTCs)}
            />
          </CheckboxContainer>
          <CheckboxContainer>
            <Checkbox
              label={t("modal.termsAndConditions.checkbox_readAndAgreedToPP")}
              checked={agreeToPP}
              onClick={() => setAgreeToPP(!agreeToPP)}
            />
          </CheckboxContainer>
          <ButtonWrap>
            <GreenButton
              onClick={async () => {
                props.modal.submit({});
              }}
              disabled={!agreeToPP || !agreeToTCs}
            >
              {t("modal.termsAndConditions.submitButton")}
            </GreenButton>
            <RedButton onClick={props.modal.cancel}>{t("cancel")}</RedButton>
          </ButtonWrap>
        </React.Fragment>
      }
    >
      <React.Fragment>
        <ModalContentLinkListTitle>
          {t("modal.termsAndConditions.reviewDocuments")}
        </ModalContentLinkListTitle>
        <ModalContentLinkList>
          <li>
            <a
              href={withPrefix("/VIGOR_terms_conditions.pdf")}
              target="_blank"
              title={t("modal.termsAndConditions.tcLinkText")}
            >
              {" "}
              {t("modal.termsAndConditions.tcLinkText")}
            </a>
          </li>
          <li>
            <a
              href={withPrefix("/VIGOR_privacy_policy.pdf")}
              target="_blank"
              title={t("modal.termsAndConditions.ppLinkText")}
            >
              {" "}
              {t("modal.termsAndConditions.ppLinkText")}
            </a>
          </li>
        </ModalContentLinkList>
      </React.Fragment>
    </Modal>
  );
};

export default observer(TermsAndConditionsModal);
