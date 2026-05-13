# ピタシフ — 開発要件ドキュメント

> シフト管理SaaSのプロトタイプ。店舗マネージャー向け管理画面と従業員向けモバイルUIの2軸構成。

---

## 1. プロダクト概要

| 項目 | 内容 |
|------|------|
| プロダクト名 | **ピタシフ** |
| キャッチコピー | シフト管理を ピタッと |
| ターゲット | 飲食・小売などの店舗運営者 + パート/アルバイト従業員 |
| 形態 | React SPA（スマホファーストUI） |

---

## 2. 技術スタック

| カテゴリ | 採用技術 |
|----------|---------|
| フレームワーク | React 19 + Vite |
| ルーティング | React Router v6 |
| スタイリング | Tailwind CSS v3 + インラインスタイル（コンポーネント単位） |
| バックエンド | Express 5 + better-sqlite3 |
| デプロイ | Vercel（`vercel.json` 設定済み） |
| パッケージ管理 | npm |

### 起動コマンド

```bash
npm run dev          # フロントエンドのみ
npm run dev:server   # バックエンドのみ（watch モード）
npm run dev:all      # フロント + バックエンド同時起動
npm run build        # 本番ビルド
```

---

## 3. ブランドデザインシステム

### カラーパレット（CSS変数 / JSコード共通）

| 変数名 | 値 | 用途 |
|--------|-----|------|
| `--pita-indigo` / `INDIGO` | `#4F46E5` | メインブランドカラー・アクティブ状態 |
| `--pita-indigo-deep` | `#3730A3` | ヘッダー背景・ダーク強調 |
| `--pita-indigo-soft` | `#EEF0FE` | ホバー・背景薄め |
| `--pita-coral` / `CORAL` | `#FF6B6B` | 日曜日・警告・アクセント |
| `--pita-bg` | `#F8FAFC` | ページ背景 |
| `--pita-border` / `BORDER` | `#E2E8F0` | カード・区切り線 |
| `--pita-text` | `#0F172A` | メインテキスト |
| `--pita-faint` | `#94A3B8` | 非アクティブタブ・補助テキスト |

### ロゴ（`src/components/Logo.jsx`）

```
viewBox: 56 × 64
構成要素:
  - カレンダーリング 2本（#818CF8）
  - カレンダー本体（#4F46E5）
  - パズルタブ（右側に突き出た円, #4F46E5）
  - ダークヘッダーバンド（#3730A3）
  - グリッド線（水平2本 + 垂直2本, rgba(255,255,255,0.38)）
  - 今日セルハイライト（rgba(255,255,255,0.18)）
  - スパークル大（opacity 0.72）
  - スパークル小（opacity 0.50）
```

**エクスポート:**
- `<LogoIcon size={32} />` — アイコンのみ
- `<LogoMark size={32} color tagline />` — アイコン + テキスト（+ キャッチコピー切替）

---

## 4. ルーティング構成（`src/App.jsx`）

```
/                            → TopPage（LP）
/pitashif/manager/           → ManagerLayout
  index                      → Dashboard
  targets                    → Targets（シフト目標）
  shift                      → ShiftList
  shift/:versionId           → ShiftDecision
  members                    → Members
  members/:id                → MemberDetail
  settings                   → StoreSettings
  payroll                    → Payroll（マネージャー給与管理）
  notifications              → ManagerNotifications

/pitashif/employee/          → EmployeeLayout
  index                      → Schedule
  submit                     → ShiftSubmit（シフト管理）
  payroll                    → EmployeePayroll（給与計算）
  notifications              → EmployeeNotifications
  settings                   → Profile

/pitashif/employee-ver2/     → EmployeeLayout（スキマ機能付き）
  ※ employee と同構成 + sukima / sukima/:id

/manager/* /employee/*       → /pitashif/* へリダイレクト（後方互換）
*                            → NotFound
```

---

## 5. レイアウトシステム（従業員画面）

### 重要な制約

従業員画面はスマホUIをデスクトップでも再現する「フォンフレーム」構成。

```
EmployeeLayout
└─ .emp-stage（中央寄せステージ）
   └─ .emp-frame（スマホ型コンテナ）
      ├─ pita-phone-header（flex-shrink:0 / 固定ヘッダー）
      ├─ pita-phone-body（flex:1 / min-height:0 / overflow-y:auto）
      └─ EmployeeTabBar（flex-shrink:0 / 固定タブバー）
```

