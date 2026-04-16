const axios = require('axios');
const FormData = require('form-data');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// ==========================================
// FUNGSI 1: GAMBAR INVOICE (16:9 LANDSCAPE 2 KOLOM)
// ==========================================
async function createInvoiceImage(data) {
    const canvas = createCanvas(800, 450);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f4f7f6';
    ctx.fillRect(0, 0, 800, 450);

    ctx.fillStyle = '#2196F3';
    ctx.fillRect(0, 0, 800, 100);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('INVOICE TRANSAKSI', 400, 45);
    ctx.font = '18px Arial';
    ctx.fillText('GILZZ OTP - Lunas / Sukses', 400, 75);

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 10;
    ctx.fillRect(40, 120, 720, 270);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#2c3e50';
    ctx.textAlign = 'left';
    ctx.font = 'bold 22px Arial';
    ctx.fillText('Detail Pesanan:', 70, 165);

    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(70, 180, 360, 2);

    const drawRow = (y, label, value) => {
        ctx.fillStyle = '#7f8c8d';
        ctx.font = '18px Arial';
        ctx.fillText(label, 70, y);
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 18px Arial';
        
        let pVal = value || '-';
        if (pVal.length > 25) pVal = pVal.substring(0, 23) + '...';
        
        ctx.textAlign = 'right';
        ctx.fillText(pVal, 420, y); 
        ctx.textAlign = 'left';
    };

    drawRow(220, 'Order ID', data.orderId);
    drawRow(255, 'Tanggal', data.trxDate.split(' ')[0]);
    drawRow(290, 'Nama Pembeli', data.buyer);
    drawRow(325, 'Produk', data.productName);
    if(data.target) drawRow(360, 'Target/No', data.target);

    ctx.fillStyle = '#E3F2FD'; 
    ctx.fillRect(460, 165, 270, 160);
    
    ctx.fillStyle = '#2196F3';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('TOTAL PEMBAYARAN', 595, 210);
    
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 36px Arial';
    ctx.fillText('Rp ' + data.amount, 595, 260);

    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('SUKSES ✓', 595, 300);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#95a5a6';
    ctx.font = 'italic 16px Arial';
    ctx.fillText('Terima kasih telah berbelanja di GILZZ OTP', 400, 420);

    return canvas.toBuffer('image/png');
}

