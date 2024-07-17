// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./library/ProductLibrary.sol";
import "./library/BetaTestingDetailsLibrary.sol";

contract BetaTestingProduct is Ownable {
    using ProductLibrary for ProductLibrary.ProductDetails;
    using ProductLibrary for ProductLibrary.ProductInfo;
    using BetaTestingDetailsLibrary for BetaTestingDetailsLibrary.BetaTestingDetails;

    uint256 private _productIdCounter;
    mapping(uint256 => ProductLibrary.ProductInfo) public products;
    mapping(uint256 => BetaTestingDetailsLibrary.BetaTestingDetails)
        public betaTestingDetails;
    mapping(uint256 => mapping(address => bool)) public hasUpvoted;

    event BetaTestingProductRegistered(
        uint256 indexed productId,
        address indexed owner,
        string productName,
        string description
    );

    event BetaTestingProductUpvoted(
        uint256 indexed productId,
        address indexed user
    );

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

    modifier validProductDetails(ProductLibrary.ProductDetails memory details) {
        require(
            bytes(details.productName).length > 0,
            "Product name cannot be empty"
        );
        require(
            bytes(details.description).length > 0,
            "Product description cannot be empty"
        );
        require(
            bytes(details.productLink).length > 0,
            "Product link cannot be empty"
        );
        _;
    }

    function registerBetaTestingProduct(
        address _owner,
        ProductLibrary.ProductDetails memory details,
        BetaTestingDetailsLibrary.BetaTestingDetails memory betaDetails
    ) public validProductDetails(details) {
        _productIdCounter++;
        uint256 productId = _productIdCounter;

        require(
            bytes(details.productLink).length > 0,
            "Beta testing link required"
        );
        betaTestingDetails[productId] = betaDetails;

        products[productId] = ProductLibrary.ProductInfo({
            id: productId,
            owner: _owner,
            details: details,
            upvotes: 0,
            timestamp: block.timestamp
        });

        emit BetaTestingProductRegistered(
            productId,
            _owner,
            details.productName,
            details.description
        );
    }

    function upvoteBetaTestingProduct(
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

        emit BetaTestingProductUpvoted(productId, upvoter);
    }

    function updateBetaTestingLink(
        uint256 _productId,
        string memory _betaTestingLink
    ) public productExists(_productId) onlyProductOwner(_productId) {
        products[_productId].details.productLink = _betaTestingLink;

        emit BetaTestingLinkUpdated(_productId, _betaTestingLink);
    }

    function getBetaTestingProduct(
        uint256 _productId
    )
        public
        view
        productExists(_productId)
        returns (
            ProductLibrary.ProductInfo memory,
            BetaTestingDetailsLibrary.BetaTestingDetails memory
        )
    {
        return (products[_productId], betaTestingDetails[_productId]);
    }

    function getAllBetaTestingProducts()
        public
        view
        returns (
            ProductLibrary.ProductInfo[] memory,
            BetaTestingDetailsLibrary.BetaTestingDetails[] memory
        )
    {
        uint256 totalProducts = _productIdCounter;
        ProductLibrary.ProductInfo[]
            memory allProducts = new ProductLibrary.ProductInfo[](
                totalProducts
            );
        BetaTestingDetailsLibrary.BetaTestingDetails[]
            memory allBetaDetails = new BetaTestingDetailsLibrary.BetaTestingDetails[](
                totalProducts
            );

        for (uint256 i = 1; i <= totalProducts; i++) {
            allProducts[i - 1] = products[i];
            allBetaDetails[i - 1] = betaTestingDetails[i];
        }

        return (allProducts, allBetaDetails);
    }

    function deleteBetaTestingProduct(
        uint256 _productId
    ) public productExists(_productId) onlyProductOwner(_productId) {
        delete products[_productId];
        delete betaTestingDetails[_productId];
    }
}
