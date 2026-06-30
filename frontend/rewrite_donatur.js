const fs = require('fs');
const file = 'c:/Users/ELITEBOOK/Documents/philantrophy-project/frontend/src/pages/donatur.jsx';
let code = fs.readFileSync(file, 'utf8');

// Replace technical terms with simple ones
code = code.replace(/smart contract/gi, 'sistem otomatis');
code = code.replace(/Smart Contract/gi, 'Sistem Otomatis');
code = code.replace(/blockchain/gi, 'sistem transparan');
code = code.replace(/Blockchain/gi, 'Sistem Transparan');
code = code.replace(/txHash/g, 'ID Trx');
code = code.replace(/Tx:/g, 'ID Trx:');

// Replace ETH with Rupiah
code = code.replace(/0\.20 ETH/g, 'Rp 50.000');
code = code.replace(/\$\{donateAmount\} ETH/g, 'Rp \');
code = code.replace(/\{userBalance\} ETH/g, 'Rp {userBalance}');
code = code.replace(/Nominal Donasi \(ETH\)/g, 'Nominal Donasi (Rp)');
code = code.replace(/\{donateAmount\}\s*ETH/g, 'Rp {donateAmount}');
code = code.replace(/0\.1 ETH/g, 'Rp 100.000');
code = code.replace(/1\.24/g, '1.240.000'); // userBalance
code = code.replace(/placeholder="0\.05"/g, 'placeholder="50000"');
code = code.replace(/Ξ/g, 'Rp');

fs.writeFileSync(file, code);
console.log("donatur.jsx text simplified");