// ==========================================
// FUNGSI 2: GAMBAR TESTIMONI (UNTUK TELEGRAM)
// ==========================================
async function createTestiImage(data) {
    const canvas = createCanvas(800, 450);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f9f9f9';
    ctx.fillRect(0, 0, 800, 450);

    ctx.save();
    ctx.translate(400, 225); 
    ctx.rotate(-Math.PI / 6); 
    
    const stampColor = 'rgba(34, 197, 94, 0.12)'; 
    ctx.strokeStyle = stampColor;
    ctx.lineWidth = 8;
    ctx.strokeRect(-280, -90, 560, 180);
    ctx.lineWidth = 3;
    ctx.strokeRect(-265, -75, 530, 150);
    
    ctx.fillStyle = stampColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 90px "Courier New", Courier, monospace';
    ctx.fillText('L U N A S', 0, -10);
    ctx.font = 'bold 28px "Courier New", Courier, monospace';
    ctx.fillText('GILZZ OTP SYSTEM', 0, 45);
    ctx.restore();

    ctx.font = 'bold 45px "Courier New", Courier, monospace';
    ctx.fillStyle = '#0033a0';
    ctx.textAlign = 'right';
    ctx.fillText('GILZ ', 400, 55);
    ctx.fillStyle = '#ed1c24';
    ctx.textAlign = 'left';
    ctx.fillText('MART', 400, 55);

    ctx.fillStyle = '#333333';
    ctx.textAlign = 'center';
    ctx.font = '16px "Courier New", Courier, monospace';
    ctx.fillText('Pusat Digital & Topup Game  |  gilzzotp.alwaysrikyshop.my.id', 400, 85);

    const drawDottedLine = (y) => {
        ctx.fillStyle = '#333333';
        ctx.textAlign = 'center';
        ctx.font = 'bold 16px "Courier New", Courier, monospace';
        ctx.fillText('-'.repeat(80), 400, y);
    };

    drawDottedLine(115);

    ctx.font = '18px "Courier New", Courier, monospace';
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'left';
    ctx.fillText('Kasir  : Auto Bot System', 40, 150);
    ctx.fillText(`No.Trx : #${data.orderId}`, 40, 180);
    ctx.textAlign = 'right';
    ctx.fillText(`Waktu   : ${data.trxDate}`, 760, 150);
    ctx.fillText(`Pembeli : ${data.maskedPhone}`, 760, 180);

    drawDottedLine(215);

    ctx.textAlign = 'left';
    ctx.font = 'bold 22px "Courier New", Courier, monospace';
    let pName = data.productName;
    if (pName.length > 45) pName = pName.substring(0, 42) + '...';
    ctx.fillText(pName, 40, 255);

    ctx.font = '18px "Courier New", Courier, monospace';
    if(data.target) {
        ctx.fillText(`Tujuan : ${data.target}`, 40, 285);
    }

    ctx.textAlign = 'right';
    ctx.font = 'bold 22px "Courier New", Courier, monospace';
    ctx.fillText(`Rp ${data.amount}`, 760, 255);

    drawDottedLine(320);

    ctx.textAlign = 'left';
    ctx.font = '14px "Courier New", Courier, monospace';
    ctx.fillText('* Harga sudah termasuk PPN', 40, 350);
    ctx.fillText('* Barang digital yang sudah dibeli', 40, 370);
    ctx.fillText('  tidak dapat dikembalikan.', 40, 390);

    ctx.fillStyle = '#111111';
    let startX = 40;
    for(let i = 0; i < 35; i++) {
        let barWidth = Math.random() * 4 + 1;
        if (startX + barWidth < 350) {
            ctx.fillRect(startX, 405, barWidth, 30);
        }
        startX += (barWidth + 2);
    }

    ctx.fillStyle = '#333333';
    ctx.textAlign = 'left';
    ctx.font = 'bold 20px "Courier New", Courier, monospace';
    ctx.fillText('TOTAL BELANJA', 450, 355);
    ctx.font = '18px "Courier New", Courier, monospace';
    ctx.fillText('TUNAI / LUNAS', 450, 385);
    ctx.fillText('KEMBALIAN', 450, 415);

    ctx.textAlign = 'right';
    ctx.font = 'bold 22px "Courier New", Courier, monospace';
    ctx.fillText(`Rp ${data.amount}`, 760, 355);
    ctx.font = '18px "Courier New", Courier, monospace';
    ctx.fillText(`Rp ${data.amount}`, 760, 385);
    ctx.fillText(`Rp 0`, 760, 415);

    return canvas.toBuffer('image/png');
}

// ==========================================
// FUNGSI 3: GAMBAR MEMBER BARU 
// ==========================================
async function createNewMemberImage(user, joinDate, maskedPhone) {
    const canvas = createCanvas(800, 450);
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 800, 450);
    grad.addColorStop(0, '#0B0C10');
    grad.addColorStop(1, '#1F2833');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 450);

    ctx.fillStyle = '#66FCF1';
    ctx.fillRect(0, 0, 15, 450);

    ctx.fillStyle = '#66FCF1';
    ctx.font = 'bold 35px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('NEW MEMBER REGISTRATION', 400, 70);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.strokeStyle = '#45A29E';
    ctx.lineWidth = 2;
    ctx.fillRect(50, 100, 700, 300);
    ctx.strokeRect(50, 100, 700, 300);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.font = 'bold 90px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GILZZ OTP', 400, 280);

    ctx.textAlign = 'left';
    
    const drawText = (y, label, value) => {
        ctx.fillStyle = '#C5C6C7';
        ctx.font = '24px Arial';
        ctx.fillText(label, 90, y);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 26px Arial';
        ctx.fillText(`:  ${value}`, 280, y);
    };

    drawText(160, 'Nama Lengkap', user.fullname || user.username);
    drawText(210, 'Username', `@${user.username}`);
    drawText(260, 'No. Telepon', maskedPhone);
    drawText(310, 'Saldo Awal', 'Rp 0');
    drawText(360, 'Tgl Bergabung', joinDate.split(' ')[0]);

    ctx.fillStyle = '#66FCF1';
    ctx.font = '16px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('Verified by System ✓', 730, 380);

    return canvas.toBuffer('image/png');
}

