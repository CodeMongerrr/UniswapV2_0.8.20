const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Testing swaps with account:", deployer.address);

    const deploymentDir = './deployments';
    const addresses = JSON.parse(
        fs.readFileSync(path.join(deploymentDir, 'addresses_latest.json'))
    );

    // Get contract instances
    const router = await hre.ethers.getContractAt("UniswapV2Router", addresses.Router);
    const weth = await hre.ethers.getContractAt("WETH", addresses.WETH);
    const usdt = await hre.ethers.getContractAt("ERC20Test", addresses.USDT);
    const dai = await hre.ethers.getContractAt("ERC20Test", addresses.DAI);

    // Test 1: WETH to USDT swap
    console.log("\n1. Testing WETH -> USDT swap");
    try {
        // First get the balances before swap
        const wethBalanceBefore = await weth.balanceOf(deployer.address);
        const usdtBalanceBefore = await usdt.balanceOf(deployer.address);
        console.log("\nBalances Before Swap:");
        console.log("WETH Balance:", hre.ethers.formatEther(wethBalanceBefore));
        console.log("USDT Balance:", hre.ethers.formatEther(usdtBalanceBefore));

        // Approve WETH if not already approved
        await weth.approve(addresses.Router, hre.ethers.parseEther("1"));
        
        // Perform swap
        const swapAmount = hre.ethers.parseEther("0.1"); // Swap 0.1 WETH
        console.log("\nSwapping 0.1 WETH for USDT...");
        
        const tx1 = await router.swapExactTokensForTokens(
            swapAmount,
            0, // Accept any amount of USDT
            [addresses.WETH, addresses.USDT],
            deployer.address,
            Math.floor(Date.now() / 1000) + 60 * 10,
            { gasLimit: 300000 }
        );
        await tx1.wait();

        // Get balances after swap
        const wethBalanceAfter = await weth.balanceOf(deployer.address);
        const usdtBalanceAfter = await usdt.balanceOf(deployer.address);
        console.log("\nBalances After Swap:");
        console.log("WETH Balance:", hre.ethers.formatEther(wethBalanceAfter));
        console.log("USDT Balance:", hre.ethers.formatEther(usdtBalanceAfter));
        console.log("USDT Received:", hre.ethers.formatEther(usdtBalanceAfter - usdtBalanceBefore));
    } catch (error) {
        console.log("Error in WETH -> USDT swap:", error.message);
    }

    // Test 2: USDT to DAI swap
    console.log("\n2. Testing USDT -> DAI swap");
    try {
        // Check balances before swap
        const usdtBalanceBefore = await usdt.balanceOf(deployer.address);
        const daiBalanceBefore = await dai.balanceOf(deployer.address);
        console.log("\nBalances Before Swap:");
        console.log("USDT Balance:", hre.ethers.formatEther(usdtBalanceBefore));
        console.log("DAI Balance:", hre.ethers.formatEther(daiBalanceBefore));

        // Approve USDT
        await usdt.approve(addresses.Router, hre.ethers.parseEther("100"));
        
        // Perform swap
        const swapAmount = hre.ethers.parseEther("100"); // Swap 100 USDT
        console.log("\nSwapping 100 USDT for DAI...");
        
        const tx2 = await router.swapExactTokensForTokens(
            swapAmount,
            0, // Accept any amount of DAI
            [addresses.USDT, addresses.DAI],
            deployer.address,
            Math.floor(Date.now() / 1000) + 60 * 10,
            { gasLimit: 300000 }
        );
        await tx2.wait();

        // Get balances after swap
        const usdtBalanceAfter = await usdt.balanceOf(deployer.address);
        const daiBalanceAfter = await dai.balanceOf(deployer.address);
        console.log("\nBalances After Swap:");
        console.log("USDT Balance:", hre.ethers.formatEther(usdtBalanceAfter));
        console.log("DAI Balance:", hre.ethers.formatEther(daiBalanceAfter));
        console.log("DAI Received:", hre.ethers.formatEther(daiBalanceAfter - daiBalanceBefore));
    } catch (error) {
        console.log("Error in USDT -> DAI swap:", error.message);
    }

    // Test 3: DAI to WETH swap
    console.log("\n3. Testing DAI -> WETH swap");
    try {
        // Check balances before swap
        const daiBalanceBefore = await dai.balanceOf(deployer.address);
        const wethBalanceBefore = await weth.balanceOf(deployer.address);
        console.log("\nBalances Before Swap:");
        console.log("DAI Balance:", hre.ethers.formatEther(daiBalanceBefore));
        console.log("WETH Balance:", hre.ethers.formatEther(wethBalanceBefore));

        // Approve DAI
        await dai.approve(addresses.Router, hre.ethers.parseEther("1000"));
        
        // Perform swap
        const swapAmount = hre.ethers.parseEther("1000"); // Swap 1000 DAI
        console.log("\nSwapping 1000 DAI for WETH...");
        
        const tx3 = await router.swapExactTokensForTokens(
            swapAmount,
            0, // Accept any amount of WETH
            [addresses.DAI, addresses.WETH],
            deployer.address,
            Math.floor(Date.now() / 1000) + 60 * 10,
            { gasLimit: 300000 }
        );
        await tx3.wait();

        // Get balances after swap
        const daiBalanceAfter = await dai.balanceOf(deployer.address);
        const wethBalanceAfter = await weth.balanceOf(deployer.address);
        console.log("\nBalances After Swap:");
        console.log("DAI Balance:", hre.ethers.formatEther(daiBalanceAfter));
        console.log("WETH Balance:", hre.ethers.formatEther(wethBalanceAfter));
        console.log("WETH Received:", hre.ethers.formatEther(wethBalanceAfter - wethBalanceBefore));
    } catch (error) {
        console.log("Error in DAI -> WETH swap:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });