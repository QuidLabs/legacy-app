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
import AmountInput from "../shared/AmountInput";
import { HorizontalFlex } from "../shared";
import { TAsset, formatAsset } from "@deltalabs/eos-utils";
import BigNumber from "bignumber.js";

const Message = styled.div`
  margin-bottom: 24px;
  font-size: 16px;
  line-height: 1.4;
`;


const RoundedAmountInput = styled(AmountInput)`
  border: 1px solid ${p => p.theme.colors.secondary};
  + button {
    right: 4px;
  }
`;

type ModalProps = {
  title: string;
  defaultAmount: TAsset;
  maxAmount: TAsset;
}
type Props = {
  modal: ModalItem<ModalProps>;
};

const AmountModal = ({ modal }: Props) => {
  const { title, defaultAmount, maxAmount } = modal.data;
  const { t } = useTranslation();
  const [asset, setAsset] = React.useState(() => defaultAmount) 

  const handleAmountChange = (asset: TAsset) => {
    setAsset(asset);
  };

  return (
    <Modal
      size="md"
      title={<ModalTitle>{title}</ModalTitle>}
      footer={
        <ButtonWrap>
          <RedButton onClick={modal.cancel}>{t("cancel")}</RedButton>
          <GreenButton
            onClick={async () => {
              modal.submit({
                asset,
              } as any);
            }}
          >
            {t("confirm")}
          </GreenButton>
        </ButtonWrap>
      }
    >
      <HorizontalFlex margin={"0 0 8px 0"}>
        <RoundedAmountInput
          width="auto"
          defaultValue={defaultAmount}
          maxValue={maxAmount}
          onChange={handleAmountChange}
          autoFocus
        />
      </HorizontalFlex>
    </Modal>
  );
};

export default AmountModal;
