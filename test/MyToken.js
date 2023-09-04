const { expect } = require('chai');
const hre = require('hardhat');

describe('MyToken Contract', function () {
  let Token;
  let myToken;
  let owner;
  let address1;
  let address2;
  let tokenCap = 10000000;
  let tokenBlockReward = 50;

  beforeEach(async function () {
    Token = await hre.ethers.getContractFactory('MyToken');
    [owner, address1, address2] = await hre.ethers.getSigners();

    myToken = await Token.deploy(tokenCap, tokenBlockReward);
  });

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      expect(await myToken.owner()).to.equal(owner.address);
    });

    it('Should assign the total supply of tokens to the owner', async function () {
      const ownerBalance = await myToken.balanceOf(owner.address);
      expect(await myToken.totalSupply()).to.equal(ownerBalance);
    });

    it('Should set the max capped supply to the argument provided during deployment', async function () {
      const cap = await myToken.cap();
      expect(Number(hre.ethers.formatEther(cap))).to.equal(tokenCap);
    });

    it('Should set the blockReward to the argument provided during deployment', async function () {
      const blockReward = await myToken.blockReward();
      expect(Number(hre.ethers.formatEther(blockReward))).to.equal(tokenBlockReward);
    });
  });

  describe('Transactions', function () {
    it('Should transfer tokens between accounts', async function () {
      await myToken.transfer(address1.address, 50);
      const address1Balance = await myToken.balanceOf(address1.address);
      expect(address1Balance).to.equal(50);

      await myToken.connect(address1).transfer(address2.address, 50);
      const address2Balance = await myToken.balanceOf(address2.address);
      expect(address2Balance).to.equal(50);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await myToken.balanceOf(owner.address);
      await expect(myToken.connect(address1).transfer(owner.address, 1)).to.be.revertedWith('ERC20: transfer amount exceeds balance');
      expect(await myToken.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });

    it('Should update balances after transfers', async function () {
      const initialOwnerBalance = await myToken.balanceOf(owner.address);
      await myToken.transfer(address1.address, 100);
      await myToken.transfer(address2.address, 50);

      const finalOwnerBalance = await myToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance - BigInt(150));

      const address1Balance = await myToken.balanceOf(address1.address);
      expect(address1Balance).to.equal(100);

      const address2Balance = await myToken.balanceOf(address2.address);
      expect(address2Balance).to.equal(50);
    });
  });
});
