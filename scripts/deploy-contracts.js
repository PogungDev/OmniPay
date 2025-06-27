const { ethers } = require("hardhat")

async function main() {
  console.log("🚀 Starting OmniPay contract deployment...")

  // Get the deployer account
  const [deployer] = await ethers.getSigners()
  console.log("📝 Deploying contracts with account:", deployer.address)
  console.log("💰 Account balance:", (await deployer.getBalance()).toString())

  // Deploy OmniPayCore
  console.log("\n📦 Deploying OmniPayCore...")
  const OmniPayCore = await ethers.getContractFactory("OmniPayCore")
  const omniPayCore = await OmniPayCore.deploy()
  await omniPayCore.deployed()
  console.log("✅ OmniPayCore deployed to:", omniPayCore.address)

  // Deploy OmniPayTreasury
  console.log("\n📦 Deploying OmniPayTreasury...")
  const OmniPayTreasury = await ethers.getContractFactory("OmniPayTreasury")
  const omniPayTreasury = await OmniPayTreasury.deploy()
  await omniPayTreasury.deployed()
  console.log("✅ OmniPayTreasury deployed to:", omniPayTreasury.address)

  // Deploy OmniPayRemittance
  console.log("\n📦 Deploying OmniPayRemittance...")
  const OmniPayRemittance = await ethers.getContractFactory("OmniPayRemittance")
  const omniPayRemittance = await OmniPayRemittance.deploy()
  await omniPayRemittance.deployed()
  console.log("✅ OmniPayRemittance deployed to:", omniPayRemittance.address)

  // Deploy OmniPayPayout
  console.log("\n📦 Deploying OmniPayPayout...")
  const OmniPayPayout = await ethers.getContractFactory("OmniPayPayout")
  const omniPayPayout = await OmniPayPayout.deploy()
  await omniPayPayout.deployed()
  console.log("✅ OmniPayPayout deployed to:", omniPayPayout.address)

  // Deploy OmniPayHistory
  console.log("\n📦 Deploying OmniPayHistory...")
  const OmniPayHistory = await ethers.getContractFactory("OmniPayHistory")
  const omniPayHistory = await OmniPayHistory.deploy()
  await omniPayHistory.deployed()
  console.log("✅ OmniPayHistory deployed to:", omniPayHistory.address)

  // Deploy OmniPayTracker
  console.log("\n📦 Deploying OmniPayTracker...")
  const OmniPayTracker = await ethers.getContractFactory("OmniPayTracker")
  const omniPayTracker = await OmniPayTracker.deploy()
  await omniPayTracker.deployed()
  console.log("✅ OmniPayTracker deployed to:", omniPayTracker.address)

  // Summary
  console.log("\n🎉 All contracts deployed successfully!")
  console.log("📋 Contract Addresses:")
  console.log("├── OmniPayCore:", omniPayCore.address)
  console.log("├── OmniPayTreasury:", omniPayTreasury.address)
  console.log("├── OmniPayRemittance:", omniPayRemittance.address)
  console.log("├── OmniPayPayout:", omniPayPayout.address)
  console.log("├── OmniPayHistory:", omniPayHistory.address)
  console.log("└── OmniPayTracker:", omniPayTracker.address)

  // Update lib/contracts.ts with these addresses
  console.log("\n📝 Update lib/contracts.ts with these addresses:")
  console.log(`
  // Replace the addresses in CONTRACT_ADDRESSES for your network:
  OMNIPAY_CORE: "${omniPayCore.address}",
  OMNIPAY_TREASURY: "${omniPayTreasury.address}",
  OMNIPAY_REMITTANCE: "${omniPayRemittance.address}",
  OMNIPAY_PAYOUT: "${omniPayPayout.address}",
  OMNIPAY_HISTORY: "${omniPayHistory.address}",
  OMNIPAY_TRACKER: "${omniPayTracker.address}",
  `)

  // Verify contracts on Etherscan (if on mainnet/testnet)
  const network = await ethers.provider.getNetwork()
  const hre = require("hardhat")
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\n🔍 Waiting for block confirmations...")
    await omniPayCore.deployTransaction.wait(6)

    console.log("🔍 Verifying contracts on Etherscan...")
    try {
      await hre.run("verify:verify", {
        address: omniPayCore.address,
        constructorArguments: [],
      })
      console.log("✅ OmniPayCore verified")
    } catch (error) {
      console.log("❌ OmniPayCore verification failed:", error.message)
    }

    // Verify other contracts...
    // (Similar verification for other contracts)
  }

  console.log("\n🚀 Deployment complete! Ready to test on-chain functionality.")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error)
    process.exit(1)
  })
