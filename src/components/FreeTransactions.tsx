import React from "react";
import styled from "styled-components";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useStore } from "../store/use-store";
import Checkbox from "./shared/Checkbox";

const Resources: React.FC = () => {
  const [userStore] = useStore((store) => [store.userStore]);
  const { t } = useTranslation();

  if (!userStore.supportsFreeTransactions) return null;

  return (
    <Checkbox
      label={t(`resources.freeTx`)}
      onClick={userStore.toggleFreeTransactions}
      checked={userStore.useFreeTransactions}
    />
  );
};

export default observer(Resources);
