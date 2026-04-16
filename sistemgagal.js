// --- AUTO-LOAD EWALLET PRODUCTS ---
const ewalletData = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, 'data', 'ewallet.json'), 'utf8'));
const {
    DANA_PRODUCTS,
    GOPAY_DRIVER_PRODUCTS,
    GOPAY_PRODUCTS,
    OVO_PRODUCTS,
    SHOPEEPAY_PRODUCTS,
    LINKAJA_PRODUCTS,
    ASTRAPAY_PRODUCTS,
    ISAKU_PRODUCTS,
    KASPRO_PRODUCTS
} = ewalletData;
// ----------------------------------

require('dotenv').config();
const os = require('os');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const xss = require('xss');
const jwt = require('jsonwebtoken');
const { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const cron = require('node-cron');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { sendTrxNotifications, sendDepositNotification, sendTransferNotification, sendNewMemberNotification } = require('./lib/notifier');

const app = express();
app.set('trust proxy', 1);
app.use((req, res, next) => {
    if (req.path.endsWith('.json') || req.path.includes('database')) {
        console.log(`Peringatan: Ada yang mencoba download database dari IP: ${req.ip}`);
        return res.status(403).send('Dilarang');
    }
    next();
});
app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const PAKASIR_API_KEY = process.env.PAKASIR_API_KEY;
const PAKASIR_SLUG = process.env.PAKASIR_SLUG;
const ADMIN_PASS = process.env.ADMIN_PASSWORD || "admin123";
const TELEGRAM_CHANNEL_TESTI = process.env.TELEGRAM_CHANNEL_TESTI || process.env.TELEGRAM_CHANNEL_ID;
const TELEGRAM_CHANNEL_INFO = process.env.TELEGRAM_CHANNEL_INFO || process.env.TELEGRAM_CHANNEL_ID;
const WA_CHANNEL_TESTI = process.env.WA_CHANNEL_TESTI || process.env.WA_CHANNEL_ID;
const WA_CHANNEL_INFO = process.env.WA_CHANNEL_INFO || process.env.WA_CHANNEL_ID;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_OWNER_ID = process.env.TELEGRAM_OWNER_ID;
const MEDANPEDIA_ID = process.env.MEDANPEDIA_ID || '11';
const MEDANPEDIA_KEY = process.env.MEDANPEDIA_KEY || 'API_KEY_KAMU_DISINI';
const SOSMED_PROFIT_PERCENT = 20;
const NOKOS_PROFIT_PERCENT = 20;
const ADMIN_FEE = parseInt(process.env.ADMIN_FEE) || 0;
const OWNER_NUMBER = process.env.OWNER_NUMBER;
const CF_EMAIL = process.env.CF_EMAIL;
const CF_API_TOKEN = process.env.CF_API_TOKEN;
const CF_HEADERS = {
    "X-Auth-Email": CF_EMAIL,
    "Authorization": `Bearer ${CF_API_TOKEN}`,
    "Content-Type": "application/json"
};
const DOMAIN_PRICES = [
    { tld: ".my.id", price: 2500 },
    { tld: ".biz.id", price: 3000 },
    { tld: ".web.id", price: 2500 },
    { tld: ".xyz", price: 3500 },
    { tld: ".com", price: 5000 },
    { tld: "default", price: 3000 }
];
const PTERO_URL = process.env.PTERO_URL;
const PTERO_KEY = process.env.PTERO_API_KEY;
const PTERO_CLIENT_KEY = process.env.PTERO_CLIENT_KEY;
const PTERO_HEADERS = {
    "Authorization": `Bearer ${PTERO_KEY}`,
    "Content-Type": "application/json",
    "Accept": "Application/vnd.pterodactyl.v1+json"
};
const LOCATION_ID = parseInt(process.env.PTERO_LOCATION_ID || 1);
const NEST_ID = parseInt(process.env.PTERO_NEST_ID || 5);
const EGG_ID = parseInt(process.env.PTERO_EGG_ID || 15);

const OKE_MEMBER_ID = process.env.OKE_MEMBER_ID;
const OKE_PIN = process.env.OKE_PIN;
const OKE_PASSWORD = process.env.OKE_PASSWORD;
const OKE_URL = process.env.OKE_URL;
const OKE_PROFIT_PERCENT = parseInt(process.env.OKE_PROFIT_PERCENT) || 20;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Gilz28';

mongoose.connect(MONGODB_URI).then(() => {
    console.log('Terhubung ke MongoDB');
}).catch(err => {
    console.error('Gagal konek MongoDB:', err);
    process.exit(1);
});

const userSchema = new mongoose.Schema({
    fullname: String,
    username: { type: String, unique: true },
    phone: { type: String, unique: true },
    password: String,
    balance: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    profile_img: { type: String, default: 'images/default-user.png' },
    banner_img: String,
    created_at: { type: Date, default: Date.now },
    last_name_change: Date,
    purchased_scripts: [{
        code: String,
        name: String,
        link: String,
        date: { type: Date, default: Date.now }
    }],
    joined_murid: [{
        code: String,
        name: String,
        link: String,
        date: { type: Date, default: Date.now }
    }],
    purchased_apps: [{
        code: String,
        name: String,
        data: String,
        tutorial: String,
        date: { type: Date, default: Date.now }
    }],
    purchased_subdomains: [{
        domain: String,
        node: String,
        ip: String,
        zone: String,
        price: Number,
        date: { type: Date, default: Date.now }
    }],
    purchased_nokos: [{
        order_id: String,
        provider_order_id: Number,
        negara: String,
        layanan: String,
        nomor: String,
        otp: String,
        status: { type: String, default: 'waiting' },
        date: { type: Date, default: Date.now }
    }]
});

const transactionSchema = new mongoose.Schema({
    order_id: { type: String, unique: true },
    provider_oid: String,
    username: String,
    fullname: String,
    amount: Number,
    pay_amount: Number,
    status: { type: String, default: 'pending' },
    type: String,
    product_data: mongoose.Schema.Types.Mixed,
    qr_string: String,
    status_provider: String,
    remains: String,
    date: { type: Date, default: Date.now }
});

const panelSchema = new mongoose.Schema({
    id: Number,
    uuid: String,
    username_owner: String,
    username_panel: String,
    password_panel: String,
    domain: String,
    product: String,
    spec: mongoose.Schema.Types.Mixed,
    price: Number,
    created_at: { type: Date, default: Date.now },
    expired_at: Date,
    warranty_code: String,
    warranty_used: { type: Boolean, default: false },
    status: { type: String, default: 'active' },
    product_code: String,
    product_name: String
});

const reviewSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    username: String,
    fullname: String,
    rating: Number,
    category: String,
    message: String,
    admin_reply: String,
    reply_date: Date,
    reactions: [{
        user: String,
        type: { type: String },
        isAdmin: Boolean,
        date: Date,
        _id: false
    }],
    date: { type: Date, default: Date.now }
});

const broadcastSchema = new mongoose.Schema({
    id: String,
    type: String,
    message: String,
    target: String,
    status: String,
    scheduled_for: Date,
    date: { type: Date, default: Date.now }
});

const promoSchema = new mongoose.Schema({
    code: { type: String, unique: true, required: true },
    name: String,
    description: String,
    discount_type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    discount_value: { type: Number, required: true },
    max_discount: Number,
    min_purchase: { type: Number, default: 0 },
    applicable_categories: [{ type: String }],
    applicable_products: [{ type: String }],
    start_date: { type: Date, default: Date.now },
    end_date: Date,
    usage_limit: { type: Number, default: 0 },
    used_count: { type: Number, default: 0 },
    per_user_limit: { type: Number, default: 1 },
    status: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now }
});

const promoUsageSchema = new mongoose.Schema({
    promo_code: String,
    username: String,
    order_id: String,
    used_at: { type: Date, default: Date.now }
});

const leaderboardConfigSchema = new mongoose.Schema({
    start_date: { type: Number, default: Date.now }
});

const resetStorageSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    attempts: { type: Number, default: 0 },
    lastRequest: { type: Number, default: 0 },
    otp: String,
    expire: { type: Number, default: 0 }
});

const otpStorageSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    data: mongoose.Schema.Types.Mixed,
    otp: String,
    expires: Number
});

const thrSchema = new mongoose.Schema({
    code: { type: String, unique: true },
    creator_username: String,
    creator_name: String,
    total_amount: Number,
    remaining_amount: Number,
    max_winners: Number,
    type: String, 
    claimed_by: [{ username: String, amount: Number, date: { type: Date, default: Date.now } }],
    is_refunded: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
});
const Thr = mongoose.models.Thr || mongoose.model('Thr', thrSchema);

const gachaSettingSchema = new mongoose.Schema({
    items: [{ name: String, type: { type: String }, min: Number, max: Number, chance: Number }]
});
const GachaSetting = mongoose.models.GachaSetting || mongoose.model('GachaSetting', gachaSettingSchema);


const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const Panel = mongoose.model('Panel', panelSchema);
const Review = mongoose.model('Review', reviewSchema);
const Broadcast = mongoose.model('Broadcast', broadcastSchema);
const LeaderboardConfig = mongoose.model('LeaderboardConfig', leaderboardConfigSchema);
const ResetStorage = mongoose.model('ResetStorage', resetStorageSchema);
const OtpStorage = mongoose.model('OtpStorage', otpStorageSchema);
const Promo = mongoose.model('Promo', promoSchema);
const PromoUsage = mongoose.model('PromoUsage', promoUsageSchema);
class Mutex {
    constructor() { this.queue = []; this.locked = false; }
    lock() {
        return new Promise(resolve => {
            if (this.locked) { this.queue.push(resolve); } 
            else { this.locked = true; resolve(); }
        });
    }
    unlock() {
        if (this.queue.length > 0) { const next = this.queue.shift(); next(); } 
        else { this.locked = false; }
    }
}
const appLock = new Mutex();

function logActivity(type, user, detail = '-') {
    const tanggal = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const border = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    console.log(`\n${border}`);
    console.log(`[ ${type.toUpperCase()} ]`);
    console.log(`Tanggal     : ${tanggal}`);
    console.log(`Username    : ${user.username}`);
    console.log(`Nomor       : ${user.phone}`);
    console.log(`Saldo Akun  : Rp ${(user.balance || 0).toLocaleString('id-ID')}`);
    console.log(`Info        : ${detail}`);
    console.log(`${border}\n`);
}

let sock;
let pairingCodeRequested = false;

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`Menggunakan WA Web versi v${version.join('.')}, isLatest: ${isLatest}`);
    
    sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        markOnlineOnConnect: true,
        syncFullHistory: false,
        generateHighQualityLinkPreview: true,
        getMessage: async (key) => {
            return { conversation: 'Gilzzotp System Message' };
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        try {
            const msg = m.messages[0];
            if (!msg) return;
            
            if (msg.key.remoteJid && msg.key.remoteJid.includes('@newsletter')) {
                console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                console.log(`📢 INFO ID SALURAN WA DITEMUKAN!`);
                console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                console.log(`COPY ID INI KE .ENV KAMU:`);
                console.log(`${msg.key.remoteJid}`);
                console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
            }

            const pesanTeks = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
            if (pesanTeks === '.testesti') {
                console.log("Menjalankan tes kirim teks ke Saluran Testi...");
                const testId = process.env.WA_CHANNEL_TESTI || process.env.WA_CHANNEL_ID;
                if(testId) {
                    await sock.sendMessage(testId, { text: "📢 Halo! Ini pesan tes bot ke Saluran Testimoni." });
                    console.log("Pesan teks terkirim ke Saluran!");
                }
                return;
            }

            if (pesanTeks === '.cektagihan' && msg.key.fromMe) {
                console.log("Menjalankan pengecekan tagihan manual via WA...");
                await sock.sendMessage(msg.key.remoteJid, { text: "⏳ Sedang mengecek dan mengirim tagihan panel..." });
                await checkExpiredPanels(); 
                await sock.sendMessage(msg.key.remoteJid, { text: "✅ Proses penagihan otomatis dan bersih-bersih panel selesai dieksekusi!" });
                return;
            }

            if (!msg.message || msg.key.fromMe) return;
        } catch (e) {
            console.log("Upsert Error:", e.message);
        }
    });
    
    if(!sock.authState.creds.registered && !pairingCodeRequested) {
        pairingCodeRequested = true;
        
        setTimeout(async () => {
            try {
                let phoneNumber = OWNER_NUMBER;
                if (!phoneNumber) {
                    console.log("Variabel OWNER_NUMBER belum diisi di file .env");
                    return;
                }
                
                phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
                if (phoneNumber.startsWith('08')) phoneNumber = '62' + phoneNumber.slice(1);
                
                let code = await sock.requestPairingCode(phoneNumber, 'GILZ1903');
                code = code?.match(/.{1,4}/g)?.join("-") || code;

                console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                console.log(`      🤖 WHATSAPP PAIRING CODE`);
                console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                console.log(`📱 Nomor : ${phoneNumber}`);
                console.log(`🔑 Kode  : ${code}`);
                console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
                console.log(`Cek HP Kamu sekarang! Akan ada notif dari WhatsApp untuk memasukkan kode di atas.\n`);
                
            } catch(e) {
                console.log("Gagal meminta pairing code:", e.message);
            }
        }, 3000);
    }

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            if(shouldReconnect) {
                console.log("Koneksi terputus, mencoba menghubungkan ulang...");
                connectToWhatsApp();
            }
        } else if(connection === 'open') {
            console.log("Bot WhatsApp Berhasil Terhubung ke Gilzz API!");
        }
    });
}
connectToWhatsApp();

const sendWhatsApp = async (number, text) => {
    if (!sock) return;
    let cleanNumber = number.replace(/[^0-9]/g, '');
    if(cleanNumber.startsWith('08')) cleanNumber = '62' + cleanNumber.slice(1);
    const jid = cleanNumber + "@s.whatsapp.net";
    try { await sock.sendMessage(jid, { text: text }); } catch (e) {}
};

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'), { index: false, extensions: ['html'] }));

let categoryLock = {
    'Panel': true,
    'Script': true,
    'VPS': true,
    'Murid': true,
    'Apps': true,
    'Sosmed': true,
    'Lainnya': true
};

const authAdmin = (req, res, next) => {
    if (req.body.password === ADMIN_PASS || req.headers['admin-auth'] === ADMIN_PASS) {
        req.isAdmin = true;
        next();
    } else {
        return res.json({ success: false, message: "Akses Ditolak!" });
    }
};

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, message: "Terlalu banyak percobaan login, coba lagi nanti." }
});

const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { success: false, message: "Terlalu banyak percobaan, santai dulu bang." }
});

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Terlalu banyak request, coba lagi nanti."
});

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)){ fs.mkdirSync(DATA_DIR); }
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const SCRIPTS_FILE = path.join(DATA_DIR, 'scripts.json');
const MURID_FILE = path.join(DATA_DIR, 'murid.json');
const VPS_FILE = path.join(DATA_DIR, 'vps.json');
const APPS_FILE = path.join(DATA_DIR, 'apps.json');
const SUBDOMAIN_FILE = path.join(DATA_DIR, 'subdomains.json');

function getProducts() {
    if (fs.existsSync(PRODUCTS_FILE)) {
        try { return JSON.parse(fs.readFileSync(PRODUCTS_FILE)); } catch (e) { return []; }
    }
    return [];
}

function getScripts() {
    if (fs.existsSync(SCRIPTS_FILE)) {
        try { return JSON.parse(fs.readFileSync(SCRIPTS_FILE)); } catch (e) { return []; }
    }
    return [];
}

function getMurid() {
    if (fs.existsSync(MURID_FILE)) {
        try { return JSON.parse(fs.readFileSync(MURID_FILE)); } catch (e) { return []; }
    }
    return [];
}

function getVPS() {
    if (fs.existsSync(VPS_FILE)) {
        try { return JSON.parse(fs.readFileSync(VPS_FILE)); } catch (e) { return []; }
    }
    return [];
}

function getApps() {
    if (fs.existsSync(APPS_FILE)) {
        try { return JSON.parse(fs.readFileSync(APPS_FILE)); } catch (e) { return []; }
    }
    return [];
}

function saveApps(data) { fs.writeFileSync(APPS_FILE, JSON.stringify(data, null, 2)); }

function getSubdomains() {
    if (fs.existsSync(SUBDOMAIN_FILE)) {
        try { return JSON.parse(fs.readFileSync(SUBDOMAIN_FILE)); } catch (e) { return []; }
    }
    return [];
}

async function getLeaderboardConfig() {
    let config = await LeaderboardConfig.findOne();
    if (!config) {
        config = new LeaderboardConfig({ start_date: Date.now() });
        await config.save();
    }
    return config;
}

async function createPteroUser(username, email, password) {
    try {
        const res = await axios.post(`${PTERO_URL}/api/application/users`, {
            email: email, username: username, first_name: username, last_name: "User", password: password
        }, { headers: PTERO_HEADERS });
        return res.data.attributes.id;
    } catch (e) { return null; }
}

async function createPteroServer(userId, serverName, memory, disk, cpu, expiredDesc) {
    try {
        const res = await axios.post(`${PTERO_URL}/api/application/servers`, {
            name: serverName,
            user: userId,
            nest: NEST_ID,
            egg: EGG_ID,
            docker_image: "ghcr.io/parkervcp/yolks:nodejs_20",
            startup: "if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == \"1\" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi;  if [[ ! -z ${CUSTOM_ENVIRONMENT_VARIABLES} ]]; then      vars=$(echo ${CUSTOM_ENVIRONMENT_VARIABLES} | tr \";\" \"\\n\");      for line in $vars;     do export $line;     done fi;  /usr/local/bin/${CMD_RUN};",
            description: `Expired pada: ${expiredDesc} | Garansi Aktif`,
            environment: {
                "GIT_ADDRESS": "",
                "BRANCH": "",
                "USERNAME": "",
                "ACCESS_TOKEN": "",
                "CMD_RUN": "npm start",
                "NODE_PACKAGES": "",
                "UNNODE_PACKAGES": "",
                "CUSTOM_ENVIRONMENT_VARIABLES": ""
            },
            limits: { memory: memory, swap: 0, disk: disk, io: 500, cpu: cpu },
            feature_limits: { databases: 1, allocations: 1, backups: 0 },
            deploy: { locations: [LOCATION_ID], dedicated_ip: false, port_range: [] }
        }, { headers: PTERO_HEADERS });
        return res.data.attributes;
    } catch (e) {
        throw e;
    }
}

async function actionServer(serverId, action) {
    try {
        if(action === 'delete') {
            await axios.delete(`${PTERO_URL}/api/application/servers/${serverId}`, { headers: PTERO_HEADERS });
        } else {
            await axios.post(`${PTERO_URL}/api/application/servers/${serverId}/${action}`, {}, { headers: PTERO_HEADERS });
        }
        return true; // Berhasil
    } catch(e) {
        console.error(`[SYSTEM] Gagal aksi ${action} pada server ${serverId}:`, e.message);
        return false; // Gagal, jangan ubah database web
    }
}

async function processPanelCreation(user, username_panel, product_code, order_id_input = null) {
    const products = getProducts();
    const product = products.find(p => p.code === product_code);
    if (!product) return false;

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const passwordPanel = `${username_panel}${randomDigits}`;
    const emailPanel = `${username_panel}@store.com`;
    const spec = product.spec;
    
    let pteroUserId = await createPteroUser(username_panel, emailPanel, passwordPanel);
    
    if(!pteroUserId) {
        try {
            const checkUser = await axios.get(`${PTERO_URL}/api/application/users?filter[email]=${emailPanel}`, { headers: PTERO_HEADERS });
            if(checkUser.data.data.length > 0) pteroUserId = checkUser.data.data[0].attributes.id;
        } catch(e) {}
    }

    if (!pteroUserId) return false;

    try {
        const expiredDate = new Date();
        expiredDate.setDate(expiredDate.getDate() + 30);
        const expStr = expiredDate.toLocaleDateString('id-ID');

        const serverData = await createPteroServer(pteroUserId, `${username_panel} - ${product.name}`, spec.ram, spec.disk, spec.cpu, expStr);
        const warrantyCode = "GRS-" + Math.random().toString(36).toUpperCase().slice(-8);
        
        const newPanel = new Panel({
            id: serverData.id, uuid: serverData.uuid, username_owner: user.username,
            username_panel: username_panel, password_panel: passwordPanel, domain: PTERO_URL,
            product: product.name, spec: spec, price: product.price,
            created_at: new Date(), expired_at: expiredDate,
            warranty_code: warrantyCode, warranty_used: false, status: 'active',
            product_code: product.code, product_name: product.name
        });
        await newPanel.save();

        const trxId = order_id_input || `INV${Date.now()}`;
        const trxAmount = parseInt(product.price).toLocaleString('id-ID');
        const trxDate = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
        const totalSukses = await Transaction.countDocuments({ status: 'success' }) + 1;
        
        await sendTrxNotifications({
            user: user, orderId: trxId, productName: product.name,
            amount: trxAmount, trxDate: trxDate, totalSukses: totalSukses,
            type: 'PANEL', sendWhatsApp: sendWhatsApp, sock: sock
        });

        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}

async function processMuridPurchase(user, murid_code, order_id_input = null) {
    try {
        const listMurid = getMurid();
        const selected = listMurid.find(s => s.code === murid_code);
        if (!selected) return false;
        
        if (!user.joined_murid) user.joined_murid = [];
        user.joined_murid.push({ code: selected.code, name: selected.name, link: selected.link, date: new Date() });
        await User.updateOne({ username: user.username }, { $set: { joined_murid: user.joined_murid } });

        const orderId = order_id_input || `INV${Date.now()}`;
        const nominal = parseInt(selected.price).toLocaleString('id-ID');
        const trxDate = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
        const totalSukses = await Transaction.countDocuments({ status: 'success' }) + 1;
        
        await sendTrxNotifications({
            user: user, orderId: orderId, productName: selected.name,
            amount: nominal, trxDate: trxDate, totalSukses: totalSukses,
            type: 'MURID', sendWhatsApp: sendWhatsApp, sock: sock
        });

        logActivity('MURID JOIN', user, `Paket: ${selected.name}`);
        return true;
    } catch (e) {
        console.log("Error processMuridPurchase:", e);
        return false;
    }
}

async function processScriptPurchase(user, script_code, order_id_input = null) {
    try {
        const scripts = getScripts();
        const selectedScript = scripts.find(s => s.code === script_code);
        if (!selectedScript) return false;

        if (!user.purchased_scripts) user.purchased_scripts = [];
        if (!user.purchased_scripts.find(s => s.code === script_code)) {
            user.purchased_scripts.push({ code: selectedScript.code, name: selectedScript.name, link: selectedScript.link, date: new Date() });
            await User.updateOne({ username: user.username }, { $set: { purchased_scripts: user.purchased_scripts } });
        }

        const orderId = order_id_input || `INV${Date.now()}`;
        const nominal = parseInt(selectedScript.price).toLocaleString('id-ID');
        const trxDate = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
        const totalSukses = await Transaction.countDocuments({ status: 'success' }) + 1;

        await sendTrxNotifications({
            user: user, orderId: orderId, productName: selectedScript.name,
            amount: nominal, trxDate: trxDate, totalSukses: totalSukses,
            type: 'SCRIPT', sendWhatsApp: sendWhatsApp, sock: sock
        });
        
        logActivity('SCRIPT TERJUAL', user, `Item: ${selectedScript.name}`);
        return true;
    } catch (e) {
        console.log("Error processScriptPurchase:", e);
        return false;
    }
}

async function processSubdomainPurchase(user, domainData, order_id_input = null) {
    try {
        const { subdomain, ip_address, zone_id, zone_name, proxy_status, price } = domainData;
        const randNode = Math.floor(Math.random() * 900) + 100;
        const nodeName = `node${randNode}.${subdomain}`;
        
        await axios.post(`https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records`, {
            type: "A", name: subdomain, content: ip_address, ttl: 1, proxied: proxy_status
        }, { headers: CF_HEADERS });

        await axios.post(`https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records`, {
            type: "A", name: nodeName, content: ip_address, ttl: 1, proxied: false
        }, { headers: CF_HEADERS });

        if (!user.purchased_subdomains) user.purchased_subdomains = [];
        const fullDomain = `${subdomain}.${zone_name}`;
        const fullNode = `${nodeName}.${zone_name}`;

        user.purchased_subdomains.push({
            domain: fullDomain, node: fullNode, ip: ip_address, date: new Date(), price: price, zone: zone_name
        });
        await User.updateOne({ username: user.username }, { $set: { purchased_subdomains: user.purchased_subdomains } });

        const trxDate = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
        const nominal = parseInt(price).toLocaleString('id-ID');
        const totalSukses = await Transaction.countDocuments({ status: 'success' }) + 1;

        await sendTrxNotifications({
            user: user, orderId: order_id_input, productName: zone_name,
            amount: nominal, trxDate: trxDate, totalSukses: totalSukses,
            type: 'DOMAIN', sendWhatsApp: sendWhatsApp, sock: sock
        });

        logActivity('BELI SUBDOMAIN', user, `Domain: ${fullDomain}`);
        return true;

    } catch (e) {
        console.log("Error create subdomain:", e.response ? e.response.data : e.message);
        return false;
    }
}

async function processAppPurchase(user, app_code, order_id_input = null) {
    await appLock.lock();
    try {
        const listApps = getApps();
        const appIndex = listApps.findIndex(a => a.code === app_code);
        if (appIndex === -1) { appLock.unlock(); return { success: false, msg: "Produk tidak ditemukan" }; }
        if (listApps[appIndex].stock.length === 0) { appLock.unlock(); return { success: false, msg: "Stok Habis" }; }

        const accountData = listApps[appIndex].stock.shift();
        saveApps(listApps);
        
        appLock.unlock();
        
        if (!user.purchased_apps) user.purchased_apps = [];
        user.purchased_apps.push({
            code: listApps[appIndex].code, name: listApps[appIndex].name, data: accountData,
            tutorial: listApps[appIndex].tutorial || "Hubungi Admin untuk cara pakai.", date: new Date()
        });
        await User.updateOne({ username: user.username }, { $set: { purchased_apps: user.purchased_apps } });

        const orderId = order_id_input || `INV${Date.now()}`;
        const nominal = parseInt(listApps[appIndex].price).toLocaleString('id-ID');
        const trxDate = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
        const totalSukses = await Transaction.countDocuments({ status: 'success' }) + 1;

        await sendTrxNotifications({
            user: user, orderId: orderId, productName: listApps[appIndex].name,
            amount: nominal, trxDate: trxDate, totalSukses: totalSukses,
            type: 'APP', sendWhatsApp: sendWhatsApp, sock: sock
        });
        
        logActivity('BELI APLIKASI', user, `Item: ${listApps[appIndex].name}`);
        return { success: true };

    } catch (e) {
        console.log(e);
        if (appLock.locked) appLock.unlock();
        return { success: false, msg: "Error Server" };
    }
}

async function processVPSPurchase(user, vps_code, order_id_input = null) {
    try {
        const listVPS = getVPS();
        const selected = listVPS.find(s => s.code === vps_code);
        if (!selected) return false;

        const orderId = order_id_input || `INV${Date.now()}`;
        const nominal = parseInt(selected.price).toLocaleString('id-ID');
        const trxDate = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
        const totalSukses = await Transaction.countDocuments({ status: 'success' }) + 1;

        await sendTrxNotifications({
            user: user, orderId: orderId, productName: selected.name,
            amount: nominal, trxDate: trxDate, totalSukses: totalSukses,
            type: 'VPS', sendWhatsApp: sendWhatsApp, sock: sock
        });

        logActivity('ORDER VPS', user, `Item: ${selected.name}`);
        return true;
    } catch (e) {
        console.log("Error processVPS:", e);
        return false;
    }
}

app.post('/api/register', async (req, res) => {
    const fullname = xss(req.body.fullname);
    const username = xss(req.body.username.toLowerCase());
    let phone = xss(req.body.phone);
    const password = req.body.password;
    
    if (!fullname || !username || !phone || !password) return res.json({ success: false, message: "Lengkapi data!" });
    if (password.length < 8) {
        return res.json({ success: false, message: "Password minimal 8 karakter!" });
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return res.json({ success: false, message: "Password wajib menggunakan simbol unik (Contoh: @, #, !)" });
    }
    
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.json({ success: false, message: "Username sudah ada!" });
    
    phone = phone.replace(/[^0-9]/g, '');
    if (phone.startsWith('08')) phone = '62' + phone.slice(1);
    if (phone.length < 10) return res.json({ success: false, message: "Nomor WhatsApp tidak valid!" });
    
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) return res.json({ success: false, message: "Nomor WA sudah terdaftar!" });
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, 10);

    await OtpStorage.findOneAndUpdate(
        { username },
        {
            data: {
                fullname,
                username,
                phone,
                password: hashedPassword,
                balance: 0,
                created_at: new Date()
            },
            otp,
            expires: Date.now() + 60000 * 5
        },
        { upsert: true }
    );
    
    console.log(`OTP ${username}: ${otp}`);
    res.json({ success: true, message: "OTP Digenerate!", show_otp_in_web: otp });
});

app.post('/api/resend-otp', async (req, res) => {
    const { username } = req.body;
    const session = await OtpStorage.findOne({ username });
    
    if (!session) return res.json({ success: false, message: "Data registrasi hilang, silakan daftar ulang." });
    
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    session.otp = newOtp;
    session.expires = Date.now() + 60000 * 5;
    await session.save();
    
    res.json({ success: true, new_otp: newOtp });
});

app.post('/api/verify-otp', async (req, res) => {
    const { username, otp } = req.body;
    const session = await OtpStorage.findOne({ username });
    
    if (!session) return res.json({ success: false, message: "Sesi habis." });
    if (Date.now() > session.expires) return res.json({ success: false, message: "Kode Kadaluarsa." });
    if (session.otp !== otp) return res.json({ success: false, message: "Kode Salah." });
    
    const newUser = new User(session.data);
    await newUser.save();
    await OtpStorage.deleteOne({ username });
    
    logActivity('PENDAFTARAN BARU', session.data, 'Verifikasi OTP Sukses');
    
    try {
        await sendNewMemberNotification({
            user: session.data,
            sock: sock
        });
    } catch (err) {
        console.log("Error sending register notification:", err);
    }
    
    res.json({ success: true, message: "Sukses" });
});

app.post('/api/login', loginLimiter, async (req, res) => {
    const username = xss(String(req.body.username || "").toLowerCase());
    const password = String(req.body.password || "");
    const user = await User.findOne({ username });
    
    if (user && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '30d' });
        const safeUser = user.toObject();
        delete safeUser.password;
        
        logActivity('LOGIN USER', user, 'Akses Masuk');
        res.json({ success: true, token, user: safeUser });
    } else {
        res.json({ success: false, message: "Username atau Password salah!" });
    }
});

app.post('/api/get-user', async (req, res) => {
    const { token } = req.body;
    if (!token) return res.json({ success: false });
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        
        if (user) {
            const userPanels = await Panel.find({
                username_owner: user.username,
                status: { $ne: 'deleted' }
            });
            
            const myTrx = await Transaction.find({
                username: user.username,
                status: 'success'
            });
            
            const totalSpent = myTrx
                .filter(t => t.type !== 'deposit')
                .reduce((acc, curr) => acc + parseInt(curr.amount), 0);
                
            const totalDeposit = myTrx
                .filter(t => t.type === 'deposit')
                .reduce((acc, curr) => acc + parseInt(curr.amount), 0);
                
            const trxCount = myTrx.length;
            
            const safeUser = user.toObject();
            delete safeUser.password;
            
            res.json({
                success: true,
                user: {
                    ...safeUser,
                    panels: userPanels,
                    stat_total_spent: totalSpent,
                    stat_total_deposit: totalDeposit,
                    stat_trx_count: trxCount
                }
            });
        } else {
            res.json({ success: false });
        }
    } catch (err) {
        res.json({ success: false });
    }
});

function checkLock(category, data) {
    if (!categoryLock[category]) return [];
    return data;
}

app.get('/api/products', (req, res) => res.json({ success: true, data: checkLock('Panel', getProducts()) }));
app.get('/api/scripts', (req, res) => res.json({ success: true, data: checkLock('Script', getScripts()) }));
app.get('/api/vps', (req, res) => res.json({ success: true, data: checkLock('VPS', getVPS()) }));
app.get('/api/murid', (req, res) => res.json({ success: true, data: checkLock('Murid', getMurid()) }));

app.post('/api/sosmed/services', (req, res) => {
    if (categoryLock['Sosmed'] === false) {
        return res.json({
            success: false,
            message: "Mohon maaf, layanan Sosmed sedang gangguan/habis sementara."
        });
    }
    res.json({ success: true, message: "Service Ready" });
});

