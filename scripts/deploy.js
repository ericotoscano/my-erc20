const hre = require("hardhat");

async function main() {

  const myToken = await hre.ethers.deployContract("MyToken", [10000000, 50]);

  await myToken.waitForDeployment();

  console.log("My Token deployed: ", await myToken.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
