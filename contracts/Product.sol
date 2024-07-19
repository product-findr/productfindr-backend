// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./library/ProductLibrary.sol";
import "./library/BetaTestingDetailsLibrary.sol";

contract Product is Initializable, OwnableUpgradeable {
    using ProductLibrary for ProductLibrary.ProductDetails;
    using ProductLibrary for ProductLibrary.ProductInfo;
    using ProductLibrary for ProductLibrary.ProductWithBetaTesting;

    using BetaTestingDetailsLibrary for BetaTestingDetailsLibrary.BetaTestingDetails;

    uint256 private _productIdCounter;
    mapping(uint256 => ProductLibrary.ProductInfo) public products;
    mapping(uint256 => mapping(address => bool)) public hasUpvoted;

    mapping(uint256 => BetaTestingDetailsLibrary.BetaTestingDetails)
        public betaTestingDetails;

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

    function initialize(address initialOwner) public initializer {
        __Ownable_init(initialOwner);
        transferOwnership(initialOwner);
    }

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

    function registerProduct(
        address _owner,
        ProductLibrary.ProductDetails memory details,
        bool betaTestingAvailable,
        BetaTestingDetailsLibrary.BetaTestingDetails memory betaDetails
    ) public validProductDetails(details) {
        _productIdCounter++;
        uint256 productId = _productIdCounter;

        products[productId] = ProductLibrary.ProductInfo({
            id: productId,
            owner: _owner,
            details: details,
            upvotes: 0,
            betaTestingAvailable: betaTestingAvailable,
            timestamp: block.timestamp
        });

        if (betaTestingAvailable) {
            require(
                bytes(details.betaTestingLink).length > 0,
                "Beta testing link required"
            );
            betaTestingDetails[productId] = betaDetails;
        }

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
    )
        public
        view
        productExists(_productId)
        returns (ProductLibrary.ProductWithBetaTesting memory)
    {
        ProductLibrary.ProductWithBetaTesting memory productWithBetaTesting;
        productWithBetaTesting.product = products[_productId];
        productWithBetaTesting.hasBetaTestingDetails = products[_productId]
            .betaTestingAvailable;
        if (productWithBetaTesting.hasBetaTestingDetails) {
            productWithBetaTesting.betaTestingDetails = betaTestingDetails[
                _productId
            ];
        }
        return productWithBetaTesting;
    }

    function canBeListed(
        uint256 _productId
    ) public view productExists(_productId) returns (bool) {
        ProductLibrary.ProductInfo memory product = products[_productId];
        return block.timestamp >= product.timestamp + 24 hours;
    }

    function getListedProductsAvailable()
        public
        view
        returns (ProductLibrary.ProductWithBetaTesting[] memory)
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
        ProductLibrary.ProductWithBetaTesting[]
            memory listedProducts = new ProductLibrary.ProductWithBetaTesting[](
                listedCount
            );
        uint256 index = 0;

        // Populate the array with the listed products
        for (uint256 i = 1; i <= totalProducts; i++) {
            if (canBeListed(i)) {
                listedProducts[index] = getProduct(i);
                index++;
            }
        }

        return listedProducts;
    }

    function getListedProducts()
        public
        view
        returns (ProductLibrary.ProductWithBetaTesting[] memory)
    {
        uint256 totalProducts = _productIdCounter;

        ProductLibrary.ProductWithBetaTesting[]
            memory listedProducts = new ProductLibrary.ProductWithBetaTesting[](
                totalProducts
            );

        for (uint256 i = 1; i <= totalProducts; i++) {
            listedProducts[i - 1] = getProduct(i);
        }

        return listedProducts;
    }

    function deleteProduct(
        uint256 _productId
    ) public productExists(_productId) onlyProductOwner(_productId) {
        delete products[_productId];
        delete betaTestingDetails[_productId];
    }
}
