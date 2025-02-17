# 🚀 Create & Bulk Send Token - Soenium Network

Alat ini memungkinkan Anda untuk **membuat token ERC-20 secara otomatis** dan **mengirimnya dalam jumlah besar** ke banyak penerima di jaringan **Soenium**. Dengan fitur **pemilihan wallet dinamis**, Anda bisa mengganti wallet dengan mudah tanpa harus mengedit konfigurasi.

---

## **📌 Fitur**
✅ **Buat Token ERC-20 secara Otomatis**  
✅ **Bulk Send Token ke Banyak Wallet**  
✅ **Pilih Wallet & Token Secara Dinamis**  
✅ **Dukungan Penyimpanan Token yang Sudah Dideploy**  
✅ **CLI Interaktif & Mudah Digunakan**  

---

## **🔧 Persyaratan**
Pastikan Anda sudah menginstall:
- **Node.js** `>=18.x` ➜ [Download & Install](https://nodejs.org/)
- **Hardhat** (Development environment)
- **MetaMask Wallet** (Untuk mendapatkan Private Key)
- **Git** (Opsional, untuk cloning repository)

## **📥 Instalasi & Setup**
### **1️⃣ Clone Repository**

git clone https://github.com/username/create-and-bulk-send-network-soenium.git
cd create-and-bulk-send-network-soenium
2️⃣ Install Dependencies
npm install
3️⃣ Konfigurasi .env
Buat file .env dengan isi berikut:
# ✅ RPC URL untuk jaringan Soenium
RPC_URL=https://rpc.soneium.org
# ✅ Private key wallet yang dipilih untuk deploy & bulk send (akan diperbarui otomatis)
PRIVATE_KEY=
# ✅ File daftar wallet untuk create/send token
WALLETS_FILE=wallets.txt
# ✅ File daftar penerima token
RECIPIENTS_FILE=recipients.txt
📌 Catatan: Biarkan PRIVATE_KEY kosong, karena akan diatur otomatis saat memilih wallet dari menu.


🚀 Cara Menggunakan
Jalankan perintah berikut untuk memulai program:
node menu.js
1️⃣ Pilih Wallet
Pilih wallet dari wallets.txt yang ingin digunakan untuk deploy & transaksi token.
2️⃣ Buat & Deploy Token
Masukkan nama token, simbol token, dan total supply melalui menu interaktif.
Token akan otomatis terdaftar di deployed_tokens.json setelah berhasil dibuat.
3️⃣ Generate Daftar Penerima
Buat daftar alamat penerima secara otomatis untuk uji coba bulk send.
4️⃣ Bulk Send Token
Pilih token yang ingin dikirim, lalu tentukan jumlah token yang dikirim ke tiap penerima.
Proses transaksi akan berjalan otomatis dan menampilkan hash transaksi.


🔧 Customization
📌 Edit Token Details Secara Manual
Jika ingin mengubah token secara manual, edit file scripts/deploy.cjs:
const tokenName = "MyToken";
const tokenSymbol = "MTK";
const totalSupply = ethers.parseUnits("1000000", 18);
Namun, lebih disarankan menggunakan menu CLI untuk input data token.
