# index-coop Deployments

This repository manages IndexCoop contract deployments using the [hardhat-deploy plugin][22].

Each deployment is tracked and recorded by network in a [deployments/outputs][23] file.

**All proposed deployments should:**
+ deploy to HardhatEVM
+ have unit tests which check the correctness of state variables set in the constructor
+ be deployed to Kovan and verified from the command line on `kovan.etherscan`

## Install
```
cp .env.default .env
yarn
```

## Launch test client
```
yarn chain
```

## Test (deployment)
```
yarn clean-dev-deployment
yarn deploy:local
```

## Test (unit)
```
yarn test
```

## Testnet Deployment (Kovan)

Fill in the following fields in your `.env` file:

+ `KOVAN_DEPLOY_PRIVATE_KEY`: An automated kovan faucet [is here][24], or [myCrypto, here][27]
+ `INFURA_TOKEN`: An Infura projectID. Available with an account at [infura.io][25]
+ `ETHERSCAN_API_KEY`: Available with an account from [etherscan.io/api][26]

**Run:**
```
yarn deploy:kovan
yarn etherscan:kovan
```

(If etherscan fails, see the [Etherscan](#etherscan-verification) section below).

## Deployments Guide

New deployments have at least two (and sometimes 3) phases:

| Phase | Pull Request / Op | Pre-requisites |
| ---- | ---- | ----|
| 1 | Deployment script PR with tests | Code merged at [index-coop][33] & published to npm |
| 2 | Executed deployment PR | Phase 1 complete |
| 3 | Activate new components via Gnosis multisig | Phase 2 complete & deployment is production |

### Creating Deployment scripts

Create the new files you'll need by running the `create:deployment` command.

This will generate files numbered for the latest stage in the deploy, deployments, and test folders.

```sh
$ yarn create:deployment btcfli_rebalance_viewer

New deployment files at:
> .../deploy/013_btcfli_rebalance_viewer.ts
> .../deployments/constants/013_btcfli_rebalance_viewer.ts
> .../test/deploys/013_btcfli_rebalance_viewer.spec.ts
```

Then, find the **most recent** scripts and tests which are suitable templates for your deployment
and copy/paste them into the new files, adapting as necessary.

**:bulb: Pro Tips :bulb:**:

+ Verify new contracts on Kovan to catch any contract verification issues early in the process.
+ Useful helpers can be found in [outputHelper.ts][30] and [deployUtils.ts][31]
+ Addresses for on-chain dependencies can be found in [dependencies.ts][32]


### Executing Deployments

| Step | Action | Command |
| ---- | ---- | ---- |
| 1 | Checkout master, `git pull`, and run `yarn` ||
| 2 | Checkout a new branch | `git checkout -b dylan/deploy_....` |
| 3 | Deploy to `staging_mainnet` | `yarn deploy:staging_mainnet` |
| 4 | Verify deployment on Etherscan | `yarn etherscan:staging_mainnet`
| 5 | Check contracts' read/write endpoints in Etherscan's UI |  |
| 6 | Deploy to `production` | `yarn deploy:production` |
| 7 | Verify deployment on Etherscan | `yarn etherscan:production` |
| 8 | Commit automated changes made to outputs logs | |
| 9 | Open PR documenting the addresses of new components | |


### Multisig Operations (deferred transactions)

Some production deployments in index-coop may need to be enabled by additional multisig transactions.
There are executed by stakeholders using Gnosis Safe wallets online.

Deployment scripts should save the tx data generated for these deferred transactions with a flow
similar to that used in set-v2-deployments [deployUtils#addIntegrationToRegistry][28].

**Resources:**
+ [Master list of pending and completed multisig operations][29] (only accessible to SetProtocol engineers)
+ [Multisig transaction utilities](#multisig-transaction-utilities) in this repo.


[22]: https://github.com/wighawag/hardhat-deploy
[23]: https://github.com/SetProtocol/index-deployments/tree/master/deployments/outputs
[24]: https://faucet.kovan.network/
[25]: https://infura.io/
[26]: https://etherscan.io/apis
[27]: https://app.mycrypto.com/faucet
[28]: https://github.com/SetProtocol/set-v2-deployments/blob/325cb49034642767519f969046a3dc8e54b1dd7c/deployments/utils/deployUtils.ts#L83-L100
[29]: https://docs.google.com/spreadsheets/d/1B00zmmBm0SLuYePNgeKTGvXzuRewQ6ymJfm0hQ2SUs4/edit#gid=1026270302
[30]: https://github.com/SetProtocol/index-deployments/blob/master/deploys/outputHelper.ts
[31]: https://github.com/SetProtocol/index-deployments/blob/master/deployments/utils/deployUtils.ts
[32]: https://github.com/SetProtocol/index-deployments/blob/master/deploys/dependencies.ts
[33]: https://github.com/SetProtocol/index-coop-smart-contracts

## Etherscan verification

Set the `ETHERSCAN_API_KEY` in `.env`. (Free API keys are available at [etherscan.io][26])

After deploying, run the command for your network:
```
yarn etherscan:kovan
yarn etherscan:staging_mainnet
yarn etherscan:production
```

**When Etherscan fails...**

Verification may fail because of [solidity issue 9573][1] which causes Etherscan
to generate different bytecode from a minimized contract set than what was generated locally with all contracts in the project. The error message says:

```
Compiling your contract excluding unrelated contracts did not produce identical bytecode.
Trying again with the full solc input used to compile and deploy it.
This means that unrelated contracts may be displayed on Etherscan...
NomicLabsHardhatPluginError: Source code exceeds max accepted (500k chars) length
```

To get around this, use the `compile:one` task to compile your target contract in isolation.

In a deployment script, right before the problematic contract is deployed:
```js
// Compile in isolation for Etherscan verification bug
await bre.run("set:compile:one", { contractName: "MerkleDistributor"});
```

Or at the command line:
```sh
# Example
yarn compile:one MerkleDistributor
yarn deploy:kovan
yarn etherscan:kovan
```

## Deployment creation utility

#### `yarn create:deployment`

The create:deployment command creates standard files necessary for each new deployment. It
takes a deployment name as an argument and automatically prefixes it with the next increment of the
deployment sequence.

```sh
$ yarn create:deployment btcfli_rebalance_viewer

New deployment files at:
> .../deploy/013_btcfli_rebalance_viewer.ts
> .../deployments/constants/013_btcfli_rebalance_viewer.ts
> .../test/deploys/013_btcfli_rebalance_viewer.spec.ts
```
[1]: https://github.com/ethereum/solidity/issues/9573

## Multisig Transaction Utilities

#### `yarn tx`

The `tx` yarn command lets you view transactions deferred for multi-sig execution and compare data
generated by the deployments scripts with data generated by the browser multisig wallets.

**Usage**
```
USAGE: yarn tx <command> [args]

 Commands:
  list:                    lists all deferred transactions by transaction number with description
  view <tx-num>:           shows detail for a deferred transaction
  compare <tx-num> <data>: checks that tx data at `tx-num` matches `data` (from wallet)

 Options:
  --file <descriptor>:     `deployments/outputs/*.json` file to query (defaults: `1-production`)
```

**Examples**

`yarn tx list`
```
Tx   Description
====  ===========
49    Add TradeModule to Controller
50    Add OneInchExchangeAdapter to IntegrationRegistry
55    Add WrapModule to Controller
...
```

`yarn tx view 73`
```
Add GovernanceModule to Controller
==================================
{
  "args": [
   "0x2579D2B186BbA16999016dB077b4874A7520f92e"
  ],
  "signature": "addModule(address)",
  "data": "0x1ed86f190000000000000000000000002579d2b186bba16999016db077b4874a7520f92e"
}
```

`yarn tx compare 73 0xc642747400000....`
```
> Add GovernanceModule to Controller
> ==================================
> OK (data matches)
```

### `yarn console`

Hardhat console exposes a `set` variable which gives you access to all contract methods and
dependency addresses. It can be used to compose transaction data for arbitrary methods
and inputs, as well as fetch recent multisig transactions from Etherscan. The interface is:

```ts
set.addresses: object
set.addressStartsWith(prefix: string)
set.methods(contractName: string)
set.data(methodName: string, args: string[])
await set.recent(maxRecords?: number)
```

**Usage**

`yarn console`
```
> set.addresses
{
  IndexToken: '0x0954906da0Bf32d5479e25f46056d22f08464cab',
  MerkleDistributor: '0xDD111F0fc07F4D89ED6ff96DBAB19a61450b8435',
  StakingRewards: '0x8f06FBA4684B5E0988F215a47775Bb611Af0F986',
  ...
  DPI: '0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b',
  DPI_ETH_UNI_POOL: '0x4d5ef58aac27d99935e5b6b4a6778ff292059991',
  WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  ...
}

> set.addressStartsWith('r')
{
  RewardsNov20MerkleDistributor: '0xa6bb7b6B2C5C3477F20686B98Ea09796F8f93184',
  RewardsDec20MerkleDistributor: '0xEB1CbC809b21DddC71F0F9eDc234eeE6fB29aCEE',
  RewardsJan21MerkleDistributor: '0x319B852cd28B1CbEb029A3017E787B98e62Fd4e2',
  RewardsFeb21MerkleDistributor: '0xCa3C3570beb35E5d3D85BCd8ad8F88BefaccFF10'
}

> set.getAddressName('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D')
'UNISWAP_V2_ROUTER'

> await set.recent()
Fetching recent txs for multisig wallet 0xF8523c551763FE4261A28313015267F163de7541 from etherscan...
[
  ...
  {
    time: 'Fri Mar 26 2021 11:42:31 GMT-0700 (Pacific Daylight Time)',
    txHash:
     '0x95c9d3a5b23219b676fe7ab3320d83795890b5e243b206a46b47009b99d5322a',
    contract: 'FlexibleLeverageStrategyAdapter',
    method:
     'setExecutionSettings((uint256,uint256,uint256,uint256,string,bytes))',
    paramNames: [ '_newExecutionSettings' ],
    args:
     [ '10000000000000000,600000000000000000000,30,20000000000000000,SushiswapExchangeAdapter,0x' ]
  },
]

> set.methods("IndexToken")
[
  'DELEGATION_TYPEHASH()',
  'DOMAIN_TYPEHASH()',
  'allowance(address,address)',
  'approve(address,uint256)',
  ...
]

> set.data("transfer(address,uint256)", [ "0x5bC4249641B4bf4E3....", "381000000000000...." ])
'0xa9059cbb0000000000000000000000005bc4249641b4bf4e37ef513f3fa5c63ecab348810000....'
```
