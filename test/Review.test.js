const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Review", function () {
  async function deployContractsFixture() {
    const [owner, otherUser, reviewer1, reviewer2] = await ethers.getSigners();

    const BetaTestingDetailsManager = await ethers.getContractFactory(
      "BetaTestingDetailsManager"
    );
    const betaTestingManager = await BetaTestingDetailsManager.deploy();
    await betaTestingManager.waitForDeployment();

    const Product = await ethers.getContractFactory("Product");
    const product = await Product.deploy(owner.address);
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
    contractAddress: "0x",
    targetNumbersOfTester: 100,
    testingGoal: "Test Goal",
    goals: ["Goal 1", "Goal 2"],
    startingDate: Math.floor(Date.now() / 1000), // current timestamp in seconds
    endingDate: Math.floor(Date.now() / 1000) + 86400, // current timestamp + 1 day
    featureLoomLink: "http://feature.loom.link",
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

  it("Should revert if the reviewer is the product owner", async function () {
    const { product, review, owner } = await loadFixture(
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
      review.connect(owner).addReview(owner.address, 1, "Invalid reviewer!", 5)
    ).to.be.revertedWith("Product owner cannot review their own product");
  });

  it("Should revert if review does not exist", async function () {
    const { review, owner, reviewer1, product } = await loadFixture(
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

    await expect(review.getReview(1, 99)).to.be.revertedWith(
      "Review does not exist"
    );
  });

  // New test cases

  it("Should ensure reviews are sorted by timestamp", async function () {
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

    const reviews = await review.getReviews(1);
    expect(reviews[0].content).to.equal("Great product!");
    expect(reviews[1].content).to.equal("I love it!");
  });

  it("Should check review timestamps", async function () {
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

    const singleReview = await review.getReview(1, 0);
    const blockTimestamp = (await ethers.provider.getBlock("latest")).timestamp;

    expect(singleReview.timestamp).to.be.closeTo(blockTimestamp, 60);
  });

  it("Should revert if duplicate reviews are added by the same reviewer", async function () {
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
    await expect(
      review
        .connect(reviewer1)
        .addReview(reviewer1.address, 1, "Another review!", 4)
    ).to.be.revertedWith("Reviewer has already reviewed this product");
  });

  it("Should allow reviewer to update their existing review", async function () {
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

    // Update the review
    await review
      .connect(reviewer1)
      .updateReview(reviewer1.address, 1, "Updated review!", 4);

    const updatedReview = await review.getReview(1, 0);
    expect(updatedReview.content).to.equal("Updated review!");
    expect(updatedReview.rating).to.equal(4);
  });
});
