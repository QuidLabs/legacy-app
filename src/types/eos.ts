export type TGlobalStatsRow = {
  solvency: string;
  valueofcol: string;
  valueofins: string;
  scale: string;
  svalueofcole: string;
  svalueofins: string;
  volume: string;
  svalueofcoleavg: string;
  pcts: string;
  savings: string;
  premiums: string;
  rm: string;
  earnrate: string;
  savingsrate: string;
  lastupdate: Date;
  fee: string;
  availability: Date[];
  totaldebt: string;
  insurance: string[];
  collateral: string[];
  l_solvency: string;
  l_valueofcol: string;
  l_scale: string;
  l_svalueofcole: string;
  l_svalueofins: string;
  l_svalueofcoleavg: string;
  l_pcts: string;
  l_premiums: string;
  l_rm: string;
  l_fee: string;
  l_totaldebt: string;
  step: number;
  ac: number;
  savingsscale: string;
  kicktimer: Date;
  bailoutuser: string;
  bailoutupuser: string;
  bailoutid: number;
  rexproxy: number;
  vigfees: string;
  totalvalue: string;
  atimer: Date;
  l_collateral: string[];
};

export type TConfigRow = {
  alphatest: number; // 900;
  soltarget: number; // 10;
  lsoltarget: number; // 25;
  maxtesprice: number; // 5000;
  mintesprice: number; // 50;
  calibrate: number; // 10;
  maxtesscale: number; // 20;
  mintesscale: number; // 1;
  reservecut: number; // 20;
  savingscut: number; // 10;
  maxlends: number; // 30;
  freezelevel: number; // 0;
  assetouttime: number; // 35;
  initialvig: number; // 100;
  viglifeline: number; // 3;
  vigordaccut: number; // 10;
  newacctlim: number; // 100;
  newacctsec: number; // 86400;
  reqstake: number; // 100;
  staketime: number; // 259200;
  repanniv: number; // 2592000;
  maxdisc: number; // 25;
  exectype: number; // 2;
  minebuffer: number; // 30;
  gasfee: number; // 1;
  kickseconds: number; // 2592000;
  initmaxsize: number; // 50000;
  assetintime: number; // 35;
  debtceiling: number; // 250000;
  logcount: number; // 3000;
  gatekeeper: number; // 0;
  liquidate: number; // 0;
  accountslim: number; // 100;
  mincollat: number; // 111;
  rexswitch: number; // 1;
  dataa: number; // 10000;  // 1000; 24h withdrawal limit: equals $1000,
  datab: number; // 1;
  datac: number; // 10;
  datad: string; // "extrafield11";
  proxycontr: string; // "vigorrewards";
  proxypay: string; // "genereospool";
  dactoken: string; // "dactoken1111";
  oraclehub: string; // "vigoraclehub";
  daccustodian: string; // "daccustodia1";
  vigordacfund: string; // "vigordacfund";
  finalreserve: string; // "finalreserve";
  bailoutcr: number;
  bailoutupcr: number;
};

export type TWhitelistRow = {
  sym: string; // "4,VIG";
  contract: string; // "vig111111111";
  feed: string; // "vigeos";
  assetin: number; // 1;
  assetout: number; // 1;
  maxlends: number; // 20;
  lendable: string; // "24404932.2687652276 VIG";
  lendablepct: string; // "0.92550555469069029";
  lentpct: string; // "0.00948283059962408";
};

export type TStatRow = {
  supply: string;
  max_supply: string;
  issuer: string;
};

type Reputation = {
  reputation: string;
  reputation_pct: string;
  vig_since_anniv: string;
  rep_lag0: string;
  rep_lag1: string;
  rep_lag2: string;
  anniv: Date;
};

export type TUserRow = {
  usern: string;
  debt: string;
  reputation: Reputation;
  collateral: string[];
  insurance: string[];
  valueofcol: string;
  valueofins: string;
  tesprice: string;
  earnrate: string;
  pcts: string;
  volcol: string;
  txnvolume: string;
  rewardsave: string;
  prem: string;
  svalueofinsx: string;
  lastupdate: Date;
  l_debt: string;
  l_collateral: any[];
  l_valueofcol: string;
  l_tesprice: string;
  l_pcts: string;
  l_volcol: string;
  savings: string;
  rewardrexvot: string;
  l_prem: string;
  l_svalueofinsx: string;
  vigfees: string;
  rewardlend: string;
  rewardlend2: Date;
};

// {
//   "usern": "useruseruser",
//   "debt": "0.0000 VIGOR",
//   "reputation": {
//     "reputation": "0.00000100940000000",
//     "reputation_pct": "0.14705882352941177",
//     "vig_since_anniv": "0.0000018449 VIG",
//     "rep_lag0": "0.0000010094 VIG",
//     "rep_lag1": "-0.0000000001 VIG",
//     "rep_lag2": "-0.0000000001 VIG",
//     "anniv": "2020-08-19T18:37:37.000"
//   },
//   "collateral": [
//     "100.0141 EOS",
//     "600.0000000000 VIG"
//   ],
//   "insurance": [
//     "100.0000000000 VIG",
//     "10.0022 EOS"
//   ],
//   "valueofcol": "264.16031195000005027",
//   "valueofins": "26.76299690000000453",
//   "tesprice": "0.00000000000000000",
//   "earnrate": "0.00974696014895980",
//   "pcts": "0.00096945045761049",
//   "volcol": "0.35890835455557357",
//   "txnvolume": "0.00000000000000000",
//   "rewardsave": "0.00000000000000000",
//   "prem": "0.00000000000000000",
//   "svalueofinsx": "14417.06371961708646268",
//   "lastupdate": "2020-07-22T13:55:16.500",
//   "l_debt": "0.0000 VIGOR",
//   "l_collateral": [],
//   "l_valueofcol": "0.00000000000000000",
//   "l_tesprice": "0.00000000000000000",
//   "l_pcts": "0.00111708656461588",
//   "l_volcol": "0.00000000000000000",
//   "savings": "0.00000000000000000",
//   "rewardrexvot": "0.01629999999999999",
//   "l_prem": "0.00000000000000000",
//   "l_svalueofinsx": "49502.56922670891071903",
//   "vigfees": "123783974464",
//   "rewardlend": "0.03289744640000001",
//   "rewardlend2": "1970-01-01T00:00:00"
// }

