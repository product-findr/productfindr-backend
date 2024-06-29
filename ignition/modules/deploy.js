const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const DeployModule = buildModule("DeployModule", (m) => {
  const product = m.contract("Product", [m.deployer]);
  const comment = m.contract("Comment", [product]);
  const review = m.contract("Review", [product]);
  const userInfo = m.contract("UserInfo");

  const productFindr = m.contract("ProductFindr", [
    product,
    comment,
    review,
    m.deployer,
  ]);

  return { product, comment, review, userInfo, productFindr };
});

module.exports = DeployModule;
