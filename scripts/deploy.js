const hre = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("\n=== Memulai Proses Deployment Kontrak Kelompok ===");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Men-deploy kontrak menggunakan akun:", deployer.address);

  // 1. Load and deploy Groth16Verifier
  console.log("\nMembaca artefak Groth16Verifier...");
  const verifierArtifactPath = path.join(__dirname, "../verifier.sol/Groth16Verifier.json");
  const verifierArtifact = JSON.parse(fs.readFileSync(verifierArtifactPath, "utf8"));

  console.log("Sedang men-deploy Groth16Verifier...");
  const VerifierFactory = new hre.ethers.ContractFactory(
    verifierArtifact.abi,
    verifierArtifact.bytecode,
    deployer
  );
  const verifier = await VerifierFactory.deploy();
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log("[SUKSES] Verifier ZKP sukses di-deploy ke:", verifierAddress);

  // 2. Load and deploy PovertyCheck
  console.log("\nMembaca artefak PovertyCheck...");
  const povertyCheckArtifactPath = path.join(__dirname, "../PovertyCheck.sol/PovertyCheck.json");
  const povertyCheckArtifact = JSON.parse(fs.readFileSync(povertyCheckArtifactPath, "utf8"));

  console.log("Sedang men-deploy PovertyCheck...");
  const PovertyCheckFactory = new hre.ethers.ContractFactory(
    povertyCheckArtifact.abi,
    povertyCheckArtifact.bytecode,
    deployer
  );
  const povertyCheck = await PovertyCheckFactory.deploy(verifierAddress);
  await povertyCheck.waitForDeployment();
  const povertyCheckAddress = await povertyCheck.getAddress();
  console.log("[SUKSES] Kontrak Utama PovertyCheck sukses di-deploy ke:", povertyCheckAddress);

  console.log("\n=== Semua Kontrak Berhasil Terpasang! ===");
  console.log("Alamat Kontrak Utama Anda:", povertyCheckAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
