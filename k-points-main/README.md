# K-point 社内ポイント贈与システム

従業員間でポイントを贈り合える社内感謝システムです。Google Sheets連携により取引履歴とポイント残高データをエクスポートできます。

## 機能

- ポイント送信/受信システム
- ダッシュボード（個人の取引履歴、部署ランキング）
- 管理者機能（ユーザー管理、システム統計、データエクスポート）
- Google Sheets連携（取引履歴・残高データのエクスポート）
- 四半期ポイントリセット機能
- 1日の送信制限（3ポイント、3回まで）

## ローカル開発環境（Docker）

### 前提条件

- Docker
- Docker Compose

### セットアップ手順

1. **リポジトリをクローン**
```bash
git clone https://github.com/T2squared/k-points.git
cd k-points
```

2. **環境変数を設定**
```bash
cp .env.local .env
```

3. **Docker Composeでアプリケーションを起動**
```bash
docker-compose up --build
```

4. **データベースを初期化**
```bash
# 別のターミナルで実行
docker-compose exec app npm run db:push
```

5. **ブラウザでアクセス**
```
http://localhost:3000
```

### デモユーザー

以下のユーザーがデフォルトで利用可能です：

**管理者ユーザー:**
- admin1@company.com (山田太郎)
- admin2@company.com (佐藤花子)

**一般ユーザー:**
- demo1@company.com (田中次郎)
- demo2@company.com (鈴木三郎)

### Google Sheets連携

Google Sheets連携を使用する場合は、以下の環境変数を設定してください：

```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-google-sheet-id
```

### 開発コマンド

```bash
# アプリケーション起動
docker-compose up

# バックグラウンドで起動
docker-compose up -d

# ログを確認
docker-compose logs -f app

# データベースリセット
docker-compose down -v
docker-compose up --build

# 停止
docker-compose down
```

## 技術スタック

- **フロントエンド:** React, TypeScript, Tailwind CSS, shadcn/ui
- **バックエンド:** Node.js, Express
- **データベース:** PostgreSQL
- **ORM:** Drizzle
- **認証:** Replit Auth
- **外部連携:** Google Sheets API

## ディレクトリ構造

```
k-points/
├── client/               # React フロントエンド
│   ├── src/
│   │   ├── components/   # UIコンポーネント
│   │   ├── pages/        # ページコンポーネント
│   │   ├── hooks/        # カスタムフック
│   │   └── lib/          # ユーティリティ
├── server/               # Express バックエンド
│   ├── db.ts            # データベース接続
│   ├── routes.ts        # APIルート
│   ├── storage.ts       # データアクセス層
│   └── googleSheets.ts  # Google Sheets連携
├── shared/               # 共有型定義
│   └── schema.ts        # データベーススキーマ
├── Dockerfile
├── docker-compose.yml
└── README.md
```