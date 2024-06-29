// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserInfo {
    struct User {
        string username;
        string email;
        string bio;
        string[] interests;
    }

    mapping(address => User) private users;

    event UserAdded(address indexed userAddress, string username);
    event UserUpdated(address indexed userAddress, string username);
    event UserInterestsUpdated(address indexed userAddress, string[] interests);

    modifier onlyExistingUser(address userAddress) {
        require(
            bytes(users[userAddress].username).length > 0,
            "User does not exist"
        );
        _;
    }

    function addUser(
        address userAddress,
        string memory username,
        string memory email,
        string memory bio,
        string[] memory interests
    ) external {
        require(
            bytes(users[userAddress].username).length == 0,
            "User already exists"
        );
        users[userAddress] = User({
            username: username,
            email: email,
            bio: bio,
            interests: interests
        });
        emit UserAdded(userAddress, username);
    }

    function updateUser(
        address userAddress,
        string memory username,
        string memory email,
        string memory bio
    ) external onlyExistingUser(userAddress) {
        User storage user = users[userAddress];
        user.username = username;
        user.email = email;
        user.bio = bio;
        emit UserUpdated(userAddress, username);
    }

    function updateUserInterests(
        address userAddress,
        string[] memory interests
    ) external onlyExistingUser(userAddress) {
        User storage user = users[userAddress];
        user.interests = interests;
        emit UserInterestsUpdated(userAddress, interests);
    }

    function getUser(
        address userAddress
    )
        external
        view
        onlyExistingUser(userAddress)
        returns (
            string memory username,
            string memory email,
            string memory bio,
            string[] memory interests
        )
    {
        User storage user = users[userAddress];
        return (user.username, user.email, user.bio, user.interests);
    }

    function getUserInterests(
        address userAddress
    )
        external
        view
        onlyExistingUser(userAddress)
        returns (string[] memory interests)
    {
        return users[userAddress].interests;
    }

    function userExists(address userAddress) external view returns (bool) {
        return bytes(users[userAddress].username).length > 0;
    }

    // Added this for test
    function deleteUser(
        address userAddress
    ) external onlyExistingUser(userAddress) {
        delete users[userAddress];
    }
}
