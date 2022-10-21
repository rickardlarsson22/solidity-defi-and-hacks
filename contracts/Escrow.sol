// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IERC721 {
	function transferFrom(address _from, address _to, uint256 _id) external;
}

contract Escrow {

	address public nftAddress;
	uint256 public nftId;
	uint256 public purchasePrice;
	uint256 public escrowAmount;
	address payable public seller;
	address payable public buyer;
	address public inspector;
	address public lender;

	modifier onlyBuyer() {
		require(msg.sender == buyer, "Only buyer can call");
		_;
	}


	modifier onlySeller() {
		require(msg.sender == seller, "Only seller can call");
		_;
	}

	modifier onlyInspector() {
		require(msg.sender == inspector, "Only inspector can call");
		_;
	}

	bool public inspectionPassed = false;
	mapping(address => bool) public approval;

	constructor(address _nftAddress, uint256 _nftId, uint256 _purchasePrice, uint256 _escrowAmount, address payable _seller, address payable _buyer, address _inspector, address _lender) {
		nftAddress = _nftAddress;
		nftId = _nftId;
		purchasePrice = _purchasePrice;
		escrowAmount = _escrowAmount;
		seller = _seller;
		buyer = _buyer;
		inspector = _inspector;
		lender = _lender;
	}

	function depositEarnest() public payable onlyBuyer {
		require(msg.value >= escrowAmount);
	}

	function updateInspectionStatus(bool _passed) public onlyInspector {
		inspectionPassed = _passed;
	}

	function approveSale() public {
		approval[msg.sender] = true;
	}

	function finalizeSale() public {
		require(inspectionPassed);
		require(approval[buyer]);
		require(approval[seller]);
		require(approval[lender]);
		require(address(this).balance >= purchasePrice);

		(bool success, ) = payable(seller).call{value: address(this).balance}("");
		require(success);

		IERC721(nftAddress).transferFrom(seller, buyer, nftId);
	}

	function cancelSale() public {
		if(inspectionPassed == false) {
			payable(buyer).transfer(address(this).balance);
		} else {
			payable(seller).transfer(address(this).balance);
		}
	}

	receive() external payable {}

	function getBalance() public view returns (uint) {
		return address(this).balance;
	}

}