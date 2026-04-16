// ============ FUNGSI UTILITAS ============
function escapeHtml(text) {
    if (!text) return text;
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatRupiah(angka) {
    return 'Rp ' + parseInt(angka).toLocaleString('id-ID');
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        Swal.fire({
            icon: 'success',
            title: 'Berhasil Disalin!',
            text: 'Data berhasil disalin ke clipboard.',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
    }).catch(() => {
        Swal.fire('Gagal', 'Tidak bisa menyalin teks.', 'error');
    });
}

function copySubdomainData(domain, node, ip) {
    const textToCopy = `DATA SUBDOMAIN\n\n🌐 Main: ${domain}\n📡 Node: ${node}\n🔗 IP: ${ip}`;
    copyToClipboard(textToCopy);
}

function timeAgo(dateParam) {
    if (!dateParam) return "";
    const date = new Date(dateParam);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = seconds / 31536000;
    if (interval >= 1) return Math.floor(interval) + " tahun lalu";

    interval = seconds / 2592000;
    if (interval >= 1) return Math.floor(interval) + " bulan lalu";

    interval = seconds / 604800;
    if (interval >= 1) return Math.floor(interval) + " minggu lalu";

    interval = seconds / 86400;
    if (interval >= 1) return Math.floor(interval) + " hari lalu";

    interval = seconds / 3600;
    if (interval >= 1) return Math.floor(interval) + " jam lalu";

    interval = seconds / 60;
    if (interval >= 1) return Math.floor(interval) + " menit lalu";

    if (seconds < 10) return "Baru saja";
    return Math.floor(seconds) + " detik lalu";
}

function convertToLink(text) {
    if (!text) return '';
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(?:com|net|org|id|co\.id|my\.id|web\.id|xyz|biz|info|me)[^\s]*)/gi;
    return text.replace(urlRegex, function(url) {
        let href = url;
        if (!/^https?:\/\//i.test(url)) {
            href = 'https://' + url;
        }
        return `<a href="${href}" target="_blank" style="color: #2196F3; text-decoration: underline; font-weight: bold;">${url}</a>`;
    });
}

const uploadDeline = async (blob) => {
    if (!blob) return null;
    const fd = new FormData();
    fd.append("file", blob, "image.jpg");
    try {
        const res = await axios.post("https://api.deline.web.id/uploader", fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        const data = res.data || {};
        if (data.status === false) throw new Error(data.message || "Upload failed");
        const link = data?.result?.link || data?.url || data?.path;
        if (!link) throw new Error("Invalid response");
        return link;
    } catch (error) {
        console.error(error);
        return null;
    }
};

// ============ VARIABEL GLOBAL ============
const API_URL = "";
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const helpModal = document.getElementById('helpModal');
const caraBeliModal = document.getElementById('caraBeliModal');
const keuntunganModal = document.getElementById('keuntunganModal');
const confirmModal = document.getElementById('confirmModalOverlay');
const modalDeposit = document.getElementById('modalDeposit');
const customAlertModal = document.getElementById('customAlertModal');
const invoiceModal = document.getElementById('invoiceModal');
const dateFilterModal = document.getElementById('dateFilterModal');
const panelPopupModal = document.getElementById('panelPopupModal');
const bottomNav = document.getElementById('bottomNav');
const productGrid = document.getElementById('productGrid');
const cropModal = document.getElementById('cropModal');
const imageToCrop = document.getElementById('imageToCrop');

let cropper = null;
let currentCropType = null;
let pendingProfileBlob = null;
let pendingBannerBlob = null;
let myChart = null;

let scripts = [];
let selectedScriptCode = null;
let selectedScriptPrice = 0;
let selectedScriptData = null;
let selectedMethodScript = null;

let muridPackages = [];
let selectedMuridCode = null;
let selectedMuridPrice = 0;
let selectedMuridData = null;
let selectedMethodMurid = null;

let vpsList = [];
let selectedVPSCode = null;
let selectedVPSPrice = 0;
let selectedVPSData = null;
let selectedMethodVPS = null;

let appsList = [];
let selectedAppCode = null;
let selectedAppPrice = 0;
let selectedAppData = null;
let selectedMethodApps = null;

let sosmedServices = [];
let selectedSosmedService = null;
let selectedMethodSosmed = null;
let sosmedCategories = [];

let cfZones = [];
let selectedZone = null;
let selectedMethodSub = null;

let allTransactions = [];
let products = [];
let selectedProductCode = null;
let selectedPrice = 0;
let selectedMethod = null;
let globalBalance = 0;
let isBalanceHidden = localStorage.getItem('isBalanceHidden') === 'true';
let isInfoMenuOpened = false;
let latestActivityId = localStorage.getItem('latestActivityId') || "";
let lastReadActivityId = localStorage.getItem('lastReadActivityId') || "";
let activityData = [];

let secretTapCount = 0;
let secretTapTimer = null;

// Game
let gameProducts = [];
let selectedGameCode = null;
let selectedGamePrice = 0;
let selectedGameData = null;
let selectedMethodGame = null;
let checkedGameUser = null;

// E-Wallet DANA
let ewalletProducts = [];
let selectedEwalletCode = null;
let selectedEwalletPrice = 0;
let selectedEwalletData = null;
let selectedMethodEwallet = null;
let checkedEwalletUser = null;

// GoPay Driver
let ewalletProductsGD = [];
let selectedEwalletCodeGD = null;
let selectedEwalletPriceGD = 0;
let selectedEwalletDataGD = null;
let selectedMethodEwalletGD = null;
let checkedEwalletUserGD = null;

// GoPay Customer
let ewalletProductsGopay = [];
let selectedEwalletCodeGopay = null;
let selectedEwalletPriceGopay = 0;
let selectedEwalletDataGopay = null;
let selectedMethodEwalletGopay = null;
let checkedEwalletUserGopay = null;

// OVO
let ovoProducts = [];
let selectedOvoCode = null;
let selectedOvoPrice = 0;
let selectedOvoData = null;
let selectedMethodOvo = null;
let checkedOvoUser = null;

// ShopeePay
let shopeeProducts = [];
let selectedShopeeCode = null;
let selectedShopeePrice = 0;
let selectedShopeeData = null;
let selectedMethodShopee = null;
let checkedShopeeUser = null;

// LinkAja
let linkajaProducts = [];
let selectedLinkajaCode = null;
let selectedLinkajaPrice = 0;
let selectedLinkajaData = null;
let selectedMethodLinkaja = null;
let checkedLinkajaUser = null;

// Astrapay
let astrapayProducts = [];
let selectedAstrapayCode = null;
let selectedAstrapayPrice = 0;
let selectedAstrapayData = null;
let selectedMethodAstrapay = null;
let checkedAstrapayUser = null;

// iSaku
let isakuProducts = [];
let selectedIsakuCode = null;
let selectedIsakuPrice = 0;
let selectedIsakuData = null;
let selectedMethodIsaku = null;
let checkedIsakuUser = null;

// Kaspro
let kasproProducts = [];
let selectedKasproCode = null;
let selectedKasproPrice = 0;
let selectedKasproData = null;
let selectedMethodKaspro = null;
let checkedKasproUser = null;

// Nokos
let nokosNegaraList = [];
let nokosOperatorList = [];
let nokosLayananList = [];
let selectedNegara = null;
let selectedOperator = null;
let selectedLayanan = null;
let selectedNokosMethod = null;

// ============ PROMO GLOBAL ============
let appliedPromo = {
    panel: null,
    script: null,
    murid: null,
    vps: null,
    apps: null,
    sosmed: null,
    subdomain: null,
    nokos: null,
    game: null,
    ewallet: null,
    'ewallet-gd': null,
    'ewallet-gopay': null,
    'ewallet-ovo': null,
    'ewallet-shopee': null,
    'ewallet-linkaja': null,
    'ewallet-astrapay': null,
    'ewallet-isaku': null,
    'ewallet-kaspro': null
};

let originalPrice = {
    panel: 0,
    script: 0,
    murid: 0,
    vps: 0,
    apps: 0,
    sosmed: 0,
    subdomain: 0,
    nokos: 0,
    game: 0,
    ewallet: 0,
    'ewallet-gd': 0,
    'ewallet-gopay': 0,
    'ewallet-ovo': 0,
    'ewallet-shopee': 0,
    'ewallet-linkaja': 0,
    'ewallet-astrapay': 0,
    'ewallet-isaku': 0,
    'ewallet-kaspro': 0
};

try {
    const cached = localStorage.getItem('cachedActivityData');
    if (cached) activityData = JSON.parse(cached);
} catch (e) {
    activityData = [];
}

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    const { user } = checkLogin();
    updateUIUser(user);
    fetchProducts();
    setupEventListeners();
    setupAuthLogic();
    handleInitialNavigation();
    setupPromoListeners();
    
    if(user) {
        globalBalance = user.balance;
    }
    renderBalance();
    loadStats();
    loadInfoPage();

    setInterval(() => checkPublicActivity(false), 10000);
    setInterval(() => checkNewTransfer(), 10000);
    
    // PANGGIL LANGSUNG DI SINI JUGA (CADANGAN)
    setTimeout(() => {
        setupAccordion();
    }, 500);

    if (localStorage.getItem('openKelas') === 'true') {
        localStorage.removeItem('openKelas');
        setTimeout(() => document.getElementById('menuKelasSaya')?.click(), 1000);
    }

    if (localStorage.getItem('openAppSaya') === 'true') {
        localStorage.removeItem('openAppSaya');
        setTimeout(() => document.getElementById('menuAppSaya')?.click(), 1000);
    }

    if (localStorage.getItem('openNokos') === 'true') {
        localStorage.removeItem('openNokos');
        setTimeout(() => document.getElementById('menuNokosSaya')?.click(), 1000);
    }

    if (localStorage.getItem('openRiwayatSMM') === 'true') {
        localStorage.removeItem('openRiwayatSMM');
        setTimeout(() => document.getElementById('menuRiwayatSMM')?.click(), 1000);
    }
});

// ============ LOADER ============
function initLoader() {
    const texts = [
        "Solusi Digital Terbaik",
        "Kualitas Premium",
        "Proses Otomatis",
        "Harga Bersahabat"
    ];

    const textElement = document.getElementById('typingText');
    const overlay = document.getElementById('loadingOverlay');

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 80;
    let loadingDuration = 3000;

    function type() {
        if (!overlay || overlay.classList.contains('fade-out')) return;

        const currentText = texts[textIndex];

        if (isDeleting) {
            textElement.innerText = currentText.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 40;
        } else {
            textElement.innerText = currentText.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 80;
        }

        if (!isDeleting && charIndex === currentText.length) {
            isDeleting = true;
            typeSpeed = 1000;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typeSpeed = 200;
        }

        setTimeout(type, typeSpeed);
    }

    type();

    setTimeout(() => {
        if (overlay) {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                overlay.style.display = 'none';
                checkPublicActivity(true);
                const promoModal = document.getElementById('promoApkModal');
                if (promoModal) promoModal.classList.add('show');
            }, 600);
        }
    }, loadingDuration);
}

// ============ CAROUSEL ============
const track = document.getElementById('carouselTrack');
let idx = 0;
if (track) setInterval(() => {
    idx = (idx + 1) % 3;
    track.style.transform = `translateX(-${idx * 100}%)`;
    document.querySelectorAll('.dot').forEach((d, i) => {
        d.classList.toggle('active', i === idx);
    });
}, 3500);

// ============ AUTENTIKASI & CEK SESI EXPIRED ============
function checkLogin() {
    const token = localStorage.getItem('token');
    
    if (token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            const payload = JSON.parse(jsonPayload);
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < now) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                
                Swal.fire({
                    icon: 'warning',
                    title: 'Sesi Berakhir ⏳',
                    text: 'Sesi login Anda telah habis demi keamanan. Silakan login kembali.',
                    confirmButtonText: 'Login Ulang',
                    allowOutsideClick: false
                }).then(() => {
                    window.location.href = '/login';
                });
                throw new Error("TOKEN_EXPIRED"); 
            }
        } catch (e) {
            if (e.message === "TOKEN_EXPIRED") throw e; 
            return { token: null, user: null };
        }
    }
    
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        return { token, user };
    } catch (e) {
        return { token: null, user: null };
    }
}
setInterval(() => {
    try { checkLogin(); } catch(e) {}
}, 5000);

function setupAuthLogic() {
    const formLog = document.getElementById('formLogin');
    if (formLog) {
        formLog.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = formLog.querySelector('button');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Masuk...';
            btn.disabled = true;

            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: document.getElementById('logUser').value,
                        password: document.getElementById('logPass').value
                    })
                });
                const data = await res.json();
                if (data.success) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    window.location.href = '/';
                } else {
                    Swal.fire('Login Gagal', data.message || 'Cek username/password', 'error');
                    btn.innerText = "MASUK";
                    btn.disabled = false;
                }
            } catch (e) {
                Swal.fire('Error', 'Gagal terhubung ke server', 'error');
                btn.innerText = "MASUK";
                btn.disabled = false;
            }
        });
    }
}

// ============ UPDATE UI ============
function updateUIUser(user) {
    const headerName = document.getElementById('headerName');
    const imgEl = document.getElementById('sideProfileImg');
    const nameEl = document.getElementById('sideName');
    const userEl = document.getElementById('sideUsername');
    const phoneEl = document.getElementById('sidePhone');
    const menuAuth = document.getElementById('menuAuth');

    if (user) {
        const trxCount = user.stat_trx_count || 0;
        const isSultan = trxCount > 50;
        const sultanIcon = '<i class="fas fa-check-circle" style="color:#2980b9; margin-left:5px; font-size:0.9em;"></i>';

        if (headerName) {
            if (isSultan) {
                headerName.innerHTML = `Hai, <span style="color:#f1c40f; text-shadow:0 1px 1px rgba(0,0,0,0.1);">${user.fullname}</span> ${sultanIcon}`;
            } else {
                headerName.innerText = `Hai, ${user.fullname}`;
            }
        }

        if (imgEl) {
            imgEl.src = user.profile_img || 'images/default-user.png';
            if (isSultan) {
                imgEl.style.border = "3px solid #f1c40f";
                imgEl.style.boxShadow = "0 0 10px rgba(241, 196, 15, 0.5)";
            } else {
                imgEl.style.border = "";
                imgEl.style.boxShadow = "";
            }
        }

        if (nameEl) {
            if (isSultan) {
                nameEl.innerHTML = `${user.fullname} ${sultanIcon}`;
                nameEl.style.color = "#f1c40f";
                nameEl.style.textShadow = "0 1px 1px rgba(0,0,0,0.2)";
            } else {
                nameEl.innerText = user.fullname;
                nameEl.style.color = "";
                nameEl.style.textShadow = "";
            }
        }

        if (userEl) {
            userEl.innerText = '@' + user.username;
            if (isSultan) userEl.style.color = "#f39c12";
            else userEl.style.color = "";
        }

        if (phoneEl) phoneEl.innerText = user.phone || '-';

        if (menuAuth) {
            menuAuth.innerHTML = '<i class="fas fa-sign-out-alt"></i> Keluar';
            menuAuth.style.color = '#e74c3c';
            menuAuth.onclick = () => {
                Swal.fire({
                    title: 'Keluar?',
                    text: "Anda harus login lagi nanti.",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Ya, Keluar',
                    confirmButtonColor: '#e74c3c'
                }).then((result) => {
                    if (result.isConfirmed) {
                        localStorage.clear();
                        window.location.href = '/login';
                    }
                });
            };
        }
        loadUserData();
    } else {
        if (headerName) headerName.innerText = "Hai, Tamu";
        if (imgEl) {
            imgEl.src = 'images/default-user.png';
            imgEl.style.border = "";
            imgEl.style.boxShadow = "";
        }
        if (nameEl) {
            nameEl.innerText = "Tamu";
            nameEl.style.color = "";
        }
        if (userEl) {
            userEl.innerText = "Silakan Login";
            userEl.style.color = "";
        }
        if (phoneEl) phoneEl.innerText = "";

        if (menuAuth) {
            menuAuth.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
            menuAuth.style.color = '#e74c3c';
            menuAuth.onclick = () => window.location.href = '/login';
        }
    }
}

// ============ NAVIGASI ============
function handleInitialNavigation() {
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.page) renderPage(event.state.page);
        else renderPage('home');
        if (sidebar && sidebar.classList.contains('active')) closeSidebar();
        document.querySelectorAll('.modal, .confirm-modal-overlay').forEach(m => m.classList.remove('show'));
    });
    const hash = window.location.hash.replace('#', '');
    if (hash) renderPage(hash);
    else renderPage('home');
}

function switchPage(pageName) {
    window.history.pushState({ page: pageName }, '', `#${pageName}`);
    renderPage(pageName);
}

function goBack() {
    window.history.back();
}

function renderPage(pageName) {
    document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + pageName);

    if (target) {
        target.classList.add('active');

        if (pageName === 'transaksi') loadHistory();
        if (pageName === 'panel') {
            const savedUser = localStorage.getItem('saved_panel_user');
            if (document.getElementById('panelUser')) document.getElementById('panelUser').value = savedUser || '';
            document.querySelectorAll('.pay-method-item').forEach(el => el.classList.remove('active'));
            if (products.length === 0) fetchProducts();
            else renderProducts();
            checkOrder();
        }
        if (pageName === 'script') {
            if (scripts.length === 0) fetchScripts();
            else renderScripts();
        }
        if (pageName === 'murid') {
            if (muridPackages.length === 0) fetchMurid();
            else renderMurid();
        }
        if (pageName === 'vps') {
            if (vpsList.length === 0) fetchVPS();
            else renderVPS();
        }
        if (pageName === 'apps') {
            if (appsList.length === 0) fetchApps();
            else renderApps();
        }
        if (pageName === 'sosmed') {
            if (sosmedServices.length === 0) fetchSosmedServices();
        }
        if (pageName === 'akun') loadProfilePage();
        if (pageName === 'rekap') loadRekapPage();
        if (pageName === 'game-ff') {
            fetchGameProductsFF();
            resetGameInputs();
        }
        if (pageName === 'ewallet-dana') {
            fetchEwalletProductsDANA();
            resetEwalletInputs();
        }
        if (pageName === 'ewallet-gd') {
            fetchEwalletProductsGD();
            resetEwalletInputsGD();
        }
        if (pageName === 'ewallet-gopay') {
            fetchEwalletProductsGopay();
            resetEwalletInputsGopay();
        }
        if (pageName === 'ewallet-ovo') {
            fetchOvoProducts();
            resetOvoInputs();
        }
        if (pageName === 'ewallet-shopee') {
            fetchShopeeProducts();
            resetShopeeInputs();
        }
        if (pageName === 'ewallet-linkaja') {
            fetchLinkajaProducts();
            resetLinkajaInputs();
        }
        if (pageName === 'ewallet-astrapay') {
            fetchAstrapayProducts();
            resetAstrapayInputs();
        }
        if (pageName === 'ewallet-isaku') {
            fetchIsakuProducts();
            resetIsakuInputs();
        }
        if (pageName === 'ewallet-kaspro') {
            fetchKasproProducts();
            resetKasproInputs();
        }
        if (pageName === 'nokos') {
            fetchNokosNegara();
        }
        if (pageName === 'subdomain') {
            fetchCFZones();
        }
    } else {
        document.getElementById('page-home').classList.add('active');
    }

    if (bottomNav) {
        if (pageName === 'panel' || pageName === 'script' || pageName === 'murid' ||
            pageName === 'vps' || pageName === 'apps' || pageName === 'sosmed' ||
            pageName === 'game-ff' || pageName === 'ewallet-dana' || pageName === 'ewallet-gd' ||
            pageName === 'ewallet-gopay' || pageName === 'ewallet-ovo' || pageName === 'ewallet-shopee' ||
            pageName === 'ewallet-linkaja' || pageName === 'ewallet-astrapay' || pageName === 'ewallet-isaku' ||
            pageName === 'ewallet-kaspro' || pageName === 'nokos' || pageName === 'subdomain') {
            bottomNav.style.display = 'none';
        } else {
            bottomNav.style.display = 'flex';
            updateActiveNav(pageName);
        }
    }
}

function updateActiveNav(pageName) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-target') === pageName) item.classList.add('active');
    });
}

function openSidebar() {
    sidebar.classList.add('active');
    overlay.classList.add('show');
}

function closeSidebar() {
    sidebar.classList.remove('active');
    overlay.classList.remove('show');
}

// ============ SALDO ============
function toggleBalance() {
    isBalanceHidden = !isBalanceHidden;
    localStorage.setItem('isBalanceHidden', isBalanceHidden);
    renderBalance();
}

function renderBalance() {
    const saldoEl = document.getElementById('saldoText');
    const eyeEl = document.getElementById('eyeIcon');

    if (!saldoEl || !eyeEl) return;

    if (isBalanceHidden) {
        saldoEl.innerText = 'Rp ••••••••';
        saldoEl.style.fontSize = '20px';
        saldoEl.style.color = 'var(--primary-color)';
        eyeEl.classList.remove('fa-eye');
        eyeEl.classList.add('fa-eye-slash');
    } else {
        saldoEl.innerText = 'Rp ' + parseInt(globalBalance).toLocaleString('id-ID');
        saldoEl.style.color = 'var(--primary-color)';
        eyeEl.classList.remove('fa-eye-slash');
        eyeEl.classList.add('fa-eye');
    }
}

// ============ MODAL ============
function showCustomAlert(message, title = "Informasi") {
    const titleEl = document.getElementById('alertTitle');
    const msgEl = document.getElementById('alertMessage');
    if (titleEl && msgEl && customAlertModal) {
        titleEl.innerText = title;
        msgEl.innerText = message;
        customAlertModal.classList.add('show');
    } else {
        alert(message);
    }
}

function openClaimModal() {
    Swal.fire({
        title: '🛠️ Klaim Garansi',
        html: `
            <div style="text-align:left; font-size:12px; color:#666; margin-bottom:15px;">
                Pastikan kode garansi valid dan masa garansi belum habis (15 hari).
            </div>
            <input id="claimCode" class="swal2-input" placeholder="Masukkan Kode Garansi" style="font-size:14px;">
            <input id="claimUser" class="swal2-input" placeholder="Username Baru (Min 3 Huruf)" style="font-size:14px;">
        `,
        confirmButtonText: 'Proses Klaim',
        confirmButtonColor: '#e74c3c',
        showCancelButton: true,
        cancelButtonText: 'Batal',
        preConfirm: () => {
            const code = document.getElementById('claimCode').value;
            const user = document.getElementById('claimUser').value;
            if (!code || !user) Swal.showValidationMessage('Data tidak boleh kosong!');
            if (user.length < 3) Swal.showValidationMessage('Username minimal 3 karakter!');
            return { code, user };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            const { code, user } = result.value;
            const { token } = checkLogin();
            Swal.fire({
                title: 'Sedang Memproses...',
                html: 'Mohon tunggu, sedang membuat panel pengganti.',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            try {
                const res = await fetch('/api/claim-warranty', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token, warranty_code: code, new_username: user })
                });
                const d = await res.json();

                if (d.success) {
                    Swal.fire('Berhasil!', d.message, 'success').then(() => {
                        document.getElementById('menuPanelPopup').click();
                    });
                } else {
                    Swal.fire('Gagal', d.message, 'error');
                }
            } catch (e) {
                Swal.fire('Error', 'Gagal terhubung ke server', 'error');
            }
        }
    });
}

// ============ DATA USER ============
async function loadUserData() {
    const { token } = checkLogin();
    if (!token) return;
    try {
        const res = await fetch('/api/get-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        const d = await res.json();
        if (d.success) {
            globalBalance = d.user.balance;
            renderBalance();
            if (document.getElementById('statTrxCount')) {
                document.getElementById('statTrxCount').innerText = (d.user.stat_trx_count || 0) + 'x';
            }
            if (document.getElementById('statTotalSpent')) {
                document.getElementById('statTotalSpent').innerText = 'Rp ' + parseInt(d.user.stat_total_spent || 0).toLocaleString('id-ID');
            }
            localStorage.setItem('user', JSON.stringify(d.user));
        }
    } catch (e) { }
}

async function loadStats() {
    try {
        const res = await fetch('/api/stats');
        const d = await res.json();
        if (d.success) {
            if (document.getElementById('stMember')) document.getElementById('stMember').innerText = d.member.toLocaleString();
            if (document.getElementById('stSukses')) document.getElementById('stSukses').innerText = d.sukses.toLocaleString();
        }
    } catch (e) {
        console.log("Gagal load stats");
    }
}

// ============ AKUN ============
async function loadProfilePage() {
    const { token } = checkLogin();
    if (!token) return window.location.href = '/login';
    try {
        const res = await fetch('/api/get-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        const d = await res.json();
        if (d.success) {
            const u = d.user;
            const trxCount = u.stat_trx_count || 0;
            const isSultan = trxCount > 50;
            const sultanIcon = '<i class="fas fa-check-circle" style="color:#2980b9; font-size:0.8em; margin-left:5px;"></i>';
            const nameDisplay = document.getElementById('accNameDisplay');
            const profileImg = document.getElementById('displayProfile');

            if (isSultan) {
                nameDisplay.innerHTML = `${u.fullname} ${sultanIcon}`;
                nameDisplay.style.color = "#f1c40f";
                nameDisplay.style.textShadow = "0 1px 1px rgba(0,0,0,0.1)";
                if (profileImg) {
                    profileImg.style.border = "4px solid #f1c40f";
                    profileImg.style.boxShadow = "0 4px 15px rgba(241, 196, 15, 0.4)";
                }
            } else {
                nameDisplay.innerText = u.fullname;
                nameDisplay.style.color = "";
                nameDisplay.style.textShadow = "";
                if (profileImg) {
                    profileImg.style.border = "4px solid var(--bg-card)";
                    profileImg.style.boxShadow = "0 4px 10px rgba(0,0,0,0.15)";
                }
            }

            document.getElementById('accJoinDate').innerText = new Date(u.created_at).toLocaleDateString('id-ID');
            document.getElementById('accBalance').innerText = 'Rp ' + parseInt(u.balance).toLocaleString('id-ID');

            if (document.getElementById('accUangMasuk'))
                document.getElementById('accUangMasuk').innerText = 'Rp ' + parseInt(u.stat_total_deposit || 0).toLocaleString('id-ID');

            if (document.getElementById('accUangKeluar'))
                document.getElementById('accUangKeluar').innerText = 'Rp ' + parseInt(u.stat_total_spent || 0).toLocaleString('id-ID');

            document.getElementById('editFullname').value = u.fullname;
            document.getElementById('editUsername').value = '@' + u.username;
            document.getElementById('editPhone').value = u.phone;

            if (u.profile_img) document.getElementById('displayProfile').src = u.profile_img;
            if (u.banner_img) document.getElementById('displayBanner').style.backgroundImage = `url('${u.banner_img}')`;
        }
    } catch (e) {
        console.log(e);
    }
}

function setupAccountListeners() {
    document.getElementById('menuAkun')?.addEventListener('click', () => {
        closeSidebar();
        if (!checkLogin().token) window.location.href = '/login';
        else {
            switchPage('akun');
            loadProfilePage();
        }
    });

    const fileProf = document.getElementById('fileProfile');
    const fileBan = document.getElementById('fileBanner');

    fileProf?.addEventListener('change', function() {
        if (this.files && this.files[0]) openCropper(this.files[0], 'profile');
    });

    fileBan?.addEventListener('change', function() {
        if (this.files && this.files[0]) openCropper(this.files[0], 'banner');
    });

    const btnSave = document.getElementById('btnSaveProfile');
    if (btnSave) {
        btnSave.addEventListener('click', async () => {
            btnSave.innerText = "Mengupload & Menyimpan...";
            btnSave.disabled = true;

            try {
                const fullname = document.getElementById('editFullname').value;
                const phone = document.getElementById('editPhone').value;
                let newProfileLink = null;
                let newBannerLink = null;

                if (pendingProfileBlob) {
                    newProfileLink = await uploadDeline(pendingProfileBlob);
                    if (!newProfileLink) throw new Error("Gagal upload foto profil");
                }
                if (pendingBannerBlob) {
                    newBannerLink = await uploadDeline(pendingBannerBlob);
                    if (!newBannerLink) throw new Error("Gagal upload banner");
                }

                const { token } = checkLogin();
                const bodyData = { token, fullname, phone };
                if (newProfileLink) bodyData.profile_img = newProfileLink;
                if (newBannerLink) bodyData.banner_img = newBannerLink;

                const res = await fetch('/api/update-profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bodyData)
                });
                const result = await res.json();

                if (result.success) {
                    Swal.fire('Sukses', result.message, 'success');
                    pendingProfileBlob = null;
                    pendingBannerBlob = null;
                    localStorage.setItem('user', JSON.stringify(result.user));
                    updateUIUser(result.user);
                    loadProfilePage();
                } else {
                    Swal.fire('Gagal', result.message, 'error');
                }
            } catch (e) {
                Swal.fire('Error', e.message || 'Gagal menyimpan profil', 'error');
            } finally {
                btnSave.innerHTML = '<i class="fas fa-save"></i> SIMPAN PERUBAHAN';
                btnSave.disabled = false;
            }
        });
    }

    document.getElementById('btnLogout')?.addEventListener('click', () => {
        Swal.fire({
            title: 'Keluar Akun?',
            text: "Anda yakin?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Keluar',
            confirmButtonColor: '#e74c3c'
        }).then((r) => {
            if (r.isConfirmed) {
                localStorage.clear();
                window.location.href = '/login';
            }
        });
    });
}

// ============ CROPPER ============
function openCropper(file, type) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        imageToCrop.src = e.target.result;
        currentCropType = type;
        cropModal.classList.add('show');
        if (cropper) {
            cropper.destroy();
        }
        setTimeout(() => {
            cropper = new Cropper(imageToCrop, {
                aspectRatio: type === 'profile' ? 1 : 16 / 9,
                viewMode: 1,
                autoCropArea: 1,
                dragMode: 'move'
            });
        }, 200);
    };
    reader.readAsDataURL(file);
}

// ============ DEPOSIT ============
function selectDepositAmount(amount, element) {
    const input = document.getElementById('depoAmount');
    input.value = amount;
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (element) {
        element.classList.add('active');
    }
}

async function processDeposit() {
    const amount = document.getElementById('depoAmount').value;
    if (amount < 1000) return showCustomAlert("Minimal deposit Rp 1.000", "Gagal");
    const btn = document.getElementById('btnProsesDeposit');
    const oldText = btn.innerText;
    btn.innerText = "Memproses...";
    btn.disabled = true;

    const { token, user } = checkLogin();

    try {
        const res = await fetch('/api/deposit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, amount })
        });
        const data = await res.json();
        if (data.success) {
            const expireTime = Date.now() + (5 * 60 * 1000);
            localStorage.setItem('pendingTrx', JSON.stringify({
                order_id: data.order_id,
                pay_amount: data.pay_amount,
                deposit_amount: data.amount,
                qr_string: data.qr_string,
                expire_at: expireTime,
                username: user ? user.username : 'Guest',
                trx_type: 'deposit'
            }));
            window.location.href = '/payment';
        } else {
            showCustomAlert(data.message, "Gagal");
        }
    } catch (err) {
        showCustomAlert("Gagal terhubung ke server", "Error");
    } finally {
        btn.innerText = oldText;
        btn.disabled = false;
    }
}

// ============ REKAP ============
async function loadRekapPage() {
    const { token } = checkLogin();
    if (!token) return window.location.href = '/login';

    try {
        const res = await fetch('/api/rekap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        const d = await res.json();

        if (d.success) {
            document.getElementById('rekIn').innerText = 'Rp ' + parseInt(d.total_in).toLocaleString('id-ID');
            document.getElementById('rekOut').innerText = 'Rp ' + parseInt(d.total_out).toLocaleString('id-ID');
            document.getElementById('rekCount').innerText = d.trx_count + ' Transaksi';
            document.getElementById('rekBal').innerText = 'Rp ' + parseInt(d.balance).toLocaleString('id-ID');

            const net = d.total_in - d.total_out;
            const netEl = document.getElementById('rekNet');
            netEl.innerText = (net >= 0 ? '+ ' : '- ') + 'Rp ' + Math.abs(net).toLocaleString('id-ID');
            netEl.style.color = net >= 0 ? '#2ecc71' : '#e74c3c';
            renderWaveChart(d.chart);
        }
    } catch (e) {
        console.log(e);
    }
}

function renderWaveChart(chartData) {
    const ctx = document.getElementById('waveChart').getContext('2d');
    if (myChart) {
        myChart.destroy();
    }

    let gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(46, 204, 113, 0.5)');
    gradient.addColorStop(1, 'rgba(46, 204, 113, 0.0)');

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Pengeluaran',
                data: chartData.data_out,
                borderColor: '#e74c3c',
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
                fill: false
            },
            {
                label: 'Pemasukan',
                data: chartData.data_in,
                borderColor: '#2ecc71',
                backgroundColor: gradient,
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff'
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: { display: false },
                    ticks: { color: 'rgba(255,255,255,0.7)', font: { size: 10 } }
                },
                y: { display: false }
            },
            animation: {
                duration: 2000,
                easing: 'easeOutQuart'
            }
        }
    });
}

// ============ PANEL ============
async function fetchProducts() {
    try {
        const res = await fetch('/api/products');
        const json = await res.json();
        if (json.success) {
            products = json.data;
            renderProducts();
        }
    } catch (e) {
        console.log("Gagal ambil produk");
    }
}

function renderProducts() {
    if (!productGrid) return;
    productGrid.innerHTML = '';

    products.forEach(p => {
        const isHabis = (p.active === false);
        let badgeNewHtml = '';
        if (p.createdAt) {
            const createdTime = new Date(p.createdAt).getTime();
            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000;
            if ((now - createdTime) < oneDay) {
                badgeNewHtml = `<div class="badge-new-item">NEW 🔥</div>`;
            }
        }

        const card = document.createElement('div');
        card.className = `prod-card ${isHabis ? 'disabled' : ''}`;

        if (!isHabis) {
            card.addEventListener('click', () => selectItem(card, p.code, p.price));
        }

        const badgeStock = isHabis ?
            `<div class="badge-habis">STOK HABIS</div>` :
            `<div class="badge-ready">READY</div>`;

        card.innerHTML = `
            ${badgeNewHtml} 
            <div style="display:flex; flex-direction:column; height:100%; justify-content:center; align-items:center;">
                <i class="fas fa-server" style="font-size:28px; color:${isHabis ? '#bdc3c7' : '#3498db'}; margin-bottom:8px;"></i>
                <span class="prod-name" style="font-size:13px; margin-bottom:2px;">${p.name}</span>
                <span style="font-size:10px; color:#666;">RAM ${p.spec.ram}MB | CPU ${p.spec.cpu}%</span>
                ${badgeStock}
                <span class="prod-price">Rp ${p.price.toLocaleString()}</span>
            </div>
        `;
        productGrid.appendChild(card);
    });
}

function selectItem(el, code, price) {
    document.querySelectorAll('.prod-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedProductCode = code;
    selectedPrice = price;
    checkOrder();
    resetPromo('panel');
}

function selectPayMethod(method) {
    selectedMethod = method;
    document.querySelectorAll('.pay-method-item').forEach(el => el.classList.remove('active'));
    if (method === 'saldo') document.getElementById('paySaldo').classList.add('active');
    if (method === 'qris') document.getElementById('payQris').classList.add('active');
}

function checkOrder() {
    const orderType = document.getElementById('panelOrderType') ? document.getElementById('panelOrderType').value : 'new';
    let userVal = '';
    
    if (orderType === 'new') {
        userVal = document.getElementById('panelUser').value;
    } else {
        userVal = document.getElementById('existingPanelUser').value;
    }

    const btn = document.getElementById('btnBuy');
    const isValidUser = /^[a-zA-Z0-9-]{3,}$/.test(userVal);

    // Beli Baru tetap dikunci jika form belum lengkap
    if (isValidUser && selectedProductCode) {
        btn.classList.add('active');
        document.getElementById('footerAlert').style.display = 'none';
        document.getElementById('footerPrice').innerText = 'Rp ' + selectedPrice.toLocaleString();
        btn.disabled = false;
    } else {
        btn.classList.remove('active');
        let msg = "Lengkapi form.";
        if (!isValidUser && userVal.length > 0) msg = "Username min 3 karakter (Huruf/Angka/-)";
        document.getElementById('footerAlert').innerHTML = `<i class="fas fa-info-circle"></i> ${msg}`;
        document.getElementById('footerAlert').style.display = 'flex';
        document.getElementById('footerPrice').innerText = 'Rp 0';
        btn.disabled = true;
    }
    // Tombol Perpanjang sengaja TIDAK KITA DISABLE agar bisa memunculkan Pop Up Peringatan
}

// --- UBAH AKSI KLIK TOMBOL PERPANJANG ---
document.getElementById('btnExtend')?.addEventListener('click', async () => {
    // Cek dia milih menu apa
    const orderType = document.getElementById('panelOrderType') ? document.getElementById('panelOrderType').value : 'new';
    // Ambil username sesuai pilihan menu
    const username_panel = orderType === 'new' ? document.getElementById('panelUser').value : document.getElementById('existingPanelUser').value;
    
    // 1. Kasih tau jika Username belum diisi
    if (!username_panel || username_panel.length < 3) {
        return Swal.fire({
            icon: 'warning',
            title: 'Isi Username Dulu!',
            text: 'Masukkan Username Panel yang ingin kamu perpanjang di kolom Langkah 1.'
        });
    }

    // 2. Kasih tau jika Paket RAM belum dipilih
    if (!selectedProductCode) {
        return Swal.fire({
            icon: 'warning',
            title: 'Pilih Paket RAM!',
            text: 'Silakan pilih Paket RAM yang SESUAI dengan panel kamu di Langkah 2.'
        });
    }

    const { token } = checkLogin();
    if (!token) return window.location.href = '/login';

    if (selectedMethod !== 'saldo') {
        return Swal.fire('Peringatan', 'Perpanjang panel HANYA bisa menggunakan Saldo Akun. Pilih Saldo di Langkah 3.', 'info');
    }

    Swal.fire({
        title: 'Mengecek Data Panel...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        const res = await fetch('/api/extend-panel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, username_panel, product_code: selectedProductCode })
        });
        const data = await res.json();

        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Perpanjangan Sukses!',
                text: data.message,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            }).then(() => {
                loadUserData(); 
                window.location.hash = '#panelPopup'; 
                location.reload();
            });
        }
 else {
            if (data.need_deposit) {
                Swal.fire({
                    title: 'Saldo Kurang',
                    text: 'Saldo kamu tidak cukup untuk perpanjang. Deposit sekarang?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Ya, Deposit',
                    cancelButtonText: 'Batal'
                }).then((res) => {
                    if (res.isConfirmed) {
                        const modalDepo = document.getElementById('modalDeposit');
                        if(modalDepo) modalDepo.classList.add('show');
                    }
                });
            } else {
                Swal.fire('Gagal Perpanjang', data.message, 'error');
            }
        }
    } catch (e) {
        Swal.fire('Error', 'Gagal terhubung ke server.', 'error');
    }
});

function openModalConfirm() {
    const user = document.getElementById('panelUser').value;
    const prod = products.find(p => p.code === selectedProductCode);
    document.getElementById('c-prod').innerText = prod ? prod.name : '-';
    document.getElementById('c-user').innerText = user;
    document.getElementById('c-method').innerText = selectedMethod.toUpperCase();
    const finalPnlPrice = getFinalPriceByPage('panel');
    document.getElementById('c-total').innerText = 'Rp ' + finalPnlPrice.toLocaleString();
    confirmModal.classList.add('show');
}

// ============ SCRIPT ============
async function fetchScripts() {
    try {
        const res = await fetch('/api/scripts');
        const json = await res.json();
        if (json.success) {
            scripts = json.data;
            renderScripts();
        }
    } catch (e) {
        console.log("Gagal ambil script");
    }
}

function renderScripts() {
    const grid = document.getElementById('scriptGrid');
    if (!grid) return;
    grid.innerHTML = '';

    scripts.forEach(s => {
        const isHabis = (s.active === false);
        const card = document.createElement('div');
        card.className = `prod-card ${isHabis ? 'disabled' : ''}`;
        if (!isHabis) card.addEventListener('click', () => selectScriptItem(card, s));

        const badge = isHabis ?
            `<div class="badge-habis">STOK HABIS</div>` :
            `<div class="badge-ready">READY</div>`;

        card.innerHTML = `
            <div style="display:flex; flex-direction:column; height:100%; justify-content:center; align-items:center;">
                <i class="fas fa-code" style="font-size:28px; color:${isHabis ? '#bdc3c7' : '#f1c40f'}; margin-bottom:8px;"></i>
                <span class="prod-name" style="font-size:13px; margin-bottom:2px;">${s.name}</span>
                <span style="font-size:10px; color:#666;">Full Source Code</span>
                ${badge}
                <span class="prod-price">Rp ${s.price.toLocaleString()}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

function selectScriptItem(el, scriptData) {
    document.querySelectorAll('#scriptGrid .prod-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedScriptCode = scriptData.code;
    selectedScriptPrice = scriptData.price;
    selectedScriptData = scriptData;
    checkOrderScript();
    resetPromo('script');
}

function selectPayMethodScript(method) {
    selectedMethodScript = method;
    document.getElementById('paySaldoScript').classList.remove('active');
    document.getElementById('payQrisScript').classList.remove('active');
    if (method === 'saldo') document.getElementById('paySaldoScript').classList.add('active');
    if (method === 'qris') document.getElementById('payQrisScript').classList.add('active');
    checkOrderScript();
}

function checkOrderScript() {
    const btn = document.getElementById('btnBuyScript');

    if (selectedScriptCode && selectedMethodScript) {
        btn.classList.add('active');
        document.getElementById('footerAlertScript').style.display = 'none';
        document.getElementById('footerPriceScript').innerText = 'Rp ' + selectedScriptPrice.toLocaleString();
        btn.disabled = false;
    } else {
        btn.classList.remove('active');
        let msg = "Pilih script & metode pembayaran.";
        document.getElementById('footerAlertScript').innerHTML = `<i class="fas fa-info-circle"></i> ${msg}`;
        document.getElementById('footerAlertScript').style.display = 'flex';
        document.getElementById('footerPriceScript').innerText = 'Rp 0';
        btn.disabled = true;
    }
}

// ============ MURID ============
async function fetchMurid() {
    try {
        const res = await fetch('/api/murid');
        const json = await res.json();
        if (json.success) {
            muridPackages = json.data;
            renderMurid();
        }
    } catch (e) {
        console.log("Gagal ambil data murid");
    }
}

function renderMurid() {
    const grid = document.getElementById('muridGrid');
    if (!grid) return;
    grid.innerHTML = '';

    muridPackages.forEach(m => {
        const isHabis = (m.active === false);
        const card = document.createElement('div');
        card.className = `prod-card ${isHabis ? 'disabled' : ''}`;
        if (!isHabis) card.addEventListener('click', () => selectMuridItem(card, m));

        const badge = isHabis ?
            `<div class="badge-habis">DITUTUP</div>` :
            `<div class="badge-ready">DIBUKA</div>`;

        card.innerHTML = `
            <div style="display:flex; flex-direction:column; height:100%; justify-content:center; align-items:center;">
                <i class="fas fa-graduation-cap" style="font-size:28px; color:${isHabis ? '#bdc3c7' : '#9b59b6'}; margin-bottom:8px;"></i>
                <span class="prod-name" style="font-size:13px; margin-bottom:2px;">${m.name}</span>
                ${badge}
                <span class="prod-price">Rp ${m.price.toLocaleString()}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

function selectMuridItem(el, data) {
    document.querySelectorAll('#muridGrid .prod-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedMuridCode = data.code;
    selectedMuridPrice = data.price;
    selectedMuridData = data;
    checkOrderMurid();
    resetPromo('murid');
}

function selectPayMethodMurid(method) {
    selectedMethodMurid = method;
    document.getElementById('paySaldoMurid').classList.remove('active');
    document.getElementById('payQrisMurid').classList.remove('active');
    if (method === 'saldo') document.getElementById('paySaldoMurid').classList.add('active');
    if (method === 'qris') document.getElementById('payQrisMurid').classList.add('active');
    checkOrderMurid();
}

function checkOrderMurid() {
    const btn = document.getElementById('btnBuyMurid');

    if (selectedMuridCode && selectedMethodMurid) {
        btn.classList.add('active');
        document.getElementById('footerAlertMurid').style.display = 'none';
        document.getElementById('footerPriceMurid').innerText = 'Rp ' + selectedMuridPrice.toLocaleString();
        btn.disabled = false;
    } else {
        btn.classList.remove('active');
        let msg = "Pilih paket & pembayaran.";
        document.getElementById('footerAlertMurid').innerHTML = `<i class="fas fa-info-circle"></i> ${msg}`;
        document.getElementById('footerAlertMurid').style.display = 'flex';
        document.getElementById('footerPriceMurid').innerText = 'Rp 0';
        btn.disabled = true;
    }
}

// ============ VPS ============
async function fetchVPS() {
    try {
        const res = await fetch('/api/vps');
        const json = await res.json();
        if (json.success) {
            vpsList = json.data;
            renderVPS();
        }
    } catch (e) { }
}

function renderVPS() {
    const grid = document.getElementById('vpsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    vpsList.forEach(v => {
        const isHabis = (v.active === false);
        const card = document.createElement('div');
        card.className = `prod-card ${isHabis ? 'disabled' : ''}`;
        if (!isHabis) card.addEventListener('click', () => selectVPSItem(card, v));

        const badge = isHabis ?
            `<div class="badge-habis">FULL</div>` :
            `<div class="badge-ready">AVAILABLE</div>`;

        card.innerHTML = `
            <div style="display:flex; flex-direction:column; height:100%; justify-content:center; align-items:center;">
                <i class="fas fa-cloud" style="font-size:28px; color:${isHabis ? '#bdc3c7' : '#8e44ad'}; margin-bottom:8px;"></i>
                <span class="prod-name" style="font-size:13px; margin-bottom:2px;">${v.name}</span>
                <span style="font-size:10px; color:#666;">${v.spec || 'High Performance'}</span>
                ${badge}
                <span class="prod-price">Rp ${v.price.toLocaleString()}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

function selectVPSItem(el, data) {
    document.querySelectorAll('#vpsGrid .prod-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedVPSCode = data.code;
    selectedVPSPrice = data.price;
    selectedVPSData = data;
    checkOrderVPS();
    resetPromo('vps');
}

function selectPayMethodVPS(method) {
    selectedMethodVPS = method;
    document.getElementById('paySaldoVPS').classList.remove('active');
    document.getElementById('payQrisVPS').classList.remove('active');
    if (method === 'saldo') document.getElementById('paySaldoVPS').classList.add('active');
    if (method === 'qris') document.getElementById('payQrisVPS').classList.add('active');
    checkOrderVPS();
}

function checkOrderVPS() {
    const btn = document.getElementById('btnBuyVPS');
    if (selectedVPSCode && selectedMethodVPS) {
        btn.classList.add('active');
        document.getElementById('footerAlertVPS').style.display = 'none';
        document.getElementById('footerPriceVPS').innerText = 'Rp ' + selectedVPSPrice.toLocaleString();
        btn.disabled = false;
    } else {
        btn.classList.remove('active');
        document.getElementById('footerAlertVPS').style.display = 'flex';
        document.getElementById('footerPriceVPS').innerText = 'Rp 0';
        btn.disabled = true;
    }
}

// ============ APPS ============
async function fetchApps() {
    try {
        const res = await fetch('/api/apps');
        const json = await res.json();
        if (json.success) {
            appsList = json.data;
            renderApps();
        }
    } catch (e) { }
}

function renderApps() {
    const grid = document.getElementById('appsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    appsList.forEach(a => {
        const isHabis = a.stock_count <= 0;
        const card = document.createElement('div');
        card.className = `prod-card ${isHabis ? 'disabled' : ''}`;
        if (!isHabis) card.addEventListener('click', () => selectAppItem(card, a));

        let stockLabel = `<span style="font-size:10px; background:#2ecc71; color:white; padding:2px 5px; border-radius:3px;">Ready: ${a.stock_count}</span>`;
        if (isHabis) stockLabel = `<span style="font-size:10px; background:#e74c3c; color:white; padding:2px 5px; border-radius:3px;">STOK HABIS</span>`;

        card.innerHTML = `
            <div style="text-align:center;">
                <img src="${a.icon}" style="width:40px; height:40px; margin-bottom:5px;">
                <span class="prod-name" style="font-size:13px;">${a.name}</span>
                <div style="margin:5px 0;">${stockLabel}</div>
                <span class="prod-price">Rp ${a.price.toLocaleString()}</span>
            </div>
        `;
        if (isHabis) card.style.opacity = '0.6';
        grid.appendChild(card);
    });
}

function selectAppItem(el, data) {
    document.querySelectorAll('#appsGrid .prod-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedAppCode = data.code;
    selectedAppPrice = data.price;
    selectedAppData = data;
    checkOrderApps();
    resetPromo('apps');
}

function selectPayMethodApps(method) {
    selectedMethodApps = method;
    document.getElementById('paySaldoApps').classList.remove('active');
    document.getElementById('payQrisApps').classList.remove('active');
    if (method === 'saldo') document.getElementById('paySaldoApps').classList.add('active');
    if (method === 'qris') document.getElementById('payQrisApps').classList.add('active');
    checkOrderApps();
}

function checkOrderApps() {
    const btn = document.getElementById('btnBuyApps');
    if (selectedAppCode && selectedMethodApps) {
        btn.classList.add('active');
        document.getElementById('footerAlertApps').style.display = 'none';
        document.getElementById('footerPriceApps').innerText = 'Rp ' + selectedAppPrice.toLocaleString();
        btn.disabled = false;
    } else {
        btn.classList.remove('active');
        document.getElementById('footerAlertApps').style.display = 'flex';
        document.getElementById('footerPriceApps').innerText = 'Rp 0';
        btn.disabled = true;
    }
}

// ============ SOSMED ============
async function fetchSosmedServices() {
    const catSelect = document.getElementById('sosmedCategory');
    if (catSelect) catSelect.innerHTML = '<option>Memuat data...</option>';

    try {
        const res = await fetch('/api/sosmed/services');
        const json = await res.json();

        if (json.success) {
            sosmedServices = json.data;
            const cats = [...new Set(sosmedServices.map(item => item.category))];
            sosmedCategories = cats.sort();
            renderSosmedCategories();
        } else {
            const modalSmm = document.getElementById('modalSosmed');
            if (modalSmm) {
                modalSmm.style.display = 'none';
                modalSmm.classList.remove('show');
            }
            Swal.fire({
                icon: 'error',
                title: 'Mohon Maaf',
                text: json.message || 'Layanan Sosmed sedang gangguan/habis sementara.',
                confirmButtonColor: '#e74c3c'
            });
        }
    } catch (e) {
        console.log("Error sosmed fetch", e);
    }
}

function renderSosmedCategories() {
    const catSelect = document.getElementById('sosmedCategory');
    catSelect.innerHTML = '<option value="">-- Pilih Kategori --</option>';

    sosmedCategories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.innerText = cat;
        catSelect.appendChild(opt);
    });
}

function renderSosmedServices(category) {
    const servSelect = document.getElementById('sosmedService');
    servSelect.innerHTML = '<option value="">-- Pilih Layanan --</option>';

    const filtered = sosmedServices.filter(s => s.category === category);
    filtered.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.innerText = `${s.name} (Rp ${s.price.toLocaleString()}/k)`;
        servSelect.appendChild(opt);
    });
}

function calculateSosmedPrice() {
    const qty = parseInt(document.getElementById('sosmedQty').value) || 0;
    const priceDisplay = document.getElementById('sosmedTotalPrice');
    const footerPrice = document.getElementById('footerPriceSosmed');
    const btn = document.getElementById('btnBuySosmed');
    const alert = document.getElementById('footerAlertSosmed');

    if (selectedSosmedService && qty > 0) {
        const pricePer1000 = selectedSosmedService.price;
        const total = Math.ceil((pricePer1000 / 1000) * qty);

        priceDisplay.innerText = 'Rp ' + total.toLocaleString();
        footerPrice.innerText = 'Rp ' + total.toLocaleString();

        if (qty < selectedSosmedService.min || qty > selectedSosmedService.max) {
            btn.classList.remove('active');
            btn.disabled = true;
            alert.style.display = 'flex';
            alert.innerHTML = `<i class="fas fa-exclamation-circle"></i> Min: ${selectedSosmedService.min}, Max: ${selectedSosmedService.max}`;
        } else if (!selectedMethodSosmed) {
            btn.classList.remove('active');
            btn.disabled = true;
            alert.style.display = 'flex';
            alert.innerHTML = `<i class="fas fa-info-circle"></i> Pilih pembayaran.`;
        } else {
            btn.classList.add('active');
            btn.disabled = false;
            alert.style.display = 'none';
        }
    } else {
        priceDisplay.innerText = 'Rp 0';
        footerPrice.innerText = 'Rp 0';
        btn.classList.remove('active');
        btn.disabled = true;
    }
}

function selectPayMethodSosmed(method) {
    selectedMethodSosmed = method;
    document.getElementById('paySaldoSosmed').classList.remove('active');
    document.getElementById('payQrisSosmed').classList.remove('active');
    if (method === 'saldo') document.getElementById('paySaldoSosmed').classList.add('active');
    if (method === 'qris') document.getElementById('payQrisSosmed').classList.add('active');
    calculateSosmedPrice();
    resetPromo('sosmed');
}

// ============ SUBDOMAIN ============
async function fetchCFZones() {
    const grid = document.getElementById('domainGrid');
    const loading = document.getElementById('domainListLoading');
    loading.style.display = 'block';
    grid.innerHTML = '';

    try {
        const res = await fetch('/api/cf-zones');
        const json = await res.json();
        loading.style.display = 'none';

        if (json.success && json.data.length > 0) {
            cfZones = json.data;
            cfZones.forEach(z => {
                const card = document.createElement('div');
                card.className = 'prod-card';
                card.onclick = () => selectZoneItem(card, z);

                card.innerHTML = `
                    <div style="display:flex; flex-direction:column; height:100%; justify-content:center; align-items:center;">
                        <i class="fas fa-globe" style="font-size:24px; color:#2980b9; margin-bottom:5px;"></i>
                        <span class="prod-name" style="font-size:12px;">${z.name}</span>
                        <span class="prod-price">Rp ${z.price.toLocaleString()}</span>
                    </div>
                `;
                grid.appendChild(card);
            });
        } else {
            grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#e74c3c;">Gagal load domain / Kosong.</div>';
        }
    } catch (e) {
        loading.style.display = 'none';
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#e74c3c;">Error koneksi.</div>';
    }
}

function selectZoneItem(el, data) {
    document.querySelectorAll('#domainGrid .prod-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedZone = data;
    checkOrderSub();
    resetPromo('subdomain');
}

function selectPayMethodSub(method) {
    selectedMethodSub = method;
    document.getElementById('paySaldoSub').classList.remove('active');
    document.getElementById('payQrisSub').classList.remove('active');
    if (method === 'saldo') document.getElementById('paySaldoSub').classList.add('active');
    if (method === 'qris') document.getElementById('payQrisSub').classList.add('active');
    checkOrderSub();
}

function checkOrderSub() {
    const btn = document.getElementById('btnBuySub');
    const sub = document.getElementById('subdomainName').value;
    const ip = document.getElementById('subdomainIP').value;

    const isSubValid = /^[a-z0-9]+$/.test(sub);
    const isIpValid = ip.length > 6;

    if (isSubValid && isIpValid && selectedZone && selectedMethodSub) {
        btn.classList.add('active');
        document.getElementById('footerAlertSub').style.display = 'none';
        document.getElementById('footerPriceSub').innerText = 'Rp ' + selectedZone.price.toLocaleString();
        btn.disabled = false;
    } else {
        btn.classList.remove('active');
        let msg = "Lengkapi data.";
        if (!isSubValid && sub.length > 0) msg = "Nama subdomain huruf kecil & angka saja.";
        else if (!selectedZone) msg = "Pilih domain utama.";
        else if (!selectedMethodSub) msg = "Pilih pembayaran.";

        document.getElementById('footerAlertSub').innerHTML = `<i class="fas fa-info-circle"></i> ${msg}`;
        document.getElementById('footerAlertSub').style.display = 'flex';
        document.getElementById('footerPriceSub').innerText = 'Rp 0';
        btn.disabled = true;
    }
}

// ============ NOKOS ============
async function fetchNokosNegara() {
    const select = document.getElementById('nokosNegara');
    select.innerHTML = '<option value="">Memuat...</option>';

    try {
        const res = await fetch('/api/nokos/negara');
        const json = await res.json();

        if (json.success) {
            nokosNegaraList = json.data;
            select.innerHTML = '<option value="">-- Pilih Negara --</option>';
            nokosNegaraList.forEach(n => {
                const opt = document.createElement('option');
                opt.value = n.id_negara;
                opt.innerText = n.nama_negara.charAt(0).toUpperCase() + n.nama_negara.slice(1);
                select.appendChild(opt);
            });
        }
    } catch (e) {
        console.log(e);
    }
}

async function fetchNokosOperator(negaraId) {
    const opSelect = document.getElementById('nokosOperator');
    opSelect.innerHTML = '<option value="">Memuat operator...</option>';

    try {
        const res = await fetch('/api/nokos/operator', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ negara_id: negaraId })
        });
        const json = await res.json();

        if (json.success) {
            nokosOperatorList = json.data;
            opSelect.innerHTML = '<option value="">-- Pilih Operator --</option>';
            nokosOperatorList.forEach(op => {
                const opt = document.createElement('option');
                opt.value = op;
                opt.innerText = op.charAt(0).toUpperCase() + op.slice(1);
                opSelect.appendChild(opt);
            });
        }
    } catch (e) {
        console.log(e);
    }
}

async function fetchNokosLayanan(negaraId) {
    const laySelect = document.getElementById('nokosLayanan');
    laySelect.innerHTML = '<option value="">Memuat layanan...</option>';

    try {
        const res = await fetch('/api/nokos/layanan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ negara_id: negaraId })
        });
        const json = await res.json();

        if (json.success) {
            nokosLayananList = json.data;
            laySelect.innerHTML = '<option value="">-- Pilih Layanan --</option>';
            nokosLayananList.forEach(l => {
                const opt = document.createElement('option');
                opt.value = l.kode;
                opt.setAttribute('data-harga', l.harga);
                opt.innerText = `${l.nama} - Rp ${parseInt(l.harga).toLocaleString()}`;
                laySelect.appendChild(opt);
            });
        }
    } catch (e) {
        console.log(e);
    }
}

function selectPayMethodNokos(method) {
    selectedNokosMethod = method;
    document.getElementById('paySaldoNokos').classList.remove('active');
    document.getElementById('payQrisNokos').classList.remove('active');
    if (method === 'saldo') document.getElementById('paySaldoNokos').classList.add('active');
    if (method === 'qris') document.getElementById('payQrisNokos').classList.add('active');
    checkOrderNokos();
    resetPromo('nokos');
}

function checkOrderNokos() {
    const btn = document.getElementById('btnBuyNokos');
    const footerPrice = document.getElementById('footerPriceNokos');
    const alert = document.getElementById('footerAlertNokos');

    if (selectedNegara && selectedOperator && selectedLayanan && selectedNokosMethod) {
        btn.classList.add('active');
        btn.disabled = false;
        alert.style.display = 'none';
        footerPrice.innerText = 'Rp ' + parseInt(selectedLayanan.harga).toLocaleString();
    } else {
        btn.classList.remove('active');
        btn.disabled = true;
        alert.style.display = 'flex';
        footerPrice.innerText = 'Rp 0';
    }
}

async function loadRiwayatNokos() {
    const container = document.getElementById('listRiwayatNokos');
    if (!container) return;

    container.innerHTML = '<div style="text-align:center; padding:30px;"><i class="fas fa-spinner fa-spin"></i> Memuat data...</div>';

    const { token } = checkLogin();

    try {
        const res = await fetch('/api/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        const data = await res.json();

        if (data.success) {
            const nokosTrx = data.data.filter(t => t.type === 'buy_nokos');

            if (nokosTrx.length === 0) {
                container.innerHTML = '<div style="text-align:center; padding:30px; color:#999;">Belum ada riwayat order Nokos.</div>';
                return;
            }

            let html = '<div class="panel-scroll-container">';

            nokosTrx.forEach((trx) => {
                const isCancelled = trx.status === 'cancelled' || trx.status === 'canceled';
                const nomor = isCancelled ? '-' : (trx.product_data?.nomor || '-');
                const otp = trx.product_data?.otp || null;
                const otpStatus = otp ? 'OTP DITERIMA' : (isCancelled ? 'BATAL' : 'MENUNGGU OTP');
                const statusColor = otp ? '#2ecc71' : (isCancelled ? '#e74c3c' : '#f39c12');

                html += `
                    <div class="panel-card-item">
                        <div class="panel-card-header">
                            <span style="font-weight:bold; color:#9b59b6; font-size:12px;">${trx.product_data?.layanan_nama || trx.product_data?.product_name || 'Nokos'}</span>
                            <span style="font-size:10px; background:${statusColor}; color:white; padding:2px 6px; border-radius:4px;">${otpStatus}</span>
                        </div>
                        
                        <div class="panel-label">Negara / Operator</div>
                        <div class="panel-val">${trx.product_data?.negara_nama || '-'} / ${trx.product_data?.operator || '-'}</div>
                        
                        <div class="panel-label">Nomor</div>
                        <div class="panel-val" style="font-size:16px; font-weight:bold;">${nomor}</div>

                        ${otp ?
                    `<div class="panel-label">Kode OTP</div>
                             <div class="panel-val highlight" style="font-size:24px; text-align:center;">${otp}</div>` :
                    (trx.status === 'success' ?
                        `<button onclick="checkNokosOTP('${trx.provider_oid}', '${trx.order_id}')" style="width:100%; background:#3498db; color:white; border:none; padding:8px; border-radius:5px; margin-top:10px;">
                                <i class="fas fa-sync-alt"></i> CEK OTP
                            </button>` : '')
                }

                        ${!otp && trx.status === 'success' ?
                    `<button onclick="cancelNokos('${trx.provider_oid}')" style="width:100%; background:#e74c3c; color:white; border:none; padding:8px; border-radius:5px; margin-top:5px;">
                                <i class="fas fa-times"></i> BATALKAN
                            </button>` : ''
                }

                        <div style="margin-top:10px; font-size:9px; color:#999; text-align:right;">
                            ${new Date(trx.date).toLocaleDateString()}
                        </div>
                        
                        ${!isCancelled ? `
                        <button onclick="copyToClipboard('${nomor}')" style="width:100%; margin-top:10px; background:#333; color:white; border:none; padding:8px; border-radius:5px; font-size:11px;">
                            <i class="fas fa-copy"></i> SALIN NOMOR
                        </button>` : ''}
                    </div>
                `;
            });

            html += '</div>';
            html += '<div style="text-align:center; font-size:10px; color:#aaa; margin-top:5px;"><i class="fas fa-arrows-alt-h"></i> Geser ke samping</div>';

            container.innerHTML = html;
        } else {
            container.innerHTML = 'Gagal memuat history.';
        }
    } catch (e) {
        container.innerHTML = 'Error koneksi.';
    }
}

async function checkNokosOTP(providerOrderId, localOrderId) {
    const { token } = checkLogin();

    Swal.fire({
        title: 'Mengecek OTP...',
        html: 'Mohon tunggu sebentar',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        const res = await fetch('/api/nokos/check-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, provider_order_id: providerOrderId, local_order_id: localOrderId })
        });
        const data = await res.json();

        Swal.close();

        if (data.success) {
            Swal.fire({
                title: 'OTP Ditemukan!',
                html: `Kode OTP: <b style="font-size:24px;">${data.otp}</b>`,
                icon: 'success',
                confirmButtonText: 'Salin',
                confirmButtonColor: 'var(--primary-color)'
            }).then(() => {
                copyToClipboard(data.otp);
                if (document.getElementById('menuNokosSaya')) {
                    document.getElementById('menuNokosSaya').click();
                }
            });
        } else {
            Swal.fire('Info', data.message || 'OTP belum masuk', 'info');
        }
    } catch (e) {
        Swal.close();
        Swal.fire('Error', 'Gagal cek OTP', 'error');
    }
}

async function cancelNokos(providerOrderId) {
    const { token } = checkLogin();

    Swal.fire({
        title: 'Batalkan?',
        text: 'Saldo akan dikembalikan jika nomor belum dipakai',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Batalkan',
        cancelButtonText: 'Tidak'
    }).then(async (result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Memproses...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            try {
                const res = await fetch('/api/nokos/cancel', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token, provider_order_id: providerOrderId })
                });
                const data = await res.json();

                Swal.close();

                if (data.success) {
                    Swal.fire('Berhasil', 'Pesanan dibatalkan', 'success').then(() => {
                        if (document.getElementById('menuNokosSaya')) {
                            document.getElementById('menuNokosSaya').click();
                        }
                    });
                } else {
                    Swal.fire('Gagal', data.message, 'error');
                }
            } catch (e) {
                Swal.close();
                Swal.fire('Error', 'Gagal membatalkan', 'error');
            }
        }
    });
}

// ============ GAME FREE FIRE ============
async function fetchGameProductsFF() {
    const grid = document.getElementById('gameProductGrid');
    const loading = document.getElementById('gameProductLoading');
    if (!grid || !loading) return;

    loading.style.display = 'block';
    grid.innerHTML = '';

    try {
        const res = await fetch('/api/game/products/ff');
        const json = await res.json();

        loading.style.display = 'none';

        if (json.success && json.data.length > 0) {
            gameProducts = json.data;
            renderGameProducts();
        } else {
            grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#e74c3c;">Gagal load produk / Kosong.</div>';
        }
    } catch (e) {
        loading.style.display = 'none';
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#e74c3c;">Error koneksi.</div>';
    }
}

function renderGameProducts() {
    const grid = document.getElementById('gameProductGrid');
    grid.innerHTML = '';

    gameProducts.forEach(p => {
        const card = document.createElement('div');
        card.className = 'prod-card';
        card.onclick = () => selectProductGame(card, p);

        card.innerHTML = `
            <div style="display:flex; flex-direction:column; height:100%; justify-content:center; align-items:center;">
                <i class="fas fa-gem" style="font-size:24px; color:#ff6b6b; margin-bottom:5px;"></i>
                <span class="prod-name" style="font-size:12px;">${p.name}</span>
                <span class="prod-price">Rp ${p.price.toLocaleString()}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

function selectProductGame(el, data) {
    document.querySelectorAll('#gameProductGrid .prod-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedGameCode = data.code;
    selectedGamePrice = data.price;
    selectedGameData = data;
    checkOrderGame();
    resetPromo('game');
}

function checkGameNickname() {
    const userId = document.getElementById('gameUserId').value;
    
    if (!userId) {
        Swal.fire('Error', 'Masukkan ID pemain terlebih dahulu!', 'warning');
        return;
    }
    checkedGameUser = { nickname: "Bypass (Cek Nama Off)", region: "Auto" };
    document.getElementById('gameNickname').innerHTML = '<span style="color: #f39c12; font-size: 14px;">Cek Nama Off. Pastikan ID Benar!</span>';
    document.getElementById('gameRegion').innerText = `ID Tujuan: ${userId}`;
    const avatarImg = document.getElementById('gameAvatar');
    if (avatarImg) {
        avatarImg.style.display = 'none';
    }
    document.getElementById('gameUserInfo').style.display = 'flex';
    checkOrderGame();
}

function checkGameInput() {
    const userId = document.getElementById('gameUserId').value;
    if (userId.length < 5) {
        document.getElementById('gameUserInfo').style.display = 'none';
        checkedGameUser = null;
        checkOrderGame();
    }
}

function resetGameInputs() {
    document.getElementById('gameUserId').value = '';
    document.getElementById('gameUserInfo').style.display = 'none';
    checkedGameUser = null;
    selectedGameCode = null;
    selectedGamePrice = 0;
    selectedGameData = null;
    selectedMethodGame = null;
    resetPromo('game');
    checkOrderGame();
}

function selectPayMethodGame(method) {
    selectedMethodGame = method;
    document.getElementById('paySaldoGame').classList.remove('active');
    document.getElementById('payQrisGame').classList.remove('active');
    if (method === 'saldo') document.getElementById('paySaldoGame').classList.add('active');
    if (method === 'qris') document.getElementById('payQrisGame').classList.add('active');
    checkOrderGame();
}

function checkOrderGame() {
    const btn = document.getElementById('btnBuyGame');
    const footerPrice = document.getElementById('footerPriceGame');
    const alert = document.getElementById('footerAlertGame');

    if (checkedGameUser && selectedGameCode && selectedMethodGame) {
        btn.classList.add('active');
        btn.disabled = false;
        alert.style.display = 'none';
        footerPrice.innerText = 'Rp ' + selectedGamePrice.toLocaleString();
    } else {
        btn.classList.remove('active');
        btn.disabled = true;
        alert.style.display = 'flex';

        let msg = "Lengkapi data.";
        if (!checkedGameUser) msg = "Cek ID pemain terlebih dahulu.";
        else if (!selectedGameCode) msg = "Pilih nominal diamond.";
        else if (!selectedMethodGame) msg = "Pilih pembayaran.";

        alert.innerHTML = `<i class="fas fa-info-circle"></i> ${msg}`;
        footerPrice.innerText = 'Rp 0';
    }
}

// ============ E-WALLET DANA ============
async function fetchEwalletProductsDANA() {
    const grid = document.getElementById('ewalletProductGrid');
    const loading = document.getElementById('ewalletProductLoading');
    if (!grid || !loading) return;

    loading.style.display = 'block';
    grid.innerHTML = '';

    try {
        const res = await fetch('/api/ewallet/products/dana');
        const json = await res.json();

        loading.style.display = 'none';

        if (json.success && json.data.length > 0) {
            ewalletProducts = json.data;
            renderEwalletProducts();
        } else {
            grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#e74c3c;">Gagal load produk / Kosong.</div>';
        }
    } catch (e) {
        loading.style.display = 'none';
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#e74c3c;">Error koneksi.</div>';
    }
}

function renderEwalletProducts() {
    const grid = document.getElementById('ewalletProductGrid');
    grid.innerHTML = '';

    ewalletProducts.forEach(p => {
        const card = document.createElement('div');
        card.className = 'prod-card';
        card.onclick = () => selectProductEwallet(card, p);

        card.innerHTML = `
            <div style="display:flex; flex-direction:column; height:100%; justify-content:center; align-items:center;">
                <img src="${p.icon}" style="width:30px; height:30px; margin-bottom:5px;">
                <span class="prod-name" style="font-size:12px;">${p.name}</span>
                <span class="prod-price">Rp ${p.price.toLocaleString()}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

function selectProductEwallet(el, data) {
    document.querySelectorAll('#ewalletProductGrid .prod-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedEwalletCode = data.code;
    selectedEwalletPrice = data.price;
    selectedEwalletData = data;
    checkOrderEwallet();
    resetPromo('ewallet');
}

async function checkEwalletNumber() {
    const phoneNumber = document.getElementById('ewalletPhone').value;
    if (!phoneNumber) {
        Swal.fire('Error', 'Masukkan nomor DANA terlebih dahulu!', 'warning');
        return;
    }

    let cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanNumber.length < 10) {
        Swal.fire('Error', 'Nomor tidak valid!', 'warning');
        return;
    }

    const btn = document.getElementById('btnCheckEwallet');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;

    try {
        const res = await fetch('/api/ewallet/check/dana', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone_number: cleanNumber })
        });
        const data = await res.json();

        if (data.success) {
            let uName = data.data.name || data.data || "Member DANA";
            checkedEwalletUser = { name: uName, number: cleanNumber };
            document.getElementById('ewalletName').innerText = checkedEwalletUser.name;
            document.getElementById('ewalletStatus').innerText = '✓ Terdaftar';
            document.getElementById('ewalletUserInfo').style.display = 'flex';
            Swal.fire('Sukses', `Nomor valid: ${checkedEwalletUser.name}`, 'success');
        } else {
            Swal.fire('Gagal', data.message || 'Nomor tidak terdaftar', 'error');
            checkedEwalletUser = null;
            document.getElementById('ewalletUserInfo').style.display = 'none';
        }
    } catch (e) {
        Swal.fire('Error', 'Gagal terhubung ke server', 'error');
    } finally {
        btn.innerHTML = 'CEK NOMOR';
        btn.disabled = false;
        checkOrderEwallet();
    }
}

function checkEwalletInput() {
    const phone = document.getElementById('ewalletPhone').value;
    if (phone.length >= 10) {
        checkedEwalletUser = { name: "Member DANA", number: phone };
    } else {
        document.getElementById('ewalletUserInfo').style.display = 'none';
        checkedEwalletUser = null;
    }
    checkOrderEwallet();
}

function resetEwalletInputs() {
    document.getElementById('ewalletPhone').value = '';
    document.getElementById('ewalletUserInfo').style.display = 'none';
    checkedEwalletUser = null;
    selectedEwalletCode = null;
    selectedEwalletPrice = 0;
    selectedEwalletData = null;
    selectedMethodEwallet = null;
    resetPromo('ewallet');
    checkOrderEwallet();
}

function selectPayMethodEwallet(method) {
    selectedMethodEwallet = method;
    document.getElementById('paySaldoEwallet').classList.remove('active');
    document.getElementById('payQrisEwallet').classList.remove('active');
    if (method === 'saldo') document.getElementById('paySaldoEwallet').classList.add('active');
    if (method === 'qris') document.getElementById('payQrisEwallet').classList.add('active');
    checkOrderEwallet();
}

function checkOrderEwallet() {
    const btn = document.getElementById('btnBuyEwallet');
    const footerPrice = document.getElementById('footerPriceEwallet');
    const alert = document.getElementById('footerAlertEwallet');

    if (checkedEwalletUser && selectedEwalletCode && selectedMethodEwallet) {
        btn.classList.add('active');
        btn.disabled = false;
        alert.style.display = 'none';
        footerPrice.innerText = 'Rp ' + (selectedEwalletPrice || 0).toLocaleString();
    } else {
        btn.classList.remove('active');
        btn.disabled = true;
        alert.style.display = 'flex';

        let msg = "Lengkapi data.";
        if (!checkedEwalletUser) msg = "Cek nomor DANA terlebih dahulu.";
        else if (!selectedEwalletCode) msg = "Pilih nominal topup.";
        else if (!selectedMethodEwallet) msg = "Pilih pembayaran.";

        alert.innerHTML = `<i class="fas fa-info-circle"></i> ${msg}`;
        footerPrice.innerText = 'Rp 0';
    }
}

// ============ GOPAY DRIVER ============
async function fetchEwalletProductsGD() {
    const grid = document.getElementById('ewalletProductGridGD');
    const loading = document.getElementById('ewalletProductLoadingGD');
    if (!grid || !loading) return;

    loading.style.display = 'block';
    grid.innerHTML = '';

    try {
        const res = await fetch('/api/ewallet/products/gopay-driver');
        const json = await res.json();
        loading.style.display = 'none';
        if (json.success && json.data.length > 0) {
            ewalletProductsGD = json.data;
            renderEwalletProductsGD();
        } else {
            grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#e74c3c;">Gagal load produk.</div>';
        }
    } catch (e) {
        loading.style.display = 'none';
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#e74c3c;">Error koneksi.</div>';
    }
}

function renderEwalletProductsGD() {
    const grid = document.getElementById('ewalletProductGridGD');
    grid.innerHTML = '';

    ewalletProductsGD.forEach(p => {
        const card = document.createElement('div');
        card.className = 'prod-card';
        card.onclick = () => selectProductEwalletGD(card, p);
        card.innerHTML = `
            <div style="display:flex; flex-direction:column; height:100%; justify-content:center; align-items:center;">
                <img src="${p.icon}" style="width:30px; height:30px; margin-bottom:5px;">
                <span class="prod-name" style="font-size:12px;">${p.name}</span>
                <span class="prod-price">Rp ${p.price.toLocaleString()}</span>
            </div>`;
        grid.appendChild(card);
    });
}

function selectProductEwalletGD(el, data) {
    document.querySelectorAll('#ewalletProductGridGD .prod-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedEwalletCodeGD = data.code;
    selectedEwalletPriceGD = data.price;
    selectedEwalletDataGD = data;
    checkOrderEwalletGD();
    resetPromo('ewallet-gd');
}

async function checkEwalletNumberGD() {
    const phoneNumber = document.getElementById('ewalletPhoneGD').value;
    if (!phoneNumber) return Swal.fire('Error', 'Masukkan nomor terlebih dahulu!', 'warning');

    const btn = document.getElementById('btnCheckEwalletGD');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;

    try {
        const res = await fetch('/api/ewallet/check/gopay-driver', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone_number: phoneNumber })
        });
        const data = await res.json();

        if (data.success) {
            let uName = data.data.name || data.data || "Valid / Aktif";
            checkedEwalletUserGD = { name: uName, number: phoneNumber };
            document.getElementById('ewalletNameGD').innerText = checkedEwalletUserGD.name;
            document.getElementById('ewalletUserInfoGD').style.display = 'flex';
            Swal.fire('Sukses', `Nomor Valid: ${checkedEwalletUserGD.name}`, 'success');
        } else {
            Swal.fire('Gagal', data.message, 'error');
            checkedEwalletUserGD = null;
            document.getElementById('ewalletUserInfoGD').style.display = 'none';
        }
    } catch (e) {
        Swal.fire('Error', 'Gagal server', 'error');
    } finally {
        btn.innerHTML = 'CEK NOMOR';
        btn.disabled = false;
        checkOrderEwalletGD();
    }
}

function checkEwalletInputGD() {
    const phone = document.getElementById('ewalletPhoneGD').value;
    if (phone.length >= 10) {
        checkedEwalletUserGD = { name: "Driver GoPay", number: phone };
    } else {
        document.getElementById('ewalletUserInfoGD').style.display = 'none';
        checkedEwalletUserGD = null;
    }
    checkOrderEwalletGD();
}

function resetEwalletInputsGD() {
    document.getElementById('ewalletPhoneGD').value = '';
    document.getElementById('ewalletUserInfoGD').style.display = 'none';
    checkedEwalletUserGD = null;
    selectedEwalletCodeGD = null;
    selectedEwalletPriceGD = 0;
    selectedEwalletDataGD = null;
    selectedMethodEwalletGD = null;
    resetPromo('ewallet-gd');
    checkOrderEwalletGD();
}

function selectPayMethodEwalletGD(method) {
    selectedMethodEwalletGD = method;
    document.getElementById('paySaldoEwalletGD').classList.remove('active');
    document.getElementById('payQrisEwalletGD').classList.remove('active');
    if (method === 'saldo') document.getElementById('paySaldoEwalletGD').classList.add('active');
    if (method === 'qris') document.getElementById('payQrisEwalletGD').classList.add('active');
    checkOrderEwalletGD();
}

function checkOrderEwalletGD() {
    const btn = document.getElementById('btnBuyEwalletGD');
    const fPrice = document.getElementById('footerPriceEwalletGD');
    const alert = document.getElementById('footerAlertEwalletGD');

    if (checkedEwalletUserGD && selectedEwalletCodeGD && selectedMethodEwalletGD) {
        btn.classList.add('active');
        btn.disabled = false;
        alert.style.display = 'none';
        fPrice.innerText = 'Rp ' + selectedEwalletPriceGD.toLocaleString();
    } else {
        btn.classList.remove('active');
        btn.disabled = true;
        alert.style.display = 'flex';
        fPrice.innerText = 'Rp 0';

        let msg = "Lengkapi data.";
        if (!checkedEwalletUserGD) msg = "Cek nomor GoPay Driver dulu.";
        else if (!selectedEwalletCodeGD) msg = "Pilih nominal topup.";
        else if (!selectedMethodEwalletGD) msg = "Pilih pembayaran.";

        alert.innerHTML = `<i class="fas fa-info-circle"></i> ${msg}`;
    }
}

// ============ GOPAY CUSTOMER ============
async function fetchEwalletProductsGopay() {
    const grid = document.getElementById('ewalletProductGridGopay');
    const loading = document.getElementById('ewalletProductLoadingGopay');
    if (!grid || !loading) return;

    loading.style.display = 'block';
    grid.innerHTML = '';

    try {
        const res = await fetch('/api/ewallet/products/gopay');
        const json = await res.json();
        loading.style.display = 'none';
        if (json.success && json.data.length > 0) {
            ewalletProductsGopay = json.data;
            renderEwalletProductsGopay();
        } else {
            grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#e74c3c;">Gagal load produk.</div>';
        }
    } catch (e) {
        loading.style.display = 'none';
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#e74c3c;">Error koneksi.</div>';
    }
}

function renderEwalletProductsGopay() {
    const grid = document.getElementById('ewalletProductGridGopay');
    grid.innerHTML = '';

    ewalletProductsGopay.forEach(p => {
        const card = document.createElement('div');
        card.className = 'prod-card';
        const badgeHTML = p.isPromo ? `<div style="position:absolute; top:-5px; right:-5px; background:#e74c3c; color:white; font-size:9px; padding:2px 5px; border-radius:5px; font-weight:bold;">PROMO</div>` : '';
        card.onclick = () => selectProductEwalletGopay(card, p);
        card.innerHTML = `
            ${badgeHTML}
            <div style="display:flex; flex-direction:column; height:100%; justify-content:center; align-items:center; position:relative;">
                <img src="${p.icon}" style="width:30px; height:30px; margin-bottom:5px;">
                <span class="prod-name" style="font-size:11px; text-align:center;">${p.name}</span>
                <span class="prod-price">Rp ${p.price.toLocaleString()}</span>
            </div>`;
        grid.appendChild(card);
    });
}

function selectProductEwalletGopay(el, data) {
    document.querySelectorAll('#ewalletProductGridGopay .prod-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedEwalletCodeGopay = data.code;
    selectedEwalletPriceGopay = data.price;
    selectedEwalletDataGopay = data;
    checkOrderEwalletGopay();
    resetPromo('ewallet-gopay');
}

async function checkEwalletNumberGopay() {
    const phoneNumber = document.getElementById('ewalletPhoneGopay').value;
    if (!phoneNumber) return Swal.fire('Error', 'Masukkan nomor terlebih dahulu!', 'warning');

    const btn = document.getElementById('btnCheckEwalletGopay');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;

    try {
        const res = await fetch('/api/ewallet/check/gopay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone_number: phoneNumber })
        });
        const data = await res.json();

        if (data.success) {
            checkedEwalletUserGopay = data.data;
            document.getElementById('ewalletUserInfoGopay').style.display = 'flex';
            Swal.fire('Sukses', `Nomor Valid`, 'success');
        } else {
            Swal.fire('Gagal', data.message, 'error');
            checkedEwalletUserGopay = null;
            document.getElementById('ewalletUserInfoGopay').style.display = 'none';
        }
    } catch (e) {
        Swal.fire('Error', 'Gagal server', 'error');
    } finally {
        btn.innerHTML = 'CEK NOMOR';
        btn.disabled = false;
        checkOrderEwalletGopay();
    }
}

function checkEwalletInputGopay() {
    const phone = document.getElementById('ewalletPhoneGopay').value;
    if (phone.length >= 10) {
        checkedEwalletUserGopay = { name: "Member GoPay", number: phone };
    } else {
        document.getElementById('ewalletUserInfoGopay').style.display = 'none';
        checkedEwalletUserGopay = null;
    }
    checkOrderEwalletGopay();
}

function resetEwalletInputsGopay() {
    document.getElementById('ewalletPhoneGopay').value = '';
    document.getElementById('ewalletUserInfoGopay').style.display = 'none';
    checkedEwalletUserGopay = null;
    selectedEwalletCodeGopay = null;
    selectedEwalletPriceGopay = 0;
    selectedEwalletDataGopay = null;
    selectedMethodEwalletGopay = null;
    resetPromo('ewallet-gopay');
    checkOrderEwalletGopay();
}

function selectPayMethodEwalletGopay(method) {
    selectedMethodEwalletGopay = method;
    document.getElementById('paySaldoEwalletGopay').classList.remove('active');
    document.getElementById('payQrisEwalletGopay').classList.remove('active');
    if (method === 'saldo') document.getElementById('paySaldoEwalletGopay').classList.add('active');
    if (method === 'qris') document.getElementById('payQrisEwalletGopay').classList.add('active');
    checkOrderEwalletGopay();
}

function checkOrderEwalletGopay() {
    const btn = document.getElementById('btnBuyEwalletGopay');
    const fPrice = document.getElementById('footerPriceEwalletGopay');
    const alert = document.getElementById('footerAlertEwalletGopay');

    if (checkedEwalletUserGopay && selectedEwalletCodeGopay && selectedMethodEwalletGopay) {
        btn.classList.add('active');
        btn.disabled = false;
        alert.style.display = 'none';
        fPrice.innerText = 'Rp ' + (selectedEwalletPriceGopay || 0).toLocaleString();
    } else {
        btn.classList.remove('active');
        btn.disabled = true;
        alert.style.display = 'flex';
        fPrice.innerText = 'Rp 0';

        let msg = "Lengkapi data.";
        if (!checkedEwalletUserGopay) msg = "Cek nomor GoPay dulu.";
        else if (!selectedEwalletCodeGopay) msg = "Pilih nominal topup.";
        else if (!selectedMethodEwalletGopay) msg = "Pilih pembayaran.";

        alert.innerHTML = `<i class="fas fa-info-circle"></i> ${msg}`;
    }
}

// ============ INFO ============
function loadInfoPage() {
    if (activityData.length > 0) {
        const newestId = activityData[0].id;
        localStorage.setItem('lastReadActivityId', newestId);

        const badge = document.getElementById('infoBadge');
        if (badge) badge.classList.remove('show');

        const navInfoIcon = document.querySelector('.nav-item[data-target="info"] i');
        if (navInfoIcon) navInfoIcon.classList.remove('shake-bell');
    }

    const containerNotif = document.getElementById('listPemberitahuan');
    const containerInfo = document.getElementById('listInformasi');

    if (containerNotif) containerNotif.innerHTML = '';
    if (containerInfo) containerInfo.innerHTML = '';

    if (!activityData || activityData.length === 0) {
        const cached = localStorage.getItem('cachedActivityData');
        if (cached) activityData = JSON.parse(cached);
        else {
            if (containerNotif) containerNotif.innerHTML = '<div style="text-align:center; padding:30px; font-size:12px; color:#aaa;">Belum ada aktivitas.</div>';
            return;
        }
    }

    const transactions = activityData.filter(item => item.type === 'transaction');
    const adminMessages = activityData.filter(item => item.type === 'broadcast');

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const myUsername = user.username || '';

    if (transactions.length === 0) {
        if (containerNotif) containerNotif.innerHTML = '<div style="text-align:center; padding:30px; font-size:12px; color:#aaa;">Belum ada transaksi.</div>';
    } else {
        transactions.forEach(item => {
            const readList = JSON.parse(localStorage.getItem('read_items') || '[]');
            const isUnread = !readList.includes(item.id);
            const unreadClass = isUnread ? 'unread-item' : '';
            const dotHtml = isUnread ? '<div class="unread-dot-card"></div>' : '';

            let timeString = timeAgo(item.time);
            let iconHtml = '💰';
            let displayText = `<b>${item.name}</b> order <b>${item.desc}</b>`;

            if (item.trx_type === 'deposit') {
                iconHtml = '💵';
                displayText = `<b>${item.name}</b> deposit <b>${item.desc}</b>`;
            } else if (item.trx_type && item.trx_type.includes('transfer')) {
                let sender = item.name;
                let rawDesc = item.desc;

                let recipientMatch = rawDesc.match(/@([a-zA-Z0-9_]+)/);
                let recipient = recipientMatch ? recipientMatch[1] : 'seseorang';
                let amountMatch = rawDesc.match(/Rp\s*([0-9.,]+)/i);
                let amountStr = amountMatch ? `Rp ${amountMatch[1]}` : 'Uang';

                if (myUsername === recipient) {
                    iconHtml = '📥';
                    displayText = `<span style="color:#2ecc71; font-weight:bold;">Dana Masuk!</span> Menerima ${amountStr} dari @${sender}`;
                } else if (myUsername === sender) {
                    iconHtml = '📤';
                    displayText = `<span style="color:#3498db; font-weight:bold;">Transfer Berhasil</span> Mengirim ${amountStr} ke @${recipient}`;
                } else {
                    iconHtml = '💸';
                    displayText = `<b>@${sender}</b> transfer ${amountStr} ke <b>@${recipient}</b>`;
                }
            } else if (item.trx_type && item.trx_type.includes('panel')) {
                iconHtml = '🖥️';
                if (item.trx_type === 'extend_panel') {
                    displayText = `<b>${item.name}</b> melakukan <b>${item.desc}</b>`;
                } else {
                    displayText = `<b>${item.name}</b> order <b>${item.desc}</b>`;
                }
            }
 else if (item.trx_type && item.trx_type.includes('script')) {
                iconHtml = '📜';
                displayText = `<b>${item.name}</b> order <b>${item.desc}</b>`;
            } else if (item.trx_type && item.trx_type.includes('murid')) {
                iconHtml = '🎓';
                displayText = `<b>${item.name}</b> order <b>${item.desc}</b>`;
            } else if (item.trx_type && item.trx_type.includes('sosmed')) {
                iconHtml = '🚀';
                displayText = `<b>${item.name}</b> order <b>${item.desc}</b>`;
            } else if (item.trx_type && item.trx_type.includes('game')) {
                iconHtml = '🎮';
                displayText = `<b>${item.name}</b> topup <b>${item.desc}</b>`;
            } else if (item.trx_type && item.trx_type.includes('ewallet')) {
                iconHtml = '👛';
                displayText = `<b>${item.name}</b> topup <b>${item.desc}</b>`;
            } else if (item.trx_type && item.trx_type.includes('nokos')) {
                iconHtml = '📱';
                displayText = `<b>${item.name}</b> order <b>${item.desc}</b>`;
            }

            const html = `
                <div onclick="markItemAsRead('${item.id}', this)" class="${unreadClass}" style="
                    display:flex; align-items:center; padding:12px 10px; border-bottom:1px solid #f0f0f0; gap:10px; cursor:pointer; transition:0.3s;
                ">
                    <div style="font-size:18px; width:30px; text-align:center;">${iconHtml}</div>
                    <div style="flex:1;">
                        <div style="font-size:12px; color:#333; line-height:1.3;">
                            ${dotHtml} ${displayText}
                        </div>
                        <div style="font-size:10px; color:#999; margin-top:2px;">${timeString}</div>
                    </div>
                </div>
            `;
            if (containerNotif) containerNotif.insertAdjacentHTML('beforeend', html);
        });
    }

    if (adminMessages.length === 0) {
        if (containerInfo) containerInfo.innerHTML = '<div style="text-align:center; padding:30px; font-size:12px; color:#aaa;">Belum ada info admin.</div>';
    } else {
        adminMessages.forEach(item => {
            const readList = JSON.parse(localStorage.getItem('read_items') || '[]');
            const isUnread = !readList.includes(item.id);
            const unreadClass = isUnread ? 'unread-item' : '';
            const dotHtml = isUnread ? '<div class="unread-dot-card"></div>' : '';

            let timeString = timeAgo(item.time);
            let title = 'Informasi';
            let borderColor = '#3498db';
            let bgHeader = '#e3f2fd';

            if (item.level === 'promo') {
                title = '🎉 Promo';
                borderColor = '#f39c12';
                bgHeader = '#fff3e0';
            }
            if (item.level === 'warning') {
                title = '⚠️ Penting';
                borderColor = '#e74c3c';
                bgHeader = '#ffebee';
            }

            const html = `
            <div onclick="markItemAsRead('${item.id}', this)" class="${unreadClass}" style="
                position:relative;
                background:#fff; 
                border:1px solid #eee; 
                border-left: 3px solid ${borderColor};
                border-radius: 8px; 
                padding: 12px; 
                margin-bottom: 8px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                cursor: pointer;
                transition: 0.3s;
            ">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                    <span style="font-size:11px; font-weight:bold; color:${borderColor}; background:${bgHeader}; padding:2px 6px; border-radius:4px;">
                        ${dotHtml} ${title}
                    </span>
                    <span style="font-size:9px; color:#aaa;">${timeString}</span>
                </div>
                <div style="font-size:12px; color:#444; line-height:1.5;">
                    ${convertToLink(item.desc)}
                </div>
            </div>`;

            if (containerInfo) containerInfo.insertAdjacentHTML('beforeend', html);
        });
    }
}

window.switchInfoTab = function(tabName) {
    document.getElementById('tabNotif').classList.remove('active');
    document.getElementById('tabInfo').classList.remove('active');

    const listNotif = document.getElementById('listPemberitahuan');
    const listInfo = document.getElementById('listInformasi');

    if (listNotif) listNotif.style.display = 'none';
    if (listInfo) listInfo.style.display = 'none';

    if (tabName === 'pemberitahuan') {
        document.getElementById('tabNotif').classList.add('active');
        if (listNotif) {
            listNotif.style.display = 'flex';
            listNotif.style.flexDirection = 'column';
        }

        const dot = document.getElementById('tabNotif').querySelector('.tab-red-dot');
        if (dot) dot.remove();

        const latestTrx = activityData.find(item => item.type === 'transaction');
        if (latestTrx) localStorage.setItem('last_seen_trx', latestTrx.id);

    } else {
        document.getElementById('tabInfo').classList.add('active');
        if (listInfo) {
            listInfo.style.display = 'block';
            loadInfoPage();
        }
    }
};

window.markItemAsRead = function(id, element) {
    let readList = JSON.parse(localStorage.getItem('read_items') || '[]');

    if (!readList.includes(id)) {
        readList.push(id);
        localStorage.setItem('read_items', JSON.stringify(readList));
    }

    element.classList.remove('unread-item');
    const dot = element.querySelector('.unread-dot-card');
    if (dot) dot.style.display = 'none';

    updateInfoTabsRedDots();

    const hasUnread = activityData.some(item => !readList.includes(item.id));
    const bellBadge = document.getElementById('infoBadge');
    const bellIcon = document.querySelector('.nav-item[data-target="info"] i');

    if (isInfoMenuOpened || !hasUnread) {
        if (bellBadge) bellBadge.classList.remove('show');
        if (bellIcon) bellIcon.classList.remove('shake-bell');
    }
};

function updateInfoTabsRedDots() {
    const readList = JSON.parse(localStorage.getItem('read_items') || '[]');

    const unreadNotif = activityData.filter(i => i.type === 'transaction' && !readList.includes(i.id)).length;
    const unreadInfo = activityData.filter(i => i.type === 'broadcast' && !readList.includes(i.id)).length;

    const tabNotif = document.getElementById('tabNotif');
    if (tabNotif) {
        const dot = tabNotif.querySelector('.tab-red-dot');
        if (unreadNotif > 0) {
            if (!dot) {
                const newDot = document.createElement('div');
                newDot.className = 'tab-red-dot';
                tabNotif.appendChild(newDot);
            }
        } else {
            if (dot) dot.remove();
        }
    }

    const tabInfo = document.getElementById('tabInfo');
    if (tabInfo) {
        const dot = tabInfo.querySelector('.tab-red-dot');
        if (unreadInfo > 0) {
            if (!dot) {
                const newDot = document.createElement('div');
                newDot.className = 'tab-red-dot';
                tabInfo.appendChild(newDot);
            }
        } else {
            if (dot) dot.remove();
        }
    }
}

// ============ RIWAYAT SMM ============
async function loadRiwayatSMM() {
    const container = document.getElementById('listRiwayatSMM');
    container.innerHTML = '<div style="text-align:center; padding:30px;"><i class="fas fa-spinner fa-spin"></i> Mengambil data...</div>';

    const { token } = checkLogin();

    try {
        const res = await fetch('/api/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        const data = await res.json();

        if (data.success) {
            const smmTrx = data.data.filter(t => t.type === 'buy_sosmed' && t.provider_oid);

            if (smmTrx.length === 0) {
                container.innerHTML = '<div style="text-align:center; padding:30px; color:#999;">Belum ada riwayat order SMM.</div>';
                return;
            }

            let html = '<div class="panel-scroll-container">';

            smmTrx.forEach((trx) => {
                html += `
                    <div class="panel-card-item">
                        <div class="panel-card-header">
                            <span style="font-weight:bold; color:var(--primary-color); font-size:12px;">#${trx.provider_oid}</span>
                            <span id="badge-${trx.provider_oid}" style="font-size:10px; background:#bdc3c7; color:white; padding:2px 6px; border-radius:4px;">Loading...</span>
                        </div>
                        
                        <div style="font-size:13px; font-weight:bold; color:#333; margin-bottom:5px; height:35px; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">
                            ${trx.product_data.product_name}
                        </div>
                        
                        <div style="font-size:11px; color:#666; margin-bottom:5px;">
                            Target: <b style="color:#3498db">${trx.product_data.target}</b>
                        </div>
                        <div style="font-size:11px; color:#666; margin-bottom:5px;">
                             Jumlah: <b>${trx.product_data.qty}</b>
                        </div>

                        <div id="detail-${trx.provider_oid}" style="background:#f9f9f9; padding:8px; border-radius:6px; font-size:11px; margin-top:5px; border:1px dashed #ddd;">
                            <i class="fas fa-sync fa-spin"></i> Cek Pusat...
                        </div>
                    </div>
                `;
            });

            html += '</div>';
            html += '<div style="text-align:center; font-size:10px; color:#aaa; margin-top:5px;"><i class="fas fa-arrows-alt-h"></i> Geser ke samping</div>';

            container.innerHTML = html;

            smmTrx.forEach(trx => checkLiveStatusSMM(trx.provider_oid, trx.order_id));

        } else {
            container.innerHTML = 'Gagal memuat history.';
        }
    } catch (e) {
        container.innerHTML = 'Error koneksi.';
    }
}

async function checkLiveStatusSMM(providerOid, localOrderId) {
    const { token } = checkLogin();
    const badgeEl = document.getElementById(`badge-${providerOid}`);
    const detailEl = document.getElementById(`detail-${providerOid}`);

    try {
        const res = await fetch('/api/sosmed/check-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, provider_oid: providerOid, order_id_local: localOrderId })
        });
        const json = await res.json();

        if (json.success) {
            const d = json.data;

            let color = '#f39c12';
            if (d.status === 'Success') color = '#2ecc71';
            if (d.status === 'Error' || d.status === 'Partial') color = '#e74c3c';
            if (d.status === 'Pending') color = '#95a5a6';

            if (badgeEl) {
                badgeEl.style.background = color;
                badgeEl.innerText = d.status.toUpperCase();
            }

            if (detailEl) {
                detailEl.innerHTML = `
                    <div style="display:flex; justify-content:space-between;">
                        <span>🏁 Awal: <b>${d.start_count || 0}</b></span>
                        <span>📉 Sisa: <b>${d.remains || 0}</b></span>
                    </div>
                `;
            }
        } else {
            if (detailEl) detailEl.innerHTML = '<span style="color:red;">Gagal cek pusat</span>';
            if (badgeEl) badgeEl.innerText = "UNKNOWN";
        }
    } catch (e) {
        console.log(e);
    }
}

// ============ RIWAYAT TRANSFER ============
function checkNewTransfer() {
    const lastCheck = localStorage.getItem('lastTransferCheck') || 0;
    const now = Date.now();

    if (now - lastCheck > 10000) {
        localStorage.setItem('lastTransferCheck', now);

        const lastTransfer = JSON.parse(localStorage.getItem('lastTransfer') || 'null');

        if (lastTransfer && lastTransfer.time > lastCheck) {
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            if (user.username) {
                if (lastTransfer.recipient === user.username) {
                    Swal.fire({
                        icon: 'success',
                        title: '💸 Saldo Masuk!',
                        html: `<div style="text-align:center;">
                            <div style="font-size:20px; font-weight:bold; color:var(--primary-color); margin:5px 0;">
                                Rp ${parseInt(lastTransfer.amount).toLocaleString('id-ID')}
                            </div>
                            <div style="font-size:13px;">
                                dari <b>@${lastTransfer.sender}</b>
                            </div>
                        </div>`,
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 5000,
                        timerProgressBar: true,
                        background: '#e8f5e9',
                        iconColor: '#2ecc71',
                        didOpen: (toast) => {
                            toast.addEventListener('mouseenter', Swal.stopTimer);
                            toast.addEventListener('mouseleave', Swal.resumeTimer);
                        }
                    });
                } else if (lastTransfer.sender === user.username) {
                    Swal.fire({
                        icon: 'success',
                        title: '📤 Transfer Berhasil',
                        html: `<div style="text-align:center;">
                            <div style="font-size:20px; font-weight:bold; color:var(--primary-color); margin:5px 0;">
                                Rp ${parseInt(lastTransfer.amount).toLocaleString('id-ID')}
                            </div>
                            <div style="font-size:13px;">
                                ke <b>@${lastTransfer.recipient}</b>
                            </div>
                        </div>`,
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 5000,
                        timerProgressBar: true,
                        background: '#e3f2fd',
                        iconColor: '#2196F3'
                    });
                }
            }

            localStorage.removeItem('lastTransfer');
        }
    }
}

// ============ RIWAYAT TRANSAKSI ============
async function loadHistory() {
    const container = document.getElementById('trx-container');
    if (!container) return;

    container.innerHTML = '<div style="text-align:center; padding:50px; color:#888;"><i class="fas fa-spinner fa-spin fa-2x"></i><br><br>Memuat data...</div>';

    const { token } = checkLogin();
    if (!token) {
        container.innerHTML = '<div style="text-align:center; padding:50px;">Silakan login untuk melihat riwayat.</div>';
        return;
    }

    try {
        const res = await fetch('/api/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        const data = await res.json();

        if (data.success) {
            allTransactions = data.data;
            document.querySelectorAll('.tab-item-clean').forEach(t => t.classList.remove('active'));
            document.querySelector('.tab-item-clean[data-filter="all"]').classList.add('active');
            renderTransactionList(allTransactions);
        } else {
            container.innerHTML = '<div style="text-align:center; padding:50px;">Gagal memuat data.</div>';
        }
    } catch (e) {
        container.innerHTML = '<div style="text-align:center; padding:50px;">Gagal terhubung ke server.</div>';
    }
}

function renderTransactionList(dataList) {
    const container = document.getElementById('trx-container');
    const emptyState = document.getElementById('empty-state');
    container.innerHTML = '';

    if (dataList.length > 0) {
        emptyState.style.display = 'none';
        dataList.forEach(trx => {
            let badgeClass = 'st-pending';
            let statusLabel = trx.status.toUpperCase();
            let icon = '<i class="fas fa-clock" style="color:#f39c12"></i>';

            if (trx.status === 'success') {
                badgeClass = 'st-sukses';
                statusLabel = 'SUKSES';
                icon = '<i class="fas fa-check-circle" style="color:#2ecc71"></i>';
            } else if (trx.status === 'canceled') {
                badgeClass = 'st-gagal';
                statusLabel = 'DIBATALKAN';
                icon = '<i class="fas fa-times-circle" style="color:#e74c3c"></i>';
            } else if (trx.status === 'expired') {
                badgeClass = 'st-gagal';
                statusLabel = 'EXPIRED';
                icon = '<i class="fas fa-exclamation-circle" style="color:#e74c3c"></i>';
            }

            const item = document.createElement('div');
            item.className = 'trx-item';
            item.onclick = () => openInvoice(trx);
            item.style.cursor = 'pointer';

            let title = 'Deposit Saldo';
            let pName = (trx.product_data && trx.product_data.product_name) ? trx.product_data.product_name : '';

            if (trx.type === 'buy_panel') title = pName ? `Beli Panel ${pName}` : 'Beli Panel';
            else if (trx.type === 'buy_script') title = pName ? `Beli Script ${pName}` : 'Beli Script';
            else if (trx.type === 'buy_murid') title = pName ? `Join Kelas ${pName}` : 'Join Murid';
            else if (trx.type === 'buy_vps') title = pName ? `Order VPS ${pName}` : 'Order VPS';
            else if (trx.type === 'buy_app') title = pName ? `Beli App ${pName}` : 'Beli App Premium';
            else if (trx.type === 'buy_sosmed') title = pName ? `Suntuik ${pName}` : 'Layanan Sosmed';
            else if (trx.type === 'buy_ewallet') {
                if (trx.status === 'success') title = `Berhasil topup ${pName || 'E-Wallet'}`;
                else title = `Topup ${pName || 'E-Wallet'}`;
            } else if (trx.type === 'buy_game') {
                if (trx.status === 'success') title = `Berhasil topup ${pName || 'Game'}`;
                else title = `Topup ${pName || 'Game'}`;
            } else if (trx.type === 'buy_nokos') {
                title = pName ? `Beli Nokos ${pName}` : 'Beli Nomor OTP';
                if (trx.product_data && trx.product_data.nomor) {
                    title += ` - ${trx.product_data.nomor}`;
                }
            } else if (trx.type === 'transfer_out') {
                const recipient = (trx.product_data && trx.product_data.recipient) ? trx.product_data.recipient : 'Seseorang';
                title = `Transfer ke @${recipient}`;
            } else if (trx.type === 'transfer_in') {
                const sender = (trx.product_data && trx.product_data.sender) ? trx.product_data.sender : 'Seseorang';
                title = `Terima dari @${sender}`;
            }

            item.innerHTML = `
                <div style="display:flex; align-items:center; gap:12px;">
                    <div style="font-size:24px;">${icon}</div>
                    <div>
                        <div style="font-weight:bold; font-size:14px; margin-bottom:2px; line-height:1.2;">${title}</div>
                        <div style="font-size:11px; color:#888;">${new Date(trx.date).toLocaleString()}</div>
                        <div style="font-size:10px; color:#aaa; margin-top:2px;">#${trx.order_id}</div>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:bold; color:var(--primary-color); font-size:14px;">Rp ${parseInt(trx.amount).toLocaleString()}</div>
                    <span class="status-badge ${badgeClass}" style="margin-top:5px; display:inline-block;">${statusLabel}</span>
                </div>
            `;
            container.appendChild(item);
        });
    } else {
        emptyState.style.display = 'flex';
    }
}

function openInvoice(trx) {
    document.getElementById('d-orderId').innerText = trx.order_id;
    document.getElementById('d-date').innerText = new Date(trx.date).toLocaleString();
    document.getElementById('d-total').innerText = 'Rp ' + parseInt(trx.pay_amount).toLocaleString();

    let itemName = 'Saldo Deposit';
    const pName = (trx.product_data && trx.product_data.product_name) ? trx.product_data.product_name : '';

    if (trx.type === 'buy_panel') itemName = 'Panel ' + (pName || 'Sultan');
    else if (trx.type === 'buy_script') itemName = 'Script ' + (pName || 'Bot');
    else if (trx.type === 'buy_murid') itemName = 'Join Murid ' + (pName || 'Kelas');
    else if (trx.type === 'buy_vps') itemName = 'VPS ' + (pName || 'Server');
    else if (trx.type === 'buy_app') itemName = 'App ' + (pName || 'Premium');
    else if (trx.type === 'buy_sosmed') itemName = 'SMM: ' + (pName || 'Layanan') + `\n(Target: ${trx.product_data?.target || '-'})`;
    else if (trx.type === 'buy_ewallet') {
        const target = trx.product_data?.target || '-';
        itemName = `${pName || 'Topup E-Wallet'}\n(Nomor: ${target})`;
    } else if (trx.type === 'buy_game') {
        const target = trx.product_data?.target || '-';
        itemName = `${pName || 'Topup Game'}\n(ID Player: ${target})`;
    } else if (trx.type === 'buy_nokos') {
        let nomorInfo = '';
        if (trx.product_data && trx.product_data.nomor) {
            nomorInfo = ` (${trx.product_data.nomor})`;
        }
        itemName = 'Nokos ' + (pName || 'OTP') + nomorInfo;
    } else if (trx.type === 'transfer_out') {
        const recipient = (trx.product_data && trx.product_data.recipient) ? trx.product_data.recipient : 'Seseorang';
        itemName = `Transfer Saldo ke @${recipient}`;
    } else if (trx.type === 'transfer_in') {
        const sender = (trx.product_data && trx.product_data.sender) ? trx.product_data.sender : 'Seseorang';
        itemName = `Terima Saldo dari @${sender}`;
    }

    document.getElementById('d-item').innerText = itemName;

    const statusEl = document.getElementById('d-status');
    const headerEl = document.getElementById('invHeader');
    const titleEl = document.getElementById('invStatusTitle');
    const iconBg = document.getElementById('invIconBg');
    const iconEl = document.getElementById('invIcon');
    document.getElementById('actionPendingArea').style.display = 'none';
    document.getElementById('actionExpiredArea').style.display = 'none';

    if (trx.status === 'success') {
        statusEl.innerText = 'BERHASIL';
        statusEl.style.color = '#2ecc71';
        headerEl.style.background = '#2ecc71';
        titleEl.innerText = 'Transaksi Berhasil';
        iconBg.style.background = '#e8f5e9';
        iconBg.style.color = '#2ecc71';
        iconEl.className = 'fas fa-check';
    } else if (trx.status === 'pending') {
        statusEl.innerText = 'MENUNGGU PEMBAYARAN';
        statusEl.style.color = '#e67e22';
        headerEl.style.background = '#e67e22';
        titleEl.innerText = 'Menunggu Pembayaran';
        iconBg.style.background = '#fff3e0';
        iconBg.style.color = '#e67e22';
        iconEl.className = 'fas fa-hourglass-half';
        document.getElementById('actionPendingArea').style.display = 'block';
        document.getElementById('btnLanjutBayar').onclick = () => continuePayment(trx);
    } else {
        const label = trx.status === 'expired' ? 'KADALUARSA' : 'DIBATALKAN';
        statusEl.innerText = label;
        statusEl.style.color = '#e74c3c';
        headerEl.style.background = '#e74c3c';
        titleEl.innerText = 'Transaksi ' + (trx.status === 'expired' ? 'Kadaluarsa' : 'Gagal');
        iconBg.style.background = '#ffebee';
        iconBg.style.color = '#e74c3c';
        iconEl.className = 'fas fa-times';
        if (trx.status === 'expired') document.getElementById('actionExpiredArea').style.display = 'block';
    }
    invoiceModal.classList.add('show');
}

function continuePayment(trx) {
    const createdTime = new Date(trx.date).getTime();
    const expireTime = createdTime + (5 * 60 * 1000);
    const now = Date.now();

    if (now > expireTime) {
        showCustomAlert("Waktu pembayaran telah habis.", "Kadaluarsa");
        invoiceModal.classList.remove('show');
        loadHistory();
        return;
    }

    let panelUser = null;
    let prodName = null;

    if (trx.type === 'buy_panel' && trx.product_data) {
        panelUser = trx.product_data.username_panel;
    }
    if (trx.type === 'buy_script' && trx.product_data) {
        prodName = trx.product_data.product_name;
    }
    if (trx.type === 'buy_murid' && trx.product_data) {
        prodName = trx.product_data.product_name;
    }

    localStorage.setItem('pendingTrx', JSON.stringify({
        order_id: trx.order_id,
        pay_amount: trx.pay_amount,
        deposit_amount: trx.amount,
        qr_string: trx.qr_string,
        expire_at: expireTime,
        username: trx.username,
        trx_type: trx.type,
        username_panel: panelUser,
        product_name: prodName
    }));
    window.location.href = '/payment';
}

// ============ AKTIVITAS PUBLIK ============
async function checkPublicActivity(isFirstLoad = false) {
    try {
        const res = await fetch('/api/public/activity');
        const json = await res.json();

        if (json.success && json.data.length > 0) {
            activityData = json.data;
            localStorage.setItem('cachedActivityData', JSON.stringify(activityData));
            const newest = activityData[0];
            const savedLatestId = localStorage.getItem('latestActivityId');

            updateInfoTabsRedDots();

            const readList = JSON.parse(localStorage.getItem('read_items') || '[]');
            const hasUnread = activityData.some(item => !readList.includes(item.id));
            const bellBadge = document.getElementById('infoBadge');
            const bellIcon = document.querySelector('.nav-item[data-target="info"] i');

            if (hasUnread && !isInfoMenuOpened) {
                if (bellBadge) bellBadge.classList.add('show');
                if (bellIcon) bellIcon.classList.add('shake-bell');
            } else {
                if (bellBadge) bellBadge.classList.remove('show');
                if (bellIcon) bellIcon.classList.remove('shake-bell');
            }

            if (isFirstLoad || newest.id !== savedLatestId) {
                const isBigPopupOpen = document.querySelector('.swal2-popup:not(.swal2-toast)');
                
                if (!isBigPopupOpen) {
                    showToastNotification(newest);
                }
                localStorage.setItem('latestActivityId', newest.id);
            }
        }
    } catch (e) {
        console.log("Gagal cek aktivitas");
    }
}

function showToastNotification(item) {
    let msg = "";
    let icon = "success";

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const myUsername = user.username || '';

    if (item.type === 'transaction') {
        if (item.trx_type && item.trx_type.includes('transfer')) {
            let sender = item.name;
            let rawDesc = item.desc;

            let recipientMatch = rawDesc.match(/@([a-zA-Z0-9_]+)/);
            let recipient = recipientMatch ? recipientMatch[1] : 'seseorang';
            let amountMatch = rawDesc.match(/Rp\s*([0-9.,]+)/i);
            let amountStr = amountMatch ? `Rp ${amountMatch[1]}` : 'Uang';

            if (myUsername === recipient) {
                msg = `<span style="color:#2ecc71; font-weight:bold;">📥 Dana Masuk!</span><br>Menerima ${amountStr} dari @${sender}`;
            } else if (myUsername === sender) {
                msg = `<span style="color:#3498db; font-weight:bold;">📤 Transfer Berhasil</span><br>Mengirim ${amountStr} ke @${recipient}`;
            } else {
                msg = `💸 <b>@${sender}</b> transfer ${amountStr} ke <b>@${recipient}</b>`;
            }
        } else {
            let action = "order";
            if (item.trx_type === 'deposit') action = "deposit";
            else if (item.trx_type === 'buy_game' || item.trx_type === 'buy_ewallet') action = "topup";
            else if (item.trx_type === 'extend_panel') action = "melakukan";

            let product = item.desc;

            if (product.length > 20) product = product.substring(0, 20) + "..";
            msg = `<b>${item.name}</b> ${action} <b>${product}</b>`;
        }
    } else {
        msg = item.desc.length > 40 ? item.desc.substring(0, 40) + "..." : item.desc;
        icon = 'info';
    }

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: false,
        customClass: { popup: 'small-toast' },
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });

    Toast.fire({
        icon: icon,
        html: `<div style="font-size:12px; line-height:1.4;">${msg}</div>`,
        width: 300,
        padding: '10px'
    });
}

// ============ PROMO ============
function getCurrentPage() {
    const activePage = document.querySelector('.page-section.active');
    if (!activePage) return null;
    return activePage.id.replace('page-', '');
}

function resetPromo(page) {
    if (!page) page = getCurrentPage();
    if (!page) return;

    appliedPromo[page] = null;

    const prefix = page === 'panel' ? 'Panel' :
        page === 'script' ? 'Script' :
            page === 'murid' ? 'Murid' :
                page === 'vps' ? 'VPS' :
                    page === 'apps' ? 'Apps' :
                        page === 'sosmed' ? 'Sosmed' :
                            page === 'subdomain' ? 'Sub' :
                                page === 'nokos' ? 'Nokos' :
                                    page === 'game' ? 'Game' :
                                        page === 'ewallet' ? 'Ewallet' :
                                            page === 'ewallet-gd' ? 'EwalletGD' :
                                                page === 'ewallet-gopay' ? 'EwalletGopay' :
                                                    page === 'ewallet-ovo' ? 'Ovo' :
                                                        page === 'ewallet-shopee' ? 'Shopee' :
                                                            page === 'ewallet-linkaja' ? 'Linkaja' :
                                                                page === 'ewallet-astrapay' ? 'Astrapay' :
                                                                    page === 'ewallet-isaku' ? 'Isaku' :
                                                                        page === 'ewallet-kaspro' ? 'Kaspro' : '';

    const codeInput = document.getElementById(`promoCode${prefix}`);
    const resultDiv = document.getElementById(`promoResult${prefix}`);
    const discountDiv = document.getElementById(`discountInfo${prefix}`);

    if (codeInput) codeInput.value = '';
    if (resultDiv) {
        resultDiv.style.display = 'none';
        resultDiv.innerHTML = '';
    }
    if (discountDiv) discountDiv.style.display = 'none';
}

function setupPromoListeners() {
    const pages = ['panel', 'script', 'murid', 'vps', 'apps', 'sosmed', 'subdomain', 'nokos', 'game', 'ewallet', 'ewallet-gd', 'ewallet-gopay', 'ewallet-ovo', 'ewallet-shopee', 'ewallet-linkaja', 'ewallet-astrapay', 'ewallet-isaku', 'ewallet-kaspro'];

    pages.forEach(page => {
        const prefix = page === 'panel' ? 'Panel' :
            page === 'script' ? 'Script' :
                page === 'murid' ? 'Murid' :
                    page === 'vps' ? 'VPS' :
                        page === 'apps' ? 'Apps' :
                            page === 'sosmed' ? 'Sosmed' :
                                page === 'subdomain' ? 'Sub' :
                                    page === 'nokos' ? 'Nokos' :
                                        page === 'game' ? 'Game' :
                                            page === 'ewallet' ? 'Ewallet' :
                                                page === 'ewallet-gd' ? 'EwalletGD' :
                                                    page === 'ewallet-gopay' ? 'EwalletGopay' :
                                                        page === 'ewallet-ovo' ? 'Ovo' :
                                                            page === 'ewallet-shopee' ? 'Shopee' :
                                                                page === 'ewallet-linkaja' ? 'Linkaja' :
                                                                    page === 'ewallet-astrapay' ? 'Astrapay' :
                                                                        page === 'ewallet-isaku' ? 'Isaku' :
                                                                            page === 'ewallet-kaspro' ? 'Kaspro' : '';

        const btn = document.getElementById(`btnApplyPromo${prefix}`);
        const input = document.getElementById(`promoCode${prefix}`);

        if (btn && input) {
            btn.replaceWith(btn.cloneNode(true));
            const newBtn = document.getElementById(`btnApplyPromo${prefix}`);

            newBtn.addEventListener('click', async function(e) {
                e.preventDefault();

                const code = input.value.trim().toUpperCase();
                if (!code) {
                    showPromoResult(page, 'Masukkan kode promo', 'error');
                    return;
                }

                let price = 0;
                let productCode = '';
                let category = page;

                if (page === 'panel') {
                    price = selectedPrice;
                    productCode = selectedProductCode;
                } else if (page === 'script') {
                    price = selectedScriptPrice;
                    productCode = selectedScriptCode;
                } else if (page === 'murid') {
                    price = selectedMuridPrice;
                    productCode = selectedMuridCode;
                } else if (page === 'vps') {
                    price = selectedVPSPrice;
                    productCode = selectedVPSCode;
                } else if (page === 'apps') {
                    price = selectedAppPrice;
                    productCode = selectedAppCode;
                } else if (page === 'sosmed') {
                    price = parseInt(document.getElementById('footerPriceSosmed').innerText.replace(/[^0-9]/g, '')) || 0;
                    productCode = selectedSosmedService ? selectedSosmedService.id : '';
                } else if (page === 'subdomain') {
                    price = selectedZone ? selectedZone.price : 0;
                    productCode = selectedZone ? selectedZone.id : '';
                } else if (page === 'nokos') {
                    price = selectedLayanan ? parseInt(selectedLayanan.harga) : 0;
                    productCode = selectedLayanan ? selectedLayanan.kode : '';
                } else if (page === 'game') {
                    price = selectedGamePrice;
                    productCode = selectedGameCode;
                } else if (page === 'ewallet') {
                    price = selectedEwalletPrice;
                    productCode = selectedEwalletCode;
                } else if (page === 'ewallet-gd') {
                    price = selectedEwalletPriceGD;
                    productCode = selectedEwalletCodeGD;
                } else if (page === 'ewallet-gopay') {
                    price = selectedEwalletPriceGopay;
                    productCode = selectedEwalletCodeGopay;
                } else if (page === 'ewallet-ovo') {
                    price = selectedOvoPrice;
                    productCode = selectedOvoCode;
                } else if (page === 'ewallet-shopee') {
                    price = selectedShopeePrice;
                    productCode = selectedShopeeCode;
                } else if (page === 'ewallet-linkaja') {
                    price = selectedLinkajaPrice;
                    productCode = selectedLinkajaCode;
                } else if (page === 'ewallet-astrapay') {
                    price = selectedAstrapayPrice;
                    productCode = selectedAstrapayCode;
                } else if (page === 'ewallet-isaku') {
                    price = selectedIsakuPrice;
                    productCode = selectedIsakuCode;
                } else if (page === 'ewallet-kaspro') {
                    price = selectedKasproPrice;
                    productCode = selectedKasproCode;
                }

                if (price <= 0) {
                    showPromoResult(page, 'Pilih produk terlebih dahulu', 'error');
                    return;
                }

                originalPrice[page] = price;

                newBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                newBtn.disabled = true;

                await checkPromoAPI(page, code, category, productCode, price, prefix);

                newBtn.innerHTML = 'CEK';
                newBtn.disabled = false;
            });

            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    newBtn.click();
                }
            });
        }
    });
}

async function checkPromoAPI(page, code, category, productCode, price, prefix) {
    const { token } = checkLogin();
    if (!token) {
        showPromoResult(page, 'Silakan login terlebih dahulu', 'error');
        return;
    }

    try {
        const res = await fetch('/api/check-promo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token,
                code,
                category,
                product_code: productCode,
                amount: price
            })
        });

        const data = await res.json();

        if (data.success) {
            appliedPromo[page] = data.promo;

            showPromoResult(page, `${data.promo.name || 'Promo'}: Diskon Rp ${data.promo.discount_amount.toLocaleString()}`, 'success');

            const discountAmountEl = document.getElementById(`discountAmount${prefix}`);
            const finalPriceEl = document.getElementById(`finalPrice${prefix}`);
            const discountDiv = document.getElementById(`discountInfo${prefix}`);

            if (discountAmountEl) discountAmountEl.innerText = `- Rp ${data.promo.discount_amount.toLocaleString()}`;
            if (finalPriceEl) finalPriceEl.innerText = `Rp ${data.promo.final_amount.toLocaleString()}`;
            if (discountDiv) discountDiv.style.display = 'block';

            updateFooterPriceByPage(page, data.promo.final_amount);

        } else {
            appliedPromo[page] = null;
            showPromoResult(page, data.message, 'error');

            const discountDiv = document.getElementById(`discountInfo${prefix}`);
            if (discountDiv) discountDiv.style.display = 'none';

            updateFooterPriceByPage(page, originalPrice[page]);
        }

    } catch (e) {
        console.log('Promo API Error:', e);
        showPromoResult(page, 'Gagal terhubung ke server', 'error');
    }
}

function showPromoResult(page, message, type) {
    const prefix = page === 'panel' ? 'Panel' :
        page === 'script' ? 'Script' :
            page === 'murid' ? 'Murid' :
                page === 'vps' ? 'VPS' :
                    page === 'apps' ? 'Apps' :
                        page === 'sosmed' ? 'Sosmed' :
                            page === 'subdomain' ? 'Sub' :
                                page === 'nokos' ? 'Nokos' :
                                    page === 'game' ? 'Game' :
                                        page === 'ewallet' ? 'Ewallet' :
                                            page === 'ewallet-gd' ? 'EwalletGD' :
                                                page === 'ewallet-gopay' ? 'EwalletGopay' :
                                                    page === 'ewallet-ovo' ? 'Ovo' :
                                                        page === 'ewallet-shopee' ? 'Shopee' :
                                                            page === 'ewallet-linkaja' ? 'Linkaja' :
                                                                page === 'ewallet-astrapay' ? 'Astrapay' :
                                                                    page === 'ewallet-isaku' ? 'Isaku' :
                                                                        page === 'ewallet-kaspro' ? 'Kaspro' : '';

    const resultDiv = document.getElementById(`promoResult${prefix}`);
    if (!resultDiv) return;

    resultDiv.style.display = 'flex';
    resultDiv.className = `promo-result ${type}`;

    if (type === 'success') {
        resultDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    } else {
        resultDiv.innerHTML = `<i class="fas fa-times-circle"></i> ${message}`;
    }

    if (type === 'success') {
        setTimeout(() => {
            if (resultDiv) resultDiv.style.display = 'none';
        }, 5000);
    }
}

function updateFooterPriceByPage(page, price) {
    if (page === 'panel') {
        document.getElementById('footerPrice').innerText = 'Rp ' + price.toLocaleString();
    } else if (page === 'script') {
        document.getElementById('footerPriceScript').innerText = 'Rp ' + price.toLocaleString();
    } else if (page === 'murid') {
        document.getElementById('footerPriceMurid').innerText = 'Rp ' + price.toLocaleString();
    } else if (page === 'vps') {
        document.getElementById('footerPriceVPS').innerText = 'Rp ' + price.toLocaleString();
    } else if (page === 'apps') {
        document.getElementById('footerPriceApps').innerText = 'Rp ' + price.toLocaleString();
    } else if (page === 'sosmed') {
        document.getElementById('footerPriceSosmed').innerText = 'Rp ' + price.toLocaleString();
    } else if (page === 'subdomain') {
        document.getElementById('footerPriceSub').innerText = 'Rp ' + price.toLocaleString();
    } else if (page === 'nokos') {
        document.getElementById('footerPriceNokos').innerText = 'Rp ' + price.toLocaleString();
    } else if (page === 'game') {
        document.getElementById('footerPriceGame').innerText = 'Rp ' + price.toLocaleString();
    } else if (page === 'ewallet') {
        document.getElementById('footerPriceEwallet').innerText = 'Rp ' + price.toLocaleString();
    } else if (page === 'ewallet-gd') {
        document.getElementById('footerPriceEwalletGD').innerText = 'Rp ' + price.toLocaleString();
    } else if (page === 'ewallet-gopay') {
        document.getElementById('footerPriceEwalletGopay').innerText = 'Rp ' + price.toLocaleString();
    } else if (page === 'ewallet-ovo') {
        document.getElementById('footerPriceOvo').innerText = 'Rp ' + price.toLocaleString();
    } else if (page === 'ewallet-shopee') {
        document.getElementById('footerPriceShopee').innerText = 'Rp ' + price.toLocaleString();
    } else if (page === 'ewallet-linkaja') {
        document.getElementById('footerPriceLinkaja').innerText = 'Rp ' + price.toLocaleString();
    } else if (page === 'ewallet-astrapay') {
        document.getElementById('footerPriceAstrapay').innerText = 'Rp ' + price.toLocaleString();
    } else if (page === 'ewallet-isaku') {
        document.getElementById('footerPriceIsaku').innerText = 'Rp ' + price.toLocaleString();
    } else if (page === 'ewallet-kaspro') {
        document.getElementById('footerPriceKaspro').innerText = 'Rp ' + price.toLocaleString();
    }
}

function getFinalPriceByPage(page) {
    if (appliedPromo[page]) {
        return appliedPromo[page].final_amount;
    }

    if (page === 'panel') return selectedPrice;
    if (page === 'script') return selectedScriptPrice;
    if (page === 'murid') return selectedMuridPrice;
    if (page === 'vps') return selectedVPSPrice;
    if (page === 'apps') return selectedAppPrice;
    if (page === 'sosmed') {
        const priceText = document.getElementById('footerPriceSosmed').innerText;
        return parseInt(priceText.replace(/[^0-9]/g, '')) || 0;
    }
    if (page === 'subdomain') return selectedZone ? selectedZone.price : 0;
    if (page === 'nokos') return selectedLayanan ? parseInt(selectedLayanan.harga) : 0;
    if (page === 'game') return selectedGamePrice;
    if (page === 'ewallet') return selectedEwalletPrice;
    if (page === 'ewallet-gd') return selectedEwalletPriceGD;
    if (page === 'ewallet-gopay') return selectedEwalletPriceGopay;
    if (page === 'ewallet-ovo') return selectedOvoPrice;
    if (page === 'ewallet-shopee') return selectedShopeePrice;
    if (page === 'ewallet-linkaja') return selectedLinkajaPrice;
    if (page === 'ewallet-astrapay') return selectedAstrapayPrice;
    if (page === 'ewallet-isaku') return selectedIsakuPrice;
    if (page === 'ewallet-kaspro') return selectedKasproPrice;

    return 0;
}

function getPromoDataByPage(page) {
    if (appliedPromo[page]) {
        return {
            code: appliedPromo[page].code,
            discount_amount: appliedPromo[page].discount_amount
        };
    }
    return null;
}

// ============ SIDEBAR MENU ============
function setupSidebarMenus() {
    const menuKelas = document.getElementById('menuKelasSaya');
    const modalKelas = document.getElementById('kelasModal');
    const contentKelas = document.getElementById('popupKelasContent');
    const btnCloseKelas = document.getElementById('btnCloseKelas');

    if (menuKelas) {
        menuKelas.addEventListener('click', async () => {
            closeSidebar();

            const { token } = checkLogin();
            if (!token) {
                Swal.fire('Login Dulu', 'Silakan login untuk mengakses halaman ini.', 'warning');
                return;
            }

            modalKelas.classList.add('show');
            contentKelas.innerHTML = '<div style="text-align:center; padding:20px;"><i class="fas fa-spinner fa-spin"></i> Memuat Data...</div>';

            try {
                const res = await fetch('/api/get-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });
                const d = await res.json();

                if (d.success && d.user.joined_murid && d.user.joined_murid.length > 0) {
                    let html = '<div class="panel-scroll-container">';

                    d.user.joined_murid.forEach(m => {
                        const groupLink = m.link || "https://wa.me/6281234567890?text=Min+minta+link+grup";

                        html += `
                            <div class="panel-card-item">
                                <div class="panel-card-header">
                                    <span style="font-weight:bold; color:var(--primary-color); font-size:13px;">${m.name}</span>
                                    <span style="font-size:10px; background:#2ecc71; color:white; padding:2px 6px; border-radius:4px;">AKTIF</span>
                                </div>
                                <div style="font-size:11px; color:#666; margin-bottom:15px;">
                                    Bergabung: ${new Date(m.date).toLocaleDateString('id-ID')}
                                </div>
                                <div style="background:#e3f2fd; padding:10px; border-radius:8px; font-size:12px; color:#1565c0; text-align:center; border:1px dashed #2196f3;">
                                    Silakan klik tombol di bawah untuk masuk ke grup mentoring.
                                </div>
                                
                                <a href="${groupLink}" target="_blank" style="margin-top:10px; background:#2980b9; color:white; text-decoration:none; padding:12px; border-radius:8px; display:flex; align-items:center; justify-content:center; gap:8px; font-weight:bold; font-size:13px; box-shadow:0 4px 6px rgba(41, 128, 185, 0.2);">
                                    <i class="fas fa-users"></i> GABUNG GRUP
                                </a>
                            </div>
                         `;
                    });

                    html += '</div>';
                    contentKelas.innerHTML = html;
                } else {
                    contentKelas.innerHTML = `
                        <div style="text-align:center; padding:30px; color:#888;">
                            <i class="fas fa-user-graduate" style="font-size:40px; margin-bottom:10px; color:#ddd;"></i>
                            <p>Anda belum bergabung di kelas apapun.</p>
                            <button onclick="document.getElementById('kelasModal').classList.remove('show'); switchPage('murid');" 
                                    style="margin-top:10px; background:var(--primary-color); color:white; border:none; padding:10px 20px; border-radius:20px; cursor:pointer; font-weight:bold;">
                                <i class="fas fa-plus"></i> Gabung Sekarang
                            </button>
                        </div>
                    `;
                }
            } catch (e) {
                contentKelas.innerHTML = 'Gagal memuat data.';
            }
        });
    }

    if (btnCloseKelas) btnCloseKelas.addEventListener('click', () => modalKelas.classList.remove('show'));
    if (modalKelas) modalKelas.addEventListener('click', (e) => { if (e.target === modalKelas) modalKelas.classList.remove('show'); });

    const menuDownload = document.getElementById('menuDownloadScript');
    const modalDownload = document.getElementById('scriptDownloadModal');
    const contentDownload = document.getElementById('popupScriptContent');
    const btnCloseDownload = document.getElementById('btnCloseScriptDownload');

    if (menuDownload) {
        menuDownload.addEventListener('click', async () => {
            closeSidebar();

            const { token } = checkLogin();
            if (!token) {
                Swal.fire('Login Dulu', 'Silakan login untuk mengakses halaman ini.', 'warning');
                return;
            }

            modalDownload.classList.add('show');
            contentDownload.innerHTML = '<div style="text-align:center; padding:20px;"><i class="fas fa-spinner fa-spin"></i> Memuat Data...</div>';

            try {
                const res = await fetch('/api/get-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });
                const d = await res.json();

                if (d.success && d.user.purchased_scripts && d.user.purchased_scripts.length > 0) {
                    let html = '<div class="panel-scroll-container">';

                    d.user.purchased_scripts.forEach(s => {
                        html += `
                            <div class="panel-card-item">
                                <div class="panel-card-header">
                                    <span style="font-weight:bold; color:var(--primary-color); font-size:13px;">${s.name}</span>
                                    <span style="font-size:10px; background:#2ecc71; color:white; padding:2px 6px; border-radius:4px;">OWNED</span>
                                </div>
                                <div style="font-size:11px; color:#666; margin-bottom:15px;">
                                    Dibeli pada: ${new Date(s.date).toLocaleDateString('id-ID')}
                                </div>
                                <a href="${s.link}" target="_blank" style="background:#3498db; color:white; text-decoration:none; padding:10px; border-radius:8px; display:block; text-align:center; font-weight:bold; font-size:12px;">
                                    <i class="fas fa-download"></i> DOWNLOAD SCRIPT
                                </a>
                            </div>
                         `;
                    });

                    html += '</div>';
                    contentDownload.innerHTML = html;
                } else {
                    contentDownload.innerHTML = `
                        <div style="text-align:center; padding:30px; color:#888;">
                            <i class="fas fa-file-code" style="font-size:40px; margin-bottom:10px; color:#ddd;"></i>
                            <p>Anda belum memiliki Script apapun.</p>
                            <button onclick="document.getElementById('scriptDownloadModal').classList.remove('show'); switchPage('script');" 
                                    style="margin-top:10px; background:var(--primary-color); color:white; border:none; padding:10px 20px; border-radius:20px; cursor:pointer; font-weight:bold;">
                                <i class="fas fa-shopping-cart"></i> Beli Sekarang
                            </button>
                        </div>
                    `;
                }
            } catch (e) {
                contentDownload.innerHTML = 'Gagal memuat.';
            }
        });
    }

    if (btnCloseDownload) btnCloseDownload.addEventListener('click', () => modalDownload.classList.remove('show'));
    if (modalDownload) modalDownload.addEventListener('click', (e) => { if (e.target === modalDownload) modalDownload.classList.remove('show'); });

    const menuPanel = document.getElementById('menuPanelPopup');
    const btnClosePanel = document.getElementById('btnClosePanelPopup');
    const panelContent = document.getElementById('popupPanelContent');

    if (menuPanel) {
        menuPanel.addEventListener('click', async () => {
            closeSidebar();
            const { token } = checkLogin();
            if (!token) {
                Swal.fire('Login Dulu', 'Silakan login untuk melihat panel.', 'warning');
                return;
            }

            if (panelPopupModal) panelPopupModal.classList.add('show');
            panelContent.innerHTML = '<div style="text-align:center; padding:20px;"><i class="fas fa-spinner fa-spin"></i> Memuat Data...</div>';

            try {
                const res = await fetch('/api/get-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });
                const d = await res.json();

                if (d.success && d.user.panels && d.user.panels.length > 0) {
                    let html = '<div class="panel-scroll-container">';

                    html += `
                        <div class="panel-card-item" style="justify-content:center; align-items:center; background:#fff0f0; border:1px dashed #e74c3c;">
                            <i class="fas fa-shield-alt" style="font-size:30px; color:#e74c3c; margin-bottom:10px;"></i>
                            <h4 style="font-size:14px; color:#c0392b; margin:0;">Klaim Garansi</h4>
                            <p style="font-size:10px; color:#555; text-align:center; margin:5px 0 10px 0;">Panel mati? Gunakan kode garansi Anda.</p>
                            <button onclick="openClaimModal()" style="background:#e74c3c; color:white; border:none; padding:8px 15px; border-radius:20px; font-size:12px; cursor:pointer; font-weight:bold;">
                               <i class="fas fa-tools"></i> Klaim Sekarang
                            </button>
                        </div>
                    `;

                    d.user.panels.forEach(p => {
                        let statusColor = '#2ecc71';
                        let statusText = 'AKTIF';

                        if (p.status === 'suspended') {
                            statusColor = '#f39c12';
                            statusText = 'SUSPEND';
                        }
                        if (p.status === 'deleted') {
                            statusColor = '#e74c3c';
                            statusText = 'DELETED';
                        }

                        const ram = p.spec ? p.spec.ram : '?';
                        const cpu = p.spec ? p.spec.cpu : '?';
                        const disk = p.spec ? p.spec.disk : '?';

                        const copyText = `DATA PANEL ANDA\n\nUsername : ${p.username_panel}\nPassword : ${p.password_panel}\nLink Login : ${p.domain}\nKode Garansi : ${p.warranty_code}\n\nSPESIFIKASI\nRAM : ${ram}MB\nCPU : ${cpu}%\nDISK : ${disk}MB\n\nNote: Simpan kode garansi baik-baik.`;

                        html += `
                            <div class="panel-card-item">
                                <div class="panel-card-header">
                                    <span style="font-weight:bold; color:var(--primary-color); font-size:13px;">${p.product}</span>
                                    <span style="font-size:10px; background:${statusColor}; color:white; padding:2px 6px; border-radius:4px; font-weight:bold;">${statusText}</span>
                                </div>
                                
                                <div class="panel-label">Username</div>
                                <div class="panel-val">${p.username_panel}</div>
                                
                                <div class="panel-label">Password</div>
                                <div class="panel-val">${p.password_panel}</div>

                                <div class="panel-label">Login URL</div>
                                <div class="panel-val"><a href="${p.domain}" target="_blank" style="color:#3498db; text-decoration:none;">Buka Panel <i class="fas fa-external-link-alt" style="font-size:10px;"></i></a></div>

                                <div class="panel-label">Kode Garansi</div>
                                <div class="panel-val highlight" style="background:#f0f0f0; padding:2px 5px; border-radius:3px;">${p.warranty_code}</div>
                                
                                <div style="margin-top:10px; border-top:1px dashed #eee; padding-top:5px; font-size:10px; color:#666; display:flex; justify-content:space-between;">
                                    <span>Exp: ${new Date(p.expired_at).toLocaleDateString('id-ID')}</span>
                                </div>

                                <button class="btn-copy-panel" onclick="copyToClipboard(\`${copyText}\`)">
                                    <i class="fas fa-copy"></i> SALIN DATA LENGKAP
                                </button>
                            </div>
                        `;
                    });

                    html += '</div>';
                    html += '<div style="text-align:center; font-size:11px; color:#aaa; margin-top:10px;"><i class="fas fa-arrows-alt-h"></i> Geser ke samping untuk melihat panel lain</div>';

                    panelContent.innerHTML = html;
                } else {
                    panelContent.innerHTML = `
                        <div style="text-align:center; padding:30px; color:#888;">
                            <i class="fas fa-box-open" style="font-size:40px; margin-bottom:10px; color:#ddd;"></i>
                            <p>Anda belum memiliki layanan panel aktif.</p>
                            <button onclick="document.getElementById('panelPopupModal').classList.remove('show'); switchPage('panel');" 
                                    style="margin-top:10px; background:var(--primary-color); color:white; border:none; padding:10px 20px; border-radius:20px; cursor:pointer; font-weight:bold;">
                                <i class="fas fa-shopping-cart"></i> Beli Sekarang
                            </button>
                        </div>
                    `;
                }
            } catch (e) {
                console.error(e);
                panelContent.innerHTML = '<div style="text-align:center; color:#e74c3c; padding:20px;">Gagal memuat data. Periksa koneksi internet.</div>';
            }
        });
    }

    if (btnClosePanel) {
        btnClosePanel.addEventListener('click', () => {
            if (panelPopupModal) panelPopupModal.classList.remove('show');
        });
    }

    if (panelPopupModal) {
        panelPopupModal.addEventListener('click', (e) => {
            if (e.target === panelPopupModal) panelPopupModal.classList.remove('show');
        });
    }

    const menuAppSaya = document.getElementById('menuAppSaya');
    const modalAppSaya = document.getElementById('appSayaModal');
    const contentAppSaya = document.getElementById('popupAppSayaContent');
    const btnCloseAppSaya = document.getElementById('btnCloseAppSaya');

    if (menuAppSaya) {
        menuAppSaya.addEventListener('click', async () => {
            closeSidebar();
            const { token } = checkLogin();
            if (!token) {
                Swal.fire('Login Dulu', 'Silakan login untuk mengakses halaman ini.', 'warning');
                return;
            }

            modalAppSaya.classList.add('show');
            contentAppSaya.innerHTML = '<div style="text-align:center; padding:20px;"><i class="fas fa-spinner fa-spin"></i> Memuat Data...</div>';

            try {
                const res = await fetch('/api/get-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });
                const d = await res.json();

                if (d.success && d.user.purchased_apps && d.user.purchased_apps.length > 0) {
                    let html = '<div class="panel-scroll-container">';
                    const adminNumber = "6281234567890";

                    d.user.purchased_apps.reverse().forEach(a => {
                        const waText = `Halo Admin, saya butuh bantuan/tutorial untuk aplikasi: ${a.name}`;
                        const waLink = `https://wa.me/${adminNumber}?text=${encodeURIComponent(waText)}`;

                        html += `
                            <div class="panel-card-item">
                                <div class="panel-card-header">
                                    <span style="font-weight:bold; color:#c0392b; font-size:13px;">${a.name}</span>
                                    <span style="font-size:10px; background:#2ecc71; color:white; padding:2px 6px; border-radius:4px;">AKTIF</span>
                                </div>
                                
                                <div style="background:#f9f9f9; padding:10px; border-radius:6px; border:1px dashed #ccc; font-family:monospace; word-break:break-all; font-size:12px; color:#333; margin-bottom:8px; height:60px; overflow-y:auto;">
                                    ${a.data}
                                </div>

                                <div style="font-size:10px; color:#666; margin-bottom:5px; background:#fff3cd; padding:5px; border-radius:4px; border:1px solid #ffeeba;">
                                    <b><i class="fas fa-info-circle"></i> Info:</b> ${a.tutorial || 'Ikuti instruksi admin.'}
                                </div>

                                <div style="font-size:9px; color:#999; margin-bottom:10px; text-align:right;">
                                    ${new Date(a.date).toLocaleDateString()}
                                </div>

                                <a href="${waLink}" target="_blank" style="display:block; width:100%; background:#25D366; color:white; border:none; padding:8px; border-radius:5px; text-align:center; text-decoration:none; font-weight:bold; font-size:11px; margin-bottom:5px;">
                                    <i class="fab fa-whatsapp"></i> TUTOR CHAT ADMIN
                                </a>

                                <button onclick="copyToClipboard('${a.data}')" style="width:100%; background:#333; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer; font-weight:bold; font-size:11px;">
                                    <i class="fas fa-copy"></i> SALIN AKUN
                                </button>
                            </div>
                        `;
                    });
                    html += '</div>';
                    html += '<div style="text-align:center; font-size:10px; color:#aaa; margin-top:5px;"><i class="fas fa-arrows-alt-h"></i> Geser ke samping</div>';

                    contentAppSaya.innerHTML = html;
                } else {
                    contentAppSaya.innerHTML = `
                        <div style="text-align:center; padding:30px; color:#888;">
                            <i class="fas fa-mobile-alt" style="font-size:40px; margin-bottom:10px; color:#ddd;"></i>
                            <p>Anda belum memiliki Aplikasi apapun.</p>
                            <button onclick="document.getElementById('appSayaModal').classList.remove('show'); switchPage('apps');" 
                                    style="margin-top:10px; background:var(--primary-color); color:white; border:none; padding:10px 20px; border-radius:20px; cursor:pointer; font-weight:bold;">
                                <i class="fas fa-shopping-cart"></i> Beli Sekarang
                            </button>
                        </div>
                    `;
                }
            } catch (e) {
                contentAppSaya.innerHTML = 'Gagal memuat.';
            }
        });
    }

    if (btnCloseAppSaya) btnCloseAppSaya.addEventListener('click', () => modalAppSaya.classList.remove('show'));

    const menuSubdomain = document.getElementById('menuSubdomainSaya');
    const modalSubdomain = document.getElementById('modalSubdomainSaya');
    const contentSubdomain = document.getElementById('popupSubContent');
    const btnCloseSubList = document.getElementById('btnCloseSubList');

    if (menuSubdomain) {
        menuSubdomain.addEventListener('click', async () => {
            closeSidebar();
            const { token } = checkLogin();
            if (!token) return Swal.fire('Login', 'Silakan login dulu', 'warning');

            modalSubdomain.classList.add('show');
            contentSubdomain.innerHTML = '<div style="text-align:center; padding:20px;"><i class="fas fa-spinner fa-spin"></i> Memuat...</div>';

            try {
                const res = await fetch('/api/get-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });
                const d = await res.json();

                if (d.success && d.user.purchased_subdomains && d.user.purchased_subdomains.length > 0) {
                    let html = '<div class="panel-scroll-container">';
                    d.user.purchased_subdomains.reverse().forEach(s => {
                        const copyText = `DATA SUBDOMAIN\nMain: ${s.domain}\nNode: ${s.node}\nIP: ${s.ip}`;

                        html += `
                            <div class="panel-card-item">
                                <div class="panel-card-header">
                                    <span style="font-weight:bold; color:#2980b9; font-size:13px;">${s.domain}</span>
                                    <span style="font-size:10px; background:#2ecc71; color:white; padding:2px 6px; border-radius:4px;">AKTIF</span>
                                </div>
                                
                                <div class="panel-label">IP Address</div>
                                <div class="panel-val">${s.ip}</div>

                                <div class="panel-label">Node (Wildcard/Random)</div>
                                <div class="panel-val">${s.node}</div>

                                <div style="margin-top:10px; font-size:9px; color:#999; text-align:right;">
                                    ${new Date(s.date).toLocaleDateString()}
                                </div>
                                
                                <button onclick="copySubdomainData('${s.domain}', '${s.node}', '${s.ip}')" style="width:100%; margin-top:10px; background:#333; color:white; border:none; padding:8px; border-radius:5px; font-size:11px; cursor:pointer;">
                                    <i class="fas fa-copy"></i> SALIN LENGKAP
                                </button>
                            </div>
                        `;
                    });
                    html += '</div>';
                    contentSubdomain.innerHTML = html;
                } else {
                    contentSubdomain.innerHTML = `<div style="text-align:center; padding:30px; color:#888;">Belum ada subdomain.</div>`;
                }
            } catch (e) {
                contentSubdomain.innerHTML = 'Gagal memuat.';
            }
        });
    }

    if (btnCloseSubList) btnCloseSubList.addEventListener('click', () => modalSubdomain.classList.remove('show'));

    const menuNokos = document.getElementById('menuNokosSaya');
    const modalNokos = document.getElementById('modalNokosSaya');
    const contentNokos = document.getElementById('popupNokosContent');
    const btnCloseNokosList = document.getElementById('btnCloseNokosList');

    if (menuNokos) {
        menuNokos.addEventListener('click', async () => {
            closeSidebar();
            const { token } = checkLogin();
            if (!token) return Swal.fire('Login', 'Silakan login dulu', 'warning');

            modalNokos.classList.add('show');
            contentNokos.innerHTML = '<div style="text-align:center; padding:20px;"><i class="fas fa-spinner fa-spin"></i> Memuat...</div>';

            try {
                const res = await fetch('/api/get-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });
                const d = await res.json();

                if (d.success && d.user.purchased_nokos && d.user.purchased_nokos.length > 0) {
                    let html = '<div class="panel-scroll-container">';
                    d.user.purchased_nokos.reverse().forEach(n => {
                        const statusColor = n.otp ? '#2ecc71' : (n.status === 'cancelled' ? '#e74c3c' : '#f39c12');
                        const statusText = n.otp ? 'OTP DITERIMA' : (n.status === 'cancelled' ? 'BATAL' : 'MENUNGGU OTP');
                        const displayNomor = n.status === 'cancelled' ? '-' : n.nomor;

                        html += `
                            <div class="panel-card-item">
                                <div class="panel-card-header">
                                    <span style="font-weight:bold; color:#2980b9; font-size:12px;">${n.layanan} - ${n.negara}</span>
                                    <span style="font-size:10px; background:${statusColor}; color:white; padding:2px 6px; border-radius:4px;">${statusText}</span>
                                </div>
                                
                                <div class="panel-label">Nomor</div>
                                <div class="panel-val" style="font-size:16px;">${displayNomor}</div>

                                ${n.otp ?
                                `<div class="panel-label">Kode OTP</div>
                                     <div class="panel-val highlight" style="font-size:18px;">${n.otp}</div>` :
                                (n.status !== 'cancelled' ?
                                        `<button onclick="checkNokosOTP('${n.provider_order_id}', '${n.order_id}')" style="width:100%; background:#3498db; color:white; border:none; padding:8px; border-radius:5px; margin-top:10px;">
                                        <i class="fas fa-sync-alt"></i> CEK OTP
                                    </button>` : '')
                            }

                                ${!n.otp && n.status !== 'cancelled' ?
                                `<button onclick="cancelNokos('${n.provider_order_id}')" style="width:100%; background:#e74c3c; color:white; border:none; padding:8px; border-radius:5px; margin-top:5px;">
                                        <i class="fas fa-times"></i> BATALKAN
                                    </button>` : ''
                            }

                                <div style="margin-top:10px; font-size:9px; color:#999; text-align:right;">
                                    ${new Date(n.date).toLocaleDateString()}
                                </div>
                                
                                ${n.status !== 'cancelled' ? `
                                <button onclick="copyToClipboard('${displayNomor}')" style="width:100%; margin-top:10px; background:#333; color:white; border:none; padding:8px; border-radius:5px; font-size:11px;">
                                    <i class="fas fa-copy"></i> SALIN NOMOR
                                </button>` : ''}
                            </div>
                        `;
                    });
                    html += '</div>';
                    contentNokos.innerHTML = html;
                } else {
                    contentNokos.innerHTML = `<div style="text-align:center; padding:30px; color:#888;">
                        <i class="fas fa-sim-card" style="font-size:40px; margin-bottom:10px; color:#ddd;"></i>
                        <p>Belum ada Nokos.</p>
                        <button onclick="document.getElementById('modalNokosSaya').classList.remove('show'); switchPage('nokos');" 
                                style="margin-top:10px; background:var(--primary-color); color:white; border:none; padding:10px 20px; border-radius:20px; cursor:pointer;">
                            <i class="fas fa-shopping-cart"></i> Beli Sekarang
                        </button>
                    </div>`;
                }
            } catch (e) {
                contentNokos.innerHTML = 'Gagal memuat.';
            }
        });
    }

    if (btnCloseNokosList) btnCloseNokosList.addEventListener('click', () => modalNokos.classList.remove('show'));

    document.getElementById('menuRiwayatSMM')?.addEventListener('click', () => {
        closeSidebar();
        const { token } = checkLogin();
        if (!token) return Swal.fire('Login', 'Silakan login dulu', 'warning');

        document.getElementById('modalRiwayatSMM').classList.add('show');
        loadRiwayatSMM();
    });

    document.getElementById('btnCloseRiwayatSMM')?.addEventListener('click', () => {
        document.getElementById('modalRiwayatSMM').classList.remove('show');
    });

    document.getElementById('menuRiwayatNokos')?.addEventListener('click', () => {
        closeSidebar();
        const { token } = checkLogin();
        if (!token) return Swal.fire('Login', 'Silakan login dulu', 'warning');

        document.getElementById('modalRiwayatNokos').classList.add('show');
        loadRiwayatNokos();
    });

    document.getElementById('btnCloseRiwayatNokos')?.addEventListener('click', () => {
        document.getElementById('modalRiwayatNokos').classList.remove('show');
    });
}

// ============ FITUR RAHASIA ADMIN ============
const profileTrigger = document.querySelector('.profile-pic-container');
if (profileTrigger) {
    profileTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        secretTapCount++;
        if (secretTapCount === 1) {
            secretTapTimer = setTimeout(() => { secretTapCount = 0; }, 800);
        }
        if (secretTapCount >= 5) {
            clearTimeout(secretTapTimer);
            secretTapCount = 0;
            if (navigator.vibrate) navigator.vibrate(200);
            window.location.href = '/rahasia_admin_web';
        }
    });
}

// ============ OVO E-WALLET ============
async function fetchOvoProducts() {
    const grid = document.getElementById('ovoProductGrid');
    const loading = document.getElementById('ovoProductLoading');
    if (!grid || !loading) return;

    loading.style.display = 'block';
    grid.innerHTML = '';

    try {
        const res = await fetch('/api/ewallet/products/ovo');
        const json = await res.json();

        loading.style.display = 'none';

        if (json.success && json.data.length > 0) {
            ovoProducts = json.data;
            renderOvoProducts();
        } else {
            grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#e74c3c;">Gagal load produk / Kosong.</div>';
        }
    } catch (e) {
        loading.style.display = 'none';
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#e74c3c;">Error koneksi.</div>';
    }
}

function renderOvoProducts() {
    const grid = document.getElementById('ovoProductGrid');
    grid.innerHTML = '';

    ovoProducts.forEach(p => {
        const card = document.createElement('div');
        card.className = 'prod-card';
        card.onclick = () => selectProductOvo(card, p);

        card.innerHTML = `
            <div style="display:flex; flex-direction:column; height:100%; justify-content:center; align-items:center;">
                <img src="${p.icon}" style="width:30px; height:30px; margin-bottom:5px;">
                <span class="prod-name" style="font-size:12px;">${p.name}</span>
                <span class="prod-price">Rp ${p.price.toLocaleString()}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

function selectProductOvo(el, data) {
    document.querySelectorAll('#ovoProductGrid .prod-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedOvoCode = data.code;
    selectedOvoPrice = data.price;
    selectedOvoData = data;
    checkOrderOvo();
    resetPromo('ewallet-ovo');
}

async function checkOvoNumber() {
    const phoneNumber = document.getElementById('ovoPhone').value;
    if (!phoneNumber) {
        Swal.fire('Error', 'Masukkan nomor OVO terlebih dahulu!', 'warning');
        return;
    }

    let cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanNumber.length < 10) {
        Swal.fire('Error', 'Nomor tidak valid!', 'warning');
        return;
    }

    const btn = document.getElementById('btnCheckOvo');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;

    try {
        const res = await fetch('/api/ewallet/check/ovo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone_number: cleanNumber })
        });
        const data = await res.json();

        if (data.success) {
            let uName = data.data.name || data.data || "Member OVO";
            checkedOvoUser = { name: uName, number: cleanNumber };
            document.getElementById('ovoName').innerText = checkedOvoUser.name;
            document.getElementById('ovoStatus').innerText = '✓ Terdaftar';
            document.getElementById('ovoUserInfo').style.display = 'flex';
            Swal.fire('Sukses', `Nomor valid: ${checkedOvoUser.name}`, 'success');
        } else {
            Swal.fire('Gagal', data.message || 'Nomor tidak terdaftar', 'error');
            checkedOvoUser = null;
            document.getElementById('ovoUserInfo').style.display = 'none';
        }
    } catch (e) {
        Swal.fire('Error', 'Gagal terhubung ke server', 'error');
    } finally {
        btn.innerHTML = 'CEK NOMOR';
        btn.disabled = false;
        checkOrderOvo();
    }
}

function checkOvoInput() {
    const phone = document.getElementById('ovoPhone').value;
    if (phone.length >= 10) {
        checkedOvoUser = { name: "Member OVO", number: phone };
    } else {
        document.getElementById('ovoUserInfo').style.display = 'none';
        checkedOvoUser = null;
    }
    checkOrderOvo();
}

function resetOvoInputs() {
    document.getElementById('ovoPhone').value = '';
    document.getElementById('ovoUserInfo').style.display = 'none';
    checkedOvoUser = null;
    selectedOvoCode = null;
    selectedOvoPrice = 0;
    selectedOvoData = null;
    selectedMethodOvo = null;
    resetPromo('ewallet-ovo');
    checkOrderOvo();
}

function selectPayMethodOvo(method) {
    selectedMethodOvo = method;
    document.getElementById('paySaldoOvo').classList.remove('active');
    document.getElementById('payQrisOvo').classList.remove('active');
    if (method === 'saldo') document.getElementById('paySaldoOvo').classList.add('active');
    if (method === 'qris') document.getElementById('payQrisOvo').classList.add('active');
    checkOrderOvo();
}

function checkOrderOvo() {
    const btn = document.getElementById('btnBuyOvo');
    const footerPrice = document.getElementById('footerPriceOvo');
    const alert = document.getElementById('footerAlertOvo');

    footerPrice.innerText = 'Rp ' + (selectedOvoPrice || 0).toLocaleString();

    if (checkedOvoUser && selectedOvoCode && selectedMethodOvo) {
        btn.classList.add('active');
        btn.disabled = false;
        alert.style.display = 'none';
    } else {
        btn.classList.remove('active');
        btn.disabled = true;
        alert.style.display = 'flex';

        let msg = "Lengkapi data.";
        if (!checkedOvoUser) msg = "Cek nomor OVO terlebih dahulu.";
        else if (!selectedOvoCode) msg = "Pilih nominal topup.";
        else if (!selectedMethodOvo) msg = "Pilih pembayaran.";

        alert.innerHTML = `<i class="fas fa-info-circle"></i> ${msg}`;
    }
}

// ============ SHOPEEPAY E-WALLET ============
async function fetchShopeeProducts() {
    const grid = document.getElementById('shopeeProductGrid');
    const loading = document.getElementById('shopeeProductLoading');
    if (!grid || !loading) return;

    loading.style.display = 'block';
    grid.innerHTML = '';

    try {
        const res = await fetch('/api/ewallet/products/shopee');
        const json = await res.json();

        loading.style.display = 'none';

        if (json.success && json.data.length > 0) {
            shopeeProducts = json.data;
            renderShopeeProducts();
        } else {
            grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#e74c3c;">Gagal load produk / Kosong.</div>';
        }
    } catch (e) {
        loading.style.display = 'none';
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#e74c3c;">Error koneksi.</div>';
    }
}

function renderShopeeProducts() {
    const grid = document.getElementById('shopeeProductGrid');
    grid.innerHTML = '';

    shopeeProducts.forEach(p => {
        const card = document.createElement('div');
        card.className = 'prod-card';
        const badgeHTML = p.isAdmin ? `<div style="position:absolute; top:-5px; right:-5px; background:#ee4d2d; color:white; font-size:9px; padding:2px 5px; border-radius:5px; font-weight:bold;">ADMIN</div>` : '';
        card.onclick = () => selectProductShopee(card, p);

        card.innerHTML = `
            ${badgeHTML}
            <div style="display:flex; flex-direction:column; height:100%; justify-content:center; align-items:center; position:relative;">
                <img src="${p.icon}" style="width:30px; height:30px; margin-bottom:5px;">
                <span class="prod-name" style="font-size:11px; text-align:center;">${p.name}</span>
                <span class="prod-price">Rp ${p.price.toLocaleString()}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

function selectProductShopee(el, data) {
    document.querySelectorAll('#shopeeProductGrid .prod-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedShopeeCode = data.code;
    selectedShopeePrice = data.price;
    selectedShopeeData = data;
    checkOrderShopee();
    resetPromo('ewallet-shopee');
}

async function checkShopeeNumber() {
    const phoneNumber = document.getElementById('shopeePhone').value;
    if (!phoneNumber) {
        Swal.fire('Error', 'Masukkan nomor ShopeePay terlebih dahulu!', 'warning');
        return;
    }

    let cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanNumber.length < 10) {
        Swal.fire('Error', 'Nomor tidak valid!', 'warning');
        return;
    }

    const btn = document.getElementById('btnCheckShopee');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;

    try {
        const res = await fetch('/api/ewallet/check/shopee', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone_number: cleanNumber })
        });
        const data = await res.json();

        if (data.success) {
            let uName = data.data.name || data.data || "Member ShopeePay";
            checkedShopeeUser = { name: uName, number: cleanNumber };
            document.getElementById('shopeeName').innerText = checkedShopeeUser.name;
            document.getElementById('shopeeStatus').innerText = '✓ Terdaftar';
            document.getElementById('shopeeUserInfo').style.display = 'flex';
            Swal.fire('Sukses', `Nomor valid: ${checkedShopeeUser.name}`, 'success');
        } else {
            Swal.fire('Gagal', data.message || 'Nomor tidak terdaftar', 'error');
            checkedShopeeUser = null;
            document.getElementById('shopeeUserInfo').style.display = 'none';
        }
    } catch (e) {
        Swal.fire('Error', 'Gagal terhubung ke server', 'error');
    } finally {
        btn.innerHTML = 'CEK NOMOR';
        btn.disabled = false;
        checkOrderShopee();
    }
}

function checkShopeeInput() {
    const phone = document.getElementById('shopeePhone').value;
    if (phone.length >= 10) {
        checkedShopeeUser = { name: "Member ShopeePay", number: phone };
    } else {
        document.getElementById('shopeeUserInfo').style.display = 'none';
        checkedShopeeUser = null;
    }
    checkOrderShopee();
}

function resetShopeeInputs() {
    document.getElementById('shopeePhone').value = '';
    document.getElementById('shopeeUserInfo').style.display = 'none';
    checkedShopeeUser = null;
    selectedShopeeCode = null;
    selectedShopeePrice = 0;
    selectedShopeeData = null;
    selectedMethodShopee = null;
    resetPromo('ewallet-shopee');
    checkOrderShopee();
}

function selectPayMethodShopee(method) {
    selectedMethodShopee = method;
    document.getElementById('paySaldoShopee').classList.remove('active');
    document.getElementById('payQrisShopee').classList.remove('active');
    if (method === 'saldo') document.getElementById('paySaldoShopee').classList.add('active');
    if (method === 'qris') document.getElementById('payQrisShopee').classList.add('active');
    checkOrderShopee();
}

function checkOrderShopee() {
    const btn = document.getElementById('btnBuyShopee');
    const footerPrice = document.getElementById('footerPriceShopee');
    const alert = document.getElementById('footerAlertShopee');

    footerPrice.innerText = 'Rp ' + (selectedShopeePrice || 0).toLocaleString();

    if (checkedShopeeUser && selectedShopeeCode && selectedMethodShopee) {
        btn.classList.add('active');
        btn.disabled = false;
        alert.style.display = 'none';
    } else {
        btn.classList.remove('active');
        btn.disabled = true;
        alert.style.display = 'flex';

        let msg = "Lengkapi data.";
        if (!checkedShopeeUser) msg = "Cek nomor ShopeePay terlebih dahulu.";
        else if (!selectedShopeeCode) msg = "Pilih nominal topup.";
        else if (!selectedMethodShopee) msg = "Pilih pembayaran.";

        alert.innerHTML = `<i class="fas fa-info-circle"></i> ${msg}`;
    }
}

// ============ LINKAJA E-WALLET ============
async function fetchLinkajaProducts() {
    const grid = document.getElementById('linkajaProductGrid');
    const loading = document.getElementById('linkajaProductLoading');
    if (!grid || !loading) return;

    loading.style.display = 'block';
    grid.innerHTML = '';

    try {
        const res = await fetch('/api/ewallet/products/linkaja');
        const json = await res.json();

        loading.style.display = 'none';

        if (json.success && json.data.length > 0) {
            linkajaProducts = json.data;
            renderLinkajaProducts();
        } else {
            grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#e74c3c;">Gagal load produk / Kosong.</div>';
        }
    } catch (e) {
        loading.style.display = 'none';
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#e74c3c;">Error koneksi.</div>';
    }
}

function renderLinkajaProducts() {
    const grid = document.getElementById('linkajaProductGrid');
    grid.innerHTML = '';

    linkajaProducts.forEach(p => {
        const card = document.createElement('div');
        card.className = 'prod-card';
        const badgeHTML = p.isEntitas ? `<div style="position:absolute; top:-5px; right:-5px; background:#0055a0; color:white; font-size:9px; padding:2px 5px; border-radius:5px; font-weight:bold;">ENTITAS</div>` : '';
        card.onclick = () => selectProductLinkaja(card, p);

        card.innerHTML = `
            ${badgeHTML}
            <div style="display:flex; flex-direction:column; height:100%; justify-content:center; align-items:center; position:relative;">
                <img src="${p.icon}" style="width:30px; height:30px; margin-bottom:5px;">
                <span class="prod-name" style="font-size:11px; text-align:center;">${p.name}</span>
                <span class="prod-price">Rp ${p.price.toLocaleString()}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

function selectProductLinkaja(el, data) {
    document.querySelectorAll('#linkajaProductGrid .prod-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedLinkajaCode = data.code;
    selectedLinkajaPrice = data.price;
    selectedLinkajaData = data;
    checkOrderLinkaja();
    resetPromo('ewallet-linkaja');
}

async function checkLinkajaNumber() {
    const phoneNumber = document.getElementById('linkajaPhone').value;
    if (!phoneNumber) {
        Swal.fire('Error', 'Masukkan nomor LinkAja terlebih dahulu!', 'warning');
        return;
    }

    let cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanNumber.length < 10) {
        Swal.fire('Error', 'Nomor tidak valid!', 'warning');
        return;
    }

    const btn = document.getElementById('btnCheckLinkaja');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;

    try {
        const res = await fetch('/api/ewallet/check/linkaja', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone_number: cleanNumber })
        });
        const data = await res.json();

        if (data.success) {
            let uName = data.data.name || data.data || "Member LinkAja";
            checkedLinkajaUser = { name: uName, number: cleanNumber };
            document.getElementById('linkajaName').innerText = checkedLinkajaUser.name;
            document.getElementById('linkajaStatus').innerText = '✓ Terdaftar';
            document.getElementById('linkajaUserInfo').style.display = 'flex';
            Swal.fire('Sukses', `Nomor valid: ${checkedLinkajaUser.name}`, 'success');
        } else {
            Swal.fire('Gagal', data.message || 'Nomor tidak terdaftar', 'error');
            checkedLinkajaUser = null;
            document.getElementById('linkajaUserInfo').style.display = 'none';
        }
    } catch (e) {
        Swal.fire('Error', 'Gagal terhubung ke server', 'error');
    } finally {
        btn.innerHTML = 'CEK NOMOR';
        btn.disabled = false;
        checkOrderLinkaja();
    }
}

function checkLinkajaInput() {
    const phone = document.getElementById('linkajaPhone').value;
    if (phone.length >= 10) {
        checkedLinkajaUser = { name: "Member LinkAja", number: phone };
    } else {
        document.getElementById('linkajaUserInfo').style.display = 'none';
        checkedLinkajaUser = null;
    }
    checkOrderLinkaja();
}

function resetLinkajaInputs() {
    document.getElementById('linkajaPhone').value = '';
    document.getElementById('linkajaUserInfo').style.display = 'none';
    checkedLinkajaUser = null;
    selectedLinkajaCode = null;
    selectedLinkajaPrice = 0;
    selectedLinkajaData = null;
    selectedMethodLinkaja = null;
    resetPromo('ewallet-linkaja');
    checkOrderLinkaja();
}

function selectPayMethodLinkaja(method) {
    selectedMethodLinkaja = method;
    document.getElementById('paySaldoLinkaja').classList.remove('active');
    document.getElementById('payQrisLinkaja').classList.remove('active');
    if (method === 'saldo') document.getElementById('paySaldoLinkaja').classList.add('active');
    if (method === 'qris') document.getElementById('payQrisLinkaja').classList.add('active');
    checkOrderLinkaja();
}

function checkOrderLinkaja() {
    const btn = document.getElementById('btnBuyLinkaja');
    const footerPrice = document.getElementById('footerPriceLinkaja');
    const alert = document.getElementById('footerAlertLinkaja');

    footerPrice.innerText = 'Rp ' + (selectedLinkajaPrice || 0).toLocaleString();

    if (checkedLinkajaUser && selectedLinkajaCode && selectedMethodLinkaja) {
        btn.classList.add('active');
        btn.disabled = false;
        alert.style.display = 'none';
    } else {
        btn.classList.remove('active');
        btn.disabled = true;
        alert.style.display = 'flex';

        let msg = "Lengkapi data.";
        if (!checkedLinkajaUser) msg = "Cek nomor LinkAja terlebih dahulu.";
        else if (!selectedLinkajaCode) msg = "Pilih nominal topup.";
        else if (!selectedMethodLinkaja) msg = "Pilih pembayaran.";

        alert.innerHTML = `<i class="fas fa-info-circle"></i> ${msg}`;
    }
}

// ============ ASTRAPAY E-WALLET ============
async function fetchAstrapayProducts() {
    const grid = document.getElementById('astrapayProductGrid');
    const loading = document.getElementById('astrapayProductLoading');
    if (!grid || !loading) return;

    loading.style.display = 'block';
    grid.innerHTML = '';

    try {
        const res = await fetch('/api/ewallet/products/astrapay');
        const json = await res.json();

        loading.style.display = 'none';

        if (json.success && json.data.length > 0) {
            astrapayProducts = json.data;
            renderAstrapayProducts();
        } else {
            grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#e74c3c;">Gagal load produk / Kosong.</div>';
        }
    } catch (e) {
        loading.style.display = 'none';
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#e74c3c;">Error koneksi.</div>';
    }
}

function renderAstrapayProducts() {
    const grid = document.getElementById('astrapayProductGrid');
    grid.innerHTML = '';

    astrapayProducts.forEach(p => {
        const card = document.createElement('div');
        card.className = 'prod-card';
        card.onclick = () => selectProductAstrapay(card, p);

        card.innerHTML = `
            <div style="display:flex; flex-direction:column; height:100%; justify-content:center; align-items:center;">
                <img src="${p.icon}" style="width:30px; height:30px; margin-bottom:5px;">
                <span class="prod-name" style="font-size:11px; text-align:center;">${p.name}</span>
                <span class="prod-price">Rp ${p.price.toLocaleString()}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

function selectProductAstrapay(el, data) {
    document.querySelectorAll('#astrapayProductGrid .prod-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedAstrapayCode = data.code;
    selectedAstrapayPrice = data.price;
    selectedAstrapayData = data;
    checkOrderAstrapay();
    resetPromo('ewallet-astrapay');
}

async function checkAstrapayNumber() {
    const phoneNumber = document.getElementById('astrapayPhone').value;
    if (!phoneNumber) {
        Swal.fire('Error', 'Masukkan nomor Astrapay terlebih dahulu!', 'warning');
        return;
    }

    let cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanNumber.length < 10) {
        Swal.fire('Error', 'Nomor tidak valid!', 'warning');
        return;
    }

    const btn = document.getElementById('btnCheckAstrapay');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;

    try {
        const res = await fetch('/api/ewallet/check/astrapay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone_number: cleanNumber })
        });
        const data = await res.json();

        if (data.success) {
            let uName = data.data.name || data.data || "Member Astrapay";
            checkedAstrapayUser = { name: uName, number: cleanNumber };
            document.getElementById('astrapayName').innerText = checkedAstrapayUser.name;
            document.getElementById('astrapayStatus').innerText = '✓ Terdaftar';
            document.getElementById('astrapayUserInfo').style.display = 'flex';
            Swal.fire('Sukses', `Nomor valid: ${checkedAstrapayUser.name}`, 'success');
        } else {
            Swal.fire('Gagal', data.message || 'Nomor tidak terdaftar', 'error');
            checkedAstrapayUser = null;
            document.getElementById('astrapayUserInfo').style.display = 'none';
        }
    } catch (e) {
        Swal.fire('Error', 'Gagal terhubung ke server', 'error');
    } finally {
        btn.innerHTML = 'CEK NOMOR';
        btn.disabled = false;
        checkOrderAstrapay();
    }
}

function checkAstrapayInput() {
    const phone = document.getElementById('astrapayPhone').value;
    if (phone.length >= 10) {
        checkedAstrapayUser = { name: "Member Astrapay", number: phone };
    } else {
        document.getElementById('astrapayUserInfo').style.display = 'none';
        checkedAstrapayUser = null;
    }
    checkOrderAstrapay();
}

function resetAstrapayInputs() {
    document.getElementById('astrapayPhone').value = '';
    document.getElementById('astrapayUserInfo').style.display = 'none';
    checkedAstrapayUser = null;
    selectedAstrapayCode = null;
    selectedAstrapayPrice = 0;
    selectedAstrapayData = null;
    selectedMethodAstrapay = null;
    resetPromo('ewallet-astrapay');
    checkOrderAstrapay();
}

function selectPayMethodAstrapay(method) {
    selectedMethodAstrapay = method;
    document.getElementById('paySaldoAstrapay').classList.remove('active');
    document.getElementById('payQrisAstrapay').classList.remove('active');
    if (method === 'saldo') document.getElementById('paySaldoAstrapay').classList.add('active');
    if (method === 'qris') document.getElementById('payQrisAstrapay').classList.add('active');
    checkOrderAstrapay();
}

function checkOrderAstrapay() {
    const btn = document.getElementById('btnBuyAstrapay');
    const footerPrice = document.getElementById('footerPriceAstrapay');
    const alert = document.getElementById('footerAlertAstrapay');

    footerPrice.innerText = 'Rp ' + (selectedAstrapayPrice || 0).toLocaleString();

    if (checkedAstrapayUser && selectedAstrapayCode && selectedMethodAstrapay) {
        btn.classList.add('active');
        btn.disabled = false;
        alert.style.display = 'none';
    } else {
        btn.classList.remove('active');
        btn.disabled = true;
        alert.style.display = 'flex';

        let msg = "Lengkapi data.";
        if (!checkedAstrapayUser) msg = "Cek nomor Astrapay terlebih dahulu.";
        else if (!selectedAstrapayCode) msg = "Pilih nominal topup.";
        else if (!selectedMethodAstrapay) msg = "Pilih pembayaran.";

        alert.innerHTML = `<i class="fas fa-info-circle"></i> ${msg}`;
    }
}

// ============ ISAKU E-WALLET ============
async function fetchIsakuProducts() {
    const grid = document.getElementById('isakuProductGrid');
    const loading = document.getElementById('isakuProductLoading');
    if (!grid || !loading) return;

    loading.style.display = 'block';
    grid.innerHTML = '';

    try {
        const res = await fetch('/api/ewallet/products/isaku');
        const json = await res.json();

        loading.style.display = 'none';

        if (json.success && json.data.length > 0) {
            isakuProducts = json.data;
            renderIsakuProducts();
        } else {
            grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#e74c3c;">Gagal load produk / Kosong.</div>';
        }
    } catch (e) {
        loading.style.display = 'none';
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#e74c3c;">Error koneksi.</div>';
    }
}

function renderIsakuProducts() {
    const grid = document.getElementById('isakuProductGrid');
    grid.innerHTML = '';

    isakuProducts.forEach(p => {
        const card = document.createElement('div');
        card.className = 'prod-card';
        card.onclick = () => selectProductIsaku(card, p);

        card.innerHTML = `
            <div style="display:flex; flex-direction:column; height:100%; justify-content:center; align-items:center;">
                <img src="${p.icon}" style="width:30px; height:30px; margin-bottom:5px;">
                <span class="prod-name" style="font-size:11px; text-align:center;">${p.name}</span>
                <span class="prod-price">Rp ${p.price.toLocaleString()}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

function selectProductIsaku(el, data) {
    document.querySelectorAll('#isakuProductGrid .prod-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedIsakuCode = data.code;
    selectedIsakuPrice = data.price;
    selectedIsakuData = data;
    checkOrderIsaku();
    resetPromo('ewallet-isaku');
}

async function checkIsakuNumber() {
    const phoneNumber = document.getElementById('isakuPhone').value;
    if (!phoneNumber) {
        Swal.fire('Error', 'Masukkan nomor iSaku terlebih dahulu!', 'warning');
        return;
    }

    let cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanNumber.length < 10) {
        Swal.fire('Error', 'Nomor tidak valid!', 'warning');
        return;
    }

    const btn = document.getElementById('btnCheckIsaku');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;

    try {
        const res = await fetch('/api/ewallet/check/isaku', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone_number: cleanNumber })
        });
        const data = await res.json();

        if (data.success) {
            let uName = data.data.name || data.data || "Member iSaku";
            checkedIsakuUser = { name: uName, number: cleanNumber };
            document.getElementById('isakuName').innerText = checkedIsakuUser.name;
            document.getElementById('isakuStatus').innerText = '✓ Terdaftar';
            document.getElementById('isakuUserInfo').style.display = 'flex';
            Swal.fire('Sukses', `Nomor valid: ${checkedIsakuUser.name}`, 'success');
        } else {
            Swal.fire('Gagal', data.message || 'Nomor tidak terdaftar', 'error');
            checkedIsakuUser = null;
            document.getElementById('isakuUserInfo').style.display = 'none';
        }
    } catch (e) {
        Swal.fire('Error', 'Gagal terhubung ke server', 'error');
    } finally {
        btn.innerHTML = 'CEK NOMOR';
        btn.disabled = false;
        checkOrderIsaku();
    }
}

function checkIsakuInput() {
    const phone = document.getElementById('isakuPhone').value;
    if (phone.length >= 10) {
        checkedIsakuUser = { name: "Member iSaku", number: phone };
    } else {
        document.getElementById('isakuUserInfo').style.display = 'none';
        checkedIsakuUser = null;
    }
    checkOrderIsaku();
}

function resetIsakuInputs() {
    document.getElementById('isakuPhone').value = '';
    document.getElementById('isakuUserInfo').style.display = 'none';
    checkedIsakuUser = null;
    selectedIsakuCode = null;
    selectedIsakuPrice = 0;
    selectedIsakuData = null;
    selectedMethodIsaku = null;
    resetPromo('ewallet-isaku');
    checkOrderIsaku();
}

function selectPayMethodIsaku(method) {
    selectedMethodIsaku = method;
    document.getElementById('paySaldoIsaku').classList.remove('active');
    document.getElementById('payQrisIsaku').classList.remove('active');
    if (method === 'saldo') document.getElementById('paySaldoIsaku').classList.add('active');
    if (method === 'qris') document.getElementById('payQrisIsaku').classList.add('active');
    checkOrderIsaku();
}

function checkOrderIsaku() {
    const btn = document.getElementById('btnBuyIsaku');
    const footerPrice = document.getElementById('footerPriceIsaku');
    const alert = document.getElementById('footerAlertIsaku');

    footerPrice.innerText = 'Rp ' + (selectedIsakuPrice || 0).toLocaleString();

    if (checkedIsakuUser && selectedIsakuCode && selectedMethodIsaku) {
        btn.classList.add('active');
        btn.disabled = false;
        alert.style.display = 'none';
    } else {
        btn.classList.remove('active');
        btn.disabled = true;
        alert.style.display = 'flex';

        let msg = "Lengkapi data.";
        if (!checkedIsakuUser) msg = "Cek nomor iSaku terlebih dahulu.";
        else if (!selectedIsakuCode) msg = "Pilih nominal topup.";
        else if (!selectedMethodIsaku) msg = "Pilih pembayaran.";

        alert.innerHTML = `<i class="fas fa-info-circle"></i> ${msg}`;
    }
}

// ============ KASPRO E-WALLET ============
async function fetchKasproProducts() {
    const grid = document.getElementById('kasproProductGrid');
    const loading = document.getElementById('kasproProductLoading');
    if (!grid || !loading) return;

    loading.style.display = 'block';
    grid.innerHTML = '';

    try {
        const res = await fetch('/api/ewallet/products/kaspro');
        const json = await res.json();

        loading.style.display = 'none';

        if (json.success && json.data.length > 0) {
            kasproProducts = json.data;
            renderKasproProducts();
        } else {
            grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#e74c3c;">Gagal load produk / Kosong.</div>';
        }
    } catch (e) {
        loading.style.display = 'none';
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#e74c3c;">Error koneksi.</div>';
    }
}

function renderKasproProducts() {
    const grid = document.getElementById('kasproProductGrid');
    grid.innerHTML = '';

    kasproProducts.forEach(p => {
        const card = document.createElement('div');
        card.className = 'prod-card';
        card.onclick = () => selectProductKaspro(card, p);

        card.innerHTML = `
            <div style="display:flex; flex-direction:column; height:100%; justify-content:center; align-items:center;">
                <img src="${p.icon}" style="width:30px; height:30px; margin-bottom:5px;">
                <span class="prod-name" style="font-size:11px; text-align:center;">${p.name}</span>
                <span class="prod-price">Rp ${p.price.toLocaleString()}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

function selectProductKaspro(el, data) {
    document.querySelectorAll('#kasproProductGrid .prod-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedKasproCode = data.code;
    selectedKasproPrice = data.price;
    selectedKasproData = data;
    checkOrderKaspro();
    resetPromo('ewallet-kaspro');
}

async function checkKasproNumber() {
    const phoneNumber = document.getElementById('kasproPhone').value;
    if (!phoneNumber) {
        Swal.fire('Error', 'Masukkan nomor Kaspro terlebih dahulu!', 'warning');
        return;
    }

    let cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanNumber.length < 10) {
        Swal.fire('Error', 'Nomor tidak valid!', 'warning');
        return;
    }

    const btn = document.getElementById('btnCheckKaspro');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;

    try {
        const res = await fetch('/api/ewallet/check/kaspro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone_number: cleanNumber })
        });
        const data = await res.json();

        if (data.success) {
            let uName = data.data.name || data.data || "Member Kaspro";
            checkedKasproUser = { name: uName, number: cleanNumber };
            document.getElementById('kasproName').innerText = checkedKasproUser.name;
            document.getElementById('kasproStatus').innerText = '✓ Terdaftar';
            document.getElementById('kasproUserInfo').style.display = 'flex';
            Swal.fire('Sukses', `Nomor valid: ${checkedKasproUser.name}`, 'success');
        } else {
            Swal.fire('Gagal', data.message || 'Nomor tidak terdaftar', 'error');
            checkedKasproUser = null;
            document.getElementById('kasproUserInfo').style.display = 'none';
        }
    } catch (e) {
        Swal.fire('Error', 'Gagal terhubung ke server', 'error');
    } finally {
        btn.innerHTML = 'CEK NOMOR';
        btn.disabled = false;
        checkOrderKaspro();
    }
}

function checkKasproInput() {
    const phone = document.getElementById('kasproPhone').value;
    if (phone.length >= 10) {
        checkedKasproUser = { name: "Member Kaspro", number: phone };
    } else {
        document.getElementById('kasproUserInfo').style.display = 'none';
        checkedKasproUser = null;
    }
    checkOrderKaspro();
}

function resetKasproInputs() {
    document.getElementById('kasproPhone').value = '';
    document.getElementById('kasproUserInfo').style.display = 'none';
    checkedKasproUser = null;
    selectedKasproCode = null;
    selectedKasproPrice = 0;
    selectedKasproData = null;
    selectedMethodKaspro = null;
    resetPromo('ewallet-kaspro');
    checkOrderKaspro();
}

function selectPayMethodKaspro(method) {
    selectedMethodKaspro = method;
    document.getElementById('paySaldoKaspro').classList.remove('active');
    document.getElementById('payQrisKaspro').classList.remove('active');
    if (method === 'saldo') document.getElementById('paySaldoKaspro').classList.add('active');
    if (method === 'qris') document.getElementById('payQrisKaspro').classList.add('active');
    checkOrderKaspro();
}

function checkOrderKaspro() {
    const btn = document.getElementById('btnBuyKaspro');
    const footerPrice = document.getElementById('footerPriceKaspro');
    const alert = document.getElementById('footerAlertKaspro');

    footerPrice.innerText = 'Rp ' + (selectedKasproPrice || 0).toLocaleString();

    if (checkedKasproUser && selectedKasproCode && selectedMethodKaspro) {
        btn.classList.add('active');
        btn.disabled = false;
        alert.style.display = 'none';
    } else {
        btn.classList.remove('active');
        btn.disabled = true;
        alert.style.display = 'flex';

        let msg = "Lengkapi data.";
        if (!checkedKasproUser) msg = "Cek nomor Kaspro terlebih dahulu.";
        else if (!selectedKasproCode) msg = "Pilih nominal topup.";
        else if (!selectedMethodKaspro) msg = "Pilih pembayaran.";

        alert.innerHTML = `<i class="fas fa-info-circle"></i> ${msg}`;
    }
}

// ============ EVENT LISTENERS ============
function setupEventListeners() {
    document.getElementById('btnOpenSidebar')?.addEventListener('click', openSidebar);
    overlay?.addEventListener('click', closeSidebar);

    document.getElementById('btnKeuntungan')?.addEventListener('click', () => {
        keuntunganModal.classList.add('show');
    });

    document.getElementById('btnCloseKeuntungan')?.addEventListener('click', () => {
        keuntunganModal.classList.remove('show');
    });

    document.getElementById('btnTutupKeuntungan')?.addEventListener('click', () => {
        keuntunganModal.classList.remove('show');
    });

    document.getElementById('btnRefreshSMM')?.addEventListener('click', async () => {
        const btn = document.getElementById('btnRefreshSMM');
        const icon = btn.querySelector('i');
        icon.classList.add('fa-spin');
        await loadRiwayatSMM();
        setTimeout(() => icon.classList.remove('fa-spin'), 500);
    });

    document.getElementById('btnRefreshNokos')?.addEventListener('click', async () => {
        const btn = document.getElementById('btnRefreshNokos');
        const icon = btn.querySelector('i');
        icon.classList.add('fa-spin');
        await loadRiwayatNokos();
        setTimeout(() => icon.classList.remove('fa-spin'), 500);
    });

    document.getElementById('btnGoSubdomain')?.addEventListener('click', () => {
        if (!checkLogin().token) window.location.href = '/login';
        else {
            switchPage('subdomain');
            fetchCFZones();
        }
    });

    document.getElementById('btnBackSubdomain')?.addEventListener('click', () => switchPage('home'));

    document.getElementById('subdomainName')?.addEventListener('input', checkOrderSub);
    document.getElementById('subdomainIP')?.addEventListener('input', checkOrderSub);

    document.getElementById('btnCaraBeliSubdomain')?.addEventListener('click', () => {
        Swal.fire({
            title: 'Cara Beli Subdomain',
            html: `
                <ol style="text-align:left; font-size:13px; padding-left:20px; line-height:1.6; color:#555;">
                    <li>Masukkan <b>Nama Subdomain</b> (huruf kecil, tanpa spasi).</li>
                    <li>Masukkan <b>IP Address</b> VPS Anda.</li>
                    <li>Atur <b>Proxy</b> (Off = Direct IP, On = Lewat CF).</li>
                    <li>Pilih <b>Domain Utama</b> yang tersedia.</li>
                    <li>Pilih Pembayaran & Bayar.</li>
                </ol>
                <div style="margin-top:10px; font-size:12px; color:#2980b9; background:#eaf2f8; padding:10px; border-radius:6px; text-align:left;">
                    <b>🎁 Bonus:</b><br>
                    Setiap pembelian otomatis mendapatkan record tambahan random, misal: <b>node123.nama.domain.com</b>
                </div>
            `,
            confirmButtonText: 'Oke Paham',
            confirmButtonColor: 'var(--primary-color)'
        });
    });

    document.getElementById('btnBuySub')?.addEventListener('click', () => {
        if (!selectedZone || !selectedMethodSub) return;

        if (getPromoDataByPage('subdomain') && selectedMethodSub === 'qris') {
            Swal.fire({ icon: 'error', title: 'Metode Tidak Valid', text: 'Mohon maaf promo ini hanya bisa di beli menggunakan pembayaran saldo tidak berlaku di pembayaran qris' });
            return;
        }

        const sub = document.getElementById('subdomainName').value;
        const ip = document.getElementById('subdomainIP').value;
        const isProxy = document.getElementById('subdomainProxy').checked;

        document.getElementById('cs-name').innerText = sub;
        document.getElementById('cs-domain').innerText = selectedZone.name;
        document.getElementById('cs-ip').innerText = ip;
        document.getElementById('cs-proxy').innerText = isProxy ? 'ON (Orange)' : 'OFF (Grey)';
        document.getElementById('cs-method-sub').innerText = selectedMethodSub.toUpperCase();
        const finalSubPrice = getFinalPriceByPage('subdomain');
        document.getElementById('cs-total-sub').innerText = 'Rp ' + finalSubPrice.toLocaleString();

        document.getElementById('confirmSubModal').classList.add('show');
    });

    document.getElementById('btnCloseConfirmSub')?.addEventListener('click', () => document.getElementById('confirmSubModal').classList.remove('show'));

    document.getElementById('btnFinalPaySub')?.addEventListener('click', async () => {
        const { token, user } = checkLogin();
        const btn = document.getElementById('btnFinalPaySub');
        btn.innerText = "Memproses...";
        btn.disabled = true;

        const sub = document.getElementById('subdomainName').value;
        const ip = document.getElementById('subdomainIP').value;
        const isProxy = document.getElementById('subdomainProxy').checked;
        const finalSubPrice = getFinalPriceByPage('subdomain');
        const promoDataSub = getPromoDataByPage('subdomain');

        try {
            const res = await fetch('/api/buy-subdomain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    subdomain: sub,
                    ip_address: ip,
                    zone_id: selectedZone.id,
                    zone_name: selectedZone.name,
                    proxy_status: isProxy,
                    price: selectedZone.price,
                    method: selectedMethodSub,
                    promo_code: promoDataSub ? promoDataSub.code : null,
                    final_amount: finalSubPrice
                })
            });
            const data = await res.json();
            document.getElementById('confirmSubModal').classList.remove('show');

            if (data.success) {
                if (data.type === 'instant') {
                    Swal.fire({
                        title: 'Sukses!',
                        text: 'Subdomain berhasil dibuat!',
                        icon: 'success',
                        confirmButtonText: 'Lihat Data',
                        confirmButtonColor: '#2ecc71'
                    }).then(() => {
                        if (document.getElementById('menuSubdomainSaya')) document.getElementById('menuSubdomainSaya').click();
                    });
                } else if (data.type === 'qris') {
                    const expireTime = Date.now() + (5 * 60 * 1000);
                    localStorage.setItem('pendingTrx', JSON.stringify({
                        order_id: data.order_id,
                        pay_amount: data.pay_amount,
                        deposit_amount: data.amount,
                        qr_string: data.qr_string,
                        expire_at: expireTime,
                        username: user.username,
                        trx_type: 'buy_subdomain',
                        product_data: {
                            subdomain: sub,
                            ip_address: ip,
                            zone_id: selectedZone.id,
                            zone_name: selectedZone.name,
                            proxy_status: isProxy,
                            price: selectedZone.price
                        }
                    }));
                    window.location.href = '/payment';
                }
            } else {
                Swal.fire('Gagal', data.message, 'error');
            }
        } catch (e) {
            console.log(e);
            let pesan = 'Terjadi kesalahan sistem';
            if (e.response && e.response.data && e.response.data.message) {
                pesan = e.response.data.message;
            } else if (e.message) {
                pesan = e.message;
            }
            Swal.fire('Gagal', pesan, 'error');
        } finally {
            btn.innerText = "BAYAR SEKARANG";
            btn.disabled = false;
        }
    });

    document.getElementById('btnGoApps')?.addEventListener('click', () => {
        if (!checkLogin().token) window.location.href = '/login';
        else {
            switchPage('apps');
            fetchApps();
        }
    });

    document.getElementById('btnBackApps')?.addEventListener('click', () => switchPage('home'));

    document.getElementById('btnCaraBeliApps')?.addEventListener('click', () => {
        Swal.fire({
            title: 'Cara Beli Aplikasi',
            html: `
                <ol style="text-align:left; font-size:13px; padding-left:20px; line-height:1.6; color:#555;">
                    <li>Pilih <b>Aplikasi Premium</b> yang diinginkan.</li>
                    <li>Pastikan stok tersedia (Indikator Hijau).</li>
                    <li>Pilih <b>Metode Pembayaran</b> dan Bayar.</li>
                    <li>Sistem akan otomatis mengirimkan email/password akun.</li>
                    <li>Cek data akun di menu sidebar: <b>Aplikasi Saya</b>.</li>
                </ol>
                <div style="margin-top:10px; font-size:12px; color:#27ae60; background:#e8f5e9; padding:8px; border-radius:6px; text-align:left; border-left:4px solid #2ecc71;">
                    <b>🛡️ Garansi:</b><br>
                    Full garansi selama masa aktif sewa. Jika akun bermasalah, klik tombol "Klaim Garansi" di detail aplikasi.
                </div>
            `,
            confirmButtonText: 'Oke, Paham',
            confirmButtonColor: 'var(--primary-color)'
        });
    });

    document.getElementById('btnBuyApps')?.addEventListener('click', () => {
        if (!selectedAppData || !selectedMethodApps) {
            checkOrderApps();
            return;
        }

        if (selectedAppData.stock_count <= 0) {
            Swal.fire('Stok Habis', 'Maaf, stok produk ini sedang kosong.', 'error');
            return;
        }

        if (getPromoDataByPage('apps') && selectedMethodApps === 'qris') {
            Swal.fire({ icon: 'error', title: 'Metode Tidak Valid', text: 'Mohon maaf promo ini hanya bisa di beli menggunakan pembayaran saldo tidak berlaku di pembayaran qris' });
            return;
        }

        document.getElementById('ca-prod').innerText = selectedAppData.name;
        document.getElementById('ca-method').innerText = selectedMethodApps.toUpperCase();
        document.getElementById('ca-total').innerText = 'Rp ' + selectedAppPrice.toLocaleString();
        document.getElementById('confirmAppsModal').classList.add('show');
    });

    document.getElementById('btnCloseConfirmApps')?.addEventListener('click', () => document.getElementById('confirmAppsModal').classList.remove('show'));

    document.getElementById('btnFinalPayApps')?.addEventListener('click', async () => {
        const { token, user } = checkLogin();
        const btn = document.getElementById('btnFinalPayApps');
        btn.innerText = "Mengambil Stok...";
        btn.disabled = true;

        const finalAppPrice = getFinalPriceByPage('apps');
        const promoDataApp = getPromoDataByPage('apps');

        try {
            const res = await fetch('/api/buy-app', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    app_code: selectedAppCode,
                    method: selectedMethodApps,
                    promo_code: promoDataApp ? promoDataApp.code : null,
                    final_amount: finalAppPrice
                })
            });
            const data = await res.json();
            document.getElementById('confirmAppsModal').classList.remove('show');

            if (data.success) {
                if (data.type === 'instant') {
                    Swal.fire({
                        title: 'Sukses!',
                        text: 'Akun berhasil dibeli! Cek menu Aplikasi Saya.',
                        icon: 'success',
                        confirmButtonText: 'Buka Data Akun',
                        confirmButtonColor: '#2ecc71',
                        showDenyButton: true,
                        denyButtonText: '⭐ Beri Ulasan',
                        denyButtonColor: '#f1c40f'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            if (document.getElementById('menuAppSaya')) document.getElementById('menuAppSaya').click();
                        } else if (result.isDenied) {
                            window.location.href = '/ulasan';
                        }
                    });
                } else if (data.type === 'qris') {
                    const expireTime = Date.now() + (5 * 60 * 1000);
                    localStorage.setItem('pendingTrx', JSON.stringify({
                        order_id: data.order_id,
                        pay_amount: data.pay_amount,
                        deposit_amount: data.amount,
                        qr_string: data.qr_string,
                        expire_at: expireTime,
                        username: user.username,
                        trx_type: 'buy_app',
                        product_name: selectedAppData.name
                    }));
                    window.location.href = '/payment';
                }
            } else {
                Swal.fire('Gagal', data.message, 'error');
            }
        } catch (e) {
            Swal.fire('Error', 'Gagal koneksi', 'error');
        } finally {
            btn.innerText = "BAYAR SEKARANG";
            btn.disabled = false;
        }
    });

    document.getElementById('btnGoSosmed')?.addEventListener('click', () => {
        if (!checkLogin().token) window.location.href = '/login';
        else {
            switchPage('sosmed');
            if (sosmedServices.length === 0) fetchSosmedServices();
        }
    });

    document.getElementById('btnBackSosmed')?.addEventListener('click', () => switchPage('home'));

    document.getElementById('sosmedCategory')?.addEventListener('change', (e) => {
        renderSosmedServices(e.target.value);
        document.getElementById('sosmedDesc').style.display = 'none';
        document.getElementById('sosmedLimit').style.display = 'none';
        selectedSosmedService = null;
        calculateSosmedPrice();
    });

    document.getElementById('sosmedService')?.addEventListener('change', (e) => {
        const id = parseInt(e.target.value);
        selectedSosmedService = sosmedServices.find(s => s.id === id);

        if (selectedSosmedService) {
            const descEl = document.getElementById('sosmedDesc');
            const limitEl = document.getElementById('sosmedLimit');

            descEl.innerHTML = selectedSosmedService.desc;
            descEl.style.display = 'block';

            limitEl.innerText = `Minimal: ${selectedSosmedService.min} | Maksimal: ${selectedSosmedService.max}`;
            limitEl.style.display = 'block';
        }
        calculateSosmedPrice();
        resetPromo('sosmed');
    });

    document.getElementById('sosmedQty')?.addEventListener('input', calculateSosmedPrice);

    document.getElementById('btnBuySosmed')?.addEventListener('click', () => {
        if (!selectedSosmedService || !selectedMethodSosmed) return;

        if (getPromoDataByPage('sosmed') && selectedMethodSosmed === 'qris') {
            Swal.fire({ icon: 'error', title: 'Metode Tidak Valid', text: 'Mohon maaf promo ini hanya bisa di beli menggunakan pembayaran saldo tidak berlaku di pembayaran qris' });
            return;
        }

        const target = document.getElementById('sosmedTarget').value;
        const qty = document.getElementById('sosmedQty').value;
        const total = document.getElementById('footerPriceSosmed').innerText;

        if (!target) return Swal.fire('Error', 'Target wajib diisi!', 'error');

        document.getElementById('csm-service').innerText = selectedSosmedService.name;
        document.getElementById('csm-target').innerText = target;
        document.getElementById('csm-qty').innerText = qty;
        document.getElementById('csm-method').innerText = selectedMethodSosmed.toUpperCase();
        const finalSosPrice = getFinalPriceByPage('sosmed');
        document.getElementById('csm-total').innerText = 'Rp ' + finalSosPrice.toLocaleString();

        document.getElementById('confirmSosmedModal').classList.add('show');
    });

    document.getElementById('btnCloseConfirmSosmed')?.addEventListener('click', () => {
        document.getElementById('confirmSosmedModal').classList.remove('show');
    });

    document.getElementById('btnFinalPaySosmed')?.addEventListener('click', async () => {
        const { token, user } = checkLogin();
        const btn = document.getElementById('btnFinalPaySosmed');
        const originalText = btn.innerText;
        btn.innerText = "Memproses...";
        btn.disabled = true;

        const target = document.getElementById('sosmedTarget').value;
        const qty = parseInt(document.getElementById('sosmedQty').value);
        const finalSosmedPrice = getFinalPriceByPage('sosmed');
        const promoDataSosmed = getPromoDataByPage('sosmed');

        try {
            const res = await fetch('/api/buy-sosmed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    service_id: selectedSosmedService.id,
                    target: target,
                    quantity: qty,
                    method: selectedMethodSosmed,
                    promo_code: promoDataSosmed ? promoDataSosmed.code : null,
                    final_amount: finalSosmedPrice
                })
            });
            const data = await res.json();
            document.getElementById('confirmSosmedModal').classList.remove('show');

            if (data.success) {
                if (data.type === 'instant') {
                    Swal.fire({
                        title: 'Suntuik Berhasil!',
                        text: `Pesanan ${selectedSosmedService.name} berhasil dibuat.`,
                        icon: 'success',
                        confirmButtonText: 'Mantap',
                        confirmButtonColor: 'var(--primary-color)',
                        showDenyButton: true,
                        denyButtonText: '⭐ Beri Ulasan',
                        denyButtonColor: '#f1c40f'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.reload();
                        } else if (result.isDenied) {
                            window.location.href = '/ulasan';
                        }
                    });
                } else if (data.type === 'qris') {
                    const expireTime = Date.now() + (5 * 60 * 1000);
                    localStorage.setItem('pendingTrx', JSON.stringify({
                        order_id: data.order_id,
                        pay_amount: data.pay_amount,
                        deposit_amount: data.amount,
                        qr_string: data.qr_string,
                        expire_at: expireTime,
                        username: user ? user.username : 'Guest',
                        trx_type: 'buy_sosmed',
                        product_name: selectedSosmedService.name,
                        target: target
                    }));
                    window.location.href = '/payment';
                }
            } else {
                Swal.fire('Gagal', data.message, 'error');
            }
        } catch (e) {
            console.log(e);
            let pesan = 'Terjadi kesalahan sistem';
            if (e.response && e.response.data && e.response.data.message) {
                pesan = e.response.data.message;
            } else if (e.message) {
                pesan = e.message;
            }
            Swal.fire('Gagal', pesan, 'error');
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });

    document.getElementById('btnGoVPS')?.addEventListener('click', () => {
        if (!checkLogin().token) window.location.href = '/login';
        else {
            switchPage('vps');
            fetchVPS();
        }
    });

    document.getElementById('btnBackVPS')?.addEventListener('click', () => switchPage('home'));

    document.getElementById('btnCaraBeliVPS')?.addEventListener('click', () => {
        Swal.fire({
            title: 'Cara Beli VPS',
            html: `
                <ol style="text-align:left; font-size:13px; padding-left:20px; line-height:1.6; color:#555;">
                    <li>Pilih <b>Paket VPS</b> sesuai spesifikasi (RAM/CPU).</li>
                    <li>Pilih <b>Metode Pembayaran</b> (Saldo/QRIS).</li>
                    <li>Klik tombol <b>Beli Sekarang</b>.</li>
                    <li>Setelah pembayaran sukses, silakan <b>Chat Admin</b> untuk pengambilan IP & Password root.</li>
                </ol>
                <div style="margin-top:10px; font-size:12px; color:#c0392b; background:#f9e79f; padding:8px; border-radius:6px; text-align:left; border-left:4px solid #f1c40f;">
                    <b>⚠️ Info:</b><br>
                    Proses setup VPS membutuhkan waktu estimasi 15-30 menit setelah konfirmasi ke Admin.
                </div>
            `,
            confirmButtonText: 'Siap, Mengerti',
            confirmButtonColor: 'var(--primary-color)'
        });
    });

    document.getElementById('btnBuyVPS')?.addEventListener('click', () => {
        if (!selectedVPSData || !selectedMethodVPS) {
            checkOrderVPS();
            return;
        }

        if (getPromoDataByPage('vps') && selectedMethodVPS === 'qris') {
            Swal.fire({ icon: 'error', title: 'Metode Tidak Valid', text: 'Mohon maaf promo ini hanya bisa di beli menggunakan pembayaran saldo tidak berlaku di pembayaran qris' });
            return;
        }

        document.getElementById('cv-prod').innerText = selectedVPSData.name;
        document.getElementById('cv-method').innerText = selectedMethodVPS.toUpperCase();
        const finalVpsPrice = getFinalPriceByPage('vps');
        document.getElementById('cv-total').innerText = 'Rp ' + finalVpsPrice.toLocaleString();
        document.getElementById('confirmVPSModal').classList.add('show');
    });

    document.getElementById('btnCloseConfirmVPS')?.addEventListener('click', () => {
        document.getElementById('confirmVPSModal').classList.remove('show');
    });

    document.getElementById('btnFinalPayVPS')?.addEventListener('click', async () => {
        const { token, user } = checkLogin();
        const btn = document.getElementById('btnFinalPayVPS');
        btn.innerText = "Memproses...";
        btn.disabled = true;
        const finalVpsPrice = getFinalPriceByPage('vps');
        const promoDataVps = getPromoDataByPage('vps');

        try {
            const res = await fetch('/api/buy-vps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    vps_code: selectedVPSCode,
                    method: selectedMethodVPS,
                    promo_code: promoDataVps ? promoDataVps.code : null,
                    final_amount: finalVpsPrice
                })
            });
            const data = await res.json();
            document.getElementById('confirmVPSModal').classList.remove('show');

            if (data.success) {
                if (data.type === 'instant') {
                    Swal.fire({
                        title: 'Order Sukses!',
                        text: 'Silakan hubungi Admin untuk klaim IP VPS Anda.',
                        icon: 'success',
                        confirmButtonText: 'Chat Admin',
                        confirmButtonColor: '#25D366',
                        showDenyButton: true,
                        denyButtonText: '⭐ Beri Ulasan',
                        denyButtonColor: '#f1c40f'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            const msg = `Halo Admin, saya sudah order ${selectedVPSData.name}...`;
                            window.open(`https://wa.me/6285819066475?text=${encodeURIComponent(msg)}`, '_blank');
                        } else if (result.isDenied) {
                            window.location.href = '/ulasan';
                        }
                    });
                } else if (data.type === 'qris') {
                    const expireTime = Date.now() + (5 * 60 * 1000);
                    localStorage.setItem('pendingTrx', JSON.stringify({
                        order_id: data.order_id,
                        pay_amount: data.pay_amount,
                        deposit_amount: data.amount,
                        qr_string: data.qr_string,
                        expire_at: expireTime,
                        username: user ? user.username : 'Guest',
                        trx_type: 'buy_vps',
                        product_name: selectedVPSData.name
                    }));
                    window.location.href = '/payment';
                }
            } else {
                Swal.fire('Gagal', data.message, 'error');
            }
        } catch (e) {
            Swal.fire('Error', 'Gagal koneksi', 'error');
        } finally {
            btn.innerText = "BAYAR SEKARANG";
            btn.disabled = false;
        }
    });

    document.getElementById('btnGoScript')?.addEventListener('click', () => {
        if (!checkLogin().token) window.location.href = '/login';
        else {
            switchPage('script');
            fetchScripts();
        }
    });

    document.getElementById('btnBackScript')?.addEventListener('click', () => switchPage('home'));

    document.getElementById('btnCheckScriptFeatures')?.addEventListener('click', () => {
        if (!selectedScriptData) {
            Swal.fire({
                icon: 'warning',
                title: 'Pilih Script Dulu',
                text: 'Silakan pilih paket script di bawah (Step 2) terlebih dahulu.',
                confirmButtonColor: '#e67e22'
            });
        } else {
            const rawMenu = selectedScriptData.features ? selectedScriptData.features.join('\n') : 'Belum ada detail fitur.';
            Swal.fire({
                title: `Fitur: ${selectedScriptData.name}`,
                html: `
                    <div style="
                        text-align: left; 
                        white-space: pre-wrap; 
                        font-family: 'Courier New', monospace; 
                        font-size: 12px; 
                        background: #f5f6fa; 
                        padding: 10px; 
                        border-radius: 8px; 
                        max-height: 400px; 
                        overflow-y: auto;
                        border: 1px solid #ddd;
                        color: #333;">${rawMenu}</div>
                `,
                width: 600,
                confirmButtonText: 'Mantap',
                confirmButtonColor: 'var(--primary-color)'
            });
        }
    });

    document.getElementById('btnKeuntunganScript')?.addEventListener('click', () => {
        Swal.fire({
            title: '✨ Keuntungan Script',
            html: `
                <ul style="text-align:left; font-size:13px; padding-left:20px; line-height:1.6;">
                    <li>🔥 <b>Full Source Code</b> (Bisa diedit).</li>
                    <li>⚡ <b>Sekali Bayar</b> (Tanpa biaya bulanan).</li>
                    <li>🛡️ <b>Anti Encrypt</b> (Kode transparan).</li>
                    <li>🚀 <b>Update Gratis</b> (Jika ada versi baru).</li>
                </ul>
            `,
            confirmButtonText: 'Tutup',
            confirmButtonColor: 'var(--primary-color)'
        });
    });

    document.getElementById('btnCaraBeliScript')?.addEventListener('click', () => {
        Swal.fire({
            title: 'Cara Beli Script',
            html: `
                <ol style="text-align:left; font-size:13px; padding-left:20px; line-height:1.6;">
                    <li>Pilih <b>Paket Script</b> di daftar.</li>
                    <li>Klik tombol <b>Cek Fitur</b> jika ingin melihat detail.</li>
                    <li>Pilih <b>Metode Pembayaran</b>.</li>
                    <li>Klik <b>Beli Sekarang</b>.</li>
                    <li>Setelah sukses, buka menu sidebar <b>Download Script</b>.</li>
                </ol>
            `,
            confirmButtonText: 'Paham'
        });
    });

    document.getElementById('btnBuyScript')?.addEventListener('click', () => {
        if (!selectedScriptData || !selectedMethodScript) {
            checkOrderScript();
            return;
        }

        if (getPromoDataByPage('script') && selectedMethodScript === 'qris') {
            Swal.fire({ icon: 'error', title: 'Metode Tidak Valid', text: 'Mohon maaf promo ini hanya bisa di beli menggunakan pembayaran saldo tidak berlaku di pembayaran qris' });
            return;
        }

        document.getElementById('cscr-prod').innerText = selectedScriptData.name;
        document.getElementById('cscr-method').innerText = selectedMethodScript.toUpperCase();
        const finalScPrice = getFinalPriceByPage('script');
        document.getElementById('cscr-total').innerText = 'Rp ' + finalScPrice.toLocaleString();

        document.getElementById('confirmScriptModalOverlay').classList.add('show');
    });

    document.getElementById('btnCloseConfirmScript')?.addEventListener('click', () => {
        document.getElementById('confirmScriptModalOverlay').classList.remove('show');
    });

    document.getElementById('btnFinalPayScript')?.addEventListener('click', async () => {
        const { token, user } = checkLogin();
        const btn = document.getElementById('btnFinalPayScript');
        const originalText = btn.innerText;
        btn.innerText = "Memproses...";
        btn.disabled = true;
        const finalScPrice = getFinalPriceByPage('script');
        const promoDataSc = getPromoDataByPage('script');

        try {
            const res = await fetch('/api/buy-script', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    script_code: selectedScriptCode,
                    method: selectedMethodScript,
                    promo_code: promoDataSc ? promoDataSc.code : null,
                    final_amount: finalScPrice
                })
            });
            const data = await res.json();

            document.getElementById('confirmScriptModalOverlay').classList.remove('show');

            if (data.success) {
                if (data.type === 'instant') {
                    Swal.fire({
                        title: 'Pembelian Berhasil!',
                        text: data.message,
                        icon: 'success',
                        confirmButtonText: '📂 Download Script',
                        confirmButtonColor: 'var(--primary-color)',
                        showDenyButton: true,
                        denyButtonText: '⭐ Beri Ulasan',
                        denyButtonColor: '#f1c40f'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            if (document.getElementById('menuDownloadScript')) {
                                document.getElementById('menuDownloadScript').click();
                            }
                        } else if (result.isDenied) {
                            window.location.href = '/ulasan';
                        }
                    });
                } else if (data.type === 'qris') {
                    const expireTime = Date.now() + (5 * 60 * 1000);
                    localStorage.setItem('pendingTrx', JSON.stringify({
                        order_id: data.order_id,
                        pay_amount: data.pay_amount,
                        deposit_amount: data.amount,
                        qr_string: data.qr_string,
                        expire_at: expireTime,
                        username: user ? user.username : 'Guest',
                        trx_type: 'buy_script',
                        product_name: selectedScriptData.name
                    }));
                    window.location.href = '/payment';
                }
            } else {
                Swal.fire('Gagal', data.message, 'error');
            }
        } catch (e) {
            Swal.fire('Error', 'Gagal terhubung ke server', 'error');
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });

    document.getElementById('btnGoMurid')?.addEventListener('click', () => {
        if (!checkLogin().token) window.location.href = '/login';
        else {
            switchPage('murid');
            fetchMurid();
        }
    });

    document.getElementById('btnBackMurid')?.addEventListener('click', () => switchPage('home'));

    document.getElementById('btnCheckMuridBenefits')?.addEventListener('click', () => {
        if (!selectedMuridData) {
            Swal.fire({
                icon: 'warning',
                title: 'Pilih Paket Dulu',
                text: 'Silakan pilih paket kelas di bawah (Step 2) terlebih dahulu.',
                confirmButtonColor: '#e67e22'
            });
        } else {
            const benefitList = selectedMuridData.benefits ? selectedMuridData.benefits.map(f => `<li>✅ ${f}</li>`).join('') : '<li>Full Akses</li>';
            Swal.fire({
                title: `Keuntungan: ${selectedMuridData.name}`,
                html: `<ul style="text-align:left; padding-left:20px; color:#555; line-height:1.8;">${benefitList}</ul>`,
                confirmButtonText: 'Mantap, Saya Ambil',
                confirmButtonColor: 'var(--primary-color)'
            });
        }
    });

    document.getElementById('btnCaraJoinMurid')?.addEventListener('click', () => {
        Swal.fire({
            title: 'Cara Join Murid',
            html: `
                <ol style="text-align:left; font-size:13px; padding-left:20px; line-height:1.6;">
                    <li>Pilih <b>Paket Kelas</b> yang sesuai.</li>
                    <li>Cek <b>Keuntungan</b> untuk detail fasilitas.</li>
                    <li>Pilih Metode Pembayaran & Bayar.</li>
                    <li>Setelah sukses, Admin akan chat WA Anda untuk invite grup.</li>
                </ol>
            `,
            confirmButtonText: 'Siap'
        });
    });

    document.getElementById('btnCaraBeliSosmed')?.addEventListener('click', () => {
        Swal.fire({
            title: 'Cara Order Sosmed',
            html: `
                <ol style="text-align:left; font-size:13px; padding-left:20px; line-height:1.6; color:#555;">
                    <li>Pilih <b>Kategori</b> (Instagram, TikTok, dll).</li>
                    <li>Pilih <b>Layanan</b> yang diinginkan.</li>
                    <li>Baca <b>Deskripsi</b> layanan (Min/Max order).</li>
                    <li>Masukkan <b>Target</b> (Username atau Link Post).</li>
                    <li>Masukkan <b>Jumlah</b> yang mau dibeli.</li>
                    <li>Klik <b>Suntuik Sekarang</b>.</li>
                </ol>
                <div style="margin-top:15px; font-size:12px; color:#c0392b; background:#f9e79f; padding:10px; border-radius:6px; text-align:left; border-left:4px solid #f1c40f;">
                    <b>⚠️ PENTING:</b><br>
                    1. Akun target <b>JANGAN DI-PRIVATE</b> (Wajib Publik).<br>
                    2. Jangan ganti username selama proses.<br>
                    3. Jangan order layanan sama untuk target sama jika status belum selesai.
                </div>
            `,
            confirmButtonText: 'Siap, Saya Paham',
            confirmButtonColor: 'var(--primary-color)'
        });
    });

    document.getElementById('btnBuyMurid')?.addEventListener('click', () => {
        if (!selectedMuridData || !selectedMethodMurid) {
            checkOrderMurid();
            return;
        }

        if (getPromoDataByPage('murid') && selectedMethodMurid === 'qris') {
            Swal.fire({ icon: 'error', title: 'Metode Tidak Valid', text: 'Mohon maaf promo ini hanya bisa di beli menggunakan pembayaran saldo tidak berlaku di pembayaran qris' });
            return;
        }

        document.getElementById('cm-prod').innerText = selectedMuridData.name;
        document.getElementById('cm-method').innerText = selectedMethodMurid.toUpperCase();
        const finalMrdPrice = getFinalPriceByPage('murid');
        document.getElementById('cm-total').innerText = 'Rp ' + finalMrdPrice.toLocaleString();
        document.getElementById('confirmMuridModalOverlay').classList.add('show');
    });

    document.getElementById('btnCloseConfirmMurid')?.addEventListener('click', () => {
        document.getElementById('confirmMuridModalOverlay').classList.remove('show');
    });

    document.getElementById('btnFinalPayMurid')?.addEventListener('click', async () => {
        const { token, user } = checkLogin();
        const btn = document.getElementById('btnFinalPayMurid');
        const originalText = btn.innerText;
        btn.innerText = "Memproses...";
        btn.disabled = true;
        const finalMrdPrice = getFinalPriceByPage('murid');
        const promoDataMrd = getPromoDataByPage('murid');

        try {
            const res = await fetch('/api/buy-murid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    murid_code: selectedMuridCode,
                    method: selectedMethodMurid,
                    promo_code: promoDataMrd ? promoDataMrd.code : null,
                    final_amount: finalMrdPrice
                })
            });
            const data = await res.json();
            document.getElementById('confirmMuridModalOverlay').classList.remove('show');

            if (data.success) {
                if (data.type === 'instant') {
                    Swal.fire({
                        title: 'Join Berhasil!',
                        text: 'Pembayaran Lunas. Silakan masuk ke menu Kelas Saya.',
                        icon: 'success',
                        confirmButtonText: '📂 Buka Kelas Saya',
                        confirmButtonColor: 'var(--primary-color)',
                        showDenyButton: true,
                        denyButtonText: '⭐ Beri Ulasan',
                        denyButtonColor: '#f1c40f'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            if (document.getElementById('menuKelasSaya')) {
                                document.getElementById('menuKelasSaya').click();
                            }
                        } else if (result.isDenied) {
                            window.location.href = '/ulasan';
                        }
                    });
                } else if (data.type === 'qris') {
                    const expireTime = Date.now() + (5 * 60 * 1000);
                    localStorage.setItem('pendingTrx', JSON.stringify({
                        order_id: data.order_id,
                        pay_amount: data.pay_amount,
                        deposit_amount: data.amount,
                        qr_string: data.qr_string,
                        expire_at: expireTime,
                        username: user ? user.username : 'Guest',
                        trx_type: 'buy_murid',
                        product_name: selectedMuridData.name
                    }));
                    window.location.href = '/payment';
                }
            } else {
                Swal.fire('Gagal', data.message, 'error');
            }
        } catch (e) {
            Swal.fire('Error', 'Gagal terhubung ke server', 'error');
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });

    const modalScriptOverlay = document.getElementById('confirmScriptModalOverlay');
    if (modalScriptOverlay) {
        modalScriptOverlay.addEventListener('click', (e) => {
            if (e.target === modalScriptOverlay) modalScriptOverlay.classList.remove('show');
        });
    }

    const openHelpList = [document.getElementById('btnHelpHome'), document.getElementById('btnHelpTrxTop')];
    openHelpList.forEach(btn => { if (btn) btn.addEventListener('click', () => helpModal.classList.add('show')); });
    document.getElementById('btnCloseHelp')?.addEventListener('click', () => helpModal.classList.remove('show'));

    if (document.getElementById('btnSearchTrx')) {
        document.getElementById('btnSearchTrx').addEventListener('click', () => dateFilterModal.classList.add('show'));
        document.getElementById('btnCloseDateFilter').addEventListener('click', () => dateFilterModal.classList.remove('show'));
        document.getElementById('btnApplyFilter').addEventListener('click', () => {
            const dateVal = document.getElementById('inputDateFilter').value;
            if (!dateVal) return Swal.fire('Pilih Tanggal', 'Silakan tentukan tanggal dulu', 'warning');
            const filtered = allTransactions.filter(t => new Date(t.date).toISOString().split('T')[0] === dateVal);
            renderTransactionList(filtered);
            dateFilterModal.classList.remove('show');
            if (filtered.length === 0) Swal.fire({ icon: 'info', title: 'Tidak Ditemukan', toast: true, position: 'top', timer: 2000 });
        });
        document.getElementById('btnResetFilter').addEventListener('click', () => {
            document.getElementById('inputDateFilter').value = '';
            renderTransactionList(allTransactions);
            dateFilterModal.classList.remove('show');
        });
    }

    document.getElementById('btnCloseInvoice')?.addEventListener('click', () => invoiceModal.classList.remove('show'));

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            if (target === 'info') {
                isInfoMenuOpened = true;
                document.getElementById('infoBadge').classList.remove('show');

                const bellIcon = document.querySelector('.nav-item[data-target="info"] i');
                if (bellIcon) bellIcon.classList.remove('shake-bell');

                loadInfoPage();
                switchPage('info');
            } else if (target === 'home') switchPage('home');
            else {
                if (!checkLogin().token) window.location.href = '/login';
                else switchPage(target);
            }
        });
    });

    document.getElementById('btnGoPanel')?.addEventListener('click', () => {
        if (!checkLogin().token) window.location.href = '/login';
        else switchPage('panel');
    });

    document.getElementById('btnBackPanel')?.addEventListener('click', goBack);

    document.getElementById('panelUser')?.addEventListener('input', function() {
        this.value = this.value.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
        checkOrder();
    });

    document.getElementById('btnBuy')?.addEventListener('click', () => {
        if (!selectedMethod) {
            Swal.fire({
                icon: 'warning',
                title: 'Pilih Pembayaran',
                text: 'Silakan pilih metode pembayaran terlebih dahulu!',
                timer: 2000,
                showConfirmButton: false
            });
            const paymentSection = document.querySelectorAll('.step-box')[2];
            if (paymentSection) {
                paymentSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                paymentSection.style.border = "2px solid #e74c3c";
                setTimeout(() => paymentSection.style.border = "1px solid var(--border-color)", 1000);
            }
            return;
        }

        if (getPromoDataByPage('panel') && selectedMethod === 'qris') {
            Swal.fire({ icon: 'error', title: 'Metode Tidak Valid', text: 'Mohon maaf promo ini hanya bisa di beli menggunakan pembayaran saldo tidak berlaku di pembayaran qris' });
            return;
        }

        openModalConfirm();
    });

    document.getElementById('btnFinalPay')?.addEventListener('click', async () => {
    const { token, user } = checkLogin();
    const orderType = document.getElementById('panelOrderType') ? document.getElementById('panelOrderType').value : 'new';
    const username_panel = orderType === 'new' ? document.getElementById('panelUser').value : document.getElementById('existingPanelUser').value;
    
    const btn = document.getElementById('btnFinalPay');

        btn.innerText = "Memproses...";
        btn.disabled = true;

        const finalPrice = getFinalPriceByPage('panel');
        const promoData = getPromoDataByPage('panel');

        try {
            const res = await fetch('/api/buy-panel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    username_panel,
                    order_type: orderType, // <---- TAMBAHKAN BARIS INI
                    product_code: selectedProductCode,
                    method: selectedMethod,
                    promo_code: promoData ? promoData.code : null,
                    final_amount: finalPrice
                })
            });
            const data = await res.json();

            if (data.success) {
                if (data.type === 'instant') {
                    Swal.fire({
                        title: 'Sukses!',
                        text: data.message,
                        icon: 'success',
                        confirmButtonText: 'Lihat Data Panel',
                        showDenyButton: true,
                        denyButtonText: '⭐ Beri Ulasan',
                        denyButtonColor: '#f1c40f',
                        allowOutsideClick: false
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.href = '/#panelPopup';
                            if (window.location.pathname === '/') window.location.reload();
                        } else if (result.isDenied) {
                            window.location.href = '/ulasan';
                        }
                    });
                } else if (data.type === 'qris') {
                    const expireTime = Date.now() + (5 * 60 * 1000);
                    localStorage.setItem('pendingTrx', JSON.stringify({
                        order_id: data.order_id,
                        pay_amount: data.pay_amount,
                        deposit_amount: data.amount,
                        qr_string: data.qr_string,
                        expire_at: expireTime,
                        username: user ? user.username : 'Guest',
                        trx_type: 'buy_panel',
                        username_panel: username_panel
                    }));
                    window.location.href = '/payment';
                }
            } else {
                Swal.fire('Gagal', data.message, 'error');
            }
        } catch (e) {
            Swal.fire('Error', 'Gagal koneksi server', 'error');
        } finally {
            confirmModal.classList.remove('show');
            btn.innerText = "BAYAR SEKARANG";
            btn.disabled = false;
        }
    });

    if (window.location.hash === '#panelPopup') {
        history.replaceState(null, null, ' ');
        setTimeout(() => {
            const btnPanel = document.getElementById('menuPanelPopup');
            if (btnPanel) {
                btnPanel.click();
            }
        }, 500);
    }

    document.getElementById('btnCloseConfirm')?.addEventListener('click', () => confirmModal.classList.remove('show'));

    document.querySelectorAll('.tab-item-clean').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab-item-clean').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const filterType = tab.getAttribute('data-filter');
            let filteredData = allTransactions;
            if (filterType === 'success') filteredData = allTransactions.filter(t => t.status === 'success');
            else if (filterType === 'pending') filteredData = allTransactions.filter(t => t.status === 'pending');
            else if (filterType === 'failed') filteredData = allTransactions.filter(t => t.status === 'canceled' || t.status === 'expired');
            renderTransactionList(filteredData);
        });
    });

    document.getElementById('btnCaraBeli')?.addEventListener('click', () => caraBeliModal.classList.add('show'));
    document.getElementById('btnCloseCaraBeli')?.addEventListener('click', () => caraBeliModal.classList.remove('show'));

    document.getElementById('btnBukaDompet')?.addEventListener('click', () => {
        if (!checkLogin().token) window.location.href = '/login';
        else window.location.href = '/transfer';
    });

    document.getElementById('btnCloseDeposit')?.addEventListener('click', () => modalDeposit.classList.remove('show'));
    document.getElementById('btnProsesDeposit')?.addEventListener('click', processDeposit);
    document.getElementById('btnAlertOk')?.addEventListener('click', () => customAlertModal.classList.remove('show'));
    document.getElementById('themeToggle')?.addEventListener('click', () => document.body.classList.toggle('dark-mode'));

    document.getElementById('btnCancelCrop')?.addEventListener('click', () => {
        cropModal.classList.remove('show');
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
        document.getElementById('fileProfile').value = '';
        document.getElementById('fileBanner').value = '';
    });

    document.getElementById('btnCloseCrop')?.addEventListener('click', () => document.getElementById('btnCancelCrop').click());

    document.getElementById('btnApplyCrop')?.addEventListener('click', () => {
        if (!cropper) return;
        const canvas = cropper.getCroppedCanvas({ width: 600, height: currentCropType === 'profile' ? 600 : 337 });
        canvas.toBlob((blob) => {
            const previewUrl = URL.createObjectURL(blob);
            if (currentCropType === 'profile') {
                pendingProfileBlob = blob;
                document.getElementById('displayProfile').src = previewUrl;
            } else {
                pendingBannerBlob = blob;
                document.getElementById('displayBanner').style.backgroundImage = `url('${previewUrl}')`;
            }
            cropModal.classList.remove('show');
            cropper.destroy();
            cropper = null;
        }, 'image/jpeg', 0.8);
    });

    [helpModal, caraBeliModal, confirmModal, modalDeposit, customAlertModal, invoiceModal, dateFilterModal, cropModal, panelPopupModal, keuntunganModal].forEach(modal => {
        if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });
    });

    setupAccountListeners();
    setupSidebarMenus();
    setupAccordion();

    const inputDepo = document.getElementById('depoAmount');
    if (inputDepo) {
        inputDepo.addEventListener('input', () => {
            document.querySelectorAll('.preset-btn').forEach(btn => {
                btn.classList.remove('active');
            });
        });
    }

    const promoModal = document.getElementById('promoApkModal');
    const btnClosePromo = document.getElementById('btnClosePromo');
    const btnDownloadApk = document.getElementById('btnDownloadApk');

    function createFireBurst(e) {
        const burstCount = 15;
        for (let i = 0; i < burstCount; i++) {
            const fire = document.createElement('div');
            fire.innerHTML = '🔥';
            fire.className = 'fire-emoji';
            const startX = e.clientX || window.innerWidth / 2;
            const startY = e.clientY || window.innerHeight / 2;
            fire.style.left = startX + 'px';
            fire.style.top = startY + 'px';
            const angle = Math.random() * Math.PI * 2;
            const velocity = 60 + Math.random() * 120;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity - 50;
            fire.style.setProperty('--tx', tx + 'px');
            fire.style.setProperty('--ty', ty + 'px');
            fire.style.transform = `rotate(${Math.random() * 60 - 30}deg)`;

            document.body.appendChild(fire);
            setTimeout(() => {
                fire.remove();
            }, 1200);
        }
    }

    if (btnClosePromo) {
        btnClosePromo.addEventListener('click', (e) => {
            if (promoModal) promoModal.classList.remove('show');
            createFireBurst(e);
        });
    }

    if (btnDownloadApk) {
        btnDownloadApk.addEventListener('click', () => {
            if (promoModal) promoModal.classList.remove('show');
        });
    }

    document.getElementById('btnGoEwallet')?.addEventListener('click', () => {
        if (!checkLogin().token) window.location.href = '/login';
        else {
            switchPage('ewallet-dana');
            fetchEwalletProductsDANA();
            resetEwalletInputs();
        }
    });

    document.getElementById('btnBackEwallet')?.addEventListener('click', () => switchPage('home'));

    document.getElementById('btnCaraBeliEwallet')?.addEventListener('click', () => {
        Swal.fire({
            title: 'Cara Topup DANA',
            html: `
                <ol style="text-align:left; font-size:13px; padding-left:20px; line-height:1.6; color:#555;">
                    <li>Masukkan <b>Nomor DANA</b> Anda.</li>
                    <li>Klik tombol <b>Cek Nomor</b> untuk memastikan nomor valid.</li>
                    <li>Pilih <b>Nominal Topup</b> yang diinginkan.</li>
                    <li>Pilih Pembayaran & Bayar.</li>
                    <li>Dana akan masuk otomatis ke akun DANA Anda.</li>
                </ol>
                <div style="margin-top:10px; font-size:12px; color:#e74c3c; background:#ffebee; padding:10px; border-radius:6px;">
                    <b>⚠️ Catatan:</b> Pastikan nomor yang dimasukkan sudah benar dan terdaftar di DANA. Kesalahan nomor bukan tanggung jawab kami.
                </div>
            `,
            confirmButtonText: 'Oke Paham',
            confirmButtonColor: 'var(--primary-color)'
        });
    });

    document.getElementById('btnBuyEwallet')?.addEventListener('click', function() {
        if (!selectedEwalletData || !selectedMethodEwallet) {
            checkOrderEwallet();
            return;
        }

        if (getPromoDataByPage('ewallet') && selectedMethodEwallet === 'qris') {
            Swal.fire({ icon: 'error', title: 'Metode Tidak Valid', text: 'Mohon maaf promo ini hanya bisa di beli menggunakan pembayaran saldo, tidak berlaku di pembayaran qris' });
            return;
        }

        if (!checkedEwalletUser) {
            Swal.fire('Error', 'Cek nomor DANA terlebih dahulu!', 'warning');
            return;
        }

        document.getElementById('ce-name').innerText = checkedEwalletUser.name || '-';
        document.getElementById('ce-phone').innerText = checkedEwalletUser.number || '-';
        document.getElementById('ce-prod').innerText = selectedEwalletData.name || '-';
        document.getElementById('ce-method').innerText = selectedMethodEwallet.toUpperCase() || '-';
        const finalEwalletPrice = getFinalPriceByPage('ewallet');
        document.getElementById('ce-total').innerText = 'Rp ' + (finalEwalletPrice || 0).toLocaleString();

        document.getElementById('confirmEwalletModal').classList.add('show');
    });

    document.getElementById('btnCloseConfirmEwallet')?.addEventListener('click', () => {
        document.getElementById('confirmEwalletModal').classList.remove('show');
    });

    document.getElementById('btnFinalPayEwallet')?.addEventListener('click', async () => {
        const { token, user } = checkLogin();
        const btn = document.getElementById('btnFinalPayEwallet');
        const originalText = btn.innerText;
        btn.innerText = "Memproses...";
        btn.disabled = true;

        const finalEwalletPrice = getFinalPriceByPage('ewallet');
        const promoDataEwallet = getPromoDataByPage('ewallet');

        try {
            const res = await fetch('/api/buy-ewallet/dana', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    product_code: selectedEwalletCode,
                    target: checkedEwalletUser.number,
                    method: selectedMethodEwallet,
                    promo_code: promoDataEwallet ? promoDataEwallet.code : null,
                    final_amount: finalEwalletPrice
                })
            });
            const data = await res.json();
            document.getElementById('confirmEwalletModal').classList.remove('show');

            if (data.success) {
                if (data.type === 'instant') {
                    Swal.fire({
                        title: 'Sukses!',
                        html: `Topup <b>${selectedEwalletData.name}</b> untuk <b>${checkedEwalletUser.name}</b> sedang diproses.<br>Dana akan masuk dalam beberapa menit.`,
                        icon: 'success',
                        confirmButtonText: 'Cek Riwayat',
                        showDenyButton: true,
                        denyButtonText: '⭐ Beri Ulasan',
                        denyButtonColor: '#f1c40f'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            switchPage('transaksi');
                        } else if (result.isDenied) {
                            window.location.href = '/ulasan';
                        }
                    });

                    resetEwalletInputs();

                } else if (data.type === 'qris') {
                    const expireTime = Date.now() + (5 * 60 * 1000);
                    localStorage.setItem('pendingTrx', JSON.stringify({
                        order_id: data.order_id,
                        pay_amount: data.pay_amount,
                        deposit_amount: data.amount,
                        qr_string: data.qr_string,
                        expire_at: expireTime,
                        username: user.username,
                        trx_type: 'buy_ewallet',
                        product_name: selectedEwalletData.name,
                        target: checkedEwalletUser.number
                    }));
                    window.location.href = '/payment';
                }
            } else {
                Swal.fire('Gagal', data.message, 'error');
                if (data.refund) {
                    loadUserData();
                }
            }
        } catch (e) {
            console.log(e);
            Swal.fire('Gagal', 'Terjadi kesalahan', 'error');
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });

    document.getElementById('btnGoEwalletGD')?.addEventListener('click', () => {
        if (!checkLogin().token) window.location.href = '/login';
        else {
            switchPage('ewallet-gd');
            fetchEwalletProductsGD();
            resetEwalletInputsGD();
        }
    });

    document.getElementById('btnBackEwalletGD')?.addEventListener('click', () => switchPage('home'));

    document.getElementById('btnCaraBeliEwalletGD')?.addEventListener('click', () => {
        Swal.fire({
            title: 'Cara Topup GoPay Driver',
            html: `
                <ol style="text-align:left; font-size:13px; padding-left:20px; line-height:1.6; color:#555;">
                    <li>Masukkan <b>Nomor HP</b> yang terdaftar di aplikasi Gojek Driver / GoPartner.</li>
                    <li>Klik tombol <b>Cek Nomor</b> untuk memvalidasi.</li>
                    <li>Pilih <b>Nominal Saldo</b> yang diinginkan.</li>
                    <li>Pilih Pembayaran & Bayar.</li>
                    <li>Saldo akan otomatis masuk ke aplikasi Driver Anda.</li>
                </ol>
                <div style="margin-top:10px; font-size:12px; color:#27ae60; background:#e8f5e9; padding:10px; border-radius:6px;">
                    <b>⚠️ PENTING:</b> Pastikan nomor yang dimasukkan adalah nomor khusus <b>Pengemudi/Driver</b>, bukan akun customer Gojek biasa.
                </div>
            `,
            confirmButtonText: 'Oke, Paham',
            confirmButtonColor: '#00aa13'
        });
    });

    document.getElementById('btnBuyEwalletGD')?.addEventListener('click', () => {
        if (!selectedEwalletDataGD || !selectedMethodEwalletGD) {
            checkOrderEwalletGD();
            return;
        }

        if (getPromoDataByPage('ewallet-gd') && selectedMethodEwalletGD === 'qris') {
            Swal.fire({ icon: 'error', title: 'Metode Tidak Valid', text: 'Promo hanya bisa via saldo' });
            return;
        }

        document.getElementById('ce-phone-gd').innerText = checkedEwalletUserGD.number;
        document.getElementById('ce-prod-gd').innerText = selectedEwalletDataGD.name;
        document.getElementById('ce-method-gd').innerText = selectedMethodEwalletGD.toUpperCase();
        document.getElementById('ce-total-gd').innerText = 'Rp ' + getFinalPriceByPage('ewallet-gd').toLocaleString();
        document.getElementById('confirmEwalletModalGD').classList.add('show');
    });

    document.getElementById('btnCloseConfirmEwalletGD')?.addEventListener('click', () => document.getElementById('confirmEwalletModalGD').classList.remove('show'));

    document.getElementById('btnFinalPayEwalletGD')?.addEventListener('click', async () => {
        const { token, user } = checkLogin();
        const btn = document.getElementById('btnFinalPayEwalletGD');
        const originalText = btn.innerText;
        btn.innerText = "Memproses...";
        btn.disabled = true;

        try {
            const res = await fetch('/api/buy-ewallet/gopay-driver', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    product_code: selectedEwalletCodeGD,
                    target: checkedEwalletUserGD.number,
                    method: selectedMethodEwalletGD,
                    promo_code: getPromoDataByPage('ewallet-gd') ? getPromoDataByPage('ewallet-gd').code : null,
                    final_amount: getFinalPriceByPage('ewallet-gd')
                })
            });
            const data = await res.json();
            document.getElementById('confirmEwalletModalGD').classList.remove('show');

            if (data.success) {
                if (data.type === 'instant') {
                    Swal.fire({ title: 'Sukses!', text: `Topup ${selectedEwalletDataGD.name} diproses.`, icon: 'success' })
                        .then(() => switchPage('transaksi'));
                    resetEwalletInputsGD();
                } else if (data.type === 'qris') {
                    localStorage.setItem('pendingTrx', JSON.stringify({
                        order_id: data.order_id,
                        pay_amount: data.pay_amount,
                        deposit_amount: data.amount,
                        qr_string: data.qr_string,
                        expire_at: Date.now() + 300000,
                        username: user.username,
                        trx_type: 'buy_ewallet',
                        product_name: selectedEwalletDataGD.name,
                        target: checkedEwalletUserGD.number
                    }));
                    window.location.href = '/payment';
                }
            } else {
                Swal.fire('Gagal', data.message, 'error');
            }
        } catch (e) {
            Swal.fire('Gagal', 'Terjadi kesalahan', 'error');
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });

    document.getElementById('btnGoEwalletGopay')?.addEventListener('click', () => {
        if (!checkLogin().token) window.location.href = '/login';
        else {
            switchPage('ewallet-gopay');
            fetchEwalletProductsGopay();
            resetEwalletInputsGopay();
        }
    });

    document.getElementById('btnBackEwalletGopay')?.addEventListener('click', () => switchPage('home'));

    document.getElementById('btnCaraBeliEwalletGopay')?.addEventListener('click', () => {
        Swal.fire({
            title: 'Cara Topup GoPay',
            html: `
                <ol style="text-align:left; font-size:13px; padding-left:20px; line-height:1.6; color:#555;">
                    <li>Masukkan <b>Nomor HP</b> yang terdaftar di aplikasi Gojek.</li>
                    <li>Klik tombol <b>Cek Nomor</b> untuk memvalidasi.</li>
                    <li>Pilih <b>Nominal Saldo</b> yang diinginkan (Pilih paket Promo jika ada).</li>
                    <li>Pilih Pembayaran & Bayar.</li>
                </ol>
                <div style="margin-top:10px; font-size:12px; color:#2980b9; background:#e3f2fd; padding:10px; border-radius:6px;">
                    <b>💡 Tips:</b> Manfaatkan paket promo (GJK) untuk mendapatkan harga yang lebih murah!
                </div>
            `,
            confirmButtonText: 'Oke, Paham',
            confirmButtonColor: '#00aedd'
        });
    });

    document.getElementById('btnBuyEwalletGopay')?.addEventListener('click', function() {
        if (!selectedEwalletDataGopay || !selectedMethodEwalletGopay) {
            checkOrderEwalletGopay();
            return;
        }

        if (getPromoDataByPage('ewallet-gopay') && selectedMethodEwalletGopay === 'qris') {
            Swal.fire({ icon: 'error', title: 'Metode Tidak Valid', text: 'Promo hanya bisa via saldo' });
            return;
        }

        if (!checkedEwalletUserGopay) {
            Swal.fire('Error', 'Cek nomor GoPay terlebih dahulu!', 'warning');
            return;
        }

        document.getElementById('ce-phone-gopay').innerText = checkedEwalletUserGopay.number || '-';
        document.getElementById('ce-prod-gopay').innerText = selectedEwalletDataGopay.name || '-';
        document.getElementById('ce-method-gopay').innerText = selectedMethodEwalletGopay.toUpperCase() || '-';
        document.getElementById('ce-total-gopay').innerText = 'Rp ' + getFinalPriceByPage('ewallet-gopay').toLocaleString();

        document.getElementById('confirmEwalletModalGopay').classList.add('show');
    });

    document.getElementById('btnCloseConfirmEwalletGopay')?.addEventListener('click', () => {
        document.getElementById('confirmEwalletModalGopay').classList.remove('show');
    });

    document.getElementById('btnFinalPayEwalletGopay')?.addEventListener('click', async () => {
        const { token, user } = checkLogin();
        const btn = document.getElementById('btnFinalPayEwalletGopay');
        const originalText = btn.innerText;
        btn.innerText = "Memproses...";
        btn.disabled = true;

        try {
            const res = await fetch('/api/buy-ewallet/gopay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    product_code: selectedEwalletCodeGopay,
                    target: checkedEwalletUserGopay.number,
                    method: selectedMethodEwalletGopay,
                    promo_code: getPromoDataByPage('ewallet-gopay') ? getPromoDataByPage('ewallet-gopay').code : null,
                    final_amount: getFinalPriceByPage('ewallet-gopay')
                })
            });
            const data = await res.json();
            document.getElementById('confirmEwalletModalGopay').classList.remove('show');

            if (data.success) {
                if (data.type === 'instant') {
                    Swal.fire({ title: 'Sukses!', text: `Topup ${selectedEwalletDataGopay.name} diproses.`, icon: 'success' })
                        .then(() => switchPage('transaksi'));
                    resetEwalletInputsGopay();
                } else if (data.type === 'qris') {
                    localStorage.setItem('pendingTrx', JSON.stringify({
                        order_id: data.order_id,
                        pay_amount: data.pay_amount,
                        deposit_amount: data.amount,
                        qr_string: data.qr_string,
                        expire_at: Date.now() + 300000,
                        username: user.username,
                        trx_type: 'buy_ewallet',
                        product_name: selectedEwalletDataGopay.name,
                        target: checkedEwalletUserGopay.number
                    }));
                    window.location.href = '/payment';
                }
            } else {
                Swal.fire('Gagal', data.message, 'error');
            }
        } catch (e) {
            Swal.fire('Gagal', 'Terjadi kesalahan', 'error');
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });

    document.getElementById('btnGoGame')?.addEventListener('click', () => {
        if (!checkLogin().token) window.location.href = '/login';
        else {
            switchPage('game-ff');
            fetchGameProductsFF();
            resetGameInputs();
        }
    });

    document.getElementById('btnBackGame')?.addEventListener('click', () => switchPage('home'));

    document.getElementById('btnCaraBeliGame')?.addEventListener('click', () => {
        Swal.fire({
            title: 'Cara Topup Game',
            html: `
                <ol style="text-align:left; font-size:13px; padding-left:20px; line-height:1.6; color:#555;">
                    <li>Masukkan <b>ID Pemain</b> Free Fire Anda.</li>
                    <li>Klik tombol <b>Cek ID</b> untuk memastikan nickname benar.</li>
                    <li>Pilih <b>Nominal Diamond</b> yang diinginkan.</li>
                    <li>Pilih Pembayaran & Bayar.</li>
                    <li>Diamond akan masuk otomatis ke akun Anda.</li>
                </ol>
                <div style="margin-top:10px; font-size:12px; color:#27ae60; background:#e8f5e9; padding:10px; border-radius:6px;">
                    <b>⚠️ Catatan:</b> Pastikan ID yang dimasukkan sudah benar. Kesalahan ID bukan tanggung jawab kami.
                </div>
            `,
            confirmButtonText: 'Oke Paham',
            confirmButtonColor: 'var(--primary-color)'
        });
    });

    document.getElementById('btnBuyGame')?.addEventListener('click', () => {
        if (!checkedGameUser || !selectedGameData || !selectedMethodGame) {
            checkOrderGame();
            return;
        }

        if (getPromoDataByPage('game') && selectedMethodGame === 'qris') {
            Swal.fire({ icon: 'error', title: 'Metode Tidak Valid', text: 'Mohon maaf promo ini hanya bisa di beli menggunakan pembayaran saldo, tidak berlaku di pembayaran qris' });
            return;
        }

        document.getElementById('cg-nick').innerText = checkedGameUser.nickname;
        document.getElementById('cg-id').innerText = checkedGameUser.user_id;
        document.getElementById('cg-prod').innerText = selectedGameData.name;
        document.getElementById('cg-method').innerText = selectedMethodGame.toUpperCase();
        const finalGamePrice = getFinalPriceByPage('game');
        document.getElementById('cg-total').innerText = 'Rp ' + finalGamePrice.toLocaleString();

        document.getElementById('confirmGameModal').classList.add('show');
    });

    document.getElementById('btnCloseConfirmGame')?.addEventListener('click', () => {
        document.getElementById('confirmGameModal').classList.remove('show');
    });

    document.getElementById('btnFinalPayGame')?.addEventListener('click', async () => {
        const { token, user } = checkLogin();
        const btn = document.getElementById('btnFinalPayGame');
        const originalText = btn.innerText;
        btn.innerText = "Memproses...";
        btn.disabled = true;

        const finalGamePrice = getFinalPriceByPage('game');
        const promoDataGame = getPromoDataByPage('game');

        try {
            const res = await fetch('/api/buy-game/ff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    product_code: selectedGameCode,
                    target: checkedGameUser.user_id,
                    method: selectedMethodGame,
                    promo_code: promoDataGame ? promoDataGame.code : null,
                    final_amount: finalGamePrice
                })
            });
            const data = await res.json();
            document.getElementById('confirmGameModal').classList.remove('show');

            if (data.success) {
                if (data.type === 'instant') {
                    Swal.fire({
                        title: 'Sukses!',
                        html: `Pesanan <b>${selectedGameData.name}</b> untuk <b>${checkedGameUser.nickname}</b> sedang diproses.<br>Silakan cek status secara berkala.`,
                        icon: 'success',
                        confirmButtonText: 'Cek Riwayat',
                        showDenyButton: true,
                        denyButtonText: '⭐ Beri Ulasan',
                        denyButtonColor: '#f1c40f'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            switchPage('transaksi');
                        } else if (result.isDenied) {
                            window.location.href = '/ulasan';
                        }
                    });

                    resetGameInputs();

                } else if (data.type === 'qris') {
                    const expireTime = Date.now() + (5 * 60 * 1000);
                    localStorage.setItem('pendingTrx', JSON.stringify({
                        order_id: data.order_id,
                        pay_amount: data.pay_amount,
                        deposit_amount: data.amount,
                        qr_string: data.qr_string,
                        expire_at: expireTime,
                        username: user.username,
                        trx_type: 'buy_game',
                        product_name: selectedGameData.name,
                        target: checkedGameUser.user_id
                    }));
                    window.location.href = '/payment';
                }
            } else {
                Swal.fire('Gagal', data.message, 'error');
            }
        } catch (e) {
            console.log(e);
            Swal.fire('Gagal', 'Terjadi kesalahan', 'error');
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });

    document.getElementById('btnGoNokos')?.addEventListener('click', () => {
        if (!checkLogin().token) window.location.href = '/login';
        else {
            switchPage('nokos');
            fetchNokosNegara();
        }
    });

    document.getElementById('btnBackNokos')?.addEventListener('click', () => switchPage('home'));

    document.getElementById('btnCaraBeliNokos')?.addEventListener('click', () => {
        Swal.fire({
            title: 'Cara Beli Nokos',
            html: `
                <ol style="text-align:left; font-size:13px; padding-left:20px; line-height:1.6; color:#555;">
                    <li>Pilih <b>Negara</b> tujuan.</li>
                    <li>Pilih <b>Operator</b> (bisa pilih "any" untuk random).</li>
                    <li>Pilih <b>Layanan</b> (WhatsApp, Telegram, dll).</li>
                    <li>Pilih Pembayaran & Bayar.</li>
                    <li>Nomor akan langsung muncul setelah bayar.</li>
                    <li>Cek OTP di menu <b>Nokos Saya</b>.</li>
                </ol>
                <div style="margin-top:10px; font-size:12px; color:#27ae60; background:#e8f5e9; padding:10px; border-radius:6px;">
                    <b>⚠️ Catatan:</b> OTP bisa dicek setelah 1-3 menit. Jika tidak masuk dalam 5 menit, bisa dibatalkan dan saldo kembali.
                </div>
            `,
            confirmButtonText: 'Oke Paham',
            confirmButtonColor: 'var(--primary-color)'
        });
    });

    document.getElementById('nokosNegara')?.addEventListener('change', async (e) => {
        const negaraId = e.target.value;
        if (!negaraId) return;

        selectedNegara = nokosNegaraList.find(n => n.id_negara == negaraId);

        await fetchNokosOperator(negaraId);
        await fetchNokosLayanan(negaraId);

        resetPromo('nokos');
    });

    document.getElementById('nokosOperator')?.addEventListener('change', (e) => {
        selectedOperator = e.target.value;
        checkOrderNokos();
    });

    document.getElementById('nokosLayanan')?.addEventListener('change', (e) => {
        const selected = e.target.selectedOptions[0];
        const kode = selected.value;
        const harga = selected.getAttribute('data-harga');

        selectedLayanan = nokosLayananList.find(l => l.kode === kode);
        if (selectedLayanan) {
            document.getElementById('nokosHarga').innerText = 'Harga: Rp ' + parseInt(harga).toLocaleString();
        }
        checkOrderNokos();
        resetPromo('nokos');
    });

    document.getElementById('btnBuyNokos')?.addEventListener('click', () => {
        if (!selectedNegara || !selectedOperator || !selectedLayanan || !selectedNokosMethod) {
            checkOrderNokos();
            return;
        }

        if (getPromoDataByPage('nokos') && selectedNokosMethod === 'qris') {
            Swal.fire({ icon: 'error', title: 'Metode Tidak Valid', text: 'Mohon maaf promo ini hanya bisa di beli menggunakan pembayaran saldo tidak berlaku di pembayaran qris' });
            return;
        }

        document.getElementById('cn-negara').innerText = selectedNegara.nama_negara;
        document.getElementById('cn-operator').innerText = selectedOperator;
        document.getElementById('cn-layanan').innerText = selectedLayanan.nama;
        document.getElementById('cn-method').innerText = selectedNokosMethod.toUpperCase();
        const finalNksPrice = getFinalPriceByPage('nokos');
        document.getElementById('cn-total').innerText = 'Rp ' + finalNksPrice.toLocaleString();

        document.getElementById('confirmNokosModal').classList.add('show');
    });

    document.getElementById('btnCloseConfirmNokos')?.addEventListener('click', () => {
        document.getElementById('confirmNokosModal').classList.remove('show');
    });

    document.getElementById('btnFinalPayNokos')?.addEventListener('click', async () => {
        const { token, user } = checkLogin();
        const btn = document.getElementById('btnFinalPayNokos');
        const originalText = btn.innerText;
        btn.innerText = "Memproses...";
        btn.disabled = true;

        const finalNokosPrice = getFinalPriceByPage('nokos');
        const promoDataNokos = getPromoDataByPage('nokos');

        try {
            const res = await fetch('/api/buy-nokos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    negara_id: selectedNegara.id_negara,
                    negara_nama: selectedNegara.nama_negara,
                    operator: selectedOperator,
                    layanan_kode: selectedLayanan.kode,
                    layanan_nama: selectedLayanan.nama,
                    harga: selectedLayanan.harga,
                    method: selectedNokosMethod,
                    promo_code: promoDataNokos ? promoDataNokos.code : null,
                    final_amount: finalNokosPrice
                })
            });
            const data = await res.json();
            document.getElementById('confirmNokosModal').classList.remove('show');

            if (data.success) {
                if (data.type === 'instant') {
                    Swal.fire({
                        title: 'Sukses!',
                        html: `Nomor berhasil didapat!<br><b>${data.data.nomor}</b>`,
                        icon: 'success',
                        confirmButtonText: 'Cek OTP',
                        showDenyButton: true,
                        denyButtonText: '⭐ Beri Ulasan',
                        denyButtonColor: '#f1c40f'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            if (document.getElementById('menuNokosSaya')) {
                                document.getElementById('menuNokosSaya').click();
                            }
                        } else if (result.isDenied) {
                            window.location.href = '/ulasan';
                        }
                    });
                } else if (data.type === 'qris') {
                    const expireTime = Date.now() + (5 * 60 * 1000);
                    localStorage.setItem('pendingTrx', JSON.stringify({
                        order_id: data.order_id,
                        pay_amount: data.pay_amount,
                        deposit_amount: data.amount,
                        qr_string: data.qr_string,
                        expire_at: expireTime,
                        username: user.username,
                        trx_type: 'buy_nokos',
                        product_name: selectedLayanan.nama
                    }));
                    window.location.href = '/payment';
                }
            } else {
                Swal.fire('Gagal', data.message, 'error');
            }
        } catch (e) {
            console.log(e);
            Swal.fire('Gagal', 'Terjadi kesalahan', 'error');
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });

    // OVO
    document.getElementById('btnGoOvo')?.addEventListener('click', () => {
        if (!checkLogin().token) window.location.href = '/login';
        else {
            switchPage('ewallet-ovo');
            fetchOvoProducts();
            resetOvoInputs();
        }
    });

    document.getElementById('btnBackOvo')?.addEventListener('click', () => switchPage('home'));

    document.getElementById('btnCaraBeliOvo')?.addEventListener('click', () => {
        Swal.fire({
            title: 'Cara Topup OVO',
            html: `
                <ol style="text-align:left; font-size:13px; padding-left:20px; line-height:1.6; color:#555;">
                    <li>Masukkan <b>Nomor OVO</b> Anda.</li>
                    <li>Klik tombol <b>Cek Nomor</b> untuk memastikan nomor valid.</li>
                    <li>Pilih <b>Nominal Topup</b> yang diinginkan.</li>
                    <li>Pilih Pembayaran & Bayar.</li>
                    <li>Saldo akan masuk otomatis ke akun OVO Anda.</li>
                </ol>
                <div style="margin-top:10px; font-size:12px; color:#e74c3c; background:#ffebee; padding:10px; border-radius:6px;">
                    <b>⚠️ Catatan:</b> Pastikan nomor yang dimasukkan sudah benar dan terdaftar di OVO. Kesalahan nomor bukan tanggung jawab kami.
                </div>
            `,
            confirmButtonText: 'Oke Paham',
            confirmButtonColor: 'var(--primary-color)'
        });
    });

    document.getElementById('btnBuyOvo')?.addEventListener('click', function() {
        if (!selectedOvoData || !selectedMethodOvo) {
            checkOrderOvo();
            return;
        }

        if (getPromoDataByPage('ewallet-ovo') && selectedMethodOvo === 'qris') {
            Swal.fire({ icon: 'error', title: 'Metode Tidak Valid', text: 'Mohon maaf promo ini hanya bisa di beli menggunakan pembayaran saldo, tidak berlaku di pembayaran qris' });
            return;
        }

        if (!checkedOvoUser) {
            Swal.fire('Error', 'Cek nomor OVO terlebih dahulu!', 'warning');
            return;
        }

        document.getElementById('co-name').innerText = checkedOvoUser.name || '-';
        document.getElementById('co-phone').innerText = checkedOvoUser.number || '-';
        document.getElementById('co-prod').innerText = selectedOvoData.name || '-';
        document.getElementById('co-method').innerText = selectedMethodOvo.toUpperCase() || '-';

        const finalOvoPrice = getFinalPriceByPage('ewallet-ovo');
        document.getElementById('co-total').innerText = 'Rp ' + (finalOvoPrice || 0).toLocaleString();

        document.getElementById('confirmOvoModal').classList.add('show');
    });

    document.getElementById('btnCloseConfirmOvo')?.addEventListener('click', () => {
        document.getElementById('confirmOvoModal').classList.remove('show');
    });

    document.getElementById('btnFinalPayOvo')?.addEventListener('click', async () => {
        const { token, user } = checkLogin();
        const btn = document.getElementById('btnFinalPayOvo');
        const originalText = btn.innerText;
        btn.innerText = "Memproses...";
        btn.disabled = true;

        const finalOvoPrice = getFinalPriceByPage('ewallet-ovo');
        const promoDataOvo = getPromoDataByPage('ewallet-ovo');

        try {
            const res = await fetch('/api/buy-ewallet/ovo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    product_code: selectedOvoCode,
                    target: checkedOvoUser.number,
                    method: selectedMethodOvo,
                    promo_code: promoDataOvo ? promoDataOvo.code : null,
                    final_amount: finalOvoPrice
                })
            });
            const data = await res.json();
            document.getElementById('confirmOvoModal').classList.remove('show');

            if (data.success) {
                if (data.type === 'instant') {
                    Swal.fire({
                        title: 'Sukses!',
                        html: `Topup <b>${selectedOvoData.name}</b> untuk <b>${checkedOvoUser.name}</b> sedang diproses.<br>Saldo akan masuk dalam beberapa menit.`,
                        icon: 'success',
                        confirmButtonText: 'Cek Riwayat',
                        showDenyButton: true,
                        denyButtonText: '⭐ Beri Ulasan',
                        denyButtonColor: '#f1c40f'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            switchPage('transaksi');
                        } else if (result.isDenied) {
                            window.location.href = '/ulasan';
                        }
                    });

                    resetOvoInputs();

                } else if (data.type === 'qris') {
                    const expireTime = Date.now() + (5 * 60 * 1000);
                    localStorage.setItem('pendingTrx', JSON.stringify({
                        order_id: data.order_id,
                        pay_amount: data.pay_amount,
                        deposit_amount: data.amount,
                        qr_string: data.qr_string,
                        expire_at: expireTime,
                        username: user.username,
                        trx_type: 'buy_ewallet',
                        product_name: selectedOvoData.name,
                        target: checkedOvoUser.number
                    }));
                    window.location.href = '/payment';
                }
            } else {
                Swal.fire('Gagal', data.message, 'error');
                if (data.refund) {
                    loadUserData();
                }
            }
        } catch (e) {
            console.log(e);
            Swal.fire('Gagal', 'Terjadi kesalahan', 'error');
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });

    // ShopeePay
    document.getElementById('btnGoShopee')?.addEventListener('click', () => {
        if (!checkLogin().token) window.location.href = '/login';
        else {
            switchPage('ewallet-shopee');
            fetchShopeeProducts();
            resetShopeeInputs();
        }
    });

    document.getElementById('btnBackShopee')?.addEventListener('click', () => switchPage('home'));

    document.getElementById('btnCaraBeliShopee')?.addEventListener('click', () => {
        Swal.fire({
            title: 'Cara Topup ShopeePay',
            html: `
                <ol style="text-align:left; font-size:13px; padding-left:20px; line-height:1.6; color:#555;">
                    <li>Masukkan <b>Nomor ShopeePay</b> Anda.</li>
                    <li>Klik tombol <b>Cek Nomor</b> untuk memastikan nomor valid.</li>
                    <li>Pilih <b>Nominal Topup</b> yang diinginkan (SHP = Produk Admin, SHOPE = Reguler).</li>
                    <li>Pilih Pembayaran & Bayar.</li>
                    <li>Saldo akan masuk otomatis ke akun ShopeePay Anda.</li>
                </ol>
                <div style="margin-top:10px; font-size:12px; color:#e74c3c; background:#ffebee; padding:10px; border-radius:6px;">
                    <b>⚠️ Catatan:</b> Pastikan nomor yang dimasukkan sudah benar dan terdaftar di ShopeePay. Kesalahan nomor bukan tanggung jawab kami.
                </div>
            `,
            confirmButtonText: 'Oke Paham',
            confirmButtonColor: 'var(--primary-color)'
        });
    });

    document.getElementById('btnBuyShopee')?.addEventListener('click', function() {
        if (!selectedShopeeData || !selectedMethodShopee) {
            checkOrderShopee();
            return;
        }

        if (getPromoDataByPage('ewallet-shopee') && selectedMethodShopee === 'qris') {
            Swal.fire({ icon: 'error', title: 'Metode Tidak Valid', text: 'Mohon maaf promo ini hanya bisa di beli menggunakan pembayaran saldo, tidak berlaku di pembayaran qris' });
            return;
        }

        if (!checkedShopeeUser) {
            Swal.fire('Error', 'Cek nomor ShopeePay terlebih dahulu!', 'warning');
            return;
        }

        document.getElementById('cs-name').innerText = checkedShopeeUser.name || '-';
        document.getElementById('cs-phone').innerText = checkedShopeeUser.number || '-';
        document.getElementById('cs-prod').innerText = selectedShopeeData.name || '-';
        document.getElementById('cs-method').innerText = selectedMethodShopee.toUpperCase() || '-';
        const finalShopeePrice = getFinalPriceByPage('ewallet-shopee');
        document.getElementById('cs-total').innerText = 'Rp ' + (finalShopeePrice || 0).toLocaleString();

        document.getElementById('confirmShopeeModal').classList.add('show');
    });

    document.getElementById('btnCloseConfirmShopee')?.addEventListener('click', () => {
        document.getElementById('confirmShopeeModal').classList.remove('show');
    });

    document.getElementById('btnFinalPayShopee')?.addEventListener('click', async () => {
        const { token, user } = checkLogin();
        const btn = document.getElementById('btnFinalPayShopee');
        const originalText = btn.innerText;
        btn.innerText = "Memproses...";
        btn.disabled = true;

        const finalShopeePrice = getFinalPriceByPage('ewallet-shopee');
        const promoDataShopee = getPromoDataByPage('ewallet-shopee');

        try {
            const res = await fetch('/api/buy-ewallet/shopee', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    product_code: selectedShopeeCode,
                    target: checkedShopeeUser.number,
                    method: selectedMethodShopee,
                    promo_code: promoDataShopee ? promoDataShopee.code : null,
                    final_amount: finalShopeePrice
                })
            });
            const data = await res.json();
            document.getElementById('confirmShopeeModal').classList.remove('show');

            if (data.success) {
                if (data.type === 'instant') {
                    Swal.fire({
                        title: 'Sukses!',
                        html: `Topup <b>${selectedShopeeData.name}</b> untuk <b>${checkedShopeeUser.name}</b> sedang diproses.<br>Saldo akan masuk dalam beberapa menit.`,
                        icon: 'success',
                        confirmButtonText: 'Cek Riwayat',
                        showDenyButton: true,
                        denyButtonText: '⭐ Beri Ulasan',
                        denyButtonColor: '#f1c40f'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            switchPage('transaksi');
                        } else if (result.isDenied) {
                            window.location.href = '/ulasan';
                        }
                    });

                    resetShopeeInputs();

                } else if (data.type === 'qris') {
                    const expireTime = Date.now() + (5 * 60 * 1000);
                    localStorage.setItem('pendingTrx', JSON.stringify({
                        order_id: data.order_id,
                        pay_amount: data.pay_amount,
                        deposit_amount: data.amount,
                        qr_string: data.qr_string,
                        expire_at: expireTime,
                        username: user.username,
                        trx_type: 'buy_ewallet',
                        product_name: selectedShopeeData.name,
                        target: checkedShopeeUser.number
                    }));
                    window.location.href = '/payment';
                }
            } else {
                Swal.fire('Gagal', data.message, 'error');
                if (data.refund) {
                    loadUserData();
                }
            }
        } catch (e) {
            console.log(e);
            Swal.fire('Gagal', 'Terjadi kesalahan', 'error');
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });

    // LinkAja
    document.getElementById('btnGoLinkaja')?.addEventListener('click', () => {
        if (!checkLogin().token) window.location.href = '/login';
        else {
            switchPage('ewallet-linkaja');
            fetchLinkajaProducts();
            resetLinkajaInputs();
        }
    });

    document.getElementById('btnBackLinkaja')?.addEventListener('click', () => switchPage('home'));

    document.getElementById('btnCaraBeliLinkaja')?.addEventListener('click', () => {
        Swal.fire({
            title: 'Cara Topup LinkAja',
            html: `
                <ol style="text-align:left; font-size:13px; padding-left:20px; line-height:1.6; color:#555;">
                    <li>Masukkan <b>Nomor LinkAja</b> Anda.</li>
                    <li>Klik tombol <b>Cek Nomor</b> untuk memastikan nomor valid.</li>
                    <li>Pilih <b>Nominal Topup</b> yang diinginkan (LJAE = Entitas, LINK = Reguler).</li>
                    <li>Pilih Pembayaran & Bayar.</li>
                    <li>Saldo akan masuk otomatis ke akun LinkAja Anda.</li>
                </ol>
                <div style="margin-top:10px; font-size:12px; color:#e74c3c; background:#ffebee; padding:10px; border-radius:6px;">
                    <b>⚠️ Catatan:</b> Pastikan nomor yang dimasukkan sudah benar dan terdaftar di LinkAja. Kesalahan nomor bukan tanggung jawab kami.
                </div>
            `,
            confirmButtonText: 'Oke Paham',
            confirmButtonColor: 'var(--primary-color)'
        });
    });

    document.getElementById('btnBuyLinkaja')?.addEventListener('click', function() {
        if (!selectedLinkajaData || !selectedMethodLinkaja) {
            checkOrderLinkaja();
            return;
        }

        if (getPromoDataByPage('ewallet-linkaja') && selectedMethodLinkaja === 'qris') {
            Swal.fire({ icon: 'error', title: 'Metode Tidak Valid', text: 'Mohon maaf promo ini hanya bisa di beli menggunakan pembayaran saldo, tidak berlaku di pembayaran qris' });
            return;
        }

        if (!checkedLinkajaUser) {
            Swal.fire('Error', 'Cek nomor LinkAja terlebih dahulu!', 'warning');
            return;
        }

        document.getElementById('cl-name').innerText = checkedLinkajaUser.name || '-';
        document.getElementById('cl-phone').innerText = checkedLinkajaUser.number || '-';
        document.getElementById('cl-prod').innerText = selectedLinkajaData.name || '-';
        document.getElementById('cl-method').innerText = selectedMethodLinkaja.toUpperCase() || '-';
        const finalLinkajaPrice = getFinalPriceByPage('ewallet-linkaja');
        document.getElementById('cl-total').innerText = 'Rp ' + (finalLinkajaPrice || 0).toLocaleString();

        document.getElementById('confirmLinkajaModal').classList.add('show');
    });

    document.getElementById('btnCloseConfirmLinkaja')?.addEventListener('click', () => {
        document.getElementById('confirmLinkajaModal').classList.remove('show');
    });

    document.getElementById('btnFinalPayLinkaja')?.addEventListener('click', async () => {
        const { token, user } = checkLogin();
        const btn = document.getElementById('btnFinalPayLinkaja');
        const originalText = btn.innerText;
        btn.innerText = "Memproses...";
        btn.disabled = true;

        const finalLinkajaPrice = getFinalPriceByPage('ewallet-linkaja');
        const promoDataLinkaja = getPromoDataByPage('ewallet-linkaja');

        try {
            const res = await fetch('/api/buy-ewallet/linkaja', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    product_code: selectedLinkajaCode,
                    target: checkedLinkajaUser.number,
                    method: selectedMethodLinkaja,
                    promo_code: promoDataLinkaja ? promoDataLinkaja.code : null,
                    final_amount: finalLinkajaPrice
                })
            });
            const data = await res.json();
            document.getElementById('confirmLinkajaModal').classList.remove('show');

            if (data.success) {
                if (data.type === 'instant') {
                    Swal.fire({
                        title: 'Sukses!',
                        html: `Topup <b>${selectedLinkajaData.name}</b> untuk <b>${checkedLinkajaUser.name}</b> sedang diproses.<br>Saldo akan masuk dalam beberapa menit.`,
                        icon: 'success',
                        confirmButtonText: 'Cek Riwayat',
                        showDenyButton: true,
                        denyButtonText: '⭐ Beri Ulasan',
                        denyButtonColor: '#f1c40f'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            switchPage('transaksi');
                        } else if (result.isDenied) {
                            window.location.href = '/ulasan';
                        }
                    });

                    resetLinkajaInputs();

                } else if (data.type === 'qris') {
                    const expireTime = Date.now() + (5 * 60 * 1000);
                    localStorage.setItem('pendingTrx', JSON.stringify({
                        order_id: data.order_id,
                        pay_amount: data.pay_amount,
                        deposit_amount: data.amount,
                        qr_string: data.qr_string,
                        expire_at: expireTime,
                        username: user.username,
                        trx_type: 'buy_ewallet',
                        product_name: selectedLinkajaData.name,
                        target: checkedLinkajaUser.number
                    }));
                    window.location.href = '/payment';
                }
            } else {
                Swal.fire('Gagal', data.message, 'error');
                if (data.refund) {
                    loadUserData();
                }
            }
        } catch (e) {
            console.log(e);
            Swal.fire('Gagal', 'Terjadi kesalahan', 'error');
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });

    // Astrapay
    document.getElementById('btnGoAstrapay')?.addEventListener('click', () => {
        if (!checkLogin().token) window.location.href = '/login';
        else {
            switchPage('ewallet-astrapay');
            fetchAstrapayProducts();
            resetAstrapayInputs();
        }
    });

    document.getElementById('btnBackAstrapay')?.addEventListener('click', () => switchPage('home'));

    document.getElementById('btnCaraBeliAstrapay')?.addEventListener('click', () => {
        Swal.fire({
            title: 'Cara Topup Astrapay',
            html: `
                <ol style="text-align:left; font-size:13px; padding-left:20px; line-height:1.6; color:#555;">
                    <li>Masukkan <b>Nomor Astrapay</b> Anda.</li>
                    <li>Klik tombol <b>Cek Nomor</b> untuk memastikan nomor valid.</li>
                    <li>Pilih <b>Nominal Topup</b> yang diinginkan.</li>
                    <li>Pilih Pembayaran & Bayar.</li>
                    <li>Saldo akan masuk otomatis ke akun Astrapay Anda.</li>
                </ol>
                <div style="margin-top:10px; font-size:12px; color:#e74c3c; background:#ffebee; padding:10px; border-radius:6px;">
                    <b>⚠️ Catatan:</b> Pastikan nomor yang dimasukkan sudah benar dan terdaftar di Astrapay. Kesalahan nomor bukan tanggung jawab kami.
                </div>
            `,
            confirmButtonText: 'Oke Paham',
            confirmButtonColor: 'var(--primary-color)'
        });
    });

    document.getElementById('btnBuyAstrapay')?.addEventListener('click', function() {
        if (!selectedAstrapayData || !selectedMethodAstrapay) {
            checkOrderAstrapay();
            return;
        }

        if (getPromoDataByPage('ewallet-astrapay') && selectedMethodAstrapay === 'qris') {
            Swal.fire({ icon: 'error', title: 'Metode Tidak Valid', text: 'Mohon maaf promo ini hanya bisa di beli menggunakan pembayaran saldo, tidak berlaku di pembayaran qris' });
            return;
        }

        if (!checkedAstrapayUser) {
            Swal.fire('Error', 'Cek nomor Astrapay terlebih dahulu!', 'warning');
            return;
        }

        document.getElementById('ca-name').innerText = checkedAstrapayUser.name || '-';
        document.getElementById('ca-phone').innerText = checkedAstrapayUser.number || '-';
        document.getElementById('ca-prod').innerText = selectedAstrapayData.name || '-';
        document.getElementById('ca-method').innerText = selectedMethodAstrapay.toUpperCase() || '-';
        const finalAstrapayPrice = getFinalPriceByPage('ewallet-astrapay');
        document.getElementById('ca-total').innerText = 'Rp ' + (finalAstrapayPrice || 0).toLocaleString();

        document.getElementById('confirmAstrapayModal').classList.add('show');
    });

    document.getElementById('btnCloseConfirmAstrapay')?.addEventListener('click', () => {
        document.getElementById('confirmAstrapayModal').classList.remove('show');
    });

    document.getElementById('btnFinalPayAstrapay')?.addEventListener('click', async () => {
        const { token, user } = checkLogin();
        const btn = document.getElementById('btnFinalPayAstrapay');
        const originalText = btn.innerText;
        btn.innerText = "Memproses...";
        btn.disabled = true;

        const finalAstrapayPrice = getFinalPriceByPage('ewallet-astrapay');
        const promoDataAstrapay = getPromoDataByPage('ewallet-astrapay');

        try {
            const res = await fetch('/api/buy-ewallet/astrapay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    product_code: selectedAstrapayCode,
                    target: checkedAstrapayUser.number,
                    method: selectedMethodAstrapay,
                    promo_code: promoDataAstrapay ? promoDataAstrapay.code : null,
                    final_amount: finalAstrapayPrice
                })
            });
            const data = await res.json();
            document.getElementById('confirmAstrapayModal').classList.remove('show');

            if (data.success) {
                if (data.type === 'instant') {
                    Swal.fire({
                        title: 'Sukses!',
                        html: `Topup <b>${selectedAstrapayData.name}</b> untuk <b>${checkedAstrapayUser.name}</b> sedang diproses.<br>Saldo akan masuk dalam beberapa menit.`,
                        icon: 'success',
                        confirmButtonText: 'Cek Riwayat',
                        showDenyButton: true,
                        denyButtonText: '⭐ Beri Ulasan',
                        denyButtonColor: '#f1c40f'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            switchPage('transaksi');
                        } else if (result.isDenied) {
                            window.location.href = '/ulasan';
                        }
                    });

                    resetAstrapayInputs();

                } else if (data.type === 'qris') {
                    const expireTime = Date.now() + (5 * 60 * 1000);
                    localStorage.setItem('pendingTrx', JSON.stringify({
                        order_id: data.order_id,
                        pay_amount: data.pay_amount,
                        deposit_amount: data.amount,
                        qr_string: data.qr_string,
                        expire_at: expireTime,
                        username: user.username,
                        trx_type: 'buy_ewallet',
                        product_name: selectedAstrapayData.name,
                        target: checkedAstrapayUser.number
                    }));
                    window.location.href = '/payment';
                }
            } else {
                Swal.fire('Gagal', data.message, 'error');
                if (data.refund) {
                    loadUserData();
                }
            }
        } catch (e) {
            console.log(e);
            Swal.fire('Gagal', 'Terjadi kesalahan', 'error');
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });

    // iSaku
    document.getElementById('btnGoIsaku')?.addEventListener('click', () => {
        if (!checkLogin().token) window.location.href = '/login';
        else {
            switchPage('ewallet-isaku');
            fetchIsakuProducts();
            resetIsakuInputs();
        }
    });

    document.getElementById('btnBackIsaku')?.addEventListener('click', () => switchPage('home'));

    document.getElementById('btnCaraBeliIsaku')?.addEventListener('click', () => {
        Swal.fire({
            title: 'Cara Topup iSaku',
            html: `
                <ol style="text-align:left; font-size:13px; padding-left:20px; line-height:1.6; color:#555;">
                    <li>Masukkan <b>Nomor iSaku</b> Anda.</li>
                    <li>Klik tombol <b>Cek Nomor</b> untuk memastikan nomor valid.</li>
                    <li>Pilih <b>Nominal Topup</b> yang diinginkan.</li>
                    <li>Pilih Pembayaran & Bayar.</li>
                    <li>Saldo akan masuk otomatis ke akun iSaku Anda.</li>
                </ol>
                <div style="margin-top:10px; font-size:12px; color:#e74c3c; background:#ffebee; padding:10px; border-radius:6px;">
                    <b>⚠️ Catatan:</b> Pastikan nomor yang dimasukkan sudah benar dan terdaftar di iSaku. Kesalahan nomor bukan tanggung jawab kami.
                </div>
            `,
            confirmButtonText: 'Oke Paham',
            confirmButtonColor: 'var(--primary-color)'
        });
    });

    document.getElementById('btnBuyIsaku')?.addEventListener('click', function() {
        if (!selectedIsakuData || !selectedMethodIsaku) {
            checkOrderIsaku();
            return;
        }

        if (getPromoDataByPage('ewallet-isaku') && selectedMethodIsaku === 'qris') {
            Swal.fire({ icon: 'error', title: 'Metode Tidak Valid', text: 'Mohon maaf promo ini hanya bisa di beli menggunakan pembayaran saldo, tidak berlaku di pembayaran qris' });
            return;
        }

        if (!checkedIsakuUser) {
            Swal.fire('Error', 'Cek nomor iSaku terlebih dahulu!', 'warning');
            return;
        }

        document.getElementById('ci-name').innerText = checkedIsakuUser.name || '-';
        document.getElementById('ci-phone').innerText = checkedIsakuUser.number || '-';
        document.getElementById('ci-prod').innerText = selectedIsakuData.name || '-';
        document.getElementById('ci-method').innerText = selectedMethodIsaku.toUpperCase() || '-';
        const finalIsakuPrice = getFinalPriceByPage('ewallet-isaku');
        document.getElementById('ci-total').innerText = 'Rp ' + (finalIsakuPrice || 0).toLocaleString();

        document.getElementById('confirmIsakuModal').classList.add('show');
    });

    document.getElementById('btnCloseConfirmIsaku')?.addEventListener('click', () => {
        document.getElementById('confirmIsakuModal').classList.remove('show');
    });

    document.getElementById('btnFinalPayIsaku')?.addEventListener('click', async () => {
        const { token, user } = checkLogin();
        const btn = document.getElementById('btnFinalPayIsaku');
        const originalText = btn.innerText;
        btn.innerText = "Memproses...";
        btn.disabled = true;

        const finalIsakuPrice = getFinalPriceByPage('ewallet-isaku');
        const promoDataIsaku = getPromoDataByPage('ewallet-isaku');

        try {
            const res = await fetch('/api/buy-ewallet/isaku', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    product_code: selectedIsakuCode,
                    target: checkedIsakuUser.number,
                    method: selectedMethodIsaku,
                    promo_code: promoDataIsaku ? promoDataIsaku.code : null,
                    final_amount: finalIsakuPrice
                })
            });
            const data = await res.json();
            document.getElementById('confirmIsakuModal').classList.remove('show');

            if (data.success) {
                if (data.type === 'instant') {
                    Swal.fire({
                        title: 'Sukses!',
                        html: `Topup <b>${selectedIsakuData.name}</b> untuk <b>${checkedIsakuUser.name}</b> sedang diproses.<br>Saldo akan masuk dalam beberapa menit.`,
                        icon: 'success',
                        confirmButtonText: 'Cek Riwayat',
                        showDenyButton: true,
                        denyButtonText: '⭐ Beri Ulasan',
                        denyButtonColor: '#f1c40f'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            switchPage('transaksi');
                        } else if (result.isDenied) {
                            window.location.href = '/ulasan';
                        }
                    });

                    resetIsakuInputs();

                } else if (data.type === 'qris') {
                    const expireTime = Date.now() + (5 * 60 * 1000);
                    localStorage.setItem('pendingTrx', JSON.stringify({
                        order_id: data.order_id,
                        pay_amount: data.pay_amount,
                        deposit_amount: data.amount,
                        qr_string: data.qr_string,
                        expire_at: expireTime,
                        username: user.username,
                        trx_type: 'buy_ewallet',
                        product_name: selectedIsakuData.name,
                        target: checkedIsakuUser.number
                    }));
                    window.location.href = '/payment';
                }
            } else {
                Swal.fire('Gagal', data.message, 'error');
                if (data.refund) {
                    loadUserData();
                }
            }
        } catch (e) {
            console.log(e);
            Swal.fire('Gagal', 'Terjadi kesalahan', 'error');
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });

    // Kaspro
    document.getElementById('btnGoKaspro')?.addEventListener('click', () => {
        if (!checkLogin().token) window.location.href = '/login';
        else {
            switchPage('ewallet-kaspro');
            fetchKasproProducts();
            resetKasproInputs();
        }
    });

    document.getElementById('btnBackKaspro')?.addEventListener('click', () => switchPage('home'));

    document.getElementById('btnCaraBeliKaspro')?.addEventListener('click', () => {
        Swal.fire({
            title: 'Cara Topup Kaspro',
            html: `
                <ol style="text-align:left; font-size:13px; padding-left:20px; line-height:1.6; color:#555;">
                    <li>Masukkan <b>Nomor Kaspro</b> Anda.</li>
                    <li>Klik tombol <b>Cek Nomor</b> untuk memastikan nomor valid.</li>
                    <li>Pilih <b>Nominal Topup</b> yang diinginkan.</li>
                    <li>Pilih Pembayaran & Bayar.</li>
                    <li>Saldo akan masuk otomatis ke akun Kaspro Anda.</li>
                </ol>
                <div style="margin-top:10px; font-size:12px; color:#e74c3c; background:#ffebee; padding:10px; border-radius:6px;">
                    <b>⚠️ Catatan:</b> Pastikan nomor yang dimasukkan sudah benar dan terdaftar di Kaspro. Kesalahan nomor bukan tanggung jawab kami.
                </div>
            `,
            confirmButtonText: 'Oke Paham',
            confirmButtonColor: 'var(--primary-color)'
        });
    });

    document.getElementById('btnBuyKaspro')?.addEventListener('click', function() {
        if (!selectedKasproData || !selectedMethodKaspro) {
            checkOrderKaspro();
            return;
        }

        if (getPromoDataByPage('ewallet-kaspro') && selectedMethodKaspro === 'qris') {
            Swal.fire({ icon: 'error', title: 'Metode Tidak Valid', text: 'Mohon maaf promo ini hanya bisa di beli menggunakan pembayaran saldo, tidak berlaku di pembayaran qris' });
            return;
        }

        if (!checkedKasproUser) {
            Swal.fire('Error', 'Cek nomor Kaspro terlebih dahulu!', 'warning');
            return;
        }

        document.getElementById('ck-name').innerText = checkedKasproUser.name || '-';
        document.getElementById('ck-phone').innerText = checkedKasproUser.number || '-';
        document.getElementById('ck-prod').innerText = selectedKasproData.name || '-';
        document.getElementById('ck-method').innerText = selectedMethodKaspro.toUpperCase() || '-';
        const finalKasproPrice = getFinalPriceByPage('ewallet-kaspro');
        document.getElementById('ck-total').innerText = 'Rp ' + (finalKasproPrice || 0).toLocaleString();

        document.getElementById('confirmKasproModal').classList.add('show');
    });

    document.getElementById('btnCloseConfirmKaspro')?.addEventListener('click', () => {
        document.getElementById('confirmKasproModal').classList.remove('show');
    });

    document.getElementById('btnFinalPayKaspro')?.addEventListener('click', async () => {
        const { token, user } = checkLogin();
        const btn = document.getElementById('btnFinalPayKaspro');
        const originalText = btn.innerText;
        btn.innerText = "Memproses...";
        btn.disabled = true;

        const finalKasproPrice = getFinalPriceByPage('ewallet-kaspro');
        const promoDataKaspro = getPromoDataByPage('ewallet-kaspro');

        try {
            const res = await fetch('/api/buy-ewallet/kaspro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    product_code: selectedKasproCode,
                    target: checkedKasproUser.number,
                    method: selectedMethodKaspro,
                    promo_code: promoDataKaspro ? promoDataKaspro.code : null,
                    final_amount: finalKasproPrice
                })
            });
            const data = await res.json();
            document.getElementById('confirmKasproModal').classList.remove('show');

            if (data.success) {
                if (data.type === 'instant') {
                    Swal.fire({
                        title: 'Sukses!',
                        html: `Topup <b>${selectedKasproData.name}</b> untuk <b>${checkedKasproUser.name}</b> sedang diproses.<br>Saldo akan masuk dalam beberapa menit.`,
                        icon: 'success',
                        confirmButtonText: 'Cek Riwayat',
                        showDenyButton: true,
                        denyButtonText: '⭐ Beri Ulasan',
                        denyButtonColor: '#f1c40f'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            switchPage('transaksi');
                        } else if (result.isDenied) {
                            window.location.href = '/ulasan';
                        }
                    });

                    resetKasproInputs();

                } else if (data.type === 'qris') {
                    const expireTime = Date.now() + (5 * 60 * 1000);
                    localStorage.setItem('pendingTrx', JSON.stringify({
                        order_id: data.order_id,
                        pay_amount: data.pay_amount,
                        deposit_amount: data.amount,
                        qr_string: data.qr_string,
                        expire_at: expireTime,
                        username: user.username,
                        trx_type: 'buy_ewallet',
                        product_name: selectedKasproData.name,
                        target: checkedKasproUser.number
                    }));
                    window.location.href = '/payment';
                }
            } else {
                Swal.fire('Gagal', data.message, 'error');
                if (data.refund) {
                    loadUserData();
                }
            }
        } catch (e) {
            console.log(e);
            Swal.fire('Gagal', 'Terjadi kesalahan', 'error');
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });

    document.getElementById('kasproPhone')?.addEventListener('input', checkKasproInput);
    document.getElementById('isakuPhone')?.addEventListener('input', checkIsakuInput);
    document.getElementById('astrapayPhone')?.addEventListener('input', checkAstrapayInput);
    document.getElementById('linkajaPhone')?.addEventListener('input', checkLinkajaInput);
    document.getElementById('shopeePhone')?.addEventListener('input', checkShopeeInput);
    document.getElementById('ovoPhone')?.addEventListener('input', checkOvoInput);
    document.getElementById('ewalletPhone')?.addEventListener('input', checkEwalletInput);
    document.getElementById('ewalletPhoneGopay')?.addEventListener('input', checkEwalletInputGopay);
    document.getElementById('gameUserId')?.addEventListener('input', checkGameInput);
}

// ============ HANDLE HASH ============
if (window.location.hash === '#panelPopup') {
    window.history.replaceState(null, null, ' ')
    setTimeout(() => {
        if (document.getElementById('menuPanelPopup')) {
            document.getElementById('menuPanelPopup').click()
        }
    }, 800)
}

if (window.location.hash === '#subdomainSaya') {
    window.history.replaceState(null, null, ' ')
    setTimeout(() => {
        if (document.getElementById('menuSubdomainSaya')) {
            document.getElementById('menuSubdomainSaya').click()
        }
    }, 800)
}

if (window.location.hash === '#nokosSaya') {
    window.history.replaceState(null, null, ' ')
    setTimeout(() => {
        if (document.getElementById('menuNokosSaya')) {
            document.getElementById('menuNokosSaya').click()
        }
    }, 800)
}

// ============ PENANGANAN CLOSE MODAL ============
document.getElementById('btnCloseConfirmOvo')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('confirmOvoModal').classList.remove('show');
});

const modalOvoOverlay = document.getElementById('confirmOvoModal');
if (modalOvoOverlay) {
    modalOvoOverlay.addEventListener('click', (e) => {
        if (e.target === modalOvoOverlay) {
            modalOvoOverlay.classList.remove('show');
        }
    });
}

// ============ ACCORDION MENU ============
function setupAccordion() {
    // Ambil semua menu yang punya class 'accordion-header'
    const headers = document.querySelectorAll('.accordion-header');
    
    headers.forEach(header => {
        // Cari wadah menu (content) yang ada persis di bawah header-nya
        const content = header.nextElementSibling;
        if (!content || !content.classList.contains('accordion-content')) return;

        // Bikin kunci unik per-menu untuk simpan state (buka/tutup) di memori HP
        const stateKey = 'accordion_state_' + header.id;

        header.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Efek buka/tutup
            header.classList.toggle('active');
            content.classList.toggle('show');
            
            // Simpan posisinya
            localStorage.setItem(stateKey, content.classList.contains('show'));
        };

        // Cek apakah sebelumnya menu ini sedang dibuka atau ditutup
        const isOpen = localStorage.getItem(stateKey) === 'true';
        if (isOpen) {
            header.classList.add('active');
            content.classList.add('show');
        } else {
            header.classList.remove('active');
            content.classList.remove('show');
        }
    });
}

// ==========================================
// ============ SISTEM EVENT HARI SPESIAL (POPUP APK) ============
// ==========================================
function startSpecialDayCountdown() {
    const countdownContainer = document.getElementById('eidCountdownContainer');
    const bannerImg = document.getElementById('apkBannerImg');
    
    if (!countdownContainer || !bannerImg) return; 

    // 1. Simpan URL Banner Default (Mode Biasa)
    const defaultBannerUrl = "https://ar-hosting.pages.dev/1775662030162.jpg";

    // 2. Daftar Hari Spesial (Gunakan format Bulan-Tanggal: MM-DD dan Waktu: HH:mm:ss)
    const specialDays = [
        {
            name: "Tahun Baru Masehi",
            monthDay: "01-01", time: "00:00:00",
            bannerUrl: "LINK_GAMBAR_TAHUN_BARU.jpg", 
            greeting: "Happy New Year! 🎉<br><span style='font-size: 12px;'>Selamat Tahun Baru! Semoga tahun ini penuh berkah.</span>",
            durationDays: 2
        },
        {
            name: "Tahun Baru Imlek",
            monthDay: "02-17", time: "00:00:00", // Sesuaikan tgl Imlek tiap tahun
            bannerUrl: "LINK_GAMBAR_IMLEK.jpg",
            greeting: "Gong Xi Fa Cai! 🧧<br><span style='font-size: 12px;'>Semoga kesejahteraan senantiasa menyertai kita.</span>",
            durationDays: 2
        },
        {
            name: "Hari Valentine",
            monthDay: "02-14", time: "00:00:00",
            bannerUrl: "LINK_GAMBAR_VALENTINE.jpg",
            greeting: "Happy Valentine's Day! 💖<br><span style='font-size: 12px;'>Sebarkan cinta dan kasih sayang ke semua orang!</span>",
            durationDays: 1
        },
        {
            name: "Hari Suci Nyepi",
            monthDay: "03-19", time: "00:00:00", // Sesuaikan tgl Nyepi tiap tahun
            bannerUrl: "https://api.deline.web.id/lYrGx8Och3.jpg",
            greeting: "Selamat Hari Raya Nyepi 🙏<br><span style='font-size: 12px;'>Tahun Baru Saka. Semoga kedamaian senantiasa menyertai kita.</span>",
            durationDays: 1
        },
        {
            name: "Hari Raya Idul Fitri",
            monthDay: "03-21", time: "00:00:00", // Tgl NU / Pemerintah
            bannerUrl: "https://api.deline.web.id/rB4Fqb88bj.jpg",
            greeting: "Minal Aidin Wal Faizin 🙏<br><span style='font-size: 12px;'>Selamat Hari Raya Idul Fitri. Mohon maaf lahir & batin.</span>",
            durationDays: 2
        },
        {
            name: "Hari Kartini",
            monthDay: "04-21", time: "00:00:00",
            bannerUrl: "LINK_GAMBAR_KARTINI.jpg",
            greeting: "Selamat Hari Kartini 👩‍🏫<br><span style='font-size: 12px;'>Habis gelap terbitlah terang. Semangat untuk wanita hebat!</span>",
            durationDays: 1
        },
        {
            name: "Hari Raya Waisak",
            monthDay: "05-01", time: "00:00:00", // Sesuaikan tgl Waisak tiap tahun
            bannerUrl: "LINK_GAMBAR_WAISAK.jpg",
            greeting: "Selamat Hari Raya Waisak ☸️<br><span style='font-size: 12px;'>Semoga semua makhluk hidup berbahagia.</span>",
            durationDays: 1
        },
        {
            name: "Hari Raya Idul Adha",
            monthDay: "05-27", time: "00:00:00", // Sesuaikan tgl Idul Adha tiap tahun
            bannerUrl: "LINK_GAMBAR_IDUL_ADHA.jpg",
            greeting: "Selamat Hari Raya Idul Adha 🕌<br><span style='font-size: 12px;'>Semoga amal ibadah kurban kita diterima-Nya.</span>",
            durationDays: 2
        },
        {
            name: "HUT Kemerdekaan RI",
            monthDay: "08-17", time: "00:00:00",
            bannerUrl: "LINK_GAMBAR_17_AGUSTUS.jpg",
            greeting: "Dirgahayu Republik Indonesia! 🇮🇩<br><span style='font-size: 12px;'>Sekali merdeka, tetap merdeka!</span>",
            durationDays: 1
        },
        {
            name: "Hari Sumpah Pemuda",
            monthDay: "10-28", time: "00:00:00",
            bannerUrl: "LINK_GAMBAR_SUMPAH_PEMUDA.jpg",
            greeting: "Selamat Hari Sumpah Pemuda! ✊<br><span style='font-size: 12px;'>Satu nusa, satu bangsa, satu bahasa Indonesia!</span>",
            durationDays: 1
        },
        {
            name: "Hari Pahlawan",
            monthDay: "11-10", time: "00:00:00",
            bannerUrl: "LINK_GAMBAR_HARI_PAHLAWAN.jpg",
            greeting: "Selamat Hari Pahlawan! 🦸‍♂️<br><span style='font-size: 12px;'>Bangsa yang besar menghargai jasa pahlawannya.</span>",
            durationDays: 1
        },
        {
            name: "Hari Ibu",
            monthDay: "12-22", time: "00:00:00",
            bannerUrl: "LINK_GAMBAR_HARI_IBU.jpg",
            greeting: "Selamat Hari Ibu! 👩‍👧‍👦<br><span style='font-size: 12px;'>Terima kasih atas segala cinta dan doa yang tak terhingga.</span>",
            durationDays: 1
        },
        {
            name: "Hari Raya Natal",
            monthDay: "12-25", time: "00:00:00",
            bannerUrl: "LINK_GAMBAR_NATAL.jpg",
            greeting: "Merry Christmas! 🎄<br><span style='font-size: 12px;'>Semoga damai dan sukacita menyertai kita semua.</span>",
            durationDays: 2
        }
    ];

    const timerInterval = setInterval(function() {
        const now = new Date();
        const currentYear = now.getFullYear(); // Deteksi otomatis tahun sekarang
        const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
        
        let activeEvent = null;

        for (let i = 0; i < specialDays.length; i++) {
            const ev = specialDays[i];
            
            // Format ISO dengan paksaan zona waktu WIB (+07:00)
            let eventDateStr = `${currentYear}-${ev.monthDay}T${ev.time}+07:00`;
            let eventTime = new Date(eventDateStr).getTime();
            let eventEndTime = eventTime + (ev.durationDays * 24 * 60 * 60 * 1000);

            // Jika event tersebut di tahun INI sudah berakhir, otomatis pindah ke tahun DEPAN
            if (now.getTime() > eventEndTime) {
                eventDateStr = `${currentYear + 1}-${ev.monthDay}T${ev.time}+07:00`;
                eventTime = new Date(eventDateStr).getTime();
                eventEndTime = eventTime + (ev.durationDays * 24 * 60 * 60 * 1000);
            }

            // Jika masuk rentang H-7 sampai masa event habis
            if (now.getTime() >= (eventTime - sevenDaysInMs) && now.getTime() < eventEndTime) {
                activeEvent = { ...ev, eventTime, eventEndTime };
                break; // Ambil event pertama yang paling dekat
            }
        }

        // JIKA TIDAK ADA EVENT DEKAT (Mode Biasa)
        if (!activeEvent) {
            if (bannerImg.src !== defaultBannerUrl) bannerImg.src = defaultBannerUrl;
            countdownContainer.innerHTML = '';
            return;
        }

        const distance = activeEvent.eventTime - now.getTime();

        // JIKA HARI H SUDAH TIBA (Masa Perayaan)
        if (distance <= 0) {
            if (bannerImg.src !== activeEvent.bannerUrl) bannerImg.src = activeEvent.bannerUrl;
            
            countdownContainer.innerHTML = `
                <div style="background: #e8f5e9; color: #2ecc71; padding: 10px; border-radius: 8px; margin-bottom: 20px; border: 1px dashed #2ecc71;">
                    <b style="font-size: 15px;">${activeEvent.greeting}</b>
                </div>
            `;
        } 
        // JIKA MASIH HITUNG MUNDUR H-7
        else {
            if (bannerImg.src !== defaultBannerUrl) bannerImg.src = defaultBannerUrl;

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            countdownContainer.innerHTML = `
                <div style="font-size: 11px; color: var(--primary-color); font-weight: bold; margin-bottom: 5px;">Menuju ${activeEvent.name} ✨</div>
                <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 20px;">
                    <div style="background: var(--primary-light); color: var(--primary-color); padding: 5px 8px; border-radius: 6px; font-size: 12px;"><b>${days}</b> Hari</div>
                    <div style="background: var(--primary-light); color: var(--primary-color); padding: 5px 8px; border-radius: 6px; font-size: 12px;"><b>${hours}</b> Jam</div>
                    <div style="background: var(--primary-light); color: var(--primary-color); padding: 5px 8px; border-radius: 6px; font-size: 12px;"><b>${minutes}</b> Mnt</div>
                    <div style="background: var(--primary-light); color: var(--primary-color); padding: 5px 8px; border-radius: 6px; font-size: 12px;"><b>${seconds}</b> Dtk</div>
                </div>
            `;
        }
    }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    startSpecialDayCountdown();
});
// ========================================= //
// TEMA ADAPTIF & TERSIMPAN PERMANEN (FIX KLIK & DEFAULT TERANG)
// ========================================= //
document.addEventListener("DOMContentLoaded", () => {
    const oldThemeToggle = document.getElementById("themeToggle");
    const body = document.body;

    if (oldThemeToggle) {
        // Trik jitu: Gandakan (clone) tombol lalu timpa yang lama 
        // Ini berguna untuk menghapus error/bentrok dari script bawaan sebelumnya
        const themeToggle = oldThemeToggle.cloneNode(true);
        oldThemeToggle.parentNode.replaceChild(themeToggle, oldThemeToggle);

        // 1. Set Default Terang saat web dimuat
        const savedTheme = localStorage.getItem("theme");
        
        if (savedTheme === "dark") {
            body.classList.add("dark-mode");
            themeToggle.classList.replace("fa-moon", "fa-sun");
        } else {
            // Jika kosong atau "light", paksa jadi terang
            body.classList.remove("dark-mode");
            localStorage.setItem("theme", "light"); 
            themeToggle.classList.replace("fa-sun", "fa-moon");
        }

        // 2. Fungsi saat tombol diklik (sekarang pasti bisa diklik)
        themeToggle.addEventListener("click", () => {
            body.classList.toggle("dark-mode");
            
            // Simpan pilihan ke localStorage
            if (body.classList.contains("dark-mode")) {
                localStorage.setItem("theme", "dark"); 
                themeToggle.classList.replace("fa-moon", "fa-sun");
            } else {
                localStorage.setItem("theme", "light"); 
                themeToggle.classList.replace("fa-sun", "fa-moon");
            }
        });
    }
});

// ==========================================
// FUNGSI FILTER KATEGORI CODEX
// ==========================================
function filterCategory(categoryName, btnElement) {
    // 1. Hapus class 'active' dari semua tombol
    const allBtns = document.querySelectorAll('.cat-btn');
    allBtns.forEach(btn => btn.classList.remove('active'));

    // 2. Tambahkan class 'active' ke tombol yang diklik
    btnElement.classList.add('active');

    // 3. Filter kotak layanan yang muncul
    const allCategories = document.querySelectorAll('.item-kategori');

    allCategories.forEach(item => {
        if (categoryName === 'all') {
            item.style.display = 'block'; 
        } else {
            if (item.classList.contains(categoryName)) {
                item.style.display = 'block'; 
            } else {
                item.style.display = 'none';
            }
        }
    });
}

// ==========================================
// ANIMASI SCROLL OTOMATIS (0% LAG)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Pilih elemen mana saja yang mau dianimasikan (Otomatis ditambahkan tanpa edit HTML)
    const elementsToAnimate = document.querySelectorAll('.saldo-wrapper, .stats-container, .banner-section, .codex-category-container, .product-container, .panel-hero, .step-box');
    
    elementsToAnimate.forEach(el => {
        el.classList.add('animate-on-scroll');
    });

    // 2. Gunakan Intersection Observer (Sistem pemantau scroll bawaan browser)
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            // Jika elemen masuk ke dalam layar HP/Laptop
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target); // Cukup animasi 1x saja agar tidak bikin mata user pusing
            }
        });
    }, {
        threshold: 0.1, // Animasi dimulai saat 10% bagian kotak sudah terlihat di layar
        rootMargin: "0px 0px -20px 0px" // Sedikit margin agar animasi pas
    });

    // 3. Mulai pantau semua elemen yang sudah diberi class
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
});

// ==========================================
// FITUR EVENT GACHA
// ==========================================

// Buka halaman Gacha dari Sidebar
document.getElementById('menuGacha')?.addEventListener('click', () => {
    document.querySelectorAll('.page-section').forEach(el => {
        el.classList.remove('active');
        el.style.display = ''; // Bersihkan style paksaan
    });
    
    document.getElementById('page-gacha').classList.add('active');
    closeSidebar();
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    
    loadUserDataGacha(); 
});

// Tombol Back Gacha
document.getElementById('btnBackGacha')?.addEventListener('click', () => {
    document.querySelectorAll('.page-section').forEach(el => {
        el.classList.remove('active');
        el.style.display = ''; 
    });
    switchPage('home'); // Gunakan fungsi sinkronisasi bawaan web
});

// Fungsi memuat poin user
async function loadUserDataGacha() {
    const { token } = checkLogin();
    if (!token) return;
    try {
        const res = await fetch('/api/get-user', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }) 
        });
        const data = await res.json();
        if (data.success && data.user) {
            const userPoints = data.user.points || 0;
            document.getElementById('displayPoinGacha').innerHTML = `${userPoints} <span style="font-size: 16px;">Pts</span>`;
        }
    } catch (e) {
        console.log("Gagal load poin:", e);
    }
}

// Tombol Play Gacha
document.getElementById('btnPlayGacha')?.addEventListener('click', async () => {
    const { token } = checkLogin();
    if (!token) {
        Swal.fire('Login Dulu', 'Kamu harus login untuk memutar gacha!', 'warning');
        return;
    }

    // --- ANIMASI GACHA PREMIUM (Disuntik via JS) ---
    const gachaStyle = document.createElement('style');
    gachaStyle.innerHTML = `
        @keyframes boxTada {
            0% { transform: scale(1); }
            10%, 20% { transform: scale(0.9) rotate(-4deg); }
            30%, 50%, 70%, 90% { transform: scale(1.15) rotate(4deg); }
            40%, 60%, 80% { transform: scale(1.15) rotate(-4deg); }
            100% { transform: scale(1) rotate(0); }
        }
        .gacha-box-anim {
            animation: boxTada 1s infinite;
            font-size: 85px;
            display: inline-block;
            text-shadow: 0 0 25px rgba(241,196,15,0.8);
        }
        .swal-gacha-dark {
            border-radius: 20px !important;
            background: linear-gradient(135deg, #1a252f, #2c3e50) !important;
            color: white !important;
            border: 2px solid #f39c12;
            box-shadow: 0 0 30px rgba(243, 156, 18, 0.4);
        }
    `;
    document.head.appendChild(gachaStyle);

    // Tampilkan layar loading gacha (Kotak Goyang)
    Swal.fire({
        title: '<span style="color:#f1c40f; font-weight:800; font-size:22px;">Mengacak Hadiah...</span>',
        html: '<div class="gacha-box-anim">🎁</div><div style="color:#bdc3c7; font-size:13px; margin-top:20px;">Tahan napas, semoga beruntung!</div>',
        allowOutsideClick: false,
        showConfirmButton: false,
        customClass: { popup: 'swal-gacha-dark' }
    });

    try {
        const res = await fetch('/api/gacha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        const data = await res.json();

        // Tahan 2.5 Detik biar animasinya kerasa muter lama
        setTimeout(() => {
            if (data.success) {
                let iconBox = '💸';
                let titleText = 'SELAMAT!';
                let extraHtml = '';
                
                // Jika hadiahnya Barang Mahal (Panel, Script, Murid)
                if (data.jenis !== 'saldo') {
                    iconBox = '💎';
                    titleText = 'SUPER JACKPOT!';
                    extraHtml = '<div style="margin-top:15px; font-size:11px; color:#fff; background:rgba(231, 76, 60, 0.9); padding:10px; border-radius:8px; border:1px dashed #f1c40f;">⚠️ Screenshot layar ini & kirim ke WhatsApp Admin untuk mengklaim hadiahmu!</div>';
                }

                // Tampilkan Hasil (Kado Terbuka)
                Swal.fire({
                    title: `<span style="color:#f1c40f; font-weight:900; font-size:26px;">${titleText}</span>`,
                    html: `
                        <div style="font-size: 70px; margin: 5px 0; animation: boxTada 1s;">${iconBox}</div>
                        <div style="font-size: 13px; color: #ecf0f1; margin-bottom:8px;">Kamu berhasil mendapatkan:</div>
                        <div style="font-size: 18px; font-weight: bold; color: #2ecc71; padding:12px; background:rgba(46, 204, 113, 0.15); border-radius:10px; border:1px solid #2ecc71;">${data.prize}</div>
                        ${extraHtml}
                    `,
                    confirmButtonText: 'MANTAP!',
                    confirmButtonColor: '#f39c12',
                    customClass: { popup: 'swal-gacha-dark' }
                });

                // Update text sisa poin di layar web
                document.getElementById('displayPoinGacha').innerHTML = `${data.sisa_points} <span style="font-size: 14px;">Pts</span>`;
                loadUserData(); // Refresh saldo header
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Waduh...',
                    text: data.message,
                    confirmButtonColor: '#e74c3c'
                });
            }
        }, 2500); // 2500ms = 2.5 Detik putaran

    } catch (e) {
        Swal.fire('Error', 'Koneksi ke server gagal', 'error');
    }
});

// ==========================================
// FITUR BERBAGI THR
// ==========================================

// Buka Menu THR
document.getElementById('menuThr')?.addEventListener('click', () => {
    document.querySelectorAll('.page-section').forEach(el => { 
        el.classList.remove('active'); 
        el.style.display = ''; 
    });
    
    document.getElementById('page-thr').classList.add('active');
    closeSidebar();
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    document.getElementById('thrResultBox').style.display = 'none';
});

// Tombol Back THR
document.getElementById('btnBackThr')?.addEventListener('click', () => {
    document.querySelectorAll('.page-section').forEach(el => { 
        el.classList.remove('active'); 
        el.style.display = ''; 
    });
    switchPage('home'); // Gunakan fungsi sinkronisasi bawaan web
});

// Fungsi Buat THR
document.getElementById('btnCreateThr')?.addEventListener('click', async () => {
    const { token } = checkLogin();
    if (!token) return Swal.fire('Error', 'Silakan login dulu', 'warning');

    const total = document.getElementById('thrTotal').value;
    const winners = document.getElementById('thrWinners').value;
    const type = document.getElementById('thrType').value;

    if (!total || !winners) return Swal.fire('Error', 'Isi nominal dan jumlah pemenang!', 'error');

    const btn = document.getElementById('btnCreateThr');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
    btn.disabled = true;

    try {
        const res = await fetch('/api/thr/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, total_amount: parseInt(total), max_winners: parseInt(winners), type })
        });
        const data = await res.json();

        if (data.success) {
            Swal.fire('Sukses', 'THR Kaget berhasil dibuat!', 'success');
            document.getElementById('thrResultBox').style.display = 'block';
            
            // Format link: https://domainkamu.com/#thr-KODE
            const link = window.location.origin + '/#thr-' + data.code;
            document.getElementById('thrLinkResult').value = link;
            loadUserData(); // Refresh saldo pembuat
        } else {
            Swal.fire('Gagal', data.message, 'error');
        }
    } catch (e) {
        Swal.fire('Error', 'Koneksi gagal', 'error');
    } finally {
        btn.innerHTML = '<i class="fas fa-magic"></i> BUAT LINK THR';
        btn.disabled = false;
    }
});

function copyThrLink() {
    const link = document.getElementById('thrLinkResult').value;
    copyToClipboard(link);
}

// ----------------------------------------------------
// FUNGSI DETEKSI OTOMATIS (AMPLOP GILZ KAGET)
// ----------------------------------------------------
// Inject efek animasi amplop tanpa perlu ubah file CSS
const styleAnim = document.createElement('style');
styleAnim.innerHTML = `
    @keyframes shakeEnvelope {
        0% { transform: rotate(0deg); }
        25% { transform: rotate(-8deg) scale(1.1); }
        50% { transform: rotate(8deg) scale(1.1); }
        75% { transform: rotate(-8deg) scale(1.1); }
        100% { transform: rotate(0deg) scale(1); }
    }
    .thr-shake-anim {
        animation: shakeEnvelope 1.5s infinite ease-in-out;
        transition: transform 0.3s;
    }
    .thr-shake-anim:hover { transform: scale(1.15); }
    .swal-thr-custom { border-radius: 20px !important; }
`;
document.head.appendChild(styleAnim);

// Fungsi Utama Proses Buka Amplop & Tampilkan Pemenang
window.claimThrKaget = async function(thrCode) {
    const { token } = checkLogin();
    
    Swal.fire({
        title: 'Membuka Amplop...',
        html: '<div style="font-size: 50px; margin: 15px 0;">✨🧧✨</div>',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        const res = await fetch('/api/thr/claim', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, code: thrCode })
        });
        const data = await res.json();
        
        // --- 1. Tampilan Hasil (Dapat / Gagal) ---
        let headerHtml = '';
        if (data.success) {
            headerHtml = `
                <div style="font-size:60px; margin-top:-10px;">💸</div>
                <div style="font-size:14px; color:#555; margin-top:10px;">Selamat! Kamu mendapat Gilzz Kaget dari <b>${data.creator}</b></div>
                <div style="font-size:35px; font-weight:900; color:#2ecc71; margin:10px 0;">Rp ${data.amount.toLocaleString()}</div>
            `;
            loadUserData(); // Refresh saldo di pojok atas
        } else {
            headerHtml = `
                <div style="font-size:60px; margin-top:-10px;">😭</div>
                <div style="font-size:14px; color:#555; margin-top:10px;">${data.creator ? 'Gilzz Kaget dari <b>' + data.creator + '</b>' : ''}</div>
                <div style="font-size:15px; font-weight:bold; color:#e74c3c; margin:15px 0;">${data.message}</div>
            `;
        }

        // --- 2. Daftar Pemenang (Siapa cepat dia dapat) ---
        let winnersHtml = '<div style="text-align:left; margin-top:20px; border-top:1px dashed #ccc; padding-top:15px;">';
        winnersHtml += '<div style="font-size:13px; font-weight:bold; color:#333; margin-bottom:15px;"><i class="fas fa-users"></i> Daftar Penerima:</div>';
        
        if (data.winners && data.winners.length > 0) {
            data.winners.forEach(w => {
                // Beri logo centang biru jika dia Sultan
                const sultanIcon = w.is_sultan ? '<i class="fas fa-check-circle" style="color:#3498db; margin-left:5px; font-size:12px;" title="Sultan"></i>' : '';
                
                winnersHtml += `
                    <div style="display:flex; justify-content:space-between; align-items:center; background:#f9f9f9; padding:10px 12px; border-radius:10px; margin-bottom:8px; border: 1px solid #eee;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <div style="width:32px; height:32px; background:linear-gradient(135deg, var(--primary-color), #2980b9); color:white; border-radius:50%; display:flex; justify-content:center; align-items:center; font-weight:bold; font-size:14px;">
                                ${w.fullname.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style="font-size:12px; font-weight:bold; color:#333;">${w.fullname} ${sultanIcon}</div>
                                <div style="font-size:10px; color:#888;">${new Date(w.date).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</div>
                            </div>
                        </div>
                        <div style="font-size:13px; font-weight:bold; color:#2ecc71;">Rp ${w.amount.toLocaleString()}</div>
                    </div>
                `;
            });
        } else {
            winnersHtml += '<div style="font-size:12px; color:#999; text-align:center; padding:10px 0;">Belum ada yang mengklaim.</div>';
        }
        winnersHtml += '</div>';

        // Tampilkan Popup Keseluruhan
        Swal.fire({
            html: headerHtml + winnersHtml,
            confirmButtonText: 'Tutup',
            confirmButtonColor: 'var(--primary-color)',
            customClass: { popup: 'swal-thr-custom' }
        });

    } catch(e) {
        Swal.fire('Error', 'Gagal membuka Amplop', 'error');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.location.hash.startsWith('#thr-')) {
            const thrCode = window.location.hash.replace('#thr-', '');
            window.history.replaceState(null, null, ' '); // Bersihkan url di atas
            
            // --- TAMBAHAN: MATIKAN BANNER APK OTOMATIS ---
            const promoApk = document.getElementById('promoApkModal');
            if (promoApk) {
                promoApk.classList.remove('show');
                promoApk.style.display = 'none';
            }
            // ---------------------------------------------

            const { token } = checkLogin();
            if (!token) {
                Swal.fire('Login Diperlukan', 'Kamu harus login atau daftar dulu untuk mengambil THR ini!', 'warning')
                .then(() => window.location.href = '/login');
                return;
            }

            // Tampilkan Amplop Kaget yang bisa diklik
            Swal.fire({
                html: `
                    <div style="padding:20px 10px;">
                        <div class="thr-shake-anim" style="font-size:80px; margin-bottom:15px; cursor:pointer; display:inline-block;" onclick="claimThrKaget('${thrCode}')">🧧</div>
                        <h2 style="color:#e74c3c; font-weight:900; margin:0; font-size:24px; text-transform:uppercase; letter-spacing:1px;">Gilzz Kaget</h2>
                        <p style="font-size:13px; color:#666; margin-top:5px;">Ada Saldo Kaget yang dibagikan!<br><b>Klik amplop di atas untuk membuka.</b></p>
                    </div>
                `,
                showConfirmButton: false,
                allowOutsideClick: false,
                background: '#fff',
                backdrop: 'rgba(0,0,0,0.8)',
                customClass: { popup: 'swal-thr-custom' }
            });
        }
    }, 1000);
});

// ==========================================
// MODAL RIWAYAT & DAFTAR PEMENANG THR
// ==========================================
document.getElementById('btnRiwayatThr')?.addEventListener('click', () => {
    document.getElementById('modalRiwayatThr').classList.add('show');
    loadRiwayatThr();
});

document.getElementById('btnCloseRiwayatThr')?.addEventListener('click', () => {
    document.getElementById('modalRiwayatThr').classList.remove('show');
});

async function loadRiwayatThr() {
    const container = document.getElementById('listRiwayatThr');
    container.innerHTML = '<div style="text-align:center; padding:30px;"><i class="fas fa-spinner fa-spin"></i> Memuat data...</div>';
    
    const { token } = checkLogin();
    if (!token) return container.innerHTML = '<div style="text-align:center; padding:20px;">Silakan login dulu.</div>';

    try {
        const res = await fetch('/api/thr/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        const data = await res.json();
        
        if (data.success && data.data.length > 0) {
            let html = '';
            data.data.forEach(thr => {
                const isExpired = (new Date() - new Date(thr.created_at)) > 24 * 60 * 60 * 1000;
                let statusBadge = '<span style="color:#2ecc71; font-weight:bold; font-size:10px; border:1px solid #2ecc71; padding:2px 5px; border-radius:10px;">Aktif</span>';
                
                if (thr.is_refunded) {
                    statusBadge = '<span style="color:#e74c3c; font-weight:bold; font-size:10px; border:1px solid #e74c3c; padding:2px 5px; border-radius:10px;">Telah Direfund</span>';
                } else if (isExpired && thr.remaining_amount > 0) {
                    statusBadge = '<span style="color:#f39c12; font-weight:bold; font-size:10px; border:1px solid #f39c12; padding:2px 5px; border-radius:10px;">Proses Refund...</span>';
                } else if (thr.remaining_amount <= 0) {
                    statusBadge = '<span style="color:#95a5a6; font-weight:bold; font-size:10px; border:1px solid #95a5a6; padding:2px 5px; border-radius:10px;">Ludes</span>';
                }

                let winnersHtml = '';
                if (thr.claimed_by && thr.claimed_by.length > 0) {
                    thr.claimed_by.forEach((w, index) => {
                        winnersHtml += `
                        <div style="display:flex; justify-content:space-between; font-size:11px; padding:5px 0; border-bottom:1px dashed #eee;">
                            <span>${index+1}. 👤 ${w.username}</span>
                            <span style="color:#2ecc71; font-weight:bold;">+Rp ${w.amount.toLocaleString()}</span>
                        </div>`;
                    });
                } else {
                    winnersHtml = '<div style="font-size:11px; color:#999; text-align:center; padding:5px;">Belum ada yang klaim</div>';
                }

                html += `
                <div style="background:#f9f9f9; border:1px solid #ddd; border-radius:8px; padding:12px; margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px; align-items:center;">
                        <strong style="color:#e74c3c; font-size:13px;"><i class="fas fa-envelope"></i> ${thr.code}</strong>
                        ${statusBadge}
                    </div>
                    <div style="font-size:12px; margin-bottom:5px; color:#555;">
                        Dibuat: ${new Date(thr.created_at).toLocaleDateString('id-ID', {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'})}
                    </div>
                    <div style="font-size:12px; margin-bottom:5px;">
                        Total Saldo: <b style="color:#333;">Rp ${thr.total_amount.toLocaleString()}</b>
                    </div>
                    <div style="font-size:12px; margin-bottom:10px; display:flex; justify-content:space-between;">
                        <span>Sisa: <b style="color:#e74c3c;">Rp ${thr.remaining_amount.toLocaleString()}</b></span>
                        <span>Kuota: <b>${thr.claimed_by.length}/${thr.max_winners} Orang</b></span>
                    </div>
                    <div style="background:#fff; border:1px solid #eee; border-radius:5px; padding:8px;">
                        <div style="font-size:11px; font-weight:bold; color:#555; border-bottom:1px solid #eee; padding-bottom:5px; margin-bottom:5px;">
                            <i class="fas fa-trophy" style="color:#f1c40f;"></i> Daftar Pemenang:
                        </div>
                        ${winnersHtml}
                    </div>
                </div>
                `;
            });
            container.innerHTML = html;
        } else {
            container.innerHTML = '<div style="text-align:center; padding:30px; color:#999;">Kamu belum pernah membuat THR.</div>';
        }
    } catch (e) {
        container.innerHTML = '<div style="text-align:center; padding:30px; color:#e74c3c;">Gagal memuat data.</div>';
    }
}

// Fungsi memunculkan Add Server
async function togglePanelType() {
    const type = document.getElementById('panelOrderType').value;
    const wrapNew = document.getElementById('wrapNewPanel');
    const wrapAdd = document.getElementById('wrapAddPanel');
    const selectExisting = document.getElementById('existingPanelUser');

    if (type === 'new') {
        wrapNew.style.display = 'block';
        wrapAdd.style.display = 'none';
        checkOrder();
    } else {
        wrapNew.style.display = 'none';
        wrapAdd.style.display = 'block';
        
        selectExisting.innerHTML = '<option value="">Memuat data panel...</option>';
        try {
            const { token } = checkLogin();
            const res = await fetch('/api/get-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });
            const d = await res.json();
            if (d.success && d.user.panels && d.user.panels.length > 0) {
                // Ambil username unik saja
                const uniqueUsernames = [...new Set(d.user.panels.map(item => item.username_panel))];
                selectExisting.innerHTML = '<option value="">-- Pilih Akun Panel Kamu --</option>';
                uniqueUsernames.forEach(uname => {
                    selectExisting.innerHTML += `<option value="${uname}">${uname}</option>`;
                });
            } else {
                selectExisting.innerHTML = '<option value="">Anda belum punya panel</option>';
            }
        } catch (e) {
            selectExisting.innerHTML = '<option value="">Gagal memuat data</option>';
        }
        checkOrder();
    }
}

// Tambahkan event listener saat user memilih panel lama
document.getElementById('existingPanelUser')?.addEventListener('change', checkOrder);