const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 OMNIPAY FULL STACK DEPLOYMENT");
  console.log("=".repeat(40));
  
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;
  const chainId = hre.network.config.chainId;
  
  console.log(`Network: ${network} (${chainId})`);
  console.log(`Deployer: ${deployer.address}`);
  
  const contracts = {};

  // Deploy Core Contract
  console.log("\n📝 Deploying OmniPayCore...");
  const Core = await hre.ethers.getContractFactory("OmniPayCore");
  const core = await Core.deploy();
  await core.waitForDeployment();
  contracts.core = await core.getAddress();
  console.log(`✅ Core: ${contracts.core}`);

  // Deploy CCTP Contract
  console.log("\n📝 Deploying OmniPayCCTP...");
  const CCTP = await hre.ethers.getContractFactory("OmniPayCCTP");
  const cctp = await CCTP.deploy();
  await cctp.waitForDeployment();
  contracts.cctp = await cctp.getAddress();
  console.log(`✅ CCTP: ${contracts.cctp}`);

  // Deploy Card Contract
  console.log("\n📝 Deploying OmniPayCard...");
  const Card = await hre.ethers.getContractFactory("OmniPayCard");
  const card = await Card.deploy();
  await card.waitForDeployment();
  contracts.card = await card.getAddress();
  console.log(`✅ Card: ${contracts.card}`);

  // Save deployment info
  const deployment = {
    network,
    chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts
  };

  const filename = `deployments/${network}-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(deployment, null, 2));

  // Generate env file
  const envContent = `
# OmniPay Deployed Contracts - ${network}
NEXT_PUBLIC_OMNIPAY_CORE=${contracts.core}
NEXT_PUBLIC_OMNIPAY_CCTP=${contracts.cctp}
NEXT_PUBLIC_OMNIPAY_CARD=${contracts.card}
NEXT_PUBLIC_CHAIN_ID=${chainId}
`;
  
  fs.writeFileSync(`.env.${network}`, envContent.trim());

  console.log("\n🎉 DEPLOYMENT COMPLETE!");
  console.log(`📄 Info saved: ${filename}`);
  console.log(`📄 Env saved: .env.${network}`);
  
  return contracts;
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = main; 