import { observable, decorate, autorun, set, action, computed } from "mobx";
import RootStore from "./index";
import { MODAL_TYPES } from "./modal";

const extendStoreFromLocalStorage = (store: UserStore) => {
  let firstRun = true;

  if (typeof window === "undefined") {
    return;
  }

  // will run on change
  autorun(() => {
    // on load check if there's an existing store on localStorage and extend the store
    if (firstRun) {
      const existingStore = window.localStorage.getItem("userStore");

      if (existingStore) {
        set(store, JSON.parse(existingStore));
      }
    }

    // from then on serialize and save to localStorage
    window.localStorage.setItem(
      "userStore",
      JSON.stringify({
        hasSeenDisclaimer: store.hasSeenDisclaimer,
        useFreeTransactions: store.useFreeTransactions,
      })
    );
  });

  firstRun = false;
};

export default class UserStore {
  rootStore: RootStore;
  hasSeenDisclaimer: boolean;
  useFreeTransactions: boolean;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    this.hasSeenDisclaimer = false;
    this.useFreeTransactions = false;

    extendStoreFromLocalStorage(this);
  }

  async init() {}

  public promptDisclaimer = async (forceShow = false) => {
    if (forceShow || !this.hasSeenDisclaimer) {
      const response = await this.rootStore.modalStore.openModal(
        MODAL_TYPES.DISCLAIMER
      );
      this.hasSeenDisclaimer = true;
    }

    return this.hasSeenDisclaimer;
  };

  public toggleFreeTransactions = () => {
    this.useFreeTransactions = !this.useFreeTransactions;
  };

  public get supportsFreeTransactions() {
    if (
      this.rootStore.walletStore.isLoggedIn &&
      this.rootStore.walletStore.ual
    ) {
      return this.rootStore.walletStore.ual.supportsCosign();
    } else {
      return false;
    }
  }

  public get shouldUseFreeTransactions(): boolean {
    return this.supportsFreeTransactions && this.useFreeTransactions;
  }
}

// gatsby-plugin-typescript seems to ignore tsconfig.json changes and uses babel for transpilation
// which means setting experimentalDecorators: true in tsconfig.json does not work
// https://mobx.js.org/best/decorators.html
decorate(UserStore, {
  hasSeenDisclaimer: observable,
  useFreeTransactions: observable,
  // computed
  supportsFreeTransactions: computed,
  shouldUseFreeTransactions: computed,
  // actions
  init: action,
});