// ==========================================
// FUNGSI BARU 4: GAMBAR DEPOSIT (16:9 HIJAU)
// ==========================================
async function createDepositImage(username, amount, newBalance, dateStr) {
    const canvas = createCanvas(800, 450);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f4f7f6';
    ctx.fillRect(0, 0, 800, 450);

    ctx.fillStyle = '#4CAF50'; 
    ctx.fillRect(0, 0, 800, 100);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('DEPOSIT BERHASIL', 400, 45);
    ctx.font = '18px Arial';
    ctx.fillText('GILZZ OTP - Penambahan Saldo', 400, 75);

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 10;
    ctx.fillRect(40, 120, 720, 270);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#2c3e50';
    ctx.textAlign = 'left';
    ctx.font = 'bold 22px Arial';
    ctx.fillText('Rincian Mutasi:', 70, 165);

    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(70, 180, 360, 2);

    const drawRow = (y, label, value) => {
        ctx.fillStyle = '#7f8c8d';
        ctx.font = '18px Arial';
        ctx.fillText(label, 70, y);
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(value, 420, y);
        ctx.textAlign = 'left';
    };

    drawRow(220, 'Username', `@${username}`);
    drawRow(255, 'Waktu', dateStr);
    drawRow(290, 'Status Mutasi', 'BERHASIL ✓');

    ctx.fillStyle = '#E8F5E9'; 
    ctx.fillRect(460, 165, 270, 160);
    
    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('NOMINAL MASUK', 595, 210);
    
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('Rp ' + amount.toLocaleString('id-ID'), 595, 260);

    ctx.fillStyle = '#7f8c8d';
    ctx.font = '16px Arial';
    ctx.fillText(`Saldo Kini: Rp ${newBalance.toLocaleString('id-ID')}`, 595, 295);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#95a5a6';
    ctx.font = 'italic 16px Arial';
    ctx.fillText('Terima kasih telah melakukan deposit di GILZZ OTP', 400, 420);

    return canvas.toBuffer('image/png');
}

// ==========================================
// FUNGSI BARU 5: GAMBAR TRANSFER (16:9 ORANGE/UNGU)
// ==========================================
async function createTransferImage(isSender, senderUser, recipientUser, amount, balance, dateStr) {
    const canvas = createCanvas(800, 450);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f4f7f6';
    ctx.fillRect(0, 0, 800, 450);

    ctx.fillStyle = isSender ? '#FF9800' : '#9C27B0'; // Orange untuk Keluar, Ungu untuk Masuk
    ctx.fillRect(0, 0, 800, 100);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(isSender ? 'TRANSFER BERHASIL' : 'PENERIMAAN SALDO', 400, 45);
    ctx.font = '18px Arial';
    ctx.fillText('GILZZ OTP - Mutasi Antar Member', 400, 75);

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 10;
    ctx.fillRect(40, 120, 720, 270);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#2c3e50';
    ctx.textAlign = 'left';
    ctx.font = 'bold 22px Arial';
    ctx.fillText('Rincian Transfer:', 70, 165);

    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(70, 180, 360, 2);

    const drawRow = (y, label, value) => {
        ctx.fillStyle = '#7f8c8d';
        ctx.font = '18px Arial';
        ctx.fillText(label, 70, y);
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(value, 420, y);
        ctx.textAlign = 'left';
    };

    drawRow(220, 'Pengirim', `@${senderUser}`);
    drawRow(255, 'Penerima', `@${recipientUser}`);
    drawRow(290, 'Waktu', dateStr);

    ctx.fillStyle = isSender ? '#FFF3E0' : '#F3E5F5'; 
    ctx.fillRect(460, 165, 270, 160);
    
    ctx.fillStyle = isSender ? '#FF9800' : '#9C27B0';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(isSender ? 'TOTAL KELUAR' : 'TOTAL MASUK', 595, 210);
    
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('Rp ' + amount.toLocaleString('id-ID'), 595, 260);

    ctx.fillStyle = '#7f8c8d';
    ctx.font = '16px Arial';
    ctx.fillText(`Sisa Saldo: Rp ${balance.toLocaleString('id-ID')}`, 595, 295);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#95a5a6';
    ctx.font = 'italic 16px Arial';
    ctx.fillText('Terima kasih telah menggunakan layanan GILZZ OTP', 400, 420);

    return canvas.toBuffer('image/png');
}