**`min-height: 0` は必須。** Flexコンテナ内で `overflow-y: auto` が機能するために必要。これがないとコンテンツ高さ分 `emp-frame` が伸び、タブバーが画面外に押し出される。

```css
.emp-frame {
  width: 100%;
  max-width: 390px;
  height: 100svh;          /* 全画面サイズで固定（SP・PCともに） */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.pita-phone-body {
  flex: 1;
  min-height: 0;           /* ← これがないと内部スクロールが壊れる */
  overflow-y: auto;
}
```

---

## 6. 従業員画面 機能一覧

### 6-1. スケジュール（`pages/employee/Schedule.jsx`）

- 月間カレンダーグリッド表示（7列 × 5行）
- ヘッダー: `YYYY年M月` のみ表示（名前・アバターなし）
- 日付クリックで詳細カード表示（シフト時間バー・勤務時間・想定報酬・時給）
- 月間サマリーカード（出勤日数 / 勤務時間 / 想定収入）
- 土=青, 日=赤, 今日=インディゴ背景, 選択中=インディゴ塗り
- シフトあり日 → 小インディゴバーをセル内に表示
- 下部CTA: 「シフトを管理する」→ `/submit` に遷移

```js
// カレンダー構築（2026年4月の場合）
const FIRST_DOW = 3  // 4月1日 = 水曜 = index 3 (日月火水木金土)
const calCells = [...Array(FIRST_DOW).fill(null), ...Array.from({length:30},(_,i)=>i+1)]
```

### 6-2. シフト管理（`pages/employee/ShiftSubmit.jsx`）

- 旧称「シフト提出」→ 全面リネーム済み
- シフト希望の入力・確認・提出フロー

### 6-3. 給与計算（`pages/employee/EmployeePayroll.jsx`）

- 270°円形ゲージ（SVG stroke-dasharray + `rotate(135deg)`）
- 月間目標金額の設定・保存（localStorage: `pitashif_monthly_goal`、デフォルト30万円）
- 月 / 年 タブ切り替え
- 内訳テーブル（勤務時間 / 給料見込 / 給料実績＋✏️入力）+ 合計行
- 下部バナー: 「シフトを提出して収入を増やす」（インディゴ）

```jsx
function GaugeArc({ value, max }) {
  const pct = Math.max(0, Math.min(1, value / max))
  const r = 78, circ = 2 * Math.PI * r
  const trackLen = circ * 0.75  // 270°
  const fillLen  = trackLen * pct
  return (
    <svg width={200} height={200} viewBox="0 0 200 200"
      style={{ transform: 'rotate(135deg)', display: 'block' }}>
      <circle ... strokeDasharray={`${trackLen} ${circ - trackLen}`} />  {/* トラック */}
      <circle ... strokeDasharray={`${fillLen} ${circ - fillLen}`} />    {/* 充填 */}
    </svg>
  )
}
```

### 6-4. 通知（`pages/employee/Notifications.jsx`）

- 未読バッジ（赤ドット）をタブアイコン右上に表示

### 6-5. 設定 / プロフィール（`pages/employee/Profile.jsx`）

- 表示モード: アバター・名前・役職・スキルチップ・基本情報・給与/緊急連絡先・雇用情報
- 編集モード: インラインフォーム
- 保存: localStorage (`pitashif_employee_profile`) + 保存トースト
- `sukima` prop により employee / employee-ver2 対応

---

## 7. タブバー（`components/EmployeeTabBar.jsx`）

### タブ構成

| id | ラベル | アイコン | 条件 |
|----|--------|---------|------|
| schedule | スケジュール | カレンダー | 常時 |
| submit | シフト管理 | ファイル | 常時 |
| payroll | 給与計算 | ¥マーク | 常時 |
| sukima | スキマ | 雷ボルト | `sukima=true` のみ |
| notifications | 通知 | ベル（未読バッジ付き） | 常時 |
| settings | 設定 | 人物 | 常時 |

- アクティブ: インディゴ上ボーダー + 色変更
- ラベル: 8px（6タブ時の横幅確保のため小さめ）
- iPhone対応: `paddingBottom: env(safe-area-inset-bottom, 0px)`
- `position: sticky` は**使わない**（`overflow: hidden` 内では動作不安定）

---

## 8. バリアントルート（employee-ver2）

スキマシフト機能を追加した派生版。`sukima={true}` prop を渡すだけで全コンポーネントが対応。

