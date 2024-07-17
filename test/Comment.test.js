const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Comment", function () {
  async function deployContractsFixture() {
    const [owner, otherUser, commenter1, commenter2] =
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

    return {
      product,
      comment,
      betaTestingManager,
      owner,
      otherUser,
      commenter1,
      commenter2,
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

  it("Should allow a user to comment on a product without beta testing", async function () {
    const { product, comment, owner, commenter1 } = await loadFixture(
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
    await comment.connect(commenter1).commentOnProduct(1, "Great product!");

    const singleComment = await comment.getComment(1, 0);

    expect(singleComment.content).to.equal("Great product!");
    expect(singleComment.commenter).to.equal(commenter1.address);
  });

  it("Should revert if comment content is empty", async function () {
    const { product, comment, owner, commenter1 } = await loadFixture(
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
      comment.connect(commenter1).commentOnProduct(1, "")
    ).to.be.revertedWith("Comment content cannot be empty");
  });

  it("Should allow a user to comment on a product with beta testing", async function () {
    const { product, comment, owner, commenter1 } = await loadFixture(
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
    await comment.connect(commenter1).commentOnProduct(1, "Great product!");

    const singleComment = await comment.getComment(1, 0);

    expect(singleComment.content).to.equal("Great product!");
    expect(singleComment.commenter).to.equal(commenter1.address);
  });

  it("Should get the number of comments for a product", async function () {
    const { product, comment, owner, commenter1, commenter2 } =
      await loadFixture(deployContractsFixture);
    const betaTestingAvailable = false;
    await product
      .connect(owner)
      .registerProduct(
        owner.address,
        productDetailsWithoutBetaTesting,
        betaTestingAvailable,
        betaTestingDetails
      );
    await comment.connect(commenter1).commentOnProduct(1, "Great product!");
    await comment.connect(commenter2).commentOnProduct(1, "I love it!");

    const commentsCount = await comment.getCommentsCount(1);
    expect(commentsCount).to.equal(2);
  });

  it("Should get a specific comment by ID", async function () {
    const { product, comment, owner, commenter1, commenter2 } =
      await loadFixture(deployContractsFixture);
    const betaTestingAvailable = false;
    await product
      .connect(owner)
      .registerProduct(
        owner.address,
        productDetailsWithoutBetaTesting,
        betaTestingAvailable,
        betaTestingDetails
      );
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
    const betaTestingAvailable = false;
    await product
      .connect(owner)
      .registerProduct(
        owner.address,
        productDetailsWithoutBetaTesting,
        betaTestingAvailable,
        betaTestingDetails
      );
    await comment.connect(commenter1).commentOnProduct(1, "Great product!");

    const commenterAddress = await comment.getCommenter(1, 0);
    expect(commenterAddress).to.equal(commenter1.address);
  });

  // New Test Cases
  it("Should revert if commenting on a non-existent product", async function () {
    const { comment, commenter1 } = await loadFixture(deployContractsFixture);
    await expect(
      comment.connect(commenter1).commentOnProduct(999, "Great product!")
    ).to.be.revertedWith("Product does not exist");
  });

  it("Should revert if comment ID is out of bounds", async function () {
    const { product, comment, owner, commenter1 } = await loadFixture(
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
    await comment.connect(commenter1).commentOnProduct(1, "Great product!");
    await expect(comment.getComment(1, 999)).to.be.revertedWith(
      "Comment does not exist"
    );
  });

  it("Should allow a user to post multiple comments", async function () {
    const { product, comment, owner, commenter1 } = await loadFixture(
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
    await comment.connect(commenter1).commentOnProduct(1, "Great product!");
    await comment.connect(commenter1).commentOnProduct(1, "I have a question!");

    const commentsCount = await comment.getCommentsCount(1);
    expect(commentsCount).to.equal(2);

    const firstComment = await comment.getComment(1, 0);
    const secondComment = await comment.getComment(1, 1);

    expect(firstComment.content).to.equal("Great product!");
    expect(secondComment.content).to.equal("I have a question!");
  });

  it("Should check comment timestamps", async function () {
    const { product, comment, owner, commenter1 } = await loadFixture(
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
    await comment.connect(commenter1).commentOnProduct(1, "Great product!");

    const singleComment = await comment.getComment(1, 0);
    const blockTimestamp = (await ethers.provider.getBlock("latest")).timestamp;

    expect(singleComment.timestamp).to.be.closeTo(blockTimestamp, 60);
  });

  it("Should revert if non-registered user tries to comment", async function () {
    const { comment, otherUser } = await loadFixture(deployContractsFixture);
    await expect(
      comment.connect(otherUser).commentOnProduct(1, "Great product!")
    ).to.be.revertedWith("Product does not exist");
  });
});
