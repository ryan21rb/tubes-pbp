const hre = require("hardhat");

async function main() {
    const signers = await hre.ethers.getSigners();
    const admin = signers[0];

    const addresses = [
        "0x5a584e7d505ac812e6b095f6f5885884d2615aab", // Dinsos
        "0x6bbbf41d0decdc96bd44c14b953b31b9e9ae37bb", // Disdik
        "0xab2bd36fa71777a23f87399212b782a96ee1256b", // BPBD
        "0xfa411cb3f7fbf067ba20881662dd70c01ca4fe16", // Dinkes
        "0x507610fdf65637c1752657664dfea2865e589b88", // Yayasan
    ];

    const parseEther = hre.ethers.parseEther || hre.ethers.utils.parseEther;

    for (const address of addresses) {
        try {
            const tx = await admin.sendTransaction({
                to: address,
                value: parseEther("100.0")
            });
            await tx.wait();
            console.log(`Successfully sent 100 ETH to ${address}`);
        } catch (e) {
            console.error(`Failed to send to ${address}:`, e.message);
        }
    }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
