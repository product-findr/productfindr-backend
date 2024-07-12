// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library BetaTestingDetailsLibrary {
    struct BetaTestingDetails {
        string contractAddress;
        uint256 targetNumbersOfTester;
        string testingGoal;
        string[] goals;
        uint256 startingDate;
        uint256 endingDate;
        string featureLoomLink;
    }
}
