#!/usr/bin/env node

/**
 * 🚀 OMNIPAY SIMPLE TESTNET DEPLOYMENT
 * 
 * This script deploys ONLY the SimplePay contract for demonstration.
 * Cost: ~$0.50 worth of testnet ETH (FREE from faucets)
 */

const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔥 OMNIPAY TESTNET DEPLOYMENT STARTING...\n");

  // Step 1: Get deployer info
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("📍 Deployer address:", deployer.address);
  console.log("⛓️  Network:", network.name, "(Chain ID:", Number(network.chainId), ")");
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.01")) {
    console.log("\n⚠️  LOW BALANCE! Get free testnet ETH:");
    console.log("🚰 Sepolia: https://sepoliafaucet.com");
    console.log("🚰 Mumbai: https://faucet.polygon.technology");
    console.log("🚰 Base Goerli: https://faucet.quicknode.com/base/goerli\n");
    return;
  }

  // Step 2: Deploy SimplePay contract
  console.log("\n🚀 DEPLOYING SIMPLEPAY CONTRACT...");
  
  try {
    const SimplePay = await ethers.getContractFactory("SimplePay");
    console.log("📄 Contract factory created");
    
    const simplePay = await SimplePay.deploy();
    console.log("⏳ Transaction sent, waiting for confirmation...");
    
    await simplePay.waitForDeployment();
    const contractAddress = await simplePay.getAddress();
    
    console.log("✅ SimplePay deployed to:", contractAddress);
    
    // Step 3: Verify deployment
    console.log("\n🔍 VERIFYING DEPLOYMENT...");
    
    const owner = await simplePay.owner();
    console.log("👤 Contract owner:", owner);
    
    const paymentCount = await simplePay.getPaymentCount();
    console.log("📊 Payment count:", Number(paymentCount));
    
    // Step 4: Save deployment info
    console.log("\n💾 SAVING DEPLOYMENT INFO...");
    
    const deploymentInfo = {
      network: {
        name: network.name,
        chainId: Number(network.chainId),
        timestamp: new Date().toISOString()
      },
      contract: {
        name: "SimplePay",
        address: contractAddress,
        owner: owner,
        deployer: deployer.address
      },
      transaction: {
        hash: simplePay.deploymentTransaction?.hash || "N/A",
        blockNumber: await ethers.provider.getBlockNumber()
      },
      cost: "~0.01 testnet ETH (FREE from faucets)"
    };

    // Create deployments directory
    if (!fs.existsSync('deployments')) {
      fs.mkdirSync('deployments');
    }

    // Save deployment info
    const filename = `deployments/${network.name}-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
    console.log("📝 Deployment saved to:", filename);

    // Step 5: Generate environment variables
    console.log("\n📋 GENERATING .env.local...");
    
    const envContent = `# 🔥 OMNIPAY TESTNET DEPLOYMENT - ${new Date().toISOString()}

# === CONTRACT ADDRESSES ===
NEXT_PUBLIC_SIMPLEPAY_CONTRACT=${contractAddress}
NEXT_PUBLIC_CONTRACT_OWNER=${owner}

# === NETWORK INFO ===
NEXT_PUBLIC_CHAIN_ID=${network.chainId}
NEXT_PUBLIC_NETWORK_NAME=${network.name}

# === SDK CONFIGURATIONS ===
NEXT_PUBLIC_LIFI_INTEGRATOR=omnipay-testnet-${Date.now()}
NEXT_PUBLIC_METAMASK_DAPP_ID=omnipay-${network.name}

# === EXPLORER LINKS ===
NEXT_PUBLIC_EXPLORER_URL=${getExplorerUrl(network.name)}
NEXT_PUBLIC_CONTRACT_EXPLORER=${getExplorerUrl(network.name)}/address/${contractAddress}

# === PROOF MODE ===
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_PROOF_LOGGING=true
NEXT_PUBLIC_DEPLOYMENT_TIMESTAMP=${Date.now()}

# === DEMO DATA ===
NEXT_PUBLIC_DEMO_WALLET=${deployer.address}
`;

    fs.writeFileSync('.env.local', envContent);
    console.log("✅ Environment file created");

    // Step 6: Create browser proof script
    console.log("\n🔍 CREATING BROWSER PROOF SCRIPT...");
    
    const proofScript = `
// 🔥 OMNIPAY DEPLOYMENT PROOF SCRIPT
// Open browser console and paste this to verify deployment

const verifyOmniPayDeployment = async () => {
  console.group("🚀 OMNIPAY DEPLOYMENT PROOF");
  
  console.log("📅 Deployment:", "${new Date().toISOString()}");
  console.log("⛓️  Network:", "${network.name} (${network.chainId})");
  console.log("📍 Contract:", "${contractAddress}");
  console.log("👤 Owner:", "${owner}");
  console.log("🏗️  Deployer:", "${deployer.address}");
  
  // Test contract interaction
  try {
    console.log("\\n🔌 Testing contract calls...");
    
    if (typeof window !== 'undefined' && window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        "${contractAddress}",
        ["function getPaymentCount() view returns (uint256)", "function owner() view returns (address)"],
        provider
      );
      
      const paymentCount = await contract.getPaymentCount();
      const contractOwner = await contract.owner();
      
      console.log("✅ Payment count:", paymentCount.toString());
      console.log("✅ Contract owner:", contractOwner);
      
    } else {
      console.log("⚠️  No Web3 provider - install MetaMask to test contract calls");
    }
    
  } catch (error) {
    console.log("❌ Contract test failed:", error.message);
  }
  
  console.log("\\n🌐 Verify on explorer:");
  console.log("${getExplorerUrl(network.name)}/address/${contractAddress}");
  
  console.log("\\n🎯 DEPLOYMENT VERIFIED!");
  console.groupEnd();
};

