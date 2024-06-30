const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Product", function () {
  let product;
  let owner;
  let otherUser;
  let ProductFactory;

  beforeEach(async function () {
    [owner, otherUser] = await ethers.getSigners();
    ProductFactory = await ethers.getContractFactory("Product");
    product = await ProductFactory.deploy(owner.address);
  });

  it("Should register a new product", async function () {
    const details = {
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
    await product.registerProduct(owner.address, details);
    const productInfo = await product.getProduct(1);
    expect(productInfo.details.productName).to.equal("Test Product");
    expect(productInfo.owner).to.equal(owner.address);
  });

  it("Should upvote a product", async function () {
    const details = {
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
    await product.registerProduct(owner.address, details);
    await product.connect(otherUser).upvoteProduct(1, otherUser.address);
    const productInfo = await product.getProduct(1);
    expect(productInfo.upvotes).to.equal(1);
  });

  it("Should not allow product owner to upvote their own product", async function () {
    const details = {
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
    await product.registerProduct(owner.address, details);
    await expect(product.upvoteProduct(1, owner.address)).to.be.revertedWith(
      "Product owner cannot upvote their own product"
    );
  });

  it("Should get Listed Products", async function () {
    const details = {
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
    await product.registerProduct(owner.address, details);
    await product.registerProduct(owner.address, details);
    await product.registerProduct(owner.address, details);

    const listedProducts = await product.getListedProducts();

    console.log(listedProducts);
    expect(listedProducts.length).to.equal(3);
  });
});
