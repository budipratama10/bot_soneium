import fs from "fs";
import { Wallet } from "ethers";
import chalk from "chalk";

const RECIPIENTS_FILE = "recipients.txt";
const count = process.argv[2];

if (!count || isNaN(count) || count <= 0) {
    console.log(chalk.red("? Masukkan jumlah penerima yang valid!"));
    process.exit(1);
}

console.log(chalk.blue(`?? Generating ${count} recipient addresses...`));

let recipients = [];
for (let i = 0; i < count; i++) {
    const wallet = Wallet.createRandom();
    recipients.push(wallet.address);
}

fs.writeFileSync(RECIPIENTS_FILE, recipients.join("\n") + "\n", { flag: "a" });

console.log(chalk.green(`? ${count} recipient addresses saved to ${RECIPIENTS_FILE}\n`));