// ==========================================
// EKSEKUSI 1: TRANSAKSI PRODUK
// ==========================================
async function sendTrxNotifications({
    user, orderId, productName, amount, trxDate, totalSukses, type, sendWhatsApp, sock, extraData = {}
}) {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_OWNER_ID = process.env.TELEGRAM_OWNER_ID;
    const TELEGRAM_CHANNEL_TESTI = process.env.TELEGRAM_CHANNEL_TESTI || process.env.TELEGRAM_CHANNEL_ID;
    const WA_CHANNEL_TESTI = process.env.WA_CHANNEL_TESTI || process.env.WA_CHANNEL_ID;
    const STORE_LINK = process.env.STORE_LINK || 'https://gilzzotp.alwaysrikyshop.my.id/';
    
    // PERBAIKAN: Dibungkus String() agar aman dari undefined/Number
    let cleanPhone = user.phone ? String(user.phone).replace(/[^0-9]/g, '') : "62800000000";
    if (cleanPhone.startsWith('08')) {
        cleanPhone = '62' + cleanPhone.slice(1);
    }
    
    const jidUser = cleanPhone + "@s.whatsapp.net";
    const maskedPhone = cleanPhone.substring(0, 5) + '****' + cleanPhone.slice(-3);

    const fullProductName = `${type} ${productName.toUpperCase()}`;

    const invoiceBuffer = await createInvoiceImage({
        orderId, productName: fullProductName, amount, trxDate, buyer: user.fullname || user.username, target: extraData.target || extraData.nomor || null
    });

    const testiBuffer = await createTestiImage({
        orderId, trxDate, productName: fullProductName, amount, target: extraData.target || extraData.nomor || null, maskedPhone
    });

    let msgUser = `╭━━ ⪻ 𝐓𝐑𝐀𝐍𝐒𝐀𝐊𝐒𝐈 𝐒𝐔𝐊𝐒𝐄𝐒 ⪼ ━━╮\n┃\n┃ 🛍️ 𝐏𝐫𝐨𝐝𝐮𝐤   : ${fullProductName}\n`;
    if (extraData.target) msgUser += `┃ 🎯 𝐓𝐚𝐫𝐠𝐞𝐭   : ${extraData.target}\n`;
    if (extraData.qty) msgUser += `┃ 🔢 𝐉𝐮𝐦𝐥𝐚𝐡   : ${extraData.qty}\n`;
    if (extraData.negara) msgUser += `┃ 🌍 𝐍𝐞𝐠𝐚𝐫𝐚   : ${extraData.negara}\n`;
    if (extraData.nomor) msgUser += `┃ 📱 𝐍𝐨𝐦𝐨𝐫    : ${extraData.nomor}\n`;
    msgUser += `┃ 💰 𝐇𝐚𝐫𝐠𝐚    : Rp ${amount}\n┃ 📅 𝐓𝐚𝐧𝐠𝐠𝐚𝐥  : ${trxDate}\n┃ 👤 𝐍𝐚𝐦𝐚     : ${user.fullname || user.username}\n┃ 🆙 𝐓𝐫𝐱 𝐊𝐞   : ${totalSukses}\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\nTerimakasih telah bertransaksi di GILZZ STORE\nSilakan cek di web:\n${STORE_LINK}`;
    
    if (sock && user.phone) {
        console.log(`[INFO] Mengirim Invoice WA ke: ${jidUser}`);
        try {
            await sock.sendMessage(jidUser, { image: invoiceBuffer, caption: msgUser });
            console.log("✅ [SUKSES] Invoice WA terkirim ke pembeli!");
        } catch (err) {
            console.log("❌ [GAGAL] Kirim Invoice WA:", err.message || err);
        }
    }

    if (TELEGRAM_OWNER_ID && TELEGRAM_BOT_TOKEN) {
        let msgAdmin = `🔔 𝐋𝐀𝐏𝐎𝐑𝐀𝐍 𝐎𝐑𝐃𝐄𝐑𝐀𝐍 𝐁𝐀𝐑𝐔\n\n👤 Username   : ${user.username}\n📅 Tanggal    : ${trxDate}\n📦 Order      : ${fullProductName}\n`;
        if (extraData.target) msgAdmin += `🎯 Target     : ${extraData.target}\n`;
        if (extraData.qty) msgAdmin += `🔢 Jumlah     : ${extraData.qty}\n`;
        if (extraData.nomor) msgAdmin += `📱 Nomor      : ${extraData.nomor}\n`;
        msgAdmin += `💰 Harga      : Rp ${amount}\n💳 Sisa Saldo : Rp ${(user.balance || 0).toLocaleString('id-ID')}`;
        axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, { chat_id: TELEGRAM_OWNER_ID, text: msgAdmin }).catch(()=>{});
    }

    let statusText = extraData.status || "Terkirim";
    let baseInfo = `❖ 【 𝐓𝐑𝐀𝐍𝐒𝐀𝐊𝐒𝐈 𝐒𝐄𝐋𝐄𝐒𝐀𝐈 】 ❖\n╭━━━━━━━━━━━━━━━━━━━\n┣🆔 𝐎𝐫𝐝𝐞𝐫 𝐈𝐃 : #${orderId}\n┣📦 𝐋𝐚𝐲𝐚𝐧𝐚𝐧  : ${fullProductName}\n`;
    
    if (extraData.target) {
        let maskedTarget = extraData.target.length > 8 ? extraData.target.substring(0, 3) + '****' + extraData.target.slice(-3) : extraData.target.substring(0, 2) + '****';
        baseInfo += `┣🎯 𝐓𝐚𝐫𝐠𝐞𝐭   : ${maskedTarget}\n`;
    }
    if (extraData.qty) baseInfo += `┣🔢 𝐉𝐮𝐦𝐥𝐚𝐡   : ${extraData.qty}\n`;

    baseInfo += `┣💰 𝐇𝐚𝐫𝐠𝐚    : Rp ${amount}\n┣👤 𝐁𝐮𝐲𝐞𝐫    : ${maskedPhone}\n┣🆙 𝐔𝐫𝐮𝐭𝐚𝐧   : ${totalSukses}\n┣📅 𝐓𝐚𝐧𝐠𝐠𝐚𝐥  : ${trxDate}\n┣🔄 𝐒𝐭𝐚𝐭𝐮𝐬   : ${statusText}\n╰━━━━━━━━━━━━━━━━━━━\n\nTerima kasih atas kepercayaannya.\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n• 𝐂𝐞𝐤 & 𝐎𝐫𝐝𝐞𝐫:\nhttps://gilzzotp.alwaysrikyshop.my.id/\n• 𝐂𝐨𝐧𝐭𝐚𝐜𝐭 𝐀𝐝𝐦𝐢𝐧:\n`;

    const footerText = `\n\n—© Created with pride by GILZZ STORE`;

    let msgTestiTele = baseInfo + "t.me/jahahahaha" + footerText;
    let msgTestiWA = baseInfo + "wa.me/0827472829982" + footerText;

    if (TELEGRAM_CHANNEL_TESTI && TELEGRAM_BOT_TOKEN) {
        const form = new FormData();
        form.append('chat_id', TELEGRAM_CHANNEL_TESTI);
        form.append('photo', testiBuffer, 'testimoni.jpg');
        form.append('caption', msgTestiTele);
        axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, form, { headers: form.getHeaders() }).catch(()=>{});
    }
    
    if (WA_CHANNEL_TESTI && sock) {
        let cleanChannelId = WA_CHANNEL_TESTI.trim(); 
        if (!cleanChannelId.endsWith('@newsletter')) cleanChannelId += '@newsletter';
        
        console.log(`[INFO] Mengirim Testi ke Saluran WA: ${cleanChannelId} (TEKS SAJA)`);
        
        try {
            await sock.sendMessage(cleanChannelId, { 
                text: msgTestiWA 
            });
            console.log("✅ [SUKSES] Testimoni (TEKS) terkirim ke Saluran WA!");
        } catch (err) {
            console.log("❌ [GAGAL] Kirim Testi ke Saluran WA:", err.message || err);
        }
    }
} // PERBAIKAN: Kurung kurawal ini tadinya kurang!