app.post('/api/buy-panel', async (req, res) => {
    // Ambil order_type (opsional, jika dikirim dari frontend)
    const { token, username_panel, product_code, method, order_type = 'new' } = req.body;
    
    if(!/^[a-zA-Z0-9-]{3,}$/.test(username_panel)) {
        return res.json({ success: false, message: "Username hanya boleh huruf, angka, dan strip (-)!" });
    }
    
    const existingPanel = await Panel.findOne({
        username_panel,
        status: { $ne: 'deleted' }
    });
    
    // LOGIKA ADD SERVER vs BUAT BARU
    // Jika dia pilih "Buat Baru" tapi username sudah ada di database = TOLAK
    if(order_type === 'new' && existingPanel) {
        return res.json({ success: false, message: "Username panel sudah dipakai! Silakan pilih 'Tambah Server ke Akun Lama' di Langkah 1." });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        if (!user) return res.json({ success: false, message: "User tidak ditemukan" });
        
        const products = getProducts();
        const selectedProduct = products.find(p => p.code === product_code);
        if (selectedProduct.active === false) return res.json({ success: false, message: "Stok produk sedang habis/nonaktif!" });
        if (!selectedProduct) return res.json({ success: false, message: "Produk tidak valid!" });
        
        const nominal = selectedProduct.price;
        
        let finalAmount = nominal;
        let appliedPromoCode = null;

        if (req.body.promo_code) {
            if (method === 'qris') {
                return res.json({
                    success: false,
                    message: "Mohon maaf promo ini hanya bisa di beli menggunakan pembayaran saldo tidak berlaku di pembayaran qris"
                });
            }
            
            const promo = await Promo.findOne({ code: req.body.promo_code.toUpperCase(), status: true });
            if (promo) {
                const userUsage = await PromoUsage.countDocuments({ promo_code: promo.code, username: user.username });
                if (userUsage < promo.per_user_limit) {
                    const now = new Date();
                    if (now >= promo.start_date && (!promo.end_date || now <= promo.end_date)) {
                        
                        let discount = promo.discount_type === 'percentage'
                            ? Math.floor(nominal * promo.discount_value / 100)
                            : promo.discount_value;
                            
                        if (promo.max_discount && discount > promo.max_discount) discount = promo.max_discount;
                        if (discount > nominal) discount = nominal;
                        
                        finalAmount = nominal - discount;
                        appliedPromoCode = promo.code;
                        
                        promo.used_count += 1;
                        await promo.save();
                        
                        await new PromoUsage({
                            promo_code: promo.code,
                            username: user.username,
                            order_id: "PROMO-" + Date.now()
                        }).save();
                    }
                }
            }
        }

        if (method === 'saldo') {
            if (user.balance < finalAmount) {
                return res.json({ success: false, message: "Saldo tidak cukup!" });
            }
            
            user.balance -= finalAmount;
            
            const poinPanel = Math.floor(finalAmount / 10000); 
            if (poinPanel > 0) {
                user.points = (user.points || 0) + poinPanel;
            }

            await user.save();
            
            const order_id = "SALDO-" + Date.now();
            const createSuccess = await processPanelCreation(user, username_panel, product_code, order_id);
            
            if(createSuccess) {
                const transaction = new Transaction({
                    order_id: order_id,
                    username: user.username,
                    fullname: user.fullname,
                    amount: nominal,
                    pay_amount: finalAmount,
                    status: 'success',
                    type: 'buy_panel',
                    product_data: {
                        username_panel,
                        product_code,
                        product_name: selectedProduct.name
                    },
                    qr_string: '-',
                    date: new Date()
                });
                await transaction.save();
                
                logActivity('BELI PANEL (SALDO)', user, `Produk: ${selectedProduct.name} | Panel: ${username_panel}`);
                return res.json({ success: true, message: "Panel berhasil dibuat!", type: 'instant' });
            } else {
                user.balance += finalAmount;
                await user.save();
                return res.json({ success: false, message: "Gagal membuat server, saldo dikembalikan." });
            }
        }
        else if (method === 'qris') {
            const order_id = "PNL-" + Date.now();
            const amountToSend = finalAmount + parseInt(process.env.ADMIN_FEE || 0);
            
            const response = await axios.post('https://app.pakasir.com/api/transactioncreate/qris', {
                project: PAKASIR_SLUG, order_id: order_id, amount: amountToSend, api_key: PAKASIR_API_KEY
            });

            if (response.data && response.data.payment) {
                const payData = response.data.payment;
                const realAmount = payData.total_payment ? parseInt(payData.total_payment) : amountToSend;

                const transaction = new Transaction({
                    order_id: order_id,
                    username: user.username,
                    fullname: user.fullname,
                    amount: nominal,
                    pay_amount: realAmount,
                    status: 'pending',
                    type: 'buy_panel',
                    product_data: {
                        username_panel,
                        product_code,
                        product_name: selectedProduct.name
                    },
                    qr_string: payData.payment_number,
                    date: new Date()
                });
                await transaction.save();
                
                logActivity('ORDER PANEL (QRIS)', user, `Pending Payment: ${realAmount}`);
                return res.json({
                    success: true,
                    type: 'qris',
                    qr_string: payData.payment_number,
                    order_id,
                    amount: nominal,
                    pay_amount: realAmount
                });
            } else {
                return res.json({ success: false, message: "Gagal generate QRIS" });
            }
        }
    } catch (e) {
        console.log(e);
        res.json({ success: false, message: "Error Server" });
    }
});

// API Untuk Perpanjang Panel
app.post('/api/extend-panel', async (req, res) => {
    const { token, username_panel, product_code } = req.body;
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        if (!user) return res.json({ success: false, message: "User tidak ditemukan" });

        const panel = await Panel.findOne({ username_panel, status: { $ne: 'deleted' } });
        if (!panel) {
            return res.json({ success: false, message: "Panel belum ada! Silakan beli baru terlebih dahulu." });
        }

        if (panel.username_owner !== user.username) {
            return res.json({ success: false, message: "Panel ini bukan milik Anda!" });
        }

        const products = getProducts();
        const selectedProduct = products.find(p => p.code === product_code);
        if (!selectedProduct) return res.json({ success: false, message: "Produk tidak valid!" });

        if (panel.product_code && panel.product_code != product_code) {
            return res.json({ 
                success: false, 
                message: `TIDAK BISA PERPANJANG!\nPaket yang kamu pilih berbeda. Panel ini awalnya menggunakan paket: ${panel.product_name || 'Tidak Diketahui'}. Pilih paket yang sama!` 
            });
        }

        const nominal = selectedProduct.price;
        
        if (user.balance < nominal) {
            return res.json({ success: false, message: "Saldo tidak mencukupi untuk perpanjang!", need_deposit: true });
        }

        const createDate = new Date(panel.created_at);
        const now = new Date();
        
        let diffTime = now.getTime() - createDate.getTime();
        let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        let sisaGaransi = 15 - diffDays;
        if (sisaGaransi < 0) sisaGaransi = 0; 
        
        let garansiBaru = sisaGaransi + 15;
        let newCreatedAt = new Date();
        newCreatedAt.setDate(newCreatedAt.getDate() + (garansiBaru - 15));

        let currentExpired = new Date(panel.expired_at);
        if (currentExpired < now) currentExpired = now; 
        currentExpired.setDate(currentExpired.getDate() + 30);
        
        user.balance -= nominal;
        await user.save();

        panel.expired_at = currentExpired;
        panel.created_at = newCreatedAt;
        panel.warranty_used = false; 
        panel.product_code = selectedProduct.code;
        panel.product_name = selectedProduct.name;
        await panel.save();

        // --- UPDATE DESKRIPSI DI PTERODACTYL ---
        try {
            const expStrPtero = currentExpired.toLocaleDateString('id-ID');
            const checkServer = await axios.get(`${PTERO_URL}/api/application/servers/${panel.id}`, { headers: PTERO_HEADERS });
            
            if (checkServer.data && checkServer.data.attributes) {
                const pteroUserId = checkServer.data.attributes.user;
                const pteroServerName = checkServer.data.attributes.name;
                
                await axios.patch(`${PTERO_URL}/api/application/servers/${panel.id}/details`, {
                    name: pteroServerName,
                    user: pteroUserId,
                    description: `Expired pada: ${expStrPtero} | Garansi Aktif`
                }, { headers: PTERO_HEADERS });
                console.log(`[SYSTEM] Deskripsi panel ${panel.username_panel} di Pterodactyl berhasil diupdate!`);
            }
        } catch (err) {
            console.log(`[SYSTEM] Gagal update deskripsi Pterodactyl:`, err.message);
        }
        // ---------------------------------------

        const order_id = "EXT-" + Date.now();
        const transaction = new Transaction({
            order_id: order_id,
            username: user.username,
            fullname: user.fullname,
            amount: nominal,
            pay_amount: nominal,
            status: 'success',
            type: 'extend_panel',
            product_data: {
                username_panel,
                product_code,
                product_name: "Perpanjang " + selectedProduct.name
            },
            qr_string: '-',
            date: new Date()
        });
        await transaction.save();

        logActivity('PERPANJANG PANEL', user, `Panel: ${username_panel} | +30 Hari`);

        const tanggalExpiredBaru = currentExpired.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

        return res.json({ 
            success: true, 
            message: `Panel berhasil diperpanjang!\n\nMasa aktif nambah 30 Hari.\nExpired baru: ${tanggalExpiredBaru}\nGaransi bertambah jadi ${garansiBaru} Hari.` 
        });

    } catch (e) {
        console.log(e);
        return res.json({ success: false, message: "Error Server" });
    }
});

app.post('/api/deposit', async (req, res) => {
    const { token, amount } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        const order_id = "INV-" + Date.now();
        const depositAmount = parseInt(amount);
        const amountToSend = depositAmount + parseInt(process.env.ADMIN_FEE || 0);
        
        const response = await axios.post('https://app.pakasir.com/api/transactioncreate/qris', {
            project: PAKASIR_SLUG,
            order_id: order_id,
            amount: amountToSend,
            api_key: PAKASIR_API_KEY
        });

        if (response.data && response.data.payment) {
            const payData = response.data.payment;
            const realAmount = payData.total_payment ? parseInt(payData.total_payment) : amountToSend;

            const transaction = new Transaction({
                order_id: order_id,
                username: decoded.username,
                fullname: user ? user.fullname : decoded.username,
                amount: depositAmount,
                pay_amount: realAmount,
                status: 'pending',
                type: 'deposit',
                qr_string: payData.payment_number,
                date: new Date()
            });
            await transaction.save();

            if(user) logActivity('REQUEST DEPOSIT', user, `Nominal: ${depositAmount} (Pending)`);

            res.json({
                success: true,
                qr_string: payData.payment_number,
                order_id: order_id,
                amount: depositAmount,
                pay_amount: realAmount
            });
        } else {
            res.json({ success: false, message: "Gagal membuat tagihan." });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error Gateway Pembayaran" });
    }
});

app.post('/api/check-payment', async (req, res) => {
    const { order_id } = req.body;

    const trx = await Transaction.findOne({ order_id });
    if (!trx) {
        return res.json({ success: false, message: "Transaksi tidak ditemukan di database." });
    }
    
    if (trx.status === 'success') return res.json({ success: true, status: 'success' });
    if (trx.status === 'canceled') return res.json({ success: false, status: 'canceled' });

    try {
        const adminFee = parseInt(process.env.ADMIN_FEE || 0);
        const registeredAmount = parseInt(trx.amount) + adminFee;
        const url = `https://app.pakasir.com/api/transactiondetail?project=${PAKASIR_SLUG}&amount=${registeredAmount}&order_id=${order_id}&api_key=${PAKASIR_API_KEY}`;
        
        const response = await axios.get(url);
        const pData = response.data.transaction;

        if (pData && (pData.status === 'completed' || pData.status === 'success' || pData.status === 'paid')) {
            const user = await User.findOne({ username: trx.username });
            
            if (user) {
                trx.status = 'success';
                await trx.save();

                if (trx.type === 'buy_panel') {
                    const { username_panel, product_code } = trx.product_data;
                    await processPanelCreation(user, username_panel, product_code, trx.order_id);
                    logActivity('PEMBAYARAN SUKSES (PANEL)', user, `Order ID: ${order_id}`);
                }
                else if (trx.type === 'buy_murid') {
                    await processMuridPurchase(user, trx.product_data.product_code, trx.order_id);
                    logActivity('PEMBAYARAN SUKSES (MURID)', user, `Order ID: ${order_id}`);
                }
                else if (trx.type === 'buy_vps') {
                    await processVPSPurchase(user, trx.product_data.product_code, trx.order_id);
                    logActivity('PEMBAYARAN SUKSES (VPS)', user, `Order ID: ${order_id}`);
                }
                else if (trx.type === 'buy_app') {
                    await processAppPurchase(user, trx.product_data.product_code, trx.order_id);
                    logActivity('PEMBAYARAN SUKSES (APP)', user, `Order ID: ${order_id}`);
                }
                else if (trx.type === 'buy_sosmed') {
    try {
        const payloadOrder = new URLSearchParams();
        payloadOrder.append('api_id', MEDANPEDIA_ID);
        payloadOrder.append('api_key', MEDANPEDIA_KEY);
        payloadOrder.append('service', trx.product_data.service_id);
        payloadOrder.append('target', trx.product_data.target);
        payloadOrder.append('quantity', trx.product_data.qty);
        
        await axios.post('https://api.medanpedia.co.id/order', payloadOrder);
        
        // ---> TAMBAHKAN KODE INI <---
        const trxDate = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
        const totalSukses = await Transaction.countDocuments({ status: 'success' });
        await sendTrxNotifications({
            user: user, orderId: order_id, productName: trx.product_data.product_name,
            amount: trx.amount.toLocaleString('id-ID'), trxDate: trxDate, totalSukses: totalSukses,
            type: 'SMM', sendWhatsApp: sendWhatsApp, sock: sock,
            extraData: { target: trx.product_data.target, qty: trx.product_data.qty, status: 'Proses' }
        });
        // -----------------------------

        logActivity('PEMBAYARAN SUKSES (SOSMED)', user, `Order ID: ${order_id}`);
    } catch(err) {
        console.log("Gagal tembak pusat setelah bayar QRIS:", err.message);
    }
}
                else if (trx.type === 'buy_game') {
    try {
        const { game, product_code, target } = trx.product_data;
        if (game === 'freefire') {
            const refID = Date.now().toString().slice(-8);
            const okeUrl = `${OKE_URL}?memberID=${OKE_MEMBER_ID}&pin=${OKE_PIN}&password=${encodeURIComponent(process.env.OKE_PASSWORD)}&product=${product_code}&dest=${target}&refID=${refID}`;
            
            const okeResponse = await axios.get(okeUrl);
            const responseText = okeResponse.data;

            trx.provider_oid = refID;
            trx.product_data.provider_message = responseText;
            await trx.save();

            // ---> TAMBAHKAN KODE INI <---
            await processGamePurchase(user, {
                game: game,
                product_code: product_code,
                product_name: trx.product_data.product_name,
                target: target,
                price: trx.amount,
                provider_ref_id: refID,
                provider_message: responseText
            }, order_id);
            // -----------------------------

            logActivity('PEMBAYARAN SUKSES (GAME QRIS)', user, `Order ID: ${order_id}`);
        }
    } catch(err) {
        console.log("Gagal proses game setelah bayar QRIS:", err.message);
    }
}
                else if (trx.type === 'buy_ewallet') {
                    try {
                        const { product_code, target, product_name } = trx.product_data;
                        let cleanTarget = target.replace(/[^0-9]/g, '');
                        if (cleanTarget.startsWith('62') && cleanTarget.length >= 10) cleanTarget = '0' + cleanTarget.slice(2);
                        const refID = Date.now().toString().slice(-8);
                        const okeUrl = `${OKE_URL}?memberID=${OKE_MEMBER_ID}&pin=${OKE_PIN}&password=${encodeURIComponent(process.env.OKE_PASSWORD)}&product=${product_code}&dest=${cleanTarget}&refID=${refID}`;
                        
                        const okeResponse = await axios.get(okeUrl);
                        const responseText = okeResponse.data;
                        const respUpper = responseText.toUpperCase();
                        if (respUpper.includes('PROSES') || respUpper.includes('SUKSES') || respUpper.includes('BERHASIL')) {
                            trx.provider_oid = refID;
                            trx.product_data.provider_message = responseText;
                            await trx.save();
                            await processEWalletPurchase(user, {
                                provider: 'dana',
                                product_code: product_code,
                                product_name: product_name,
                                target: cleanTarget,
                                price: trx.amount,
                                provider_ref_id: refID,
                                provider_message: responseText
                            }, order_id);

                            logActivity('PEMBAYARAN SUKSES (EWALLET QRIS)', user, `Order ID: ${order_id}`);
                        } else {
                            console.log("Gagal proses E-Wallet QRIS ke Pusat:", responseText);
                        }
                    } catch(err) {
                        console.log("Gagal proses ewallet setelah bayar QRIS:", err.message);
                    }
                }
                else if (trx.type === 'buy_script') {
                    await processScriptPurchase(user, trx.product_data.product_code, trx.order_id);
                }
                else if (trx.type === 'transfer_qris') {
                    const { sender, recipient, sender_name, recipient_name } = trx.product_data;
                    
                    const senderUser = await User.findOne({ username: sender });
                    const recipientUser = await User.findOne({ username: recipient });

                    if (senderUser && recipientUser) {
                        senderUser.balance -= trx.amount;
                        await senderUser.save();

                        recipientUser.balance += trx.amount;
                        await recipientUser.save();

                        trx.status = 'success';
                        await trx.save();

                        const senderTrx = new Transaction({
                            order_id: `TRF-OUT-${Date.now()}`,
                            username: sender,
                            fullname: sender_name,
                            amount: trx.amount,
                            pay_amount: trx.amount,
                            status: 'success',
                            type: 'transfer_out',
                            product_data: {
                                recipient: recipient,
                                recipient_name: recipient_name,
                                method: 'qris'
                            },
                            date: new Date()
                        });
                        await senderTrx.save();

                        const recipientTrx = new Transaction({
                            order_id: `TRF-IN-${Date.now()}`,
                            username: recipient,
                            fullname: recipient_name,
                            amount: trx.amount,
                            pay_amount: trx.amount,
                            status: 'success',
                            type: 'transfer_in',
                            product_data: {
                                sender: sender,
                                sender_name: sender_name,
                                method: 'qris'
                            },
                            date: new Date()
                        });
                        await recipientTrx.save();

                        await sendTransferNotification({
                            sender: senderUser,
                            recipient: recipientUser,
                            amount: trx.amount,
                            sock: sock
                        });

                        logActivity('TRANSFER QRIS', senderUser, `Transfer ke ${recipient}: Rp ${trx.amount}`);
                        logActivity('PENERIMAAN QRIS', recipientUser, `Dari ${sender}: Rp ${trx.amount}`);

                        return res.json({ success: true, status: 'success' });
                    }
                }
                else if (trx.type === 'buy_subdomain') {
                    const { subdomain, ip_address, zone_id, zone_name, proxy_status, price } = trx.product_data;
                    await processSubdomainPurchase(user, {
                        subdomain, ip_address, zone_id, zone_name, proxy_status, price
                    }, trx.order_id);
                }
                else {
                    const depositAmount = parseInt(trx.amount);
                    user.balance += depositAmount;
                    await user.save();
                    
                    await sendDepositNotification({
                        username: trx.username,
                        phone: user.phone,
                        amount: depositAmount,
                        newBalance: user.balance,
                        sock: sock
                    });
                    
                    if(TELEGRAM_OWNER_ID) {
                        const msgTele = `🔔 DEPOSIT MASUK\nUser: ${trx.username}\nJumlah: Rp ${depositAmount.toLocaleString('id-ID')}\nSaldo: Rp ${user.balance.toLocaleString('id-ID')}`;
                        axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                            chat_id: TELEGRAM_OWNER_ID, text: msgTele
                        }).catch(()=>{});
                    }
                    
                    logActivity('DEPOSIT SUKSES', user, `Masuk: ${trx.amount}`);
                }
                
                return res.json({ success: true, status: 'success' });
            }
        }
        res.json({ success: true, status: 'pending' });

    } catch (e) {
        console.log("Cek Pembayaran: Transaksi tidak ditemukan di Gateway.");
        res.json({ success: false, message: "Gagal cek status gateway" });
    }
});

app.post('/api/claim-warranty', async (req, res) => {
    const { token, warranty_code, new_username } = req.body;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        if(!user) return res.json({ success: false, message: "User invalid" });

        const panel = await Panel.findOne({ warranty_code });
        if(!panel) return res.json({ success: false, message: "Kode Garansi tidak ditemukan!" });

        if(panel.username_owner !== user.username) return res.json({ success: false, message: "Bukan milik Anda!" });
        if(panel.warranty_used) return res.json({ success: false, message: "Garansi sudah pernah dipakai!" });

        const createDate = new Date(panel.created_at);
        const now = new Date();
        const diffTime = Math.abs(now - createDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if(diffDays > 15) return res.json({ success: false, message: "Masa garansi (15 hari) habis!" });
        
        try {
            const checkServer = await axios.get(`${PTERO_URL}/api/application/servers/${panel.id}`, { headers: PTERO_HEADERS });
            if (checkServer.data && checkServer.data.attributes) {
                const serverInfo = checkServer.data.attributes;
                if (!serverInfo.suspended) {
                    return res.json({
                        success: false,
                        message: `Gagal! Panel dengan Kode Garansi ${warranty_code} terdeteksi MASIH AKTIF di server. Garansi hanya untuk panel yang mati/hilang.`
                    });
                }
            }
        } catch (err) {}

        await actionServer(panel.id, 'delete');
        panel.status = 'deleted';
        await panel.save();
        
        const randomDigits = Math.floor(1000 + Math.random() * 9000);
        const passwordPanel = `${new_username}${randomDigits}`;
        const emailPanel = `${new_username}@warranty.com`;
        
        let pteroUserId = await createPteroUser(new_username, emailPanel, passwordPanel);
        if(!pteroUserId) {
            const checkUser = await axios.get(`${PTERO_URL}/api/application/users?filter[email]=${emailPanel}`, { headers: PTERO_HEADERS });
            if(checkUser.data.data.length > 0) pteroUserId = checkUser.data.data[0].attributes.id;
        }

        const expStr = new Date(panel.expired_at).toLocaleDateString('id-ID');
        const serverData = await createPteroServer(pteroUserId, `${new_username} - CLAIMED`, panel.spec.ram, panel.spec.disk, panel.spec.cpu, expStr);

        panel.warranty_used = true;
        await panel.save();
        
        const newPanelObj = new Panel({
            id: serverData.id,
            uuid: serverData.uuid,
            username_owner: user.username,
            username_panel: new_username,
            password_panel: passwordPanel,
            domain: PTERO_URL,
            product: panel.product,
            spec: panel.spec,
            price: 0,
            created_at: new Date(),
            expired_at: panel.expired_at,
            warranty_code: "CLAIMED-" + warranty_code,
            warranty_used: true,
            status: 'active',
            product_code: panel.product_code,
            product_name: panel.product_name
        });
        await newPanelObj.save();

        const msgWA = `✅ KLAIM GARANSI SUKSES\nPanel Baru: ${new_username}\nPass: ${passwordPanel}\nLogin: ${PTERO_URL}`;
        sendWhatsApp(user.phone, msgWA);

        logActivity('KLAIM GARANSI', user, `Code: ${warranty_code} -> New: ${new_username}`);

        res.json({ success: true, message: "Panel pengganti berhasil dibuat!" });

    } catch(e) {
        console.log(e);
        res.json({ success: false, message: "Gagal klaim garansi." });
    }
});

app.post('/api/history', async (req, res) => {
    const { token } = req.body;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const expireLimitDate = new Date(Date.now() - (5 * 60 * 1000));
        await Transaction.updateMany({
            username: decoded.username,
            status: 'pending',
            date: { $lt: expireLimitDate }
        }, {
            $set: { status: 'expired' }
        });
        const batasTujuhHari = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
        let userTrx = await Transaction.find({ 
            username: decoded.username,
            date: { $gte: batasTujuhHari }
        });
        
        userTrx = userTrx.filter(t => {
            if (t.status === 'success' && (t.type === 'transfer_qris' || t.type === 'transfer_personal')) {
                return false;
            }
            return true;
        });
        
        userTrx.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json({ success: true, data: userTrx });
    } catch (e) {
        console.log(e);
        res.json({ success: false });
    }
});

app.post('/api/cancel-transaction', async (req, res) => {
    const { order_id } = req.body;
    const trx = await Transaction.findOne({ order_id });
    
    if (trx && trx.status === 'pending') {
        trx.status = 'canceled';
        await trx.save();
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

app.post('/api/update-profile', async (req, res) => {
    const { token, fullname, phone, profile_img, banner_img } = req.body;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        if (!user) return res.json({ success: false, message: "User tidak ditemukan" });
        
        const NOW = Date.now();
        const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
        
        if (fullname && fullname !== user.fullname) {
            if (user.last_name_change && (NOW - user.last_name_change) < ONE_WEEK) {
                return res.json({ success: false, message: `Ganti nama tunggu 7 hari.` });
            }
            user.fullname = xss(fullname);
            user.last_name_change = NOW;
        }
        
        if (phone) user.phone = xss(phone).replace(/[^0-9]/g, '');
        if (profile_img) user.profile_img = profile_img;
        if (banner_img) user.banner_img = banner_img;
        
        await user.save();
        
        const safeUser = user.toObject();
        delete safeUser.password;
        
        res.json({ success: true, message: "Profil berhasil disimpan", user: safeUser });
    } catch (e) {
        console.log(e);
        res.json({ success: false, message: "Error Server" });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        const totalMember = await User.countDocuments();
        const totalSukses = await Transaction.countDocuments({ status: 'success' });
        const uptimeSeconds = process.uptime();
        const hours = Math.floor(uptimeSeconds / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const uptimeStr = `${hours}j ${minutes}m`;
        const totalVisitor = (totalMember * 5) + (totalSukses * 2) + 120;

        res.json({
            success: true,
            visitor: totalVisitor,
            member: totalMember,
            sukses: totalSukses,
            uptime: uptimeStr
        });
    } catch (e) {
        console.log(e);
        res.json({ success: false });
    }
});

app.post('/api/rekap', async (req, res) => {
    const { token } = req.body;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        if(!user) return res.json({ success: false });

        const myTrx = await Transaction.find({
            username: user.username,
            status: 'success'
        });
        
        const totalIn = myTrx
            .filter(t => t.type === 'deposit')
            .reduce((a,b)=>a+parseInt(b.amount),0);
            
        const totalOut = myTrx
            .filter(t => t.type !== 'deposit')
            .reduce((a,b)=>a+parseInt(b.amount),0);
            
        const countTrx = myTrx.length;

        const chartLabels = [];
        const chartDataIn = [];
        const chartDataOut = [];
        
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
            chartLabels.push(dayName);
            
            const trxToday = myTrx.filter(t => new Date(t.date).toISOString().split('T')[0] === dateStr);
            const sumIn = trxToday
                .filter(t => t.type === 'deposit')
                .reduce((a,b)=>a+parseInt(b.amount),0);
            const sumOut = trxToday
                .filter(t => t.type !== 'deposit')
                .reduce((a,b)=>a+parseInt(b.amount),0);
            
            chartDataIn.push(sumIn);
            chartDataOut.push(sumOut);
        }

        res.json({
            success: true,
            balance: user.balance,
            total_in: totalIn,
            total_out: totalOut,
            trx_count: countTrx,
            chart: {
                labels: chartLabels,
                data_in: chartDataIn,
                data_out: chartDataOut
            }
        });

    } catch(e) {
        console.log(e);
        res.json({ success: false });
    }
});

app.get('/api/get-broadcasts', async (req, res) => {
    const broadcasts = await Broadcast.find().sort({ date: -1 });
    res.json({ success: true, data: broadcasts });
});

app.get('/api/public/latest-trx', async (req, res) => {
    try {
        const successTrx = await Transaction.find({
            status: 'success',
            type: { $nin: ['transfer_in', 'transfer_qris'] }
        })
        .sort({ date: -1 })
        .limit(3);
            
        const publicData = successTrx.map(t => {
            let itemName = '-';
            if (t.type === 'buy_panel') {
                itemName = (t.product_data && t.product_data.product_name) ? t.product_data.product_name : 'Panel';
            }
            else if (t.type === 'transfer_out' || t.type === 'transfer_personal') {
                itemName = 'Transfer Saldo';
            }
            else {
                itemName = 'Rp ' + parseInt(t.amount).toLocaleString('id-ID');
            }

            let txName = t.fullname || t.username || 'User';
            if (t.type === 'transfer_personal') txName = 'Seseorang';

            return {
                name: txName,
                type: t.type === 'transfer_personal' ? 'transfer_out' : t.type,
                item: itemName,
                time: t.date
            };
        });

        res.json({ success: true, data: publicData });

    } catch (e) {
        console.log(e);
        res.json({ success: false, data: [] });
    }
});

app.get('/api/public/activity', async (req, res) => {
    try {
        const successTrx = await Transaction.find({
            status: 'success',
            type: { $nin: ['transfer_in', 'transfer_qris'] }
        }).sort({ date: -1 }).limit(100);
        
        const activities = successTrx.map(t => {
            let itemName = '-';
            let txName = t.fullname || t.username || 'Seseorang';
            let txType = t.type;

            if (t.type === 'buy_panel') {
                const pName = (t.product_data && t.product_data.product_name) ? t.product_data.product_name : 'Panel';
                itemName = `Panel ${pName}`;
            }
            else if (t.type === 'extend_panel') {
                const pName = (t.product_data && t.product_data.product_name) ? t.product_data.product_name.replace('Perpanjang ', '') : 'Panel';
                itemName = `Perpanjangan Panel ${pName}`;
            }
            else if (t.type === 'buy_script') {
                const sName = (t.product_data && t.product_data.product_name) ? t.product_data.product_name : 'Script';
                itemName = `Script ${sName}`;
            }
            else if (t.type === 'buy_murid') {
                const mName = (t.product_data && t.product_data.product_name) ? t.product_data.product_name : 'Kelas';
                itemName = `Join ${mName}`;
            }
            else if (t.type === 'buy_vps') {
                const vName = (t.product_data && t.product_data.product_name) ? t.product_data.product_name : 'VPS';
                itemName = `VPS ${vName}`;
            }
            else if (t.type === 'buy_app') {
                const aName = (t.product_data && t.product_data.product_name) ? t.product_data.product_name : 'App Premium';
                itemName = `Akun ${aName}`;
            }
            else if (t.type === 'buy_sosmed') {
                const sName = (t.product_data && t.product_data.product_name) ? t.product_data.product_name : 'Layanan Sosmed';
                itemName = sName;
            }
            else if (t.type === 'buy_subdomain') {
                const zName = (t.product_data && t.product_data.zone_name) ? t.product_data.zone_name : '';
                itemName = zName ? `Domain ${zName}` : `Subdomain Premium`;
            }
            else if (t.type === 'buy_ewallet') {
                const eName = (t.product_data && t.product_data.product_name) ? t.product_data.product_name : 'E-Wallet';
                itemName = `${eName}`;
            }
            else if (t.type === 'buy_nokos') {
                const nName = (t.product_data && t.product_data.layanan_nama) ? t.product_data.layanan_nama : 'Nokos';
                itemName = `Nokos ${nName}`;
            }
            else if (t.type === 'transfer_out') {
                const recipient = (t.product_data && t.product_data.recipient) ? t.product_data.recipient : 'seseorang';
                itemName = `Transfer Rp ${parseInt(t.amount).toLocaleString('id-ID')} ke @${recipient}`;
            }
            else if (t.type === 'transfer_personal') {
                const recipient = t.username;
                txName = 'Seseorang';
                txType = 'transfer_out';
                itemName = `Transfer Rp ${parseInt(t.amount).toLocaleString('id-ID')} ke @${recipient}`;
            }
            else {
                itemName = `Saldo Rp ${parseInt(t.amount).toLocaleString('id-ID')}`;
            }
            
            return {
                id: t.order_id,
                type: 'transaction',
                trx_type: txType,
                name: txName,
                desc: itemName,
                time: new Date(t.date).getTime()
            };
        });

        const adminBroadcasts = await Broadcast.find().sort({ date: -1 }).limit(50);
        const broadcastItems = adminBroadcasts.map(b => ({
            id: b.id,
            type: 'broadcast',
            level: b.type,
            desc: b.message,
            time: b.date || Date.now()
        }));

        const combined = [...activities, ...broadcastItems];
        combined.sort((a, b) => b.time - a.time);
        res.json({ success: true, data: combined.slice(0, 100) });

    } catch (e) {
        console.log("Error public activity:", e);
        res.json({ success: false, data: [] });
    }
});

app.post('/api/buy-script', async (req, res) => {
    const { token, script_code, method } = req.body;
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        if (!user) return res.json({ success: false, message: "User tidak ditemukan" });
        
        const scripts = getScripts();
        const selectedScript = scripts.find(s => s.code === script_code);
        if (!selectedScript) return res.json({ success: false, message: "Script tidak valid!" });
        
        if (user.purchased_scripts && user.purchased_scripts.find(s => s.code === script_code)) {
            return res.json({ success: false, message: "Anda sudah memiliki script ini!" });
        }

        const nominal = selectedScript.price;
        
        let finalAmount = nominal;
        let appliedPromoCode = null;

        if (req.body.promo_code) {
            if (method === 'qris') {
                return res.json({
                    success: false,
                    message: "Mohon maaf promo ini hanya bisa di beli menggunakan pembayaran saldo tidak berlaku di pembayaran qris"
                });
            }
            
            const promo = await Promo.findOne({ code: req.body.promo_code.toUpperCase(), status: true });
            if (promo) {
                const userUsage = await PromoUsage.countDocuments({ promo_code: promo.code, username: user.username });
                if (userUsage < promo.per_user_limit) {
                    const now = new Date();
                    if (now >= promo.start_date && (!promo.end_date || now <= promo.end_date)) {
                        
                        let discount = promo.discount_type === 'percentage'
                            ? Math.floor(nominal * promo.discount_value / 100)
                            : promo.discount_value;
                            
                        if (promo.max_discount && discount > promo.max_discount) discount = promo.max_discount;
                        if (discount > nominal) discount = nominal;
                        
                        finalAmount = nominal - discount;
                        appliedPromoCode = promo.code;
                        
                        promo.used_count += 1;
                        await promo.save();
                        
                        await new PromoUsage({
                            promo_code: promo.code,
                            username: user.username,
                            order_id: "PROMO-" + Date.now()
                        }).save();
                    }
                }
            }
        }

        if (method === 'saldo') {
            if (user.balance < finalAmount) return res.json({ success: false, message: "Saldo tidak cukup!" });
            
            user.balance -= finalAmount;
            
            const poinPanel = Math.floor(finalAmount / 10000); 
            if (poinPanel > 0) {
                user.points = (user.points || 0) + poinPanel;
            }
            
            await user.save();
            
            const order_id = "SC-" + Date.now();
            
            const transaction = new Transaction({
                order_id: order_id,
                username: user.username,
                fullname: user.fullname,
                amount: nominal,
                pay_amount: finalAmount,
                status: 'success',
                type: 'buy_script',
                product_data: { product_code: selectedScript.code, product_name: selectedScript.name },
                qr_string: '-',
                date: new Date()
            });
            await transaction.save();

            await processScriptPurchase(user, script_code, order_id);

            return res.json({ success: true, message: "Pembelian berhasil!", type: 'instant' });
        }
        else if (method === 'qris') {
            const order_id = "SC-" + Date.now();
            const amountToSend = finalAmount + parseInt(process.env.ADMIN_FEE || 0);
            
            const response = await axios.post('https://app.pakasir.com/api/transactioncreate/qris', {
                project: PAKASIR_SLUG, order_id: order_id, amount: amountToSend, api_key: PAKASIR_API_KEY
            });

            if (response.data && response.data.payment) {
                const payData = response.data.payment;
                const realAmount = payData.total_payment ? parseInt(payData.total_payment) : amountToSend;

                const transaction = new Transaction({
                    order_id: order_id,
                    username: user.username,
                    fullname: user.fullname,
                    amount: nominal,
                    pay_amount: realAmount,
                    status: 'pending',
                    type: 'buy_script',
                    product_data: { product_code: selectedScript.code, product_name: selectedScript.name },
                    qr_string: payData.payment_number,
                    date: new Date()
                });
                await transaction.save();
                
                logActivity('ORDER SCRIPT (QRIS)', user, `Pending: ${selectedScript.name}`);
                
                return res.json({ success: true, type: 'qris', qr_string: payData.payment_number, order_id, amount: nominal, pay_amount: realAmount });
            } else {
                return res.json({ success: false, message: "Gagal generate QRIS" });
            }
        }
    } catch (e) {
        console.log(e);
        res.json({ success: false, message: "Error Server" });
    }
});

