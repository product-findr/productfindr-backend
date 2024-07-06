// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BetaTestingDetailsManager {
    struct BetaTestingDetails {
        uint256 targetNumbersOfTester;
        string testingGoal;
        string[] goals;
        uint256 startingDate;
        uint256 endingDate;
    }

    mapping(uint256 => BetaTestingDetails) public betaTestingDetails;

    function setBetaTestingDetails(
        uint256 _productId,
        BetaTestingDetails memory _details
    ) public {
        betaTestingDetails[_productId] = _details;
    }

    function getBetaTestingDetails(
        uint256 _productId
    ) public view returns (BetaTestingDetails memory) {
        return betaTestingDetails[_productId];
    }
}
