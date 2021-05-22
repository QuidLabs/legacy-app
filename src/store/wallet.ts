import { action, computed, observable, decorate, toJS } from "mobx";
import RootStore from "./index";
import { JsonRpc } from "@jafri/eosjs2/dist";
import ualConfig from "../../config/ual";
import { UAL } from "ual-reactjs-renderer";
import { Scatter } from "ual-scatter-protocol";
import { Anchor } from "ual-anchor";
import { TokenPocket } from "ual-token-pocket";
import { MeetOne } from "ual-meetone";
import {
  TAsset,
  fetchRows,
  decomposeAsset,
  formatAsset,
  TEosAction,
  formatBlockExplorerTransaction,
  TAssetSymbol,
} from "@deltalabs/eos-utils";
import { PromiseAllSettledFilterFulfilled } from "../utils/promise";
import {
  LiquidationActionType,
  TAccountsRow,
  TGetAccountResponse,
  TMemberRow,
  TMembertermsRow,
  TUserRow,
} from "../types/eos";
import { toast } from "react-toastify";
import { enhanceUAL } from "@cmichel/ual-cosign";
import ToastTransactionSuccess from "../components/shared/ToastTransactionSuccess";
import ToastTransactionError from "../components/shared/ToastTransactionError";
import BigNumber from "bignumber.js";
import { symbolCode2Symbol } from "../utils/tokens";
import { MODAL_TYPES } from "./modal";
import { sortValidEndpoints, endpointToUrl } from "../utils/eos/rpc-benchmark";
import { name2Scope } from "../utils/format";
import { BACKEND_BASE_URL } from "../utils/backend";

type SupportedTokenTypes = keyof typeof ualConfig["chain"]["tokens"];
const getTokenContract = (symbolCode: string) => {
  const tokenObj = ualConfig.chain.tokens[symbolCode as SupportedTokenTypes];
  if (!tokenObj) throw new Error(`Invalid token symbol: ${symbolCode}`);
  return tokenObj.contract;
};

const formatErrorMessage = (ualError: UALError) => {
  const originalMsg = (
    (ualError as any)?.cause?.json?.error?.details[0] || ualError
  ).message;
  const errorMessageMarker = "Message : ";
  const isVigorContractError =
    originalMsg.search("========VIGOR CHECK FAILED========") !== -1;

  if (!isVigorContractError) {
    return {
      title: "Transaction failed",
      text: originalMsg.replace(`assertion failure with message: `, ``),
    };
  }

  return {
    title: "Contract check failed",
    text: originalMsg.substring(
      originalMsg.search(errorMessageMarker) + errorMessageMarker.length
    ),
  };
};

type TransactionState = "idle" | "waiting" | "success" | "error";

const defaultTokenBalances = Object.keys(ualConfig.chain.tokens).reduce(
  (acc, key) => ({
    ...acc,
    [key]: {
      amount: new BigNumber(`0`),
      symbol: ualConfig.chain.tokens[key as SupportedTokenTypes].symbol,
    },
  }),
  {}
) as any;

export default class WalletStore {
  rootStore: RootStore;
  rpc: JsonRpc;
  ual?: ReturnType<typeof enhanceUAL> & UAL;
  appName = "VIGOR";
  authenticators: any[] = [];
  tokenBalances: { [key: string]: TAsset };
  transactionState: TransactionState;
  permission?: string;
  hasOpenedAccount: boolean;
  hasSignedConstitution: boolean;
  constitutionInfo?: TMembertermsRow;
  selectedSymbol: TAssetSymbol = symbolCode2Symbol(`EOS`);
  accountResources: TGetAccountResponse;
  accountName = ``;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;

    const endpoints = ualConfig.chain.rpcEndpoints.map(endpointToUrl);

