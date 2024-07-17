const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LiveProduct", function () {
  let liveProduct, owner, otherUser;

  beforeEach(async function () {
    [owner, otherUser] = await ethers.getSigners();

    const LiveProduct = await ethers.getContractFactory("LiveProduct");
    liveProduct = await LiveProduct.deploy(owner.address);
    await liveProduct.waitForDeployment();
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

  it("Should register a new product without beta testing", async function () {
    await expect(
      liveProduct
        .connect(otherUser)
        .registerLiveProduct(otherUser.address, liveProductDetails)
    ).to.emit(liveProduct, "LiveProductRegistered");

    const product = await liveProduct.getLiveProduct(1);
    expect(product.details.productName).to.equal("Test Product");
  });

  it("Should upvote a product", async function () {
    await liveProduct
      .connect(otherUser)
      .registerLiveProduct(otherUser.address, liveProductDetails);
    await expect(liveProduct.connect(owner).upvoteLiveProduct(1)).to.emit(
      liveProduct,
      "LiveProductUpvoted"
    );
  });

  it("Should not allow product owner to upvote their own product", async function () {
    await liveProduct
      .connect(owner)
      .registerLiveProduct(owner.address, liveProductDetails);
    await expect(
      liveProduct.connect(owner).upvoteLiveProduct(1)
    ).to.be.revertedWith("Product owner cannot upvote their own product");
  });

  it("Should revert if user tries to upvote a product more than once", async function () {
    await liveProduct
      .connect(otherUser)
      .registerLiveProduct(otherUser.address, liveProductDetails);
    await liveProduct.connect(owner).upvoteLiveProduct(1);
    await expect(
      liveProduct.connect(owner).upvoteLiveProduct(1)
    ).to.be.revertedWith("User has already upvoted this product");
  });

  it("Should get Listed Products", async function () {
    await liveProduct
      .connect(otherUser)
      .registerLiveProduct(otherUser.address, liveProductDetails);
    const products = await liveProduct.getAllLiveProducts();
    expect(products.length).to.equal(1);
    expect(products[0].details.productName).to.equal("Test Product");
  });

  it("Should get Product Details", async function () {
    await liveProduct
      .connect(otherUser)
      .registerLiveProduct(otherUser.address, liveProductDetails);
    const product = await liveProduct.getLiveProduct(1);
    expect(product.details.productName).to.equal("Test Product");
  });

  it("Should delete a product", async function () {
    await liveProduct
      .connect(owner)
      .registerLiveProduct(owner.address, liveProductDetails);
    await liveProduct.connect(owner).deleteLiveProduct(1);
    await expect(liveProduct.getLiveProduct(1)).to.be.revertedWith(
      "Product does not exist"
    );
  });

  it("Should revert if non-owner tries to delete a product", async function () {
    await liveProduct
      .connect(owner)
      .registerLiveProduct(owner.address, liveProductDetails);
    await expect(
      liveProduct.connect(otherUser).deleteLiveProduct(1)
    ).to.be.revertedWith("Only the product owner can perform this action");
  });

  it("Should revert if trying to delete a non-existent product", async function () {
    await expect(
      liveProduct.connect(owner).deleteLiveProduct(1)
    ).to.be.revertedWith("Product does not exist");
  });
});
