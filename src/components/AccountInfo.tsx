import React from "react";
import { observer } from "mobx-react";
import { useStore } from "../store/use-store";
import { formatAsset } from "@deltalabs/eos-utils";

const AccountInfo: React.FC<{}> = props => {
  const walletStore = useStore(store => store.walletStore);

  return (
    <div>
      AccountInfo
      <div>
        {walletStore.isLoggedIn ? (
          <div style={{ fontSize: '11px' }}>
            <div>Name: { walletStore.accountName }</div>
            <div>Balance: {formatAsset(walletStore.tokenBalances["EOS"])}</div>
          </div>
        ) : (
          "Not logged in yet."
        )}
      </div>
    </div>
  );
};

export default observer(AccountInfo);