app.post('/api/buy-murid', async (req, res) => {
    const { token, murid_code, method } = req.body;
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        if (!user) return res.json({ success: false, message: "User tidak ditemukan" });
        
        const listMurid = getMurid();
        const selected = listMurid.find(s => s.code === murid_code);
        if (!selected) return res.json({ success: false, message: "Paket tidak valid!" });
    
        if (user.joined_murid && user.joined_murid.find(m => m.code === murid_code)) {
            return res.json({ success: false, message: "Anda sudah bergabung di kelas ini!" });
        }
        
        const nominal = selected.price;
        
        let finalAmount = nominal;
        let appliedPromoCode = null;

        if (req.body.promo_code) {
            if (method === 'qris') {
                return res.json({
                    success: false,
                    message: "Mohon maaf promo ini hanya bisa di beli menggunakan pembayaran saldo tidak berlaku di pembayaran qris"
                });
            }
            
            const promo = await Promo.findOne({ code: req.body.promo_code.toUpperCase(), status: true });
            if (promo) {
                const userUsage = await PromoUsage.countDocuments({ promo_code: promo.code, username: user.username });
                if (userUsage < promo.per_user_limit) {
                    const now = new Date();
                    if (now >= promo.start_date && (!promo.end_date || now <= promo.end_date)) {
                        
                        let discount = promo.discount_type === 'percentage'
                            ? Math.floor(nominal * promo.discount_value / 100)
                            : promo.discount_value;
                            
                        if (promo.max_discount && discount > promo.max_discount) discount = promo.max_discount;
                        if (discount > nominal) discount = nominal;
                        
                        finalAmount = nominal - discount;
                        appliedPromoCode = promo.code;
                        
                        promo.used_count += 1;
                        await promo.save();
                        
                        await new PromoUsage({
                            promo_code: promo.code,
                            username: user.username,
                            order_id: "PROMO-" + Date.now()
                        }).save();
                    }
                }
            }
        }

        if (method === 'saldo') {
            if (user.balance < finalAmount) return res.json({ success: false, message: "Saldo tidak cukup!" });
            
            user.balance -= finalAmount;
            
            const poinPanel = Math.floor(finalAmount / 10000); 
            if (poinPanel > 0) {
                user.points = (user.points || 0) + poinPanel;
            }
            
            await user.save();
            
            const order_id = "MRD-" + Date.now();
            
            const transaction = new Transaction({
                order_id: order_id,
                username: user.username,
                fullname: user.fullname,
                amount: nominal,
                pay_amount: finalAmount,
                status: 'success',
                type: 'buy_murid',
                product_data: { product_code: selected.code, product_name: selected.name },
                qr_string: '-',
                date: new Date()
            });
            await transaction.save();

            await processMuridPurchase(user, murid_code, order_id);
            return res.json({ success: true, message: "Berhasil Join Murid!", type: 'instant' });
        }
        else if (method === 'qris') {
            const order_id = "MRD-" + Date.now();
            const amountToSend = finalAmount + parseInt(process.env.ADMIN_FEE || 0);
            
            const response = await axios.post('https://app.pakasir.com/api/transactioncreate/qris', {
                project: PAKASIR_SLUG, order_id: order_id, amount: amountToSend, api_key: PAKASIR_API_KEY
            });

            if (response.data && response.data.payment) {
                const payData = response.data.payment;
                const realAmount = payData.total_payment ? parseInt(payData.total_payment) : amountToSend;

                const transaction = new Transaction({
                    order_id: order_id,
                    username: user.username,
                    fullname: user.fullname,
                    amount: nominal,
                    pay_amount: realAmount,
                    status: 'pending',
                    type: 'buy_murid',
                    product_data: { product_code: selected.code, product_name: selected.name },
                    qr_string: payData.payment_number,
                    date: new Date()
                });
                await transaction.save();
                
                logActivity('ORDER MURID (QRIS)', user, `Pending: ${selected.name}`);
                return res.json({ success: true, type: 'qris', qr_string: payData.payment_number, order_id, amount: nominal, pay_amount: realAmount });
            } else {
                return res.json({ success: false, message: "Gagal generate QRIS" });
            }
        }
    } catch (e) {
        console.log(e);
        res.json({ success: false, message: "Error Server" });
    }
});

app.post('/api/buy-vps', async (req, res) => {
    const { token, vps_code, method } = req.body;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        if (!user) return res.json({ success: false, message: "User invalid" });

        const listVPS = getVPS();
        const selected = listVPS.find(s => s.code === vps_code);
        if (!selected) return res.json({ success: false, message: "Paket Invalid" });

        const nominal = selected.price;
        
        let finalAmount = nominal;
        let appliedPromoCode = null;

        if (req.body.promo_code) {
            if (method === 'qris') {
                return res.json({
                    success: false,
                    message: "Mohon maaf promo ini hanya bisa di beli menggunakan pembayaran saldo tidak berlaku di pembayaran qris"
                });
            }
            
            const promo = await Promo.findOne({ code: req.body.promo_code.toUpperCase(), status: true });
            if (promo) {
                const userUsage = await PromoUsage.countDocuments({ promo_code: promo.code, username: user.username });
                if (userUsage < promo.per_user_limit) {
                    const now = new Date();
                    if (now >= promo.start_date && (!promo.end_date || now <= promo.end_date)) {
                        
                        let discount = promo.discount_type === 'percentage'
                            ? Math.floor(nominal * promo.discount_value / 100)
                            : promo.discount_value;
                            
                        if (promo.max_discount && discount > promo.max_discount) discount = promo.max_discount;
                        if (discount > nominal) discount = nominal;
                        
                        finalAmount = nominal - discount;
                        appliedPromoCode = promo.code;
                        
                        promo.used_count += 1;
                        await promo.save();
                        
                        await new PromoUsage({
                            promo_code: promo.code,
                            username: user.username,
                            order_id: "PROMO-" + Date.now()
                        }).save();
                    }
                }
            }
        }

        if (method === 'saldo') {
            if (user.balance < finalAmount) return res.json({ success: false, message: "Saldo kurang!" });
            
            user.balance -= finalAmount;
            
            const poinPanel = Math.floor(finalAmount / 10000); 
            if (poinPanel > 0) {
                user.points = (user.points || 0) + poinPanel;
            }
            
            await user.save();

            const order_id = "VPS-" + Date.now();
            
            const transaction = new Transaction({
                order_id,
                username: user.username,
                fullname: user.fullname,
                amount: nominal,
                pay_amount: finalAmount,
                status: 'success',
                type: 'buy_vps',
                product_data: { product_code: selected.code, product_name: selected.name },
                qr_string: '-',
                date: new Date()
            });
            await transaction.save();

            await processVPSPurchase(user, vps_code, order_id);
            return res.json({ success: true, message: "Order VPS Sukses!", type: 'instant' });
        }
        
        else if (method === 'qris') {
            const order_id = "VPS-" + Date.now();
            const amountToSend = finalAmount + parseInt(process.env.ADMIN_FEE || 0);
            const response = await axios.post('https://app.pakasir.com/api/transactioncreate/qris', {
                project: PAKASIR_SLUG, order_id, amount: amountToSend, api_key: PAKASIR_API_KEY
            });
            
            if (response.data && response.data.payment) {
                const payData = response.data.payment;
                const realAmount = payData.total_payment ? parseInt(payData.total_payment) : amountToSend;
                
                const transaction = new Transaction({
                    order_id,
                    username: user.username,
                    fullname: user.fullname,
                    amount: nominal,
                    pay_amount: realAmount,
                    status: 'pending',
                    type: 'buy_vps',
                    product_data: { product_code: selected.code, product_name: selected.name },
                    qr_string: payData.payment_number,
                    date: new Date()
                });
                await transaction.save();
                
                return res.json({ success: true, type: 'qris', qr_string: payData.payment_number, order_id, amount: nominal, pay_amount: realAmount });
            } else {
                return res.json({ success: false, message: "Gagal QRIS" });
            }
        }
    } catch(e) {
        console.log(e);
        res.json({ success: false, message: "Error Server" });
    }
});

app.get('/api/apps', (req, res) => {
    const raw = getApps();
    const publicData = raw.map(a => ({
        code: a.code,
        name: a.name,
        price: a.price,
        icon: a.icon,
        stock_count: a.stock.length
    }));
    res.json({ success: true, data: publicData });
});

app.post('/api/buy-app', async (req, res) => {
    const { token, app_code, method } = req.body;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        if (!user) return res.json({ success: false, message: "User invalid" });

        const listApps = getApps();
        const selected = listApps.find(a => a.code === app_code);
        
        if (!selected) return res.json({ success: false, message: "Produk invalid" });
        if (selected.stock.length === 0) return res.json({ success: false, message: "Stok Habis, tunggu restock admin!" });

        const nominal = selected.price;
        
        let finalAmount = nominal;
        let appliedPromoCode = null;

        if (req.body.promo_code) {
            if (method === 'qris') {
                return res.json({
                    success: false,
                    message: "Mohon maaf promo ini hanya bisa di beli menggunakan pembayaran saldo tidak berlaku di pembayaran qris"
                });
            }
            
            const promo = await Promo.findOne({ code: req.body.promo_code.toUpperCase(), status: true });
            if (promo) {
                const userUsage = await PromoUsage.countDocuments({ promo_code: promo.code, username: user.username });
                if (userUsage < promo.per_user_limit) {
                    const now = new Date();
                    if (now >= promo.start_date && (!promo.end_date || now <= promo.end_date)) {
                        
                        let discount = promo.discount_type === 'percentage'
                            ? Math.floor(nominal * promo.discount_value / 100)
                            : promo.discount_value;
                            
                        if (promo.max_discount && discount > promo.max_discount) discount = promo.max_discount;
                        if (discount > nominal) discount = nominal;
                        
                        finalAmount = nominal - discount;
                        appliedPromoCode = promo.code;
                        
                        promo.used_count += 1;
                        await promo.save();
                        
                        await new PromoUsage({
                            promo_code: promo.code,
                            username: user.username,
                            order_id: "PROMO-" + Date.now()
                        }).save();
                    }
                }
            }
        }

        if (method === 'saldo') {
            if (user.balance < finalAmount) return res.json({ success: false, message: "Saldo kurang" });

            user.balance -= finalAmount;
            
            const poinPanel = Math.floor(finalAmount / 10000); 
            if (poinPanel > 0) {
                user.points = (user.points || 0) + poinPanel;
            }
            
            await user.save();

            const order_id = "APP-" + Date.now();
            
            const processResult = await processAppPurchase(user, app_code, order_id);

            if (processResult.success) {
                const transaction = new Transaction({
                    order_id,
                    username: user.username,
                    fullname: user.fullname,
                    amount: nominal,
                    pay_amount: finalAmount,
                    status: 'success',
                    type: 'buy_app',
                    product_data: { product_code: selected.code, product_name: selected.name },
                    qr_string: '-',
                    date: new Date()
                });
                await transaction.save();
                return res.json({ success: true, message: "Pembelian Sukses!", type: 'instant' });
            } else {
                user.balance += finalAmount;
                await user.save();
                return res.json({ success: false, message: processResult.msg || "Gagal memproses stok." });
            }
        }
        else if (method === 'qris') {
            const order_id = "APP-" + Date.now();
            const amountToSend = finalAmount + parseInt(process.env.ADMIN_FEE || 0);
            const response = await axios.post('https://app.pakasir.com/api/transactioncreate/qris', {
                project: PAKASIR_SLUG, order_id, amount: amountToSend, api_key: PAKASIR_API_KEY
            });
            
            if (response.data && response.data.payment) {
                const payData = response.data.payment;
                const realAmount = payData.total_payment ? parseInt(payData.total_payment) : amountToSend;
                
                const transaction = new Transaction({
                    order_id,
                    username: user.username,
                    fullname: user.fullname,
                    amount: nominal,
                    pay_amount: realAmount,
                    status: 'pending',
                    type: 'buy_app',
                    product_data: { product_code: selected.code, product_name: selected.name },
                    qr_string: payData.payment_number,
                    date: new Date()
                });
                await transaction.save();
                
                return res.json({ success: true, type: 'qris', qr_string: payData.payment_number, order_id, amount: nominal, pay_amount: realAmount });
            }
        }
    } catch(e) {
        console.log(e);
        res.json({ success: false, message: "Error Server" });
    }
});

app.get('/api/sosmed/services', async (req, res) => {
    try {
        const payload = new URLSearchParams();
        payload.append('api_id', MEDANPEDIA_ID);
        payload.append('api_key', MEDANPEDIA_KEY);

        const response = await axios.post('https://api.medanpedia.co.id/services', payload);
        
        if (response.data.status) {
            const filtered = response.data.data.filter(s => s.type === 'default');
            
            const services = filtered.map(s => {
                const markup = s.price + (s.price * SOSMED_PROFIT_PERCENT / 100);
                return {
                    id: s.id,
                    name: s.name,
                    category: s.category,
                    price: Math.ceil(markup),
                    min: s.min,
                    max: s.max,
                    desc: s.description
                };
            });
            res.json({ success: true, data: services });
        } else {
            res.json({ success: false, message: "Gagal mengambil data layanan." });
        }
    } catch (e) {
        console.log(e);
        res.json({ success: false, message: "Error koneksi ke provider." });
    }
});

app.post('/api/buy-sosmed', async (req, res) => {
    const { token, service_id, target, quantity, method } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        if (!user) return res.json({ success: false, message: "User tidak ditemukan" });

        const payloadCheck = new URLSearchParams();
        payloadCheck.append('api_id', MEDANPEDIA_ID);
        payloadCheck.append('api_key', MEDANPEDIA_KEY);
        const resServices = await axios.post('https://api.medanpedia.co.id/services', payloadCheck);
        
        if (!resServices.data.status) return res.json({ success: false, message: "Gagal cek layanan pusat." });

        const serviceData = resServices.data.data.find(s => s.id == service_id);
        if (!serviceData) return res.json({ success: false, message: "Layanan tidak ditemukan/nonaktif." });

        if (quantity < serviceData.min) return res.json({ success: false, message: `Minimal order ${serviceData.min}` });
        if (quantity > serviceData.max) return res.json({ success: false, message: `Maksimal order ${serviceData.max}` });

        const basePrice = parseInt(serviceData.price);
        const markupPrice = basePrice + (basePrice * SOSMED_PROFIT_PERCENT / 100);
        const totalPrice = Math.ceil((markupPrice / 1000) * quantity);
        const nominal = totalPrice;
        
        let finalAmount = nominal;
        let appliedPromoCode = null;

        if (req.body.promo_code) {
            if (method === 'qris') {
                return res.json({
                    success: false,
                    message: "Mohon maaf promo ini hanya bisa di beli menggunakan pembayaran saldo tidak berlaku di pembayaran qris"
                });
            }
            
            const promo = await Promo.findOne({ code: req.body.promo_code.toUpperCase(), status: true });
            if (promo) {
                const userUsage = await PromoUsage.countDocuments({ promo_code: promo.code, username: user.username });
                if (userUsage < promo.per_user_limit) {
                    const now = new Date();
                    if (now >= promo.start_date && (!promo.end_date || now <= promo.end_date)) {
                        
                        let discount = promo.discount_type === 'percentage'
                            ? Math.floor(nominal * promo.discount_value / 100)
                            : promo.discount_value;
                            
                        if (promo.max_discount && discount > promo.max_discount) discount = promo.max_discount;
                        if (discount > nominal) discount = nominal;
                        
                        finalAmount = nominal - discount;
                        appliedPromoCode = promo.code;
                        
                        promo.used_count += 1;
                        await promo.save();
                        
                        await new PromoUsage({
                            promo_code: promo.code,
                            username: user.username,
                            order_id: "PROMO-" + Date.now()
                        }).save();
                    }
                }
            }
        }

        if (method === 'saldo') {
            if (user.balance < finalAmount) return res.json({ success: false, message: "Saldo tidak cukup!" });

            const payloadOrder = new URLSearchParams();
            payloadOrder.append('api_id', MEDANPEDIA_ID);
            payloadOrder.append('api_key', MEDANPEDIA_KEY);
            payloadOrder.append('service', service_id);
            payloadOrder.append('target', target);
            payloadOrder.append('quantity', quantity);

            const resOrder = await axios.post('https://api.medanpedia.co.id/order', payloadOrder);

            if (resOrder.data.status) {
                const providerOrderId = resOrder.data.data.id;
                
                user.balance -= finalAmount;
                
                const poinPanel = Math.floor(finalAmount / 10000); 
            if (poinPanel > 0) {
                user.points = (user.points || 0) + poinPanel;
            }
                
                await user.save();

                const order_id = "SOS-" + Date.now();
                
                const transaction = new Transaction({
                    order_id: order_id,
                    provider_oid: providerOrderId,
                    username: user.username,
                    fullname: user.fullname,
                    amount: totalPrice,
                    pay_amount: finalAmount,
                    status: 'success',
                    type: 'buy_sosmed',
                    product_data: {
                        product_name: serviceData.name,
                        target: target,
                        qty: quantity
                    },
                    qr_string: '-',
                    date: new Date()
                });
                await transaction.save();
                
                const trxDate = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
                const totalSukses = await Transaction.countDocuments({ status: 'success' }) + 1;

                await sendTrxNotifications({
                    user: user, orderId: order_id, productName: serviceData.name,
                    amount: totalPrice.toLocaleString('id-ID'), trxDate: trxDate, totalSukses: totalSukses,
                    type: 'SMM', sendWhatsApp: sendWhatsApp, sock: sock,
                    extraData: { target: target, qty: quantity, status: 'Proses' }
                });

                logActivity('ORDER SOSMED', user, `Item: ${serviceData.name} (${quantity})`);
                return res.json({ success: true, message: "Pesanan Sosmed Berhasil!", type: 'instant' });

            } else {
                return res.json({ success: false, message: "Gagal order ke pusat: " + (resOrder.data.msg || "Unknown Error") });
            }
        }
        else if (method === 'qris') {
            const order_id = "SOS-" + Date.now();
            const amountToSend = finalAmount + parseInt(process.env.ADMIN_FEE || 0);
            
            const response = await axios.post('https://app.pakasir.com/api/transactioncreate/qris', {
                project: PAKASIR_SLUG, order_id, amount: amountToSend, api_key: PAKASIR_API_KEY
            });

            if (response.data && response.data.payment) {
                const payData = response.data.payment;
                const realAmount = payData.total_payment ? parseInt(payData.total_payment) : amountToSend;
                
                const transaction = new Transaction({
                    order_id,
                    username: user.username,
                    fullname: user.fullname,
                    amount: totalPrice,
                    pay_amount: realAmount,
                    status: 'pending',
                    type: 'buy_sosmed',
                    product_data: {
                        service_id: service_id,
                        product_name: serviceData.name,
                        target: target,
                        qty: quantity,
                        base_price: totalPrice
                    },
                    qr_string: payData.payment_number,
                    date: new Date()
                });
                await transaction.save();

                logActivity('ORDER SOSMED (PENDING)', user, `Menunggu pembayaran QRIS`);

                return res.json({ success: true, type: 'qris', qr_string: payData.payment_number, order_id, amount: totalPrice, pay_amount: realAmount });
            } else {
                return res.json({ success: false, message: "Gagal membuat QRIS" });
            }
        }

    } catch (e) {
        console.log("Error buy-sosmed:", e);
        res.json({ success: false, message: "Error System" });
    }
});

app.post('/api/sosmed/check-status', async (req, res) => {
    const { token, provider_oid, order_id_local } = req.body;
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        if(!user) return res.json({ success: false });

        const payload = new URLSearchParams();
        payload.append('api_id', MEDANPEDIA_ID);
        payload.append('api_key', MEDANPEDIA_KEY);
        payload.append('id', provider_oid);

        const response = await axios.post('https://api.medanpedia.co.id/status', payload);

        if (response.data.status) {
            const dataPusat = response.data.data;
            
            const trx = await Transaction.findOne({ order_id: order_id_local });
            if (trx) {
                trx.status_provider = dataPusat.status;
                trx.remains = dataPusat.remains;
                await trx.save();
            }

            res.json({ success: true, data: dataPusat });
        } else {
            res.json({ success: false, message: "Data tidak ditemukan di pusat" });
        }
    } catch (e) {
        console.log(e);
        res.json({ success: false, message: "Error koneksi provider" });
    }
});

cron.schedule('0 0 * * *', async () => {
    const config = await getLeaderboardConfig();
    const now = Date.now();
    const diffTime = Math.abs(now - config.start_date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 30) {
        config.start_date = now;
        await config.save();
        console.log('Leaderboard Top Sultan Direset (Season Baru)');
        
        if (OWNER_NUMBER && sock) {
            sendWhatsApp(OWNER_NUMBER, "🔄 INFO SYSTEM\nLeaderboard Top Sultan telah direset otomatis (30 Hari).");
        }
    }
});

app.get('/api/top-sultan', async (req, res) => {
    try {
        const config = await getLeaderboardConfig();
        const startDate = config.start_date;
        
        const validTrx = await Transaction.find({
            status: 'success',
            date: { $gte: new Date(startDate) }
        });

        const sultanMap = {};
        
        validTrx.forEach(t => {
            if (!sultanMap[t.username]) {
                sultanMap[t.username] = {
                    username: t.username,
                    total: 0,
                    trx_count: 0,
                    last_trx: 0
                };
            }
            sultanMap[t.username].total += parseInt(t.amount);
            sultanMap[t.username].trx_count += 1;
            
            const tTime = new Date(t.date).getTime();
            if(tTime > sultanMap[t.username].last_trx) {
                sultanMap[t.username].last_trx = tTime;
            }
        });

        let leaderboard = Object.values(sultanMap);

        leaderboard.sort((a, b) => {
            if (b.trx_count !== a.trx_count) {
                return b.trx_count - a.trx_count;
            }
            return b.total - a.total;
        });

        leaderboard = leaderboard.slice(0, 10);

        const enrichedData = [];
        
        for (let l of leaderboard) {
            const uData = await User.findOne({ username: l.username });
            
            let masked = l.username;
            if(masked.length > 4) masked = masked.substring(0, 2) + "••••" + masked.slice(-1);

            enrichedData.push({
                username_masked: masked,
                fullname: uData ? uData.fullname : 'User',
                profile_img: (uData && uData.profile_img) ? uData.profile_img : 'images/default-user.png',
                total_spent: l.total,
                trx_count: l.trx_count,
                last_trx_time: l.last_trx
            });
        }
        
        const now = Date.now();
        const daysPassed = Math.ceil(Math.abs(now - startDate) / (1000 * 60 * 60 * 24));
        const daysLeft = 30 - daysPassed;

        res.json({ success: true, data: enrichedData, season_reset_in: daysLeft < 0 ? 0 : daysLeft });

    } catch (e) {
        console.log(e);
        res.json({ success: false, data: [] });
    }
});

async function checkExpiredPanels() {
    console.log("\n=== MULAI PENGECEKAN PANEL EXPIRED ===");
    const NOW = new Date();
    NOW.setHours(0, 0, 0, 0); 
    
    const allPanels = await Panel.find({ status: { $ne: 'deleted' } });
    console.log(`Total panel aktif yang dicek: ${allPanels.length} panel.`);
    
    for (let panel of allPanels) {
        const expDate = new Date(panel.expired_at);
        expDate.setHours(0, 0, 0, 0);
        
        const diffTime = expDate - NOW;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        // LOG DETEKTIF: Tampilkan nama panel, tanggal expired, dan sisa hari
        console.log(`[CEK] Panel: ${panel.username_panel} | Expired: ${expDate.toLocaleDateString()} | Sisa: ${diffDays} hari`);
        
        const userOwner = await User.findOne({ username: panel.username_owner });
        if(!userOwner) {
            console.log(`[SKIP] Pemilik panel ${panel.username_panel} tidak ditemukan di database.`);
            continue;
        }

        if (diffDays === 1) {
            if (panel.price > 0 && userOwner.balance >= panel.price) {
                userOwner.balance -= panel.price;
                let newExp = new Date(panel.expired_at);
                newExp.setDate(newExp.getDate() + 30);
                panel.expired_at = newExp;
                await userOwner.save();
                await panel.save();
                
                sendWhatsApp(userOwner.phone, `✅ PERPANJANG OTOMATIS\nPanel ${panel.username_panel} diperpanjang sampai ${newExp.toLocaleDateString()}.`);
                console.log(`-> Eksekusi: Auto-Perpanjang berhasil (Saldo dipotong).`);
            } else {
                sendWhatsApp(userOwner.phone, `⚠️ TAGIHAN PANEL\nPanel ${panel.username_panel} besok expired! Isi saldo untuk perpanjang otomatis.`);
                console.log(`-> Eksekusi: Mengirim WA Tagihan ke ${userOwner.phone}.`);
            }
        }

        if (diffDays <= 0 && panel.status === 'active') {
            try {
                await actionServer(panel.id, 'suspend');
                panel.status = 'suspended';
                await panel.save();
                sendWhatsApp(userOwner.phone, `❌ PANEL DISUSPEND\nPanel ${panel.username_panel} nonaktif karena expired.`);
                console.log(`-> Eksekusi: Panel Disuspend!`);
            } catch(e) { console.log(`-> Gagal suspend:`, e.message); }
        }

        if (diffDays <= -2) {
            try {
                await actionServer(panel.id, 'delete');
                try {
                    const findUser = await axios.get(`${PTERO_URL}/api/application/users?filter[email]=${panel.username_panel}@store.com`, { headers: PTERO_HEADERS });
                    if (findUser.data.data.length > 0) {
                        const pteroUserId = findUser.data.data[0].attributes.id;
                        await axios.delete(`${PTERO_URL}/api/application/users/${pteroUserId}`, { headers: PTERO_HEADERS });
                    }
                } catch(e) {}
                panel.status = 'deleted';
                await panel.save();
                sendWhatsApp(userOwner.phone, `🗑 PANEL DIHAPUS\nPanel ${panel.username_panel} dihapus permanen.`);
                console.log(`-> Eksekusi: Panel Dihapus Permanen!`);
            } catch(e) { console.log(`-> Gagal hapus:`, e.message); }
        }
    }
    console.log("=== SELESAI PENGECEKAN ===\n");
}

cron.schedule('1 0 * * *', checkExpiredPanels);

app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await Review.find().sort({ date: -1 });
        
        const enrichedReviews = [];
        
        for (let r of reviews) {
            const user = await User.findOne({ username: r.username });
            
            let isSultan = false;
            let displayName = r.fullname;
            let displayImg = 'images/default-user.png';

            if(user) {
                const trxCount = await Transaction.countDocuments({
                    username: user.username,
                    status: 'success'
                });
                
                if(trxCount > 50) isSultan = true;
                
                displayName = user.fullname;
                displayImg = user.profile_img || 'images/default-user.png';
            }
            const reactions = (r.reactions || []).map(react => {
                const rawReact = react.toObject ? react.toObject() : react;
                
                return {
                    ...rawReact,
                    isAdmin: rawReact.isAdmin || false,
                    displayName: rawReact.isAdmin ? '👑 Admin' : rawReact.user
                };
            });

            enrichedReviews.push({
                ...r.toObject(),
                is_sultan: isSultan,
                fullname: displayName,
                profile_img: displayImg,
                reactions: reactions
            });
        }

        const totalStars = reviews.reduce((acc, curr) => acc + parseInt(curr.rating), 0);
        const avgRating = reviews.length > 0 ? (totalStars / reviews.length).toFixed(1) : "0.0";

        res.json({ success: true, data: enrichedReviews, average: avgRating, total: reviews.length });
    } catch(e) {
        console.log(e);
        res.json({ success: false, data: [] });
    }
});

app.post('/api/submit-review', async (req, res) => {
    const { token, rating, category, message } = req.body;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        if(!user) return res.json({ success: false, message: "User tidak valid." });

        const ONE_DAY = 24 * 60 * 60 * 1000;
        const lastReviews = await Review.find({ username: user.username })
            .sort({ date: -1 })
            .limit(1);
            
        const lastReview = lastReviews[0];

        if(lastReview) {
            const diff = Date.now() - new Date(lastReview.date).getTime();
            if(diff < ONE_DAY) {
                const timeLeft = Math.ceil((ONE_DAY - diff) / (1000 * 60 * 60));
                return res.json({ success: false, message: `Anda sudah mengulas hari ini. Coba lagi dalam ${timeLeft} jam.` });
            }
        }

        const newReview = new Review({
            id: `REV-${Date.now()}`,
            username: user.username,
            fullname: user.fullname,
            rating: parseInt(rating),
            category: category || "Umum",
            message: xss(message),
            date: new Date()
        });

        await newReview.save();

        sendWhatsApp(OWNER_NUMBER, `⭐ ULASAN BARU\nOleh: ${user.fullname}\nRating: ${rating}/5\nPesan: ${message}`);

        res.json({ success: true, message: "Ulasan berhasil dikirim!" });

    } catch(e) {
        console.log(e);
        res.json({ success: false, message: "Gagal mengirim ulasan." });
    }
});

app.post('/api/admin/login', adminLimiter, (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASS) res.json({ success: true, key: ADMIN_PASS });
    else res.json({ success: false });
});

app.post('/api/admin/get-locks', authAdmin, (req, res) => {
    res.json({ success: true, data: categoryLock });
});

