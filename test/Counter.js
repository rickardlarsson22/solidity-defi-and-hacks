const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Counter', () => {
	let counter

	beforeEach(async () => {
		// Load contract
		const Counter = await ethers.getContractFactory('Counter')

		// Deploy contract
		counter = await Counter.deploy('My counter', 1)
	})

	describe('Deployment', () => {

		it('sets the name', async () => {
			expect(await counter.name()).to.equal('My counter')
		})

		it('sets the initial count', async () => {
			expect(await counter.count()).to.equal(1)
		})
	})

	describe('Counting', () => {
		let transaction, result

		it('reads the count from the "count" public variable', async () => {
			expect(await counter.count()).to.equal(1)
		})

		it('reads the count from the "getCount()" function', async () => {
			expect(await counter.getCount()).to.equal(1)
		})

		it('increments the count', async () => {
			transaction = await counter.increment()
			await transaction.wait()

			let count = await counter.count()
			expect(count).to.equal(2)

			transaction = await counter.increment()
			await transaction.wait()
			count = await counter.count()

			count = await counter.count()
			expect(count).to.equal(3)
		})

		it('decrements the count', async () => {

			let count = await counter.count()

			transaction = await counter.decrement()
			await transaction.wait()

			count = await counter.count()

			// Cannot decrement account below 0
			await expect(counter.decrement()).to.be.reverted
		})

		it('reads the name from the "name" public variable', async () => {
			expect(await counter.name()).to.equal('My counter')
		})

		it('reads the name from the "#getName()" function', async () => {
			expect(await counter.getName()).to.equal('My counter')
		})

		it('updates the name', async () => {
			transaction = await counter.setName('New name')
			await transaction.wait()
			expect(await counter.name()).to.equal('New name')
		})
	})
})