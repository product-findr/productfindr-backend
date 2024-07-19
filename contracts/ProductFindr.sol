// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./Product.sol";
import "./Comment.sol";
import "./Review.sol";
import "./BetaTestingDetailsManager.sol";
import "./library/ProductLibrary.sol";
import "./library/BetaTestingDetailsLibrary.sol";

contract ProductFindr is Initializable, OwnableUpgradeable {
    Product private productContract;
    Comment private commentContract;
    Review private reviewContract;
    BetaTestingDetailsManager private betaTestingManager;

    mapping(address => uint256) public userReputation;

    event UserReputationUpdated(address indexed user, uint256 reputation);

    function initialize(
        address productAddress,
        address commentAddress,
        address reviewAddress,
        address betaTestingManagerAddress,
        address initialOwner
    ) public initializer {
        __Ownable_init(initialOwner);
        productContract = Product(productAddress);
        commentContract = Comment(commentAddress);
        reviewContract = Review(reviewAddress);
        betaTestingManager = BetaTestingDetailsManager(
            betaTestingManagerAddress
        );
        transferOwnership(initialOwner);
    }

    modifier reviewExists(uint256 _productId, uint256 _reviewId) {
        require(
            _reviewId < reviewContract.getReviews(_productId).length,
            "Review does not exist"
        );
        _;
    }

    modifier validCommentContent(string memory _content) {
        require(bytes(_content).length > 0, "Comment content cannot be empty");
        _;
    }

    modifier validReviewContent(string memory _content) {
        require(bytes(_content).length > 0, "Review content cannot be empty");
        _;
    }

    modifier validReviewRating(uint256 _rating) {
        require(_rating > 0 && _rating <= 5, "Rating must be between 1 and 5");
        _;
    }

    function registerProduct(
        address _owner,
        ProductLibrary.ProductDetails memory details,
        bool betaTestingAvailable,
        BetaTestingDetailsLibrary.BetaTestingDetails memory betaDetails
    ) public {
        productContract.registerProduct(
            _owner,
            details,
            betaTestingAvailable,
            betaDetails
        );
        userReputation[msg.sender]++;
        emit UserReputationUpdated(msg.sender, userReputation[msg.sender]);
    }

    function upvoteProduct(uint256 _productId, address _upvoter) public {
        productContract.upvoteProduct(_productId, _upvoter);
        userReputation[productContract.getProduct(_productId).product.owner]++;
        emit UserReputationUpdated(
            productContract.getProduct(_productId).product.owner,
            userReputation[productContract.getProduct(_productId).product.owner]
        );
    }

    function canBeListed(uint256 _productId) public view returns (bool) {
        return productContract.canBeListed(_productId);
    }

    function commentOnProduct(
        uint256 _productId,
        string memory _content
    ) public validCommentContent(_content) {
        commentContract.commentOnProduct(_productId, _content);
        userReputation[msg.sender]++;
        emit UserReputationUpdated(msg.sender, userReputation[msg.sender]);
    }

    function getProduct(
        uint256 _productId
    ) public view returns (ProductLibrary.ProductWithBetaTesting memory) {
        return productContract.getProduct(_productId);
    }

    function getListedProducts()
        public
        view
        returns (ProductLibrary.ProductWithBetaTesting[] memory)
    {
        return productContract.getListedProducts();
    }

    function getListedProductsAvailable()
        public
        view
        returns (ProductLibrary.ProductWithBetaTesting[] memory)
    {
        return productContract.getListedProductsAvailable();
    }

    function addReview(
        address _reviewer,
        uint256 _productId,
        string memory _content,
        uint256 _rating
    ) public validReviewContent(_content) validReviewRating(_rating) {
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
