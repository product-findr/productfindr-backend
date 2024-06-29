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

    Product private immutable productContract; // Use immutable to save gas on state variable
    mapping(uint256 => ReviewInfo[]) private productReviews; // Make the mapping private, and provide external getters

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
            productContract.getProduct(_productId).id == _productId,
            "Product does not exist"
        );
        _;
    }

    modifier reviewExists(uint256 _productId, uint256 _reviewId) {
        require(
            _reviewId < productReviews[_productId].length,
            "Review does not exist"
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
        external
        productExists(_productId)
        validRating(_rating)
        nonEmptyContent(_content)
    {
        productReviews[_productId].push(
            ReviewInfo({
                reviewer: _reviewer,
                content: _content,
                rating: _rating,
                timestamp: block.timestamp
            })
        );

        emit ReviewAdded(_productId, _reviewer, _content, _rating);
    }

    function getReviews(
        uint256 _productId
    ) external view productExists(_productId) returns (ReviewInfo[] memory) {
        return productReviews[_productId];
    }

    function getReview(
        uint256 _productId,
        uint256 _reviewId
    )
        external
        view
        productExists(_productId)
        reviewExists(_productId, _reviewId)
        returns (ReviewInfo memory)
    {
        return productReviews[_productId][_reviewId];
    }

    function getReviewer(
        uint256 _productId,
        uint256 _reviewId
    )
        external
        view
        productExists(_productId)
        reviewExists(_productId, _reviewId)
        returns (address)
    {
        return productReviews[_productId][_reviewId].reviewer;
    }

    function getReviewsCount(
        uint256 _productId
    ) external view productExists(_productId) returns (uint256) {
        return productReviews[_productId].length;
    }
}