app.post('/api/admin/stats', authAdmin, async (req, res) => {
    try {
        const users = await User.find();
        const totalUserBalance = users.reduce((acc, curr) => acc + parseInt(curr.balance), 0);
        
        const successTrx = await Transaction.find({ status: 'success' });
        const totalIncome = successTrx.reduce((acc, curr) => acc + parseInt(curr.pay_amount), 0);

        const labels = [];
        const dataIncome = [];
        const dataTrxCount = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('id-ID', { weekday: 'short' });
            labels.push(dateStr);

            const startOfDay = new Date(d);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(d);
            endOfDay.setHours(23, 59, 59, 999);

            const dailyTrx = successTrx.filter(t => {
                const tDate = new Date(t.date);
                return tDate >= startOfDay && tDate <= endOfDay;
            });
            
            const dailySum = dailyTrx.reduce((a, b) => a + parseInt(b.pay_amount), 0);
            
            dataIncome.push(dailySum);
            dataTrxCount.push(dailyTrx.length);
        }

        const totalUsers = await User.countDocuments();

        res.json({
            success: true,
            total_users: totalUsers,
            total_balance_user: totalUserBalance,
            total_income: totalIncome,
            chart: { labels, income: dataIncome, count: dataTrxCount }
        });
    } catch (e) {
        console.log(e);
        res.json({ success: false, message: "Error kalkulasi statistik" });
    }
});

app.post('/api/admin/get-users', authAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password').lean();
        const trxStats = await Transaction.aggregate([
            { $match: { status: 'success' } },
            {
                $group: {
                    _id: "$username",
                    totalTrxCount: { $sum: 1 },
                    totalSpent: {
                        $sum: { $cond: [{ $ne: ["$type", "deposit"] }, "$amount", 0] }
                    },
                    totalDeposit: {
                        $sum: { $cond: [{ $eq: ["$type", "deposit"] }, "$amount", 0] }
                    }
                }
            }
        ]);

        const usersWithStats = users.map(u => {
            const stat = trxStats.find(s => s._id === u.username) || { totalTrxCount: 0, totalSpent: 0, totalDeposit: 0 };
            return {
                ...u,
                total_trx: stat.totalTrxCount,
                total_expense: stat.totalSpent,
                total_deposit: stat.totalDeposit
            };
        });

        res.json({ success: true, data: usersWithStats });
    } catch (e) {
        console.error(e);
        res.json({ success: false, data: [] });
    }
});

app.post('/api/admin/delete-user', authAdmin, async (req, res) => {
    const username = String(req.body.username || "");
    const result = await User.deleteOne({ username });
    
    if (result.deletedCount > 0) {
        res.json({ success: true, message: `User ${username} dihapus.` });
    } else {
        res.json({ success: false, message: "User tidak ditemukan." });
    }
});

app.post('/api/admin/products', authAdmin, (req, res) => {
    const setDefaults = (arr) => arr.map(x => ({ ...x, active: x.active !== undefined ? x.active : true }));
    
    res.json({
        success: true,
        data: {
            panel: setDefaults(getProducts()),
            script: setDefaults(getScripts()),
            vps: setDefaults(getVPS()),
            murid: setDefaults(getMurid()),
            apps: setDefaults(getApps()),
        },
        locks: categoryLock
    });
});

app.post('/api/admin/product-action', authAdmin, async (req, res) => {
    const { action, category, product } = req.body;
    
    let targetFile, currentData;
    
    if (category === 'panel') { targetFile = PRODUCTS_FILE; currentData = getProducts(); }
    else if (category === 'script') { targetFile = SCRIPTS_FILE; currentData = getScripts(); }
    else if (category === 'vps') { targetFile = VPS_FILE; currentData = getVPS(); }
    else if (category === 'murid') { targetFile = MURID_FILE; currentData = getMurid(); }
    else if (category === 'apps') { targetFile = APPS_FILE; currentData = getApps(); }
    else return res.json({ success: false, message: "Kategori tidak valid" });

    if (action === 'toggle-active') {
        const idx = currentData.findIndex(p => p.code === product.code);
        if (idx !== -1) {
            currentData[idx].active = !currentData[idx].active;
            fs.writeFileSync(targetFile, JSON.stringify(currentData, null, 2));
            const statusStr = currentData[idx].active ? "AKTIF (Ready)" : "NONAKTIF (Habis)";
            return res.json({ success: true, message: `Produk diubah menjadi ${statusStr}` });
        }
    }

    if (action === 'delete') {
        const deletedProduct = currentData.find(p => p.code === product.code);

        const newData = currentData.filter(p => p.code !== product.code);
        fs.writeFileSync(targetFile, JSON.stringify(newData, null, 2));

        if (deletedProduct) {
            try {
                const message = `
🗑️ INFO PRODUK DIHAPUS / HABIS

❌ ${deletedProduct.name}
📂 Kategori: ${category.toUpperCase()}

⚠️ Produk ini telah dihapus dari etalase atau stok sudah habis permanen.
                `.trim();

                if (TELEGRAM_CHANNEL_INFO && TELEGRAM_BOT_TOKEN) {
                    axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                        chat_id: TELEGRAM_CHANNEL_INFO, text: message, parse_mode: 'Markdown'
                    }).catch(()=>{});
                }
                if (typeof WA_CHANNEL_INFO !== 'undefined' && WA_CHANNEL_INFO && sock) {
    try {
        let channelId = WA_CHANNEL_INFO.trim();
        if (!channelId.endsWith('@newsletter')) channelId += '@newsletter';
        await sock.sendMessage(channelId, { text: message }); 
    } catch (e) {
        console.log("❌ [GAGAL] Kirim notif ke Channel:", e.message);
    }
}
            } catch (e) { console.log("Gagal notif delete:", e.message); }
        }

        return res.json({ success: true, message: "Item dihapus & Notifikasi Disebar." });
    }

    if (action === 'add') {
        if(currentData.find(p => p.code === product.code)) return res.json({ success: false, message: "Kode sudah ada!" });
        
        const newItem = {
            code: xss(product.code),
            name: xss(product.name),
            price: parseInt(product.price),
            active: true,
            createdAt: new Date().toISOString(),
            link: product.link || "",
            menu: product.menu || product.features_raw || "",
            email: product.email || "",
            password: product.password || ""
        };

        if(category === 'panel') newItem.spec = product.spec || { ram:0, disk:0, cpu:0 };
        if(category === 'script') {
            if (product.menu) {
                newItem.features = product.menu.split('\n');
            } else if (product.features_raw) {
                newItem.features = product.features_raw.split('\n');
            } else {
                newItem.features = [];
            }
        }
        if(category === 'vps') newItem.spec = product.specString;
        if(category === 'murid') {
            newItem.benefits = product.benefits_raw ? product.benefits_raw.split('\n') : [];
        }
        if(category === 'apps') {
            newItem.icon = product.icon || '/images/default-app.png';
            newItem.tutorial = product.tutorial || '';
            newItem.stock = product.stock ? product.stock.split('\n').filter(l => l.trim()) : [];
        }

        currentData.push(newItem);
        fs.writeFileSync(targetFile, JSON.stringify(currentData, null, 2));

        try {
            const broadcastId = `BRD-${Date.now()}`;
            const broadcastMessage = `🎉 PRODUK BARU!\n\n📦 ${newItem.name}\n💰 Harga: Rp ${newItem.price.toLocaleString('id-ID')}\n📂 Kategori: ${category.toUpperCase()}\n\n🔥 Buruan order sebelum kehabisan!`;
            
            const newBroadcast = new Broadcast({
                id: broadcastId,
                type: 'info',
                message: broadcastMessage,
                target: 'all',
                status: 'sent',
                scheduled_for: new Date(),
                date: new Date()
            });
            newBroadcast.save().catch(err => console.log("Gagal simpan broadcast:", err));

            if (TELEGRAM_CHANNEL_INFO && TELEGRAM_BOT_TOKEN) {
                axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                    chat_id: TELEGRAM_CHANNEL_INFO,
                    text: broadcastMessage,
                    parse_mode: 'Markdown'
                }).catch(()=>{});
            }

            if (typeof WA_CHANNEL_INFO !== 'undefined' && WA_CHANNEL_INFO && sock) {
    try {
        let channelId = WA_CHANNEL_INFO.trim();
        if (!channelId.endsWith('@newsletter')) channelId += '@newsletter';
        await sock.sendMessage(channelId, { text: broadcastMessage }); // <--- UBAH JADI broadcastMessage
    } catch (e) {
        console.log("❌ [GAGAL] Kirim notif ke Channel:", e.message);
    }
}

        } catch (e) { console.log("Gagal notif add:", e.message); }

        return res.json({ success: true, message: "Item ditambah & Notifikasi Disebar." });
    }

    if (action === 'edit') {
        const idx = currentData.findIndex(p => p.code === product.code);
        
        if(idx !== -1) {
            currentData[idx].name = xss(product.name);
            currentData[idx].price = parseInt(product.price);
            
            if (product.link !== undefined) currentData[idx].link = product.link;
            if (product.menu !== undefined) currentData[idx].menu = product.menu;
            if (product.email !== undefined) currentData[idx].email = product.email;
            if (product.password !== undefined) currentData[idx].password = product.password;

            if (category === 'panel' && product.spec) {
                currentData[idx].spec = product.spec;
            }
            if (category === 'script') {
                if(product.features_raw) currentData[idx].features = product.features_raw.split('\n');
            }
            if (category === 'murid') {
                if(product.benefits_raw) currentData[idx].benefits = product.benefits_raw.split('\n');
            }
            if (category === 'vps' && product.specString) {
                currentData[idx].spec = product.specString;
            }
            if (category === 'apps') {
                if(product.icon) currentData[idx].icon = product.icon;
                if(product.tutorial) currentData[idx].tutorial = product.tutorial;
                if(product.stock) {
                    const newStocks = product.stock.split('\n').filter(l => l.trim());
                    if(!currentData[idx].stock) currentData[idx].stock = [];
                    currentData[idx].stock.push(...newStocks);
                }
            }

            fs.writeFileSync(targetFile, JSON.stringify(currentData, null, 2));

            try {
                const message = `
🔄 INFO UPDATE PRODUK

📦 ${currentData[idx].name}
💰 Harga: Rp ${currentData[idx].price.toLocaleString('id-ID')}
📂 Kategori: ${category.toUpperCase()}

✨ Informasi/Stok produk ini baru saja diperbarui oleh Admin.
                `.trim();

                if (TELEGRAM_CHANNEL_INFO && TELEGRAM_BOT_TOKEN) {
                    axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                        chat_id: TELEGRAM_CHANNEL_INFO,
                        text: message,
                        parse_mode: 'Markdown'
                    }).catch(()=>{});
                }

                if (typeof WA_CHANNEL_INFO !== 'undefined' && WA_CHANNEL_INFO && sock) {
    try {
        let channelId = WA_CHANNEL_INFO.trim();
        if (!channelId.endsWith('@newsletter')) channelId += '@newsletter';
        await sock.sendMessage(channelId, { text: message }); // <--- UBAH JADI message
    } catch (e) {
        console.log("❌ [GAGAL] Kirim notif ke Channel:", e.message);
    }
}
            } catch (e) { console.log("Gagal notif edit:", e.message); }
            
            return res.json({ success: true, message: "Produk Diupdate & Notif Disebar!" });
        }
        
        return res.json({ success: false, message: "Produk tidak ditemukan untuk diedit." });
    }
    
    res.json({ success: false, message: "Aksi gagal." });
});

app.post('/api/admin/add-app-stock', authAdmin, (req, res) => {
    const { app_code, account_data } = req.body;
    let apps = getApps();
    const idx = apps.findIndex(a => a.code === app_code);
    
    if(idx !== -1) {
        if(!apps[idx].stock) apps[idx].stock = [];
        const lines = account_data.split('\n').filter(l => l.trim() !== '');
        lines.forEach(l => apps[idx].stock.push(l.trim()));
        
        saveApps(apps);
        res.json({ success: true, message: `Berhasil tambah ${lines.length} akun.` });
    } else {
        res.json({ success: false, message: "App tidak ditemukan." });
    }
});

app.post('/api/admin/toggle-stock', authAdmin, (req, res) => {
    const { category, status } = req.body;
    categoryLock[category] = status;
    res.json({ success: true, message: `Stok ${category} sekarang: ${status ? 'READY' : 'HABIS'}` });
});

app.post('/api/admin/reply-review', authAdmin, async (req, res) => {
    const { review_id, reply_message } = req.body;
    const review = await Review.findOne({ id: review_id });
    
    if (review) {
        review.admin_reply = xss(reply_message);
        review.reply_date = new Date();
        await review.save();
        res.json({ success: true, message: "Balasan terkirim!" });
    } else {
        res.json({ success: false, message: "Review tidak ditemukan." });
    }
});

app.post('/api/react-review', async (req, res) => {
    const { review_id, type, token, admin_pass } = req.body;
    
    let username = "Guest";
    let isAdmin = false;

    if (admin_pass && admin_pass === ADMIN_PASS) {
        username = "Admin";
        isAdmin = true;
    } else {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            username = decoded.username;
            
            const user = await User.findOne({ username: username });
            if (!user) {
                return res.json({ success: false, message: "User tidak ditemukan" });
            }
        } catch(e) {
            return res.json({ success: false, message: "Login dulu untuk bereaksi!" });
        }
    }

    const review = await Review.findOne({ id: review_id });
    if(!review) return res.json({ success: false, message: "Review hilang." });

    if(!review.reactions) review.reactions = [];

    const existingIdx = review.reactions.findIndex(r => r.user === username);
    
    if(existingIdx !== -1) {
        if(review.reactions[existingIdx].type === type) {
            review.reactions.splice(existingIdx, 1);
        } else {
            review.reactions[existingIdx].type = type;
            review.reactions[existingIdx].isAdmin = isAdmin;
        }
    } else {
        review.reactions.push({
            user: username,
            type,
            isAdmin,
            date: new Date()
        });
    }

    await review.save();
    
    res.json({
        success: true,
        data: review.reactions,
        message: "Reaksi berhasil dikirim!"
    });
});

app.post('/api/admin/transactions', authAdmin, async (req, res) => {
    const trx = await Transaction.find().sort({ date: -1 }).limit(100);
    res.json({ success: true, data: trx });
});

app.post('/api/admin/panels', authAdmin, async (req, res) => {
    const activePanels = await Panel.find({ 
        status: { $ne: 'deleted' },
        username_owner: { $ne: 'Sync-Admin' } 
    }).sort({ created_at: -1 });
    
    res.json({
        success: true,
        data: activePanels,
        total_panels: activePanels.length,
        total_users: activePanels.length
    });
});

app.post('/api/admin/panel-power', authAdmin, async (req, res) => {
    const { uuid, signal } = req.body;
    if (!PTERO_CLIENT_KEY) return res.json({ success: false, message: "PTERO_CLIENT_KEY belum di-set di .env" });

    try {
        const identifier = uuid.split('-')[0];
        await axios.post(`${PTERO_URL}/api/client/servers/${identifier}/power`, { signal }, {
            headers: { "Authorization": `Bearer ${PTERO_CLIENT_KEY}`, "Content-Type": "application/json", "Accept": "Application/vnd.pterodactyl.v1+json" }
        });
        res.json({ success: true, message: `Perintah ${signal} berhasil dikirim!` });
    } catch (e) {
        res.json({ success: false, message: "Gagal mengirim perintah power ke panel." });
    }
});

app.post('/api/admin/panel-status', authAdmin, async (req, res) => {
    const { uuid } = req.body;
    if (!PTERO_CLIENT_KEY) return res.json({ success: false, message: "Client API Key belum ada." });

    try {
        const identifier = uuid.split('-')[0];
        const response = await axios.get(`${PTERO_URL}/api/client/servers/${identifier}/resources`, {
            headers: { "Authorization": `Bearer ${PTERO_CLIENT_KEY}`, "Content-Type": "application/json", "Accept": "Application/vnd.pterodactyl.v1+json" }
        });
        res.json({ success: true, data: response.data.attributes });
    } catch (e) {
        res.json({ success: false, message: "Offline / Server Suspend" });
    }
});

app.post('/api/admin/sync-panels', authAdmin, async (req, res) => {
    try {
        const response = await axios.get(`${PTERO_URL}/api/application/servers?per_page=1000`, { headers: PTERO_HEADERS });
        const pteroServers = response.data.data;
        
        let addedCount = 0;

        for (let server of pteroServers) {
            const sData = server.attributes;
            
            const existing = await Panel.findOne({ id: sData.id });
            
            if (!existing) {
                const newPanel = new Panel({
                    id: sData.id,
                    uuid: sData.uuid,
                    username_owner: 'Sync-Admin',
                    username_panel: sData.name,
                    password_panel: 'Cek di Pterodactyl',
                    domain: PTERO_URL,
                    product: 'Manual / Synced',
                    spec: {
                        ram: sData.limits.memory,
                        cpu: sData.limits.cpu,
                        disk: sData.limits.disk
                    },
                    price: 0,
                    created_at: new Date(sData.created_at),
                    expired_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    warranty_used: false,
                    status: sData.suspended ? 'suspended' : 'active'
                });
                await newPanel.save();
                addedCount++;
            }
        }

        res.json({ success: true, message: `Sinkronisasi selesai! ${addedCount} panel baru berhasil ditarik ke database web.` });
    } catch (error) {
        console.error("Error Sync:", error);
        res.json({ success: false, message: "Gagal menarik data dari Pterodactyl. Pastikan URL dan API Key benar." });
    }
});

app.post('/api/admin/delete-panel-force', authAdmin, async (req, res) => {
    const { panel_id, username_panel } = req.body;

    try {
        try {
            await axios.delete(`${PTERO_URL}/api/application/servers/${panel_id}`, { headers: PTERO_HEADERS });
            console.log(`Server ${panel_id} deleted.`);
        } catch (e) {
            console.log(`Gagal hapus server (mungkin sudah hilang): ${e.message}`);
        }
        
        const emailTarget = `${username_panel}@store.com`;
        try {
            const findUser = await axios.get(`${PTERO_URL}/api/application/users?filter[email]=${emailTarget}`, { headers: PTERO_HEADERS });
            
            if (findUser.data.data.length > 0) {
                const pteroUserId = findUser.data.data[0].attributes.id;
                await axios.delete(`${PTERO_URL}/api/application/users/${pteroUserId}`, { headers: PTERO_HEADERS });
                console.log(`User ${pteroUserId} (${username_panel}) deleted.`);
            } else {
                console.log(`User ${username_panel} tidak ditemukan.`);
            }
        } catch (e) {
            console.log(`Gagal hapus user: ${e.message}`);
        }
        
        const result = await Panel.deleteOne({ id: panel_id });
        
        if (result.deletedCount > 0) {
            res.json({ success: true, message: "Panel & User Pterodactyl berhasil dimusnahkan!" });
        } else {
            res.json({ success: true, message: "Panel dihapus dari Pterodactyl (tidak ditemukan di database)." });
        }

    } catch (e) {
        console.log(e);
        res.json({ success: false, message: "Terjadi kesalahan sistem." });
    }
});

app.post('/api/forgot-password/request', async (req, res) => {
    let identifier = String(req.body.identifier || "");
    if (!identifier) return res.json({ success: false, message: "Masukkan Username atau Nomor WA!" });
    
    identifier = xss(identifier).toLowerCase();
    let user = await User.findOne({ username: identifier });
    
    if (!user) {
        let cleanPhone = identifier.replace(/[^0-9]/g, '');
        if (cleanPhone.startsWith('08')) cleanPhone = '62' + cleanPhone.slice(1);
        user = await User.findOne({ phone: cleanPhone });
    }
    
    if (!user) return res.json({ success: false, message: "Akun tidak ditemukan!" });
    
    const username = user.username;
    const now = Date.now();
    
    let resetData = await ResetStorage.findOne({ username });
    
    if (!resetData) {
        resetData = new ResetStorage({ username, attempts: 0, lastRequest: 0 });
    }
    
    if (now - resetData.lastRequest > 24 * 60 * 60 * 1000) {
        resetData.attempts = 0;
    }
    
    if (resetData.attempts >= 5) {
        return res.json({ success: false, message: "Limit reset password tercapai (5x). Coba lagi besok." });
    }
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    resetData.otp = otp;
    resetData.expire = now + 60000;
    resetData.attempts += 1;
    resetData.lastRequest = now;
    
    await resetData.save();
    
    const msg = `🔐 KODE RESET PASSWORD\n\nHalo ${user.fullname},\nKode OTP reset password Anda adalah:\n\n${otp}\n\nKode berlaku 1 menit.\nJangan berikan kepada siapapun!`;
    sendWhatsApp(user.phone, msg);

    console.log(`[RESET PASS] ${username} meminta OTP: ${otp}`);
    res.json({ success: true, message: "Kode OTP dikirim ke WhatsApp!", target_phone: user.phone });
});

app.post('/api/forgot-password/reset', async (req, res) => {
    let { identifier, otp, newPassword } = req.body;
    
    let user = await User.findOne({ username: identifier.toLowerCase() });
    if (!user) {
        let cleanPhone = identifier.replace(/[^0-9]/g, '');
        if (cleanPhone.startsWith('08')) cleanPhone = '62' + cleanPhone.slice(1);
        user = await User.findOne({ phone: cleanPhone });
    }
    
    if (!user) return res.json({ success: false, message: "User invalid." });
    
    const username = user.username;
    const session = await ResetStorage.findOne({ username });
    
    if (!session || !session.otp) return res.json({ success: false, message: "Belum request OTP." });
    if (Date.now() > session.expire) return res.json({ success: false, message: "Kode OTP sudah kadaluarsa (Maks 1 menit)." });
    if (session.otp !== otp) return res.json({ success: false, message: "Kode OTP Salah!" });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    user.password = hashedPassword;
    await user.save();
    
    await ResetStorage.deleteOne({ username });

    logActivity('RESET PASSWORD', user, 'Sukses ganti password via OTP');

    res.json({ success: true, message: "Password berhasil diubah! Silakan login." });
});

app.get('/api/cf-zones', async (req, res) => {
    try {
        const response = await axios.get('https://api.cloudflare.com/client/v4/zones?status=active&per_page=50', { headers: CF_HEADERS });
        
        if(response.data.success) {
            const zones = response.data.result.map(z => {
                let price = 3000;
                const foundPrice = DOMAIN_PRICES.find(p => z.name.endsWith(p.tld));
                if(foundPrice) price = foundPrice.price;
                
                return {
                    id: z.id,
                    name: z.name,
                    price: price
                };
            });
            res.json({ success: true, data: zones });
        } else {
            res.json({ success: false, data: [] });
        }
    } catch(e) {
        console.log(e);
        res.json({ success: false, message: "Gagal koneksi ke Cloudflare" });
    }
});

app.post('/api/buy-subdomain', async (req, res) => {
    const { token, zone_id, zone_name, proxy_status, method } = req.body;
    const subdomain = xss(req.body.subdomain).toLowerCase();
    const ip_address = xss(req.body.ip_address);
    
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipRegex.test(ip_address)) {
        return res.json({ success: false, message: "Format IP Address salah! Contoh: 192.168.1.1" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        if (!user) return res.json({ success: false, message: "User invalid" });

        if(!subdomain || !ip_address || !zone_id) return res.json({ success: false, message: "Data tidak lengkap" });
        if(/[^a-z0-9]/.test(subdomain)) return res.json({ success: false, message: "Subdomain hanya huruf kecil & angka!" });

        let realPrice = 3000;
        const priceData = DOMAIN_PRICES.find(p => zone_name.endsWith(p.tld));
        if (priceData) realPrice = priceData.price;
        
        let finalAmount = realPrice;
        let appliedPromoCode = null;

        if (req.body.promo_code) {
            if (method === 'qris') {
                return res.json({
                    success: false,
                    message: "Mohon maaf promo ini hanya bisa di beli menggunakan pembayaran saldo tidak berlaku di pembayaran qris"
                });
            }
            
            const promo = await Promo.findOne({ code: req.body.promo_code.toUpperCase(), status: true });
            if (promo) {
                const userUsage = await PromoUsage.countDocuments({ promo_code: promo.code, username: user.username });
                if (userUsage < promo.per_user_limit) {
                    const now = new Date();
                    if (now >= promo.start_date && (!promo.end_date || now <= promo.end_date)) {
                        
                        let discount = promo.discount_type === 'percentage'
                            ? Math.floor(realPrice * promo.discount_value / 100)
                            : promo.discount_value;
                            
                        if (promo.max_discount && discount > promo.max_discount) discount = promo.max_discount;
                        if (discount > realPrice) discount = realPrice;
                        
                        finalAmount = realPrice - discount;
                        appliedPromoCode = promo.code;
                        
                        promo.used_count += 1;
                        await promo.save();
                        
                        await new PromoUsage({
                            promo_code: promo.code,
                            username: user.username,
                            order_id: "PROMO-" + Date.now()
                        }).save();
                    }
                }
            }
        }

        if (method === 'saldo') {
            if (user.balance < finalAmount) return res.json({ success: false, message: "Saldo kurang!" });
            
            user.balance -= finalAmount;
            
            const poinPanel = Math.floor(finalAmount / 10000); 
            if (poinPanel > 0) {
                user.points = (user.points || 0) + poinPanel;
            }
            
            await user.save();

            const order_id = "SUB-" + Date.now();
            
            const success = await processSubdomainPurchase(user, {
                subdomain, ip_address, zone_id, zone_name, proxy_status, price: realPrice
            }, order_id);

            if(success) {
                const transaction = new Transaction({
                    order_id,
                    username: user.username,
                    fullname: user.fullname,
                    amount: realPrice,
                    pay_amount: finalAmount,
                    status: 'success',
                    type: 'buy_subdomain',
                    product_data: {
                        product_name: `${subdomain}.${zone_name}`,
                        subdomain, ip_address, zone_id, zone_name, proxy_status, price: realPrice
                    },
                    qr_string: '-',
                    date: new Date()
                });
                await transaction.save();
                
                return res.json({ success: true, message: "Subdomain Aktif!", type: 'instant' });
            } else {
                user.balance += finalAmount;
                await user.save();
                return res.json({ success: false, message: "Gagal create record di Cloudflare." });
            }
        }
        else if (method === 'qris') {
            const order_id = "SUB-" + Date.now();
            const amountToSend = finalAmount + parseInt(process.env.ADMIN_FEE || 0);
            
            const response = await axios.post('https://app.pakasir.com/api/transactioncreate/qris', {
                project: PAKASIR_SLUG, order_id, amount: amountToSend, api_key: PAKASIR_API_KEY
            });

            if (response.data && response.data.payment) {
                const payData = response.data.payment;
                const realAmount = payData.total_payment ? parseInt(payData.total_payment) : amountToSend;
                
                const transaction = new Transaction({
                    order_id,
                    username: user.username,
                    fullname: user.fullname,
                    amount: realPrice,
                    pay_amount: realAmount,
                    status: 'pending',
                    type: 'buy_subdomain',
                    product_data: {
                        product_name: `${subdomain}.${zone_name}`,
                        subdomain, ip_address, zone_id, zone_name, proxy_status, price: realPrice
                    },
                    qr_string: payData.payment_number,
                    date: new Date()
                });
                await transaction.save();
                
                return res.json({ success: true, type: 'qris', qr_string: payData.payment_number, order_id, amount: realPrice, pay_amount: realAmount });
            }
        }
    } catch(e) {
        console.log(e);
        res.json({ success: false, message: "Error Server" });
    }
});

app.post('/api/admin/save-benefits', authAdmin, (req, res) => {
    const { category, code, benefits } = req.body;
    
    let targetFile, currentData;
    
    if (category === 'murid') {
        targetFile = MURID_FILE;
        currentData = getMurid();
    }
    else if (category === 'script') {
        targetFile = SCRIPTS_FILE;
        currentData = getScripts();
    }
    else return res.json({ success: false, message: "Kategori tidak valid" });

    const idx = currentData.findIndex(p => p.code === code);
    if (idx === -1) return res.json({ success: false, message: "Produk tidak ditemukan" });

    currentData[idx].benefits = benefits.split('\n').filter(line => line.trim());
    
    fs.writeFileSync(targetFile, JSON.stringify(currentData, null, 2));
    
    res.json({ success: true, message: "Keuntungan berhasil disimpan!" });
});

async function processNokosPurchase(user, orderData, order_id_input = null) {
    try {
        const { negara_id, negara_nama, operator, layanan_kode, layanan_nama, harga, number, order_id_provider } = orderData;
        
        const trxDate = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
        const nominal = parseInt(harga).toLocaleString('id-ID');
        const totalSukses = await Transaction.countDocuments({ status: 'success' }) + 1;

        await sendTrxNotifications({
            user: user, orderId: order_id_input, productName: layanan_nama,
            amount: nominal, trxDate: trxDate, totalSukses: totalSukses,
            type: 'NOKOS', sendWhatsApp: sendWhatsApp, sock: sock,
            extraData: { nomor: number, negara: negara_nama, status: 'Sukses' }
        });

        logActivity('BELI NOKOS', user, `Layanan: ${layanan_nama} | Nomor: ${number}`);
        return true;

    } catch (e) {
        console.log("Error processNokosPurchase:", e);
        return false;
    }
}

app.get('/api/nokos/negara', async (req, res) => {
    try {
        const JASAOTP_API_KEY = process.env.JASAOTP_API_KEY;
        if (!JASAOTP_API_KEY) {
            return res.json({ success: false, message: "API Key tidak ditemukan" });
        }
        
        const response = await axios.get(`https://api.jasaotp.id/v1/negara.php`);
        
        if (response.data && response.data.success) {
            res.json({ success: true, data: response.data.data });
        } else {
            res.json({ success: false, data: [] });
        }
    } catch (e) {
        console.log("Error get negara:", e);
        res.json({ success: false, data: [] });
    }
});

app.post('/api/nokos/operator', async (req, res) => {
    const { negara_id } = req.body;
    try {
        const response = await axios.get(`https://api.jasaotp.id/v1/operator.php?negara=${negara_id}`);
        
        if (response.data && response.data.success) {
            const operators = response.data.data[negara_id] || [];
            res.json({ success: true, data: operators });
        } else {
            res.json({ success: false, data: [] });
        }
    } catch (e) {
        console.log("Error get operator:", e);
        res.json({ success: false, data: [] });
    }
});

app.post('/api/nokos/layanan', async (req, res) => {
    const { negara_id } = req.body;
    try {
        const response = await axios.get(`https://api.jasaotp.id/v1/layanan.php?negara=${negara_id}`);
        
        if (response.data && response.data[negara_id]) {
            const layananList = [];
            for (const [kode, detail] of Object.entries(response.data[negara_id])) {
                const originalPrice = parseInt(detail.harga) || 0;
                const markedUpPrice = Math.ceil(originalPrice + (originalPrice * (NOKOS_PROFIT_PERCENT / 100)));

                layananList.push({
                    kode: kode,
                    nama: detail.layanan || kode.toUpperCase(),
                    harga: markedUpPrice,
                    stok: detail.stok
                });
            }
            res.json({ success: true, data: layananList });
        } else {
            res.json({ success: false, data: [] });
        }
    } catch (e) {
        console.log("Error get layanan:", e);
        res.json({ success: false, data: [] });
    }
});

app.post('/api/buy-nokos', async (req, res) => {
    const { token, negara_id, negara_nama, operator, layanan_kode, layanan_nama, harga, method } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        if (!user) return res.json({ success: false, message: "User tidak ditemukan" });

        const JASAOTP_API_KEY = process.env.JASAOTP_API_KEY;
        if (!JASAOTP_API_KEY) {
            return res.json({ success: false, message: "API Key tidak dikonfigurasi" });
        }

        const nominal = parseInt(harga);
        
        let finalAmount = nominal;
        let appliedPromoCode = null;

        if (req.body.promo_code) {
            if (method === 'qris') {
                return res.json({
                    success: false,
                    message: "Mohon maaf promo ini hanya bisa di beli menggunakan pembayaran saldo tidak berlaku di pembayaran qris"
                });
            }
            
            const promo = await Promo.findOne({ code: req.body.promo_code.toUpperCase(), status: true });
            if (promo) {
                const userUsage = await PromoUsage.countDocuments({ promo_code: promo.code, username: user.username });
                if (userUsage < promo.per_user_limit) {
                    const now = new Date();
                    if (now >= promo.start_date && (!promo.end_date || now <= promo.end_date)) {
                        
                        let discount = promo.discount_type === 'percentage'
                            ? Math.floor(nominal * promo.discount_value / 100)
                            : promo.discount_value;
                            
                        if (promo.max_discount && discount > promo.max_discount) discount = promo.max_discount;
                        if (discount > nominal) discount = nominal;
                        
                        finalAmount = nominal - discount;
                        appliedPromoCode = promo.code;
                        
                        promo.used_count += 1;
                        await promo.save();
                        
                        await new PromoUsage({
                            promo_code: promo.code,
                            username: user.username,
                            order_id: "PROMO-" + Date.now()
                        }).save();
                    }
                }
            }
        }

        if (method === 'saldo') {
            if (user.balance < finalAmount) {
                return res.json({ success: false, message: "Saldo tidak cukup!" });
            }

            const orderUrl = `https://api.jasaotp.id/v1/order.php?api_key=${JASAOTP_API_KEY}&negara=${negara_id}&layanan=${layanan_kode}&operator=${operator}`;
            const orderResponse = await axios.get(orderUrl);
            
            if (orderResponse.data && orderResponse.data.success) {
                const providerOrderId = orderResponse.data.data.order_id;
                const nomorHp = orderResponse.data.data.number;
                
                user.balance -= finalAmount;
                
                const poinPanel = Math.floor(finalAmount / 10000); 
            if (poinPanel > 0) {
                user.points = (user.points || 0) + poinPanel;
            }
                
                await user.save();

                const order_id = "NOKOS-" + Date.now();
                
                const transaction = new Transaction({
                    order_id: order_id,
                    provider_oid: providerOrderId,
                    username: user.username,
                    fullname: user.fullname,
                    amount: nominal,
                    pay_amount: finalAmount,
                    status: 'success',
                    type: 'buy_nokos',
                    product_data: {
                        negara_id: negara_id,
                        negara_nama: negara_nama,
                        operator: operator,
                        layanan_kode: layanan_kode,
                        layanan_nama: layanan_nama,
                        nomor: nomorHp,
                        provider_order_id: providerOrderId
                    },
                    qr_string: '-',
                    date: new Date()
                });
                await transaction.save();

                if (!user.purchased_nokos) user.purchased_nokos = [];
                user.purchased_nokos.push({
                    order_id: order_id,
                    provider_order_id: providerOrderId,
                    negara: negara_nama,
                    layanan: layanan_nama,
                    nomor: nomorHp,
                    otp: null,
                    status: 'waiting',
                    date: new Date()
                });
                await user.save();

                await processNokosPurchase(user, {
                    negara_id, negara_nama, operator,
                    layanan_kode, layanan_nama,
                    harga: nominal, number: nomorHp,
                    order_id_provider: providerOrderId
                }, order_id);

                return res.json({
                    success: true,
                    message: "Nomor berdidapat!",
                    type: 'instant',
                    data: {
                        order_id: order_id,
                        nomor: nomorHp,
                        provider_order_id: providerOrderId
                    }
                });
            } else {
                return res.json({ success: false, message: "Gagal order ke provider: " + (orderResponse.data.message || "Unknown") });
            }
        }
        else if (method === 'qris') {
            const order_id = "NOKOS-" + Date.now();
            const amountToSend = finalAmount + parseInt(process.env.ADMIN_FEE || 0);
            
            const response = await axios.post('https://app.pakasir.com/api/transactioncreate/qris', {
                project: PAKASIR_SLUG, order_id: order_id, amount: amountToSend, api_key: PAKASIR_API_KEY
            });

            if (response.data && response.data.payment) {
                const payData = response.data.payment;
                const realAmount = payData.total_payment ? parseInt(payData.total_payment) : amountToSend;

                const transaction = new Transaction({
                    order_id: order_id,
                    username: user.username,
                    fullname: user.fullname,
                    amount: nominal,
                    pay_amount: realAmount,
                    status: 'pending',
                    type: 'buy_nokos',
                    product_data: {
                        negara_id, negara_nama, operator,
                        layanan_kode, layanan_nama,
                        harga: nominal
                    },
                    qr_string: payData.payment_number,
                    date: new Date()
                });
                await transaction.save();

                logActivity('ORDER NOKOS (QRIS)', user, `Pending Payment: ${realAmount}`);
                return res.json({
                    success: true,
                    type: 'qris',
                    qr_string: payData.payment_number,
                    order_id,
                    amount: nominal,
                    pay_amount: realAmount
                });
            } else {
                return res.json({ success: false, message: "Gagal generate QRIS" });
            }
        }
    } catch (e) {
        console.log(e);
        res.json({ success: false, message: "Error Server" });
    }
});

