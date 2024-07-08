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
    product = await ProductFactory.deploy(
      owner.address,
      betaTestingManager.target
    );
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
    expect(productInfo.details.productName).to.equal("Test Product");
    expect(productInfo.owner).to.equal(owner.address);
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

    // Fetch the beta testing details
    const betaDetails = await betaTestingManager.getBetaTestingDetails(1);

    expect(productInfo.details.productName).to.equal("Test Product");
    expect(productInfo.owner).to.equal(owner.address);
    expect(betaDetails.testingGoal).to.equal("Test Goal");
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
    expect(productInfo.upvotes).to.equal(1);
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
    expect(productDetails.details.productName).to.equal("Test Product");
  });
});
