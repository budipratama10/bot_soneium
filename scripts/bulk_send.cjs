const { ethers } = require("hardhat");
const dotenv = require("dotenv");
const fs = require("fs");
const inquirer = require("inquirer");
const chalk = require("chalk");

dotenv.config();

async function main() {
    console.log(chalk.blue("\n?? Memulai Bulk Send...\n"));

    // Pastikan ada daftar token yang sudah dideploy
    if (!fs.existsSync("deployed_tokens.json")) {
        console.error(chalk.red("? Tidak ada token yang sudah dideploy. Buat token terlebih dahulu!"));
        process.exit(1);
    }

    const deployedTokens = JSON.parse(fs.readFileSync("deployed_tokens.json", "utf8"));
    if (deployedTokens.length === 0) {
        console.error(chalk.red("? Tidak ada token yang tersedia untuk dikirim."));
        process.exit(1);
    }

    // Pilih token mana yang ingin dikirim
    const { selectedToken } = await inquirer.prompt([
        {
            type: "list",
            name: "selectedToken",
            message: "Pilih token yang ingin dikirim:",
            choices: deployedTokens.map(token => `${token.name} (${token.symbol}) - ${token.address}`)
        },
    ]);

    const tokenAddress = selectedToken.split(" - ")[1];
    console.log(chalk.yellow(`\n?? Token yang dipilih: ${selectedToken}\n`));

    // Pastikan ada daftar penerima
    if (!fs.existsSync(process.env.RECIPIENTS_FILE)) {
        console.error(chalk.red("? Tidak ada file recipients.txt. Harap buat daftar penerima dulu!"));
        process.exit(1);
    }

    const recipients = fs.readFileSync(process.env.RECIPIENTS_FILE, "utf8")
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0);

    if (recipients.length === 0) {
        console.error(chalk.red("? Daftar penerima kosong. Tambahkan alamat penerima di recipients.txt!"));
        process.exit(1);
    }

    console.log(chalk.blue(`?? Membaca ${recipients.length} alamat dari ${process.env.RECIPIENTS_FILE}...\n`));

    // Ambil wallet dari .env
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log(chalk.green(`? Menggunakan wallet: ${wallet.address}\n`));

    // Load kontrak ERC20
    let Token;
    try {
        Token = await ethers.getContractAt("Token", tokenAddress, wallet);
    } catch (error) {
        console.error(chalk.red(`? Gagal menghubungkan ke kontrak: ${error.message}`));
        process.exit(1);
    }

    // Pilih jumlah token yang dikirim ke tiap penerima
    const { sendAmount } = await inquirer.prompt([
        {
            type: "input",
            name: "sendAmount",
            message: "Masukkan jumlah token yang ingin dikirim ke tiap penerima:",
            validate: value => isNaN(value) || value <= 0 ? "Masukkan angka yang valid!" : true
        }
    ]);

    const amount = ethers.parseUnits(sendAmount, 18); // Convert jumlah token ke BigInt
    const totalAmount = amount * BigInt(recipients.length); // Perkalian total

    // Periksa saldo token sebelum mengirim
    const balance = await Token.balanceOf(wallet.address);
    console.log(chalk.yellow(`?? Saldo token: ${ethers.formatUnits(balance, 18)} token`));
    console.log(chalk.yellow(`?? Total yang akan dikirim: ${ethers.formatUnits(totalAmount, 18)} token\n`));

    if (balance < totalAmount) {
        console.error(chalk.red("? Saldo token tidak cukup untuk mengirim ke semua penerima."));
        process.exit(1);
    }

    console.log(chalk.blue("\n?? Memulai pengiriman token...\n"));

    for (let i = 0; i < recipients.length; i++) {
        try {
            console.log(chalk.blue(`?? Mengirim ${ethers.formatUnits(amount, 18)} token ke ${recipients[i]}...`));
            const tx = await Token.transfer(recipients[i], amount);
            await tx.wait();
            console.log(chalk.green(`? Transaksi sukses: ${tx.hash}\n`));
        } catch (error) {
            console.error(chalk.red(`? Gagal mengirim ke ${recipients[i]}: ${error.message}`));
        }
    }

    console.log(chalk.green("\n? Semua transaksi selesai!\n"));
}

main().catch((error) => {
    console.error(chalk.red(`? Error utama: ${error.message}`));
    process.exitCode = 1;
});
