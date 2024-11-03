const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Checking reserves with account:", deployer.address);

    const deploymentDir = './deployments';
    const addresses = JSON.parse(
        fs.readFileSync(path.join(deploymentDir, 'addresses_latest.json'))
    );

    // Get contract instances
    const factory = await hre.ethers.getContractAt("UniswapV2Factory", addresses.Factory);
    const weth = await hre.ethers.getContractAt("WETH", addresses.WETH);
    const usdt = await hre.ethers.getContractAt("ERC20Test", addresses.USDT);
    const dai = await hre.ethers.getContractAt("ERC20Test", addresses.DAI);

    // Function to get token symbol
    async function getTokenSymbol(address) {
        const token = await hre.ethers.getContractAt("ERC20Test", address);
        return await token.symbol();
    }

    // Function to check reserves for a pair
    async function checkPairReserves(token0Address, token1Address, pairName) {
        console.log(`\nChecking ${pairName} Pair:`);
        
        const pairAddress = await factory.getPair(token0Address, token1Address);
        console.log("Pair Address:", pairAddress);

        if (pairAddress === "0x0000000000000000000000000000000000000000") {
            console.log("Pair does not exist!");
            return;
        }

        const pair = await hre.ethers.getContractAt("UniswapV2Pair", pairAddress);
        
        // Get tokens in pair
        const token0 = await pair.token0();
        const token1 = await pair.token1();
        
        // Get token symbols
        const symbol0 = await getTokenSymbol(token0);
        const symbol1 = await getTokenSymbol(token1);

        // Get reserves
        const reserves = await pair.getReserves();
        
        console.log(`Token0 (${symbol0}):`, token0);
        console.log(`Token1 (${symbol1}):`, token1);
        console.log(`${symbol0} Reserve:`, hre.ethers.formatEther(reserves[0]));
        console.log(`${symbol1} Reserve:`, hre.ethers.formatEther(reserves[1]));

        // Calculate price ratios
        if (reserves[0] > 0 && reserves[1] > 0) {
            const price0Per1 = reserves[1] / reserves[0];
            const price1Per0 = reserves[0] / reserves[1];
            
        }
    }

    // Check WETH/USDT pair
    await checkPairReserves(
        addresses.WETH,
        addresses.USDT,
        "WETH/USDT"
    );

    // Check WETH/DAI pair
    await checkPairReserves(
        addresses.WETH,
        addresses.DAI,
        "WETH/DAI"
    );

    // Check USDT/DAI pair
    await checkPairReserves(
        addresses.USDT,
        addresses.DAI,
        "USDT/DAI"
    );

    // Get total pairs
    const totalPairs = await factory.allPairsLength();
    console.log(`\nTotal number of pairs in factory: ${totalPairs}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });