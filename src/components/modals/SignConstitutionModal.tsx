import styled from "styled-components";
import React, { useEffect, useRef, useState } from "react";
import Checkbox from "../shared/Checkbox";
import { useTranslation } from "react-i18next";
import { useStore } from "../../store/use-store";
import { observer } from "mobx-react";
import { toast } from "react-toastify";
import Modal, {
  CheckboxContainer,
  ButtonWrap,
  GreenButton,
  RedButton,
  ModalTitle,
} from "./ModalBase";
import ReactMarkdown from "react-markdown";
import { media } from "../../utils/breakpoints";
import { ModalItem } from "../../store/modal";

const ConstitutionInfo = styled.div`
  font-size: 14px;
  font-weight: 400;
  margin-top: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${(p) => p.theme.colors.bgLightest};
  display: flex;
  justify-content: space-between;

  ${media.lessThan("sm")} {
    display: block;

    div {
      margin-bottom: 4px;
    }
  }
`;

const ViewOnGithubLink = styled.a`
  font-weight: 600;
  color: ${(p) => p.theme.colors.primaryLighter};
`;

type Props = {
  modal: ModalItem;
};
const SignConstitutionModal: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  const [walletStore] = useStore((store) => [
    store.walletStore,
  ]);

  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [agreeToConstitution, setAgreeToConstitution] = useState(false);
  const [constitutionContent, setConstitutionContent] = useState("");

  const scrollHandler = (event: any) => {
    if (event.target.scrollTop + event.target.offsetHeight >= (event.target.scrollHeight - (event.target.scrollHeight * 0.1)) ) {
      setScrolledToBottom(true);
    }
  };

  useEffect(() => {
    if (walletStore.constitutionInfo?.terms) {
      fetch(walletStore.constitutionInfo?.terms)
        .then((result: Response) => result.text())
        .then((text) => {
          if (ref && ref.current) {
            ref.current.addEventListener("scroll", scrollHandler);
          }
          setConstitutionContent(text);
        })
        .catch((error) => {
          console.error(error);
          toast.error("Error fetching constitution text", { toastId: 'fetchConstitution' });
        });
    }

    return () => {
      if (ref && ref.current) {
        ref.current.removeEventListener("scroll", scrollHandler);
      }
    };
  }, [walletStore.constitutionInfo]);

  return (
    <Modal
      size={'md'}
      title={
        <React.Fragment>
          <ModalTitle>{t("modal.signConstitution.title")}</ModalTitle>
          <ConstitutionInfo>
            <div>
              {t("modal.signConstitution.version")}:{" "}
              {walletStore.constitutionInfo?.version || "-"}
            </div>
            <div>
              {t("modal.signConstitution.hash")}:{" "}
              {walletStore.constitutionInfo?.hash || "-"}
            </div>
            <ViewOnGithubLink
              href={walletStore.constitutionInfo?.terms}
              rel="noopener noreferrer"
              target="_blank"
              title={t("modal.signConstitution.vigorConstitutionOnGithub")}
            >
              {t("modal.signConstitution.viewOnGithub")}
            </ViewOnGithubLink>
          </ConstitutionInfo>
        </React.Fragment>
      }
      bodyRef={ref}
      footer={
        <React.Fragment>
          <CheckboxContainer>
            <Checkbox
              label={t(
                "modal.signConstitution.checkbox_readAndAgreedToConstitution"
              )}
              checked={agreeToConstitution}
              onClick={() => setAgreeToConstitution(!agreeToConstitution)}
              disabled={!scrolledToBottom}
            />
          </CheckboxContainer>
          <ButtonWrap>
            <GreenButton
              onClick={async () => {
                props.modal.submit({});
              }}
              disabled={!scrolledToBottom || !agreeToConstitution}
            >
              {t("modal.signConstitution.submitButton")}
            </GreenButton>
            <RedButton onClick={props.modal.cancel}>{t("cancel")}</RedButton>
          </ButtonWrap>
        </React.Fragment>
      }
    >
      {constitutionContent ? (
        <ReactMarkdown source={constitutionContent} />
      ) : (
        <div>Loading...</div>
      )}
    </Modal>
  );
};

export default observer(SignConstitutionModal);