export type TCroneosQeueRow = {
  id: string;
  tag: string;
  action: string;
  due_date: string;
  expiration: string;
  repeat: string;
};

export type TMemberRow = {
  sender: string; // "eosiactest11",
  agreedtermsversion: number; // 2,
};

export type TMembertermsRow = {
  terms: string; // "https://raw.githubusercontent.com/vigorstablecoin/constitution/master/constitution.md",
  hash: string; // "09ea07f0052e6f2a47f7ff5c086116c1",
  version: number; // 2
};

export type TAccountsRow = {
  balance: string;
};

export type TOracleDataPointsRow = {
  id: string; // "18446744073709551508",
  owner: string; // "delphipoller",
  value: number; // 56800
  median: number; // 56863
  timestamp: string; // "1538937978500000"
};

export type TOracleTSeriesRow = {
  freq: number;
  timestamp: string; // "2020-05-07T09:26:57.500";
  price: number[];
  returns: [];
  correlation_matrix: any[];
  vol: number;
};

export type TMarketRow = {
  sym: string; // "4,VIG";
  marketdata: {
    freq: number; // 1;
    timestamp: string; // "2020-07-04T08:38:45.000";
    price: number[]; // [4215];
    returns: any[];
    correlation_matrix: {
      key: string; // "4,VIG";
      value: number; // 1000000;
    }[];
    vol: number; // 1800000;
  };
};

export type TActivityLogRow = {
  id: number; // 12314
  usern: string; // accoun111111
  function:
    | "doassetout"
    | "exassetout"
    | "assetin"
    | "recapup"
    | "recap"
    | "paybacktok"
    | "bailoutup"
    | "bailout"
    | "kick"
    | "dodeleteacnt"
    | "dorewards"
    | "liquidate"
    | "liquidateup"
    | "collectfee"
    | "viglifeline";
  message: string; // assetin:913=> accoun111111 0 accoun111111 tranfers assetin 1.0000 EOS with memo collateral
  timestamp: string; // "2020-05-26T12:08:45.000"
};

export type TBailoutLogRow = {
  id: number; // 12314
  usern: string; // accoun111111
  type: "liquidate" | "liquidateup" | "recap" | "recapup";
  bailoutid: number; // 5
  pcts: number; // 0.02065787716040835
  debt: string[]; // ["1.000 VIG", "25.0005 EOS"]
  collateral: string[]; // ["1.000 VIG", "25.0005 EOS"]
  recap1: string[]; // ["1.000 VIG", "25.0005 EOS"]
  recap2: string[]; // ["1.000 VIG", "25.0005 EOS"]
  recap3: string[]; // ["1.000 VIG", "25.0005 EOS"]
  recap3b: string[]; // ["1.000 VIG", "25.0005 EOS"]
  blockedins: string[]; // ["1.000 VIG", "25.0005 EOS"]
  blockeddebt: string[]; // ["1.000 VIG", "25.0005 EOS"]
  timestamp: string; // "2020-05-26T12:08:45.000"
};

export type TGetAccountResponse = {
  account_name: string;
  head_block_num: number;
  head_block_time: Date;
  privileged: boolean;
  last_code_update: Date;
  created: Date;
  core_liquid_balance: string;
  ram_quota: number;
  net_weight: number;
  cpu_weight: number;
  net_limit: {
    used: number;
    available: number;
    max: number;
  };
  cpu_limit: {
    used: number;
    available: number;
    max: number;
  };
  ram_usage: number;
  permissions: {
    perm_name: string;
    parent: string;
    required_auth: {
      threshold: number;
      keys: {
        key: string;
        weight: number;
      }[];
      accounts: any[];
      waits: any[];
    };
  }[];
  total_resources: {
    owner: string;
    net_weight: string;
    cpu_weight: string;
    ram_bytes: number;
  };
  self_delegated_bandwidth: {
    from: string;
    to: string;
    net_weight: string;
    cpu_weight: string;
  };
  refund_request?: any;
  voter_info: {
    owner: string;
    proxy: string;
    producers: any[];
    staked: number;
    last_vote_weight: string;
    proxied_vote_weight: string;
    is_proxy: number;
    flags1: number;
    reserved2: number;
    reserved3: string;
  };
  rex_info?: any;
};


export type TransferItem = {
  block: {
    num: number,
    timestamp: string,
  },
  data: {
    from: string,
    memo: string,
    to: string,
    quantity: string,
  },
  transferQuantity: number,
  transferToken: string,
  txid: string,
}

export type BailoutItem = {
  bailoutid: number,
  timestamp: string,
  type: 'bailout' | 'bailoutup',
}

export type LiquidationActionType = 'liquidate' | 'liquidateup';
