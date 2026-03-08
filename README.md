# Manifestor — 能量 RPG

一款以「人類圖顯示者」能量管理為核心的遊戲化 Web App，將日常能量管理包裝成 RPG 體驗，幫助使用者追蹤心理能量、建立健康習慣。

**Live**: [manifestor-0428.web.app](https://manifestor-0428.web.app)

## 技術架構

| 項目 | 實現 |
|------|------|
| 前端 | React + Vite |
| 驗證 | Firebase Auth（Google 登入） |
| 資料庫 | Firestore + localStorage（離線快取） |
| 部署 | Firebase Hosting |
| CI/CD | GitHub Actions（push to main 自動部署） |
| 字型 | Noto Sans TC（Google Fonts） |

## 快速開始

```bash
# 安裝依賴
npm install

# 設定環境變數（從 Firebase Console 取得）
cp .env.example .env
# 填入 Firebase config

# 啟動開發伺服器
npm run dev
```

## 核心功能

- **每日打卡** — 記錄能量值（0-100）、心情狀態、筆記，獲得 XP
- **能量任務** — 5 個每日任務（晨間掃描、創意爆發、界限宣告等）
- **慢熱專注模式** — 25 分鐘倒數計時器，5 段漸進式專注
- **心靈花園** — Canvas 粒子動畫，依心情改變粒子行為
- **決策神諭** — 輸入猶豫的決定，獲得隨機指引
- **個人檔案** — 週/月能量圖表、熱力圖、成就徽章
- **雲端同步** — Google 登入後資料自動同步至 Firestore

## 部署

```bash
npm run build
npx firebase-tools deploy
```

Push to `main` 分支會透過 GitHub Actions 自動部署。

## 專案結構

```
src/
├── lib/firebase.js        # Firebase 初始化
├── context/               # AuthContext + DataContext
├── pages/                 # 6 個頁面元件
├── components/            # 共用元件（BottomNav, EnergyRing 等）
├── utils/                 # 日期工具、XP 計算
└── styles/global.css      # 全域深色主題
```
