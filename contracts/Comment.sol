// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./Product.sol";

contract Comment is Initializable {
    struct CommentInfo {
        address commenter;
        string content;
        uint256 timestamp;
    }

    Product private productContract;
    mapping(uint256 => CommentInfo[]) public productComments;

    event CommentAdded(
        uint256 indexed productId,
        address indexed commenter,
        string content
    );

    function initialize(address productAddress) public initializer {
        productContract = Product(productAddress);
    }

    modifier productExists(uint256 _productId) {
        require(
            productContract.getProduct(_productId).product.id == _productId,
            "Product does not exist"
        );
        _;
    }

    modifier commentExists(uint256 _productId, uint256 _commentId) {
        require(
            _commentId < productComments[_productId].length,
            "Comment does not exist"
        );
        _;
    }

    modifier nonEmptyContent(string memory _content) {
        require(bytes(_content).length > 0, "Comment content cannot be empty");
        _;
    }

    function commentOnProduct(
        uint256 _productId,
        string memory _content
    ) public productExists(_productId) nonEmptyContent(_content) {
        productComments[_productId].push(
            CommentInfo({
                commenter: msg.sender,
                content: _content,
                timestamp: block.timestamp
            })
        );

        emit CommentAdded(_productId, msg.sender, _content);
    }

    function getComments(
        uint256 _productId
    ) public view productExists(_productId) returns (CommentInfo[] memory) {
        return productComments[_productId];
    }

    function getComment(
        uint256 _productId,
        uint256 _commentId
    )
        public
        view
        productExists(_productId)
        commentExists(_productId, _commentId)
        returns (CommentInfo memory)
    {
        return productComments[_productId][_commentId];
    }

    function getCommentsCount(
        uint256 _productId
    ) public view productExists(_productId) returns (uint256) {
        return productComments[_productId].length;
    }

    function getCommenter(
        uint256 _productId,
        uint256 _commentId
    )
        public
        view
        productExists(_productId)
        commentExists(_productId, _commentId)
        returns (address)
    {
        return productComments[_productId][_commentId].commenter;
    }
}
