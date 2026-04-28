const BB_BOUNDS = { latMin: -2.0833, latMax: -1.5000, lngMin: 105.0000, lngMax: 105.7500 };
let currentCoords = { lat: 0, lng: 0 };
let locationValid = false;

function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString('id-ID', {hour12: false});
    document.getElementById('current-date').innerText = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    updateButtonStates(now);
}

function updateButtonStates(now) {
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = (hours * 60) + minutes;
    
    const btnPagi = document.getElementById('btn-pagi');
    const btnSore = document.getElementById('btn-sore');

    // Reset style tombol
    [btnPagi, btnSore].forEach(btn => {
        btn.disabled = true;
        btn.className = "bg-slate-200 text-slate-400 p-5 rounded-[1.5rem] font-black uppercase tracking-wider";
    });

    // Pagi: Mulai 06:30
    if (totalMinutes >= 390 && totalMinutes < 660) { // Sampai jam 11 siang
        setBtnActive(btnPagi, 'blue');
    }

    // Sore: Mulai 16:30 - 23:59
    if (totalMinutes >= 990) {
        setBtnActive(btnSore, 'blue');
    }
}

function setBtnActive(el, color) {
    el.disabled = false;
    el.className = `bg-${color}-600 text-white p-5 rounded-[1.5rem] font-black uppercase tracking-wider shadow-lg shadow-${color}-200 active:scale-95 transition-all`;
}

function checkLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(pos => {
            const { latitude, longitude, accuracy } = pos.coords;
            currentCoords = { lat: latitude, lng: longitude };
            const badge = document.getElementById('location-badge');

            if (accuracy > 100) {
                badge.innerText = "⚠️ Akurasi Lemah / Fake GPS";
                badge.className = "inline-flex items-center px-4 py-2 rounded-full bg-red-100 text-[11px] font-black text-red-600 uppercase tracking-widest";
                locationValid = false;
            } else if (latitude >= BB_BOUNDS.latMin && latitude <= BB_BOUNDS.latMax && longitude >= BB_BOUNDS.lngMin && longitude <= BB_BOUNDS.lngMax) {
                badge.innerText = "✅ Bangka Barat (Terverifikasi)";
                badge.className = "inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-[11px] font-black text-green-600 uppercase tracking-widest";
                locationValid = true;
            } else {
                badge.innerText = "❌ Di Luar Bangka Barat";
                badge.className = "inline-flex items-center px-4 py-2 rounded-full bg-red-100 text-[11px] font-black text-red-600 uppercase tracking-widest";
                locationValid = false;
            }
        }, null, { enableHighAccuracy: true });
    }
}

async function prosesAbsen(tipe) {
    const nama = document.getElementById('user-name').value;
    if (!nama) return alert("Silakan masukkan Nama Lengkap & Gelar terlebih dahulu!");
    if (!locationValid) return alert("Absen gagal. Anda harus berada di wilayah Bangka Barat!");

    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const totalMin = (h * 60) + m;
    let statusText = "TEPAT WAKTU";

    if (tipe === 'Pagi') {
        if (totalMin < 390) return alert("Absensi pagi belum dimulai. Silakan tunggu pukul 06.30.");
        if (totalMin > 420) { // Lewat jam 07.00
            statusText = "TERLAMBAT";
            alert("Anda Terlambat!");
        } else {
            alert("Tepat waktu, selamat bekerja!");
        }
    } else {
        if (totalMin < 990) return alert("Absensi sore belum dimulai. Silakan tunggu pukul 16.30.");
        alert("Absen sore berhasil disimpan!");
    }

    // Isi Data Kartu
    document.getElementById('card-name').innerText = nama;
    document.getElementById('card-time').innerText = now.toLocaleTimeString('id-ID', {hour12: false});
    document.getElementById('card-status-badge').innerText = statusText;
    document.getElementById('card-status-badge').className = statusText === "TERLAMBAT" ? "px-4 py-1.5 bg-red-600 text-white text-[11px] font-black rounded-lg" : "px-4 py-1.5 bg-blue-700 text-white text-[11px] font-black rounded-lg";
    document.getElementById('card-coords').innerText = `${currentCoords.lat.toFixed(6)}, ${currentCoords.lng.toFixed(6)}`;
    
    // Minimap (Yandex Static)
    document.getElementById('card-map').src = `https://static-maps.yandex.ru/1.x/?lang=en-US&ll=${currentCoords.lng},${currentCoords.lat}&z=14&l=map&pt=${currentCoords.lng},${currentCoords.lat},pm2rdm`;

    // Generate Gambar
    setTimeout(() => {
        html2canvas(document.querySelector("#share-card"), { scale: 2 }).then(canvas => {
            const img = canvas.toDataURL("image/png");
            document.getElementById('image-placeholder').innerHTML = `<img src="${img}" class="w-full h-auto">`;
            document.getElementById('result-modal').style.display = 'flex';
        });
    }, 1200);
}

setInterval(updateClock, 1000);
window.onload = checkLocation;

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
