const hre = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying MockVerifier menggunakan akun:", deployer.address);

  const MockVerifier = await hre.ethers.getContractFactory("MockVerifier");
  const mockVerifier = await MockVerifier.deploy();
  await mockVerifier.waitForDeployment();
  const mockVerifierAddress = await mockVerifier.getAddress();
  console.log("MockVerifier sukses di-deploy ke:", mockVerifierAddress);

  const povertyCheckAddress = "0x8b1B398b9c49AFE6394aaE438f6F2E8039120253";
  
  // Ambil ABI PovertyCheck
  const artifactPath = path.join(__dirname, "../PovertyCheck.sol/PovertyCheck.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  
  const povertyCheck = await hre.ethers.getContractAt(artifact.abi, povertyCheckAddress);

  console.log("Mengubah verifikator PovertyCheck ke MockVerifier...");
  const tx = await povertyCheck.updateVerifier(mockVerifierAddress);
  await tx.wait();
  console.log("Selesai! PovertyCheck sekarang menggunakan MockVerifier.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
