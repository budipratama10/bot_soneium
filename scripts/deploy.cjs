const { ethers } = require("hardhat");
const fs = require("fs");
const chalk = require("chalk");

async function main() {
    console.log(chalk.blue("\n?? Deploying Token...\n"));

    // Load data token dari temp_token.json (disimpan oleh menu.js)
    if (!fs.existsSync("temp_token.json")) {
        console.log(chalk.red("? Tidak ada data token yang ditemukan!"));
        return;
    }

    const tokenData = JSON.parse(fs.readFileSync("temp_token.json"));
    const tokenName = tokenData.tokenName;
    const tokenSymbol = tokenData.tokenSymbol;
    const totalSupply = ethers.parseUnits(tokenData.totalSupply, 18);

    // Ambil akun wallet yang sedang digunakan
    const [deployer] = await ethers.getSigners();
    console.log(chalk.green(`? Deployer Address: ${deployer.address}`));

    // Deploy contract dengan parameter yang benar
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy(tokenName, tokenSymbol, totalSupply, deployer.address);

    await token.waitForDeployment();
    console.log(chalk.green(`? Token berhasil dideploy! Address: ${await token.getAddress()}`));

    // Simpan alamat token yang baru dideploy ke deployed_tokens.json
    const deployedTokensFile = "deployed_tokens.json";
    let deployedTokens = [];

    if (fs.existsSync(deployedTokensFile)) {
        deployedTokens = JSON.parse(fs.readFileSync(deployedTokensFile));
    }

    deployedTokens.push({
        name: tokenName,
        symbol: tokenSymbol,
        totalSupply: tokenData.totalSupply,
        address: await token.getAddress(),
        owner: deployer.address
    });

    fs.writeFileSync(deployedTokensFile, JSON.stringify(deployedTokens, null, 2));
    console.log(chalk.yellow("\n?? Token tersimpan di deployed_tokens.json"));
}

// Jalankan main function
main().catch((error) => {
    console.error(chalk.red(`? Deployment error: ${error.message}`));
    process.exit(1);
});
