const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("MultiContractModule", (m) => {
  console.log("Starting multi-contract deployment process...");

  const contracts = [
    "BetaTestingDetailsManager",
    "Comment",
    "Product",
    "ProductFindr",
    "Review",
    "UserInfo",
  ];

  const deployedContracts = {};

  for (const contractName of contracts) {
    console.log(`Deploying ${contractName}...`);
    deployedContracts[contractName] = m.contract(contractName);
    console.log(`${contractName} deployment prepared.`);
  }

  console.log("Multi-contract deployment process completed!");
  return deployedContracts;
});
