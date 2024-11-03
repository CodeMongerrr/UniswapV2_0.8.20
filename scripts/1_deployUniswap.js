const hre = require("hardhat");
const fs = require("fs");

async function main() {
    // Get the deployer's address
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying Uniswap contracts with account:", deployer.address);

    // Deploy WETH
    console.log("Deploying WETH...");
    const wethFactory = await hre.ethers.getContractFactory("WETH");
    const weth = await wethFactory.deploy();
    await weth.waitForDeployment();
    const wethAddress = await weth.getAddress();
    console.log("WETH deployed to:", wethAddress);

    // Deploy Factory
    console.log("Deploying Factory...");
    const factoryFactory = await hre.ethers.getContractFactory("UniswapV2Factory");
    const factory = await factoryFactory.deploy(deployer.address);
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    console.log("Factory deployed to:", factoryAddress);

    // Deploy Router
    console.log("Deploying Router...");
    const routerFactory = await hre.ethers.getContractFactory("UniswapV2Router");
    const router = await routerFactory.deploy(factoryAddress, wethAddress);
    await router.waitForDeployment();
    const routerAddress = await router.getAddress();
    console.log("Router deployed to:", routerAddress);

    // Save the addresses
    const addresses = {
        WETH: wethAddress,
        Factory: factoryAddress,
        Router: routerAddress,
        deployer: deployer.address
    };

    // Create deployments directory if it doesn't exist
    const deploymentDir = './deployments';
    if (!fs.existsSync(deploymentDir)){
        fs.mkdirSync(deploymentDir);
    }

    // Save addresses with network name and timestamp
    const network = await hre.network.name;
    const timestamp = new Date().toISOString().replace(/[:\.]/g, '-');
    const fileName = `${deploymentDir}/addresses_${network}_${timestamp}.json`;
    
    fs.writeFileSync(
        fileName,
        JSON.stringify(addresses, null, 2)
    );
    
    // Also save as latest deployment
    fs.writeFileSync(
        `${deploymentDir}/addresses_latest.json`,
        JSON.stringify(addresses, null, 2)
    );

    console.log(`Addresses saved to ${fileName}`);
    
    // Verify contracts if on a supported network
    if (network !== 'hardhat' && network !== 'localhost') {
        console.log('\nStarting contract verification...');
        try {
            await hre.run("verify:verify", {
                address: wethAddress,
                constructorArguments: []
            });
            console.log('WETH verified');

            await hre.run("verify:verify", {
                address: factoryAddress,
                constructorArguments: [deployer.address]
            });
            console.log('Factory verified');

            await hre.run("verify:verify", {
                address: routerAddress,
                constructorArguments: [factoryAddress, wethAddress]
            });
            console.log('Router verified');
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