app.post('/api/nokos/check-otp', async (req, res) => {
    const { token, provider_order_id, local_order_id } = req.body;
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        if (!user) return res.json({ success: false });

        const JASAOTP_API_KEY = process.env.JASAOTP_API_KEY;
        const smsUrl = `https://api.jasaotp.id/v1/sms.php?api_key=${JASAOTP_API_KEY}&id=${provider_order_id}`;
        
        const response = await axios.get(smsUrl);

        if (response.data && response.data.success) {
            const otp = response.data.data.otp;
            
            const nokosIndex = user.purchased_nokos.findIndex(n => n.provider_order_id == provider_order_id);
            if (nokosIndex !== -1) {
                user.purchased_nokos[nokosIndex].otp = otp;
                user.purchased_nokos[nokosIndex].status = 'received';
                await user.save();
            }

            const trx = await Transaction.findOne({ provider_oid: provider_order_id });
            if (trx) {
                trx.status_provider = 'OTP_RECEIVED';
                trx.product_data.otp = otp;
                await trx.save();
            }

            res.json({ success: true, otp: otp });
        } else {
            res.json({ success: false, message: response.data.message || "OTP belum masuk" });
        }
    } catch (e) {
        console.log(e);
        res.json({ success: false, message: "Error koneksi provider" });
    }
});

app.post('/api/nokos/cancel', async (req, res) => {
    const { token, provider_order_id } = req.body;
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        if (!user) return res.json({ success: false });

        const JASAOTP_API_KEY = process.env.JASAOTP_API_KEY;
        const cancelUrl = `https://api.jasaotp.id/v1/cancel.php?api_key=${JASAOTP_API_KEY}&id=${provider_order_id}`;
        
        const response = await axios.get(cancelUrl);

        if (response.data && response.data.success) {
            const refundedAmount = response.data.data.refunded_amount || 0;
            
            const nokosIndex = user.purchased_nokos.findIndex(n => n.provider_order_id == provider_order_id);
            if (nokosIndex !== -1) {
                user.purchased_nokos[nokosIndex].status = 'cancelled';
                await user.save();
            }

            const trx = await Transaction.findOne({ provider_oid: provider_order_id });
            if (trx) {
                trx.status = 'cancelled';
                await trx.save();
            }

            res.json({ success: true, refunded: refundedAmount });
        } else {
            res.json({ success: false, message: response.data.message || "Gagal membatalkan" });
        }
    } catch (e) {
        console.log(e);
        res.json({ success: false, message: "Error koneksi provider" });
    }
});

cron.schedule('0 3 * * *', () => {
    console.log('Memulai pembersihan sistem...');
    const sessionPath = path.join(__dirname, 'auth_info_baileys');
    if (fs.existsSync(sessionPath)) {
        fs.readdir(sessionPath, (err, files) => {
            if (err) {
                console.log('Gagal membaca folder session:', err);
                return;
            }
            
            let deletedCount = 0;
            files.forEach(file => {
                if (file !== 'creds.json') {
                    fs.unlink(path.join(sessionPath, file), err => {
                        if (!err) deletedCount++;
                    });
                }
            });
            console.log(`Berhasil menghapus ${deletedCount} file sampah WA.`);
        });
    }
    if (global.gc) {
        global.gc();
        console.log('Memori RAM berhasil dilegakan.');
    } else {
        console.log('Garbage Collection belum aktif.');
    }
});

app.post('/api/admin/send-broadcast', authAdmin, async (req, res) => {
    const { message, type } = req.body;
    if (!message) return res.json({ success: false, message: "Pesan tidak boleh kosong!" });

    try {
        const broadcastId = `BRD-${Date.now()}`;
        const newBroadcast = new Broadcast({
            id: broadcastId,
            type: type || 'info',
            message: xss(message),
            target: 'all',
            status: 'sent',
            scheduled_for: new Date(),
            date: new Date()
        });
        await newBroadcast.save();
        let icon = type === 'promo' ? '🎉' : (type === 'warning' ? '⚠️' : '📢');
        const msgText = `${icon} PENGUMUMAN PENTING\n\n${message}`;
        
        if (TELEGRAM_CHANNEL_INFO && TELEGRAM_BOT_TOKEN) {
            axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                chat_id: TELEGRAM_CHANNEL_INFO, text: msgText, parse_mode: 'Markdown'
            }).catch(()=>{});
        }
        if (typeof WA_CHANNEL_INFO !== 'undefined' && WA_CHANNEL_INFO && sock) {
    try {
        let channelId = WA_CHANNEL_INFO.trim();
        if (!channelId.endsWith('@newsletter')) channelId += '@newsletter';
        await sock.sendMessage(channelId, { text: msgText }); 
    } catch (e) {
        console.log("❌ [GAGAL] Kirim notif ke Channel:", e.message);
    }
}
        res.json({ success: true, message: "Informasi berhasil disebar!" });
    } catch (e) {
        console.log(e);
        res.json({ success: false, message: "Gagal mengirim informasi." });
    }
});

app.post('/api/admin/delete-broadcast', authAdmin, async (req, res) => {
    const { id } = req.body;
    await Broadcast.deleteOne({ id });
    res.json({ success: true, message: "Informasi dihapus." });
});

app.post('/api/check-promo', async (req, res) => {
    const { token, code, category, product_code, amount } = req.body;
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        if (!user) return res.json({ success: false, message: "User tidak ditemukan" });

        const promo = await Promo.findOne({
            code: code.toUpperCase(),
            status: true
        });
        
        if (!promo) {
            return res.json({ success: false, message: "Kode promo tidak valid" });
        }

        const now = new Date();
        if (now < promo.start_date) {
            return res.json({ success: false, message: "Kode promo belum aktif" });
        }
        if (promo.end_date && now > promo.end_date) {
            return res.json({ success: false, message: "Kode promo sudah kadaluarsa" });
        }

        if (promo.applicable_categories && promo.applicable_categories.length > 0) {
            if (!promo.applicable_categories.includes(category)) {
                return res.json({ success: false, message: `Kode promo tidak berlaku untuk kategori ${category}` });
            }
        }

        if (promo.applicable_products && promo.applicable_products.length > 0) {
            if (!promo.applicable_products.includes(product_code)) {
                return res.json({ success: false, message: "Kode promo tidak berlaku untuk produk ini" });
            }
        }

        if (amount < promo.min_purchase) {
            return res.json({
                success: false,
                message: `Minimal pembelian Rp ${promo.min_purchase.toLocaleString()} untuk kode ini`
            });
        }

        if (promo.usage_limit > 0 && promo.used_count >= promo.usage_limit) {
            return res.json({ success: false, message: "Kode promo sudah mencapai batas pemakaian" });
        }

        const userUsage = await PromoUsage.countDocuments({
            promo_code: promo.code,
            username: user.username
        });
        
        if (userUsage >= promo.per_user_limit) {
            return res.json({
                success: false,
                message: `Anda sudah menggunakan kode promo ini (max ${promo.per_user_limit}x)`
            });
        }

        let discountAmount = 0;
        if (promo.discount_type === 'percentage') {
            discountAmount = Math.floor(amount * promo.discount_value / 100);
            if (promo.max_discount && discountAmount > promo.max_discount) {
                discountAmount = promo.max_discount;
            }
        } else {
            discountAmount = promo.discount_value;
        }

        if (discountAmount > amount) {
            discountAmount = amount;
        }

        const finalAmount = amount - discountAmount;

        res.json({
            success: true,
            promo: {
                code: promo.code,
                name: promo.name,
                description: promo.description,
                discount_type: promo.discount_type,
                discount_value: promo.discount_value,
                discount_amount: discountAmount,
                final_amount: finalAmount
            }
        });

    } catch (e) {
        console.log(e);
        res.json({ success: false, message: "Error server" });
    }
});

app.post('/api/admin/promos', authAdmin, async (req, res) => {
    try {
        const promos = await Promo.find().sort({ created_at: -1 });
        res.json({ success: true, data: promos });
    } catch (e) {
        res.json({ success: false, data: [] });
    }
});

app.post('/api/admin/save-promo', authAdmin, async (req, res) => {
    const {
        id, code, name, description, discount_type, discount_value,
        max_discount, min_purchase, applicable_categories, applicable_products,
        start_date, end_date, usage_limit, per_user_limit, status
    } = req.body;

    try {
        let safeStart = new Date(start_date);
        safeStart = new Date(safeStart.getTime() - (24 * 60 * 60 * 1000));

        let safeEnd = null;
        if (end_date) {
            safeEnd = new Date(end_date);
            safeEnd = new Date(safeEnd.getTime() + (24 * 60 * 60 * 1000));
        }

        if (id) {
            await Promo.updateOne(
                { _id: id },
                {
                    code: code.toUpperCase(),
                    name, description, discount_type, discount_value,
                    max_discount, min_purchase,
                    applicable_categories: applicable_categories || [],
                    applicable_products: applicable_products || [],
                    start_date: safeStart,
                    end_date: safeEnd,
                    usage_limit: parseInt(usage_limit) || 0,
                    per_user_limit: parseInt(per_user_limit) || 1,
                    status: status === true
                }
            );
            res.json({ success: true, message: "Promo berhasil diupdate" });
        } else {
            const existing = await Promo.findOne({ code: code.toUpperCase() });
            if (existing) {
                return res.json({ success: false, message: "Kode promo sudah ada" });
            }

            const newPromo = new Promo({
                code: code.toUpperCase(),
                name, description, discount_type, discount_value,
                max_discount, min_purchase,
                applicable_categories: applicable_categories || [],
                applicable_products: applicable_products || [],
                start_date: safeStart,
                end_date: safeEnd,
                usage_limit: parseInt(usage_limit) || 0,
                per_user_limit: parseInt(per_user_limit) || 1,
                status: status === true
            });
            await newPromo.save();
            res.json({ success: true, message: "Promo berhasil dibuat" });
        }
    } catch (e) {
        console.log(e);
        res.json({ success: false, message: "Gagal menyimpan promo" });
    }
});

app.post('/api/admin/delete-promo', authAdmin, async (req, res) => {
    const { id } = req.body;
    try {
        await Promo.deleteOne({ _id: id });
        await PromoUsage.deleteMany({ promo_code: (await Promo.findById(id))?.code });
        res.json({ success: true, message: "Promo dihapus" });
    } catch (e) {
        res.json({ success: false, message: "Gagal hapus" });
    }
});

async function processGamePurchase(user, orderData, order_id_input = null) {
    try {
        const { game, product_code, product_name, target, price, provider_ref_id, provider_message } = orderData;
        
        const trxDate = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
        const nominal = parseInt(price).toLocaleString('id-ID');
        const totalSukses = await Transaction.countDocuments({ status: 'success' }) + 1;

        await sendTrxNotifications({
            user: user, orderId: order_id_input, productName: product_name,
            amount: nominal, trxDate: trxDate, totalSukses: totalSukses,
            type: 'GAME', sendWhatsApp: sendWhatsApp, sock: sock,
            extraData: { target: target, status: 'Proses Provider' }
        });

        logActivity('TOPUP GAME', user, `Item: ${product_name} | Target: ${target}`);
        return true;

    } catch (e) {
        console.log("Error processGamePurchase:", e);
        return false;
    }
}

app.post('/api/game/check/ff', async (req, res) => {
    const { user_id } = req.body;
    if (!user_id) {
        return res.json({ success: false, message: "ID tidak boleh kosong" });
    }

    try {
        const response = await axios.get(`https://api.rikishop.my.id/stalk/ff?id=${user_id}`);
        
        if (response.data && response.data.status) {
            return res.json({
                success: true,
                data: {
                    nickname: response.data.result.nickname,
                    img_url: response.data.result.img_url,
                    region: response.data.result.region,
                    user_id: user_id
                }
            });
        } else {
            return res.json({ success: false, message: response.data.message || "Gagal mengambil data nickname." });
        }
    } catch (error) {
        console.error("Error cek ID FF:", error.message);
        return res.json({ success: false, message: "Gagal terhubung ke server pengecekan." });
    }
});

app.get('/api/game/products/ff', async (req, res) => {
    try {
        const ffFallbackPath = path.join(__dirname, 'data', 'game_ff.json');
        let FF_PRODUCTS = [];
        if (fs.existsSync(ffFallbackPath)) {
            FF_PRODUCTS = JSON.parse(fs.readFileSync(ffFallbackPath, 'utf8'));
        } else {
            return res.json({ success: false, message: "File game_ff.json tidak ditemukan." });
        }

        let liveData = null;
        try {
            const response = await axios.get('https://okeconnect.com/harga/json?id=905ccd028329b0a', { timeout: 5000 });
            if (response.data) liveData = response.data;
        } catch (apiError) {
            console.log("Info: Pusat API Game gagal diload, menggunakan harga JSON cadangan.");
        }

        const ffProducts = FF_PRODUCTS.map(item => {
            let basePrice = item.default_price;
            
            if (liveData) {
                if (Array.isArray(liveData)) {
                    const found = liveData.find(x => x.kode === item.code || x.code === item.code);
                    if (found && found.harga) basePrice = parseInt(found.harga);
                    else if (found && found.price) basePrice = parseInt(found.price);
                } else {
                    if (liveData[item.code] && liveData[item.code].price) {
                        basePrice = parseInt(liveData[item.code].price);
                    }
                }
            }

            const markedUpPrice = Math.ceil(basePrice + (basePrice * (OKE_PROFIT_PERCENT || 20) / 100));

            return {
                code: item.code,
                name: item.name + ' Free Fire',
                price: markedUpPrice,
                provider_price: basePrice,
                description: 'Topup Instant'
            };
        });

        ffProducts.sort((a, b) => a.price - b.price);

        res.json({ success: true, data: ffProducts });

    } catch (error) {
        console.error("Error fetching game products:", error.message);
        res.json({ success: false, message: "Gagal mengambil daftar produk game." });
    }
});

app.post('/api/buy-game/ff', async (req, res) => {
    const { token, product_code, target, method } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        if (!user) return res.json({ success: false, message: "User tidak ditemukan" });

        const ffFallbackPath = path.join(__dirname, 'data', 'game_ff.json');
        let FF_PRODUCTS = [];
        if (fs.existsSync(ffFallbackPath)) {
            FF_PRODUCTS = JSON.parse(fs.readFileSync(ffFallbackPath, 'utf8'));
        } else {
            return res.json({ success: false, message: "File game_ff.json tidak ditemukan." });
        }

        const fallbackProduct = FF_PRODUCTS.find(p => p.code === product_code);
        if (!fallbackProduct) {
            return res.json({ success: false, message: "Kode produk tidak valid." });
        }

        let basePrice = fallbackProduct.default_price;
        let productName = fallbackProduct.name + ' Free Fire';

        try {
            const productListRes = await axios.get('https://okeconnect.com/harga/json?id=905ccd028329b0a', { timeout: 5000 });
            const liveData = productListRes.data;
            if (liveData) {
                if (Array.isArray(liveData)) {
                    const found = liveData.find(x => x.kode === product_code || x.code === product_code);
                    if (found && found.harga) basePrice = parseInt(found.harga);
                    else if (found && found.price) basePrice = parseInt(found.price);
                } else {
                    if (liveData[product_code] && liveData[product_code].price) {
                        basePrice = parseInt(liveData[product_code].price);
                    }
                }
            }
        } catch (e) {
            console.log("Info: Pusat API Game lambat/down saat transaksi, pakai harga default.");
        }

        const nominal = Math.ceil(basePrice + (basePrice * (OKE_PROFIT_PERCENT || 20) / 100));

        let finalAmount = nominal;
        if (req.body.promo_code) {
            if (method === 'qris') {
                return res.json({
                    success: false,
                    message: "Mohon maaf promo ini hanya bisa di beli menggunakan pembayaran saldo, tidak berlaku di pembayaran qris"
                });
            }
            
            const promo = await Promo.findOne({ code: req.body.promo_code.toUpperCase(), status: true });
            if (promo) {
                const userUsage = await PromoUsage.countDocuments({ promo_code: promo.code, username: user.username });
                if (userUsage < promo.per_user_limit) {
                    const now = new Date();
                    if (now >= promo.start_date && (!promo.end_date || now <= promo.end_date)) {
                        
                        let discount = promo.discount_type === 'percentage'
                            ? Math.floor(nominal * promo.discount_value / 100)
                            : promo.discount_value;
                            
                        if (promo.max_discount && discount > promo.max_discount) discount = promo.max_discount;
                        if (discount > nominal) discount = nominal;
                        
                        finalAmount = nominal - discount;
                        
                        promo.used_count += 1;
                        await promo.save();
                        
                        await new PromoUsage({
                            promo_code: promo.code,
                            username: user.username,
                            order_id: "PROMO-" + Date.now()
                        }).save();
                    }
                }
            }
        }

        if (method === 'saldo') {
            if (user.balance < finalAmount) {
                return res.json({ success: false, message: "Saldo tidak cukup!" });
            }

            const refID = Date.now().toString().slice(-8);
            const okeUrl = `${OKE_URL}?memberID=${OKE_MEMBER_ID}&pin=${OKE_PIN}&password=${encodeURIComponent(process.env.OKE_PASSWORD)}&product=${product_code}&dest=${target}&refID=${refID}`;
            
            try {
                const okeResponse = await axios.get(okeUrl);
                const responseText = okeResponse.data;

                const respUpper = responseText.toUpperCase();

                if (respUpper.includes('PROSES') || respUpper.includes('SUKSES') || respUpper.includes('PENDING') || respUpper.includes('BERHASIL') || respUpper.includes('DITERIMA')) {
                    
                    user.balance -= finalAmount;

                    const poinGame = Math.floor(finalAmount / 10000); 
                    if (poinGame > 0) {
                        user.points = (user.points || 0) + poinGame;
                    }

                    await user.save();

                    const order_id = "GM-" + Date.now();
                    
                    const transaction = new Transaction({
                        order_id: order_id,
                        provider_oid: refID,
                        username: user.username,
                        fullname: user.fullname,
                        amount: nominal,
                        pay_amount: finalAmount,
                        status: 'success',
                        type: 'buy_game',
                        product_data: {
                            game: 'freefire',
                            product_code: product_code,
                            product_name: productName,
                            target: target,
                            provider_ref_id: refID,
                            provider_message: responseText
                        },
                        qr_string: '-',
                        date: new Date()
                    });
                    await transaction.save();

                    await processGamePurchase(user, {
                        game: 'freefire',
                        product_code: product_code,
                        product_name: productName,
                        target: target,
                        price: nominal,
                        provider_ref_id: refID,
                        provider_message: responseText
                    }, order_id);

                    return res.json({ success: true, message: "Pesanan sedang diproses provider!", type: 'instant' });

                } else {
                    return res.json({ success: false, message: "Gagal dari Pusat: " + responseText });
                }

            } catch (apiError) {
                console.error("Okeconnect API Error:", apiError.message);
                return res.json({ success: false, message: "Gagal terhubung ke provider game." });
            }

        } else if (method === 'qris') {
            const order_id = "GM-" + Date.now();
            const amountToSend = finalAmount + parseInt(process.env.ADMIN_FEE || 0);
            
            const response = await axios.post('https://app.pakasir.com/api/transactioncreate/qris', {
                project: PAKASIR_SLUG, order_id: order_id, amount: amountToSend, api_key: PAKASIR_API_KEY
            });

            if (response.data && response.data.payment) {
                const payData = response.data.payment;
                const realAmount = payData.total_payment ? parseInt(payData.total_payment) : amountToSend;

                const transaction = new Transaction({
                    order_id: order_id,
                    username: user.username,
                    fullname: user.fullname,
                    amount: nominal,
                    pay_amount: realAmount,
                    status: 'pending',
                    type: 'buy_game',
                    product_data: {
                        game: 'freefire',
                        product_code: product_code,
                        product_name: productName,
                        target: target
                    },
                    qr_string: payData.payment_number,
                    date: new Date()
                });
                await transaction.save();

                logActivity('ORDER GAME (QRIS)', user, `Pending Payment: ${realAmount}`);
                return res.json({
                    success: true,
                    type: 'qris',
                    qr_string: payData.payment_number,
                    order_id,
                    amount: nominal,
                    pay_amount: realAmount
                });
            } else {
                return res.json({ success: false, message: "Gagal generate QRIS" });
            }
        }

    } catch (e) {
        console.log(e);
        res.json({ success: false, message: "Error Server" });
    }
});

app.post('/api/generate-personal-qris', async (req, res) => {
    const { token, amount } = req.body;
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        if (!user) return res.json({ success: false, message: "User tidak ditemukan" });

        const transferAmount = parseInt(amount);
        if (transferAmount < 1000) {
            return res.json({ success: false, message: "Minimal transfer Rp 1.000" });
        }

        const order_id = `TRF-${user.username}-${Date.now()}`;
        
        const response = await axios.post('https://app.pakasir.com/api/transactioncreate/qris', {
            project: PAKASIR_SLUG,
            order_id: order_id,
            amount: transferAmount,
            api_key: PAKASIR_API_KEY
        });

        if (response.data && response.data.payment) {
            const payData = response.data.payment;
            
            const transaction = new Transaction({
                order_id: order_id,
                username: user.username,
                fullname: user.fullname,
                amount: transferAmount,
                pay_amount: transferAmount,
                status: 'pending',
                type: 'transfer_personal',
                qr_string: payData.payment_number,
                product_data: {
                    recipient: null,
                    is_personal_qris: true
                },
                date: new Date()
            });
            await transaction.save();

            res.json({
                success: true,
                qr_string: payData.payment_number,
                order_id: order_id,
                amount: transferAmount
            });
        } else {
            res.json({ success: false, message: "Gagal generate QRIS" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error generating QRIS" });
    }
});

app.post('/api/check-incoming-transfer', async (req, res) => {
    const { token } = req.body;
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        if (!user) return res.json({ success: false, message: "User tidak ditemukan" });

        const incomingTransfers = await Transaction.find({
            order_id: new RegExp(`^TRF-${user.username}-`),
            status: 'pending',
            type: 'transfer_personal'
        }).sort({ date: -1 });

        res.json({ success: true, data: incomingTransfers });
    } catch (error) {
        console.log(error);
        res.json({ success: false, data: [] });
    }
});

app.post('/api/process-transfer', async (req, res) => {
    const { token, recipient_username, amount, method } = req.body;
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const sender = await User.findOne({ username: decoded.username });
        if (!sender) return res.json({ success: false, message: "Pengirim tidak ditemukan" });

        const recipient = await User.findOne({ username: recipient_username.toLowerCase() });
        if (!recipient) return res.json({ success: false, message: "Username penerima tidak ditemukan!" });
        if (sender.username === recipient.username) return res.json({ success: false, message: "Tidak bisa transfer ke diri sendiri!" });

        const transferAmount = parseInt(amount);
        if (transferAmount < 1000) return res.json({ success: false, message: "Minimal transfer Rp 1.000" });
        if (sender.balance < transferAmount) return res.json({ success: false, message: "Saldo tidak cukup!" });

        if (method === 'saldo') {
            sender.balance -= transferAmount;
            recipient.balance += transferAmount;
            await sender.save();
            await recipient.save();

            const senderTrx = new Transaction({
                order_id: `TRF-OUT-${Date.now()}`, username: sender.username, fullname: sender.fullname,
                amount: transferAmount, pay_amount: transferAmount, status: 'success', type: 'transfer_out',
                product_data: { recipient: recipient.username, recipient_name: recipient.fullname }, date: new Date()
            });
            await senderTrx.save();

            const recipientTrx = new Transaction({
                order_id: `TRF-IN-${Date.now()}`, username: recipient.username, fullname: recipient.fullname,
                amount: transferAmount, pay_amount: transferAmount, status: 'success', type: 'transfer_in',
                product_data: { sender: sender.username, sender_name: sender.fullname }, date: new Date()
            });
            await recipientTrx.save();

            await sendTransferNotification({
                sender: sender, recipient: recipient, amount: transferAmount, sock: sock
            });

            logActivity('TRANSFER KELUAR', sender, `Transfer ke ${recipient.username}: Rp ${transferAmount}`);
            logActivity('TRANSFER MASUK', recipient, `Dari ${sender.username}: Rp ${transferAmount}`);

            return res.json({ success: true, message: "Transfer berhasil!", sender_balance: sender.balance, recipient_balance: recipient.balance });
        } else {
            return res.json({ success: false, message: "Transfer hanya bisa menggunakan saldo" });
        }
    } catch (e) {
        console.log(e);
        res.json({ success: false, message: "Error Server" });
    }
});

app.post('/api/check-transfer-payment', async (req, res) => {
    const { order_id } = req.body;

    const trx = await Transaction.findOne({ order_id });
    if (!trx) {
        return res.json({ success: false, message: "Transaksi tidak ditemukan" });
    }

    try {
        const response = await axios.get(`https://app.pakasir.com/api/transactiondetail?project=${PAKASIR_SLUG}&order_id=${order_id}&api_key=${PAKASIR_API_KEY}`);
        const pData = response.data.transaction;

        if (pData && (pData.status === 'completed' || pData.status === 'success' || pData.status === 'paid')) {
            trx.status = 'success';
            await trx.save();

            const match = order_id.match(/^TRF-([^-]+)-/);
            if (match) {
                const recipientUsername = match[1];
                const recipient = await User.findOne({ username: recipientUsername });
                const sender = await User.findOne({ username: trx.username });

                if (recipient && sender) {
                    recipient.balance += trx.amount;
                    await recipient.save();

                    const recipientTrx = new Transaction({
                        order_id: `TRF-IN-${Date.now()}`,
                        username: recipient.username,
                        fullname: recipient.fullname,
                        amount: trx.amount,
                        pay_amount: trx.amount,
                        status: 'success',
                        type: 'transfer_in',
                        product_data: {
                            sender: sender.username,
                            sender_name: sender.fullname
                        },
                        date: new Date()
                    });
                    await recipientTrx.save();
                    await sendTransferNotification({
                        sender: sender,
                        recipient: recipient,
                        amount: trx.amount,
                        sock: sock
                    });
                }
            }

            return res.json({ success: true, status: 'success' });
        }

        res.json({ success: true, status: 'pending' });
    } catch (e) {
        res.json({ success: false, message: "Gagal cek status" });
    }
});

app.post('/api/generate-transfer-qris', async (req, res) => {
    const { token, recipient, amount } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const sender = await User.findOne({ username: decoded.username });
        if (!sender) return res.json({ success: false, message: "User tidak ditemukan" });

        const recipientUser = await User.findOne({ username: recipient.toLowerCase() });
        if (!recipientUser) {
            return res.json({ success: false, message: "Username penerima tidak ditemukan!" });
        }

        if (sender.username === recipientUser.username) {
            return res.json({ success: false, message: "Tidak bisa transfer ke diri sendiri!" });
        }

        const transferAmount = parseInt(amount);
        if (transferAmount < 1000) {
            return res.json({ success: false, message: "Minimal transfer Rp 1.000" });
        }

        const order_id = `TRFQ-${sender.username}-${recipientUser.username}-${Date.now()}`;
        
        const response = await axios.post('https://app.pakasir.com/api/transactioncreate/qris', {
            project: PAKASIR_SLUG,
            order_id: order_id,
            amount: transferAmount,
            api_key: PAKASIR_API_KEY
        });

        if (response.data && response.data.payment) {
            const payData = response.data.payment;
            const realAmount = payData.total_payment ? parseInt(payData.total_payment) : transferAmount;

            const transaction = new Transaction({
                order_id: order_id,
                username: sender.username,
                fullname: sender.fullname,
                amount: transferAmount,
                pay_amount: realAmount,
                status: 'pending',
                type: 'transfer_qris',
                product_data: {
                    sender: sender.username,
                    sender_name: sender.fullname,
                    recipient: recipientUser.username,
                    recipient_name: recipientUser.fullname,
                    is_transfer: true
                },
                qr_string: payData.payment_number,
                date: new Date()
            });
            await transaction.save();

            return res.json({
                success: true,
                qr_string: payData.payment_number,
                order_id: order_id,
                amount: transferAmount,
                pay_amount: realAmount,
                username: sender.username,
                recipient: recipientUser.username
            });
        } else {
            return res.json({ success: false, message: "Gagal generate QRIS" });
        }
    } catch (e) {
        console.log(e);
        res.json({ success: false, message: "Error Server" });
    }
});

app.post('/api/admin/system-stats', authAdmin, async (req, res) => {
    try {
        let dbStats = { dataSize: 0, objects: 0 };
        if (mongoose.connection.readyState === 1) {
            dbStats = await mongoose.connection.db.command({ dbStats: 1 });
        }
        
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;

        res.json({
            success: true,
            data: {
                db_size: dbStats.dataSize,
                db_objects: dbStats.objects,
                ram_total: totalMem,
                ram_used: usedMem,
                ram_free: freeMem
            }
        });
    } catch (e) {
        console.error(e);
        res.json({ success: false, message: "Gagal mengambil statistik sistem." });
    }
});

app.post('/api/admin/system-cleanup', authAdmin, async (req, res) => {
    try {
        let deletedFiles = 0;
        
        const sessionPath = path.join(__dirname, 'auth_info_baileys');
        if (fs.existsSync(sessionPath)) {
            const files = fs.readdirSync(sessionPath);
            files.forEach(file => {
                if (file !== 'creds.json') {
                    try {
                        fs.unlinkSync(path.join(sessionPath, file));
                        deletedFiles++;
                    } catch(e) {}
                }
            });
        }

        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const deletedTrx = await Transaction.deleteMany({ status: 'pending', date: { $lt: oneDayAgo } });

        if (global.gc) {
            global.gc();
        }

        res.json({
            success: true,
            message: `Pembersihan selesai! ${deletedFiles} file sampah WA & ${deletedTrx.deletedCount} trx kedaluwarsa dihapus. Cache RAM dilegakan.`
        });
    } catch (e) {
        console.error(e);
        res.json({ success: false, message: "Gagal melakukan pembersihan sistem." });
    }
});

