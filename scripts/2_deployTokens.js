const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying tokens with account:", deployer.address);

    // Get deployment directory
    const deploymentDir = './deployments';
    const latestFile = path.join(deploymentDir, 'addresses_latest.json');
    
    // Read existing addresses
    const addresses = JSON.parse(fs.readFileSync(latestFile));

    // Deploy USDT
    console.log("\nDeploying USDT...");
    const USDTFactory = await hre.ethers.getContractFactory("ERC20Test");
    const usdt = await USDTFactory.deploy(
        "Tether USDT", 
        "USDT", 
        hre.ethers.parseEther("10000000")
    );
    await usdt.waitForDeployment();
    const usdtAddress = await usdt.getAddress();
    console.log("USDT deployed to:", usdtAddress);

    // Deploy DAI
    console.log("\nDeploying DAI...");
    const daiFactory = await hre.ethers.getContractFactory("ERC20Test");
    const dai = await daiFactory.deploy(
        "DAI Stablecoin", 
        "DAI", 
        hre.ethers.parseEther("10000000")
    );
    await dai.waitForDeployment();
    const daiAddress = await dai.getAddress();
    console.log("DAI deployed to:", daiAddress);

    // Update addresses
    addresses.USDT = usdtAddress;
    addresses.DAI = daiAddress;

    // Save updated addresses
    const timestamp = new Date().toISOString().replace(/[:\.]/g, '-');
    const network = await hre.network.name;
    const newFile = path.join(deploymentDir, `addresses_${network}_${timestamp}.json`);

    fs.writeFileSync(newFile, JSON.stringify(addresses, null, 2));
    fs.writeFileSync(latestFile, JSON.stringify(addresses, null, 2));
    console.log(`Addresses saved to ${newFile}`);

    // Verify contracts if on a supported network
    if (network !== 'hardhat' && network !== 'localhost') {
        console.log('\nStarting token verification...');
        try {
            await hre.run("verify:verify", {
                address: usdtAddress,
                constructorArguments: [
                    "Tether USDT",
                    "USDT",
                    hre.ethers.parseEther("10000000")
                ]
            });
            console.log('USDT verified');

            await hre.run("verify:verify", {
                address: daiAddress,
                constructorArguments: [
                    "DAI Stablecoin",
                    "DAI",
                    hre.ethers.parseEther("10000000")
                ]
            });
            console.log('DAI verified');
        } catch (error) {
            console.log('Error during verification:', error);
        }
    }

    return addresses;
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });