const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n========================================================");
  console.log("             MEMBACA DATA ON-CHAIN BLOCKCHAIN           ");
  console.log("========================================================\n");

  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  
  // 1. Baca ABI dari PovertyCheck.json
  const artifactPath = path.join(__dirname, "PovertyCheck.sol", "PovertyCheck.json");
  if (!fs.existsSync(artifactPath)) {
    console.error("Error: File PovertyCheck.json tidak ditemukan di " + artifactPath);
    process.exit(1);
  }
  
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  
  // 2. Hubungkan ke kontrak di network localhost
  const povertyCheck = await hre.ethers.getContractAt(artifact.abi, contractAddress);
  
  console.log(`Mengakses Kontrak di Alamat: ${contractAddress}\n`);
  
  // 3. Baca variabel dasar
  try {
    const admin = await povertyCheck.admin();
    console.log(`> Alamat Admin Kontrak : ${admin}`);
  } catch (err) {
    console.log(`> Gagal membaca Admin: ${err.message}`);
  }

  try {
    const zkVerifier = await povertyCheck.zkVerifierAddress();
    console.log(`> Alamat ZK Verifier    : ${zkVerifier}`);
  } catch (err) {
    console.log(`> Gagal membaca ZK Verifier: ${err.message}`);
  }
  
  console.log("\n--------------------------------------------------------");
  console.log("      DAFTAR USER YANG TERVERIFIKASI ZKP (EVENTS)       ");
  console.log("--------------------------------------------------------");
  
  try {
    // 4. Query filter events
    const filter = povertyCheck.filters.StatusVerified();
    const events = await povertyCheck.queryFilter(filter, 0, "latest");
    
    if (events.length === 0) {
      console.log("Belum ada data verifikasi ZKP yang masuk (0 events ditemukan).");
    } else {
      console.log(`Ditemukan ${events.length} data verifikasi:\n`);
      events.forEach((e, idx) => {
        console.log(`[Verifikasi #${idx + 1}]`);
        console.log(`- Alamat User     : ${e.args.user}`);
        console.log(`- Status Valid    : ${e.args.isValid ? "YA (LAYAK)" : "TIDAK LAYAK"}`);
        console.log(`- Blok Ke-        : ${e.blockNumber}`);
        console.log(`- Tx Hash         : ${e.transactionHash}`);
        console.log("--------------------------------------------------------");
      });
    }
  } catch (err) {
    console.log(`Gagal membaca log event: ${err.message}`);
  }

  console.log("\n========================================================");
  console.log("                  BACA DATA SELESAI                     ");
  console.log("========================================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
