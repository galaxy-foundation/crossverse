// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./lib/Ownable.sol";
import "./lib/Ownable.sol";
import "./lib/Pausable.sol";
import "./lib/ERC1155.sol";
import "./lib/IWETH.sol";
import "./lib/Strings.sol";
import "./lib/SafeMath.sol";

contract StoreFront is ERC1155, Ownable {
    using SafeMath for uint256;
    using Strings for uint256;
    
    event Buy (uint gold, uint price, address buyer, address seller, uint pid);
    event Sell(uint gold, uint price, address seller, address buyer, bytes32 pid);
    
    mapping (address => uint[]) ownedNfts;
    mapping (address => mapping(uint=>uint)) ownedNftCount;
    mapping (uint => uint) tokenVolumn;

    address public weth;
    uint wethPrecision = 18;
    address public admin;
    address public storeAddress;
    address public feeAddress;

    address public signerAddress; // get from backend private key

    string public baseURI;

    uint public feerate; // 5%
    
    constructor(address _weth, uint _wethPrecision, address _admin, address _storeAddress, address _feeAddress, address _signerAddress, string memory _baseURI, uint _feerate) ERC1155(_baseURI) {
        weth = _weth;
        wethPrecision = _wethPrecision;
        admin = _admin;
        storeAddress = _storeAddress;
        feeAddress = _feeAddress;
        signerAddress = _signerAddress;
        baseURI = _baseURI;
        feerate = _feerate;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }

    modifier onlySigner() {
        require(msg.sender == signerAddress);
        _;
    }

    function setAdmin(address _address) public onlyOwner {
        admin = _address;
    }

    function setStoreAddress(address _address) public onlyAdmin {
        storeAddress = _address;
    }

    function setFeeAddress(address _address) public onlyAdmin {
        feeAddress = _address;
    }
    
    function setSignerAddress(address _address) public onlyAdmin {
        signerAddress = _address;
    }

    function setBaseURI(string memory newBaseURI) external onlyAdmin {
        baseURI = newBaseURI;
    }
    
    function volumeByToken(uint _token) public view returns(uint) {
        return tokenVolumn[_token];
    }
    
    function validTokenId(uint256 tokenId) internal pure returns (bool) {
        return tokenId>1e8 && tokenId<1e9;
    }
    
    function getMessageHash(address _buyer, address _seller, uint _tokenid, uint _price, uint _quantity, uint _amount, uint _timestamp) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_buyer, _seller, _tokenid, _price, _quantity, _amount, _timestamp));
    }
    
    function verify(address _buyer, address _seller, uint _tokenid, uint _price, uint _quantity, uint _amount, uint _timestamp, bytes memory _signature) internal view returns (bool) {
        bytes32 messageHash = getMessageHash(_buyer, _seller, _tokenid, _price, _quantity, _amount, _timestamp);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
        return recoverSigner(ethSignedMessageHash, _signature) == signerAddress;
    }
    
    function getEthSignedMessageHash(bytes32 _messageHash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash));
    }
    
    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature) internal pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig) internal pure returns (bytes32 r,bytes32 s,uint8 v) {
        require(sig.length == 65, "invalid signature length");
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
    
    function buy(uint _pid, uint _tokenid, uint _price, uint _quantity, uint _amount, uint _timestamp, address _seller, bytes memory _signature) public payable {
        address _buyer = msg.sender;
        uint _value = msg.value;
        require(_buyer != address(0), "CV: buyer to the zero address");
        require(validTokenId(_tokenid), "CV: nonexistent token");
        require(verify(_buyer, _seller, _tokenid, _price, _quantity, _amount, _timestamp, _signature), "CV: invalid _signature");
        require(_price * _quantity == _amount, "CV: invalid amount");
        if (_value==0) {
            IWETH(weth).transferFrom(_buyer, address(this), _amount);
        } else {
            require(_amount == _value, "CV: invalid amount");    
        }
        if (_seller==address(0)) {
            if (_value==0) {
                IWETH(weth).transfer(storeAddress, _amount);
            } else {
                payable(storeAddress).transfer(_amount);
            }
        } else {
            uint _fee = _amount * feerate / 1e4;
            if (_value==0) {
                if (_fee>0) IWETH(weth).transfer(feeAddress, _fee);
                IWETH(weth).transfer(_seller, _amount - _fee);
            } else {
                if (_fee>0) payable(feeAddress).transfer(_fee);
                payable(_seller).transfer(_amount - _fee);
            }
        }
        bytes memory _data;
        if (_seller==address(0)) {
            _mint(_buyer, _tokenid, _quantity, _data);
        } else {
            require(isApprovedForAll(_seller, address(this)), "CV: seller is not approved");
            _transfer(_buyer, _seller, _buyer, _tokenid, _quantity, _data);
        }
        tokenVolumn[_tokenid] += _amount;
        emit Buy(_tokenid * 1e8 + _quantity, _price, _buyer, _seller, _pid);
    }
    
    function sell(bytes32 _pid, uint _tokenid, uint _price, uint _quantity, uint _amount, uint _timestamp, address _buyer, bytes memory _signature) public {
        address _seller = msg.sender;
        require(_buyer != address(0), "CV: buyer to the zero address");
        require(validTokenId(_tokenid), "CV: nonexistent token");
        require(verify(_buyer, _seller, _tokenid, _price, _quantity, _amount, _timestamp, _signature), "CV: invalid _signature");
        require(_price * _quantity == _amount, "CV: invalid amount");
        uint _fee = _amount * feerate / 1e4;
        IWETH(weth).transferFrom(_buyer, address(this), _amount);
        if (_fee>0) IWETH(weth).transfer(feeAddress, _fee);
        IWETH(weth).transfer(_seller, _amount - _fee);
        bytes memory _data;
        _transfer(_seller, _seller, _buyer, _tokenid, _quantity, _data);
        tokenVolumn[_tokenid] += _amount;
        emit Sell(_tokenid * 1e8 + _quantity, _price, _seller, _buyer, _pid);
    }
      
    function setAuctionWinner(uint _tokenid, uint _price, uint _quantity, uint _amount, address _buyer) public onlySigner {
        require(_buyer != address(0), "CV: buyer to the zero address");
        require(validTokenId(_tokenid), "CV: nonexistent token");
        require(_price * _quantity == _amount, "CV: invalid amount");
        uint _fee = _amount * feerate / 1e4;
        IWETH(weth).transferFrom(_buyer, address(this), _amount);
        if (_fee>0) IWETH(weth).transfer(feeAddress, _fee);
        IWETH(weth).transfer(storeAddress, _amount - _fee);
        bytes memory _data;
        _mint(_buyer, _tokenid, _quantity, _data);
        tokenVolumn[_tokenid] += _amount;
        emit Buy(_tokenid * 1e8 + _quantity, _price, _buyer, address(0), 0);
    }
    
    function _changedOwns(address _from, address _to, uint _tokenid, uint _quantity) internal {
        if (_from!=address(0)) ownedNftCount[_from][_tokenid] = ownedNftCount[_from][_tokenid].sub(_quantity, "CV: insufficient balance for transfer");
        if (ownedNftCount[_to][_tokenid]==0) ownedNfts[_to].push(_tokenid);
        ownedNftCount[_to][_tokenid] += _quantity;
    }
    
    function _mint(address _account, uint256 _tokenid, uint256 _quantity, bytes memory _data) internal override {
        require(_account != address(0), "ERC1155: mint to the zero address");
        address _operator = _msgSender();
        _beforeTokenTransfer(_operator, address(0), _account, _asSingletonArray(_tokenid), _asSingletonArray(_quantity), _data);
        _balances[_tokenid][_account] = _balances[_tokenid][_account].add(_quantity);
        _doSafeTransferAcceptanceCheck(_operator, address(0), _account, _tokenid, _quantity, _data);
        _changedOwns(address(0), _account, _tokenid, _quantity);
    }
    function _transfer(address _operator, address _from, address _to, uint256 _tokenid, uint256 _quantity, bytes memory _data) internal {
        require(_operator != address(0) && _from != address(0) && _to != address(0), "ERC1155: transfer to the zero address");
        _beforeTokenTransfer(_operator, _from, _to, _asSingletonArray(_tokenid), _asSingletonArray(_quantity), _data);
        _balances[_tokenid][_from] = _balances[_tokenid][_from].sub(_quantity, "ERC1155: insufficient balance for transfer");
        _balances[_tokenid][_to] = _balances[_tokenid][_to].add(_quantity);
        _doSafeTransferAcceptanceCheck(_operator, _from, _to, _tokenid, _quantity, _data);
        _changedOwns(_from, _to, _tokenid, _quantity);
    }
    function transfer(address _to,uint256 _tokenid,uint256 _quantity,bytes memory _data) public {
        address _operator = msg.sender;
        _transfer(_operator, _operator, _to, _tokenid, _quantity, _data);
        emit TransferSingle(_operator, _operator, _to, _tokenid, _quantity);
    }
    
    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes memory data) public override {
        require(to != address(0), "ERC1155: transfer to the zero address");
        require(from == _msgSender() || isApprovedForAll(from, _msgSender()), "ERC1155: caller is not owner nor approved");
        transfer(to, id, amount, data);
    }

    function safeBatchTransferFrom(address from,address to,uint256[] memory ids,uint256[] memory amounts,bytes memory data) public override {
        require(ids.length == amounts.length, "ERC1155: ids and amounts length mismatch");
        require(to != address(0), "ERC1155: transfer to the zero address");
        require(from == _msgSender() || isApprovedForAll(from, _msgSender()), "ERC1155: transfer caller is not owner nor approved");
        address operator = _msgSender();
        _beforeTokenTransfer(operator, from, to, ids, amounts, data);
        for (uint256 i = 0; i < ids.length; ++i) {
            uint256 id = ids[i];
            uint256 amount = amounts[i];
            _balances[id][from] = _balances[id][from].sub(amount,"ERC1155: insufficient balance for transfer");
            _balances[id][to] = _balances[id][to].add(amount);
            _changedOwns(from, to, id, amount);
        }
        emit TransferBatch(operator, from, to, ids, amounts);
        _doSafeBatchTransferAcceptanceCheck(operator, from, to, ids, amounts, data);
    }
    
    function assetsByAccount(address _account) public view returns(uint result) {
        result = ownedNfts[_account].length;
    }
    function assetsByAccount(address _account, uint _start, uint _end) public view returns(uint[2][] memory result) {
        result = new uint[2][](_end - _start + 1);
        if (_end>ownedNfts[_account].length) _end = ownedNfts[_account].length;
        for (uint i = _start; i <= _end; i++) {
            uint _tokenid = ownedNfts[_account][i];
            result[i][0] = _tokenid;
            result[i][1] = ownedNftCount[_account][_tokenid];
        }
    }
    
}