app.post('/api/admin/ptero-servers-all', authAdmin, async (req, res) => {
    try {
        const response = await axios.get(`${PTERO_URL}/api/application/servers?include=user&per_page=1000`, { headers: PTERO_HEADERS });
        
        const servers = response.data.data.map(s => {
            const attr = s.attributes;
            const user = attr.relationships && attr.relationships.user ? attr.relationships.user.attributes : {};
            return {
                id: attr.id,
                uuid: attr.uuid,
                identifier: attr.identifier,
                name: attr.name,
                limits: attr.limits,
                user_id: user.id || null,
                username: user.username || 'Tidak Diketahui',
                email: user.email || 'Tidak Diketahui',
            };
        });
        
        res.json({ success: true, data: servers });
    } catch (e) {
        console.error("Fetch All Servers Error:", e.message);
        res.json({ success: false, message: "Gagal mengambil data dari Pterodactyl" });
    }
});

app.post('/api/admin/delete-ptero-server', authAdmin, async (req, res) => {
    const { server_id, user_id } = req.body;
    try {
        await axios.delete(`${PTERO_URL}/api/application/servers/${server_id}`, { headers: PTERO_HEADERS });
        
        if (user_id) {
            try {
                await axios.delete(`${PTERO_URL}/api/application/users/${user_id}`, { headers: PTERO_HEADERS });
            } catch (eu) {
                console.log(`Gagal hapus user ${user_id}:`, eu.message);
            }
        }

        await Panel.deleteOne({ id: server_id });

        res.json({ success: true, message: "Server dan User Pterodactyl berhasil dimusnahkan!" });
    } catch (e) {
        console.error(e);
        res.json({ success: false, message: "Gagal menghapus server dari Pterodactyl." });
    }
});

async function processEWalletPurchase(user, orderData, order_id_input = null) {
    try {
        const { product_code, product_name, target, price, provider_ref_id, provider_message } = orderData;
        
        const trxDate = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
        const nominal = parseInt(price).toLocaleString('id-ID');
        const totalSukses = await Transaction.countDocuments({ status: 'success' }) + 1;

        await sendTrxNotifications({
            user: user,
            orderId: order_id_input,
            productName: product_name,
            amount: nominal,
            trxDate: trxDate,
            totalSukses: totalSukses,
            type: 'EWALLET',
            sendWhatsApp: sendWhatsApp,
            sock: sock,
            extraData: {
                target: target,
                status: 'Sukses',
                provider: 'DANA'
            }
        });

        logActivity('TOPUP EWALLET', user, `Item: ${product_name} | Target: ${target}`);
        return true;

    } catch (e) {
        console.log("Error processEWalletPurchase:", e);
        return false;
    }
}

app.post('/api/ewallet/check/dana', async (req, res) => {
    const { phone_number } = req.body;
    if (!phone_number) return res.json({ success: false, message: "Nomor tidak boleh kosong" });
    let cleanNumber = phone_number.replace(/[^0-9]/g, '');
    if (cleanNumber.startsWith('62')) cleanNumber = '0' + cleanNumber.substring(2);
    if (cleanNumber.length < 10 || cleanNumber.length > 13) {
        return res.json({ success: false, message: "Nomor tidak valid (harus 10-13 digit)" });
    }

    return res.json({
        success: true,
        data: {
            number: cleanNumber,
            name: `User DANA (${cleanNumber.slice(-4)})`,
            registered: true,
            provider: 'DANA'
        }
    });
});

app.get('/api/ewallet/products/dana', async (req, res) => {
    try {
        

        let liveData = null;
        try {
            const response = await axios.get('https://okeconnect.com/harga/json?id=905ccd028329b0a', { timeout: 5000 });
            if (response.data) liveData = response.data;
        } catch (apiError) {
            console.log("Info: Pusat API E-Wallet gagal diload, menggunakan harga JSON cadangan.");
        }

        const ewalletProducts = DANA_PRODUCTS.map(item => {
            let basePrice = item.default_price;
            
            if (liveData) {
                if (Array.isArray(liveData)) {
                    const found = liveData.find(x => x.kode === item.code || x.code === item.code);
                    if (found && found.harga) basePrice = parseInt(found.harga);
                    else if (found && found.price) basePrice = parseInt(found.price);
                } else {
                    if (liveData[item.code] && liveData[item.code].price) {
                        basePrice = parseInt(liveData[item.code].price);
                    }
                }
            }

            let fee = 350;
            if (item.nominal > 500000) {
                fee = 500;
            }
            
            const markedUpPrice = basePrice + fee;

            return {
                code: item.code,
                name: item.name,
                nominal: item.nominal,
                price: markedUpPrice,
                provider_price: basePrice,
                description: `Topup DANA ${item.name}`,
                icon: 'https://api.deline.web.id/RzSYWF9Wxz.jpeg'
            };
        });

        ewalletProducts.sort((a, b) => a.nominal - b.nominal);

        res.json({ success: true, data: ewalletProducts });

    } catch (error) {
        console.error("Error fetching ewallet products:", error.message);
        res.json({ success: false, message: "Gagal mengambil daftar produk e-wallet." });
    }
});

app.post('/api/buy-ewallet/dana', async (req, res) => {
    const { token, product_code, target, method, promo_code, final_amount } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        if (!user) return res.json({ success: false, message: "User tidak ditemukan" });

        

        const fallbackProduct = DANA_PRODUCTS.find(p => p.code === product_code);
        if (!fallbackProduct) {
            return res.json({ success: false, message: "Kode produk tidak valid." });
        }

        let basePrice = fallbackProduct.default_price;
        let productName = fallbackProduct.name;

        try {
            const productListRes = await axios.get('https://okeconnect.com/harga/json?id=905ccd028329b0a', { timeout: 5000 });
            const liveData = productListRes.data;
            if (liveData) {
                if (Array.isArray(liveData)) {
                    const found = liveData.find(x => x.kode === product_code || x.code === product_code);
                    if (found && found.harga) basePrice = parseInt(found.harga);
                    else if (found && found.price) basePrice = parseInt(found.price);
                } else {
                    if (liveData[product_code] && liveData[product_code].price) {
                        basePrice = parseInt(liveData[product_code].price);
                    }
                }
            }
        } catch (e) {
            console.log("Info: Pusat API E-Wallet lambat/down saat transaksi, pakai harga default.");
        }

        let fee = 200;
        if (fallbackProduct.nominal > 500000) {
            fee = 250;
        }
        
        const nominal = basePrice + fee;
        
        let finalAmount = final_amount || nominal;
        
        if (promo_code && method === 'saldo') {
            const promo = await Promo.findOne({ code: promo_code.toUpperCase(), status: true });
            if (promo) {
                const userUsage = await PromoUsage.countDocuments({ promo_code: promo.code, username: user.username });
                if (userUsage < promo.per_user_limit) {
                    const now = new Date();
                    if (now >= promo.start_date && (!promo.end_date || now <= promo.end_date)) {
                        
                        let discount = promo.discount_type === 'percentage'
                            ? Math.floor(nominal * promo.discount_value / 100)
                            : promo.discount_value;
                            
                        if (promo.max_discount && discount > promo.max_discount) discount = promo.max_discount;
                        if (discount > nominal) discount = nominal;
                        
                        finalAmount = nominal - discount;
                        
                        promo.used_count += 1;
                        await promo.save();
                        
                        await new PromoUsage({
                            promo_code: promo.code,
                            username: user.username,
                            order_id: "PROMO-" + Date.now()
                        }).save();
                    }
                }
            }
        }

        if (method === 'saldo') {
            if (user.balance < finalAmount) {
                return res.json({ success: false, message: "Saldo tidak cukup!" });
            }

            let cleanTarget = target.replace(/[^0-9]/g, '');
            if (cleanTarget.startsWith('62') && cleanTarget.length >= 10) cleanTarget = '0' + cleanTarget.substring(2);
            
            const refID = Date.now().toString().slice(-8);
            const okeUrl = `${OKE_URL}?memberID=${OKE_MEMBER_ID}&pin=${OKE_PIN}&password=${encodeURIComponent(process.env.OKE_PASSWORD)}&product=${product_code}&dest=${cleanTarget}&refID=${refID}`;
            
            try {
                const okeResponse = await axios.get(okeUrl);
                const responseText = okeResponse.data;
                const respUpper = responseText.toUpperCase();

                if (respUpper.includes('NOMOR TIDAK TERDAFTAR') ||
                    respUpper.includes('INVALID DESTINATION') ||
                    respUpper.includes('GAGAL') ||
                    respUpper.includes('SALAH') ||
                    respUpper.includes('TIDAK DAPAT DIPROSES')) {
                    
                    return res.json({
                        success: false,
                        message: "Gagal: " + responseText,
                        refund: true
                    });
                }

                if (respUpper.includes('PROSES') || respUpper.includes('SUKSES') || respUpper.includes('BERHASIL')) {
                    
                    user.balance -= finalAmount;
                    
                    const poinPanel = Math.floor(finalAmount / 10000); 
            if (poinPanel > 0) {
                user.points = (user.points || 0) + poinPanel;
            }
                    
                    await user.save();

                    const order_id = "EW-" + Date.now();
                    
                    const transaction = new Transaction({
                        order_id: order_id,
                        provider_oid: refID,
                        username: user.username,
                        fullname: user.fullname,
                        amount: nominal,
                        pay_amount: finalAmount,
                        status: 'success',
                        type: 'buy_ewallet',
                        product_data: {
                            provider: 'dana',
                            product_code: product_code,
                            product_name: productName,
                            target: target,
                            nominal: fallbackProduct.nominal,
                            provider_ref_id: refID,
                            provider_message: responseText
                        },
                        qr_string: '-',
                        date: new Date()
                    });
                    await transaction.save();

                    await processEWalletPurchase(user, {
                        provider: 'dana',
                        product_code: product_code,
                        product_name: productName,
                        target: target,
                        price: nominal,
                        provider_ref_id: refID,
                        provider_message: responseText
                    }, order_id);

                    return res.json({
                        success: true,
                        message: "Topup DANA sedang diproses!",
                        type: 'instant',
                        data: {
                            order_id,
                            target,
                            amount: nominal
                        }
                    });

                } else {
                    return res.json({ success: false, message: "Gagal dari Pusat: " + responseText });
                }

            } catch (apiError) {
                console.error("Okeconnect API Error:", apiError.message);
                return res.json({ success: false, message: "Gagal terhubung ke provider e-wallet." });
            }

        } else if (method === 'qris') {
            const order_id = "EW-" + Date.now();
            const amountToSend = finalAmount + parseInt(process.env.ADMIN_FEE || 0);
            
            const response = await axios.post('https://app.pakasir.com/api/transactioncreate/qris', {
                project: PAKASIR_SLUG,
                order_id: order_id,
                amount: amountToSend,
                api_key: PAKASIR_API_KEY
            });

            if (response.data && response.data.payment) {
                const payData = response.data.payment;
                const realAmount = payData.total_payment ? parseInt(payData.total_payment) : amountToSend;

                const transaction = new Transaction({
                    order_id: order_id,
                    username: user.username,
                    fullname: user.fullname,
                    amount: nominal,
                    pay_amount: realAmount,
                    status: 'pending',
                    type: 'buy_ewallet',
                    product_data: {
                        provider: 'dana',
                        product_code: product_code,
                        product_name: productName,
                        target: target,
                        nominal: fallbackProduct.nominal
                    },
                    qr_string: payData.payment_number,
                    date: new Date()
                });
                await transaction.save();

                logActivity('ORDER EWALLET (QRIS)', user, `Pending Payment: ${realAmount}`);
                return res.json({
                    success: true,
                    type: 'qris',
                    qr_string: payData.payment_number,
                    order_id,
                    amount: nominal,
                    pay_amount: realAmount
                });
            } else {
                return res.json({ success: false, message: "Gagal generate QRIS" });
            }
        }

    } catch (e) {
        console.log(e);
        res.json({ success: false, message: "Error Server" });
    }
});

app.post('/api/ewallet/check-status', async (req, res) => {
    const { token, provider_oid, target, product_code } = req.body;
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        if(!user) return res.json({ success: false });

        const checkUrl = `${OKE_URL}?memberID=${OKE_MEMBER_ID}&pin=${OKE_PIN}&password=${encodeURIComponent(process.env.OKE_PASSWORD)}&product=${product_code}&dest=${target}&refID=${provider_oid}&check=1`;
        
        const response = await axios.get(checkUrl);
        const responseText = response.data;
        const respUpper = responseText.toUpperCase();

        let status = 'pending';
        let message = responseText;
        let sn = '';

        if (respUpper.includes('SUKSES')) {
            status = 'success';
            const snMatch = responseText.match(/SN:\s*([^\s]+)/i);
            if (snMatch) sn = snMatch[1];
        } else if (respUpper.includes('GAGAL')) {
            status = 'failed';
        } else if (respUpper.includes('BELUM ADA') || respUpper.includes('TIDAK ADA')) {
            status = 'not_found';
        }

        res.json({
            success: true,
            data: {
                status: status,
                message: message,
                sn: sn
            }
        });

    } catch (e) {
        console.log(e);
        res.json({ success: false, message: "Error koneksi provider" });
    }
});

app.post('/api/ewallet/check/gopay-driver', async (req, res) => {
    const { phone_number } = req.body;
    if (!phone_number) return res.json({ success: false, message: "Nomor tidak boleh kosong" });

    let cleanNumber = phone_number.replace(/[^0-9]/g, '');
    if (cleanNumber.startsWith('0')) cleanNumber = '62' + cleanNumber.substring(1);
    
    if (cleanNumber.length < 10 || cleanNumber.length > 13) {
        return res.json({ success: false, message: "Nomor tidak valid (10-13 digit)" });
    }

    return res.json({
        success: true,
        data: {
            number: cleanNumber,
            name: `Driver (${cleanNumber.slice(-4)})`,
            registered: true,
            provider: 'GOPAY_DRIVER'
        }
    });
});

app.get('/api/ewallet/products/gopay-driver', async (req, res) => {
    try {
        

        let liveData = null;
        try {
            const response = await axios.get('https://okeconnect.com/harga/json?id=905ccd028329b0a', { timeout: 5000 });
            if (response.data) liveData = response.data;
        } catch (e) { console.log("Info: API Pusat lambat, pakai harga default GoPay Driver."); }

        const products = GOPAY_DRIVER_PRODUCTS.map(item => {
            let basePrice = item.default_price;
            if (liveData) {
                if (Array.isArray(liveData)) {
                    const found = liveData.find(x => x.kode === item.code || x.code === item.code);
                    if (found && found.harga) basePrice = parseInt(found.harga);
                } else if (liveData[item.code] && liveData[item.code].price) {
                    basePrice = parseInt(liveData[item.code].price);
                }
            }

            let fee = item.nominal > 500000 ? 250 : 200;
            const markedUpPrice = basePrice + fee;

            return {
                code: item.code, name: item.name, nominal: item.nominal,
                price: markedUpPrice, provider_price: basePrice,
                icon: 'https://api.deline.web.id/seNZ6Uj3C2.png'
            };
        });

        res.json({ success: true, data: products });
    } catch (error) { res.json({ success: false, message: "Gagal mengambil daftar produk." }); }
});

app.post('/api/buy-ewallet/gopay-driver', async (req, res) => {
    const { token, product_code, target, method } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        if (!user) return res.json({ success: false, message: "User tidak ditemukan" });

        const checkList = await axios.get(`http://localhost:${PORT}/api/ewallet/products/gopay-driver`);
        if(!checkList.data.success) return res.json({ success: false, message: "Gagal cek harga" });
        
        const selectedProd = checkList.data.data.find(p => p.code === product_code);
        if(!selectedProd) return res.json({ success: false, message: "Produk tidak valid" });

        const nominal = selectedProd.price;
        let finalAmount = nominal;
        
        if (req.body.promo_code) {
            if (method === 'qris') return res.json({ success: false, message: "Promo hanya untuk saldo!" });
            const promo = await Promo.findOne({ code: req.body.promo_code.toUpperCase(), status: true });
            if (promo) {
                let discount = promo.discount_type === 'percentage' ? Math.floor(nominal * promo.discount_value / 100) : promo.discount_value;
                if (promo.max_discount && discount > promo.max_discount) discount = promo.max_discount;
                finalAmount = nominal - discount;
                
                promo.used_count += 1;
                await promo.save();
                await new PromoUsage({ promo_code: promo.code, username: user.username, order_id: "PROMO-" + Date.now() }).save();
            }
        }

        if (method === 'saldo') {
            if (user.balance < finalAmount) return res.json({ success: false, message: "Saldo tidak cukup!" });
            let cleanTarget = target.replace(/[^0-9]/g, '');
            if (cleanTarget.startsWith('62') && cleanTarget.length >= 10) cleanTarget = '0' + cleanTarget.slice(2);

            const refID = Date.now().toString().slice(-8);
            const okeUrl = `${OKE_URL}?memberID=${OKE_MEMBER_ID}&pin=${OKE_PIN}&password=${encodeURIComponent(process.env.OKE_PASSWORD)}&product=${product_code}&dest=${cleanTarget}&refID=${refID}`;
            
            try {
                const okeResponse = await axios.get(okeUrl);
                const responseText = okeResponse.data.toUpperCase();

                if (responseText.includes('GAGAL') || responseText.includes('SALAH') || responseText.includes('TIDAK TERDAFTAR')) {
                    return res.json({ success: false, message: "Gagal: " + okeResponse.data });
                }

                if (responseText.includes('PROSES') || responseText.includes('SUKSES') || responseText.includes('BERHASIL')) {
                    user.balance -= finalAmount;
                    
                    const poinPanel = Math.floor(finalAmount / 10000); 
            if (poinPanel > 0) {
                user.points = (user.points || 0) + poinPanel;
            }
                    
                    await user.save();

                    const order_id = "GJD-" + Date.now();
                    const transaction = new Transaction({
                        order_id: order_id, provider_oid: refID, username: user.username, fullname: user.fullname,
                        amount: nominal, pay_amount: finalAmount, status: 'success', type: 'buy_ewallet',
                        product_data: { provider: 'gopay_driver', product_code, product_name: selectedProd.name, target, nominal: selectedProd.nominal },
                        qr_string: '-', date: new Date()
                    });
                    await transaction.save();

                    await processEWalletPurchase(user, { provider: 'gopay_driver', product_code, product_name: selectedProd.name, target, price: nominal }, order_id);
                    return res.json({ success: true, message: "Topup sedang diproses!", type: 'instant' });
                } else {
                    return res.json({ success: false, message: "Respon Provider: " + okeResponse.data });
                }
            } catch (e) { return res.json({ success: false, message: "Gagal koneksi ke pusat." }); }

        } else if (method === 'qris') {
            const order_id = "GJD-" + Date.now();
            const amountToSend = finalAmount + parseInt(process.env.ADMIN_FEE || 0);
            
            const response = await axios.post('https://app.pakasir.com/api/transactioncreate/qris', { project: PAKASIR_SLUG, order_id, amount: amountToSend, api_key: PAKASIR_API_KEY });

            if (response.data && response.data.payment) {
                const payData = response.data.payment;
                const realAmount = payData.total_payment ? parseInt(payData.total_payment) : amountToSend;

                const transaction = new Transaction({
                    order_id, username: user.username, fullname: user.fullname, amount: nominal, pay_amount: realAmount, status: 'pending', type: 'buy_ewallet',
                    product_data: { provider: 'gopay_driver', product_code, product_name: selectedProd.name, target, nominal: selectedProd.nominal },
                    qr_string: payData.payment_number, date: new Date()
                });
                await transaction.save();

                logActivity('ORDER GOPAY DRIVER (QRIS)', user, `Pending: ${realAmount}`);
                return res.json({ success: true, type: 'qris', qr_string: payData.payment_number, order_id, amount: nominal, pay_amount: realAmount });
            } else { return res.json({ success: false, message: "Gagal QRIS" }); }
        }
    } catch (e) { res.json({ success: false, message: "Error System" }); }
});

app.post('/api/ewallet/check/gopay', async (req, res) => {
    const { phone_number } = req.body;
    if (!phone_number) return res.json({ success: false, message: "Nomor tidak boleh kosong" });

    let cleanNumber = phone_number.replace(/[^0-9]/g, '');
    if (cleanNumber.startsWith('62')) cleanNumber = '0' + cleanNumber.substring(2);
    
    if (cleanNumber.length < 10 || cleanNumber.length > 13) {
        return res.json({ success: false, message: "Nomor tidak valid (harus 10-13 digit)" });
    }

    return res.json({
        success: true,
        data: {
            number: cleanNumber,
            name: `User GOPAY (${cleanNumber.slice(-4)})`,
            registered: true,
            provider: 'GOPAY'
        }
    });
});

app.get('/api/ewallet/products/gopay', async (req, res) => {
    try {
        

        let liveData = null;
        try {
            const response = await axios.get('https://okeconnect.com/harga/json?id=905ccd028329b0a', { timeout: 5000 });
            if (response.data) liveData = response.data;
        } catch (e) { console.log("Info: API Pusat lambat, pakai harga default GoPay."); }

        const products = GOPAY_PRODUCTS.map(item => {
            let basePrice = item.default_price;
            if (liveData) {
                if (Array.isArray(liveData)) {
                    const found = liveData.find(x => x.kode === item.code || x.code === item.code);
                    if (found && found.harga) basePrice = parseInt(found.harga);
                } else if (liveData[item.code] && liveData[item.code].price) {
                    basePrice = parseInt(liveData[item.code].price);
                }
            }
            let fee = 350;
            if (item.nominal > 500000) {
                fee = 500;
            }
            const markedUpPrice = basePrice + fee;

            return {
                code: item.code, name: item.name, nominal: item.nominal,
                price: markedUpPrice, provider_price: basePrice,
                icon: 'https://api.deline.web.id/2nnwaEpb4o.jpeg',
                isPromo: item.code.startsWith('GJK')
            };
        });

        products.sort((a, b) => a.nominal - b.nominal);

        res.json({ success: true, data: products });
    } catch (error) { res.json({ success: false, message: "Gagal mengambil daftar produk." }); }
});

app.post('/api/buy-ewallet/gopay', async (req, res) => {
    const { token, product_code, target, method } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        if (!user) return res.json({ success: false, message: "User tidak ditemukan" });

        const checkList = await axios.get(`http://localhost:${PORT}/api/ewallet/products/gopay`);
        if(!checkList.data.success) return res.json({ success: false, message: "Gagal cek harga" });
        
        const selectedProd = checkList.data.data.find(p => p.code === product_code);
        if(!selectedProd) return res.json({ success: false, message: "Produk tidak valid" });

        const nominal = selectedProd.price;
        let finalAmount = nominal;
        
        if (req.body.promo_code) {
            if (method === 'qris') return res.json({ success: false, message: "Promo hanya untuk saldo!" });
            const promo = await Promo.findOne({ code: req.body.promo_code.toUpperCase(), status: true });
            if (promo) {
                let discount = promo.discount_type === 'percentage' ? Math.floor(nominal * promo.discount_value / 100) : promo.discount_value;
                if (promo.max_discount && discount > promo.max_discount) discount = promo.max_discount;
                finalAmount = nominal - discount;
                
                promo.used_count += 1;
                await promo.save();
                await new PromoUsage({ promo_code: promo.code, username: user.username, order_id: "PROMO-" + Date.now() }).save();
            }
        }

        if (method === 'saldo') {
            if (user.balance < finalAmount) return res.json({ success: false, message: "Saldo tidak cukup!" });
            let cleanTarget = target.replace(/[^0-9]/g, '');
            if (cleanTarget.startsWith('62') && cleanTarget.length >= 10) cleanTarget = '0' + cleanTarget.slice(2);

            const refID = Date.now().toString().slice(-8);
            const okeUrl = `${OKE_URL}?memberID=${OKE_MEMBER_ID}&pin=${OKE_PIN}&password=${encodeURIComponent(process.env.OKE_PASSWORD)}&product=${product_code}&dest=${cleanTarget}&refID=${refID}`;
            
            try {
                const okeResponse = await axios.get(okeUrl);
                const responseText = okeResponse.data.toUpperCase();

                if (responseText.includes('GAGAL') || responseText.includes('SALAH') || responseText.includes('TIDAK TERDAFTAR')) {
                    return res.json({ success: false, message: "Gagal: " + okeResponse.data });
                }

                if (responseText.includes('PROSES') || responseText.includes('SUKSES') || responseText.includes('BERHASIL')) {
                    user.balance -= finalAmount;
                    
                    const poinPanel = Math.floor(finalAmount / 10000); 
            if (poinPanel > 0) {
                user.points = (user.points || 0) + poinPanel;
            }
                    
                    await user.save();

                    const order_id = "GPY-" + Date.now();
                    const transaction = new Transaction({
                        order_id: order_id, provider_oid: refID, username: user.username, fullname: user.fullname,
                        amount: nominal, pay_amount: finalAmount, status: 'success', type: 'buy_ewallet',
                        product_data: { provider: 'gopay', product_code, product_name: selectedProd.name, target, nominal: selectedProd.nominal },
                        qr_string: '-', date: new Date()
                    });
                    await transaction.save();

                    await processEWalletPurchase(user, { provider: 'gopay', product_code, product_name: selectedProd.name, target, price: nominal }, order_id);
                    return res.json({ success: true, message: "Topup sedang diproses!", type: 'instant' });
                } else {
                    return res.json({ success: false, message: "Respon Provider: " + okeResponse.data });
                }
            } catch (e) { return res.json({ success: false, message: "Gagal koneksi ke pusat." }); }

        } else if (method === 'qris') {
            const order_id = "GPY-" + Date.now();
            const amountToSend = finalAmount + parseInt(process.env.ADMIN_FEE || 0);
            
            const response = await axios.post('https://app.pakasir.com/api/transactioncreate/qris', { project: PAKASIR_SLUG, order_id, amount: amountToSend, api_key: PAKASIR_API_KEY });

            if (response.data && response.data.payment) {
                const payData = response.data.payment;
                const realAmount = payData.total_payment ? parseInt(payData.total_payment) : amountToSend;

                const transaction = new Transaction({
                    order_id, username: user.username, fullname: user.fullname, amount: nominal, pay_amount: realAmount, status: 'pending', type: 'buy_ewallet',
                    product_data: { provider: 'gopay', product_code, product_name: selectedProd.name, target, nominal: selectedProd.nominal },
                    qr_string: payData.payment_number, date: new Date()
                });
                await transaction.save();

                logActivity('ORDER GOPAY (QRIS)', user, `Pending: ${realAmount}`);
                return res.json({ success: true, type: 'qris', qr_string: payData.payment_number, order_id, amount: nominal, pay_amount: realAmount });
            } else { return res.json({ success: false, message: "Gagal QRIS" }); }
        }
    } catch (e) { res.json({ success: false, message: "Error System" }); }
});

async function processEWalletPurchase(user, data, order_id) {
    try {
        console.log(`Memproses Topup E-Wallet: ${data.product_code} untuk nomor ${data.target}`);
        
        await Transaction.findOneAndUpdate(
            { order_id: order_id },
            { status: 'success' }
        );

        const trxDate = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
        const totalSukses = await Transaction.countDocuments({ status: 'success' });
        
        await sendTrxNotifications({
            user: user,
            orderId: order_id,
            productName: data.product_name,
            amount: data.price.toLocaleString('id-ID'),
            trxDate: trxDate,
            totalSukses: totalSukses,
            type: 'E-WALLET',
            sendWhatsApp: sendWhatsApp,
            sock: sock,
            extraData: {
                target: data.target,
                status: 'Sukses',
                provider: data.provider.toUpperCase()
            }
        });
        
        return true;
    } catch (error) {
        console.error(`Gagal memproses E-Wallet pesanan ${order_id}:`, error);
        return false;
    }
}

// ==========================================
// OVO E-WALLET ENDPOINTS
// ==========================================

app.post('/api/ewallet/check/ovo', async (req, res) => {
    const { phone_number } = req.body;
    if (!phone_number) return res.json({ success: false, message: "Nomor tidak boleh kosong" });

    let cleanNumber = phone_number.replace(/[^0-9]/g, '');
    if (cleanNumber.startsWith('62')) cleanNumber = '0' + cleanNumber.substring(2);
    
    if (cleanNumber.length < 10 || cleanNumber.length > 13) {
        return res.json({ success: false, message: "Nomor tidak valid (harus 10-13 digit)" });
    }

    return res.json({
        success: true,
        data: {
            number: cleanNumber,
            name: `User OVO (${cleanNumber.slice(-4)})`,
            registered: true,
            provider: 'OVO'
        }
    });
});

app.get('/api/ewallet/products/ovo', async (req, res) => {
    try {
        

        let liveData = null;
        try {
            const response = await axios.get('https://okeconnect.com/harga/json?id=905ccd028329b0a', { timeout: 5000 });
            if (response.data) liveData = response.data;
        } catch (apiError) {
            console.log("Info: Pusat API E-Wallet gagal diload, menggunakan harga JSON cadangan.");
        }

        const ewalletProducts = OVO_PRODUCTS.map(item => {
            let basePrice = item.default_price;
            
            if (liveData) {
                if (Array.isArray(liveData)) {
                    const found = liveData.find(x => x.kode === item.code || x.code === item.code);
                    if (found && found.harga) basePrice = parseInt(found.harga);
                    else if (found && found.price) basePrice = parseInt(found.price);
                } else {
                    if (liveData[item.code] && liveData[item.code].price) {
                        basePrice = parseInt(liveData[item.code].price);
                    }
                }
            }

            let fee = 350;
            if (item.nominal > 500000) {
                fee = 500;
            }
            
            const markedUpPrice = basePrice + fee;

            return {
                code: item.code,
                name: item.name,
                nominal: item.nominal,
                price: markedUpPrice,
                provider_price: basePrice,
                description: `Topup OVO ${item.name}`,
                icon: 'https://api.deline.web.id/UQWvMAojpT.jpeg' // Ganti dengan icon OVO nanti
            };
        });

        ewalletProducts.sort((a, b) => a.nominal - b.nominal);

        res.json({ success: true, data: ewalletProducts });

    } catch (error) {
        console.error("Error fetching ewallet products:", error.message);
        res.json({ success: false, message: "Gagal mengambil daftar produk e-wallet." });
    }
});

