import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "../store/use-store";
import ReactTooltip from "react-tooltip";
import Checkbox from "./shared/Checkbox";
import { observer } from "mobx-react";
import styled from "styled-components";
import { MdDoneAll, MdErrorOutline, MdRefresh } from "react-icons/md";
import { toast } from "react-toastify";
import { IconButton } from "./shared/IconButton";

const Wrapper = styled.div<{ show: boolean }>`
  width: 252px;
  height: 36px;
  transition: height 250ms;
  cursor: pointer;
  padding: 8px;
  font-size: 14px;
  font-weight: 400;
  white-space: nowrap;
  color: ${(p) => p.theme.colors.light};
  background: #222;
  border: 1px solid ${(p) => p.theme.colors.bgLighter};
  border-radius: ${(p) => p.theme.borderRadius2x};
  flex-shrink: 0;

  ${(p) =>
    p.show &&
    `
    height: 64px;
  `};

  z-index: 1;
  @media (max-width: 601px) {
    z-index: initial;
  }
`;

const AccountNamePermission = styled.div`
  font-weight: 600;
  display: flex;
  justify-content: space-between;

  .tooltip-override {
    max-width: 70vw;
    white-space: initial;
  }
`;

const FadeIn = styled.div<{ show: boolean }>`
  opacity: 0;
  transition: opacity 250ms;
  pointer-events: none;

  ${(p) =>
    p.show &&
    `
    opacity: 100%;
    pointer-events: initial;
  `};
`;

const AccountName = styled.div`
  flex-grow: 1;
`;

const StyledIconButton = styled(IconButton)`
  margin-left: 4px;
`;

type Props = {
  isLoggedIn: boolean;
};

const AccountData: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [walletStore, vigorStore] = useStore((store) => [
    store.walletStore,
    store.vigorStore,
  ]);

  const [showDetails, setShowDetails] = useState(false);
  const { isLoggedIn } = props;

  const handleRefresh = async (event: any) => {
    event.stopPropagation();
    event.preventDefault();
    try {
      await walletStore.refetchFull();
    } catch (error) {
      toast.error(error.message, { toastId: "handleRefresh" });
    }
  };

  return (
    <Wrapper show={showDetails} onClick={() => setShowDetails(!showDetails)}>
      {isLoggedIn ? (
        <React.Fragment>
          <AccountNamePermission>
            <AccountName>
              {walletStore.accountName}@{walletStore.permission}
            </AccountName>
            {!walletStore.hasSignedConstitution && (
              <MdErrorOutline
                size={20}
                color={"#F6D051"}
                data-tip={t("accountData.tooltips.thingsToDo_signConstitution")}
              />
            )}
            {walletStore.hasSignedConstitution && (
              <MdDoneAll
                size={20}
                color={"#4ECCAE"}
                data-tip={t("accountData.tooltips.readyToGo")}
              />
            )}
            <StyledIconButton>
              <MdRefresh onClick={handleRefresh} size={20} />
            </StyledIconButton>
          </AccountNamePermission>
          <FadeIn show={showDetails}>
            <Checkbox
              label={t("accountData.constitutionSigned")}
              checked={walletStore.hasSignedConstitution}
              onClick={() =>
                !walletStore.hasSignedConstitution
                  ? walletStore.promptSignConstitution()
                  : null
              }
            />
          </FadeIn>
        </React.Fragment>
      ) : (
        t("notLoggedIn")
      )}
      <ReactTooltip
        className={"tooltip-override"}
        effect={"solid"}
        border={true}
        place={"bottom"}
        multiline={true}
        data-event="click focus"
        // @ts-ignore
        borderColor="#50587A"
        backgroundColor="#13161E"
      />
    </Wrapper>
  );
};

export default observer(AccountData);
