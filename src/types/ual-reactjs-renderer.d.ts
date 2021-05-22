// https://github.com/EOSIO/universal-authenticator-library/blob/069755cf349635763e20f0d5a5e1e349d2d237bc/src/interfaces.ts
/** The fields that an Authenticator can style on their button */
interface ButtonStyle {
  /** Whatever is provided here will be set as the `src` attribute */
  icon: string

  text: string
  textColor: string

  /** CSS string */
  background: string
}

/** Defines a supported chain */
interface Chain {
  /** The chainId for the chain */
  chainId: string

  /** One or more rpcEndpoints associated with that chainId */
  rpcEndpoints: RpcEndpoint[]
}

interface RpcEndpoint {
  protocol: string
  host: string
  port: number
  path?: string
}

/** Optional arguments to signTransaction */
interface SignTransactionConfig {
  /** If the transaction should also be broadcast */
  broadcast?: boolean

  /** Number of blocks behind (for use with eosjs) */
  blocksBehind?: number

  /** Number of seconds before expiration (for use with eosjs) */
  expireSeconds?: number
}

/** The object returned from signTransaction */
interface SignTransactionResponse {
  /** Was the transaction broadcast */
  wasBroadcast: boolean

  /** The transcation id (optional) */
  transactionId?: string

  /** The status of the transaction as returned by the RPC API (optional) */
  status?: string

  /** Set if there was an error */
  error?: {

    /** The error code */
    code: string,

    /** The error message */
    message: string,

    /** The error name */
    name: string
  }
  /** The raw transaction object */
  transaction: any
}


declare module 'ual-reactjs-renderer' {
  interface UAL {
    chains: any[];
    authenticators: any;
    availableAuthenticators: any[];
    appName: string;
    modal: any;
    loading: boolean;
    users: any[];
    activeAuthenticator: any;
    activeUser: {
      chain: { chainId: string; rpcEndpoints: any[] };
      keys: string[];
      accountName: string;
      rpc: any;
      // does not exist anymore on Anchor / TokenPocket v0.0.3, use signTransaction instead
      api?: any;
      // Scatter
      scatter?: any;
      // Anchor
      requestPermission?: string;
      // Token Pocket
      wallet?: {
        name: string;
        address: string;
        permissions: string[];
      },
      signTransaction(
        transaction: any,
        options: any,
      ): Promise<SignTransactionResponse>,
      getName?(): string,
      getAccountName?(): string,
    };
    isAutoLogin: boolean;
    error: any;
    message: string;
    hideModal: () => void;
    showModal: () => void;
    logout: () => void;
    restart: () => void;
  }

  interface UALProps {
    ual: UAL;
  }

  export const UALProvider: UALProps;
  export const withUAL: Function;
}
