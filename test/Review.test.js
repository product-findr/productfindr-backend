const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Review", function () {
  let review, liveProduct, owner, otherUser;

  beforeEach(async function () {
    [owner, otherUser] = await ethers.getSigners();

    const LiveProduct = await ethers.getContractFactory("LiveProduct");
    liveProduct = await LiveProduct.deploy(owner.address);
    await liveProduct.waitForDeployment();

    const Review = await ethers.getContractFactory("Review");
    review = await Review.deploy(liveProduct.target);
    await review.waitForDeployment();
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

  beforeEach(async function () {
    await liveProduct
      .connect(owner)
      .registerLiveProduct(owner.address, liveProductDetails);
  });

  it("Should allow a user to add a review to a live product", async function () {
    await expect(
      review
        .connect(otherUser)
        .addReview(otherUser.address, 1, "This is a review", 5)
    ).to.emit(review, "ReviewAdded");

    const reviews = await review.getReviews(1);
    expect(reviews.length).to.equal(1);
    expect(reviews[0].content).to.equal("This is a review");
  });

  it("Should get the number of reviews for a live product", async function () {
    await review
      .connect(otherUser)
      .addReview(otherUser.address, 1, "This is a review", 5);
    const count = await review.getReviewsCount(1);
    expect(count).to.equal(1);
  });

  it("Should get a specific review by ID for a live product", async function () {
    await review
      .connect(otherUser)
      .addReview(otherUser.address, 1, "This is a review", 5);
    const reviewDetails = await review.getReview(1, 0);
    expect(reviewDetails.content).to.equal("This is a review");
  });

  it("Should return the correct reviewer address for a live product", async function () {
    await review
      .connect(otherUser)
      .addReview(otherUser.address, 1, "This is a review", 5);
    const reviewer = await review.getReviewer(1, 0);
    expect(reviewer).to.equal(otherUser.address);
  });

  it("Should revert if the product does not exist", async function () {
    await expect(
      review
        .connect(otherUser)
        .addReview(otherUser.address, 2, "This is a review", 5)
    ).to.be.revertedWith("Product does not exist");
  });

  it("Should revert if the rating is out of bounds", async function () {
    await expect(
      review
        .connect(otherUser)
        .addReview(otherUser.address, 1, "This is a review", 6)
    ).to.be.revertedWith("Rating must be between 1 and 5");
  });

  it("Should revert if the review content is empty", async function () {
    await expect(
      review.connect(otherUser).addReview(otherUser.address, 1, "", 5)
    ).to.be.revertedWith("Review content cannot be empty");
  });

  it("Should revert if the reviewer is the product owner", async function () {
    await expect(
      review.connect(owner).addReview(owner.address, 1, "This is a review", 5)
    ).to.be.revertedWith("Product owner cannot review their own product");
  });

  it("Should revert if review does not exist", async function () {
    await expect(review.getReview(1, 0)).to.be.revertedWith(
      "Review does not exist"
    );
  });
});
