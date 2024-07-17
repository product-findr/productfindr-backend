// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LiveProduct.sol";
import "./BetaTestingProduct.sol";
import "./Comment.sol";
import "./Review.sol";

contract ProductFindr {
    LiveProduct private liveProductContract;
    BetaTestingProduct private betaTestingProductContract;
    Comment private commentContractLive;
    Comment private commentContractBeta;
    Review private reviewContractLive;
    Review private reviewContractBeta;

    constructor(
        address _liveProductAddress,
        address _betaTestingProductAddress,
        address _liveCommentAddress,
        address _betaCommentAddress,
        address _liveReviewAddress,
        address _betaReviewAddress
    ) {
        liveProductContract = LiveProduct(_liveProductAddress);
        betaTestingProductContract = BetaTestingProduct(
            _betaTestingProductAddress
        );
        commentContractLive = Comment(_liveCommentAddress);
        commentContractBeta = Comment(_betaCommentAddress);
        reviewContractLive = Review(_liveReviewAddress);
        reviewContractBeta = Review(_betaReviewAddress);
    }

    // Live Product Functions
    function registerLiveProduct(
        address _owner,
        ProductLibrary.ProductDetails memory details
    ) public {
        liveProductContract.registerLiveProduct(_owner, details);
    }

    function upvoteLiveProduct(uint256 productId) public {
        liveProductContract.upvoteLiveProduct(productId, msg.sender);
    }

    function getLiveProduct(
        uint256 _productId
    ) public view returns (ProductLibrary.ProductInfo memory) {
        return liveProductContract.getLiveProduct(_productId);
    }

    function getAllLiveProducts()
        public
        view
        returns (ProductLibrary.ProductInfo[] memory)
    {
        return liveProductContract.getAllLiveProducts();
    }

    function getLiveProductsAfter24Hours()
        public
        view
        returns (ProductLibrary.ProductInfo[] memory)
    {
        return liveProductContract.getLiveProductsAfter24Hours();
    }

    function deleteLiveProduct(uint256 _productId) public {
        liveProductContract.deleteLiveProduct(_productId);
    }

    // Beta Testing Product Functions
    function registerBetaTestingProduct(
        address _owner,
        ProductLibrary.ProductDetails memory details,
        BetaTestingDetailsLibrary.BetaTestingDetails memory betaDetails
    ) public {
        betaTestingProductContract.registerBetaTestingProduct(
            _owner,
            details,
            betaDetails
        );
    }

    function upvoteBetaTestingProduct(uint256 productId) public {
        betaTestingProductContract.upvoteBetaTestingProduct(
            productId,
            msg.sender
        );
    }

    function updateBetaTestingLink(
        uint256 _productId,
        string memory _betaTestingLink
    ) public {
        betaTestingProductContract.updateBetaTestingLink(
            _productId,
            _betaTestingLink
        );
    }

    function getBetaTestingProduct(
        uint256 _productId
    )
        public
        view
        returns (
            ProductLibrary.ProductInfo memory,
            BetaTestingDetailsLibrary.BetaTestingDetails memory
        )
    {
        return betaTestingProductContract.getBetaTestingProduct(_productId);
    }

    function getAllBetaTestingProducts()
        public
        view
        returns (
            ProductLibrary.ProductInfo[] memory,
            BetaTestingDetailsLibrary.BetaTestingDetails[] memory
        )
    {
        return betaTestingProductContract.getAllBetaTestingProducts();
    }

    function deleteBetaTestingProduct(uint256 _productId) public {
        betaTestingProductContract.deleteBetaTestingProduct(_productId);
    }

    // Comment Functions
    function commentOnLiveProduct(
        uint256 _productId,
        string memory _content
    ) public {
        commentContractLive.commentOnProduct(_productId, _content);
    }

    function commentOnBetaTestingProduct(
        uint256 _productId,
        string memory _content
    ) public {
        commentContractBeta.commentOnProduct(_productId, _content);
    }

    function getLiveProductComments(
        uint256 _productId
    ) public view returns (Comment.CommentInfo[] memory) {
        return commentContractLive.getComments(_productId);
    }

    function getBetaTestingProductComments(
        uint256 _productId
    ) public view returns (Comment.CommentInfo[] memory) {
        return commentContractBeta.getComments(_productId);
    }

    function getLiveProductComment(
        uint256 _productId,
        uint256 _commentId
    ) public view returns (Comment.CommentInfo memory) {
        return commentContractLive.getComment(_productId, _commentId);
    }

    function getBetaTestingProductComment(
        uint256 _productId,
        uint256 _commentId
    ) public view returns (Comment.CommentInfo memory) {
        return commentContractBeta.getComment(_productId, _commentId);
    }

    function getLiveProductCommentsCount(
        uint256 _productId
    ) public view returns (uint256) {
        return commentContractLive.getCommentsCount(_productId);
    }

    function getBetaTestingProductCommentsCount(
        uint256 _productId
    ) public view returns (uint256) {
        return commentContractBeta.getCommentsCount(_productId);
    }

    function getLiveProductCommenter(
        uint256 _productId,
        uint256 _commentId
    ) public view returns (address) {
        return commentContractLive.getCommenter(_productId, _commentId);
    }

    function getBetaTestingProductCommenter(
        uint256 _productId,
        uint256 _commentId
    ) public view returns (address) {
        return commentContractBeta.getCommenter(_productId, _commentId);
    }

    // Review Functions
    function addLiveProductReview(
        address _reviewer,
        uint256 _productId,
        string memory _content,
        uint256 _rating
    ) public {
        reviewContractLive.addReview(_reviewer, _productId, _content, _rating);
    }

    function addBetaTestingProductReview(
        address _reviewer,
        uint256 _productId,
        string memory _content,
        uint256 _rating
    ) public {
        reviewContractBeta.addReview(_reviewer, _productId, _content, _rating);
    }

    function getLiveProductReviews(
        uint256 _productId
    ) public view returns (Review.ReviewInfo[] memory) {
        return reviewContractLive.getReviews(_productId);
    }

    function getBetaTestingProductReviews(
        uint256 _productId
    ) public view returns (Review.ReviewInfo[] memory) {
        return reviewContractBeta.getReviews(_productId);
    }

    function getLiveProductReview(
        uint256 _productId,
        uint256 _reviewId
    ) public view returns (Review.ReviewInfo memory) {
        return reviewContractLive.getReview(_productId, _reviewId);
    }

    function getBetaTestingProductReview(
        uint256 _productId,
        uint256 _reviewId
    ) public view returns (Review.ReviewInfo memory) {
        return reviewContractBeta.getReview(_productId, _reviewId);
    }

    function getLiveProductReviewer(
        uint256 _productId,
        uint256 _reviewId
    ) public view returns (address) {
        return reviewContractLive.getReviewer(_productId, _reviewId);
    }

    function getBetaTestingProductReviewer(
        uint256 _productId,
        uint256 _reviewId
    ) public view returns (address) {
        return reviewContractBeta.getReviewer(_productId, _reviewId);
    }

    function getLiveProductReviewsCount(
        uint256 _productId
    ) public view returns (uint256) {
        return reviewContractLive.getReviewsCount(_productId);
    }

    function getBetaTestingProductReviewsCount(
        uint256 _productId
    ) public view returns (uint256) {
        return reviewContractBeta.getReviewsCount(_productId);
    }
}
