const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProductFindr", function () {
  let productFindr, liveProduct, betaTestingProduct, owner, otherUser;

  beforeEach(async function () {
    [owner, otherUser] = await ethers.getSigners();

    const LiveProduct = await ethers.getContractFactory("LiveProduct");
    liveProduct = await LiveProduct.deploy(owner.address);
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
  });

  const liveProductDetails = {
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
  };

  const betaTestingDetails = {
    contractAddress: "0x0000000000000000000000000000000000000000",
    targetNumbersOfTester: 100,
    testingGoal: "Test Goal",
    goals: ["Goal 1", "Goal 2"],
    startingDate: Math.floor(Date.now() / 1000), // current timestamp in seconds
    endingDate: Math.floor(Date.now() / 1000) + 86400, // current timestamp + 1 day
    featureLoomLink: "http://feature.loom.link",
  };

  const betaProductDetails = {
    ...liveProductDetails,
    betaTestingLink: "http://beta.testing/link",
  };

  it("Should register a new live product without beta testing", async function () {
    await expect(
      productFindr
        .connect(otherUser)
        .registerLiveProduct(otherUser.address, liveProductDetails)
    ).to.emit(liveProduct, "LiveProductRegistered");

    const product = await productFindr.getLiveProduct(1);
    expect(product.details.productName).to.equal("Test Product");
  });

  it("Should register a new beta testing product with beta testing", async function () {
    await expect(
      productFindr
        .connect(otherUser)
        .registerBetaTestingProduct(
          otherUser.address,
          betaProductDetails,
          betaTestingDetails
        )
    ).to.emit(betaTestingProduct, "BetaTestingProductRegistered");

    const product = await productFindr.getBetaTestingProduct(1);
    expect(product[0].details.productName).to.equal("Test Product");
  });

  it("Should revert if beta testing link is missing when beta testing is enabled", async function () {
    const invalidProductDetails = {
      ...betaProductDetails,
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

  it("Should upvote a live product", async function () {
    await productFindr
      .connect(otherUser)
      .registerLiveProduct(otherUser.address, liveProductDetails);
    await expect(productFindr.connect(owner).upvoteLiveProduct(1)).to.emit(
      liveProduct,
      "LiveProductUpvoted"
    );
  });

  it("Should not allow product owner to upvote their own product", async function () {
    await productFindr
      .connect(owner)
      .registerLiveProduct(owner.address, liveProductDetails);
    await expect(
      productFindr.connect(owner).upvoteLiveProduct(1)
    ).to.be.revertedWith("Product owner cannot upvote their own product");
  });

  it("Should get a specific comment through ProductFindr", async function () {
    await productFindr
      .connect(otherUser)
      .registerLiveProduct(otherUser.address, liveProductDetails);
    await commentLive.commentOnProduct(1, "This is a comment");
    const comment = await productFindr.getLiveProductComment(1, 0);
    expect(comment.content).to.equal("This is a comment");
  });

  it("Should get the number of comments for a product through ProductFindr", async function () {
    await productFindr
      .connect(otherUser)
      .registerLiveProduct(otherUser.address, liveProductDetails);
    await commentLive.commentOnProduct(1, "This is a comment");
    const count = await productFindr.getLiveProductCommentsCount(1);
    expect(count).to.equal(1);
  });

  it("Should add a review to a product through ProductFindr", async function () {
    await productFindr
      .connect(otherUser)
      .registerLiveProduct(otherUser.address, liveProductDetails);
    await productFindr.addLiveProductReview(
      otherUser.address,
      1,
      "This is a review",
      5
    );
    const review = await productFindr.getLiveProductReview(1, 0);
    expect(review.content).to.equal("This is a review");
  });

  it("Should get a specific review by ID through ProductFindr", async function () {
    await productFindr
      .connect(otherUser)
      .registerLiveProduct(otherUser.address, liveProductDetails);
    await productFindr.addLiveProductReview(
      otherUser.address,
      1,
      "This is a review",
      5
    );
    const review = await productFindr.getLiveProductReview(1, 0);
    expect(review.content).to.equal("This is a review");
  });

  it("Should return the correct reviewer address through ProductFindr", async function () {
    await productFindr
      .connect(otherUser)
      .registerLiveProduct(otherUser.address, liveProductDetails);
    await productFindr.addLiveProductReview(
      otherUser.address,
      1,
      "This is a review",
      5
    );
    const reviewer = await productFindr.getLiveProductReviewer(1, 0);
    expect(reviewer).to.equal(otherUser.address);
  });

  it("Should get the number of reviews for a product through ProductFindr", async function () {
    await productFindr
      .connect(otherUser)
      .registerLiveProduct(otherUser.address, liveProductDetails);
    await productFindr.addLiveProductReview(
      otherUser.address,
      1,
      "This is a review",
      5
    );
    const count = await productFindr.getLiveProductReviewsCount(1);
    expect(count).to.equal(1);
  });

  it("Should revert if review does not exist", async function () {
    await productFindr
      .connect(otherUser)
      .registerLiveProduct(otherUser.address, liveProductDetails);
    await expect(productFindr.getLiveProductReview(1, 0)).to.be.revertedWith(
      "Review does not exist"
    );
  });
});
