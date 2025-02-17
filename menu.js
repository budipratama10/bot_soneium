import fs from "fs";
import inquirer from "inquirer";
import dotenv from "dotenv";
import chalk from "chalk";
import { execSync } from "child_process";
import { ethers } from "ethers"; // Untuk mendapatkan alamat wallet dari private key

dotenv.config();

const WALLETS_FILE = "wallets.txt";
const RECIPIENTS_FILE = "recipients.txt";
const DEPLOYED_TOKENS_FILE = "deployed_tokens.json";
const TEMP_TOKEN_FILE = "temp_token.json";
const ENV_FILE = ".env";

/**
 * Fungsi untuk memformat tampilan alamat (6 karakter awal + xxxxxxxxxxxxxxxx + 6 karakter akhir)
 */
function formatAddress(address) {
    if (!address || address.length < 12) return address;
    return `${address.slice(0, 6)}xxxxxxxxxxxxxxxx${address.slice(-6)}`;
}

/**
 * Fungsi untuk memilih wallet dari daftar di wallets.txt
 */
async function chooseWallet() {
    if (!fs.existsSync(WALLETS_FILE)) {
        console.log(chalk.red("? Tidak ada file wallets.txt. Tambahkan wallet terlebih dahulu."));
        return;
    }

    const wallets = fs.readFileSync(WALLETS_FILE, "utf8")
        .split("\n")
        .map(w => w.trim())
        .filter(Boolean);

    if (wallets.length === 0) {
        console.log(chalk.red("? Tidak ada wallet yang tersedia dalam wallets.txt."));
        return;
    }

    const { selectedWallet } = await inquirer.prompt([
        {
            type: "list",
            name: "selectedWallet",
            message: "?? Pilih wallet yang ingin digunakan:",
            choices: wallets,
        },
    ]);

    const [walletAddress, privateKey] = selectedWallet.split("|");
    const formattedPrivateKey = privateKey.replace(/^0x/, ""); // Hapus awalan 0x jika ada

    // Update PRIVATE_KEY di .env
    let envContent = fs.readFileSync(ENV_FILE, "utf8");
    envContent = envContent.replace(/PRIVATE_KEY=.*/, `PRIVATE_KEY=${formattedPrivateKey}`);
    fs.writeFileSync(ENV_FILE, envContent);

    console.log(chalk.green(`? Wallet berhasil dipilih: ${formatAddress(walletAddress)}\n`));
}

/**
 * Fungsi untuk membuat dan mendistribusikan token baru
 */
async function createAndDeployToken() {
    console.log(chalk.blue("\n?? Creating and Deploying Token...\n"));

    const { tokenName, tokenSymbol, totalSupply } = await inquirer.prompt([
        {
            type: "input",
            name: "tokenName",
            message: "??? Masukkan nama token:",
            validate: input => input ? true : "Nama token tidak boleh kosong!"
        },
        {
            type: "input",
            name: "tokenSymbol",
            message: "?? Masukkan simbol token:",
            validate: input => input ? true : "Simbol token tidak boleh kosong!"
        },
        {
            type: "input",
            name: "totalSupply",
            message: "?? Masukkan total supply token:",
            validate: value => isNaN(value) || value <= 0 ? "Masukkan angka yang valid!" : true
        }
    ]);

    console.log(chalk.yellow(`\n?? Deploying Token: ${tokenName} (${tokenSymbol}) with supply ${totalSupply}...\n`));

    // Simpan data token ke file sementara
    fs.writeFileSync(TEMP_TOKEN_FILE, JSON.stringify({ tokenName, tokenSymbol, totalSupply }));

    try {
        execSync(`npx hardhat run scripts/deploy.cjs --network soenium`, { stdio: "inherit" });

        console.log(chalk.green("\n? Token berhasil dibuat dan dideploy!\n"));

        // Baca kembali alamat token yang baru dideploy
        const deployedTokens = JSON.parse(fs.readFileSync(DEPLOYED_TOKENS_FILE, "utf8"));
        const latestToken = deployedTokens[deployedTokens.length - 1];

        console.log(chalk.green(`\n? Deployer Address: ${formatAddress(latestToken.deployer)}`));
        console.log(chalk.green(`? Token Address: ${formatAddress(latestToken.address)}\n`));
    } catch (error) {
        console.error(chalk.red(`? Error: ${error.message}\n`));
    } finally {
        // Hapus file sementara setelah selesai
        if (fs.existsSync(TEMP_TOKEN_FILE)) {
            fs.unlinkSync(TEMP_TOKEN_FILE);
        }
    }
}

/**
 * Fungsi untuk menghasilkan daftar penerima token
 */
async function generateRecipients() {
    const { count } = await inquirer.prompt([
        {
            type: "input",
            name: "count",
            message: "?? Masukkan jumlah alamat penerima yang ingin dibuat:",
            validate: value => isNaN(value) || value <= 0 ? "Masukkan angka yang valid!" : true
        }
    ]);

    console.log(chalk.blue(`\n?? Generating ${count} recipient addresses...\n`));

    try {
        execSync(`node scripts/generate_recipients.js ${count}`, { stdio: "inherit" });
        console.log(chalk.green("\n? Recipients generated successfully!\n"));
    } catch (error) {
        console.error(chalk.red(`? Error: ${error.message}\n`));
    }
}

/**
 * Fungsi untuk mengirim token dalam jumlah besar ke penerima di recipients.txt
 */
async function bulkSendTokens() {
    console.log(chalk.blue("\n?? Sending Tokens in Bulk...\n"));

    try {
        execSync("npx hardhat run scripts/bulk_send.cjs --network soenium", { stdio: "inherit" });
        console.log(chalk.green("\n? Bulk send berhasil dilakukan!\n"));
    } catch (error) {
        console.error(chalk.red(`? Error: ${error.message}\n`));
    }
}

/**
 * Fungsi untuk mendapatkan alamat wallet dari private key dan memformat tampilan
 */
function getWalletDisplay() {
    try {
        if (!process.env.PRIVATE_KEY) return "Belum dipilih";
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        return formatAddress(wallet.address);
    } catch (error) {
        return "Belum dipilih";
    }
}

/**
 * Fungsi utama untuk menampilkan menu CLI
 */
async function mainMenu() {
    while (true) {
        console.clear();
        dotenv.config(); // Refresh env setiap kali menu dibuka

        const currentWallet = getWalletDisplay();

        console.log(chalk.cyan("\n?? Welcome to the Soenium Token Management Tool ??"));
        console.log(chalk.yellow(`?? Current Wallet: ${currentWallet}\n`));

        const { action } = await inquirer.prompt([
            {
                type: "list",
                name: "action",
                message: "?? Select an action:",
                choices: [
                    "Choose Wallet",
                    "Create and Deploy Token",
                    "Generate Recipients",
                    "Bulk Send Tokens",
                    "Exit"
                ],
            },
        ]);

        switch (action) {
            case "Choose Wallet":
                await chooseWallet();
                break;
            case "Create and Deploy Token":
                await createAndDeployToken();
                break;
            case "Generate Recipients":
                await generateRecipients();
                break;
            case "Bulk Send Tokens":
                await bulkSendTokens();
                break;
            case "Exit":
                console.log(chalk.yellow("?? Exiting..."));
                process.exit(0);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// Jalankan menu utama
mainMenu();
