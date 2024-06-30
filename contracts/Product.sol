// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Product is Ownable {
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

    uint256 private _productIdCounter;
    mapping(uint256 => ProductInfo) public products;
    mapping(uint256 => mapping(address => bool)) public hasUpvoted;

    event ProductRegistered(
        uint256 indexed productId,
        address indexed owner,
        string productName,
        string description
    );

    event ProductUpvoted(uint256 indexed productId, address indexed user);

    event BetaTestingLinkUpdated(
        uint256 indexed productId,
        string betaTestingLink
    );

    constructor(address initialOwner) Ownable(initialOwner) {}

    modifier productExists(uint256 _productId) {
        require(
            products[_productId].id == _productId,
            "Product does not exist"
        );
        _;
    }

    modifier onlyProductOwner(uint256 _productId) {
        require(
            products[_productId].owner == msg.sender,
            "Only the product owner can perform this action"
        );
        _;
    }

    modifier hasNotUpvoted(uint256 _productId, address upvoter) {
        require(
            !hasUpvoted[_productId][upvoter],
            "User has already upvoted this product"
        );
        _;
    }

    modifier notProductOwner(uint256 _productId, address upvoter) {
        require(
            products[_productId].owner != upvoter,
            "Product owner cannot upvote their own product"
        );
        _;
    }

    function registerProduct(
        address _owner,
        ProductDetails memory details
    ) public {
        _productIdCounter++;
        uint256 productId = _productIdCounter;
        products[productId] = ProductInfo({
            id: productId,
            owner: _owner,
            details: details,
            upvotes: 0,
            betaTestingAvailable: bytes(details.betaTestingLink).length > 0,
            timestamp: block.timestamp
        });
        emit ProductRegistered(
            productId,
            _owner,
            details.productName,
            details.description
        );
    }

    function upvoteProduct(
        uint256 productId,
        address upvoter
    )
        public
        productExists(productId)
        notProductOwner(productId, upvoter)
        hasNotUpvoted(productId, upvoter)
    {
        products[productId].upvotes++;
        hasUpvoted[productId][upvoter] = true;

        emit ProductUpvoted(productId, upvoter);
    }

    function updateBetaTestingLink(
        uint256 _productId,
        string memory _betaTestingLink
    ) public productExists(_productId) onlyProductOwner(_productId) {
        products[_productId].details.betaTestingLink = _betaTestingLink;
        products[_productId].betaTestingAvailable =
            bytes(_betaTestingLink).length > 0;

        emit BetaTestingLinkUpdated(_productId, _betaTestingLink);
    }

    function getProduct(
        uint256 _productId
    ) public view productExists(_productId) returns (ProductInfo memory) {
        return products[_productId];
    }

    function canBeListed(
        uint256 _productId
    ) public view productExists(_productId) returns (bool) {
        ProductInfo memory product = products[_productId];
        if (product.betaTestingAvailable) {
            return true;
        }
        return block.timestamp >= product.timestamp + 24 hours;
    }

    // function getListedProducts(
    //     uint256 start,
    //     uint256 count
    // ) public view returns (ProductInfo[] memory) {
    //     uint256 listedCount = 0;
    //     for (
    //         uint256 i = start;
    //         i < start + count && i <= _productIdCounter;
    //         i++
    //     ) {
    //         if (canBeListed(i)) {
    //             listedCount++;
    //         }
    //     }

    //     ProductInfo[] memory listedProducts = new ProductInfo[](listedCount);
    //     uint256 index = 0;
    //     for (
    //         uint256 i = start;
    //         i < start + count && i <= _productIdCounter;
    //         i++
    //     ) {
    //         if (canBeListed(i)) {
    //             listedProducts[index] = products[i];
    //             index++;
    //         }
    //     }
    //     return listedProducts;
    // }

    function getListedProducts() public view returns (ProductInfo[] memory) {
        uint256 totalProducts = _productIdCounter;
        uint256 listedCount = 0;

        // Countew how many products can be listed
        for (uint256 i = 1; i <= totalProducts; i++) {
            if (canBeListed(i)) {
                listedCount++;
            }
        }

        // Create an array to hold the listed products
        ProductInfo[] memory listedProducts = new ProductInfo[](listedCount);
        uint256 index = 0;

        // Populate the array with the listed products
        for (uint256 i = 1; i <= totalProducts; i++) {
            if (canBeListed(i)) {
                listedProducts[index] = products[i];
                index++;
            }
        }

        return listedProducts;
    }
}
