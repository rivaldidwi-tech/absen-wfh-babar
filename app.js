// Koordinat Bounding Box Bangka Barat (Perkiraan)
const BB_BOUNDS = {
    latMin: -2.0833, // Batas Selatan (dekat Tempilang)
    latMax: -1.5000, // Batas Utara (Parittiga/Jebus)
    lngMin: 105.0000, // Batas Barat (Mentok)
    lngMax: 105.7500  // Batas Timur (Simpang Teritip/Kelapa)
};

function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString('id-ID');
}
setInterval(updateClock, 1000);

function checkLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error, {
            enableHighAccuracy: true // WAJIB untuk meminimalisir Fake GPS
        });
    }
}

function success(position) {
    const { latitude, longitude, accuracy } = position.coords;
    const statusEl = document.getElementById('location-status');

    // 1. Cek Akurasi (Fake GPS biasanya punya akurasi terlalu sempurna/ngaco)
    if (accuracy < 1) { 
        statusEl.innerText = "⚠️ Fake GPS terdeteksi!";
        return;
    }

    // 2. Cek Geofencing
    if (latitude >= BB_BOUNDS.latMin && latitude <= BB_BOUNDS.latMax &&
        longitude >= BB_BOUNDS.lngMin && longitude <= BB_BOUNDS.lngMax) {
        statusEl.innerText = "📍 Lokasi Terverifikasi (Bangka Barat)";
        statusEl.className = "text-xs text-green-500";
    } else {
        statusEl.innerText = "❌ Anda di luar Bangka Barat!";
    }
}

function error() {
    alert("Izin lokasi ditolak. Gagal absen.");
}

// Jalankan cek lokasi saat app dibuka
window.onload = checkLocation;

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}