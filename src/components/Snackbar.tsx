import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { useStore } from "../store/use-store";
import { media } from "../utils/breakpoints";
import { toast } from "react-toastify";
import { delay } from "../utils/promise";
import LoadingSpinner from "./shared/LoadingSpinner";

const SnackbarWrapper = styled.div<any>`
  position: fixed;
  display: flex;
  align-items: center;
  max-width: 480px;
  padding: 16px;
  background-color: ${(p) => p.theme.colors.bg};
  border: 2px solid ${(p) => p.theme.colors.white};
  color: ${(p) => p.theme.colors.white};
  border-radius: 40px;
  bottom: 20px;
  box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2),
    0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12);

  ${media.lessThan(`xs-max`)} {
    max-width: 320px;
  }
`;
const CountdownWrapper = styled.div<any>`
  width: 30px;
  text-align: right;
  margin-left: 12px;
`;

const Countdown: React.FC<{ expiry: Date; onExpired: any }> = ({
  expiry,
  onExpired,
}) => {
  const getTimeLeft = () => {
    return Math.floor((expiry.getTime() - Date.now()) / 1000);
  };
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  const onTick = () => {
    const left = timeLeft - 1;
    if (left <= 0) {
      onExpired();
    }
    setTimeLeft(left);
  };

  useEffect(() => {
    // don't reschedule on expiry
    if (timeLeft <= 0) return;

    const intervalId = setTimeout(onTick, 1000);

    return () => clearTimeout(intervalId);
  }, [timeLeft]);

  return (
    <CountdownWrapper>
      <LoadingSpinner text={`${timeLeft}s`} size={30} />
    </CountdownWrapper>
  );
};

const Snackbar: React.FC<{}> = (props) => {
  const { t } = useTranslation();
  const [vigorStore, walletStore] = useStore((store) => [
    store.vigorStore,
    store.walletStore,
  ]);

  const userCron = vigorStore.userCron;

  if (!userCron) return null;
  const readyAt = new Date(`${userCron.due_date}Z`);
  if (readyAt.getTime() <= Date.now()) return null;

  const handleExpired = async () => {
      // we don't even need to fetch croneosqueue again because we already know the due date
      // await vigorStore.fetchCroneosQueue();
      // just set it to undefined again, so we trigger a rerender to clear the snackbar
      vigorStore.userCron = undefined
  };

  return (
    <SnackbarWrapper>
      <div>{t(`waitForSettlement`)}</div>
      <Countdown expiry={readyAt} onExpired={handleExpired} />
    </SnackbarWrapper>
  );
};

export default observer(Snackbar);
