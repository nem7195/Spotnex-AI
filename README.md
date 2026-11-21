# CivicLens — Mobile-First AI Municipal Complaint Triage

> **Prompt to Product Hackathon**  
> Built with **React (Vite)**, **Tailwind CSS**, **Lucide Icons**, and **Gemini API**.

---

## 🌟 Highlights & Key Innovations

### 1. Header & Role Switcher
- **Brand**: CivicLens with high-tech glowing shield logo.
- **Active City Badge**: `Bengaluru Municipal Corporation (BBMP / BESCOM / BWSSB)`.
- **Seamless Role Toggle**: Instant switch between **Citizen Mode** and **Municipal Officer Dashboard**.

### 2. Citizen Complaint Filing (Mandatory Requirement 1)
- **Unstructured Free Text**: Full support for Indian regional languages (Kannada, Hindi, Tamil, Telugu, etc.) and English.
- **Demo Quick Chips**:
  - `ನಮ್ಮ ಮನೆಯ ಮುಂದೆ ಮರ ಬಿದ್ದಿದೆ ರಸ್ತೆ ಬಂದ್ ಆಗಿದೆ` (Kannada: Fallen tree blocking road)
  - `स्कूल के सामने कचरे का ढेर है और गंदा पानी बह रहा है` (Hindi: Garbage & sewage near school)
  - `Deep open crater pothole causing bike accidents on 100ft road` (English)
- **Dual/Tri Input Modes**:
  - **Mode A: Snap Live Evidence** (Forensic Camera)
  - **Mode B: Upload Photo (Optional)**
  - **Mode C: Text-Only Complaint** (Works with zero image required)

### 3. Tamper-Evident Forensic Camera Module (Innovation Booster)
- **3:4 Live Viewfinder**: Real-time WebRTC `getUserMedia` with rear/front camera flip.
- **Insecure HTTP Fallback**: Auto-falls back to native `<input type="file" capture="environment">` on non-secure mobile IPs with an instant *"📸 Tap to Snap Photo Directly"* button.
- **Real-Time Geolocation HUD**: GPS coordinate lock with precision radius (`±5.2m`).
- **Forensic Watermark Engine**: Offscreen `<canvas>` burns an immutable HUD overlay:
  - IST + UTC timestamps
  - Lat/Long coordinates to 5 decimal places
  - Cryptographic checksum (`CIVICLENS • TAMPER-SEALED • SHA-256 HASH`)

### 4. Officer Dashboard (Priority-Ranked)
- **Sorted Critical ➜ Low**: Immediate life-threatening issues at the top.
- **Filter Pills**: Severity, Category (`electricity`, `roads`, `water`, `waste`, `drainage`, `trees`), and Status (`Pending`, `In Progress`, `Resolved`).
- **Quick Status Toggle**: Real-time lifecycle management.
- **Triage Inspection Modal**: Shows English summary, reasoning, routed municipal body, and operational dispatch recommendation.

---

## 🚀 How to Run

### Development Mode (Vite HMR)
```bash
npm run dev
# Opens at http://localhost:5173
```

### Full-Stack Server Mode (Node Express + Built React App)
```bash
npm run server
# Opens at http://localhost:3000
```
