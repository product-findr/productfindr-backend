const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Comment", function () {
  async function deployContractsFixture() {
    const [owner, otherUser, commenter1, commenter2] =
      await ethers.getSigners();

    const Product = await ethers.getContractFactory("Product");
    const product = await Product.deploy(owner.address);
    await product.waitForDeployment();

    const Comment = await ethers.getContractFactory("Comment");
    const comment = await Comment.deploy(product.target);
    await comment.waitForDeployment();

    return {
      product,
      comment,
      owner,
      otherUser,
      commenter1,
      commenter2,
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

  it("Should allow a user to comment on a product", async function () {
    const { product, comment, owner, commenter1 } = await loadFixture(
      deployContractsFixture
    );
    await product.connect(owner).registerProduct(owner.address, productDetails);
    await comment.connect(commenter1).commentOnProduct(1, "Great product!");

    const singleComment = await comment.getComment(1, 0);

    expect(singleComment.content).to.equal("Great product!");
    expect(singleComment.commenter).to.equal(commenter1.address);
  });

  it("Should get the number of comments for a product", async function () {
    const { product, comment, owner, commenter1, commenter2 } =
      await loadFixture(deployContractsFixture);
    await product.connect(owner).registerProduct(owner.address, productDetails);
    await comment.connect(commenter1).commentOnProduct(1, "Great product!");
    await comment.connect(commenter2).commentOnProduct(1, "I love it!");

    const commentsCount = await comment.getCommentsCount(1);
    expect(commentsCount).to.equal(2);
  });

  it("Should get a specific comment by ID", async function () {
    const { product, comment, owner, commenter1, commenter2 } =
      await loadFixture(deployContractsFixture);
    await product.connect(owner).registerProduct(owner.address, productDetails);
    await comment.connect(commenter1).commentOnProduct(1, "Great product!");
    await comment.connect(commenter2).commentOnProduct(1, "I love it!");

    const singleComment = await comment.getComment(1, 1);

    expect(singleComment.content).to.equal("I love it!");
    expect(singleComment.commenter).to.equal(commenter2.address);
  });

  it("Should return the correct commenter address", async function () {
    const { product, comment, owner, commenter1 } = await loadFixture(
      deployContractsFixture
    );
    await product.connect(owner).registerProduct(owner.address, productDetails);
    await comment.connect(commenter1).commentOnProduct(1, "Great product!");

    const commenterAddress = await comment.getCommenter(1, 0);
    expect(commenterAddress).to.equal(commenter1.address);
  });
});
