import fs from "fs";

/**
 * Membaca file dan mengembalikan array dari setiap baris
 * @param {string} filePath - Path file yang akan dibaca
 * @returns {string[]} - Array berisi baris dari file
 */
export function readLinesFromFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return fs.readFileSync(filePath, "utf8").trim().split("\n").filter(Boolean);
}

/**
 * Menyimpan daftar ke file
 * @param {string} filePath - Path file yang akan ditulis
 * @param {string[]} data - Data yang akan disimpan
 */
export function writeLinesToFile(filePath, data) {
  fs.writeFileSync(filePath, data.join("\n"));
}

/**
 * Validasi apakah private key sesuai format
 * @param {string} privateKey - Private key yang akan divalidasi
 * @returns {boolean} - True jika valid
 */
export function isValidPrivateKey(privateKey) {
  return /^0x[a-fA-F0-9]{64}$/.test(privateKey);
}
