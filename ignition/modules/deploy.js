const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("DeployModule", (m) => {
  // Use m.getAccount(0) to get the deployer's address
  const deployer = m.getAccount(0);

  // Deploy BetaTestingDetailsManager
  const betaTestingManager = m.contract("BetaTestingDetailsManager");

  // Deploy Product with the deployer's address
  const product = m.contract("Product", [deployer]);

  // Deploy other contracts
  const comment = m.contract("Comment", [product]);
  const review = m.contract("Review", [product]);
  const userInfo = m.contract("UserInfo");

  // Deploy ProductFindr with all required arguments
  const productFindr = m.contract("ProductFindr", [
    product,
    comment,
    review,
    betaTestingManager,
    deployer,
  ]);

  return {
    product,
    comment,
    review,
    userInfo,
    productFindr,
    betaTestingManager,
  };
});
