// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract UserInfo is Initializable, OwnableUpgradeable {
    struct User {
        string username;
        string email;
        string bio;
        string[] interests;
    }

    mapping(address => User) private users;
    mapping(string => address) private emailToAddress;
    address[] private userAddresses;

    event UserAdded(address indexed userAddress, string username);
    event UserUpdated(address indexed userAddress, string username);
    event UserInterestsUpdated(address indexed userAddress, string[] interests);
    event UserDeleted(address indexed userAddress);

    function initialize(address initialOwner) public initializer {
        __Ownable_init(initialOwner);
    }

    modifier onlyExistingUser(address userAddress) {
        require(
            bytes(users[userAddress].username).length > 0,
            "User does not exist"
        );
        _;
    }

    modifier validEmail(string memory email) {
        require(
            bytes(email).length > 5 && bytes(email).length < 100,
            "Invalid email length"
        );
        require(isValidEmail(email), "Invalid email format");
        _;
    }

    modifier validUsername(string memory username) {
        require(
            bytes(username).length > 2 && bytes(username).length < 50,
            "Invalid username length"
        );
        _;
    }

    modifier validBio(string memory bio) {
        require(bytes(bio).length < 500, "Bio too long");
        _;
    }

    modifier uniqueEmail(string memory email) {
        require(emailToAddress[email] == address(0), "Email already used");
        _;
    }

    function isValidEmail(string memory email) internal pure returns (bool) {
        bytes memory emailBytes = bytes(email);
        bool hasAtSymbol = false;
        for (uint i = 0; i < emailBytes.length; i++) {
            if (emailBytes[i] == "@") {
                hasAtSymbol = true;
                break;
            }
        }
        return hasAtSymbol;
    }

    function addUser(
        address userAddress,
        string memory username,
        string memory email,
        string memory bio,
        string[] memory interests
    )
        external
        validEmail(email)
        validUsername(username)
        validBio(bio)
        uniqueEmail(email)
    {
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
        emailToAddress[email] = userAddress;
        userAddresses.push(userAddress);
        emit UserAdded(userAddress, username);
    }

    function updateUser(
        address userAddress,
        string memory username,
        string memory email,
        string memory bio
    )
        external
        onlyExistingUser(userAddress)
        validEmail(email)
        validUsername(username)
        validBio(bio)
        uniqueEmail(email)
    {
        User storage user = users[userAddress];
        emailToAddress[user.email] = address(0); // Clear old email mapping
        user.username = username;
        user.email = email;
        user.bio = bio;
        emailToAddress[email] = userAddress; // Set new email mapping
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

    function getUserByEmail(
        string memory userEmail
    )
        external
        view
        returns (
            string memory username,
            string memory email,
            string memory bio,
            string[] memory interests
        )
    {
        address userAddress = emailToAddress[userEmail];
        require(userAddress != address(0), "User does not exist");
        User storage user = users[userAddress];
        return (user.username, user.email, user.bio, user.interests);
    }

    function getUserByAddress(
        address userAddress
    )
        external
        view
        returns (
            string memory username,
            string memory email,
            string memory bio,
            string[] memory interests
        )
    {
        require(
            bytes(users[userAddress].username).length > 0,
            "User does not exist"
        );
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

    function deleteUser(
        address userAddress
    ) external onlyExistingUser(userAddress) {
        delete emailToAddress[users[userAddress].email];
        delete users[userAddress];
        for (uint i = 0; i < userAddresses.length; i++) {
            if (userAddresses[i] == userAddress) {
                userAddresses[i] = userAddresses[userAddresses.length - 1];
                userAddresses.pop();
                break;
            }
        }
        emit UserDeleted(userAddress);
    }

    function getAllUsernamesAddressesAndEmails()
        external
        view
        returns (
            string[] memory usernames,
            address[] memory addresses,
            string[] memory emails
        )
    {
        uint length = userAddresses.length;
        usernames = new string[](length);
        addresses = new address[](length);
        emails = new string[](length);

        for (uint i = 0; i < length; i++) {
            address userAddress = userAddresses[i];
            User storage user = users[userAddress];
            usernames[i] = user.username;
            addresses[i] = userAddress;
            emails[i] = user.email;
        }

        return (usernames, addresses, emails);
    }

    function getAllUsers() external view returns (User[] memory) {
        uint length = userAddresses.length;
        User[] memory allUsers = new User[](length);

        for (uint i = 0; i < length; i++) {
            address userAddress = userAddresses[i];
            allUsers[i] = users[userAddress];
        }

        return allUsers;
    }
}
