const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProductFindr - BetaTestingProduct", function () {
  let productFindr, betaTestingProduct, owner, otherUser, betaTestingDetails;

  beforeEach(async function () {
    [owner, otherUser] = await ethers.getSigners();

    const LiveProduct = await ethers.getContractFactory("LiveProduct");
    const liveProduct = await LiveProduct.deploy(owner.address);
    await liveProduct.waitForDeployment();

    const BetaTestingProduct = await ethers.getContractFactory(
      "BetaTestingProduct"
    );
    betaTestingProduct = await BetaTestingProduct.deploy(owner.address);
    await betaTestingProduct.waitForDeployment();

    const Comment = await ethers.getContractFactory("Comment");
    const commentLive = await Comment.deploy(liveProduct.target);
    await commentLive.waitForDeployment();
    const commentBeta = await Comment.deploy(betaTestingProduct.target);
    await commentBeta.waitForDeployment();

    const Review = await ethers.getContractFactory("Review");
    const reviewLive = await Review.deploy(liveProduct.target);
    await reviewLive.waitForDeployment();
    const reviewBeta = await Review.deploy(betaTestingProduct.target);
    await reviewBeta.waitForDeployment();

    const ProductFindr = await ethers.getContractFactory("ProductFindr");
    productFindr = await ProductFindr.deploy(
      liveProduct.target,
      betaTestingProduct.target,
      commentLive.target,
      commentBeta.target,
      reviewLive.target,
      reviewBeta.target
    );
    await productFindr.waitForDeployment();

    betaTestingDetails = {
      contractAddress: "0x0000000000000000000000000000000000000000",
      targetNumbersOfTester: 100,
      testingGoal: "Test Goal",
      goals: ["Goal 1", "Goal 2"],
      startingDate: Math.floor(Date.now() / 1000), // current timestamp in seconds
      endingDate: Math.floor(Date.now() / 1000) + 86400, // current timestamp + 1 day
      featureLoomLink: "http://feature.loom.link",
    };
  });

  const productDetailsWithBetaTesting = {
    productName: "Test Product",
    tagLine: "This is a tagline",
    productLink: "http://product.link",
    twitterLink: "http://twitter.link",
    description: "This is a test product",
    isOpenSource: true,
    category: "category",
    thumbNail: "http://thumbnail.link",
    mediaFile: "http://media.file",
    loomLink: "http://loom.link",
    workedWithTeam: true,
    teamMembersInput: "team member",
    pricingOption: "free",
    offer: "offer details",
    promoCode: "promo code",
    expirationDate: "2023-12-31",
    betaTestingLink: "http://beta.testing/link",
  };

  it("Should revert if beta testing link is missing when beta testing is enabled", async function () {
    const invalidProductDetails = {
      ...productDetailsWithBetaTesting,
      betaTestingLink: "",
    };
    await expect(
      productFindr
        .connect(otherUser)
        .registerBetaTestingProduct(
          otherUser.address,
          invalidProductDetails,
          betaTestingDetails
        )
    ).to.be.revertedWith("Beta testing link required");
  });

  it("Should delete a beta testing product", async function () {
    await productFindr
      .connect(owner)
      .registerBetaTestingProduct(
        owner.address,
        productDetailsWithBetaTesting,
        betaTestingDetails
      );
    await productFindr.connect(owner).deleteBetaTestingProduct(1);
    await expect(productFindr.getBetaTestingProduct(1)).to.be.revertedWith(
      "Product does not exist"
    );
  });
});
