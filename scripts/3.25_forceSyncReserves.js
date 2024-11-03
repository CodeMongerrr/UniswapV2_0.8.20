const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Syncing pairs with account:", deployer.address);

    const deploymentDir = './deployments';
    const addresses = JSON.parse(
        fs.readFileSync(path.join(deploymentDir, 'addresses_latest.json'))
    );

    // Get contract instances
    const factory = await hre.ethers.getContractAt("UniswapV2Factory", addresses.Factory);
    const weth = await hre.ethers.getContractAt("WETH", addresses.WETH);
    const usdt = await hre.ethers.getContractAt("ERC20Test", addresses.USDT);
    const dai = await hre.ethers.getContractAt("ERC20Test", addresses.DAI);

    async function syncPair(token0Address, token1Address, pairName) {
        console.log(`\nSyncing ${pairName} Pair:`);
        
        // Get pair address
        const pairAddress = await factory.getPair(token0Address, token1Address);
        console.log("Pair Address:", pairAddress);

        if (pairAddress === "0x0000000000000000000000000000000000000000") {
            console.log("Pair does not exist!");
            return;
        }

        const pair = await hre.ethers.getContractAt("UniswapV2Pair", pairAddress);
        
        // Get pre-sync data
        const token0 = await pair.token0();
        const token1 = await pair.token1();
        const reservesBefore = await pair.getReserves();
        
        // Get actual balances
        const token0Contract = await hre.ethers.getContractAt("ERC20Test", token0);
        const token1Contract = await hre.ethers.getContractAt("ERC20Test", token1);
        
        const balance0 = await token0Contract.balanceOf(pairAddress);
        const balance1 = await token1Contract.balanceOf(pairAddress);

        console.log("\nBefore sync:");
        console.log("Reserve0:", hre.ethers.formatEther(reservesBefore[0]));
        console.log("Reserve1:", hre.ethers.formatEther(reservesBefore[1]));
        console.log("Balance0:", hre.ethers.formatEther(balance0));
        console.log("Balance1:", hre.ethers.formatEther(balance1));

        // Call sync
        console.log("\nCalling sync...");
        try {
            const syncTx = await pair.sync({ gasLimit: 200000 });
            await syncTx.wait();
            console.log("Sync successful!");

            // Get post-sync reserves
            const reservesAfter = await pair.getReserves();
            console.log("\nAfter sync:");
            console.log("Reserve0:", hre.ethers.formatEther(reservesAfter[0]));
            console.log("Reserve1:", hre.ethers.formatEther(reservesAfter[1]));

            // Check if sync made any changes
            if (!reservesBefore[0].eq(reservesAfter[0]) || !reservesBefore[1].eq(reservesAfter[1])) {
                console.log("\nReserves were updated!");
            } else {
                console.log("\nNo change in reserves needed.");
            }
        } catch (error) {
            console.log("Error during sync:", error.message);
        }
    }

    // Sync WETH/USDT pair
    await syncPair(
        addresses.WETH,
        addresses.USDT,
        "WETH/USDT"
    );

    // Sync WETH/DAI pair
    await syncPair(
        addresses.WETH,
        addresses.DAI,
        "WETH/DAI"
    );

    // Sync USDT/DAI pair
    await syncPair(
        addresses.USDT,
        addresses.DAI,
        "USDT/DAI"
    );

    console.log("\nSync operations completed!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });