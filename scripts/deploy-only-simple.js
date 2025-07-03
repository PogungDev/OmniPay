const hre = require("hardhat");

async function main() {
  console.log("Deploying SimplePay contract...");
  
  const SimplePay = await hre.ethers.getContractFactory("SimplePay");
  const simplePay = await SimplePay.deploy();
  await simplePay.waitForDeployment();
  const address = await simplePay.getAddress();
  
  console.log("SimplePay deployed to:", address);
  
  // Save address for manual env update
  require('fs').writeFileSync('deployed-address.txt', address);
}

main().catch(console.error); 