const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Product", function () {
  let product;
  let owner;
  let otherUser;
  let betaTestingManager;
  let ProductFactory;

  beforeEach(async function () {
    [owner, otherUser] = await ethers.getSigners();

    const BetaTestingDetailsManager = await ethers.getContractFactory(
      "BetaTestingDetailsManager"
    );
    betaTestingManager = await BetaTestingDetailsManager.deploy();
    await betaTestingManager.waitForDeployment();

    ProductFactory = await ethers.getContractFactory("Product");
    product = await ProductFactory.deploy(owner.address);
    await product.waitForDeployment();
  });

  const productDetailsWithoutBetaTesting = {
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
    betaTestingLink: "",
  };

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

  const betaTestingDetails = {
    contractAddress: "0x",
    targetNumbersOfTester: 100,
    testingGoal: "Test Goal",
    goals: ["Goal 1", "Goal 2"],
    startingDate: Math.floor(Date.now() / 1000), // current timestamp in seconds
    endingDate: Math.floor(Date.now() / 1000) + 86400, // current timestamp + 1 day
    featureLoomLink: "http://feature.loom.link",
  };

  it("Should register a new product without beta testing", async function () {
    const betaTestingAvailable = false;
    await product.registerProduct(
      owner.address,
      productDetailsWithoutBetaTesting,
      betaTestingAvailable,
      betaTestingDetails
    );
    const productInfo = await product.getProduct(1);
    expect(productInfo.product.details.productName).to.equal("Test Product");
    expect(productInfo.product.owner).to.equal(owner.address);
  });

  it("Should register a new product with beta testing", async function () {
    const betaTestingAvailable = true;
    await product.registerProduct(
      owner.address,
      productDetailsWithBetaTesting,
      betaTestingAvailable,
      betaTestingDetails
    );
    const productInfo = await product.getProduct(1);

    expect(productInfo.product.details.productName).to.equal("Test Product");
    expect(productInfo.product.owner).to.equal(owner.address);
    expect(productInfo.betaTestingDetails.testingGoal).to.equal("Test Goal");
  });

  it("Should register a new product without duplicate entries", async function () {
    const betaTestingAvailable = true;
    await product.registerProduct(
      owner.address,
      productDetailsWithBetaTesting,
      betaTestingAvailable,
      betaTestingDetails
    );
    const listedProducts = await product.getListedProducts();
    expect(listedProducts.length).to.equal(1);
    const productInfo = await product.getProduct(1);
    expect(productInfo.product.details.productName).to.equal("Test Product");
  });

  it("Should revert if beta testing link is missing when beta testing is enabled", async function () {
    const invalidProductDetails = {
      ...productDetailsWithBetaTesting,
      betaTestingLink: "",
    };

    const betaTestingAvailable = true;
    await expect(
      product.registerProduct(
        owner.address,
        invalidProductDetails,
        betaTestingAvailable,
        betaTestingDetails
      )
    ).to.be.revertedWith("Beta testing link required");
  });

  it("Should upvote a product", async function () {
    const betaTestingAvailable = false;
    await product.registerProduct(
      owner.address,
      productDetailsWithoutBetaTesting,
      betaTestingAvailable,
      betaTestingDetails
    );
    await product.connect(otherUser).upvoteProduct(1, otherUser.address);
    const productInfo = await product.getProduct(1);
    expect(productInfo.product.upvotes).to.equal(1);
  });

  it("Should not allow product owner to upvote their own product", async function () {
    const betaTestingAvailable = false;
    await product.registerProduct(
      owner.address,
      productDetailsWithoutBetaTesting,
      betaTestingAvailable,
      betaTestingDetails
    );
    await expect(product.upvoteProduct(1, owner.address)).to.be.revertedWith(
      "Product owner cannot upvote their own product"
    );
  });

  it("Should revert if user tries to upvote a product more than once", async function () {
    const betaTestingAvailable = false;
    await product.registerProduct(
      owner.address,
      productDetailsWithoutBetaTesting,
      betaTestingAvailable,
      betaTestingDetails
    );
    await product.connect(otherUser).upvoteProduct(1, otherUser.address);
    await expect(
      product.connect(otherUser).upvoteProduct(1, otherUser.address)
    ).to.be.revertedWith("User has already upvoted this product");
  });

  it("Should get Listed Products", async function () {
    const betaTestingAvailable = false;
    await product.registerProduct(
      owner.address,
      productDetailsWithoutBetaTesting,
      betaTestingAvailable,
      betaTestingDetails
    );
    await product.registerProduct(
      owner.address,
      productDetailsWithoutBetaTesting,
      betaTestingAvailable,
      betaTestingDetails
    );
    await product.registerProduct(
      owner.address,
      productDetailsWithoutBetaTesting,
      betaTestingAvailable,
      betaTestingDetails
    );

    const listedProducts = await product.getListedProducts();
    expect(listedProducts.length).to.equal(3);
  });

  it("Should get Product Details", async function () {
    const betaTestingAvailable = false;
    await product.registerProduct(
      owner.address,
      productDetailsWithoutBetaTesting,
      betaTestingAvailable,
      betaTestingDetails
    );
    const productDetails = await product.getProduct(1);
    expect(productDetails.product.details.productName).to.equal("Test Product");
  });

  it("Should delete a product", async function () {
    const betaTestingAvailable = false;
    await product.registerProduct(
      owner.address,
      productDetailsWithoutBetaTesting,
      betaTestingAvailable,
      betaTestingDetails
    );
    await product.deleteProduct(1);
    await expect(product.getProduct(1)).to.be.revertedWith(
      "Product does not exist"
    );
  });

  it("Should revert if non-owner tries to delete a product", async function () {
    const betaTestingAvailable = false;
    await product.registerProduct(
      owner.address,
      productDetailsWithoutBetaTesting,
      betaTestingAvailable,
      betaTestingDetails
    );
    await expect(
      product.connect(otherUser).deleteProduct(1)
    ).to.be.revertedWith("Only the product owner can perform this action");
  });

  it("Should revert if trying to delete a non-existent product", async function () {
    await expect(product.deleteProduct(999)).to.be.revertedWith(
      "Product does not exist"
    );
  });

  it("Should update beta testing link", async function () {
    const betaTestingAvailable = true;
    await product.registerProduct(
      owner.address,
      productDetailsWithBetaTesting,
      betaTestingAvailable,
      betaTestingDetails
    );

    const newBetaTestingLink = "http://new.beta.testing/link";
    await product.updateBetaTestingLink(1, newBetaTestingLink);

    const productInfo = await product.getProduct(1);
    expect(productInfo.product.details.betaTestingLink).to.equal(
      newBetaTestingLink
    );
  });

  it("Should revert if non-owner tries to update beta testing link", async function () {
    const betaTestingAvailable = true;
    await product.registerProduct(
      owner.address,
      productDetailsWithBetaTesting,
      betaTestingAvailable,
      betaTestingDetails
    );

    const newBetaTestingLink = "http://new.beta.testing/link";
    await expect(
      product.connect(otherUser).updateBetaTestingLink(1, newBetaTestingLink)
    ).to.be.revertedWith("Only the product owner can perform this action");
  });

  it("Should fail to register a product without essential fields", async function () {
    const betaTestingAvailable = false;
    const invalidProductDetails = {
      ...productDetailsWithoutBetaTesting,
      productName: "",
    };

    await expect(
      product.registerProduct(
        owner.address,
        invalidProductDetails,
        betaTestingAvailable,
        betaTestingDetails
      )
    ).to.be.revertedWith("Product name cannot be empty");
  });

  it("Should validate product registration timestamp", async function () {
    const betaTestingAvailable = false;
    await product.registerProduct(
      owner.address,
      productDetailsWithoutBetaTesting,
      betaTestingAvailable,
      betaTestingDetails
    );

    const productInfo = await product.getProduct(1);
    const blockTimestamp = (await ethers.provider.getBlock("latest")).timestamp;
    expect(productInfo.product.timestamp).to.be.closeTo(blockTimestamp, 60);
  });

  it("Should only store beta testing details when beta testing is enabled", async function () {
    const betaTestingAvailable = false;
    await product.registerProduct(
      owner.address,
      productDetailsWithoutBetaTesting,
      betaTestingAvailable,
      betaTestingDetails
    );

    const productInfo = await product.getProduct(1);
    expect(productInfo.hasBetaTestingDetails).to.be.false;
  });

  it("Should retrieve beta testing details when available", async function () {
    const betaTestingAvailable = true;
    await product.registerProduct(
      owner.address,
      productDetailsWithBetaTesting,
      betaTestingAvailable,
      betaTestingDetails
    );

    const betaDetails = await product.getProduct(1);
    expect(betaDetails.betaTestingDetails.testingGoal).to.equal("Test Goal");
  });

  it("Should ensure unique product IDs", async function () {
    const betaTestingAvailable = false;
    await product.registerProduct(
      owner.address,
      productDetailsWithoutBetaTesting,
      betaTestingAvailable,
      betaTestingDetails
    );
    await product.registerProduct(
      owner.address,
      productDetailsWithBetaTesting,
      betaTestingAvailable,
      betaTestingDetails
    );

    const product1 = await product.getProduct(1);
    const product2 = await product.getProduct(2);

    expect(product1.product.id).to.equal(1);
    expect(product2.product.id).to.equal(2);
  });
});
