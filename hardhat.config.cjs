require("@nomicfoundation/hardhat-toolbox");

module.exports = {
    solidity: "0.8.20",
    networks: {
        soenium: {
            url: process.env.RPC_URL,
            accounts: [process.env.PRIVATE_KEY],
        },
    },
};
