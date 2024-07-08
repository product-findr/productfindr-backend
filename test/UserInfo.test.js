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
        "newemail@example.com", // Different email to avoid email conflict
        userDetails.bio,
        userDetails.interests
      )
    ).to.be.revertedWith("User already exists");
  });

  it("Should not allow adding a user with an existing email", async function () {
    const { userInfo, user1, user2 } = await loadFixture(deployContractFixture);
    const userDetails1 = {
      username: "user1",
      email: "user1@example.com",
      bio: "Bio of user1",
      interests: ["Reading", "Coding"],
    };
    const userDetails2 = {
      username: "user2",
      email: "user1@example.com", // Same email as user1
      bio: "Bio of user2",
      interests: ["Sports", "Gaming"],
    };

    await userInfo.addUser(
      user1.address,
      userDetails1.username,
      userDetails1.email,
      userDetails1.bio,
      userDetails1.interests
    );

    await expect(
      userInfo.addUser(
        user2.address,
        userDetails2.username,
        userDetails2.email,
        userDetails2.bio,
        userDetails2.interests
      )
    ).to.be.revertedWith("Email already used");
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

  it("Should not update user with an existing email", async function () {
    const { userInfo, user1, user2 } = await loadFixture(deployContractFixture);
    const userDetails1 = {
      username: "user1",
      email: "user1@example.com",
      bio: "Bio of user1",
      interests: ["Reading", "Coding"],
    };
    const userDetails2 = {
      username: "user2",
      email: "user2@example.com",
      bio: "Bio of user2",
      interests: ["Sports", "Gaming"],
    };
    const updatedDetails = {
      username: "updatedUser1",
      email: "user2@example.com", // Same email as user2
      bio: "Updated bio of user1",
    };

    await userInfo.addUser(
      user1.address,
      userDetails1.username,
      userDetails1.email,
      userDetails1.bio,
      userDetails1.interests
    );
    await userInfo.addUser(
      user2.address,
      userDetails2.username,
      userDetails2.email,
      userDetails2.bio,
      userDetails2.interests
    );

    await expect(
      userInfo.updateUser(
        user1.address,
        updatedDetails.username,
        updatedDetails.email,
        updatedDetails.bio
      )
    ).to.be.revertedWith("Email already used");
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

  it("Should get all usernames, addresses, and emails", async function () {
    const { userInfo, user1, user2 } = await loadFixture(deployContractFixture);
    const userDetails1 = {
      username: "user1",
      email: "user1@example.com",
      bio: "Bio of user1",
      interests: ["Reading", "Coding"],
    };
    const userDetails2 = {
      username: "user2",
      email: "user2@example.com",
      bio: "Bio of user2",
      interests: ["Sports", "Gaming"],
    };

    await userInfo.addUser(
      user1.address,
      userDetails1.username,
      userDetails1.email,
      userDetails1.bio,
      userDetails1.interests
    );
    await userInfo.addUser(
      user2.address,
      userDetails2.username,
      userDetails2.email,
      userDetails2.bio,
      userDetails2.interests
    );

    const [usernames, addresses, emails] =
      await userInfo.getAllUsernamesAddressesAndEmails();

    expect(usernames).to.deep.equal([
      userDetails1.username,
      userDetails2.username,
    ]);
    expect(addresses).to.deep.equal([user1.address, user2.address]);
    expect(emails).to.deep.equal([userDetails1.email, userDetails2.email]);
  });

  it("Should get all users", async function () {
    const { userInfo, user1, user2 } = await loadFixture(deployContractFixture);
    const userDetails1 = {
      username: "user1",
      email: "user1@example.com",
      bio: "Bio of user1",
      interests: ["Reading", "Coding"],
    };
    const userDetails2 = {
      username: "user2",
      email: "user2@example.com",
      bio: "Bio of user2",
      interests: ["Sports", "Gaming"],
    };

    await userInfo.addUser(
      user1.address,
      userDetails1.username,
      userDetails1.email,
      userDetails1.bio,
      userDetails1.interests
    );
    await userInfo.addUser(
      user2.address,
      userDetails2.username,
      userDetails2.email,
      userDetails2.bio,
      userDetails2.interests
    );

    const allUsers = await userInfo.getAllUsers();

    expect(allUsers.length).to.equal(2);
    expect(allUsers[0].username).to.equal(userDetails1.username);
    expect(allUsers[0].email).to.equal(userDetails1.email);
    expect(allUsers[0].bio).to.equal(userDetails1.bio);
    expect(allUsers[0].interests).to.deep.equal(userDetails1.interests);

    expect(allUsers[1].username).to.equal(userDetails2.username);
    expect(allUsers[1].email).to.equal(userDetails2.email);
    expect(allUsers[1].bio).to.equal(userDetails2.bio);
    expect(allUsers[1].interests).to.deep.equal(userDetails2.interests);
  });

  it("Should get user by email", async function () {
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

    const userByEmail = await userInfo.getUserByEmail(userDetails.email);

    expect(userByEmail.username).to.equal(userDetails.username);
    expect(userByEmail.email).to.equal(userDetails.email);
    expect(userByEmail.bio).to.equal(userDetails.bio);
    expect(userByEmail.interests).to.deep.equal(userDetails.interests);
  });

  it("Should get user by address", async function () {
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

    const userByAddress = await userInfo.getUserByAddress(user1.address);
    expect(userByAddress.username).to.equal(userDetails.username);
    expect(userByAddress.email).to.equal(userDetails.email);
    expect(userByAddress.bio).to.equal(userDetails.bio);
    expect(userByAddress.interests).to.deep.equal(userDetails.interests);
  });
});
