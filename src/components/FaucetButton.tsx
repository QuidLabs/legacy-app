import { observer } from "mobx-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { useStore } from "../store/use-store";
import { RiHandCoinLine } from 'react-icons/ri';
import { toast } from "react-toastify";
import LoadingIndicator from "./shared/LoadingIndicator";
import ToastTransactionSuccess from "./shared/ToastTransactionSuccess";
import { formatBlockExplorerTransaction } from "@deltalabs/eos-utils";
import wallet from "../store/wallet";

const Button = styled.button`
  display: flex;
  align-items: center;
  border: 1px solid ${p => p.theme.colors.success};
  color: ${p => p.theme.colors.success};
  padding: 8px 16px;
  border-radius: ${p => p.theme.borderRadius};
  
  &:hover,
  &:focus {
    background-color: ${p => p.theme.colors.bgLighter};
  }
  
  &:disabled {
    cursor: not-allowed;
    border: 1px solid ${p => p.theme.colors.bgLighter};
    color: ${p => p.theme.colors.bgLighter};
    background-color: transparent;
  }
`;

const ButtonText = styled.div`
  padding-left: 8px;
`;

const WalletDropdown: React.FC<{}> = props => {
  const { t } = useTranslation();
  const [walletStore] = useStore((store) => [
    store.walletStore,
  ]);

  const [ isLoading, setIsLoading ] = useState(false);
  const [ isDisabled, setIsDisabled ] = useState(false);

  const requestRefill = async () => {
    setIsLoading(true);
    fetch(`https://api.boid.com/vigFaucet/${walletStore.accountName}`)
      .then((result: Response) => result.json())
      .then((result:any) => {
        setIsLoading(false);
        setIsDisabled(true);
        const txUrl = formatBlockExplorerTransaction(`eosq`)(
          result.txid
        );
        console.log(result);
        toast.success(ToastTransactionSuccess({ title: 'Requested refill from faucet', url: txUrl }));
        walletStore.refetchFull();
      })
      .catch((error:any) => {
        setIsLoading(false);
        console.error(error);
        toast.error("Error requesting refill from faucet", { toastId: 'requestRefill' });
      });
  };

  return (
    <Button onClick={requestRefill} disabled={isLoading || isDisabled}>
      { isLoading ? <LoadingIndicator size={24}/> : <RiHandCoinLine size={24} color={'#4ECCAE'}/> }
      <ButtonText>{ t('faucet') }</ButtonText>
    </Button>
  );
};

export default observer(WalletDropdown);