    this.rpc = new JsonRpc(endpoints);
    this.tokenBalances = defaultTokenBalances;
    this.accountResources = <TGetAccountResponse>{}
    this.hasOpenedAccount = false;
    this.hasSignedConstitution = false;
    this.transactionState = "idle";
    this.constitutionInfo = { version: 0, hash: "", terms: "" };
    this.initUalAuthenticators();
  }

  private initUalAuthenticators() {
    const appName = this.appName;
    const scatter = new Scatter([ualConfig.chain], { appName: appName });
    const anchor = new Anchor([ualConfig.chain], {
      appName: appName,
      requestStatus: false,
    });
    const tokenPocket = new TokenPocket([ualConfig.chain]);
    const meetOne = new MeetOne([ualConfig.chain]);

    // why is this hard-coded to false, so it never does an auto-login with Scatter?
    // dirty-patch it
    scatter.shouldAutoLogin = () => false;
    anchor.shouldAutoLogin = () => false;
    tokenPocket.shouldAutoLogin = () => false;

    const authenticators: any[] = [scatter, anchor, tokenPocket, meetOne];
    this.authenticators = authenticators;
  }

  private showTransactionStateOverlay(
    state: TransactionState,
    hideDelay?: number
  ) {
    this.transactionState = state;

    if (hideDelay) {
      this.hideTransactionOverlay(hideDelay);
    }
  }

  private hideTransactionOverlay(delay: number) {
    setTimeout(() => {
      this.transactionState = "idle";
    }, delay || 2000);
  }

  get isLoggedIn() {
    return Boolean(this.accountInfo);
  }

  fetchAccountInfo = async () => {
    const accountName = this.accountName;
    if (!accountName) return;

    try {
      const userData = await this.rootStore.rpc.get_account(accountName);
      this.accountResources = userData;
    } catch (e) {
      console.error(e);
    }
  };

  get accountInfo() {
    return this.ual?.activeUser;
  }

  public get tokenBalancesUsd() {
    return this.rootStore.priceFeedStore.convertTokenBalancesToUsd(
      this.tokenBalances
    );
  }

  fetchAccountBalances = async () => {
    const accountName = this.accountName;
    if (!accountName) return;

    try {
      const balances = await PromiseAllSettledFilterFulfilled(
        Object.keys(this.tokenBalances).map((symbolCode) =>
          // @ts-ignore
          fetchRows(this.rpc)<TAccountsRow>({
            code: getTokenContract(symbolCode),
            scope: name2Scope(accountName),
            table: `accounts`,
            limit: 1,
          }).then((rows) => {
            if (rows[0]) return decomposeAsset(rows[0].balance);
            throw new Error(`No balance object found`);
          })
        )
      );

      const tokenBalances = toJS(this.tokenBalances);
      balances.forEach((tokenBalance) => {
        tokenBalances[
          tokenBalance.symbol.code as SupportedTokenTypes
        ] = tokenBalance;
      });
      // need to completely replace object for observable
      this.tokenBalances = tokenBalances;
    } catch (e) {
      console.error(e);
    }
  };

  getAccountName = async () => {
    const accountInfo = this.accountInfo;
    if (!accountInfo) return;

    try {
      let accountName = "";

      // meetone
      if (typeof accountInfo.getAccountName === `function`) {
        // returns a promise!
        accountName = await accountInfo.getAccountName();
      } else if (typeof accountInfo.getName === `function`) {
        accountName = accountInfo.getName();
      } else if (
        typeof accountInfo.wallet !== `undefined` &&
        accountInfo.wallet.name
      ) {
        // token pocket
        accountName = accountInfo.wallet.name;
      }
      // scatter, anchor
      else if (typeof accountInfo.accountName === `string`) {
        accountName = accountInfo.accountName;
      } else {
        toast.error("Unsupported authenticator");
      }

      this.accountName = accountName;
    } catch (e) {
      toast.error("Unsupported authenticator");
      console.error(e);
    }
  };

  getPermissionName = () => {
    const accountInfo = this.accountInfo;
    if (!accountInfo) return;

    try {
      let permissionName = "active";
      // e.g. https://github.com/atticlab/eos-wps-front/blob/03cba3c427a54da4efb4baacd57c4e84b6b6c300/src/store/modules/userService/actions.js#L31-L48
      if (typeof accountInfo.scatter !== "undefined") {
        permissionName = accountInfo.scatter.identity.accounts.find(
          (x: any) => x.blockchain === "eos"
        ).authority;
      } else if (accountInfo.requestPermission) {
        // Anchor
        permissionName = accountInfo.requestPermission;
      } else if (
        typeof accountInfo.wallet !== `undefined` &&
        Array.isArray(accountInfo.wallet.permissions)
      ) {
        // Token Pocket
        permissionName = accountInfo.wallet.permissions[0];
      } else {
        console.error("getPermissionName: Unhandled authenticator");
        // toast.error("Unsupported authenticator", {
        //   toastId: "getPermissionName",
        // });
      }

      this.permission = permissionName;
    } catch (e) {
      console.error(e);
    }
  };

  fetchAccountState = async () => {
    const accountName = this.accountName;
    if (!accountName) return;

    try {
      const [userRow] = await fetchRows(this.rootStore.rpc)<TUserRow>({
        code: ualConfig.chain.contracts.vigorBusiness,
        scope: ualConfig.chain.contracts.vigorBusiness,
        table: `user`,
        lower_bound: accountName,
        upper_bound: accountName,
        limit: 1,
        key_type: `name`,
      });

      this.hasOpenedAccount = !!userRow;
    } catch (e) {
      toast.error(e.message, { toastId: "fetchAccountState" });
      console.error(e);
    }
  };

  fetchCurrentConstitution = async () => {
    try {
      const [memberTermsRow] = await fetchRows(this.rootStore.rpc)<
        TMembertermsRow
      >({
        code: ualConfig.chain.contracts.dac,
        scope: ualConfig.chain.contracts.dac,
        table: "memberterms",
        limit: 1,
        reverse: true,
      });

      return memberTermsRow;
    } catch (e) {
      toast.error(e.message, { toastId: "fetchCurrentConstitution" });
      console.error(e);
    }
  };

  fetchConstitutionSignatureState = async () => {
    const accountName = this.accountName;
    if (!accountName) return;

    try {
      this.constitutionInfo = await this.fetchCurrentConstitution();
      if (!this.constitutionInfo) return;

      const [memberRow] = await fetchRows(this.rootStore.rpc)<TMemberRow>({
        code: ualConfig.chain.contracts.dac,
        scope: ualConfig.chain.contracts.dac,
        table: "members",
        lower_bound: accountName,
        upper_bound: accountName,
        limit: 1,
        key_type: `name`,
      });

      this.hasSignedConstitution = !!(
        memberRow &&
        memberRow.agreedtermsversion &&
        memberRow.agreedtermsversion === this.constitutionInfo.version
      );
    } catch (e) {
      toast.error(e.message, { toastId: "fetchConstitutionSignatureState" });
      console.error(e);
    }
  };

  refetchFull = async (): Promise<any> => {
    console.log("walletStore::refetch start");
    console.time("walletStoreRefetch");
    return Promise.all([
      this.fetchAccountInfo(),
      this.fetchAccountBalances(),
      this.rootStore.vigorStore.refetch(),
      this.rootStore.vigorStore.fetchCroneosQueue(),
      this.fetchConstitutionSignatureState(),
      this.fetchAccountState(),
    ]).then(() => {
      // console.timeEnd("walletStoreRefetch");
      // console.log("walletStore::refetch end");
    });
  };

  refetchPeriodically = async (): Promise<any> => {
    console.log("walletStore::refetch start");
    console.time("walletStoreRefetch");
    return Promise.all([
      this.fetchAccountInfo(),
      this.fetchAccountBalances(),
      this.rootStore.vigorStore.refetch(),
    ]).then(() => {
      // console.timeEnd("walletStoreRefetch");
      // console.log("walletStore::refetch end");
    });
  };

  // ual-reactjs-renderer encapsulates the ual and the only way to get it is through context consumer
  // which is a bad design and requires us to always update the ual if the UALProvider state changes
  onUALChange = async (ual: any) => {
    const wasLoggedIn = this.isLoggedIn;
    const enhancedUAL = enhanceUAL(ual, {
      cosignEndpoint: `${BACKEND_BASE_URL}/cosign`,
    });
    this.ual = enhancedUAL as any;
    if (this.isLoggedIn && !wasLoggedIn) {
      this.onLogin().then(() => {
        console.log("logged in", this.accountInfo);
        this.rootStore.onLogin();
      });
    }
  };

  onLogin = async () => {
    try {
      this.changeUALEndpoint();
      this.getPermissionName();
      await this.getAccountName();
      await this.refetchFull();
    } catch (error) {
      console.error(error.message);
    }

    await this.rootStore.userStore.promptDisclaimer();
  };

  login = async () => {
    this.ual?.showModal();
  };

  logout = async () => {
    this.ual?.logout();
    this.reset();
    this.rootStore.onLogout();
  };

  reset = () => {
    this.tokenBalances = defaultTokenBalances;
    this.hasOpenedAccount = false;
    this.accountName = ``;
    this.permission = ``;
    this.rootStore.vigorStore.reset();
  };

  init = async () => {
    const endpointBenchmark = await sortValidEndpoints(
      ualConfig.chain.rpcEndpoints
    );
    console.table(
      endpointBenchmark.map((obj) => ({
        endpoint: endpointToUrl(obj.endpoint),
        latency: obj.latency,
      }))
    );
    if (endpointBenchmark.length > 0) {
      const endpoints = endpointBenchmark.map((e) => endpointToUrl(e.endpoint));

      this.rpc = new JsonRpc(endpoints);
      this.changeUALEndpoint();
    }
  };

  private changeUALEndpoint = () => {
    if (!this.ual || !this.ual.activeAuthenticator || !this.ual.activeUser)
      return;

    try {
      const bestEndpoint = this.rpc.endpoints[0];
      this.ual.changeRpcEndpoint(bestEndpoint);
    } catch (error) {
      console.error(error);
    }
  };

  selectSymbol = (symbolCode: string) => {
    this.selectedSymbol = symbolCode2Symbol(symbolCode);
  };

  private promptAccountOpening = async () => {
    const openActions = [
      {
        account: ualConfig.chain.contracts.vigorBusiness,
        name: "openaccount",
        data: {
          owner: this.accountName,
        },
        authorization: [
          {
            actor: this.accountName,
            permission: this.permission,
          },
        ],
      },
      {
        account: ualConfig.chain.tokens.VIGOR.contract,
        name: "open",
        data: {
          owner: this.accountName,
          symbol: `4,VIGOR`,
          ram_payer: this.accountName,
        },
        authorization: [
          {
            actor: this.accountName,
            permission: this.permission,
          },
        ],
      },
    ];

    const globals = this.rootStore.vigorStore.globalStats;
    if (!globals) return [];

    const needsStake =
      globals.availability.length >=
      this.rootStore.vigorStore.config.newacctlim;

    if (!needsStake) return openActions;

    const stakeAmount = this.rootStore.priceFeedStore.convertUsd2Token(
      // small buffer of 5%
      this.rootStore.vigorStore.config.reqstake * 1.05,
      symbolCode2Symbol(`VIG`)
    );
    this.rootStore.walletStore.selectSymbol(`VIG`);
    const stakeResult = await this.rootStore.modalStore.openModal(
      MODAL_TYPES.USER_OPEN,
      { vigBalance: this.rootStore.walletStore.tokenBalances.VIG, stakeAmount }
    );

    if (stakeResult.canceled) {
      toast.error(
        `An account must be opened to use the VIGOR protocol. Come back later to receive a free account or stake VIG now.`,
        { toastId: "promptAccountOpening" }
      );
      return [];
    }

    const stakeActions = [
      {
        account: ualConfig.chain.contracts.vigorBusiness,
        name: `acctstake`,
        data: {
          owner: this.accountName,
        },
        authorization: [
          {
            actor: this.accountName,
            permission: this.permission,
          },
        ],
      },
      {
        account: getTokenContract(`VIG`),
        name: `transfer`,
        data: {
          from: this.accountName,
          to: ualConfig.chain.contracts.vigorBusiness,
          memo: `stake`,
          quantity: formatAsset(stakeAmount),
        },
        authorization: [
          {
            actor: this.accountName,
            permission: this.permission,
          },
        ],
      },
    ];
    return [...stakeActions, ...openActions];
  };

  async promptSignConstitution() {
    toast.info("Please sign the VIGOR DAC constitution first");
    const response = await this.rootStore.modalStore.openModal(
      MODAL_TYPES.CONSTITUTION
    );
    if (response.canceled) {
      toast.error("You must sign the VIGOR DAC constitution first.", {
        toastId: "promptSignConstitution",
      });
      return;
    }

    return this.rootStore.walletStore.signConstitution();
  }

  public createActions = (actions: Partial<TEosAction<any>>[]) => {
    return actions.map((action) => ({
      account: ualConfig.chain.contracts.vigorBusiness,
      ...action,
      authorization: [
        {
          actor: this.accountName,
          permission: this.permission,
        },
      ],
    }));
  };

  private sendTransaction = async (
    actions: Partial<Omit<TEosAction<any>, "authorization">>[]
  ) => {
    // clear all previous toasts
    toast.dismiss();

    const accountInfo = this.accountInfo;
    if (!accountInfo) {
      toast.info(`Please log in first`);
      return;
    }

    await this.rootStore.userStore.promptDisclaimer();

    if (!this.hasSignedConstitution && actions[0].name !== `memberreg`) {
      return this.promptSignConstitution();
    }

    let transformedActions = this.createActions(actions);

    if (this.hasSignedConstitution && !this.hasOpenedAccount) {
      const accountOpeningActions = await this.promptAccountOpening();
      if (accountOpeningActions.length === 0) return;

      transformedActions = [...accountOpeningActions, ...transformedActions];
    }

    try {
      this.showTransactionStateOverlay("waiting");
      console.log("api.transact::actions", transformedActions);

      const options = {
        expireSeconds: 300,
        blocksBehind: 5,
        broadcast: true,
        sign: true,
      };

      console.log("api.transact::options", options);

      const result = await (this.rootStore.userStore.shouldUseFreeTransactions
        ? this.ual!.cosignTransaction(
            { actions: transformedActions as any },
            options
          )
        : accountInfo.signTransaction(
            { actions: transformedActions as any },
            options
          ));
      const txUrl = result.transactionId
        ? formatBlockExplorerTransaction(`eosq`)(result.transactionId)
        : ``;
      console.log("api.transact::result", result);
      console.info(`Transaction send:`, txUrl);

      toast.success(ToastTransactionSuccess({ url: txUrl }));
      this.showTransactionStateOverlay("success", 3000);
    } catch (error) {
      console.error("api.transact::error", JSON.stringify(error));

      toast.error(ToastTransactionError(formatErrorMessage(error)), {
        toastId: "sendTransaction",
        autoClose: false,
      });
      this.showTransactionStateOverlay("error", 3000);
    }
  };

  depositFees = async (asset: TAsset) => {
    console.log(`depositing fees`);
    await this.sendTransaction([
      {
        account: getTokenContract(asset.symbol.code),
        name: `transfer`,
        data: {
          from: this.accountName,
          to: ualConfig.chain.contracts.vigorBusiness,
          memo: `vigfees`,
          quantity: formatAsset(asset),
        },
      },
    ]);

    await this.refetchFull();
  };

  withdrawFees = async (asset: TAsset) => {
    await this.sendTransaction([
      {
        name: `assetout`,
        data: {
          usern: this.accountName,
          memo: `vigfees`,
          assetout: formatAsset(asset),
        },
      },
    ]);

    await this.refetchFull();
  };

  depositCollateral = async (asset: TAsset) => {
    await this.sendTransaction([
      {
        account: getTokenContract(asset.symbol.code),
        name: `transfer`,
        data: {
          from: this.accountName,
          to: ualConfig.chain.contracts.vigorBusiness,
          memo: `collateral`,
          quantity: formatAsset(asset),
        },
      },
    ]);

    await this.refetchFull();
  };

  withdrawCollateral = async (asset: TAsset) => {
    await this.sendTransaction([
      {
        name: `assetout`,
        data: {
          usern: this.accountName,
          memo: `collateral`,
          assetout: formatAsset(asset),
        },
      },
    ]);

    await this.refetchFull();
  };

  depositSavings = async (asset: TAsset) => {
    await this.sendTransaction([
      {
        account: getTokenContract(asset.symbol.code),
        name: `transfer`,
        data: {
          from: this.accountName,
          to: ualConfig.chain.contracts.vigorBusiness,
          memo: `savings`,
          quantity: formatAsset(asset),
        },
      },
    ]);

    await this.refetchFull();
  };

  withdrawSavings = async (asset: TAsset) => {
    await this.sendTransaction([
      {
        name: `assetout`,
        data: {
          usern: this.accountName,
          memo: `savings`,
          assetout: formatAsset(asset),
        },
      },
    ]);

    await this.refetchFull();
  };

  depositInsurance = async (asset: TAsset) => {
    await this.sendTransaction([
      {
        account: getTokenContract(asset.symbol.code),
        name: "transfer",
        data: {
          from: this.accountName,
          to: ualConfig.chain.contracts.vigorBusiness,
          memo: "insurance",
          quantity: formatAsset(asset),
        },
      },
    ]);

    await this.refetchFull();
  };

  withdrawInsurance = async (asset: TAsset) => {
    await this.sendTransaction([
      {
        name: `assetout`,
        data: {
          usern: this.accountName,
          memo: "insurance",
          assetout: formatAsset(asset),
        },
      },
    ]);

    await this.refetchFull();
  };

  borrow = async (asset: TAsset) => {
    const hasSufficientFeesBalance = !this.rootStore.vigorStore.userFeesBalance.amount.isZero();

    if (!hasSufficientFeesBalance) {
      const response = await this.rootStore.modalStore.openModal(
        MODAL_TYPES.CONFIRM_VIGFEE_BORROW,
        {
          initialVigFees: `${this.rootStore.vigorStore.config.initialvig} VIG`,
          vigFeesBalance: formatAsset(
            this.rootStore.vigorStore.userFeesBalance,
            {
              withSymbol: true,
              separateThousands: true,
            }
          ),
        }
      );
      if (response.canceled) {
        toast.warn(
          `You need to deposit some VIG to VIG Fees & Rewards balance before taking a loan.`,
          {
            toastId: "vigfeesNote",
          }
        );

        return;
      }
    }

    await this.sendTransaction([
      {
        name: `assetout`,
        data: {
          usern: this.accountName,
          memo: `borrow`,
          assetout: formatAsset(asset),
        },
      },
    ]);

    await this.refetchFull();
  };

  repay = async (asset: TAsset) => {
    await this.sendTransaction([
      {
        account: getTokenContract(asset.symbol.code),
        name: "transfer",
        data: {
          from: this.accountName,
          to: ualConfig.chain.contracts.vigorBusiness,
          memo: "payback borrowed token",
          quantity: formatAsset(asset),
        },
      },
    ]);

    await this.refetchFull();
  };

  signConstitution = async () => {
    const currentConstitution = await this.fetchCurrentConstitution();
    if (!currentConstitution) return;

    await this.sendTransaction([
      {
        account: ualConfig.chain.contracts.dac,
        name: "memberreg",
        data: {
          sender: this.accountName,
          agreedterms: currentConstitution.hash,
        },
      },
    ]);

    await this.refetchFull();
  };

  liquidate = async (action: LiquidationActionType) => {
    await this.sendTransaction([
      {
        name: action,
        data: {
          usern: this.accountName,
        },
      },
    ]);

    await this.refetchFull();
  };
}

// gatsby-plugin-typescript seems to ignore tsconfig.json changes and uses babel for transpilation
// which means setting experimentalDecorators: true in tsconfig.json does not work
// https://mobx.js.org/best/decorators.html
decorate(WalletStore, {
  ual: observable,
  authenticators: observable,
  tokenBalances: observable,
  accountResources: observable,
  tokenBalancesUsd: computed,
  transactionState: observable,
  hasOpenedAccount: observable,
  hasSignedConstitution: observable,
  constitutionInfo: observable,
  selectedSymbol: observable,
  accountName: observable,
  permission: observable,
  isLoggedIn: computed,
  accountInfo: computed,
  // actions
  onUALChange: action,
  onLogin: action,
  reset: action,
  fetchAccountBalances: action,
  depositFees: action,
  withdrawFees: action,
  depositCollateral: action,
  withdrawCollateral: action,
  depositSavings: action,
  withdrawSavings: action,
  depositInsurance: action,
  withdrawInsurance: action,
});
