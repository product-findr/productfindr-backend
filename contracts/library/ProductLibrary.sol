// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./BetaTestingDetailsLibrary.sol";

library ProductLibrary {
    using BetaTestingDetailsLibrary for BetaTestingDetailsLibrary.BetaTestingDetails;

    struct ProductDetails {
        string productName;
        string tagLine;
        string productLink;
        string twitterLink;
        string description;
        bool isOpenSource;
        string category;
        string thumbNail;
        string mediaFile;
        string loomLink;
        bool workedWithTeam;
        string teamMembersInput;
        string pricingOption;
        string offer;
        string promoCode;
        string expirationDate;
        string betaTestingLink;
    }

    struct ProductInfo {
        uint256 id;
        address owner;
        ProductDetails details;
        uint256 upvotes;
        bool betaTestingAvailable;
        uint256 timestamp;
    }

    struct ProductWithBetaTesting {
        ProductInfo product;
        BetaTestingDetailsLibrary.BetaTestingDetails betaTestingDetails;
        bool hasBetaTestingDetails;
    }
}