// ==========================================
// EKSEKUSI 2: NOTIF DEPOSIT (GAMBAR CANVAS)
// ==========================================
async function sendDepositNotification({ username, phone, amount, newBalance, sock }) {
    if (!sock || !phone) return;

    const dateStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }).split(' ')[0];
    const imageBuffer = await createDepositImage(username, amount, newBalance, dateStr);
    
    const msg = `╭━━ ⪻ 𝐃𝐄𝐏𝐎𝐒𝐈𝐓 𝐒𝐔𝐊𝐒𝐄𝐒 ⪼ ━━╮\n┃\n┃ 👤 Username : ${username}\n┃ 💰 Masuk    : Rp ${amount.toLocaleString('id-ID')}\n┃ 💳 Saldo    : Rp ${newBalance.toLocaleString('id-ID')}\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n✨ _Arigatou! Jangan lupa jajan yang banyak ya!_`;
    
    // PERBAIKAN: Dibungkus String() agar aman
    let cleanPhone = String(phone).replace(/[^0-9]/g, '');
    if(cleanPhone.startsWith('08')) cleanPhone = '62' + cleanPhone.slice(1);
    const jid = cleanPhone + "@s.whatsapp.net";
    
    try {
        console.log(`[INFO] Mengirim Gambar Deposit ke ${jid}`);
        await sock.sendMessage(jid, { image: imageBuffer, caption: msg });
    } catch (e) {
        console.log("❌ [GAGAL] Kirim Gambar Deposit WA:", e.message);
    }
}

