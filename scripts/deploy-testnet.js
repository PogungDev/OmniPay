const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 OMNIPAY TESTNET DEPLOYMENT STARTING...");
  console.log("=".repeat(50));
  
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;
  const chainId = hre.network.config.chainId;
  
  console.log(`📍 Network: ${network} (Chain ID: ${chainId})`);
  console.log(`👤 Deployer: ${deployer.address}`);
  
  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${hre.ethers.formatEther(balance)} ETH`);
  
  if (balance < hre.ethers.parseEther("0.01")) {
    console.log("⚠️  WARNING: Low balance! You may need more testnet ETH");
    console.log("Get testnet ETH from:");
    console.log("- https://faucet.quicknode.com/ethereum/sepolia");
    console.log("- https://sepoliafaucet.com/");
    console.log("- https://www.alchemy.com/faucets/ethereum-sepolia");
  }
  
  console.log("=".repeat(50));

  try {
    // Deploy SimplePay contract
    console.log("📝 Deploying SimplePay...");
    const SimplePay = await hre.ethers.getContractFactory("SimplePay");
    const simplePay = await SimplePay.deploy();
    await simplePay.waitForDeployment();
    
    const contractAddress = await simplePay.getAddress();
    const deploymentTx = simplePay.deploymentTransaction();
    
    console.log(`✅ SimplePay deployed to: ${contractAddress}`);
    console.log(`📄 Transaction hash: ${deploymentTx.hash}`);
    
    // Save deployment info
    const deploymentInfo = {
      network,
      chainId,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      blockNumber: await deployer.provider.getBlockNumber(),
      contract: {
        name: "SimplePay",
        address: contractAddress,
        txHash: deploymentTx.hash,
        gasUsed: deploymentTx.gasLimit.toString()
      }
    };
    
    // Save to file
    const filename = `deployments/testnet-${network}-${Date.now()}.json`;
    if (!fs.existsSync('deployments')) {
      fs.mkdirSync('deployments');
    }
    fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
    
    // Update environment file for testnet
    const envContent = `# 🔥 OMNIPAY TESTNET DEPLOYMENT - ${new Date().toISOString()}

# === CONTRACT ADDRESSES ===
NEXT_PUBLIC_SIMPLEPAY_CONTRACT=${contractAddress}
NEXT_PUBLIC_CONTRACT_OWNER=${deployer.address}

# === NETWORK INFO ===
NEXT_PUBLIC_CHAIN_ID=${chainId}
NEXT_PUBLIC_NETWORK_NAME=${network}

# === EXPLORER LINKS ===
NEXT_PUBLIC_EXPLORER_URL=https://${network === 'sepolia' ? 'sepolia.' : ''}etherscan.io
NEXT_PUBLIC_CONTRACT_EXPLORER=https://${network === 'sepolia' ? 'sepolia.' : ''}etherscan.io/address/${contractAddress}

# === SDK CONFIGURATIONS ===
NEXT_PUBLIC_LIFI_INTEGRATOR=omnipay-${network}-${Date.now()}
NEXT_PUBLIC_METAMASK_DAPP_ID=omnipay-${network}

# === PROOF MODE ===
NEXT_PUBLIC_DEBUG_MODE=true

# Deployment private key (keep this secure!)
PRIVATE_KEY=your_private_key_here
`;
    
    fs.writeFileSync('.env.testnet', envContent);
    
    console.log("=".repeat(50));
    console.log("🎉 TESTNET DEPLOYMENT SUCCESSFUL!");
    console.log("=".repeat(50));
    console.log(`📍 Contract Address: ${contractAddress}`);
    console.log(`🌐 Explorer: https://${network === 'sepolia' ? 'sepolia.' : ''}etherscan.io/address/${contractAddress}`);
    console.log(`📄 Deployment saved to: ${filename}`);
    console.log(`⚙️  Environment saved to: .env.testnet`);
    console.log("=".repeat(50));
    
    // Verify contract (optional)
    if (network !== 'localhost' && network !== 'hardhat') {
      console.log("⏳ Waiting 30 seconds before verification...");
      await new Promise(resolve => setTimeout(resolve, 30000));
      
      try {
        console.log("🔍 Verifying contract...");
        await hre.run("verify:verify", {
          address: contractAddress,
          constructorArguments: [],
        });
        console.log("✅ Contract verified!");
      } catch (error) {
        console.log("⚠️  Verification failed (this is normal for new deployments):");
        console.log(error.message);
      }
    }
    
    console.log("🔥 DEPLOYMENT COMPLETE! Your contract is live on testnet!");
    
    return {
      contractAddress,
      deploymentInfo
    };

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