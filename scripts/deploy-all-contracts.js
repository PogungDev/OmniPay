const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 OMNIPAY FULL STACK DEPLOYMENT STARTING...");
  console.log("=".repeat(50));
  
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;
  const chainId = hre.network.config.chainId;
  
  console.log(`📍 Network: ${network} (Chain ID: ${chainId})`);
  console.log(`👤 Deployer: ${deployer.address}`);
  console.log(`💰 Balance: ${hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH`);
  console.log("=".repeat(50));

  const deployedContracts = {};
  const deploymentInfo = {
    network,
    chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await deployer.provider.getBlockNumber(),
    contracts: {}
  };

  try {
    // 1. Deploy OmniPayCore (Base contract)
    console.log("📝 Deploying OmniPayCore...");
    const OmniPayCore = await hre.ethers.getContractFactory("OmniPayCore");
    const omniPayCore = await OmniPayCore.deploy();
    await omniPayCore.waitForDeployment();
    const coreAddress = await omniPayCore.getAddress();
    
    deployedContracts.omniPayCore = coreAddress;
    deploymentInfo.contracts.OmniPayCore = {
      address: coreAddress,
      txHash: omniPayCore.deploymentTransaction().hash
    };
    console.log(`✅ OmniPayCore deployed to: ${coreAddress}`);

    // 2. Deploy OmniPayCCTP (Cross-chain transfers)
    console.log("📝 Deploying OmniPayCCTP...");
    const OmniPayCCTP = await hre.ethers.getContractFactory("OmniPayCCTP");
    const omniPayCCTP = await OmniPayCCTP.deploy();
    await omniPayCCTP.waitForDeployment();
    const cctpAddress = await omniPayCCTP.getAddress();
    
    deployedContracts.omniPayCCTP = cctpAddress;
    deploymentInfo.contracts.OmniPayCCTP = {
      address: cctpAddress,
      txHash: omniPayCCTP.deploymentTransaction().hash
    };
    console.log(`✅ OmniPayCCTP deployed to: ${cctpAddress}`);

    // 3. Deploy OmniPayCard (MetaMask Card integration)
    console.log("📝 Deploying OmniPayCard...");
    const OmniPayCard = await hre.ethers.getContractFactory("OmniPayCard");
    const omniPayCard = await OmniPayCard.deploy();
    await omniPayCard.waitForDeployment();
    const cardAddress = await omniPayCard.getAddress();
    
    deployedContracts.omniPayCard = cardAddress;
    deploymentInfo.contracts.OmniPayCard = {
      address: cardAddress,
      txHash: omniPayCard.deploymentTransaction().hash
    };
    console.log(`✅ OmniPayCard deployed to: ${cardAddress}`);

    // 4. Deploy OmniPayHistory (Transaction tracking)
    console.log("📝 Deploying OmniPayHistory...");
    const OmniPayHistory = await hre.ethers.getContractFactory("OmniPayHistory");
    const omniPayHistory = await OmniPayHistory.deploy();
    await omniPayHistory.waitForDeployment();
    const historyAddress = await omniPayHistory.getAddress();
    
    deployedContracts.omniPayHistory = historyAddress;
    deploymentInfo.contracts.OmniPayHistory = {
      address: historyAddress,
      txHash: omniPayHistory.deploymentTransaction().hash
    };
    console.log(`✅ OmniPayHistory deployed to: ${historyAddress}`);

    // 5. Deploy OmniPayTreasury (Treasury management)
    console.log("📝 Deploying OmniPayTreasury...");
    const OmniPayTreasury = await hre.ethers.getContractFactory("OmniPayTreasury");
    const omniPayTreasury = await OmniPayTreasury.deploy();
    await omniPayTreasury.waitForDeployment();
    const treasuryAddress = await omniPayTreasury.getAddress();
    
    deployedContracts.omniPayTreasury = treasuryAddress;
    deploymentInfo.contracts.OmniPayTreasury = {
      address: treasuryAddress,
      txHash: omniPayTreasury.deploymentTransaction().hash
    };
    console.log(`✅ OmniPayTreasury deployed to: ${treasuryAddress}`);

    // 6. Deploy OmniPayRemittance (Remittance features)
    console.log("📝 Deploying OmniPayRemittance...");
    const OmniPayRemittance = await hre.ethers.getContractFactory("OmniPayRemittance");
    const omniPayRemittance = await OmniPayRemittance.deploy();
    await omniPayRemittance.waitForDeployment();
    const remittanceAddress = await omniPayRemittance.getAddress();
    
    deployedContracts.omniPayRemittance = remittanceAddress;
    deploymentInfo.contracts.OmniPayRemittance = {
      address: remittanceAddress,
      txHash: omniPayRemittance.deploymentTransaction().hash
    };
    console.log(`✅ OmniPayRemittance deployed to: ${remittanceAddress}`);

    // 7. Deploy OmniPayPayout (Payout management)
    console.log("📝 Deploying OmniPayPayout...");
    const OmniPayPayout = await hre.ethers.getContractFactory("OmniPayPayout");
    const omniPayPayout = await OmniPayPayout.deploy();
    await omniPayPayout.waitForDeployment();
    const payoutAddress = await omniPayPayout.getAddress();
    
    deployedContracts.omniPayPayout = payoutAddress;
    deploymentInfo.contracts.OmniPayPayout = {
      address: payoutAddress,
      txHash: omniPayPayout.deploymentTransaction().hash
    };
    console.log(`✅ OmniPayPayout deployed to: ${payoutAddress}`);

    // 8. Deploy OmniPayTracker (Transaction tracking)
    console.log("📝 Deploying OmniPayTracker...");
    const OmniPayTracker = await hre.ethers.getContractFactory("OmniPayTracker");
    const omniPayTracker = await OmniPayTracker.deploy();
    await omniPayTracker.waitForDeployment();
    const trackerAddress = await omniPayTracker.getAddress();
    
    deployedContracts.omniPayTracker = trackerAddress;
    deploymentInfo.contracts.OmniPayTracker = {
      address: trackerAddress,
      txHash: omniPayTracker.deploymentTransaction().hash
    };
    console.log(`✅ OmniPayTracker deployed to: ${trackerAddress}`);

    // Save deployment info
    const timestamp = Date.now();
    const filename = `deployments/${network}-${timestamp}.json`;
    fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
    
    console.log("=".repeat(50));
    console.log("🎉 ALL CONTRACTS DEPLOYED SUCCESSFULLY!");
    console.log("=".repeat(50));
    console.log("📍 Contract Addresses:");
    Object.entries(deployedContracts).forEach(([name, address]) => {
      console.log(`   ${name}: ${address}`);
    });
    console.log(`📄 Deployment info saved to: ${filename}`);
    
    // Generate environment file
    const envContent = `
# OmniPay Contract Addresses - ${network}
NEXT_PUBLIC_OMNIPAY_CORE=${deployedContracts.omniPayCore}
NEXT_PUBLIC_OMNIPAY_CCTP=${deployedContracts.omniPayCCTP}
NEXT_PUBLIC_OMNIPAY_CARD=${deployedContracts.omniPayCard}
NEXT_PUBLIC_OMNIPAY_HISTORY=${deployedContracts.omniPayHistory}
NEXT_PUBLIC_OMNIPAY_TREASURY=${deployedContracts.omniPayTreasury}
NEXT_PUBLIC_OMNIPAY_REMITTANCE=${deployedContracts.omniPayRemittance}
NEXT_PUBLIC_OMNIPAY_PAYOUT=${deployedContracts.omniPayPayout}
NEXT_PUBLIC_OMNIPAY_TRACKER=${deployedContracts.omniPayTracker}
NEXT_PUBLIC_NETWORK_NAME=${network}
NEXT_PUBLIC_CHAIN_ID=${chainId}
`;
    
    fs.writeFileSync(`.env.${network}`, envContent);
    console.log(`📄 Environment variables saved to: .env.${network}`);
    
    // Generate browser verification script
    const browserScript = `
// OmniPay Contract Verification - ${network}
window.OMNIPAY_CONTRACTS = ${JSON.stringify(deployedContracts, null, 2)};
window.OMNIPAY_DEPLOYMENT = ${JSON.stringify(deploymentInfo, null, 2)};
console.log('🎯 OmniPay Contracts Loaded:', window.OMNIPAY_CONTRACTS);
`;
    
    fs.writeFileSync(`public/contracts-${network}.js`, browserScript);
    console.log(`📄 Browser script saved to: public/contracts-${network}.js`);

    console.log("=".repeat(50));
    console.log("🔥 READY FOR PRODUCTION!");
    console.log(`🌐 Verify contracts at: https://${network === 'sepolia' ? 'sepolia.' : ''}etherscan.io`);
    console.log("=".repeat(50));

    return deployedContracts;

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main; 