// ==========================================
// EKSEKUSI 3: NOTIF TRANSFER (GAMBAR CANVAS)
// ==========================================
async function sendTransferNotification({ sender, recipient, amount, sock }) {
    if (!sock) return;

    const trxTime = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const dateStr = trxTime.split(' ')[0];

    // 1. Gambar & Notif ke PENGIRIM (Warna Orange)
    if (sender.phone) {
        const bufferSender = await createTransferImage(true, sender.username, recipient.username, amount, sender.balance, dateStr);
        const msgSender = `╭━━ ⪻ 𝐓𝐑𝐀𝐍𝐒𝐅𝐄𝐑 𝐒𝐔𝐊𝐒𝐄𝐒 ⪼ ━━╮\n┃\n┃ 💸 Penerima    : @${recipient.username}\n┃ 💵 Jumlah      : Rp ${amount.toLocaleString('id-ID')}\n┃ 💳 Saldo Baru  : Rp ${sender.balance.toLocaleString('id-ID')}\n┃ 📅 Waktu       : ${trxTime}\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯`;
        
        // PERBAIKAN: Dibungkus String() agar aman
        let pSender = String(sender.phone).replace(/[^0-9]/g, '');
        if(pSender.startsWith('08')) pSender = '62' + pSender.slice(1);
        try { await sock.sendMessage(pSender + "@s.whatsapp.net", { image: bufferSender, caption: msgSender }); } catch(e){}
    }

    // 2. Gambar & Notif ke PENERIMA (Warna Ungu)
    if (recipient.phone) {
        const bufferRecipient = await createTransferImage(false, sender.username, recipient.username, amount, recipient.balance, dateStr);
        const msgRecipient = `╭━━ ⪻ 𝐏𝐄𝐍𝐄𝐑𝐈𝐌𝐀𝐀𝐍 𝐒𝐀𝐋𝐃𝐎 ⪼ ━━╮\n┃\n┃ 💰 Pengirim    : @${sender.username}\n┃ 💵 Jumlah      : Rp ${amount.toLocaleString('id-ID')}\n┃ 💳 Saldo Baru  : Rp ${recipient.balance.toLocaleString('id-ID')}\n┃ 📅 Waktu       : ${trxTime}\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯`;
        
        // PERBAIKAN: Dibungkus String() agar aman
        let pRecip = String(recipient.phone).replace(/[^0-9]/g, '');
        if(pRecip.startsWith('08')) pRecip = '62' + pRecip.slice(1);
        try { await sock.sendMessage(pRecip + "@s.whatsapp.net", { image: bufferRecipient, caption: msgRecipient }); } catch(e){}
    }
}

