import React from "react";
import { ethers } from "ethers";
import { Button, Row, Col, Typography, Divider } from "antd";

const TARGET_HF = 1.8;
// https://docs.aave.com/risk/asset-risk/polygon-market#risk-parameters
const MATIC_LT = 0.65; // Liquidation Threshold for Matic on Polygon 65%

const wMaticAddress = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
const USDTAddress = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"; // aToken
const sUSDTAddress = "0xe590cfca10e81FeD9B0e4496381f02256f5d2f61"; // stable debt
const vUSDTAddress = "0x8038857FD47108A07d1f6Bf652ef1cBeC279A2f3"; // variable debt
const aUSDTAddress = "0x60D55F02A771d515e077c9C2403a1ef324885CeC"; // get all tokens
const SafeCDPFarmerAddress = "0x5c1fD33A842F05c0F4f702928fA1ED4A8bd05020";
const ProtocolDataProviderAddress = "0x7551b5D2763519d4e37e8B81929D336De671d46d";
const ProtocolDataProviderABI = [
  {
    inputs: [{ internalType: "contract ILendingPoolAddressesProvider", name: "addressesProvider", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "ADDRESSES_PROVIDER",
    outputs: [{ internalType: "contract ILendingPoolAddressesProvider", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllATokens",
    outputs: [
      {
        components: [
          { internalType: "string", name: "symbol", type: "string" },
          { internalType: "address", name: "tokenAddress", type: "address" },
        ],
        internalType: "struct AaveProtocolDataProvider.TokenData[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllReservesTokens",
    outputs: [
      {
        components: [
          { internalType: "string", name: "symbol", type: "string" },
          { internalType: "address", name: "tokenAddress", type: "address" },
        ],
        internalType: "struct AaveProtocolDataProvider.TokenData[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "asset", type: "address" }],
    name: "getReserveConfigurationData",
    outputs: [
      { internalType: "uint256", name: "decimals", type: "uint256" },
      { internalType: "uint256", name: "ltv", type: "uint256" },
      { internalType: "uint256", name: "liquidationThreshold", type: "uint256" },
      { internalType: "uint256", name: "liquidationBonus", type: "uint256" },
      { internalType: "uint256", name: "reserveFactor", type: "uint256" },
      { internalType: "bool", name: "usageAsCollateralEnabled", type: "bool" },
      { internalType: "bool", name: "borrowingEnabled", type: "bool" },
      { internalType: "bool", name: "stableBorrowRateEnabled", type: "bool" },
      { internalType: "bool", name: "isActive", type: "bool" },
      { internalType: "bool", name: "isFrozen", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "asset", type: "address" }],
    name: "getReserveData",
    outputs: [
      { internalType: "uint256", name: "availableLiquidity", type: "uint256" },
      { internalType: "uint256", name: "totalStableDebt", type: "uint256" },
      { internalType: "uint256", name: "totalVariableDebt", type: "uint256" },
      { internalType: "uint256", name: "liquidityRate", type: "uint256" },
      { internalType: "uint256", name: "variableBorrowRate", type: "uint256" },
      { internalType: "uint256", name: "stableBorrowRate", type: "uint256" },
      { internalType: "uint256", name: "averageStableBorrowRate", type: "uint256" },
      { internalType: "uint256", name: "liquidityIndex", type: "uint256" },
      { internalType: "uint256", name: "variableBorrowIndex", type: "uint256" },
      { internalType: "uint40", name: "lastUpdateTimestamp", type: "uint40" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "asset", type: "address" }],
    name: "getReserveTokensAddresses",
    outputs: [
      { internalType: "address", name: "aTokenAddress", type: "address" },
      { internalType: "address", name: "stableDebtTokenAddress", type: "address" },
      { internalType: "address", name: "variableDebtTokenAddress", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "getUserReserveData",
    outputs: [
      { internalType: "uint256", name: "currentATokenBalance", type: "uint256" },
      { internalType: "uint256", name: "currentStableDebt", type: "uint256" },
      { internalType: "uint256", name: "currentVariableDebt", type: "uint256" },
      { internalType: "uint256", name: "principalStableDebt", type: "uint256" },
      { internalType: "uint256", name: "scaledVariableDebt", type: "uint256" },
      { internalType: "uint256", name: "stableBorrowRate", type: "uint256" },
      { internalType: "uint256", name: "liquidityRate", type: "uint256" },
      { internalType: "uint40", name: "stableRateLastUpdated", type: "uint40" },
      { internalType: "bool", name: "usageAsCollateralEnabled", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
];
const PriceOracleAddress = "0x0229f777b0fab107f9591a41d5f02e4e98db6f2d";
const PriceOracleABI = [
  {
    inputs: [
      { internalType: "address[]", name: "assets", type: "address[]" },
      { internalType: "address[]", name: "sources", type: "address[]" },
      { internalType: "address", name: "fallbackOracle", type: "address" },
      { internalType: "address", name: "weth", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "asset", type: "address" },
      { indexed: true, internalType: "address", name: "source", type: "address" },
    ],
    name: "AssetSourceUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "address", name: "fallbackOracle", type: "address" }],
    name: "FallbackOracleUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "previousOwner", type: "address" },
      { indexed: true, internalType: "address", name: "newOwner", type: "address" },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "address", name: "weth", type: "address" }],
    name: "WethSet",
    type: "event",
  },
  {
    inputs: [],
    name: "WETH",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "asset", type: "address" }],
    name: "getAssetPrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address[]", name: "assets", type: "address[]" }],
    name: "getAssetsPrices",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getFallbackOracle",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "asset", type: "address" }],
    name: "getSourceOfAsset",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  { inputs: [], name: "renounceOwnership", outputs: [], stateMutability: "nonpayable", type: "function" },
  {
    inputs: [
      { internalType: "address[]", name: "assets", type: "address[]" },
      { internalType: "address[]", name: "sources", type: "address[]" },
    ],
    name: "setAssetSources",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "fallbackOracle", type: "address" }],
    name: "setFallbackOracle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
const AaveAddress = "0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf";
const AaveABI = [
  {
    inputs: [{ internalType: "address", name: "admin", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "address", name: "implementation", type: "address" }],
    name: "Upgraded",
    type: "event",
  },
  { stateMutability: "payable", type: "fallback" },
  {
    inputs: [],
    name: "admin",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "implementation",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_logic", type: "address" },
      { internalType: "bytes", name: "_data", type: "bytes" },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newImplementation", type: "address" }],
    name: "upgradeTo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "newImplementation", type: "address" },
      { internalType: "bytes", name: "data", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];
const AaveProxyAddress = "0x6A8730F54b8C69ab096c43ff217CA0a350726ac7";
const AaveProxyABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "reserve", type: "address" },
      { indexed: false, internalType: "address", name: "user", type: "address" },
      { indexed: true, internalType: "address", name: "onBehalfOf", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "borrowRateMode", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "borrowRate", type: "uint256" },
      { indexed: true, internalType: "uint16", name: "referral", type: "uint16" },
    ],
    name: "Borrow",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "reserve", type: "address" },
      { indexed: false, internalType: "address", name: "user", type: "address" },
      { indexed: true, internalType: "address", name: "onBehalfOf", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
      { indexed: true, internalType: "uint16", name: "referral", type: "uint16" },
    ],
    name: "Deposit",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "target", type: "address" },
      { indexed: true, internalType: "address", name: "initiator", type: "address" },
      { indexed: true, internalType: "address", name: "asset", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "premium", type: "uint256" },
      { indexed: false, internalType: "uint16", name: "referralCode", type: "uint16" },
    ],
    name: "FlashLoan",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "collateralAsset", type: "address" },
      { indexed: true, internalType: "address", name: "debtAsset", type: "address" },
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "debtToCover", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "liquidatedCollateralAmount", type: "uint256" },
      { indexed: false, internalType: "address", name: "liquidator", type: "address" },
      { indexed: false, internalType: "bool", name: "receiveAToken", type: "bool" },
    ],
    name: "LiquidationCall",
    type: "event",
  },
  { anonymous: false, inputs: [], name: "Paused", type: "event" },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "reserve", type: "address" },
      { indexed: true, internalType: "address", name: "user", type: "address" },
    ],
    name: "RebalanceStableBorrowRate",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "reserve", type: "address" },
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: true, internalType: "address", name: "repayer", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "Repay",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "reserve", type: "address" },
      { indexed: false, internalType: "uint256", name: "liquidityRate", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "stableBorrowRate", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "variableBorrowRate", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "liquidityIndex", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "variableBorrowIndex", type: "uint256" },
    ],
    name: "ReserveDataUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "reserve", type: "address" },
      { indexed: true, internalType: "address", name: "user", type: "address" },
    ],
    name: "ReserveUsedAsCollateralDisabled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "reserve", type: "address" },
      { indexed: true, internalType: "address", name: "user", type: "address" },
    ],
    name: "ReserveUsedAsCollateralEnabled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "reserve", type: "address" },
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "rateMode", type: "uint256" },
    ],
    name: "Swap",
    type: "event",
  },
  { anonymous: false, inputs: [], name: "Unpaused", type: "event" },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "reserve", type: "address" },
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "Withdraw",
    type: "event",
  },
  {
    inputs: [],
    name: "FLASHLOAN_PREMIUM_TOTAL",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "LENDINGPOOL_REVISION",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_NUMBER_RESERVES",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_STABLE_RATE_BORROW_SIZE_PERCENT",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "interestRateMode", type: "uint256" },
      { internalType: "uint16", name: "referralCode", type: "uint16" },
      { internalType: "address", name: "onBehalfOf", type: "address" },
    ],
    name: "borrow",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "address", name: "onBehalfOf", type: "address" },
      { internalType: "uint16", name: "referralCode", type: "uint16" },
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "balanceFromBefore", type: "uint256" },
      { internalType: "uint256", name: "balanceToBefore", type: "uint256" },
    ],
    name: "finalizeTransfer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "receiverAddress", type: "address" },
      { internalType: "address[]", name: "assets", type: "address[]" },
      { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
      { internalType: "uint256[]", name: "modes", type: "uint256[]" },
      { internalType: "address", name: "onBehalfOf", type: "address" },
      { internalType: "bytes", name: "params", type: "bytes" },
      { internalType: "uint16", name: "referralCode", type: "uint16" },
    ],
    name: "flashLoan",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getAddressesProvider",
    outputs: [{ internalType: "contract ILendingPoolAddressesProvider", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "asset", type: "address" }],
    name: "getConfiguration",
    outputs: [
      {
        components: [{ internalType: "uint256", name: "data", type: "uint256" }],
        internalType: "struct DataTypes.ReserveConfigurationMap",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "asset", type: "address" }],
    name: "getReserveData",
    outputs: [
      {
        components: [
          {
            components: [{ internalType: "uint256", name: "data", type: "uint256" }],
            internalType: "struct DataTypes.ReserveConfigurationMap",
            name: "configuration",
            type: "tuple",
          },
          { internalType: "uint128", name: "liquidityIndex", type: "uint128" },
          { internalType: "uint128", name: "variableBorrowIndex", type: "uint128" },
          { internalType: "uint128", name: "currentLiquidityRate", type: "uint128" },
          { internalType: "uint128", name: "currentVariableBorrowRate", type: "uint128" },
          { internalType: "uint128", name: "currentStableBorrowRate", type: "uint128" },
          { internalType: "uint40", name: "lastUpdateTimestamp", type: "uint40" },
          { internalType: "address", name: "aTokenAddress", type: "address" },
          { internalType: "address", name: "stableDebtTokenAddress", type: "address" },
          { internalType: "address", name: "variableDebtTokenAddress", type: "address" },
          { internalType: "address", name: "interestRateStrategyAddress", type: "address" },
          { internalType: "uint8", name: "id", type: "uint8" },
        ],
        internalType: "struct DataTypes.ReserveData",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "asset", type: "address" }],
    name: "getReserveNormalizedIncome",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "asset", type: "address" }],
    name: "getReserveNormalizedVariableDebt",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getReservesList",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUserAccountData",
    outputs: [
      { internalType: "uint256", name: "totalCollateralETH", type: "uint256" },
      { internalType: "uint256", name: "totalDebtETH", type: "uint256" },
      { internalType: "uint256", name: "availableBorrowsETH", type: "uint256" },
      { internalType: "uint256", name: "currentLiquidationThreshold", type: "uint256" },
      { internalType: "uint256", name: "ltv", type: "uint256" },
      { internalType: "uint256", name: "healthFactor", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUserConfiguration",
    outputs: [
      {
        components: [{ internalType: "uint256", name: "data", type: "uint256" }],
        internalType: "struct DataTypes.UserConfigurationMap",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "address", name: "aTokenAddress", type: "address" },
      { internalType: "address", name: "stableDebtAddress", type: "address" },
      { internalType: "address", name: "variableDebtAddress", type: "address" },
      { internalType: "address", name: "interestRateStrategyAddress", type: "address" },
    ],
    name: "initReserve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "contract ILendingPoolAddressesProvider", name: "provider", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "collateralAsset", type: "address" },
      { internalType: "address", name: "debtAsset", type: "address" },
      { internalType: "address", name: "user", type: "address" },
      { internalType: "uint256", name: "debtToCover", type: "uint256" },
      { internalType: "bool", name: "receiveAToken", type: "bool" },
    ],
    name: "liquidationCall",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "rebalanceStableBorrowRate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "rateMode", type: "uint256" },
      { internalType: "address", name: "onBehalfOf", type: "address" },
    ],
    name: "repay",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "configuration", type: "uint256" },
    ],
    name: "setConfiguration",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bool", name: "val", type: "bool" }],
    name: "setPause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "address", name: "rateStrategyAddress", type: "address" },
    ],
    name: "setReserveInterestRateStrategyAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "bool", name: "useAsCollateral", type: "bool" },
    ],
    name: "setUserUseReserveAsCollateral",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "rateMode", type: "uint256" },
    ],
    name: "swapBorrowRateMode",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "address", name: "to", type: "address" },
    ],
    name: "withdraw",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];
