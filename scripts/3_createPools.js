const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Creating liquidity pools with account:", deployer.address);

    const deploymentDir = './deployments';
    const addresses = JSON.parse(
        fs.readFileSync(path.join(deploymentDir, 'addresses_latest.json'))
    );

    // Get contract instances
    const factory = await hre.ethers.getContractAt("UniswapV2Factory", addresses.Factory);
    const router = await hre.ethers.getContractAt("UniswapV2Router", addresses.Router);
    const weth = await hre.ethers.getContractAt("WETH", addresses.WETH);
    const usdt = await hre.ethers.getContractAt("ERC20Test", addresses.USDT);
    const dai = await hre.ethers.getContractAt("ERC20Test", addresses.DAI);

    // Create WETH/USDT Pool
    // console.log("\nCreating WETH/USDT pool...");
    // await factory.createPair(addresses.WETH, addresses.USDT);
    
    // Approve tokens
    // await usdt.approve(
    //     addresses.Router, 
    //     hre.ethers.parseEther("10000000")
    // );
    
    // Deposit ETH to WETH
    // await weth.deposit({ value: hre.ethers.parseEther("1.5") });
    // await weth.approve(
    //     addresses.Router, 
    //     hre.ethers.parseEther("15")
    // );

    // Add WETH/USDT Liquidity (1 WETH = 2462 USDT)
    // console.log("Adding WETH/USDT liquidity...");
    // await router.addLiquidity(
    //     addresses.WETH,
    //     addresses.USDT,
    //     hre.ethers.parseEther("0.5"), // 100 WETH
    //     hre.ethers.parseEther("1231"), // 246,200 USDT
    //     0,
    //     0,
    //     deployer.address,
    //     Math.floor(Date.now() / 1000) + 60 * 10
    // );

    // Create and add liquidity for WETH/DAI
    // console.log("\nCreating WETH/DAI pool...");
    // await factory.createPair(addresses.WETH, addresses.DAI);
    // await dai.approve(
    //     addresses.Router, 
    //     hre.ethers.parseEther("10000000")
    // );

    // console.log("Adding WETH/DAI liquidity...");
    // await router.addLiquidity(
    //     addresses.WETH,
    //     addresses.DAI,
    //     hre.ethers.parseEther("0.5"), // 100 WETH
    //     hre.ethers.parseEther("1329.5"), // 265,900 DAI
    //     0,
    //     0,
    //     deployer.address,
    //     Math.floor(Date.now() / 1000) + 60 * 10
    // );

    // Create and add liquidity for USDT/DAI
    // console.log("\nCreating USDT/DAI pool...");
    // await factory.createPair(addresses.USDT, addresses.DAI);

    // console.log("Adding USDT/DAI liquidity...");
    // await router.addLiquidity(
    //     addresses.USDT,
    //     addresses.DAI,
    //     hre.ethers.parseEther("1000"), // 100,000 USDT
    //     hre.ethers.parseEther("1001"), // 100,100 DAI
    //     0,
    //     0,
    //     deployer.address,
    //     Math.floor(Date.now() / 1000) + 60 * 10
    // );

    // Get and save pair addresses
    const wethUsdtPair = await factory.getPair(addresses.WETH, addresses.USDT);
    const wethDaiPair = await factory.getPair(addresses.WETH, addresses.DAI);
    const usdtDaiPair = await factory.getPair(addresses.USDT, addresses.DAI);

    addresses.WETHUSDTPair = wethUsdtPair;
    addresses.WETHDAIPair = wethDaiPair;
    addresses.USDTDAIPair = usdtDaiPair;

    // Save updated addresses
    const timestamp = new Date().toISOString().replace(/[:\.]/g, '-');
    const network = await hre.network.name;
    const newFile = path.join(deploymentDir, `addresses_${network}_${timestamp}.json`);

    fs.writeFileSync(newFile, JSON.stringify(addresses, null, 2));
    fs.writeFileSync(
        path.join(deploymentDir, 'addresses_latest.json'), 
        JSON.stringify(addresses, null, 2)
    );
    console.log(`Updated addresses saved to ${newFile}`);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