// ==========================================
// EKSEKUSI 4: MEMBER BARU
// ==========================================
async function sendNewMemberNotification({ user, sock }) {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_OWNER_ID = process.env.TELEGRAM_OWNER_ID;
    const TELEGRAM_CHANNEL_INFO = process.env.TELEGRAM_CHANNEL_INFO || process.env.TELEGRAM_CHANNEL_ID;
    const WA_CHANNEL_INFO = process.env.WA_CHANNEL_INFO || process.env.WA_CHANNEL_ID;
    const STORE_LINK = process.env.STORE_LINK || 'https://gilzzotp.alwaysrikyshop.my.id';

    const joinDate = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    
    // PERBAIKAN: Dibungkus String() agar method startsWith dan substring aman dari tipe Number
    let rawPhone = String(user.phone || "62800000000");
    if (rawPhone.startsWith('62')) rawPhone = '0' + rawPhone.slice(2);
    const maskedPhone = rawPhone.substring(0, 4) + '****' + rawPhone.slice(-3);
    let maskedUser = user.username.length > 3 ? user.username.substring(0, 3) + '****' : user.username + '****';

    const memberBuffer = await createNewMemberImage(user, joinDate, maskedPhone);
    
    const msgPublic = `👤 *NEW MEMBER REGISTRATION*\n━━━━━━━━━━━━━━━━━━\n\nSelamat datang member baru! 🎉\n\n🆔 *User:* ${maskedUser}\n📅 *Join:* ${joinDate}\n\n🛍️ *Akses Website:* ${STORE_LINK.replace('https://', '')}\n━━━━━━━━━━━━━━━━━━\n_Gilzz Store Real Community_`;
    
    if (TELEGRAM_CHANNEL_INFO && TELEGRAM_BOT_TOKEN) {
        const form = new FormData();
        form.append('chat_id', TELEGRAM_CHANNEL_INFO);
        form.append('photo', memberBuffer, 'member.jpg');
        form.append('caption', msgPublic);
        form.append('parse_mode', 'Markdown');
        axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, form, { headers: form.getHeaders() }).catch(()=>{});
    }
    
    if (WA_CHANNEL_INFO && sock) {
        let cleanInfoId = WA_CHANNEL_INFO.trim(); 
        
        // Otomatis tambahkan @newsletter
        if (!cleanInfoId.endsWith('@newsletter')) cleanInfoId += '@newsletter';
        
        console.log(`[INFO] Mengirim Info Member ke Saluran WA: ${cleanInfoId}`);
        
        try {
            await sock.sendMessage(cleanInfoId, { 
                image: memberBuffer, 
                caption: msgPublic
            });
            console.log("✅ [SUKSES] Info terkirim ke Saluran WA!");
        } catch (err) {
            console.log("❌ [GAGAL] Kirim Info ke Saluran WA:", err.message || err);
        }
    }
    
    if (TELEGRAM_OWNER_ID && TELEGRAM_BOT_TOKEN) {
        const msgOwner = `🔔 𝐍𝐄𝐖 𝐌𝐄𝐌𝐁𝐄𝐑\n\n👤 NAMA       : ${user.fullname}\n🆔 USERNAME   : ${user.username}\n📱 NOMOR      : ${user.phone}\n📅 TANGGAL    : ${joinDate}\n💰 SALDO      : 0`;
        axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, { chat_id: TELEGRAM_OWNER_ID, text: msgOwner }).catch(()=>{});
    }
}

module.exports = { sendTrxNotifications, sendDepositNotification, sendTransferNotification, sendNewMemberNotification };
