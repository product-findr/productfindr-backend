const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("DeployModule", (m) => {
  console.log("Starting deployment...");

  const deployer = m.getAccount(0);
  console.log("Deployer account:", deployer);

  // Deploy BetaTestingDetailsManager
  console.log("Deploying BetaTestingDetailsManager...");
  const betaTestingManager = m.contract("BetaTestingDetailsManager", [], {
    from: deployer,
    proxy: {
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        methodName: "initialize",
        args: [deployer],
      },
    },
  });

  // Deploy Product
  console.log("Deploying Product...");
  const product = m.contract("Product", [], {
    from: deployer,
    proxy: {
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        methodName: "initialize",
        args: [deployer],
      },
    },
  });

  // Deploy Comment
  console.log("Deploying Comment...");
  const comment = m.contract("Comment", [], {
    from: deployer,
    proxy: {
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        methodName: "initialize",
        args: [product],
      },
    },
  });

  // Deploy Review
  console.log("Deploying Review...");
  const review = m.contract("Review", [], {
    from: deployer,
    proxy: {
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        methodName: "initialize",
        args: [product],
      },
    },
  });

  // Deploy UserInfo
  console.log("Deploying UserInfo...");
  const userInfo = m.contract("UserInfo", [], {
    from: deployer,
    proxy: {
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        methodName: "initialize",
        args: [deployer],
      },
    },
  });

  // Deploy ProductFindr
  console.log("Deploying ProductFindr...");
  const productFindr = m.contract("ProductFindr", [], {
    from: deployer,
    proxy: {
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        methodName: "initialize",
        args: [product, comment, review, betaTestingManager, deployer],
      },
    },
  });

  console.log("All contracts deployment initiated!");

  return {
    betaTestingManager,
    product,
    comment,
    review,
    userInfo,
    productFindr,
  };
});
