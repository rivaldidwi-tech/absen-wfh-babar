// CONFIG: Batas Koordinat Bangka Barat
const BB_BOUNDS = { latMin: -2.0833, latMax: -1.5000, lngMin: 105.0000, lngMax: 105.7500 };
let currentCoords = { lat: 0, lng: 0 };
let locationValid = false;

function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString('id-ID');
    document.getElementById('current-date').innerText = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    updateButtonStates(now);
}

function updateButtonStates(now) {
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = (hours * 60) + minutes;
    const isFriday = now.getDay() === 5;
    
    const btnPagi = document.getElementById('btn-pagi');
    const btnSore = document.getElementById('btn-sore');

    // Reset styles
    [btnPagi, btnSore].forEach(btn => {
        btn.disabled = true;
        btn.className = "bg-slate-200 text-slate-400 p-4 rounded-2xl font-bold transition-all";
    });

    if (!isFriday) return; // Matikan jika bukan Jumat

    // Logika Tombol Pagi (06:30 - 11:00)
    if (totalMinutes >= 390 && totalMinutes < 660) {
        setBtnActive(btnPagi, 'blue');
    }

    // Logika Tombol Sore (16:30 - 23:59)
    if (totalMinutes >= 990) {
        setBtnActive(btnSore, 'blue');
    }
}

function setBtnActive(el, color) {
    el.disabled = false;
    el.className = `bg-${color}-600 text-white p-4 rounded-2xl font-bold shadow-lg shadow-${color}-200 active:scale-95 transition-all`;
}

function checkLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(pos => {
            const { latitude, longitude, accuracy } = pos.coords;
            currentCoords = { lat: latitude, lng: longitude };
            const badge = document.getElementById('location-badge');

            if (accuracy > 150) {
                badge.innerText = "⚠️ Akurasi Rendah/Fake GPS";
                badge.className = "inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-[10px] font-bold text-red-600 uppercase tracking-widest";
                locationValid = false;
            } else if (latitude >= BB_BOUNDS.latMin && latitude <= BB_BOUNDS.latMax && longitude >= BB_BOUNDS.lngMin && longitude <= BB_BOUNDS.lngMax) {
                badge.innerText = "✅ Bangka Barat (Terverifikasi)";
                badge.className = "inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-[10px] font-bold text-green-600 uppercase tracking-widest";
                locationValid = true;
            } else {
                badge.innerText = "❌ Di Luar Wilayah Babar";
                badge.className = "inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-[10px] font-bold text-red-600 uppercase tracking-widest";
                locationValid = false;
            }
        }, null, { enableHighAccuracy: true });
    }
}

async function prosesAbsen(tipe) {
    const nama = document.getElementById('user-name').value;
    if (!nama) return alert("Silakan isi Nama Lengkap & Gelar!");
    if (!locationValid) return alert("Lokasi tidak valid atau di luar Bangka Barat!");

    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const totalMin = (h * 60) + m;
    let statusText = "TEPAT WAKTU";

    // Validasi Notifikasi sesuai permintaan
    if (tipe === 'Pagi') {
        if (totalMin < 390) return alert("Absen mulai jam 06.30 ya!");
        if (totalMin > 420) {
            statusText = "TERLAMBAT";
            alert("Anda Terlambat!");
        } else {
            alert("Tepat waktu, selamat bekerja!");
        }
    } else {
        if (totalMin < 990) return alert("Absen sore mulai jam 16.30 ya!");
        alert("Absen sore berhasil!");
    }

    // Persiapkan Kartu
    document.getElementById('card-name').innerText = nama;
    document.getElementById('card-time').innerText = now.toLocaleTimeString('id-ID');
    document.getElementById('card-status-badge').innerText = statusText;
    document.getElementById('card-status-badge').className = statusText === "TERLAMBAT" ? "px-3 py-1 bg-red-600 text-white text-[10px] font-bold rounded" : "px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded";
    document.getElementById('card-coords').innerText = `${currentCoords.lat.toFixed(5)}, ${currentCoords.lng.toFixed(5)}`;
    
    // Map Static (Yandex Maps API - Free & No Key)
    document.getElementById('card-map').src = `https://static-maps.yandex.ru/1.x/?lang=en-US&ll=${currentCoords.lng},${currentCoords.lat}&z=14&l=map&pt=${currentCoords.lng},${currentCoords.lat},pm2rdm`;

    // Tunggu gambar map load
    setTimeout(() => {
        html2canvas(document.querySelector("#share-card")).then(canvas => {
            const img = canvas.toDataURL("image/png");
            document.getElementById('image-placeholder').innerHTML = `<img src="${img}" class="w-full h-auto rounded-lg">`;
            document.getElementById('result-modal').style.display = 'flex';
        });
    }, 1000);
}

setInterval(updateClock, 1000);
window.onload = checkLocation;

// Register Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
