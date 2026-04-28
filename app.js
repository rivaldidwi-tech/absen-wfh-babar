const BB_BOUNDS = { latMin: -2.0833, latMax: -1.5000, lngMin: 105.0000, lngMax: 105.7500 };
let currentCoords = { lat: 0, lng: 0 };
let locationValid = false;
let globalBlob = null; // Untuk keperluan share file

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

    [btnPagi, btnSore].forEach(btn => {
        btn.disabled = true;
        btn.className = "bg-slate-200 text-slate-400 p-5 rounded-[1.5rem] font-black uppercase tracking-wider";
    });

    if (totalMinutes >= 390 && totalMinutes < 660) setBtnActive(btnPagi, 'blue');
    if (totalMinutes >= 990) setBtnActive(btnSore, 'blue');
}

function setBtnActive(el, color) {
    el.disabled = false;
    el.className = `bg-${color}-600 text-white p-5 rounded-[1.5rem] font-black uppercase tracking-wider shadow-lg shadow-${color}-200 active:scale-95 transition-all`;
}

function checkLocation() {
    const badge = document.getElementById('location-badge');
    badge.innerText = "🔄 Memperbarui GPS...";
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const { latitude, longitude, accuracy } = pos.coords;
            currentCoords = { lat: latitude, lng: longitude };

            if (accuracy > 100) {
                badge.innerText = "⚠️ Akurasi Lemah";
                badge.className = "inline-flex items-center px-4 py-2 rounded-full bg-red-100 text-[11px] font-black text-red-600 uppercase tracking-widest";
                locationValid = false;
            } else if (latitude >= BB_BOUNDS.latMin && latitude <= BB_BOUNDS.latMax && longitude >= BB_BOUNDS.lngMin && longitude <= BB_BOUNDS.lngMax) {
                badge.innerText = "✅ Bangka Barat (OK)";
                badge.className = "inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-[11px] font-black text-green-600 uppercase tracking-widest";
                locationValid = true;
            } else {
                badge.innerText = "❌ Di Luar Wilayah";
                badge.className = "inline-flex items-center px-4 py-2 rounded-full bg-red-100 text-[11px] font-black text-red-600 uppercase tracking-widest";
                locationValid = false;
            }
        }, err => {
            badge.innerText = "❌ GPS Off";
            locationValid = false;
        }, { enableHighAccuracy: true });
    }
}

async function prosesAbsen(tipe) {
    const nama = document.getElementById('user-name').value;
    if (!nama) return alert("Isi Nama & Gelar dulu!");
    if (!locationValid) return alert("GPS belum valid atau Anda di luar Bangka Barat!");

    const now = new Date();
    const totalMin = (now.getHours() * 60) + now.getMinutes();
    let statusText = "TEPAT WAKTU";

    if (tipe === 'Pagi') {
        if (totalMin < 390) return alert("Absen mulai 06.30!");
        if (totalMin > 420) { statusText = "TERLAMBAT"; alert("Anda Terlambat!"); }
        else alert("Tepat waktu, selamat bekerja!");
    } else {
        if (totalMin < 990) return alert("Absen sore mulai 16.30!");
        alert("Absen sore berhasil!");
    }

    // Set Data Kartu
    document.getElementById('card-name').innerText = nama;
    document.getElementById('card-time').innerText = now.toLocaleTimeString('id-ID', {hour12: false});
    document.getElementById('card-status-badge').innerText = statusText;
    document.getElementById('card-status-badge').className = statusText === "TERLAMBAT" ? "px-4 py-1.5 bg-red-600 text-white text-[11px] font-black rounded-lg" : "px-4 py-1.5 bg-blue-700 text-white text-[11px] font-black rounded-lg";
    document.getElementById('card-coords').innerText = `${currentCoords.lat.toFixed(6)}, ${currentCoords.lng.toFixed(6)}`;
    
    // FIX MAPS: Gunakan URL Static Maps yang support CORS
    const mapImg = document.getElementById('card-map');
    mapImg.src = `https://static-maps.yandex.ru/1.x/?lang=en-US&ll=${currentCoords.lng},${currentCoords.lat}&z=14&l=map&pt=${currentCoords.lng},${currentCoords.lat},pm2rdm`;

    // Tunggu gambar map terisi penuh sebelum screenshot
    mapImg.onload = function() {
        setTimeout(() => {
            html2canvas(document.querySelector("#share-card"), { 
                useCORS: true, // PENTING agar gambar maps tidak hilang
                scale: 2,
                allowTaint: false
            }).then(canvas => {
                const imgData = canvas.toDataURL("image/png");
                document.getElementById('image-placeholder').innerHTML = `<img src="${imgData}" class="w-full h-auto">`;
                document.getElementById('result-modal').classList.remove('hidden');
                document.getElementById('result-modal').classList.add('flex');

                // Siapkan file untuk native share
                canvas.toBlob(blob => {
                    globalBlob = new File([blob], "bukti-absen.png", { type: "image/png" });
                });
            });
        }, 500);
    };
}

// Fungsi Share Native HP
document.getElementById('btn-share-native').onclick = async () => {
    if (navigator.share && globalBlob) {
        try {
            await navigator.share({
                files: [globalBlob],
                title: 'Bukti Absen WFH',
                text: 'Absensi Diskominfo Bangka Barat'
            });
        } catch (err) {
            console.log("Share batal");
        }
    } else {
        alert("Gunakan fitur Simpan Gambar (tekan lama gambar)");
    }
};

setInterval(updateClock, 1000);
window.onload = checkLocation;
