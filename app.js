// CONFIG: Batas Wilayah Bangka Barat
const BB_BOUNDS = { latMin: -2.0833, latMax: -1.5000, lngMin: 105.0000, lngMax: 105.7500 };
let currentCoords = { lat: 0, lng: 0 };
let locationValid = false;
let globalBlob = null;

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
    const isFriday = now.getDay() === 5; // Angka 5 adalah hari Jumat
    
    const btnPagi = document.getElementById('btn-pagi');
    const btnSore = document.getElementById('btn-sore');

    // Default: Matikan tombol
    [btnPagi, btnSore].forEach(btn => {
        btn.disabled = true;
        btn.className = "bg-slate-200 text-slate-400 p-5 rounded-[1.5rem] font-black uppercase tracking-wider cursor-not-allowed";
    });

    // JIKA BUKAN HARI JUMAT, BERHENTI DI SINI
    if (!isFriday) return;

    // Logika Tombol Pagi (Aktif dari jam 00:00 sampai 11:00 agar bisa diklik untuk cek notif)
    if (totalMinutes < 660) { 
        setBtnActive(btnPagi, 'blue');
    }

    // Logika Tombol Sore (Aktif dari jam 12:00 sampai 23:59)
    if (totalMinutes >= 720) {
        setBtnActive(btnSore, 'blue');
    }
}

function setBtnActive(el, color) {
    el.disabled = false;
    el.className = `bg-${color}-600 text-white p-5 rounded-[1.5rem] font-black uppercase tracking-wider shadow-lg shadow-${color}-200 active:scale-95 transition-all cursor-pointer`;
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
            badge.innerText = "❌ GPS Tidak Aktif";
            locationValid = false;
        }, { enableHighAccuracy: true });
    }
}

async function prosesAbsen(tipe) {
    const nama = document.getElementById('user-name').value;
    if (!nama) return alert("Silakan masukkan Nama Lengkap & Gelar!");
    if (!locationValid) return alert("Absen gagal. Lokasi GPS Anda belum valid atau di luar Bangka Barat!");

    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const totalMin = (h * 60) + m;
    let statusText = "TEPAT WAKTU";

    // VALIDASI WAKTU SESUAI INSTRUKSI
    if (tipe === 'Pagi') {
        if (totalMin < 390) { // Sebelum 06:30
            return alert("Absensi WFH Pagi dimulai pukul 06.30 WIB.");
        }
        if (totalMin >= 421) { // Mulai 07:01 (7*60 + 1)
            statusText = "TERLAMBAT";
            alert("Anda Terlambat!");
        } else {
            alert("Tepat waktu, selamat bekerja!");
        }
    } else { // Absen Sore
        if (totalMin < 990) { // Sebelum 16:30
            return alert("Absensi WFH Sore dimulai pukul 16.30 WIB.");
        }
        alert("Absensi sore berhasil!");
    }

    // TAMPILKAN LOADING OVERLAY
    const loading = document.getElementById('loading-overlay');
    if (loading) {
        loading.classList.remove('hidden');
        loading.classList.add('flex');
    }

    // Set Data ke Kartu Share
    document.getElementById('card-name').innerText = nama;
    document.getElementById('card-time').innerText = now.toLocaleTimeString('id-ID', {hour12: false});
    document.getElementById('card-status-badge').innerText = statusText;
    document.getElementById('card-status-badge').className = statusText === "TERLAMBAT" ? "px-4 py-1.5 bg-red-600 text-white text-[11px] font-black rounded-lg uppercase" : "px-4 py-1.5 bg-blue-700 text-white text-[11px] font-black rounded-lg uppercase";
    document.getElementById('card-coords').innerText = `${currentCoords.lat.toFixed(6)}, ${currentCoords.lng.toFixed(6)}`;
    
    // Load Gambar Peta
    const mapImg = document.getElementById('card-map');
    mapImg.src = `https://static-maps.yandex.ru/1.x/?lang=en-US&ll=${currentCoords.lng},${currentCoords.lat}&z=14&l=map&pt=${currentCoords.lng},${currentCoords.lat},pm2rdm`;

    // Proses Screenshot Kartu
    mapImg.onload = function() {
        setTimeout(() => {
            html2canvas(document.querySelector("#share-card"), { 
                useCORS: true, 
                scale: 2,
                allowTaint: false
            }).then(canvas => {
                const imgData = canvas.toDataURL("image/png");
                document.getElementById('image-placeholder').innerHTML = `<img src="${imgData}" class="w-full h-auto rounded-xl">`;
                
                // Sembunyikan Loading, Tampilkan Modal Hasil
                if (loading) {
                    loading.classList.add('hidden');
                    loading.classList.remove('flex');
                }
                document.getElementById('result-modal').classList.remove('hidden');
                document.getElementById('result-modal').classList.add('flex');

                canvas.toBlob(blob => {
                    globalBlob = new File([blob], "bukti-absen.png", { type: "image/png" });
                });
            });
        }, 1200); 
    };
}

// Logika Tombol Share Native
const btnShare = document.getElementById('btn-share-native');
if (btnShare) {
    btnShare.onclick = async () => {
        if (navigator.share && globalBlob) {
            try {
                await navigator.share({
                    files: [globalBlob],
                    title: 'Bukti Absen WFH',
                    text: `Absensi WFH Diskominfo Babar - ${new Date().toLocaleDateString('id-ID')}`
                });
            } catch (err) {
                console.log("Share dibatalkan");
            }
        } else {
            alert("Gunakan fitur 'Simpan Gambar' dengan menekan lama pada gambar.");
        }
    };
}

setInterval(updateClock, 1000);
window.onload = checkLocation;

// Service Worker (Offline Mode)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
