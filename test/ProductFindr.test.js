const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("ProductFindr", function () {
  async function deployContractsFixture() {
    const [owner, otherUser, commenter1, commenter2, reviewer1, reviewer2] =
      await ethers.getSigners();

    const BetaTestingDetailsManager = await ethers.getContractFactory(
      "BetaTestingDetailsManager"
    );
    const betaTestingManager = await BetaTestingDetailsManager.deploy();
    await betaTestingManager.waitForDeployment();

    const Product = await ethers.getContractFactory("Product");
    const product = await Product.deploy(owner.address);
    await product.waitForDeployment();

    const Comment = await ethers.getContractFactory("Comment");
    const comment = await Comment.deploy(product.target);
    await comment.waitForDeployment();

    const Review = await ethers.getContractFactory("Review");
    const review = await Review.deploy(product.target);
    await review.waitForDeployment();

    const ProductFindr = await ethers.getContractFactory("ProductFindr");
    const productFindr = await ProductFindr.deploy(
      product.target,
      comment.target,
      review.target,
      betaTestingManager.target,
      owner.address
    );
    await productFindr.waitForDeployment();

    await product.transferOwnership(productFindr.target);

    return {
      product,
      comment,
      review,
      productFindr,
      betaTestingManager,
      owner,
      otherUser,
      commenter1,
      commenter2,
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

  it("Should register a new product without beta testing", async function () {
    const { productFindr, product, otherUser } = await loadFixture(
      deployContractsFixture
    );
    const betaTestingAvailable = false;
    await productFindr
      .connect(otherUser)
      .registerProduct(
        otherUser.address,
        productDetailsWithoutBetaTesting,
        betaTestingAvailable,
        betaTestingDetails
      );
    const productInfo = await product.getProduct(1);

    expect(productInfo.product.details.productName).to.equal("Test Product");
    expect(productInfo.product.owner).to.equal(otherUser.address);
  });

  it("Should register a new product with beta testing", async function () {
    const { productFindr, product, otherUser } = await loadFixture(
      deployContractsFixture
    );
    const betaTestingAvailable = true;
    await productFindr
      .connect(otherUser)
      .registerProduct(
        otherUser.address,
        productDetailsWithBetaTesting,
        betaTestingAvailable,
        betaTestingDetails
      );
    const productInfo = await product.getProduct(1);

    expect(productInfo.product.details.productName).to.equal("Test Product");
    expect(productInfo.product.owner).to.equal(otherUser.address);
  });

  it("Should revert if beta testing link is missing when beta testing is enabled", async function () {
    const { productFindr, product, otherUser } = await loadFixture(
      deployContractsFixture
    );
    const invalidProductDetails = {
      ...productDetailsWithBetaTesting,
      betaTestingLink: "",
    };
    const betaTestingAvailable = true;
    await expect(
      productFindr
        .connect(otherUser)
        .registerProduct(
          otherUser.address,
          invalidProductDetails,
          betaTestingAvailable,
          betaTestingDetails
        )
    ).to.be.revertedWith("Beta testing link required");
  });

  it("Should upvote a product", async function () {
    const { productFindr, product, owner, otherUser } = await loadFixture(
      deployContractsFixture
    );
    const betaTestingAvailable = false;
    await productFindr
      .connect(owner)
      .registerProduct(
        owner.address,
        productDetailsWithoutBetaTesting,
        betaTestingAvailable,
        betaTestingDetails
      );
    await productFindr.connect(otherUser).upvoteProduct(1, otherUser.address);
    const productInfo = await product.getProduct(1);

    expect(productInfo.product.upvotes).to.equal(1);
  });

  it("Should not allow product owner to upvote their own product", async function () {
    const { productFindr, owner } = await loadFixture(deployContractsFixture);
    const betaTestingAvailable = false;
    await productFindr
      .connect(owner)
      .registerProduct(
        owner.address,
        productDetailsWithoutBetaTesting,
        betaTestingAvailable,
        betaTestingDetails
      );
    await expect(
      productFindr.connect(owner).upvoteProduct(1, owner.address)
    ).to.be.revertedWith("Product owner cannot upvote their own product");
  });

  it("Should get a specific comment through ProductFindr", async function () {
    const { productFindr, owner, commenter1 } = await loadFixture(
      deployContractsFixture
    );
    const betaTestingAvailable = false;
    await productFindr
      .connect(owner)
      .registerProduct(
        owner.address,
        productDetailsWithoutBetaTesting,
        betaTestingAvailable,
        betaTestingDetails
      );
    await productFindr
      .connect(commenter1)
      .commentOnProduct(1, "Great product!");
    const singleComment = await productFindr.getComment(1, 0);

    expect(singleComment.content).to.equal("Great product!");
  });

  it("Should get the number of comments for a product through ProductFindr", async function () {
    const { productFindr, owner, commenter1, commenter2 } = await loadFixture(
      deployContractsFixture
    );
    const betaTestingAvailable = false;
    await productFindr
      .connect(owner)
      .registerProduct(
        owner.address,
        productDetailsWithoutBetaTesting,
        betaTestingAvailable,
        betaTestingDetails
      );
    await productFindr
      .connect(commenter1)
      .commentOnProduct(1, "Great product!");
    await productFindr.connect(commenter2).commentOnProduct(1, "I love it!");

    const commentsCount = await productFindr.getCommentsCount(1);
    expect(commentsCount).to.equal(2);
  });

  // Review-related tests

  it("Should add a review to a product through ProductFindr", async function () {
    const { productFindr, owner, reviewer1 } = await loadFixture(
      deployContractsFixture
    );
    const betaTestingAvailable = false;
    await productFindr
      .connect(owner)
      .registerProduct(
        owner.address,
        productDetailsWithoutBetaTesting,
        betaTestingAvailable,
        betaTestingDetails
      );
    await productFindr
      .connect(reviewer1)
      .addReview(reviewer1.address, 1, "Great product!", 5);

    const reviews = await productFindr.getReviews(1);
    expect(reviews.length).to.equal(1);
    expect(reviews[0].content).to.equal("Great product!");
    expect(reviews[0].rating).to.equal(5);
  });

  it("Should get a specific review by ID through ProductFindr", async function () {
    const { productFindr, owner, reviewer1, reviewer2 } = await loadFixture(
      deployContractsFixture
    );
    const betaTestingAvailable = false;
    await productFindr
      .connect(owner)
      .registerProduct(
        owner.address,
        productDetailsWithoutBetaTesting,
        betaTestingAvailable,
        betaTestingDetails
      );
    await productFindr
      .connect(reviewer1)
      .addReview(reviewer1.address, 1, "Great product!", 5);
    await productFindr
      .connect(reviewer2)
      .addReview(reviewer2.address, 1, "I love it!", 4);

    const singleReview = await productFindr.getReview(1, 1);
    expect(singleReview.content).to.equal("I love it!");
    expect(singleReview.reviewer).to.equal(reviewer2.address);
  });

  it("Should return the correct reviewer address through ProductFindr", async function () {
    const { productFindr, owner, reviewer1 } = await loadFixture(
      deployContractsFixture
    );
    const betaTestingAvailable = false;
    await productFindr
      .connect(owner)
      .registerProduct(
        owner.address,
        productDetailsWithoutBetaTesting,
        betaTestingAvailable,
        betaTestingDetails
      );
    await productFindr
      .connect(reviewer1)
      .addReview(reviewer1.address, 1, "Great product!", 5);

    const reviewerAddress = await productFindr.getReviewer(1, 0);
    expect(reviewerAddress).to.equal(reviewer1.address);
  });

  it("Should get the number of reviews for a product through ProductFindr", async function () {
    const { productFindr, owner, reviewer1, reviewer2 } = await loadFixture(
      deployContractsFixture
    );
    const betaTestingAvailable = false;
    await productFindr
      .connect(owner)
      .registerProduct(
        owner.address,
        productDetailsWithoutBetaTesting,
        betaTestingAvailable,
        betaTestingDetails
      );
    await productFindr
      .connect(reviewer1)
      .addReview(reviewer1.address, 1, "Great product!", 5);
    await productFindr
      .connect(reviewer2)
      .addReview(reviewer2.address, 1, "I love it!", 4);

    const reviewsCount = await productFindr.getReviewsCount(1);
    expect(reviewsCount).to.equal(2);
  });

  it("Should revert if review does not exist", async function () {
    const { productFindr, owner, reviewer1 } = await loadFixture(
      deployContractsFixture
    );
    const betaTestingAvailable = false;
    await productFindr
      .connect(owner)
      .registerProduct(
        owner.address,
        productDetailsWithoutBetaTesting,
        betaTestingAvailable,
        betaTestingDetails
      );
    await productFindr
      .connect(reviewer1)
      .addReview(reviewer1.address, 1, "Great product!", 5);

    await expect(productFindr.getReview(1, 99)).to.be.revertedWith(
      "Review does not exist"
    );
  });

  // New Test Cases

  it("Should revert if upvoting a non-existent product", async function () {
    const { productFindr, otherUser } = await loadFixture(
      deployContractsFixture
    );
    await expect(
      productFindr.connect(otherUser).upvoteProduct(999, otherUser.address)
    ).to.be.revertedWith("Product does not exist");
  });

  it("Should revert if commenting on a non-existent product", async function () {
    const { productFindr, commenter1 } = await loadFixture(
      deployContractsFixture
    );
    await expect(
      productFindr.connect(commenter1).commentOnProduct(999, "Great product!")
    ).to.be.revertedWith("Product does not exist");
  });

  it("Should revert if reviewing a non-existent product", async function () {
    const { productFindr, reviewer1 } = await loadFixture(
      deployContractsFixture
    );
    await expect(
      productFindr
        .connect(reviewer1)
        .addReview(reviewer1.address, 999, "Great product!", 5)
    ).to.be.revertedWith("Product does not exist");
  });

  it("Should revert if user tries to upvote more than once", async function () {
    const { productFindr, product, owner, otherUser } = await loadFixture(
      deployContractsFixture
    );
    const betaTestingAvailable = false;
    await productFindr
      .connect(owner)
      .registerProduct(
        owner.address,
        productDetailsWithoutBetaTesting,
        betaTestingAvailable,
        betaTestingDetails
      );
    await productFindr.connect(otherUser).upvoteProduct(1, otherUser.address);
    await expect(
      productFindr.connect(otherUser).upvoteProduct(1, otherUser.address)
    ).to.be.revertedWith("User has already upvoted this product");
  });

  it("Should validate product registration timestamp through ProductFindr", async function () {
    const { productFindr, product, owner } = await loadFixture(
      deployContractsFixture
    );
    const betaTestingAvailable = false;
    await productFindr
      .connect(owner)
      .registerProduct(
        owner.address,
        productDetailsWithoutBetaTesting,
        betaTestingAvailable,
        betaTestingDetails
      );

    const productInfo = await product.getProduct(1);
    const blockTimestamp = (await ethers.provider.getBlock("latest")).timestamp;
    expect(productInfo.product.timestamp).to.be.closeTo(blockTimestamp, 60);
  });

  it("Should check if product is listed after 24 hours", async function () {
    const { productFindr, product, owner } = await loadFixture(
      deployContractsFixture
    );
    const betaTestingAvailable = false;
    await productFindr
      .connect(owner)
      .registerProduct(
        owner.address,
        productDetailsWithoutBetaTesting,
        betaTestingAvailable,
        betaTestingDetails
      );

    const listedBefore24Hours = await productFindr.canBeListed(1);
    expect(listedBefore24Hours).to.be.false;

    // Simulate time passing
    await ethers.provider.send("evm_increaseTime", [86400]); // Increase time by 24 hours
    await ethers.provider.send("evm_mine"); // Mine a new block to apply the time increase

    const listedAfter24Hours = await productFindr.canBeListed(1);
    expect(listedAfter24Hours).to.be.true;
  });
});