```jsx
<Route path="/pitashif/employee-ver2" element={<EmployeeLayout />}>
  <Route index element={<Schedule base="/pitashif/employee-ver2" sukima={true} />} />
  <Route path="submit"        element={<ShiftSubmit    base="/pitashif/employee-ver2" sukima={true} />} />
  <Route path="payroll"       element={<EmployeePayroll base="/pitashif/employee-ver2" sukima={true} />} />
  <Route path="sukima"        element={<SukimaTop />} />
  <Route path="sukima/:id"    element={<SukimaDetail />} />
  <Route path="settings"      element={<Profile base="/pitashif/employee-ver2" sukima={true} />} />
</Route>
```

---

## 9. localStorage キー一覧

| キー | 型 | 用途 |
|------|-----|------|
| `pitashif_store_address` | string | 店舗住所（StoreSettings） |
| `pitashif_employee_profile` | JSON string | 従業員プロフィール（Profile） |
| `pitashif_monthly_goal` | number（文字列） | 月間給与目標（EmployeePayroll） |

---

## 10. モックデータ（`src/data/mockData.js`）

- `staff[]` — スタッフ一覧（id, name, wage, role, skills など）
- `shiftData{}` — スタッフIDをキーにした日次シフトコード配列（30日分）
- `daysConfig[]` — 各日付の曜日情報
- `YEAR_MONTH` — 表示月（例: `"2026年4月"`）
- `STORE_NAME` — 店舗名

### シフトコード仕様

| コード | 意味 |
|--------|------|
| `X` / null | 休み |
| `F` | フルタイム（9:00〜18:00） |
| `9.18` または `9-18` | 9:00〜18:00 |
| `O-15` | 9:00〜15:00 |
| `10-L` | 10:00〜22:00（Lはラスト） |

---

## 11. ファイル構成（主要ファイル）

```
shift-saas/
├─ public/
│   └─ favicon.svg              # ブランドアイコン（SVG）
├─ src/
│   ├─ App.jsx                  # ルーティング定義
│   ├─ index.css                # デザイントークン + レイアウトクラス
│   ├─ components/
│   │   ├─ Logo.jsx             # LogoIcon / LogoMark コンポーネント
│   │   ├─ EmployeeTabBar.jsx   # 下部タブバー
│   │   ├─ EmployeeLayout.jsx   # 従業員画面ラッパー
│   │   └─ ManagerLayout.jsx    # マネージャー画面ラッパー
│   ├─ pages/
│   │   ├─ TopPage.jsx          # ランディングページ
│   │   ├─ employee/
│   │   │   ├─ Schedule.jsx     # 月間カレンダー
│   │   │   ├─ ShiftSubmit.jsx  # シフト管理
│   │   │   ├─ EmployeePayroll.jsx  # 給与計算
│   │   │   ├─ Notifications.jsx
│   │   │   ├─ Profile.jsx      # 設定・プロフィール
│   │   │   ├─ SukimaTop.jsx
│   │   │   └─ SukimaDetail.jsx
│   │   └─ manager/
│   │       ├─ Dashboard.jsx
│   │       ├─ ShiftList.jsx
│   │       ├─ ShiftDecision.jsx
│   │       ├─ Members.jsx
│   │       ├─ MemberDetail.jsx
│   │       ├─ Targets.jsx
│   │       ├─ StoreSettings.jsx
│   │       ├─ Payroll.jsx
│   │       └─ Notifications.jsx
│   └─ data/
│       └─ mockData.js
└─ server/
    └─ index.js                 # Express API
```

---

## 12. 既知の注意点・落とし穴

### レイアウト
- `min-height: 0` を `pita-phone-body` に必ず付ける（Flex内スクロールに必須）
- `height: 100svh` を `emp-frame` に設定（`100vh` ではiPhone Safariでズレる）
- タブバーに `position: sticky` を使わない（`overflow: hidden` 内で機能しない）

### SVG
- 270°ゲージ: `stroke-dasharray` の計算は `trackLen = circ * 0.75`、`rotate(135deg)` で始点を7時方向に
- ロゴのSVG属性: JSX内では `strokeWidth`（キャメルケース）、`public/favicon.svg`内では `stroke-width`（ケバブケース）

### GitHub / Git
- このリポジトリのプロキシは `aaamano/test_env` のみ対応
- 外部リポジトリへのpushには Personal Access Token（`repo` スコープ）が必要
- 大きなpushが失敗する場合: `git config http.postBuffer 524288000`