app.post('/api/buy-ewallet/ovo', async (req, res) => {
    const { token, product_code, target, method, promo_code, final_amount } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        if (!user) return res.json({ success: false, message: "User tidak ditemukan" });

        

        const fallbackProduct = OVO_PRODUCTS.find(p => p.code === product_code);
        if (!fallbackProduct) {
            return res.json({ success: false, message: "Kode produk tidak valid." });
        }

        let basePrice = fallbackProduct.default_price;
        let productName = fallbackProduct.name;

        try {
            const productListRes = await axios.get('https://okeconnect.com/harga/json?id=905ccd028329b0a', { timeout: 5000 });
            const liveData = productListRes.data;
            if (liveData) {
                if (Array.isArray(liveData)) {
                    const found = liveData.find(x => x.kode === product_code || x.code === product_code);
                    if (found && found.harga) basePrice = parseInt(found.harga);
                    else if (found && found.price) basePrice = parseInt(found.price);
                } else {
                    if (liveData[product_code] && liveData[product_code].price) {
                        basePrice = parseInt(liveData[product_code].price);
                    }
                }
            }
        } catch (e) {
            console.log("Info: Pusat API E-Wallet lambat/down saat transaksi, pakai harga default.");
        }

        let fee = 200;
        if (fallbackProduct.nominal > 500000) {
            fee = 250;
        }
        
        const nominal = basePrice + fee;
        
        let finalAmount = final_amount || nominal;
        
        if (promo_code && method === 'saldo') {
            const promo = await Promo.findOne({ code: promo_code.toUpperCase(), status: true });
            if (promo) {
                const userUsage = await PromoUsage.countDocuments({ promo_code: promo.code, username: user.username });
                if (userUsage < promo.per_user_limit) {
                    const now = new Date();
                    if (now >= promo.start_date && (!promo.end_date || now <= promo.end_date)) {
                        
                        let discount = promo.discount_type === 'percentage'
                            ? Math.floor(nominal * promo.discount_value / 100)
                            : promo.discount_value;
                            
                        if (promo.max_discount && discount > promo.max_discount) discount = promo.max_discount;
                        if (discount > nominal) discount = nominal;
                        
                        finalAmount = nominal - discount;
                        
                        promo.used_count += 1;
                        await promo.save();
                        
                        await new PromoUsage({
                            promo_code: promo.code,
                            username: user.username,
                            order_id: "PROMO-" + Date.now()
                        }).save();
                    }
                }
            }
        }

        if (method === 'saldo') {
            if (user.balance < finalAmount) {
                return res.json({ success: false, message: "Saldo tidak cukup!" });
            }

            let cleanTarget = target.replace(/[^0-9]/g, '');
            if (cleanTarget.startsWith('62') && cleanTarget.length >= 10) cleanTarget = '0' + cleanTarget.substring(2);
            
            const refID = Date.now().toString().slice(-8);
            const okeUrl = `${OKE_URL}?memberID=${OKE_MEMBER_ID}&pin=${OKE_PIN}&password=${encodeURIComponent(process.env.OKE_PASSWORD)}&product=${product_code}&dest=${cleanTarget}&refID=${refID}`;
            
            try {
                const okeResponse = await axios.get(okeUrl);
                const responseText = okeResponse.data;
                const respUpper = responseText.toUpperCase();

                if (respUpper.includes('NOMOR TIDAK TERDAFTAR') ||
                    respUpper.includes('INVALID DESTINATION') ||
                    respUpper.includes('GAGAL') ||
                    respUpper.includes('SALAH') ||
                    respUpper.includes('TIDAK DAPAT DIPROSES')) {
                    
                    return res.json({
                        success: false,
                        message: "Gagal: " + responseText,
                        refund: true
                    });
                }

                if (respUpper.includes('PROSES') || respUpper.includes('SUKSES') || respUpper.includes('BERHASIL')) {
                    
                    user.balance -= finalAmount;
                    
                    const poinPanel = Math.floor(finalAmount / 10000); 
            if (poinPanel > 0) {
                user.points = (user.points || 0) + poinPanel;
            }
                    
                    await user.save();

                    const order_id = "OVO-" + Date.now();
                    
                    const transaction = new Transaction({
                        order_id: order_id,
                        provider_oid: refID,
                        username: user.username,
                        fullname: user.fullname,
                        amount: nominal,
                        pay_amount: finalAmount,
                        status: 'success',
                        type: 'buy_ewallet',
                        product_data: {
                            provider: 'ovo',
                            product_code: product_code,
                            product_name: productName,
                            target: target,
                            nominal: fallbackProduct.nominal,
                            provider_ref_id: refID,
                            provider_message: responseText
                        },
                        qr_string: '-',
                        date: new Date()
                    });
                    await transaction.save();

                    await processEWalletPurchase(user, {
                        provider: 'ovo',
                        product_code: product_code,
                        product_name: productName,
                        target: target,
                        price: nominal,
                        provider_ref_id: refID,
                        provider_message: responseText
                    }, order_id);

                    return res.json({
                        success: true,
                        message: "Topup OVO sedang diproses!",
                        type: 'instant',
                        data: {
                            order_id,
                            target,
                            amount: nominal
                        }
                    });

                } else {
                    return res.json({ success: false, message: "Gagal dari Pusat: " + responseText });
                }

            } catch (apiError) {
                console.error("Okeconnect API Error:", apiError.message);
                return res.json({ success: false, message: "Gagal terhubung ke provider e-wallet." });
            }

        } else if (method === 'qris') {
            const order_id = "OVO-" + Date.now();
            const amountToSend = finalAmount + parseInt(process.env.ADMIN_FEE || 0);
            
            const response = await axios.post('https://app.pakasir.com/api/transactioncreate/qris', {
                project: PAKASIR_SLUG,
                order_id: order_id,
                amount: amountToSend,
                api_key: PAKASIR_API_KEY
            });

            if (response.data && response.data.payment) {
                const payData = response.data.payment;
                const realAmount = payData.total_payment ? parseInt(payData.total_payment) : amountToSend;

                const transaction = new Transaction({
                    order_id: order_id,
                    username: user.username,
                    fullname: user.fullname,
                    amount: nominal,
                    pay_amount: realAmount,
                    status: 'pending',
                    type: 'buy_ewallet',
                    product_data: {
                        provider: 'ovo',
                        product_code: product_code,
                        product_name: productName,
                        target: target,
                        nominal: fallbackProduct.nominal
                    },
                    qr_string: payData.payment_number,
                    date: new Date()
                });
                await transaction.save();

                logActivity('ORDER OVO (QRIS)', user, `Pending Payment: ${realAmount}`);
                return res.json({
                    success: true,
                    type: 'qris',
                    qr_string: payData.payment_number,
                    order_id,
                    amount: nominal,
                    pay_amount: realAmount
                });
            } else {
                return res.json({ success: false, message: "Gagal generate QRIS" });
            }
        }

    } catch (e) {
        console.log(e);
        res.json({ success: false, message: "Error Server" });
    }
});

// ==========================================
// SHOPEEPAY E-WALLET ENDPOINTS
// ==========================================

// Data produk ShopeePay default


// Cek nomor ShopeePay (simulasi)
app.post('/api/ewallet/check/shopee', async (req, res) => {
    const { phone_number } = req.body;
    if (!phone_number) return res.json({ success: false, message: "Nomor tidak boleh kosong" });

    let cleanNumber = phone_number.replace(/[^0-9]/g, '');
    if (cleanNumber.startsWith('62')) cleanNumber = '0' + cleanNumber.substring(2);
    
    if (cleanNumber.length < 10 || cleanNumber.length > 13) {
        return res.json({ success: false, message: "Nomor tidak valid (harus 10-13 digit)" });
    }

    // Simulasi pengecekan (di sini bisa diintegrasi dengan API ShopeePay jika ada)
    return res.json({
        success: true,
        data: {
            number: cleanNumber,
            name: `User ShopeePay (${cleanNumber.slice(-4)})`,
            registered: true,
            provider: 'SHOPEEPAY'
        }
    });
});

// Daftar produk ShopeePay
app.get('/api/ewallet/products/shopee', async (req, res) => {
    try {
        let liveData = null;
        try {
            const response = await axios.get('https://okeconnect.com/harga/json?id=905ccd028329b0a', { timeout: 5000 });
            if (response.data) liveData = response.data;
        } catch (apiError) {
            console.log("Info: Pusat API ShopeePay gagal diload, menggunakan harga JSON cadangan.");
        }

        const shopeeProducts = SHOPEEPAY_PRODUCTS.map(item => {
            let basePrice = item.default_price;
            
            if (liveData) {
                if (Array.isArray(liveData)) {
                    const found = liveData.find(x => x.kode === item.code || x.code === item.code);
                    if (found && found.harga) basePrice = parseInt(found.harga);
                    else if (found && found.price) basePrice = parseInt(found.price);
                } else {
                    if (liveData[item.code] && liveData[item.code].price) {
                        basePrice = parseInt(liveData[item.code].price);
                    }
                }
            }

            // Fee Rp 200 untuk nominal <= 500rb, Rp 250 untuk > 500rb
            let fee = 350;
            if (item.nominal > 500000) {
                fee = 500;
            }
            
            const markedUpPrice = basePrice + fee;

            return {
                code: item.code,
                name: item.name,
                nominal: item.nominal,
                price: markedUpPrice,
                provider_price: basePrice,
                description: `Topup ShopeePay ${item.name}`,
                icon: 'https://img.icons8.com/color/96/shopee.png', // Ganti dengan icon ShopeePay nanti
                isAdmin: item.code.startsWith('SHP') // Menandai produk Admin
            };
        });

        shopeeProducts.sort((a, b) => a.nominal - b.nominal);

        res.json({ success: true, data: shopeeProducts });

    } catch (error) {
        console.error("Error fetching ShopeePay products:", error.message);
        res.json({ success: false, message: "Gagal mengambil daftar produk ShopeePay." });
    }
});

// Proses pembelian ShopeePay
app.post('/api/buy-ewallet/shopee', async (req, res) => {
    const { token, product_code, target, method, promo_code, final_amount } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        if (!user) return res.json({ success: false, message: "User tidak ditemukan" });

        const fallbackProduct = SHOPEEPAY_PRODUCTS.find(p => p.code === product_code);
        if (!fallbackProduct) {
            return res.json({ success: false, message: "Kode produk tidak valid." });
        }

        let basePrice = fallbackProduct.default_price;
        let productName = fallbackProduct.name;

        // Update harga dari server jika tersedia
        try {
            const productListRes = await axios.get('https://okeconnect.com/harga/json?id=905ccd028329b0a', { timeout: 5000 });
            const liveData = productListRes.data;
            if (liveData) {
                if (Array.isArray(liveData)) {
                    const found = liveData.find(x => x.kode === product_code || x.code === product_code);
                    if (found && found.harga) basePrice = parseInt(found.harga);
                    else if (found && found.price) basePrice = parseInt(found.price);
                } else {
                    if (liveData[product_code] && liveData[product_code].price) {
                        basePrice = parseInt(liveData[product_code].price);
                    }
                }
            }
        } catch (e) {
            console.log("Info: Pusat API ShopeePay lambat/down saat transaksi, pakai harga default.");
        }

        // Fee Rp 200 untuk nominal <= 500rb, Rp 250 untuk > 500rb
        let fee = 200;
        if (fallbackProduct.nominal > 500000) {
            fee = 250;
        }
        
        const nominal = basePrice + fee;
        
        let finalAmount = final_amount || nominal;
        
        // Proses promo jika ada
        if (promo_code && method === 'saldo') {
            const promo = await Promo.findOne({ code: promo_code.toUpperCase(), status: true });
            if (promo) {
                const userUsage = await PromoUsage.countDocuments({ promo_code: promo.code, username: user.username });
                if (userUsage < promo.per_user_limit) {
                    const now = new Date();
                    if (now >= promo.start_date && (!promo.end_date || now <= promo.end_date)) {
                        
                        let discount = promo.discount_type === 'percentage'
                            ? Math.floor(nominal * promo.discount_value / 100)
                            : promo.discount_value;
                            
                        if (promo.max_discount && discount > promo.max_discount) discount = promo.max_discount;
                        if (discount > nominal) discount = nominal;
                        
                        finalAmount = nominal - discount;
                        
                        promo.used_count += 1;
                        await promo.save();
                        
                        await new PromoUsage({
                            promo_code: promo.code,
                            username: user.username,
                            order_id: "PROMO-" + Date.now()
                        }).save();
                    }
                }
            }
        }

        if (method === 'saldo') {
            if (user.balance < finalAmount) {
                return res.json({ success: false, message: "Saldo tidak cukup!" });
            }

            let cleanTarget = target.replace(/[^0-9]/g, '');
            if (cleanTarget.startsWith('62') && cleanTarget.length >= 10) cleanTarget = '0' + cleanTarget.substring(2);
            
            const refID = Date.now().toString().slice(-8);
            const okeUrl = `${OKE_URL}?memberID=${OKE_MEMBER_ID}&pin=${OKE_PIN}&password=${encodeURIComponent(process.env.OKE_PASSWORD)}&product=${product_code}&dest=${cleanTarget}&refID=${refID}`;
            
            try {
                const okeResponse = await axios.get(okeUrl);
                const responseText = okeResponse.data;
                const respUpper = responseText.toUpperCase();

                // Cek error
                if (respUpper.includes('NOMOR TIDAK TERDAFTAR') ||
                    respUpper.includes('INVALID DESTINATION') ||
                    respUpper.includes('GAGAL') ||
                    respUpper.includes('SALAH') ||
                    respUpper.includes('TIDAK DAPAT DIPROSES')) {
                    
                    return res.json({
                        success: false,
                        message: "Gagal: " + responseText,
                        refund: true
                    });
                }

                if (respUpper.includes('PROSES') || respUpper.includes('SUKSES') || respUpper.includes('BERHASIL')) {
                    
                    user.balance -= finalAmount;
                    
                    const poinPanel = Math.floor(finalAmount / 10000); 
            if (poinPanel > 0) {
                user.points = (user.points || 0) + poinPanel;
            }
                    
                    await user.save();

                    const order_id = "SP-" + Date.now();
                    
                    const transaction = new Transaction({
                        order_id: order_id,
                        provider_oid: refID,
                        username: user.username,
                        fullname: user.fullname,
                        amount: nominal,
                        pay_amount: finalAmount,
                        status: 'success',
                        type: 'buy_ewallet',
                        product_data: {
                            provider: 'shopeepay',
                            product_code: product_code,
                            product_name: productName,
                            target: target,
                            nominal: fallbackProduct.nominal,
                            provider_ref_id: refID,
                            provider_message: responseText
                        },
                        qr_string: '-',
                        date: new Date()
                    });
                    await transaction.save();

                    await processEWalletPurchase(user, {
                        provider: 'shopeepay',
                        product_code: product_code,
                        product_name: productName,
                        target: target,
                        price: nominal,
                        provider_ref_id: refID,
                        provider_message: responseText
                    }, order_id);

                    return res.json({
                        success: true,
                        message: "Topup ShopeePay sedang diproses!",
                        type: 'instant',
                        data: {
                            order_id,
                            target,
                            amount: nominal
                        }
                    });

                } else {
                    return res.json({ success: false, message: "Gagal dari Pusat: " + responseText });
                }

            } catch (apiError) {
                console.error("Okeconnect API Error:", apiError.message);
                return res.json({ success: false, message: "Gagal terhubung ke provider ShopeePay." });
            }

        } else if (method === 'qris') {
            const order_id = "SP-" + Date.now();
            const amountToSend = finalAmount + parseInt(process.env.ADMIN_FEE || 0);
            
            const response = await axios.post('https://app.pakasir.com/api/transactioncreate/qris', {
                project: PAKASIR_SLUG,
                order_id: order_id,
                amount: amountToSend,
                api_key: PAKASIR_API_KEY
            });

            if (response.data && response.data.payment) {
                const payData = response.data.payment;
                const realAmount = payData.total_payment ? parseInt(payData.total_payment) : amountToSend;

                const transaction = new Transaction({
                    order_id: order_id,
                    username: user.username,
                    fullname: user.fullname,
                    amount: nominal,
                    pay_amount: realAmount,
                    status: 'pending',
                    type: 'buy_ewallet',
                    product_data: {
                        provider: 'shopeepay',
                        product_code: product_code,
                        product_name: productName,
                        target: target,
                        nominal: fallbackProduct.nominal
                    },
                    qr_string: payData.payment_number,
                    date: new Date()
                });
                await transaction.save();

                logActivity('ORDER SHOPEEPAY (QRIS)', user, `Pending Payment: ${realAmount}`);
                return res.json({
                    success: true,
                    type: 'qris',
                    qr_string: payData.payment_number,
                    order_id,
                    amount: nominal,
                    pay_amount: realAmount
                });
            } else {
                return res.json({ success: false, message: "Gagal generate QRIS" });
            }
        }

    } catch (e) {
        console.log(e);
        res.json({ success: false, message: "Error Server" });
    }
});

// ==========================================
// LINKAJA E-WALLET ENDPOINTS
// ==========================================

// Data produk LinkAja default


// Cek nomor LinkAja (simulasi)
app.post('/api/ewallet/check/linkaja', async (req, res) => {
    const { phone_number } = req.body;
    if (!phone_number) return res.json({ success: false, message: "Nomor tidak boleh kosong" });

    let cleanNumber = phone_number.replace(/[^0-9]/g, '');
    if (cleanNumber.startsWith('62')) cleanNumber = '0' + cleanNumber.substring(2);
    
    if (cleanNumber.length < 10 || cleanNumber.length > 13) {
        return res.json({ success: false, message: "Nomor tidak valid (harus 10-13 digit)" });
    }

    return res.json({
        success: true,
        data: {
            number: cleanNumber,
            name: `User LinkAja (${cleanNumber.slice(-4)})`,
            registered: true,
            provider: 'LINKAJA'
        }
    });
});

// Daftar produk LinkAja
app.get('/api/ewallet/products/linkaja', async (req, res) => {
    try {
        let liveData = null;
        try {
            const response = await axios.get('https://okeconnect.com/harga/json?id=905ccd028329b0a', { timeout: 5000 });
            if (response.data) liveData = response.data;
        } catch (apiError) {
            console.log("Info: Pusat API LinkAja gagal diload, menggunakan harga JSON cadangan.");
        }

        const linkajaProducts = LINKAJA_PRODUCTS.map(item => {
            let basePrice = item.default_price;
            
            if (liveData) {
                if (Array.isArray(liveData)) {
                    const found = liveData.find(x => x.kode === item.code || x.code === item.code);
                    if (found && found.harga) basePrice = parseInt(found.harga);
                    else if (found && found.price) basePrice = parseInt(found.price);
                } else {
                    if (liveData[item.code] && liveData[item.code].price) {
                        basePrice = parseInt(liveData[item.code].price);
                    }
                }
            }

            // Fee Rp 200 untuk nominal <= 500rb, Rp 250 untuk > 500rb
            let fee = 350;
            if (item.nominal > 500000) {
                fee = 500;
            }
            
            const markedUpPrice = basePrice + fee;

            return {
                code: item.code,
                name: item.name,
                nominal: item.nominal,
                price: markedUpPrice,
                provider_price: basePrice,
                description: `Topup LinkAja ${item.name}`,
                icon: 'https://api.deline.web.id/wCXLHdBsPw.png', // Icon LinkAja
                isEntitas: item.code.startsWith('LJAE') // Menandai produk Entitas
            };
        });

        linkajaProducts.sort((a, b) => a.nominal - b.nominal);

        res.json({ success: true, data: linkajaProducts });

    } catch (error) {
        console.error("Error fetching LinkAja products:", error.message);
        res.json({ success: false, message: "Gagal mengambil daftar produk LinkAja." });
    }
});

// Proses pembelian LinkAja
app.post('/api/buy-ewallet/linkaja', async (req, res) => {
    const { token, product_code, target, method, promo_code, final_amount } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        if (!user) return res.json({ success: false, message: "User tidak ditemukan" });

        const fallbackProduct = LINKAJA_PRODUCTS.find(p => p.code === product_code);
        if (!fallbackProduct) {
            return res.json({ success: false, message: "Kode produk tidak valid." });
        }

        let basePrice = fallbackProduct.default_price;
        let productName = fallbackProduct.name;

        // Update harga dari server jika tersedia
        try {
            const productListRes = await axios.get('https://okeconnect.com/harga/json?id=905ccd028329b0a', { timeout: 5000 });
            const liveData = productListRes.data;
            if (liveData) {
                if (Array.isArray(liveData)) {
                    const found = liveData.find(x => x.kode === product_code || x.code === product_code);
                    if (found && found.harga) basePrice = parseInt(found.harga);
                    else if (found && found.price) basePrice = parseInt(found.price);
                } else {
                    if (liveData[product_code] && liveData[product_code].price) {
                        basePrice = parseInt(liveData[product_code].price);
                    }
                }
            }
        } catch (e) {
            console.log("Info: Pusat API LinkAja lambat/down saat transaksi, pakai harga default.");
        }

        // Fee Rp 200 untuk nominal <= 500rb, Rp 250 untuk > 500rb
        let fee = 200;
        if (fallbackProduct.nominal > 500000) {
            fee = 250;
        }
        
        const nominal = basePrice + fee;
        
        let finalAmount = final_amount || nominal;
        
        // Proses promo jika ada
        if (promo_code && method === 'saldo') {
            const promo = await Promo.findOne({ code: promo_code.toUpperCase(), status: true });
            if (promo) {
                const userUsage = await PromoUsage.countDocuments({ promo_code: promo.code, username: user.username });
                if (userUsage < promo.per_user_limit) {
                    const now = new Date();
                    if (now >= promo.start_date && (!promo.end_date || now <= promo.end_date)) {
                        
                        let discount = promo.discount_type === 'percentage'
                            ? Math.floor(nominal * promo.discount_value / 100)
                            : promo.discount_value;
                            
                        if (promo.max_discount && discount > promo.max_discount) discount = promo.max_discount;
                        if (discount > nominal) discount = nominal;
                        
                        finalAmount = nominal - discount;
                        
                        promo.used_count += 1;
                        await promo.save();
                        
                        await new PromoUsage({
                            promo_code: promo.code,
                            username: user.username,
                            order_id: "PROMO-" + Date.now()
                        }).save();
                    }
                }
            }
        }

        if (method === 'saldo') {
            if (user.balance < finalAmount) {
                return res.json({ success: false, message: "Saldo tidak cukup!" });
            }

            let cleanTarget = target.replace(/[^0-9]/g, '');
            if (cleanTarget.startsWith('62') && cleanTarget.length >= 10) cleanTarget = '0' + cleanTarget.substring(2);
            
            const refID = Date.now().toString().slice(-8);
            const okeUrl = `${OKE_URL}?memberID=${OKE_MEMBER_ID}&pin=${OKE_PIN}&password=${encodeURIComponent(process.env.OKE_PASSWORD)}&product=${product_code}&dest=${cleanTarget}&refID=${refID}`;
            
            try {
                const okeResponse = await axios.get(okeUrl);
                const responseText = okeResponse.data;
                const respUpper = responseText.toUpperCase();

                // Cek error
                if (respUpper.includes('NOMOR TIDAK TERDAFTAR') ||
                    respUpper.includes('INVALID DESTINATION') ||
                    respUpper.includes('GAGAL') ||
                    respUpper.includes('SALAH') ||
                    respUpper.includes('TIDAK DAPAT DIPROSES')) {
                    
                    return res.json({
                        success: false,
                        message: "Gagal: " + responseText,
                        refund: true
                    });
                }

                if (respUpper.includes('PROSES') || respUpper.includes('SUKSES') || respUpper.includes('BERHASIL')) {
                    
                    user.balance -= finalAmount;
                    
                    const poinPanel = Math.floor(finalAmount / 10000); 
            if (poinPanel > 0) {
                user.points = (user.points || 0) + poinPanel;
            }
                    
                    await user.save();

                    const order_id = "LJA-" + Date.now();
                    
                    const transaction = new Transaction({
                        order_id: order_id,
                        provider_oid: refID,
                        username: user.username,
                        fullname: user.fullname,
                        amount: nominal,
                        pay_amount: finalAmount,
                        status: 'success',
                        type: 'buy_ewallet',
                        product_data: {
                            provider: 'linkaja',
                            product_code: product_code,
                            product_name: productName,
                            target: target,
                            nominal: fallbackProduct.nominal,
                            provider_ref_id: refID,
                            provider_message: responseText
                        },
                        qr_string: '-',
                        date: new Date()
                    });
                    await transaction.save();

                    await processEWalletPurchase(user, {
                        provider: 'linkaja',
                        product_code: product_code,
                        product_name: productName,
                        target: target,
                        price: nominal,
                        provider_ref_id: refID,
                        provider_message: responseText
                    }, order_id);

                    return res.json({
                        success: true,
                        message: "Topup LinkAja sedang diproses!",
                        type: 'instant',
                        data: {
                            order_id,
                            target,
                            amount: nominal
                        }
                    });

                } else {
                    return res.json({ success: false, message: "Gagal dari Pusat: " + responseText });
                }

            } catch (apiError) {
                console.error("Okeconnect API Error:", apiError.message);
                return res.json({ success: false, message: "Gagal terhubung ke provider LinkAja." });
            }

        } else if (method === 'qris') {
            const order_id = "LJA-" + Date.now();
            const amountToSend = finalAmount + parseInt(process.env.ADMIN_FEE || 0);
            
            const response = await axios.post('https://app.pakasir.com/api/transactioncreate/qris', {
                project: PAKASIR_SLUG,
                order_id: order_id,
                amount: amountToSend,
                api_key: PAKASIR_API_KEY
            });

            if (response.data && response.data.payment) {
                const payData = response.data.payment;
                const realAmount = payData.total_payment ? parseInt(payData.total_payment) : amountToSend;

                const transaction = new Transaction({
                    order_id: order_id,
                    username: user.username,
                    fullname: user.fullname,
                    amount: nominal,
                    pay_amount: realAmount,
                    status: 'pending',
                    type: 'buy_ewallet',
                    product_data: {
                        provider: 'linkaja',
                        product_code: product_code,
                        product_name: productName,
                        target: target,
                        nominal: fallbackProduct.nominal
                    },
                    qr_string: payData.payment_number,
                    date: new Date()
                });
                await transaction.save();

                logActivity('ORDER LINKAJA (QRIS)', user, `Pending Payment: ${realAmount}`);
                return res.json({
                    success: true,
                    type: 'qris',
                    qr_string: payData.payment_number,
                    order_id,
                    amount: nominal,
                    pay_amount: realAmount
                });
            } else {
                return res.json({ success: false, message: "Gagal generate QRIS" });
            }
        }

    } catch (e) {
        console.log(e);
        res.json({ success: false, message: "Error Server" });
    }
});

// ==========================================
// ASTRAPAY E-WALLET ENDPOINTS
// ==========================================

// Data produk Astrapay default


// Cek nomor Astrapay (simulasi)
app.post('/api/ewallet/check/astrapay', async (req, res) => {
    const { phone_number } = req.body;
    if (!phone_number) return res.json({ success: false, message: "Nomor tidak boleh kosong" });

    let cleanNumber = phone_number.replace(/[^0-9]/g, '');
    if (cleanNumber.startsWith('62')) cleanNumber = '0' + cleanNumber.substring(2);
    
    if (cleanNumber.length < 10 || cleanNumber.length > 13) {
        return res.json({ success: false, message: "Nomor tidak valid (harus 10-13 digit)" });
    }

    return res.json({
        success: true,
        data: {
            number: cleanNumber,
            name: `User Astrapay (${cleanNumber.slice(-4)})`,
            registered: true,
            provider: 'ASTRAPAY'
        }
    });
});

// Daftar produk Astrapay
app.get('/api/ewallet/products/astrapay', async (req, res) => {
    try {
        let liveData = null;
        try {
            const response = await axios.get('https://okeconnect.com/harga/json?id=905ccd028329b0a', { timeout: 5000 });
            if (response.data) liveData = response.data;
        } catch (apiError) {
            console.log("Info: Pusat API Astrapay gagal diload, menggunakan harga JSON cadangan.");
        }

        const astrapayProducts = ASTRAPAY_PRODUCTS.map(item => {
            let basePrice = item.default_price;
            
            if (liveData) {
                if (Array.isArray(liveData)) {
                    const found = liveData.find(x => x.kode === item.code || x.code === item.code);
                    if (found && found.harga) basePrice = parseInt(found.harga);
                    else if (found && found.price) basePrice = parseInt(found.price);
                } else {
                    if (liveData[item.code] && liveData[item.code].price) {
                        basePrice = parseInt(liveData[item.code].price);
                    }
                }
            }

            // Fee Rp 200 untuk nominal <= 500rb, Rp 250 untuk > 500rb
            let fee = 350;
            if (item.nominal > 500000) {
                fee = 500;
            }
            
            const markedUpPrice = basePrice + fee;

            return {
                code: item.code,
                name: item.name,
                nominal: item.nominal,
                price: markedUpPrice,
                provider_price: basePrice,
                description: `Topup Astrapay ${item.name}`,
                icon: 'https://api.deline.web.id/R87kIeNath.jpeg' // Icon Astrapay
            };
        });

        astrapayProducts.sort((a, b) => a.nominal - b.nominal);

        res.json({ success: true, data: astrapayProducts });

    } catch (error) {
        console.error("Error fetching Astrapay products:", error.message);
        res.json({ success: false, message: "Gagal mengambil daftar produk Astrapay." });
    }
});

// Proses pembelian Astrapay
app.post('/api/buy-ewallet/astrapay', async (req, res) => {
    const { token, product_code, target, method, promo_code, final_amount } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        if (!user) return res.json({ success: false, message: "User tidak ditemukan" });

        const fallbackProduct = ASTRAPAY_PRODUCTS.find(p => p.code === product_code);
        if (!fallbackProduct) {
            return res.json({ success: false, message: "Kode produk tidak valid." });
        }

        let basePrice = fallbackProduct.default_price;
        let productName = fallbackProduct.name;

        // Update harga dari server jika tersedia
        try {
            const productListRes = await axios.get('https://okeconnect.com/harga/json?id=905ccd028329b0a', { timeout: 5000 });
            const liveData = productListRes.data;
            if (liveData) {
                if (Array.isArray(liveData)) {
                    const found = liveData.find(x => x.kode === product_code || x.code === product_code);
                    if (found && found.harga) basePrice = parseInt(found.harga);
                    else if (found && found.price) basePrice = parseInt(found.price);
                } else {
                    if (liveData[product_code] && liveData[product_code].price) {
                        basePrice = parseInt(liveData[product_code].price);
                    }
                }
            }
        } catch (e) {
            console.log("Info: Pusat API Astrapay lambat/down saat transaksi, pakai harga default.");
        }

        // Fee Rp 200 untuk nominal <= 500rb, Rp 250 untuk > 500rb
        let fee = 200;
        if (fallbackProduct.nominal > 500000) {
            fee = 250;
        }
        
        const nominal = basePrice + fee;
        
        let finalAmount = final_amount || nominal;
        
        // Proses promo jika ada
        if (promo_code && method === 'saldo') {
            const promo = await Promo.findOne({ code: promo_code.toUpperCase(), status: true });
            if (promo) {
                const userUsage = await PromoUsage.countDocuments({ promo_code: promo.code, username: user.username });
                if (userUsage < promo.per_user_limit) {
                    const now = new Date();
                    if (now >= promo.start_date && (!promo.end_date || now <= promo.end_date)) {
                        
                        let discount = promo.discount_type === 'percentage'
                            ? Math.floor(nominal * promo.discount_value / 100)
                            : promo.discount_value;
                            
                        if (promo.max_discount && discount > promo.max_discount) discount = promo.max_discount;
                        if (discount > nominal) discount = nominal;
                        
                        finalAmount = nominal - discount;
                        
                        promo.used_count += 1;
                        await promo.save();
                        
                        await new PromoUsage({
                            promo_code: promo.code,
                            username: user.username,
                            order_id: "PROMO-" + Date.now()
                        }).save();
                    }
                }
            }
        }

        if (method === 'saldo') {
            if (user.balance < finalAmount) {
                return res.json({ success: false, message: "Saldo tidak cukup!" });
            }

            let cleanTarget = target.replace(/[^0-9]/g, '');
            if (cleanTarget.startsWith('62') && cleanTarget.length >= 10) cleanTarget = '0' + cleanTarget.substring(2);
            
            const refID = Date.now().toString().slice(-8);
            const okeUrl = `${OKE_URL}?memberID=${OKE_MEMBER_ID}&pin=${OKE_PIN}&password=${encodeURIComponent(process.env.OKE_PASSWORD)}&product=${product_code}&dest=${cleanTarget}&refID=${refID}`;
            
            try {
                const okeResponse = await axios.get(okeUrl);
                const responseText = okeResponse.data;
                const respUpper = responseText.toUpperCase();

                // Cek error
                if (respUpper.includes('NOMOR TIDAK TERDAFTAR') ||
                    respUpper.includes('INVALID DESTINATION') ||
                    respUpper.includes('GAGAL') ||
                    respUpper.includes('SALAH') ||
                    respUpper.includes('TIDAK DAPAT DIPROSES')) {
                    
                    return res.json({
                        success: false,
                        message: "Gagal: " + responseText,
                        refund: true
                    });
                }

                if (respUpper.includes('PROSES') || respUpper.includes('SUKSES') || respUpper.includes('BERHASIL')) {
                    
                    user.balance -= finalAmount;
                    
                    const poinPanel = Math.floor(finalAmount / 10000); 
            if (poinPanel > 0) {
                user.points = (user.points || 0) + poinPanel;
            }
                    
                    await user.save();

                    const order_id = "ASP-" + Date.now();
                    
                    const transaction = new Transaction({
                        order_id: order_id,
                        provider_oid: refID,
                        username: user.username,
                        fullname: user.fullname,
                        amount: nominal,
                        pay_amount: finalAmount,
                        status: 'success',
                        type: 'buy_ewallet',
                        product_data: {
                            provider: 'astrapay',
                            product_code: product_code,
                            product_name: productName,
                            target: target,
                            nominal: fallbackProduct.nominal,
                            provider_ref_id: refID,
                            provider_message: responseText
                        },
                        qr_string: '-',
                        date: new Date()
                    });
                    await transaction.save();

                    await processEWalletPurchase(user, {
                        provider: 'astrapay',
                        product_code: product_code,
                        product_name: productName,
                        target: target,
                        price: nominal,
                        provider_ref_id: refID,
                        provider_message: responseText
                    }, order_id);

                    return res.json({
                        success: true,
                        message: "Topup Astrapay sedang diproses!",
                        type: 'instant',
                        data: {
                            order_id,
                            target,
                            amount: nominal
                        }
                    });

                } else {
                    return res.json({ success: false, message: "Gagal dari Pusat: " + responseText });
                }

            } catch (apiError) {
                console.error("Okeconnect API Error:", apiError.message);
                return res.json({ success: false, message: "Gagal terhubung ke provider Astrapay." });
            }

        } else if (method === 'qris') {
            const order_id = "ASP-" + Date.now();
            const amountToSend = finalAmount + parseInt(process.env.ADMIN_FEE || 0);
            
            const response = await axios.post('https://app.pakasir.com/api/transactioncreate/qris', {
                project: PAKASIR_SLUG,
                order_id: order_id,
                amount: amountToSend,
                api_key: PAKASIR_API_KEY
            });

            if (response.data && response.data.payment) {
                const payData = response.data.payment;
                const realAmount = payData.total_payment ? parseInt(payData.total_payment) : amountToSend;

                const transaction = new Transaction({
                    order_id: order_id,
                    username: user.username,
                    fullname: user.fullname,
                    amount: nominal,
                    pay_amount: realAmount,
                    status: 'pending',
                    type: 'buy_ewallet',
                    product_data: {
                        provider: 'astrapay',
                        product_code: product_code,
                        product_name: productName,
                        target: target,
                        nominal: fallbackProduct.nominal
                    },
                    qr_string: payData.payment_number,
                    date: new Date()
                });
                await transaction.save();

                logActivity('ORDER ASTRAPAY (QRIS)', user, `Pending Payment: ${realAmount}`);
                return res.json({
                    success: true,
                    type: 'qris',
                    qr_string: payData.payment_number,
                    order_id,
                    amount: nominal,
                    pay_amount: realAmount
                });
            } else {
                return res.json({ success: false, message: "Gagal generate QRIS" });
            }
        }

    } catch (e) {
        console.log(e);
        res.json({ success: false, message: "Error Server" });
    }
});

