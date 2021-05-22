const eosJungleNetwork = {
  chainId: "2a02a0053e5a8cf73a56ba0fda11e4d92e0238a4a2aa74fccf46d5a910746840",
  rpcEndpoints: [
    // {
    //   protocol: "https",
    //   host: "jungle3.eosdac.io",
    //   port: 443
    // },
    {
      protocol: "https",
      host: "jungle.dfuse.eosnation.io",
      port: 443
    },
    {
      protocol: "https",
      host: "api.jungle3.alohaeos.com",
      port:443
    },
    {
      protocol: "https",
      host: "jungle3.cryptolions.io",
      port: 443
    }
  ],
  contracts: {
    vigorBusiness: 'vigorlending',
    dac: 'dactoken1111',
    oracle: 'vigoraclehub',
    auth: 'vigorbackend',
    croneos: 'croncron3333',
  },
  tokens: {
    VIG: {
      symbol: { code: "VIG", precision: 4 },
      contract: "vig111111111",
    },
    EOS: {
      symbol: { code: "EOS", precision: 4 },
      contract: "eosio.token",
    },
    VIGOR: {
      symbol: { code: "VIGOR", precision: 4 },
      contract: "vigortoken11",
    },
    IQ: {
      symbol: { code: "IQ", precision: 3 },
      contract: "dummytokensx",
    },
    USDT: {
      symbol: { code: "USDT", precision: 8 },
      contract: "dummytokensx",
    },
    PBTC: {
      symbol: { code: "PBTC", precision: 8 },
      contract: "dummytokensx",
    }
  }
};

const eosMainNet = {
  chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
  rpcEndpoints: [
    {
      protocol: 'https',
      host: 'eos.greymass.com',
      port: 443
    },
    {
      protocol: 'https',
      host: 'api.eosn.io',
      port: 443
    },
    {
      protocol: 'https',
      host: 'api.eoseoul.io',
      port: 443
    },
    {
      protocol: 'https',
      host: 'api.eoslaomao.com',
      port: 443
    },
    {
      protocol: "https",
      host: "nodes.get-scatter.com",
      port: 443
    },
    {
      protocol: "https",
      host: "api.eossweden.org",
      port: 443
    },
    {
      protocol: "https",
      host: "api.main.alohaeos.com",
      port: 443
    },
    {
      protocol: "https",
      host: "bp.cryptolions.io",
      port: 443
    },
    {
      protocol: "https",
      host: "mainnet.eosamsterdam.net",
      port: 443
    },
  ],
  contracts: {
    vigorBusiness: 'vigorlending',
    dac: 'dactoken1111',
    oracle: 'vigoraclehub',
    auth: 'vigorbackend',
    croneos: 'cron.eos',
  },
  tokens: {
    VIG: {
      symbol: { code: "VIG", precision: 4 },
      contract: "vig111111111",
    },
    EOS: {
      symbol: { code: "EOS", precision: 4 },
      contract: "eosio.token",
    },
    USDT: {
      symbol: { code: "USDT", precision: 4 },
      contract: "tethertether",
    },
    VIGOR: {
      symbol: { code: "VIGOR", precision: 4 },
      contract: "vigortoken11",
    },
    IQ: {
      symbol: { code: "IQ", precision: 3 },
      contract: "everipediaiq",
    },
    PBTC: {
      symbol: { code: "PBTC", precision: 8 },
      contract: "btc.ptokens",
    },
  }
};

export default {
  isTestNet: process.env.GATSBY_EOSIO_CHAIN === "jungle",
  chain: process.env.GATSBY_EOSIO_CHAIN === "jungle" ? eosJungleNetwork : eosMainNet
};
