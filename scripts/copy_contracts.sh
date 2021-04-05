#!/usr/bin/env bash

yarn clean-artifacts
mkdir contracts
cp -rf node_modules/@setprotocol/index-coop-contracts/contracts/* ./contracts/.
mkdir artifacts
cp -rf node_modules/@setprotocol/index-coop-contracts/artifacts/* ./artifacts/.
mkdir external
cp -rf node_modules/@setprotocol/index-coop-contracts/external/* ./external/.
