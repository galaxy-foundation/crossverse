// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Sig {
    address singerAddress = 0xCcC2fcaeeA78A87e002ab8fEFfd23eedc19CDE07;
    
    function getMessageHash( address _token, uint _tokenid, uint _price, uint _quantity, uint _amount,bytes memory _data, uint _timestamp) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_token, _tokenid, _price, _quantity, _amount, _data, _timestamp));
    }
    
    function verify(address _token, uint _tokenid, uint _price, uint _quantity, uint _amount,bytes memory _data, uint _timestamp, bytes memory _signature) internal view returns (bool) {
        bytes32 messageHash = getMessageHash(_token, _tokenid, _price, _quantity, _amount, _data, _timestamp);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
        return recoverSigner(ethSignedMessageHash, _signature) == singerAddress;
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
}