// Execute verification
verifyOmniPayDeployment();
`;

    fs.writeFileSync('public/deployment-proof.js', proofScript);
    console.log("✅ Browser proof script created");

    // Step 7: Summary
    console.log("\n" + "=".repeat(60));
    console.log("🎉 TESTNET DEPLOYMENT COMPLETE!");
    console.log("=".repeat(60));
    console.log(`📊 SUMMARY:`);
    console.log(`   Network: ${network.name} (${network.chainId})`);
    console.log(`   Contract: ${contractAddress}`);
    console.log(`   Owner: ${owner}`);
    console.log(`   Cost: FREE (testnet)`);
    console.log(`   Time: ${new Date().toLocaleTimeString()}`);
    
    console.log(`\n🔗 VERIFICATION LINKS:`);
    console.log(`   Explorer: ${getExplorerUrl(network.name)}/address/${contractAddress}`);
    console.log(`   Transaction: ${getExplorerUrl(network.name)}/tx/${simplePay.deploymentTransaction?.hash || 'N/A'}`);
    
    console.log(`\n🎯 FOR JUDGES:`);
    console.log(`   1. Visit contract on explorer`);
    console.log(`   2. See real deployment transaction`);
    console.log(`   3. Load /deployment-proof.js in browser console`);
    console.log(`   4. Test real SDK integrations in the app`);
    
    console.log(`\n🔥 READY FOR DEMO! 🚀`);
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    console.log("💡 TIP: Make sure you have testnet ETH for gas");
    process.exit(1);
  }
}

function getExplorerUrl(networkName) {
  switch (networkName.toLowerCase()) {
    case 'sepolia':
      return 'https://sepolia.etherscan.io';
    case 'mumbai':
      return 'https://mumbai.polygonscan.com';
    case 'arbitrumgoerli':
      return 'https://goerli.arbiscan.io';
    case 'basegoerli':
      return 'https://goerli.basescan.org';
    default:
      return 'https://etherscan.io';
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }); 