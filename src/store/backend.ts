import { action, computed, decorate, observable } from "mobx";
import { toast } from "react-toastify";
import ual from "../../config/ual";
import { sendBackendRequest } from "../utils/backend";
import RootStore from "./index";

const LS_AUTH_TX_KEY = `vigor__authTx`;

const arrayToHex = (data: Uint8Array) => {
  let result = "";
  for (const x of data) {
    result += ("00" + x.toString(16)).slice(-2);
  }
  return result.toUpperCase();
};

type TBackendUser = {
  account: string;
  email?: string;
  emailVerified?: boolean;
  emailOtp?: number;
  telegramId?: number;
  telegramUsername?: string;
  telegramVerified?: boolean;
  telegramOtp?: number;
  crThreshold: number;
  active: boolean;
};

export default class BackendStore {
  rootStore: RootStore;
  authTx: any;
  user?: TBackendUser;
  loading: boolean = false;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;

    if (typeof window !== "undefined") {
      try {
        this.authTx = JSON.parse(
          window.localStorage.getItem(LS_AUTH_TX_KEY) || `{}`
        );
      } catch (error) {
        console.error(error);
      }
    }
  }

  async init() {}

  async onLogout() {
    this.authTx = undefined;
    this.user = undefined;
    this.setAuthTxToLS(``);
  }

  private setAuthTxToLS(value: string) {
    window.localStorage.setItem(LS_AUTH_TX_KEY, value);
  }

  /**
   * Creates a transaction that is signed by the logged in user
   * Backend can check this an use it as proof of auth
   */
  async authenticate() {
    const { walletStore } = this.rootStore;
    if (!walletStore.isLoggedIn) {
      toast.info(`Please log in first`);
      return;
    }
    if (!walletStore.hasOpenedAccount) {
      toast.info(`You must take out a loan first`);
      return;
    }

    try {
      this.loading = true;
      const options = {
        expireSeconds: 300,
        blocksBehind: 5,
        sign: true,
        // no need to broadcast it to chain
        broadcast: false,
      };

      let authActions = walletStore.createActions([
        {
          account: ual.chain.contracts.auth,
          name: `authenticate`,
          data: {},
        },
      ]);

      const txResult = (
        await walletStore.accountInfo!.signTransaction(
          { actions: authActions },
          options
        )
      ).transaction;
      const tx = {
        serializedTransaction: arrayToHex(txResult.serializedTransaction),
        signatures: txResult.signatures,
      };

      this.authTx = tx;
      this.setAuthTxToLS(JSON.stringify(tx));
    } catch (error) {
      console.error("api.transact::error", JSON.stringify(error));
      toast.error(error.message);

      this.authTx = undefined;
      this.setAuthTxToLS(``);
    } finally {
      this.loading = false;
    }

    if (this.authTx) {
      return this.fetchBackendUser();
    }
  }

  get isAuthenticated() {
    return Boolean(this.authTx);
  }

  async fetchBackendUser(skipSetLoading = false) {
    if (!this.authTx) return;

    try {
      if(!skipSetLoading) {
        this.loading = true;
      }
      const { user } = await sendBackendRequest<any, { user: TBackendUser }>(
        `user`,
        { authTx: this.authTx }
      );
      this.user = user;
      this.onUserFetch();
    } catch (error) {
      console.error(error.message);
      toast.error(error.message);

      this.setAuthTxToLS(``);
    } finally {
      this.loading = false;
    }
  }

  onUserFetch() {
    if(!this.initialized) {
      this.initialized = true;
      this.collateralRatio = this.user!.crThreshold;
      this.enabled = this.user!.active;
    }
  }

  /**
   * Alert Settings & Form
   */
  initialized = false;
  collateralRatio: number = 1;
  enabled = false;
  refreshIntervalId:number|null = null;

  get telegramVerificationLink() {
    if (!this.user || !this.user.telegramOtp) return ``;

    const payload = btoa(`${this.user.account},${this.user.telegramOtp}`);
    return `https://t.me/vigoralertsbot?start=${payload}`;
  }

  handleCrChange = (val: number) => {
    let clampedVal = Math.max(Math.min(val, 4), 1)
    this.collateralRatio = clampedVal;
  };

  handleEnabledChange = (evt: any) => {
    let val = evt.target.checked;
    this.enabled = val;
  };

  handleVerifyClick = () => {
    this.refreshIntervalId = setInterval(() => this.fetchBackendUser(true), 5000)
  }

  async changeSettings() {
    try {
      const { user } = await sendBackendRequest<any, { user: TBackendUser }>(
        `user/settings`,
        {
          authTx: this.authTx,
          crThreshold: this.collateralRatio,
          active: this.enabled,
        }
      );
      this.user = user;
      this.onUserFetch();
      toast.success(`Alerts changed`);
    } catch (error) {
      console.error(error.message);
      toast.error(`Changing settings failed`);
    }
  }
}

decorate(BackendStore, {
  authTx: observable,
  loading: observable,
  user: observable,
  collateralRatio: observable,
  enabled: observable,
  telegramVerificationLink: computed,
  // actions
  init: action,
  authenticate: action,
  changeSettings: action,
  fetchBackendUser: action,
  handleCrChange: action,
});
