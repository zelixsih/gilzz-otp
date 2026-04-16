#!/bin/bash

# ==========================================
#    🚀 RIKI MARKET CINEMATIC BLOCK STYLE 🚀
# ==========================================

# --- LOAD KONFIGURASI DARI .ENV ---
if [ -f .env ]; then
    source .env
else
    echo "❌ Error: File .env tidak ditemukan! Buat dulu file .env nya."
    exit 1
fi

MAIN_FILE="index.js"

# --- WARNA TEXT ---
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
WHITE='\033[1;37m'
RESET='\033[0m'
BOLD='\033[1m'

# --- FUNGSI LOADING ---
loading_dots() {
    echo -ne "${WHITE}$1${RESET}"
    for i in {1..3}; do
        echo -ne "."
        sleep 0.3
    done
    echo -e "${GREEN} OK${RESET}"
}

# --- TAHAP 1: SELAMAT DATANG (WELCOME) ---
clear
sleep 0.5
echo -e "${CYAN}"
echo " __  __     ______     __         ______     ______     __    __     ______    "
echo "/\ \_\ \   /\  ___\   /\ \       /\  ___\   /\  __ \   /\ \"-./  \   /\  ___\   "
echo "\ \____ \  \ \  __\   \ \ \____  \ \ \____  \ \ \/\ \  \ \ \-./\ \  \ \  __\   "
echo " \/\_____\  \ \_____\  \ \_____\  \ \_____\  \ \_____\  \ \_\ \ \_\  \ \_____\ "
echo "  \/_____/   \/_____/   \/_____/   \/_____/   \/_____/   \/_/  \/_/   \/_____/ "
echo -e "${RESET}"
echo -e "${YELLOW}           >>> SCRIPT AUTO ORDER SULTAN EDITION <<<${RESET}"
echo ""
sleep 1

# --- TAHAP 2: MEMPROSES SYSTEM ---
clear
echo -e "${BLUE}"
echo " ______   ______     ______     ______     ______     ______     ______    "
echo "/\  == \ /\  == \   /\  __ \   /\  ___\   /\  ___\   /\  ___\   /\  ___\   "
echo "\ \  _-/ \ \  __<   \ \ \/\ \  \ \ \____  \ \  __\   \ \___  \  \ \___  \  "
echo " \ \_\    \ \_\ \_\  \ \_____\  \ \_____\  \ \_____\  \/\_____\  \/\_____\ "
echo "  \/_/     \/_/ /_/   \/_____/   \/_____/   \/_____/   \/_____/   \/_____/ "
echo -e "${RESET}"
echo ""

loading_dots " > Memeriksa Database MongoDB"
loading_dots " > Memeriksa Konfigurasi .env"
loading_dots " > Mengoptimalkan RAM Server"
echo -e "${GREEN} [INFO] System Siap!${RESET}"
sleep 1.5

# --- TAHAP 3: MENGHUBUNGKAN (CONNECTING) ---
clear
echo -e "${PURPLE}"
echo " ______     ______     __   __     __   __     ______     ______     ______  "
echo "/\  ___\   /\  __ \   /\ \"-.\ \   /\ \"-.\ \   /\  ___\   /\  ___\   /\__  _\ "
echo "\ \ \____  \ \ \/\ \  \ \ \-.  \  \ \ \-.  \  \ \  __\   \ \ \____  \/_/\ \/ "
echo " \ \_____\  \ \_____\  \ \_\\\"\_\  \ \_\\\"\_\  \ \_____\  \ \_____\    \ \_\ "
echo "  \/_____/   \/_____/   \/_/ \/_/   \/_/ \/_/   \/_____/   \/_____/     \/_/ "
echo -e "${RESET}"
echo ""

# Logic Tunnel
if [ ! -f "./cloudflared" ]; then
    echo -e "${YELLOW} > Mendownload Cloudflared...${RESET}"
    curl -L -# https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared > /dev/null 2>&1
    chmod +x cloudflared
fi

pkill -f cloudflared > /dev/null 2>&1
sleep 1
./cloudflared tunnel run --token $CF_TOKEN > /dev/null 2>&1 &

loading_dots " > Membuka Jalur Tunnel"
loading_dots " > Verifikasi Token Cloudflare"
echo -e "${GREEN}${BOLD} ✅ TERHUBUNG KE JARINGAN GLOBAL!${RESET}"
sleep 2

# --- TAHAP 4: RIKI MARKET (FINAL) ---
clear
echo -e "${CYAN}"
echo "██████╗ ██╗██╗  ██╗██╗    ███╗   ███╗ █████╗ ██████╗ ██╗  ██╗███████╗████████╗"
echo "██╔══██╗██║██║ ██╔╝██║    ████╗ ████║██╔══██╗██╔══██╗██║ ██╔╝██╔════╝╚══██╔══╝"
echo "██████╔╝██║█████╔╝ ██║    ██╔████╔██║███████║██████╔╝█████╔╝ █████╗     ██║   "
echo "██╔══██╗██║██╔═██╗ ██║    ██║╚██╔╝██║██╔══██║██╔══██╗██╔═██╗ ██╔══╝     ██║   "
echo "██║  ██║██║██║  ██╗██║    ██║ ╚═╝ ██║██║  ██║██║  ██║██║  ██╗███████╗   ██║   "
echo "╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═╝    ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝   ╚═╝   "
echo -e "${RESET}"
echo -e "   ${YELLOW}👑 OWNER: RIKI MARKET${RESET}  |  ${GREEN}🟢 STATUS: ONLINE${RESET}  |  ${WHITE}📅 $(date '+%d-%m-%Y')${RESET}"
echo -e "${CYAN}================================================================================${RESET}"
echo ""
echo -e "${WHITE}Log Aktivitas Bot:${RESET}"
echo ""

# --- START BOT LOOP ---
while true; do
    node --expose-gc $MAIN_FILE 
    
    echo ""
    echo -e "${RED}⚠️  Bot Crash! Restarting...${RESET}"
    sleep 3
done
