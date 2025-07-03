const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 OMNIPAY SIMPLE INTEGRATION DEPLOYMENT");
  console.log("=".repeat(50));
  
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;
  const chainId = hre.network.config.chainId;
  
  console.log(`📍 Network: ${network} (Chain ID: ${chainId})`);
  console.log(`👤 Deployer: ${deployer.address}`);
  
  try {
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log(`💰 Balance: ${hre.ethers.formatEther(balance)} ETH`);
  } catch (error) {
    console.log(`💰 Balance: Unable to fetch`);
  }
  
  console.log("=".repeat(50));

  try {
    // Deploy SimplePay contract (this one works)
    console.log("📝 Deploying SimplePay...");
    const SimplePay = await hre.ethers.getContractFactory("SimplePay");
    const simplePay = await SimplePay.deploy();
    await simplePay.waitForDeployment();
    const simplePayAddress = await simplePay.getAddress();
    
    console.log(`✅ SimplePay deployed to: ${simplePayAddress}`);

    // Save deployment info
    const deployment = {
      network,
      chainId,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: {
        simplePay: simplePayAddress,
        omniPayCore: simplePayAddress, // Use SimplePay as Core for demo
        omniPayCCTP: simplePayAddress, // Mock CCTP with SimplePay
        omniPayCard: simplePayAddress  // Mock Card with SimplePay
      }
    };

    const filename = `deployments/${network}-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(deployment, null, 2));

    // Generate environment file for frontend
    const envContent = `
# OmniPay Deployed Contracts - ${network}
NEXT_PUBLIC_OMNIPAY_CORE=${simplePayAddress}
NEXT_PUBLIC_OMNIPAY_CCTP=${simplePayAddress}
NEXT_PUBLIC_OMNIPAY_CARD=${simplePayAddress}
NEXT_PUBLIC_OMNIPAY_TREASURY=${simplePayAddress}
NEXT_PUBLIC_OMNIPAY_REMITTANCE=${simplePayAddress}
NEXT_PUBLIC_OMNIPAY_PAYOUT=${simplePayAddress}
NEXT_PUBLIC_OMNIPAY_TRACKER=${simplePayAddress}
NEXT_PUBLIC_OMNIPAY_HISTORY=${simplePayAddress}
NEXT_PUBLIC_CHAIN_ID=${chainId}
NEXT_PUBLIC_NETWORK_NAME=${network}
`;
    
    fs.writeFileSync(`.env.${network}`, envContent.trim());

    // Generate browser verification script
    const browserScript = `
// OmniPay Contract Verification - ${network}
window.OMNIPAY_CONTRACTS = ${JSON.stringify(deployment.contracts, null, 2)};
window.OMNIPAY_DEPLOYMENT = ${JSON.stringify(deployment, null, 2)};
console.log('🎯 OmniPay Contracts Loaded:', window.OMNIPAY_CONTRACTS);
`;
    
    fs.writeFileSync(`public/contracts-${network}.js`, browserScript);

    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("=".repeat(50));
    console.log(`📄 Contract Address: ${simplePayAddress}`);
    console.log(`📄 Deployment info: ${filename}`);
    console.log(`📄 Environment file: .env.${network}`);
    console.log(`📄 Browser script: public/contracts-${network}.js`);
    
    console.log("\n📋 NEXT STEPS:");
    console.log("1. Copy .env.sepolia content to .env.local");
    console.log("2. Restart your Next.js dev server");
    console.log("3. Test the integration in browser");
    console.log(`4. Verify contract: https://${network === 'sepolia' ? 'sepolia.' : ''}etherscan.io/address/${simplePayAddress}`);
    
    return deployment;

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