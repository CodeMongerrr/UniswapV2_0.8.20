// scripts/deployLibrary.js
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying UniswapV2Library with account:", deployer.address);

    // Deploy UniswapV2Library
    console.log("\nDeploying UniswapV2Library...");
    const LibraryFactory = await hre.ethers.getContractFactory("UniswapV2Library");
    const library = await LibraryFactory.deploy();
    await library.waitForDeployment();
    const libraryAddress = await library.getAddress();
    
    console.log(`\nUniswapV2Library deployed to: ${libraryAddress}`);
    console.log("Deployment Transaction Hash:", library.deploymentTransaction().hash);

    // Save the address
    const deploymentDir = './deployments';
    if (!fs.existsSync(deploymentDir)){
        fs.mkdirSync(deploymentDir);
    }

    // Read existing addresses if file exists
    let addresses = {};
    const addressesPath = path.join(deploymentDir, 'addresses_latest.json');
    if (fs.existsSync(addressesPath)) {
        addresses = JSON.parse(fs.readFileSync(addressesPath));
    }

    // Update addresses
    addresses.Library = libraryAddress;

    // Save with timestamp
    const timestamp = new Date().toISOString().replace(/[:\.]/g, '-');
    const network = await hre.network.name;
    const fileName = `addresses_${network}_${timestamp}.json`;

    fs.writeFileSync(
        path.join(deploymentDir, fileName), 
        JSON.stringify(addresses, null, 2)
    );
    fs.writeFileSync(
        addressesPath, 
        JSON.stringify(addresses, null, 2)
    );

    console.log(`\nAddress saved to:`);
    console.log(`- ${fileName}`);
    console.log(`- addresses_latest.json`);

    // Wait a bit before verification
    console.log("\nWaiting 30 seconds before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Verify the contract
    console.log("\nVerifying contract...");
    try {
        await hre.run("verify:verify", {
            address: libraryAddress,
            contract: "contracts/UniswapV2Library.sol:UniswapV2Library" // Specify exact contract
        });
        console.log("Library verified successfully!");
    } catch (error) {
        console.log("Error during verification:", error.message);
    }

    return {
        libraryAddress,
        deploymentTransaction: library.deploymentTransaction().hash
    };
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });