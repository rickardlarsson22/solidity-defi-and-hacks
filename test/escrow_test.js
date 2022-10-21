const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
	return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('escrow_test', () => {
	let realEstate, escrow
	let deployer, seller, buyer, inspector, lender
	let nftId = 1
	let purchasePrice = ether(100)
	let escrowAmount = ether(20)

	beforeEach(async () => {
		accounts = await ethers.getSigners()
		deployer = accounts[0]
		seller = deployer
		buyer = accounts[1]
		inspector = accounts[2]
		lender = accounts[3]

		const RealEstate = await ethers.getContractFactory('RealEstate')
		const Escrow = await ethers.getContractFactory('Escrow')


		realEstate = await RealEstate.deploy()

		escrow = await Escrow.deploy(
			realEstate.address,
			nftId,
			purchasePrice,
			escrowAmount,
			seller.address,
			buyer.address,
			inspector.address,
			lender.address
		)

		transaction = await realEstate.connect(seller).approve(escrow.address, nftId)
		await transaction.wait()
	})

	describe('Deployment', () => {

		it('deployer/seller has an NFT', async () => {
			expect(await realEstate.ownerOf(nftId)).to.equal(seller.address)
		})
	})

	describe('Selling real estate', () => {
		let balance, transaction

		it('executes a successful transaction', async () => {
			expect(await realEstate.ownerOf(nftId)).to.equal(seller.address)

			balance = await escrow.getBalance()
			console.log("escrow balance:", ethers.utils.formatEther(balance))

			console.log("Buyer deposits earnest money")
			transaction = await escrow.connect(buyer).depositEarnest({ value : escrowAmount })
			await transaction.wait()

			balance = await escrow.getBalance()
			console.log("escrow balance:", ethers.utils.formatEther(balance))

			transaction = await escrow.connect(inspector).updateInspectionStatus(true)
			await transaction.wait()
			console.log("Inspector updates status")

			transaction = await escrow.connect(buyer).approveSale()
			await transaction.wait()
			console.log("Seller approves sale")


			transaction = await escrow.connect(seller).approveSale()
			await transaction.wait()
			console.log("Buyer approves sale")

			transaction = await lender.sendTransaction({ to: escrow.address, value: ether(80) })
			console.log("Lender funds sale")


			transaction = await escrow.connect(lender).approveSale()
			await transaction.wait()
			console.log("Lender approves sale")

			transaction = await escrow.connect(buyer).finalizeSale()
			await transaction.wait()
			console.log("Buyer finalizes sale")

			expect(await realEstate.ownerOf(nftId)).to.equal(buyer.address)
			console.log("Expecting buyer to be the owner")

			balance = await ethers.provider.getBalance(seller.address)
			console.log("Seller balance:", ethers.utils.formatEther(balance))
			expect(balance).to.be.above(10099)
		})
	})
})