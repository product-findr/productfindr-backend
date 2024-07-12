// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./library/BetaTestingDetailsLibrary.sol";

contract BetaTestingDetailsManager {
    using BetaTestingDetailsLibrary for BetaTestingDetailsLibrary.BetaTestingDetails;

    mapping(uint256 => BetaTestingDetailsLibrary.BetaTestingDetails)
        public betaTestingDetails;

    function setBetaTestingDetails(
        uint256 _productId,
        BetaTestingDetailsLibrary.BetaTestingDetails memory _details
    ) public {
        betaTestingDetails[_productId] = _details;
    }

    function getBetaTestingDetails(
        uint256 _productId
    )
        public
        view
        returns (BetaTestingDetailsLibrary.BetaTestingDetails memory)
    {
        return betaTestingDetails[_productId];
    }
}
