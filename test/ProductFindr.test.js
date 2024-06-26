const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("ProductFindr", function () {
  async function deployContractsFixture() {
    const [owner, otherUser, commenter1, commenter2, reviewer1, reviewer2] =
      await ethers.getSigners();

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
      owner.address
    );
    await productFindr.waitForDeployment();

    await product.transferOwnership(productFindr.target);

    return {
      product,
      comment,
      review,
      productFindr,
      owner,
      otherUser,
      commenter1,
      commenter2,
      reviewer1,
      reviewer2,
    };
  }

  const productDetails = {
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

  it("Should register a new product", async function () {
    const { productFindr, product, otherUser } = await loadFixture(
      deployContractsFixture
    );
    await productFindr
      .connect(otherUser)
      .registerProduct(otherUser.address, productDetails);
    const productInfo = await product.getProduct(1);

    expect(productInfo.details.productName).to.equal("Test Product");
    expect(productInfo.owner).to.equal(otherUser.address);
  });

  it("Should upvote a product", async function () {
    const { productFindr, product, owner, otherUser } = await loadFixture(
      deployContractsFixture
    );
    await productFindr
      .connect(owner)
      .registerProduct(owner.address, productDetails);
    await productFindr.connect(otherUser).upvoteProduct(1, otherUser.address);
    const productInfo = await product.getProduct(1);

    expect(productInfo.upvotes).to.equal(1);
  });

  it("Should not allow product owner to upvote their own product", async function () {
    const { productFindr, owner } = await loadFixture(deployContractsFixture);
    await productFindr
      .connect(owner)
      .registerProduct(owner.address, productDetails);
    await expect(
      productFindr.connect(owner).upvoteProduct(1, owner.address)
    ).to.be.revertedWith("Product owner cannot upvote their own product");
  });

  it("Should get a specific comment through ProductFindr", async function () {
    const { productFindr, owner, commenter1 } = await loadFixture(
      deployContractsFixture
    );
    await productFindr
      .connect(owner)
      .registerProduct(owner.address, productDetails);
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
    await productFindr
      .connect(owner)
      .registerProduct(owner.address, productDetails);
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
    await productFindr
      .connect(owner)
      .registerProduct(owner.address, productDetails);
    await productFindr
      .connect(reviewer1)
      .addReview(reviewer1, 1, "Great product!", 5);

    const reviews = await productFindr.getReviews(1);
    expect(reviews.length).to.equal(1);
    expect(reviews[0].content).to.equal("Great product!");
    expect(reviews[0].rating).to.equal(5);
  });

  it("Should get a specific review by ID through ProductFindr", async function () {
    const { productFindr, owner, reviewer1, reviewer2 } = await loadFixture(
      deployContractsFixture
    );
    await productFindr
      .connect(owner)
      .registerProduct(owner.address, productDetails);
    await productFindr
      .connect(reviewer1)
      .addReview(reviewer1, 1, "Great product!", 5);
    await productFindr
      .connect(reviewer2)
      .addReview(reviewer2, 1, "I love it!", 4);

    const singleReview = await productFindr.getReview(1, 1);
    expect(singleReview.content).to.equal("I love it!");
    expect(singleReview.reviewer).to.equal(reviewer2.address);
  });

  it("Should return the correct reviewer address through ProductFindr", async function () {
    const { productFindr, owner, reviewer1 } = await loadFixture(
      deployContractsFixture
    );
    await productFindr
      .connect(owner)
      .registerProduct(owner.address, productDetails);
    await productFindr
      .connect(reviewer1)
      .addReview(reviewer1, 1, "Great product!", 5);

    const reviewerAddress = await productFindr.getReviewer(1, 0);
    expect(reviewerAddress).to.equal(reviewer1.address);
  });

  it("Should get the number of reviews for a product through ProductFindr", async function () {
    const { productFindr, owner, reviewer1, reviewer2 } = await loadFixture(
      deployContractsFixture
    );
    await productFindr
      .connect(owner)
      .registerProduct(owner.address, productDetails);
    await productFindr
      .connect(reviewer1)
      .addReview(reviewer1, 1, "Great product!", 5);
    await productFindr
      .connect(reviewer2)
      .addReview(reviewer1, 1, "I love it!", 4);

    const reviewsCount = await productFindr.getReviewsCount(1);
    expect(reviewsCount).to.equal(2);
  });
});
