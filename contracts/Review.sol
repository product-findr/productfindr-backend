// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Product.sol";

contract Review {
    struct ReviewInfo {
        address reviewer;
        string content;
        uint256 rating;
        uint256 timestamp;
    }

    Product private productContract;
    mapping(uint256 => ReviewInfo[]) public productReviews;
    mapping(uint256 => mapping(address => bool)) public hasReviewed;

    event ReviewAdded(
        uint256 indexed productId,
        address indexed reviewer,
        string content,
        uint256 rating
    );

    constructor(address _productAddress) {
        productContract = Product(_productAddress);
    }

    modifier productExists(uint256 _productId) {
        require(
            productContract.getProduct(_productId).product.id == _productId,
            "Product does not exist"
        );
        _;
    }

    modifier validRating(uint256 _rating) {
        require(_rating > 0 && _rating <= 5, "Rating must be between 1 and 5");
        _;
    }

    modifier nonEmptyContent(string memory _content) {
        require(bytes(_content).length > 0, "Review content cannot be empty");
        _;
    }

    function addReview(
        address _reviewer,
        uint256 _productId,
        string memory _content,
        uint256 _rating
    )
        public
        productExists(_productId)
        validRating(_rating)
        nonEmptyContent(_content)
    {
        // Combine checks to reduce stack depth
        require(
            productContract.getProduct(_productId).product.owner != _reviewer,
            "Product owner cannot review their own product"
        );
        require(
            !hasReviewed[_productId][_reviewer],
            "Reviewer has already reviewed this product"
        );

        productReviews[_productId].push(
            ReviewInfo({
                reviewer: _reviewer,
                content: _content,
                rating: _rating,
                timestamp: block.timestamp
            })
        );
        hasReviewed[_productId][_reviewer] = true; // Mark as reviewed

        emit ReviewAdded(_productId, _reviewer, _content, _rating);
    }

    function updateReview(
        address _reviewer,
        uint256 _productId,
        string memory _content,
        uint256 _rating
    )
        public
        productExists(_productId)
        validRating(_rating)
        nonEmptyContent(_content)
    {
        // Combine checks to reduce stack depth
        require(
            productContract.getProduct(_productId).product.owner != _reviewer,
            "Product owner cannot review their own product"
        );

        ReviewInfo[] storage reviews = productReviews[_productId];
        for (uint256 i = 0; i < reviews.length; i++) {
            if (reviews[i].reviewer == _reviewer) {
                reviews[i].content = _content;
                reviews[i].rating = _rating;
                reviews[i].timestamp = block.timestamp;
                return;
            }
        }
        revert("Review not found");
    }

    function getReviews(
        uint256 _productId
    ) public view productExists(_productId) returns (ReviewInfo[] memory) {
        return productReviews[_productId];
    }

    function getReview(
        uint256 _productId,
        uint256 _reviewId
    ) public view productExists(_productId) returns (ReviewInfo memory) {
        require(
            _reviewId < productReviews[_productId].length,
            "Review does not exist"
        );
        return productReviews[_productId][_reviewId];
    }

    function getReviewer(
        uint256 _productId,
        uint256 _reviewId
    ) public view productExists(_productId) returns (address) {
        require(
            _reviewId < productReviews[_productId].length,
            "Review does not exist"
        );
        return productReviews[_productId][_reviewId].reviewer;
    }

    function getReviewsCount(
        uint256 _productId
    ) public view productExists(_productId) returns (uint256) {
        return productReviews[_productId].length;
    }
}