// TODO добавить прослушку Event чтобы обновлять фронт
export function SafeFarmer({ address, signer }) {
  const [userAave, setUserAave] = React.useState();
  const aaveProxyContract = React.useMemo(() => {
    return new ethers.Contract(AaveAddress, AaveProxyABI, signer);
  }, [signer]);
  const aaveOracleContract = React.useMemo(() => {
    return new ethers.Contract(PriceOracleAddress, PriceOracleABI, signer);
  }, [signer]);
  const ProtocolDataProviderContract = React.useMemo(() => {
    return new ethers.Contract(ProtocolDataProviderAddress, ProtocolDataProviderABI, signer);
  }, [signer]);
  // console.log("logs aaveOracleContract: ", aaveOracleContract);
  React.useEffect(() => {
    async function getUserAccountData() {
      console.log("[MYLOGS] address: ", address);
      // хуй знает откуда берется этот адрес... (разобраться в scaffold-eth)
      if (address !== "0xAF786303cf83E3C1b3df965817b64768D6ed4D31") {
        try {
          const res = await aaveProxyContract.getUserAccountData(address);
          console.log("aaveProxyContract.getUserAccountData(address): ", JSON.stringify(res));
          setUserAave(res);
        } catch (err) {
          console.error(`aaveProxyContract.getUserAccountData(address): ${err}`);
        }
      }
    }
    if (aaveProxyContract && signer && address) {
      getUserAccountData();
    }
  }, [aaveProxyContract, signer, address]);
  const rebalanceModule = React.useMemo(() => {
    async function rebalance(targetBorrowAmount) {
      // https://docs.aave.com/developers/the-core-protocol/lendingpool#borrow
      // function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf)
      // const asset = wMaticAddress; // [address] address of the underlying asset
      const asset = USDTAddress; // vUSDTAddress; // [address] address of the underlying asset
      // const forBigNumber = ethers.utils.formatUnits(targetBorrowAmount);
      // console.log("forBigNumber: ", forBigNumber);

      console.log("logs ProtocolDataProviderContract: ", ProtocolDataProviderContract);
      const allTokens = await ProtocolDataProviderContract.getAllReservesTokens(); // getAllATokens();
      console.log("logs reserves allTokens: ", allTokens);

      let usdtEth = 0;
      const asd = await aaveOracleContract.getAssetPrice(asset);
      console.log("logs asd: ", asd);
      try {
        usdtEth = await aaveOracleContract.getAssetPrice(asset);
      } catch (err) {
        console.log("logs aaveOracleContract.getAssetPrice(asset): ", err);
      }

      console.log("logs usdtEth: ", usdtEth);
      // const amount = ethers.BigNumber.from(ethers.utils.formatUnits(targetBorrowAmount)); // [uint256]
      const amount = ethers.BigNumber.from(targetBorrowAmount); // [uint256]
      // console.log(
      //   "logs ethers.BigNumber.from(ethers.utils.formatUnits(targetBorrowAmount)): ",
      //   ethers.BigNumber.from(ethers.utils.formatUnits(targetBorrowAmount)),
      // );
      const toNumberAmount = amount.toNumber();
      console.log("logs toNumberAmount: ", toNumberAmount);
      // console.log("logs ethers.utils.formatUnits(targetBorrowAmount): ",
      // ethers.utils.formatUnits(targetBorrowAmount));
      // console.log(
      //   "logs ethers.utils.formatUnits(targetBorrowAmount): ",
      //   ethers.BigNumber.from(ethers.utils.formatUnits(targetBorrowAmount)),
      // );
      // amount to be borrowed, expressed in wei
      // units
      const interestRateMode = ethers.BigNumber.from(2); // [uint256] the type of borrow debt. Stable: 1, Variable: 2
      const referralCode = 0; // [uint16] referral code for our referral program. Use 0 for
      // no referral code.
      console.log("logs onBehalfOf: ", address);
      const onBehalfOf = address; // [address] address of user who will incur the debt
      // string public constant VL_RESERVE_FROZEN = '3'; // 'Action cannot be performed because the reserve is frozen'
      // 3 Currency not borrowed
      const borrowData = {
        asset,
        // targetBorrowAmount,
        amount,
        interestRateMode,
        referralCode,
        onBehalfOf,
      };
      console.log("logs borrow data: ", borrowData);

      try {
        const res = await aaveProxyContract.borrow(asset, amount, interestRateMode, referralCode, onBehalfOf);
        console.log("logs rebalance res: ", res);
      } catch (err) {
        console.log("logs rebalance err: ", err);
      }
    }

    if (userAave) {
      const currentHF = ethers.utils.formatUnits(userAave.healthFactor);
      console.log("logs HFS: ", {
        currentHF,
        TARGET_HF,
        numberCHF: Number(currentHF),
      });
      const isRange = Number(currentHF) >= TARGET_HF - 0.05 && Number(currentHF) <= TARGET_HF + 0.05;

      if (isRange)
        return {
          rebalance: () => {},
          rise: null,
          targetBorrowAmount: "nothing to do",
          currentHF: `${currentHF} in range [1.75, 1.85]`,
        };

      const totalCollateral = userAave.totalCollateralETH;
      const totalDebtETH = userAave.totalDebtETH;
      const targetBorrowAmount = Math.ceil((totalCollateral * MATIC_LT) / TARGET_HF - totalDebtETH);
      const isRise = currentHF > TARGET_HF + 0.5;

      return {
        rebalance,
        rise: isRise,
        targetBorrowAmount,
        currentHF,
      };
    }
  }, [userAave, address]);

  return (
    <Row justify="center">
      <Col>
        <Divider />

        <Row gutter={4}>
          <Typography level={3}>SafeCDPFarmer</Typography>
        </Row>
        <Row gutter={4}>
          <Typography strong>User Address: {address}</Typography>
        </Row>

        <Divider />

        <Row gutter={4}>
          <Typography strong>
            totalCollateralETH: {userAave ? ethers.utils.formatUnits(userAave.totalCollateralETH) : "loading..."}
            <i> total collateral in ETH of the user</i>
          </Typography>
        </Row>
        <Row gutter={4}>
          <Typography strong>
            totalDebtETH: {userAave ? ethers.utils.formatUnits(userAave.totalDebtETH) : "loading..."}
            <i> total debt in ETH of the user</i>
          </Typography>
        </Row>
        <Row gutter={4}>
          <Typography strong>
            availableBorrowsETH: {userAave ? ethers.utils.formatUnits(userAave.availableBorrowsETH) : "loading..."}
            <i> borrowing power left of the user</i>
          </Typography>
        </Row>
        <Row gutter={4}>
          <Typography strong>
            currentLiquidationThreshold:{" "}
            {userAave ? ethers.utils.formatUnits(userAave.currentLiquidationThreshold) : "loading..."}
            <i> liquidation threshold of the user</i>
          </Typography>
        </Row>
        <Row gutter={4}>
          <Typography strong>
            ltv: {userAave ? ethers.utils.formatUnits(userAave.ltv) : "loading..."}
            <i> Loan To Value of the user</i>
          </Typography>
        </Row>
        <Row gutter={4}>
          <Typography strong>
            healthFactor: {userAave ? ethers.utils.formatUnits(userAave.healthFactor) : "loading..."}
            <i> current health factor of the user. Also see liquidationCall()</i>
          </Typography>
        </Row>

        <Divider />

        <Row gutter={4}>
          <Typography strong>Target Health Factor: 1.8</Typography>
        </Row>
        <Row gutter={4}>
          <Typography strong>Current Health Factor: {userAave ? rebalanceModule.currentHF : "loading..."}</Typography>
        </Row>

        <Row gutter={4}>
          <Typography strong>
            {userAave && rebalanceModule.rise
              ? "Need to borrow money on Aave and deposit on Curve: "
              : "Need withdraw money on Curve and repay on Aave: "}
            {userAave
              ? typeof rebalanceModule.targetBorrowAmount !== "string"
                ? ethers.utils.formatUnits(rebalanceModule.targetBorrowAmount)
                : rebalanceModule.targetBorrowAmount
              : "loading..."}
          </Typography>
        </Row>

        <Divider />

        {userAave && (
          <Row gutter={4}>
            <Button onClick={() => rebalanceModule.rebalance(rebalanceModule.targetBorrowAmount)}>Rebalance</Button>
          </Row>
        )}
      </Col>
    </Row>
  );
}
