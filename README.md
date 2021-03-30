# index-coop Deployments

## Install
```
cp .env.default .env
yarn
```

## Etherscan verification

Set `ETHERSCAN_API_KEY=8UC6MJ3E5R2AXIHFZQ6JNU2U5QCV1EZGX5Y` in `.env`

After deploying, run the command for your network:
```
yarn etherscan:kovan
yarn etherscan:staging_mainnet
yarn etherscan:production
```

**Notes**
+ Etherscan recommends you wait 5 confirmations (~2 minutes) before attempting to verify.
+ It's possible for verification to fail because of [solidity issue 9573][1] which causes Etherscan
  to generate different bytecode from a minimized contract set than what was generated locally with
  all contracts in the project. If that happens, you can deploy flattened contracts from remix
  and manually verify on Etherscan *OR*
    + remove all (or most) contracts not in the inheritance tree of your contract from `contracts/`
    + deploy again
    + run the etherscan command at the cli.


[1]: https://github.com/ethereum/solidity/issues/9573#issuecomment-721632715