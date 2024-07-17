// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./library/ProductLibrary.sol";

contract LiveProduct is Ownable {
    using ProductLibrary for ProductLibrary.ProductDetails;
    using ProductLibrary for ProductLibrary.ProductInfo;

    uint256 private _productIdCounter;
    mapping(uint256 => ProductLibrary.ProductInfo) public products;
    mapping(uint256 => mapping(address => bool)) public hasUpvoted;

    event LiveProductRegistered(
        uint256 indexed productId,
        address indexed owner,
        string productName,
        string description
    );

    event LiveProductUpvoted(uint256 indexed productId, address indexed user);

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

    function registerLiveProduct(
        address _owner,
        ProductLibrary.ProductDetails memory details
    ) public validProductDetails(details) {
        _productIdCounter++;
        uint256 productId = _productIdCounter;

        products[productId] = ProductLibrary.ProductInfo({
            id: productId,
            owner: _owner,
            details: details,
            upvotes: 0,
            timestamp: block.timestamp
        });

        emit LiveProductRegistered(
            productId,
            _owner,
            details.productName,
            details.description
        );
    }

    function upvoteLiveProduct(
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

        emit LiveProductUpvoted(productId, upvoter);
    }

    function getLiveProduct(
        uint256 _productId
    )
        public
        view
        productExists(_productId)
        returns (ProductLibrary.ProductInfo memory)
    {
        return products[_productId];
    }

    function getAllLiveProducts()
        public
        view
        returns (ProductLibrary.ProductInfo[] memory)
    {
        uint256 totalProducts = _productIdCounter;
        ProductLibrary.ProductInfo[]
            memory allProducts = new ProductLibrary.ProductInfo[](
                totalProducts
            );

        for (uint256 i = 1; i <= totalProducts; i++) {
            allProducts[i - 1] = products[i];
        }

        return allProducts;
    }

    function getLiveProductsAfter24Hours()
        public
        view
        returns (ProductLibrary.ProductInfo[] memory)
    {
        uint256 totalProducts = _productIdCounter;
        uint256 listedCount = 0;

        // Count how many products can be listed
        for (uint256 i = 1; i <= totalProducts; i++) {
            if (canBeListed(i)) {
                listedCount++;
            }
        }

        // Create an array to hold the listed products
        ProductLibrary.ProductInfo[]
            memory listedProducts = new ProductLibrary.ProductInfo[](
                listedCount
            );
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

    function canBeListed(uint256 _productId) public view returns (bool) {
        return block.timestamp >= products[_productId].timestamp + 24 hours;
    }

    function deleteLiveProduct(
        uint256 _productId
    ) public productExists(_productId) onlyProductOwner(_productId) {
        delete products[_productId];
    }
}
