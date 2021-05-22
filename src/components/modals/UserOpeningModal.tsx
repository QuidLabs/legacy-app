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
import { TAsset, formatAsset } from "@deltalabs/eos-utils";
import { HorizontalFlex } from "../shared";

const Message = styled.div`
  margin-bottom: 24px;
  font-size: 16px;
  line-height: 1.4;
`;

const RowWrapper = styled(HorizontalFlex)<any>`
  justify-content: space-between;
  margin: 8px 0;
  font-weight: 600;
  letter-spacing: -0.2px;

  & > div:first-child {
    font-size: 1.2rem;
  }
  & > div:last-child {
    text-align: right;
    font-size: 1.6rem;
    color: ${props => props.theme.colors.secondary};
  }
`;

export const AssetInfoRow: React.FC<{description: React.ReactNode, value: React.ReactNode}>= (props) => {
  const { description, value } = props;

  return (
    <RowWrapper>
      <div>{description}</div>
      <div>{value}</div>
    </RowWrapper>
  );
};

type Props = {
  modal: ModalItem<{
    stakeAmount: TAsset;
    vigBalance: TAsset;
  }>;
};

const UserOpeningModal = ({ modal }: Props) => {
  const { stakeAmount, vigBalance } = modal.data;

  const { t } = useTranslation();
  const canStake = vigBalance.amount.isGreaterThanOrEqualTo(stakeAmount.amount)

  return (
    <Modal
      size="md"
      title={<ModalTitle>{t(`modal.userOpening.title`)}</ModalTitle>}
      footer={
        <ButtonWrap>
          <RedButton onClick={modal.cancel}>{t("cancel")}</RedButton>
          <GreenButton
            disabled={!canStake}
            onClick={async () => {
              modal.submit({
                stakeAmount,
                vigBalance,
              });
            }}
          >
            {t("modal.userOpening.stake")}
          </GreenButton>
        </ButtonWrap>
      }
    >
      <Message>{t(`modal.userOpening.body`)}</Message>
      <Message>{t(`modal.userOpening.body2`)}</Message>
      <AssetInfoRow description={"VIG in Wallet"} value={formatAsset(vigBalance)} />
      <AssetInfoRow description={"Required VIG Stake"} value={formatAsset(stakeAmount)} />
    </Modal>
  );
};

export default UserOpeningModal;
