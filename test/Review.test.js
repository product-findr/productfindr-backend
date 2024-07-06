const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Review", function () {
  async function deployContractsFixture() {
    const [owner, otherUser, reviewer1, reviewer2] = await ethers.getSigners();

    const BetaTestingDetailsManager = await ethers.getContractFactory(
      "BetaTestingDetailsManager"
    );
    const betaTestingManager = await BetaTestingDetailsManager.deploy();
    await betaTestingManager.waitForDeployment();

    const Product = await ethers.getContractFactory("Product");
    const product = await Product.deploy(
      owner.address,
      betaTestingManager.target
    );
    await product.waitForDeployment();

    const Review = await ethers.getContractFactory("Review");
    const review = await Review.deploy(product.target);
    await review.waitForDeployment();

    return {
      product,
      review,
      betaTestingManager,
      owner,
      otherUser,
      reviewer1,
      reviewer2,
    };
  }

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
    targetNumbersOfTester: 100,
    testingGoal: "Test Goal",
    goals: ["Goal 1", "Goal 2"],
    startingDate: Math.floor(Date.now() / 1000), // current timestamp in seconds
    endingDate: Math.floor(Date.now() / 1000) + 86400, // current timestamp + 1 day
  };

  it("Should allow a user to add a review to a product without beta testing", async function () {
    const { product, review, owner, reviewer1 } = await loadFixture(
      deployContractsFixture
    );

    const betaTestingAvailable = false;
    await product
      .connect(owner)
      .registerProduct(
        owner.address,
        productDetailsWithoutBetaTesting,
        betaTestingAvailable,
        betaTestingDetails
      );
    await review
      .connect(reviewer1)
      .addReview(reviewer1.address, 1, "Great product!", 5);

    const reviews = await review.getReviews(1);
    expect(reviews.length).to.equal(1);
    expect(reviews[0].content).to.equal("Great product!");
    expect(reviews[0].rating).to.equal(5);
    expect(reviews[0].reviewer).to.equal(reviewer1.address);
  });

  it("Should allow a user to add a review to a product with beta testing", async function () {
    const { product, review, owner, reviewer1 } = await loadFixture(
      deployContractsFixture
    );

    const betaTestingAvailable = true;
    await product
      .connect(owner)
      .registerProduct(
        owner.address,
        productDetailsWithBetaTesting,
        betaTestingAvailable,
        betaTestingDetails
      );
    await review
      .connect(reviewer1)
      .addReview(reviewer1.address, 1, "Great product!", 5);

    const reviews = await review.getReviews(1);
    expect(reviews.length).to.equal(1);
    expect(reviews[0].content).to.equal("Great product!");
    expect(reviews[0].rating).to.equal(5);
    expect(reviews[0].reviewer).to.equal(reviewer1.address);
  });

  it("Should get the number of reviews for a product", async function () {
    const { product, review, owner, reviewer1, reviewer2 } = await loadFixture(
      deployContractsFixture
    );

    const betaTestingAvailable = false;
    await product
      .connect(owner)
      .registerProduct(
        owner.address,
        productDetailsWithoutBetaTesting,
        betaTestingAvailable,
        betaTestingDetails
      );
    await review
      .connect(reviewer1)
      .addReview(reviewer1.address, 1, "Great product!", 5);
    await review
      .connect(reviewer2)
      .addReview(reviewer2.address, 1, "I love it!", 4);

    const reviewsCount = await review.getReviewsCount(1);
    expect(reviewsCount).to.equal(2);
  });

  it("Should get a specific review by ID", async function () {
    const { product, review, owner, reviewer1, reviewer2 } = await loadFixture(
      deployContractsFixture
    );

    const betaTestingAvailable = false;
    await product
      .connect(owner)
      .registerProduct(
        owner.address,
        productDetailsWithoutBetaTesting,
        betaTestingAvailable,
        betaTestingDetails
      );
    await review
      .connect(reviewer1)
      .addReview(reviewer1.address, 1, "Great product!", 5);
    await review
      .connect(reviewer2)
      .addReview(reviewer2.address, 1, "I love it!", 4);

    const singleReview = await review.getReview(1, 1);
    expect(singleReview.content).to.equal("I love it!");
    expect(singleReview.reviewer).to.equal(reviewer2.address);
  });

  it("Should return the correct reviewer address", async function () {
    const { product, review, owner, reviewer1 } = await loadFixture(
      deployContractsFixture
    );

    const betaTestingAvailable = false;
    await product
      .connect(owner)
      .registerProduct(
        owner.address,
        productDetailsWithoutBetaTesting,
        betaTestingAvailable,
        betaTestingDetails
      );
    await review
      .connect(reviewer1)
      .addReview(reviewer1.address, 1, "Great product!", 5);

    const reviewerAddress = await review.getReviewer(1, 0);
    expect(reviewerAddress).to.equal(reviewer1.address);
  });

  it("Should revert if the product does not exist", async function () {
    const { review, reviewer1 } = await loadFixture(deployContractsFixture);
    await expect(
      review
        .connect(reviewer1)
        .addReview(reviewer1.address, 999, "Invalid product!", 5)
    ).to.be.revertedWith("Product does not exist");
  });

  it("Should revert if the rating is out of bounds", async function () {
    const { product, review, owner, reviewer1 } = await loadFixture(
      deployContractsFixture
    );

    const betaTestingAvailable = false;
    await product
      .connect(owner)
      .registerProduct(
        owner.address,
        productDetailsWithoutBetaTesting,
        betaTestingAvailable,
        betaTestingDetails
      );
    await expect(
      review
        .connect(reviewer1)
        .addReview(reviewer1.address, 1, "Invalid rating!", 6)
    ).to.be.revertedWith("Rating must be between 1 and 5");
  });

  it("Should revert if the review content is empty", async function () {
    const { product, review, owner, reviewer1 } = await loadFixture(
      deployContractsFixture
    );

    const betaTestingAvailable = false;
    await product
      .connect(owner)
      .registerProduct(
        owner.address,
        productDetailsWithoutBetaTesting,
        betaTestingAvailable,
        betaTestingDetails
      );
    await expect(
      review.connect(reviewer1).addReview(reviewer1.address, 1, "", 5)
    ).to.be.revertedWith("Review content cannot be empty");
  });
});
