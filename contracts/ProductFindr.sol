// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Product.sol";
import "./Comment.sol";
import "./Review.sol";

contract ProductFindr is Ownable {
    Product private productContract;
    Comment private commentContract;
    Review private reviewContract;

    mapping(address => uint256) public userReputation;

    event UserReputationUpdated(address indexed user, uint256 reputation);

    constructor(
        address _productAddress,
        address _commentAddress,
        address _reviewAddress,
        address initialOwner
    ) Ownable(initialOwner) {
        productContract = Product(_productAddress);
        commentContract = Comment(_commentAddress);
        reviewContract = Review(_reviewAddress);
    }

    modifier reviewExists(uint256 _productId, uint256 _reviewId) {
        require(
            _reviewId < reviewContract.getReviews(_productId).length,
            "Review does not exist"
        );
        _;
    }

    function registerProduct(
        address _owner,
        Product.ProductDetails memory details
    ) public {
        productContract.registerProduct(_owner, details);
        userReputation[msg.sender]++;
        emit UserReputationUpdated(msg.sender, userReputation[msg.sender]);
    }

    function upvoteProduct(uint256 _productId, address _upvoter) public {
        productContract.upvoteProduct(_productId, _upvoter);
        userReputation[productContract.getProduct(_productId).owner]++;
        emit UserReputationUpdated(
            productContract.getProduct(_productId).owner,
            userReputation[productContract.getProduct(_productId).owner]
        );
    }

    function commentOnProduct(
        uint256 _productId,
        string memory _content
    ) public {
        commentContract.commentOnProduct(_productId, _content);
        userReputation[msg.sender]++;
        emit UserReputationUpdated(msg.sender, userReputation[msg.sender]);
    }

    function getProduct(
        uint256 _productId
    ) public view returns (Product.ProductInfo memory) {
        return productContract.getProduct(_productId);
    }

    function getListedProducts()
        public
        view
        returns (Product.ProductInfo[] memory)
    {
        return productContract.getListedProducts();
    }

    function addReview(
        address _reviewer,
        uint256 _productId,
        string memory _content,
        uint256 _rating
    ) public {
        reviewContract.addReview(_reviewer, _productId, _content, _rating);
        userReputation[msg.sender]++;
        emit UserReputationUpdated(msg.sender, userReputation[msg.sender]);
    }

    function getReviews(
        uint256 _productId
    ) public view returns (Review.ReviewInfo[] memory) {
        return reviewContract.getReviews(_productId);
    }

    function getReview(
        uint256 _productId,
        uint256 _reviewId
    )
        public
        view
        reviewExists(_productId, _reviewId)
        returns (Review.ReviewInfo memory)
    {
        return reviewContract.getReview(_productId, _reviewId);
    }

    function getReviewer(
        uint256 _productId,
        uint256 _reviewId
    ) public view reviewExists(_productId, _reviewId) returns (address) {
        return reviewContract.getReviewer(_productId, _reviewId);
    }

    function getReviewsCount(uint256 _productId) public view returns (uint256) {
        return reviewContract.getReviewsCount(_productId);
    }

    function getComments(
        uint256 _productId
    ) public view returns (Comment.CommentInfo[] memory) {
        return commentContract.getComments(_productId);
    }

    function getComment(
        uint256 _productId,
        uint256 _commentId
    ) public view returns (Comment.CommentInfo memory) {
        return commentContract.getComment(_productId, _commentId);
    }

    function getCommentsCount(
        uint256 _productId
    ) public view returns (uint256) {
        return commentContract.getCommentsCount(_productId);
    }

    function getCommenter(
        uint256 _productId,
        uint256 _commentId
    ) public view returns (address) {
        return commentContract.getCommenter(_productId, _commentId);
    }
}
