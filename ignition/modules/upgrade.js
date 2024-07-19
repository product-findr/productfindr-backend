const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("UpgradeModule", (m) => {
  console.log("Starting upgrade process...");

  const upgradeContract = (contractName) => {
    console.log(`Upgrading ${contractName}...`);

    // Deploy new implementation
    const newImpl = m.contract(contractName);
    console.log(`Deployed new ${contractName} implementation`);

    // Try to upgrade the proxy
    try {
      const proxyAddress = `DeployModule#${contractName}.proxy`;
      m.call(proxyAddress, "upgradeTo", [newImpl]);
      console.log(`Upgrading ${contractName} proxy...`);
    } catch (error) {
      console.error(`Failed to upgrade ${contractName}: ${error.message}`);
    }

    return newImpl;
  };

  const contracts = [
    "BetaTestingDetailsManager",
    "Product",
    "Comment",
    "Review",
    "UserInfo",
    "ProductFindr",
  ];

  const upgradedContracts = {};

  for (const contractName of contracts) {
    upgradedContracts[contractName] = upgradeContract(contractName);
  }

  console.log("Upgrade process initiated for all contracts!");

  return upgradedContracts;
});
