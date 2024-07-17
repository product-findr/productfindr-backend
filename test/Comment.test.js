const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Comment", function () {
  let liveProduct,
    betaTestingProduct,
    commentLive,
    commentBeta,
    owner,
    otherUser;

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
    commentLive = await Comment.deploy(liveProduct.target);
    await commentLive.waitForDeployment();
    commentBeta = await Comment.deploy(betaTestingProduct.target);
    await commentBeta.waitForDeployment();
  });

  it("Should allow a user to comment on a live product", async function () {
    await liveProduct.registerLiveProduct(owner.address, {
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
    });

    await expect(commentLive.commentOnProduct(1, "This is a comment"))
      .to.emit(commentLive, "CommentAdded")
      .withArgs(1, owner.address, "This is a comment");

    const comments = await commentLive.getComments(1);
    expect(comments.length).to.equal(1);
    expect(comments[0].commenter).to.equal(owner.address);
    expect(comments[0].content).to.equal("This is a comment");
  });

  it("Should revert if live product comment content is empty", async function () {
    await liveProduct.registerLiveProduct(owner.address, {
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
    });

    await expect(commentLive.commentOnProduct(1, "")).to.be.revertedWith(
      "Comment content cannot be empty"
    );
  });

  it("Should allow a user to comment on a beta testing product", async function () {
    await betaTestingProduct.registerBetaTestingProduct(owner.address, {
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
    });

    await expect(commentBeta.commentOnProduct(1, "This is a beta comment"))
      .to.emit(commentBeta, "CommentAdded")
      .withArgs(1, owner.address, "This is a beta comment");

    const comments = await commentBeta.getComments(1);
    expect(comments.length).to.equal(1);
    expect(comments[0].commenter).to.equal(owner.address);
    expect(comments[0].content).to.equal("This is a beta comment");
  });

  it("Should revert if beta testing product comment content is empty", async function () {
    await betaTestingProduct.registerBetaTestingProduct(owner.address, {
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
    });

    await expect(commentBeta.commentOnProduct(1, "")).to.be.revertedWith(
      "Comment content cannot be empty"
    );
  });
});
