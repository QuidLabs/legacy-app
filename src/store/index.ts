import React from "react";
import WalletStore from "./wallet";
import VigorStore from "./vigor";
import PriceFeedStore from "./pricefeed";
import UserStore from "./user";
import ModalStore from "./modal";
import TutorialStore from "./tutorial";
import { JsonRpc } from "@jafri/eosjs2";
import BackendStore from "./backend";
import { PromiseAllSettled } from "../utils/promise";
import HistoryStore from './history';

export default class RootStore {
  walletStore = new WalletStore(this);
  vigorStore = new VigorStore(this);
  priceFeedStore = new PriceFeedStore(this);
  userStore = new UserStore(this);
  modalStore = new ModalStore(this);
  tutorialStore = new TutorialStore(this);
  backendStore = new BackendStore(this);
  historyStore = new HistoryStore(this);

  async init() {
    try {
      await PromiseAllSettled<any>([
        this.walletStore.init(),
        this.vigorStore.init(),
        this.priceFeedStore.init(),
        this.userStore.init(),
        this.tutorialStore.init(),
        this.backendStore.init(),
      ]);

      setInterval(() => {
        Promise.all([
          this.walletStore.refetchPeriodically(),
        ]).catch(() => null);
      }, 1e4);
    } catch (error) {
      throw new Error(`Error while initializing store: ${error.message}`);
    }
  }

  async onLogin() {}

  async onLogout() {
    await Promise.all([this.backendStore.onLogout(), this.vigorStore.onLogout()]);
  }

  get rpc() {
    return this.walletStore.rpc as JsonRpc & { endpoint: string };
  }
}

export const rootStore = new RootStore();

// expose for testing
if (typeof window !== `undefined`) {
  // @ts-ignore
  window.store = rootStore;
}

export const storeContext = React.createContext<RootStore>(rootStore);
