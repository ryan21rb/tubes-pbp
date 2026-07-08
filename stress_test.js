// stress_test.js
const autocannon = require('autocannon');

function startStressTest() {
  console.log('Memulai Stress Test murni pada API Backend PhilanthropyChain...');

  const instance = autocannon({
    url: 'http://127.0.0.1:8000', // Pakai IP lokal utama yang stabil
    connections: 30,              // Naikkan ke 30 user agar antrean request-nya padat
    duration: 30,                 // Naikkan durasi ke 30 detik biar Autocannon punya waktu ngumpulin sampel statistik
    pipelining: 2,                // Kirim 2 request sekaligus biar ngebut mendobrak angka 0
    timeout: 15,
    title: 'PhilanthropyChain Full-System Scan',

    // LANGSUNG TEMBAK PATH API YANG MENGHASILKAN DATA
    requests: [
      {
        method: 'GET',
        path: '/api/v1/public/stats' // Skenario 1: Ambil data statistik donasi
      },
      {
        method: 'GET',
        path: '/api/v1/campaigns'    // Skenario 2: Ambil daftar program donasi
      }
    ]
  }, (err, result) => {
    if (err) {
      console.error('Error saat menjalankan stress test:', err);
    } else {
      console.log('\n======================================================');
      console.log('            HASIL PENYELIDIKAN STRESS TEST            ');
      console.log('======================================================');
      console.log(`Nama Pengujian      : ${result.title}`);
      console.log(`Durasi Pengujian    : ${result.duration} detik`);
      console.log(`Koneksi Paralel     : ${result.connections} virtual users`);
      console.log(`Total Request Terkirim: ${result.requests.sent} requests`);
      console.log(`Rata-rata Req/Sec   : ${result.requests.average} req/s`);
      console.log(`Rata-rata Latency   : ${result.latency.average} ms`);
      console.log(`Latency Maksimal    : ${result.latency.max} ms`);
      console.log(`Bytes/Sec           : ${result.throughput.average} bytes/s`);
      console.log(`Error (Server/TCP)  : ${result.errors}`);
      console.log(`Request Timeout     : ${result.timeouts}`);
      console.log('======================================================\n');
    }
  });

  autocannon.track(instance, { renderProgressBar: true });
}

startStressTest();