// ==========================================
// ISAKU E-WALLET ENDPOINTS
// ==========================================

// Data produk iSaku default


// Cek nomor iSaku (simulasi)
app.post('/api/ewallet/check/isaku', async (req, res) => {
    const { phone_number } = req.body;
    if (!phone_number) return res.json({ success: false, message: "Nomor tidak boleh kosong" });

    let cleanNumber = phone_number.replace(/[^0-9]/g, '');
    if (cleanNumber.startsWith('62')) cleanNumber = '0' + cleanNumber.substring(2);
    
    if (cleanNumber.length < 10 || cleanNumber.length > 13) {
        return res.json({ success: false, message: "Nomor tidak valid (harus 10-13 digit)" });
    }

    return res.json({
        success: true,
        data: {
            number: cleanNumber,
            name: `User iSaku (${cleanNumber.slice(-4)})`,
            registered: true,
            provider: 'ISAKU'
        }
    });
});

// Daftar produk iSaku
app.get('/api/ewallet/products/isaku', async (req, res) => {
    try {
        let liveData = null;
        try {
            const response = await axios.get('https://okeconnect.com/harga/json?id=905ccd028329b0a', { timeout: 5000 });
            if (response.data) liveData = response.data;
        } catch (apiError) {
            console.log("Info: Pusat API iSaku gagal diload, menggunakan harga JSON cadangan.");
        }

        const isakuProducts = ISAKU_PRODUCTS.map(item => {
            let basePrice = item.default_price;
            
            if (liveData) {
                if (Array.isArray(liveData)) {
                    const found = liveData.find(x => x.kode === item.code || x.code === item.code);
                    if (found && found.harga) basePrice = parseInt(found.harga);
                    else if (found && found.price) basePrice = parseInt(found.price);
                } else {
                    if (liveData[item.code] && liveData[item.code].price) {
                        basePrice = parseInt(liveData[item.code].price);
                    }
                }
            }

            let fee = 350;
            if (item.nominal > 500000) {
                fee = 500;
            }
            
            const markedUpPrice = basePrice + fee;

            return {
                code: item.code,
                name: item.name,
                nominal: item.nominal,
                price: markedUpPrice,
                provider_price: basePrice,
                description: `Topup iSaku ${item.name}`,
                icon: 'https://api.deline.web.id/wlBGiEQtuX.png'
            };
        });

        isakuProducts.sort((a, b) => a.nominal - b.nominal);

        res.json({ success: true, data: isakuProducts });

    } catch (error) {
        console.error("Error fetching iSaku products:", error.message);
        res.json({ success: false, message: "Gagal mengambil daftar produk iSaku." });
    }
});

// Proses pembelian iSaku
app.post('/api/buy-ewallet/isaku', async (req, res) => {
    const { token, product_code, target, method, promo_code, final_amount } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        if (!user) return res.json({ success: false, message: "User tidak ditemukan" });

        const fallbackProduct = ISAKU_PRODUCTS.find(p => p.code === product_code);
        if (!fallbackProduct) {
            return res.json({ success: false, message: "Kode produk tidak valid." });
        }

        let basePrice = fallbackProduct.default_price;
        let productName = fallbackProduct.name;

        try {
            const productListRes = await axios.get('https://okeconnect.com/harga/json?id=905ccd028329b0a', { timeout: 5000 });
            const liveData = productListRes.data;
            if (liveData) {
                if (Array.isArray(liveData)) {
                    const found = liveData.find(x => x.kode === product_code || x.code === product_code);
                    if (found && found.harga) basePrice = parseInt(found.harga);
                    else if (found && found.price) basePrice = parseInt(found.price);
                } else {
                    if (liveData[product_code] && liveData[product_code].price) {
                        basePrice = parseInt(liveData[product_code].price);
                    }
                }
            }
        } catch (e) {
            console.log("Info: Pusat API iSaku lambat/down saat transaksi, pakai harga default.");
        }

        let fee = 200;
        if (fallbackProduct.nominal > 500000) {
            fee = 250;
        }
        
        const nominal = basePrice + fee;
        
        let finalAmount = final_amount || nominal;
        
        // Proses promo jika ada
        if (promo_code && method === 'saldo') {
            const promo = await Promo.findOne({ code: promo_code.toUpperCase(), status: true });
            if (promo) {
                const userUsage = await PromoUsage.countDocuments({ promo_code: promo.code, username: user.username });
                if (userUsage < promo.per_user_limit) {
                    const now = new Date();
                    if (now >= promo.start_date && (!promo.end_date || now <= promo.end_date)) {
                        
                        let discount = promo.discount_type === 'percentage'
                            ? Math.floor(nominal * promo.discount_value / 100)
                            : promo.discount_value;
                            
                        if (promo.max_discount && discount > promo.max_discount) discount = promo.max_discount;
                        if (discount > nominal) discount = nominal;
                        
                        finalAmount = nominal - discount;
                        
                        promo.used_count += 1;
                        await promo.save();
                        
                        await new PromoUsage({
                            promo_code: promo.code,
                            username: user.username,
                            order_id: "PROMO-" + Date.now()
                        }).save();
                    }
                }
            }
        }

        if (method === 'saldo') {
            if (user.balance < finalAmount) {
                return res.json({ success: false, message: "Saldo tidak cukup!" });
            }

            let cleanTarget = target.replace(/[^0-9]/g, '');
            if (cleanTarget.startsWith('62') && cleanTarget.length >= 10) cleanTarget = '0' + cleanTarget.substring(2);
            
            const refID = Date.now().toString().slice(-8);
            const okeUrl = `${OKE_URL}?memberID=${OKE_MEMBER_ID}&pin=${OKE_PIN}&password=${encodeURIComponent(process.env.OKE_PASSWORD)}&product=${product_code}&dest=${cleanTarget}&refID=${refID}`;
            
            try {
                const okeResponse = await axios.get(okeUrl);
                const responseText = okeResponse.data;
                const respUpper = responseText.toUpperCase();

                if (respUpper.includes('NOMOR TIDAK TERDAFTAR') ||
                    respUpper.includes('INVALID DESTINATION') ||
                    respUpper.includes('GAGAL') ||
                    respUpper.includes('SALAH') ||
                    respUpper.includes('TIDAK DAPAT DIPROSES')) {
                    
                    return res.json({
                        success: false,
                        message: "Gagal: " + responseText,
                        refund: true
                    });
                }

                if (respUpper.includes('PROSES') || respUpper.includes('SUKSES') || respUpper.includes('BERHASIL')) {
                    
                    user.balance -= finalAmount;
                    
                    const poinPanel = Math.floor(finalAmount / 10000); 
            if (poinPanel > 0) {
                user.points = (user.points || 0) + poinPanel;
            }
                    
                    await user.save();

                    const order_id = "ISK-" + Date.now();
                    
                    const transaction = new Transaction({
                        order_id: order_id,
                        provider_oid: refID,
                        username: user.username,
                        fullname: user.fullname,
                        amount: nominal,
                        pay_amount: finalAmount,
                        status: 'success',
                        type: 'buy_ewallet',
                        product_data: {
                            provider: 'isaku',
                            product_code: product_code,
                            product_name: productName,
                            target: target,
                            nominal: fallbackProduct.nominal,
                            provider_ref_id: refID,
                            provider_message: responseText
                        },
                        qr_string: '-',
                        date: new Date()
                    });
                    await transaction.save();

                    await processEWalletPurchase(user, {
                        provider: 'isaku',
                        product_code: product_code,
                        product_name: productName,
                        target: target,
                        price: nominal,
                        provider_ref_id: refID,
                        provider_message: responseText
                    }, order_id);

                    return res.json({
                        success: true,
                        message: "Topup iSaku sedang diproses!",
                        type: 'instant',
                        data: {
                            order_id,
                            target,
                            amount: nominal
                        }
                    });

                } else {
                    return res.json({ success: false, message: "Gagal dari Pusat: " + responseText });
                }

            } catch (apiError) {
                console.error("Okeconnect API Error:", apiError.message);
                return res.json({ success: false, message: "Gagal terhubung ke provider iSaku." });
            }

        } else if (method === 'qris') {
            const order_id = "ISK-" + Date.now();
            const amountToSend = finalAmount + parseInt(process.env.ADMIN_FEE || 0);
            
            const response = await axios.post('https://app.pakasir.com/api/transactioncreate/qris', {
                project: PAKASIR_SLUG,
                order_id: order_id,
                amount: amountToSend,
                api_key: PAKASIR_API_KEY
            });

            if (response.data && response.data.payment) {
                const payData = response.data.payment;
                const realAmount = payData.total_payment ? parseInt(payData.total_payment) : amountToSend;

                const transaction = new Transaction({
                    order_id: order_id,
                    username: user.username,
                    fullname: user.fullname,
                    amount: nominal,
                    pay_amount: realAmount,
                    status: 'pending',
                    type: 'buy_ewallet',
                    product_data: {
                        provider: 'isaku',
                        product_code: product_code,
                        product_name: productName,
                        target: target,
                        nominal: fallbackProduct.nominal
                    },
                    qr_string: payData.payment_number,
                    date: new Date()
                });
                await transaction.save();

                logActivity('ORDER ISAKU (QRIS)', user, `Pending Payment: ${realAmount}`);
                return res.json({
                    success: true,
                    type: 'qris',
                    qr_string: payData.payment_number,
                    order_id,
                    amount: nominal,
                    pay_amount: realAmount
                });
            } else {
                return res.json({ success: false, message: "Gagal generate QRIS" });
            }
        }

    } catch (e) {
        console.log(e);
        res.json({ success: false, message: "Error Server" });
    }
});

// ==========================================
// KASPRO E-WALLET ENDPOINTS
// ==========================================

// Data produk Kaspro default


// Cek nomor Kaspro (simulasi)
app.post('/api/ewallet/check/kaspro', async (req, res) => {
    const { phone_number } = req.body;
    if (!phone_number) return res.json({ success: false, message: "Nomor tidak boleh kosong" });

    let cleanNumber = phone_number.replace(/[^0-9]/g, '');
    if (cleanNumber.startsWith('62')) cleanNumber = '0' + cleanNumber.substring(2);
    
    if (cleanNumber.length < 10 || cleanNumber.length > 13) {
        return res.json({ success: false, message: "Nomor tidak valid (harus 10-13 digit)" });
    }

    return res.json({
        success: true,
        data: {
            number: cleanNumber,
            name: `User Kaspro (${cleanNumber.slice(-4)})`,
            registered: true,
            provider: 'KASPRO'
        }
    });
});

// Daftar produk Kaspro
app.get('/api/ewallet/products/kaspro', async (req, res) => {
    try {
        let liveData = null;
        try {
            const response = await axios.get('https://okeconnect.com/harga/json?id=905ccd028329b0a', { timeout: 5000 });
            if (response.data) liveData = response.data;
        } catch (apiError) {
            console.log("Info: Pusat API Kaspro gagal diload, menggunakan harga JSON cadangan.");
        }

        const kasproProducts = KASPRO_PRODUCTS.map(item => {
            let basePrice = item.default_price;
            
            if (liveData) {
                if (Array.isArray(liveData)) {
                    const found = liveData.find(x => x.kode === item.code || x.code === item.code);
                    if (found && found.harga) basePrice = parseInt(found.harga);
                    else if (found && found.price) basePrice = parseInt(found.price);
                } else {
                    if (liveData[item.code] && liveData[item.code].price) {
                        basePrice = parseInt(liveData[item.code].price);
                    }
                }
            }

            // Fee Rp 200 untuk nominal <= 500rb, Rp 250 untuk > 500rb
            let fee = 350;
            if (item.nominal > 500000) {
                fee = 500;
            }
            
            const markedUpPrice = basePrice + fee;

            return {
                code: item.code,
                name: item.name,
                nominal: item.nominal,
                price: markedUpPrice,
                provider_price: basePrice,
                description: `Topup Kaspro ${item.name}`,
                icon: 'https://api.deline.web.id/il3T6M0giR.png' // Icon Kaspro
            };
        });

        kasproProducts.sort((a, b) => a.nominal - b.nominal);

        res.json({ success: true, data: kasproProducts });

    } catch (error) {
        console.error("Error fetching Kaspro products:", error.message);
        res.json({ success: false, message: "Gagal mengambil daftar produk Kaspro." });
    }
});

// Proses pembelian Kaspro
app.post('/api/buy-ewallet/kaspro', async (req, res) => {
    const { token, product_code, target, method, promo_code, final_amount } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });
        if (!user) return res.json({ success: false, message: "User tidak ditemukan" });

        const fallbackProduct = KASPRO_PRODUCTS.find(p => p.code === product_code);
        if (!fallbackProduct) {
            return res.json({ success: false, message: "Kode produk tidak valid." });
        }

        let basePrice = fallbackProduct.default_price;
        let productName = fallbackProduct.name;

        // Update harga dari server jika tersedia
        try {
            const productListRes = await axios.get('https://okeconnect.com/harga/json?id=905ccd028329b0a', { timeout: 5000 });
            const liveData = productListRes.data;
            if (liveData) {
                if (Array.isArray(liveData)) {
                    const found = liveData.find(x => x.kode === product_code || x.code === product_code);
                    if (found && found.harga) basePrice = parseInt(found.harga);
                    else if (found && found.price) basePrice = parseInt(found.price);
                } else {
                    if (liveData[product_code] && liveData[product_code].price) {
                        basePrice = parseInt(liveData[product_code].price);
                    }
                }
            }
        } catch (e) {
            console.log("Info: Pusat API Kaspro lambat/down saat transaksi, pakai harga default.");
        }

        // Fee Rp 200 untuk nominal <= 500rb, Rp 250 untuk > 500rb
        let fee = 200;
        if (fallbackProduct.nominal > 500000) {
            fee = 250;
        }
        
        const nominal = basePrice + fee;
        
        let finalAmount = final_amount || nominal;
        
        // Proses promo jika ada
        if (promo_code && method === 'saldo') {
            const promo = await Promo.findOne({ code: promo_code.toUpperCase(), status: true });
            if (promo) {
                const userUsage = await PromoUsage.countDocuments({ promo_code: promo.code, username: user.username });
                if (userUsage < promo.per_user_limit) {
                    const now = new Date();
                    if (now >= promo.start_date && (!promo.end_date || now <= promo.end_date)) {
                        
                        let discount = promo.discount_type === 'percentage'
                            ? Math.floor(nominal * promo.discount_value / 100)
                            : promo.discount_value;
                            
                        if (promo.max_discount && discount > promo.max_discount) discount = promo.max_discount;
                        if (discount > nominal) discount = nominal;
                        
                        finalAmount = nominal - discount;
                        
                        promo.used_count += 1;
                        await promo.save();
                        
                        await new PromoUsage({
                            promo_code: promo.code,
                            username: user.username,
                            order_id: "PROMO-" + Date.now()
                        }).save();
                    }
                }
            }
        }

        if (method === 'saldo') {
            if (user.balance < finalAmount) {
                return res.json({ success: false, message: "Saldo tidak cukup!" });
            }

            let cleanTarget = target.replace(/[^0-9]/g, '');
            if (cleanTarget.startsWith('62') && cleanTarget.length >= 10) cleanTarget = '0' + cleanTarget.substring(2);
            
            const refID = Date.now().toString().slice(-8);
            const okeUrl = `${OKE_URL}?memberID=${OKE_MEMBER_ID}&pin=${OKE_PIN}&password=${encodeURIComponent(process.env.OKE_PASSWORD)}&product=${product_code}&dest=${cleanTarget}&refID=${refID}`;
            
            try {
                const okeResponse = await axios.get(okeUrl);
                const responseText = okeResponse.data;
                const respUpper = responseText.toUpperCase();

                // Cek error
                if (respUpper.includes('NOMOR TIDAK TERDAFTAR') ||
                    respUpper.includes('INVALID DESTINATION') ||
                    respUpper.includes('GAGAL') ||
                    respUpper.includes('SALAH') ||
                    respUpper.includes('TIDAK DAPAT DIPROSES')) {
                    
                    return res.json({
                        success: false,
                        message: "Gagal: " + responseText,
                        refund: true
                    });
                }

                if (respUpper.includes('PROSES') || respUpper.includes('SUKSES') || respUpper.includes('BERHASIL')) {
                    
                    user.balance -= finalAmount;
                    
                    const poinPanel = Math.floor(finalAmount / 10000); 
            if (poinPanel > 0) {
                user.points = (user.points || 0) + poinPanel;
            }
                    
                    await user.save();

                    const order_id = "KSP-" + Date.now();
                    
                    const transaction = new Transaction({
                        order_id: order_id,
                        provider_oid: refID,
                        username: user.username,
                        fullname: user.fullname,
                        amount: nominal,
                        pay_amount: finalAmount,
                        status: 'success',
                        type: 'buy_ewallet',
                        product_data: {
                            provider: 'kaspro',
                            product_code: product_code,
                            product_name: productName,
                            target: target,
                            nominal: fallbackProduct.nominal,
                            provider_ref_id: refID,
                            provider_message: responseText
                        },
                        qr_string: '-',
                        date: new Date()
                    });
                    await transaction.save();

                    await processEWalletPurchase(user, {
                        provider: 'kaspro',
                        product_code: product_code,
                        product_name: productName,
                        target: target,
                        price: nominal,
                        provider_ref_id: refID,
                        provider_message: responseText
                    }, order_id);

                    return res.json({
                        success: true,
                        message: "Topup Kaspro sedang diproses!",
                        type: 'instant',
                        data: {
                            order_id,
                            target,
                            amount: nominal
                        }
                    });

                } else {
                    return res.json({ success: false, message: "Gagal dari Pusat: " + responseText });
                }

            } catch (apiError) {
                console.error("Okeconnect API Error:", apiError.message);
                return res.json({ success: false, message: "Gagal terhubung ke provider Kaspro." });
            }

        } else if (method === 'qris') {
            const order_id = "KSP-" + Date.now();
            const amountToSend = finalAmount + parseInt(process.env.ADMIN_FEE || 0);
            
            const response = await axios.post('https://app.pakasir.com/api/transactioncreate/qris', {
                project: PAKASIR_SLUG,
                order_id: order_id,
                amount: amountToSend,
                api_key: PAKASIR_API_KEY
            });

            if (response.data && response.data.payment) {
                const payData = response.data.payment;
                const realAmount = payData.total_payment ? parseInt(payData.total_payment) : amountToSend;

                const transaction = new Transaction({
                    order_id: order_id,
                    username: user.username,
                    fullname: user.fullname,
                    amount: nominal,
                    pay_amount: realAmount,
                    status: 'pending',
                    type: 'buy_ewallet',
                    product_data: {
                        provider: 'kaspro',
                        product_code: product_code,
                        product_name: productName,
                        target: target,
                        nominal: fallbackProduct.nominal
                    },
                    qr_string: payData.payment_number,
                    date: new Date()
                });
                await transaction.save();

                logActivity('ORDER KASPRO (QRIS)', user, `Pending Payment: ${realAmount}`);
                return res.json({
                    success: true,
                    type: 'qris',
                    qr_string: payData.payment_number,
                    order_id,
                    amount: nominal,
                    pay_amount: realAmount
                });
            } else {
                return res.json({ success: false, message: "Gagal generate QRIS" });
            }
        }

    } catch (e) {
        console.log(e);
        res.json({ success: false, message: "Error Server" });
    }
});

// ==========================================
// AUTO-CLEANUP TRANSAKSI SAMPAH (7 HARI)
// ==========================================
cron.schedule('0 4 * * *', async () => {
    try {
        const tujuhHariLalu = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
        const hasil = await Transaction.deleteMany({ 
            date: { $lt: tujuhHariLalu },
            status: { $in: ['pending', 'canceled', 'expired'] }
        });
        
        if (hasil.deletedCount > 0) {
            console.log(`🧹 Auto-Clean: Menghapus ${hasil.deletedCount} transaksi sampah.`);
        }
    } catch (e) {
        console.error("Gagal melakukan auto-clean transaksi:", e);
    }
});

// ==========================================
// DATABASE MANAGER ENDPOINTS
// ==========================================

// Mapping model yang tersedia agar aman
const dbModels = {
    'users': User,
    'transactions': Transaction,
    'panels': Panel,
    'reviews': Review,
    'broadcasts': Broadcast,
    'promos': Promo,
    'otpstorages': OtpStorage,
    'resetstorages': ResetStorage
};

// API untuk mengambil isi collection
app.post('/api/admin/db/docs', authAdmin, async (req, res) => {
    const { collection } = req.body;
    
    if (!dbModels[collection]) {
        return res.json({ success: false, message: "Koleksi tidak ditemukan!" });
    }

    try {
        // Ambil 100 data terbaru dari collection yang dipilih
        const docs = await dbModels[collection].find().sort({ _id: -1 }).limit(100);
        res.json({ success: true, data: docs });
    } catch (e) {
        console.error(e);
        res.json({ success: false, message: "Gagal memuat database." });
    }
});

// API untuk menghapus dokumen berdasarkan _id
app.post('/api/admin/db/delete', authAdmin, async (req, res) => {
    const { collection, id } = req.body;

    if (!dbModels[collection]) {
        return res.json({ success: false, message: "Koleksi tidak ditemukan!" });
    }

    try {
        await dbModels[collection].findByIdAndDelete(id);
        res.json({ success: true, message: "Dokumen berhasil dihapus permanen dari Database!" });
    } catch (e) {
        console.error(e);
        res.json({ success: false, message: "Gagal menghapus dokumen." });
    }
});

app.post('/api/admin/gacha/get', authAdmin, async (req, res) => {
    try {
        let setting = await GachaSetting.findOne();
        if (!setting) {
            // Default pertama kali dibuat
            setting = await GachaSetting.create({
                items: [
                    { name: "Saldo Random", type: "saldo", min: 1, max: 1000, chance: 85 },
                    { name: "Panel Premium", type: "item", min: 0, max: 0, chance: 5 },
                    { name: "Script Bot", type: "item", min: 0, max: 0, chance: 5 },
                    { name: "Join Murid", type: "item", min: 0, max: 0, chance: 5 }
                ]
            });
        }
        res.json({ success: true, data: setting.items });
    } catch (e) {
        console.error("Gacha DB Error:", e);
        // Menampilkan pesan error asli jika gagal lagi
        res.json({ success: false, message: "Error DB: " + e.message }); 
    }
});

// 3. API Admin Simpan Setting Gacha
app.post('/api/admin/gacha/save', authAdmin, async (req, res) => {
    try {
        let setting = await GachaSetting.findOne();
        if (!setting) setting = new GachaSetting();
        
        // PASTIKAN items adalah array, bukan string
        let items = req.body.items;
        
        // Jika items adalah string, parse menjadi array
        if (typeof items === 'string') {
            try {
                items = JSON.parse(items);
            } catch (e) {
                return res.json({ success: false, message: "Format data hadiah tidak valid (bukan JSON)" });
            }
        }
        
        // Validasi: pastikan items adalah array
        if (!Array.isArray(items)) {
            return res.json({ success: false, message: "Data hadiah harus berupa array" });
        }
        
        // Validasi total chance harus 100
        const totalChance = items.reduce((sum, item) => sum + (item.chance || 0), 0);
        if (totalChance !== 100) {
            return res.json({ success: false, message: `Total peluang harus 100%, saat ini ${totalChance}%` });
        }
        
        setting.items = items;
        await setting.save();
        res.json({ success: true, message: "Setting Gacha berhasil diperbarui!" });
    } catch (e) {
        console.error("Error save gacha:", e);
        res.json({ success: false, message: "Error DB: " + e.message });
    }
});

// 4. MESIN GACHA UTAMA UNTUK MEMBER
app.post('/api/gacha', async (req, res) => {
    const { token } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rahasia');
        const user = await mongoose.model('User').findOne({ username: decoded.username });
        if (!user) return res.json({ success: false, message: "User tidak ditemukan." });

        if ((user.points || 0) < 1) {
            return res.json({ success: false, message: "Poin kamu tidak cukup! Transaksi 10k untuk dapat 1 Poin." });
        }

        user.points -= 1; // Potong 1 poin

        let setting = await GachaSetting.findOne();
        let prizes = setting ? setting.items : [{ name: "Saldo Random", type: "saldo", min: 1, max: 1000, chance: 100 }];

        // Sistem Acak & Peluang
        const roll = Math.random() * 100;
        let currentChance = 0;
        let selectedPrize = null;

        for (let prize of prizes) {
            currentChance += prize.chance;
            if (roll <= currentChance) {
                selectedPrize = prize;
                break;
            }
        }
        if (!selectedPrize) selectedPrize = prizes[0];

        let hadiahText = selectedPrize.name;
        let jenisHadiah = selectedPrize.type;
        let amount = 0;

        // Jika tipe hadiah adalah saldo
        if (jenisHadiah === 'saldo') {
            amount = Math.floor(Math.random() * (selectedPrize.max - selectedPrize.min + 1)) + selectedPrize.min;
            hadiahText = `Saldo Rp ${amount.toLocaleString()}`;
            user.balance += amount; 
        } 
        // === TAMBAHAN KODE UNTUK ACAK BARANG ===
        else if (jenisHadiah === 'item') {
            // Cek apakah admin memasukkan banyak barang dipisah tanda koma
            if (hadiahText.includes(',')) {
                // Pecah teks menjadi array berdasarkan tanda koma
                const pilihanBarang = hadiahText.split(',').map(item => item.trim());
                // Pilih satu barang secara acak dari array tersebut
                const randomIndex = Math.floor(Math.random() * pilihanBarang.length);
                hadiahText = pilihanBarang[randomIndex];
            }
        }

        await user.save();

        // Catat riwayat
        await mongoose.model('Transaction').create({
            order_id: "GCH-" + Date.now(),
            username: user.username,
            fullname: user.fullname,
            amount: amount,
            pay_amount: 0,
            status: 'success',
            type: 'gacha_reward',
            product_data: { product_name: `Hadiah Gacha: ${hadiahText}` },
            qr_string: '-',
            date: new Date()
        });

        res.json({ 
            success: true, 
            prize: hadiahText,
            jenis: jenisHadiah,
            sisa_points: user.points,
            message: "Berhasil"
        });

    } catch (error) {
        console.error("Gagal gacha:", error);
        res.json({ success: false, message: "Terjadi kesalahan server: " + error.message });
    }
});

// 2. API Buat THR Baru
app.post('/api/thr/create', async (req, res) => {
    const { token, total_amount, max_winners, type } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rahasia');
        const user = await mongoose.model('User').findOne({ username: decoded.username });
        if (!user) return res.json({ success: false, message: "User tidak ditemukan." });

        if (user.balance < total_amount) return res.json({ success: false, message: "Saldo kamu tidak cukup." });
        if (total_amount < 100 || max_winners < 1) return res.json({ success: false, message: "Minimal THR Rp 100." });

        user.balance -= total_amount;
        await user.save();

        const code = "THR-" + Math.random().toString(36).substr(2, 6).toUpperCase();
        await new Thr({ code, creator_username: user.username, creator_name: user.fullname, total_amount, remaining_amount: total_amount, max_winners, type, claimed_by: [] }).save();

        await mongoose.model('Transaction').create({
            order_id: "T-OUT-" + Date.now(),
            username: user.username, fullname: user.fullname, amount: total_amount, pay_amount: 0, status: 'success', type: 'transfer_out',
            product_data: { product_name: "Buat THR Kaget", recipient: "Banyak Orang" }, qr_string: '-', date: new Date()
        });

        res.json({ success: true, code, message: "THR berhasil dibuat!" });
    } catch (e) { res.json({ success: false, message: "Gagal membuat THR." }); }
});

// 3. API Klaim THR (Dengan Cek Expired 24 Jam)
app.post('/api/thr/claim', async (req, res) => {
    const { token, code } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rahasia');
        const user = await mongoose.model('User').findOne({ username: decoded.username });
        if (!user) return res.json({ success: false, message: "Login dulu untuk klaim." });

        const thr = await Thr.findOne({ code });
        if (!thr) return res.json({ success: false, message: "Link THR tidak valid atau sudah dihapus." });

        // Cek Apakah THR Sudah Expired (Lebih dari 24 Jam)
        const isExpired = (new Date() - new Date(thr.created_at)) > 24 * 60 * 60 * 1000;
        if (isExpired || thr.is_refunded) {
            return res.json({ success: false, message: "Waktu klaim THR ini sudah habis (Lebih dari 24 Jam)." });
        }

        const getWinnersList = async () => {
            const winners = [];
            for (let claim of thr.claimed_by) {
                const u = await mongoose.model('User').findOne({ username: claim.username });
                winners.push({ username: claim.username, fullname: u ? u.fullname : claim.username, amount: claim.amount, date: claim.date, is_sultan: u ? (u.stat_trx_count > 50) : false });
            }
            return winners.reverse();
        };

        if (thr.remaining_amount <= 0 || thr.claimed_by.length >= thr.max_winners) {
            return res.json({ success: false, message: "Yahh, THR-nya sudah ludes ditarik orang lain! 😭", creator: thr.creator_name, winners: await getWinnersList() });
        }
        if (thr.claimed_by.find(c => c.username === user.username)) {
            return res.json({ success: false, message: "Kamu sudah mengklaim THR ini!", creator: thr.creator_name, winners: await getWinnersList() });
        }

        let dapetSaldo = 0; const sisaOrang = thr.max_winners - thr.claimed_by.length;
        if (thr.type === 'equal') {
            dapetSaldo = Math.floor(thr.total_amount / thr.max_winners);
            if (sisaOrang === 1) dapetSaldo = thr.remaining_amount; 
        } else {
            if (sisaOrang === 1) dapetSaldo = thr.remaining_amount; 
            else dapetSaldo = Math.floor(Math.random() * ((thr.remaining_amount - (sisaOrang - 1)) / 1.5)) + 1; 
        }

        thr.remaining_amount -= dapetSaldo;
        thr.claimed_by.push({ username: user.username, amount: dapetSaldo });
        await thr.save();

        user.balance += dapetSaldo; await user.save();

        await mongoose.model('Transaction').create({
            order_id: "T-IN-" + Date.now(), username: user.username, fullname: user.fullname, amount: dapetSaldo, pay_amount: 0, status: 'success', type: 'transfer_in',
            product_data: { product_name: "Dapat THR Kaget", sender: thr.creator_username }, qr_string: '-', date: new Date()
        });

        res.json({ success: true, amount: dapetSaldo, creator: thr.creator_name, winners: await getWinnersList(), message: `Hore! Kamu dapat THR Rp ${dapetSaldo.toLocaleString()}` });
    } catch (e) { res.json({ success: false, message: "Terjadi kesalahan." }); }
});

// 4. API Lihat Riwayat THR Pribadi
app.post('/api/thr/history', async (req, res) => {
    const { token } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rahasia');
        const thrs = await mongoose.model('Thr').find({ creator_username: decoded.username }).sort({ created_at: -1 });
        res.json({ success: true, data: thrs });
    } catch (e) { res.json({ success: false, message: "Gagal memuat riwayat." }); }
});

// 5. ROBOT AUTO-REFUND 24 JAM
// Robot ini akan ngecek setiap 10 menit. Jika ada THR > 24 Jam dan ada sisa saldo, langsung kembalikan.
cron.schedule('*/10 * * * *', async () => {
    try {
        const expiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000); 
        const expiredThrs = await Thr.find({ created_at: { $lte: expiredDate }, remaining_amount: { $gt: 0 }, is_refunded: false });

        for (let thr of expiredThrs) {
            const creator = await mongoose.model('User').findOne({ username: thr.creator_username });
            if (creator) {
                creator.balance += thr.remaining_amount; // Kembalikan saldo
                await creator.save();

                // Catat transaksi refund
                await mongoose.model('Transaction').create({
                    order_id: "RF-THR-" + Date.now(), username: creator.username, fullname: creator.fullname, amount: thr.remaining_amount, pay_amount: 0, status: 'success', type: 'refund_thr',
                    product_data: { product_name: "Refund Sisa THR Expired", code: thr.code }, qr_string: '-', date: new Date()
                });
            }
            thr.is_refunded = true;
            thr.remaining_amount = 0; 
            await thr.save();
        }
    } catch (error) { console.error("Gagal Cron Refund THR:", error); }
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/payment', (req, res) => res.sendFile(path.join(__dirname, 'public', 'payment.html')));
app.get('/top-sultan', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dasbor_top.html'));
});
app.get('/transfer', (req, res) => res.sendFile(path.join(__dirname, 'public', 'transfer.html')));
app.get('/ulasan', (req, res) => res.sendFile(path.join(__dirname, 'public', 'ulasan_rivewe.html')));
app.get('/rahasia_admin_web', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dasbord-admin.html'));
});

app.listen(PORT, () => console.log(`Server Jalan di Port ${PORT}`));