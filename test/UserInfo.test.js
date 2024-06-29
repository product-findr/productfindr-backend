const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("UserInfo", function () {
  async function deployContractFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    const UserInfo = await ethers.getContractFactory("UserInfo");
    const userInfo = await UserInfo.deploy();
    await userInfo.waitForDeployment();

    return { userInfo, owner, user1, user2 };
  }

  it("Should add a new user", async function () {
    const { userInfo, user1 } = await loadFixture(deployContractFixture);
    const userDetails = {
      username: "user1",
      email: "user1@example.com",
      bio: "Bio of user1",
      interests: ["Reading", "Coding"],
    };

    await userInfo.addUser(
      user1.address,
      userDetails.username,
      userDetails.email,
      userDetails.bio,
      userDetails.interests
    );

    const user = await userInfo.getUser(user1.address);

    expect(user.username).to.equal(userDetails.username);
    expect(user.email).to.equal(userDetails.email);
    expect(user.bio).to.equal(userDetails.bio);
    expect(user.interests).to.deep.equal(userDetails.interests);
  });

  it("Should not allow adding a user that already exists", async function () {
    const { userInfo, user1 } = await loadFixture(deployContractFixture);
    const userDetails = {
      username: "user1",
      email: "user1@example.com",
      bio: "Bio of user1",
      interests: ["Reading", "Coding"],
    };

    await userInfo.addUser(
      user1.address,
      userDetails.username,
      userDetails.email,
      userDetails.bio,
      userDetails.interests
    );

    await expect(
      userInfo.addUser(
        user1.address,
        userDetails.username,
        userDetails.email,
        userDetails.bio,
        userDetails.interests
      )
    ).to.be.revertedWith("User already exists");
  });

  it("Should update existing user details", async function () {
    const { userInfo, user1 } = await loadFixture(deployContractFixture);
    const userDetails = {
      username: "user1",
      email: "user1@example.com",
      bio: "Bio of user1",
      interests: ["Reading", "Coding"],
    };
    const updatedDetails = {
      username: "updatedUser1",
      email: "updatedUser1@example.com",
      bio: "Updated bio of user1",
    };

    await userInfo.addUser(
      user1.address,
      userDetails.username,
      userDetails.email,
      userDetails.bio,
      userDetails.interests
    );

    await userInfo.updateUser(
      user1.address,
      updatedDetails.username,
      updatedDetails.email,
      updatedDetails.bio
    );

    const user = await userInfo.getUser(user1.address);

    expect(user.username).to.equal(updatedDetails.username);
    expect(user.email).to.equal(updatedDetails.email);
    expect(user.bio).to.equal(updatedDetails.bio);
    expect(user.interests).to.deep.equal(userDetails.interests);
  });

  it("Should update user interests", async function () {
    const { userInfo, user1 } = await loadFixture(deployContractFixture);
    const userDetails = {
      username: "user1",
      email: "user1@example.com",
      bio: "Bio of user1",
      interests: ["Reading", "Coding"],
    };
    const updatedInterests = ["Traveling", "Music"];

    await userInfo.addUser(
      user1.address,
      userDetails.username,
      userDetails.email,
      userDetails.bio,
      userDetails.interests
    );

    await userInfo.updateUserInterests(user1.address, updatedInterests);

    const user = await userInfo.getUser(user1.address);

    expect(user.interests).to.deep.equal(updatedInterests);
  });

  it("Should get the correct user interests", async function () {
    const { userInfo, user1 } = await loadFixture(deployContractFixture);
    const userDetails = {
      username: "user1",
      email: "user1@example.com",
      bio: "Bio of user1",
      interests: ["Reading", "Coding"],
    };

    await userInfo.addUser(
      user1.address,
      userDetails.username,
      userDetails.email,
      userDetails.bio,
      userDetails.interests
    );

    const interests = await userInfo.getUserInterests(user1.address);

    expect(interests).to.deep.equal(userDetails.interests);
  });

  it("Should delete a user", async function () {
    const { userInfo, user1 } = await loadFixture(deployContractFixture);
    const userDetails = {
      username: "user1",
      email: "user1@example.com",
      bio: "Bio of user1",
      interests: ["Reading", "Coding"],
    };

    await userInfo.addUser(
      user1.address,
      userDetails.username,
      userDetails.email,
      userDetails.bio,
      userDetails.interests
    );

    await userInfo.deleteUser(user1.address);

    await expect(userInfo.getUser(user1.address)).to.be.revertedWith(
      "User does not exist"
    );
  });

  it("Should check if a user exists", async function () {
    const { userInfo, user1, user2 } = await loadFixture(deployContractFixture);
    const userDetails = {
      username: "user1",
      email: "user1@example.com",
      bio: "Bio of user1",
      interests: ["Reading", "Coding"],
    };

    await userInfo.addUser(
      user1.address,
      userDetails.username,
      userDetails.email,
      userDetails.bio,
      userDetails.interests
    );

    expect(await userInfo.userExists(user1.address)).to.equal(true);
    expect(await userInfo.userExists(user2.address)).to.equal(false);
  });
});
