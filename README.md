# ID管理デモアプリ

Keycloak + FastAPI を使ったID管理デモアプリです。

> 📐 システム構成・SSOの仕組み・シーケンス図は [`ARCHITECTURE.md`](./ARCHITECTURE.md) を参照してください。

## 構成

| サービス | ポート | 説明 |
| --- | --- | --- |
| Keycloak | 8080 | IDプロバイダ（Quarkusベース、最新版） |
| PostgreSQL | - | Keycloakのデータストア（内部ネットワークのみ） |
| FastAPI | 8000 | Keycloak Admin REST API のラッパー（`/api/*`） |
| Next.js（admin） | 3000 | 管理ダッシュボード UI（App Router + shadcn/ui） |
| Next.js（sso-demo A） | 3001 | SSOサンプルアプリA（next-auth + Keycloak OIDC、`sso-demo` client） |
| Next.js（sso-demo B） | 3002 | SSOサンプルアプリB（同じレルム、`sso-demo-b` client）— A↔Bのクロス自動ログインを確認 |

## ディレクトリ構成

```
id_manage/
├── docker-compose.yml
├── README.md
├── keycloak/
│   └── import/
│       └── realm-export.json   # 起動時に自動importされるdemoレルム定義
└── fastapi/
    ├── Dockerfile
    ├── requirements.txt
    ├── pytest.ini
    ├── app/
    │   ├── __init__.py
    │   ├── main.py
    │   ├── config.py            # pydantic-settings (KC_*)
    │   ├── keycloak_client.py   # KeycloakAdmin dependency
    │   ├── schemas.py
    │   └── routers/
    │       ├── users.py
    │       ├── roles.py
    │       ├── sessions.py
    │       └── events.py
    ├── tests/                   # pytest + dependency_overrides
    │   ├── conftest.py
    │   ├── test_health.py
    │   ├── test_users.py
    │   ├── test_roles.py
    │   ├── test_sessions.py
    │   └── test_events.py
    └── ...
nextjs/
├── Dockerfile
├── package.json
├── tailwind.config.ts
├── app/
│   ├── layout.tsx              # Fraunces + Manrope + JetBrains Mono
│   ├── globals.css             # 紙トーンのアーカイブパレット
│   ├── page.tsx                # ダッシュボード
│   ├── users/                  # ユーザー管理（RSC + Server Actions）
│   │   ├── page.tsx
│   │   ├── actions.ts
│   │   ├── create-user-dialog.tsx
│   │   └── user-row-actions.tsx
│   └── events/page.tsx         # ログイン履歴
├── components/
│   ├── site-nav.tsx
│   └── ui/                     # shadcn/ui (button, card, dialog, table, ...)
└── lib/
    ├── api.ts                  # server-only FastAPI クライアント
    ├── types.ts
    └── utils.ts
```

## 起動手順

### 1. 前提条件

- Docker Desktop がインストール・起動されていること
- ポート `8080`, `8000` が空いていること

### 2. 起動

```bash
docker compose up -d
```

初回起動時はイメージのpullとビルドで数分かかります。

### 3. 起動確認

各サービスのログを確認：

```bash
docker compose logs -f keycloak
docker compose logs -f fastapi
```

Keycloakは以下のログが出れば起動完了です：

```
Running the server in development mode.
... Listening on: http://0.0.0.0:8080
```

### 4. 動作確認

#### Keycloak管理コンソール

ブラウザで http://localhost:8080 にアクセスし、`Administration Console` からログイン：

- ユーザー名: `admin`
- パスワード: `admin`

ログイン後、左上のレルム選択から **demo** レルムが自動作成されていることを確認できます。

demoレルムには以下が事前定義されています：

- **クライアント**: `demo-app` (public client, PKCE有効)
  - redirectUris: `http://localhost:3000/*`, `http://localhost:8000/*`
- **ロール**: `user`, `admin`
- **ユーザー**: `demouser` / `demo`

#### FastAPI

```bash
curl http://localhost:8000/health
# => {"status":"ok"}
```

Swagger UI: http://localhost:8000/docs

## FastAPI エンドポイント

Keycloak Admin REST API を `python-keycloak` 経由でラップしています。接続先は `docker-compose.yml` の `fastapi.environment` で指定（`KC_*` 環境変数、`pydantic-settings` で読み込み）。

### ユーザー管理

| Method | Path | 説明 |
| --- | --- | --- |
| GET | `/api/users?search=&first=0&max=100` | ユーザー一覧（`search` は username/email の部分一致） |
| POST | `/api/users` | ユーザー作成。body: `{username, email, password, enabled, first_name?, last_name?}` |
| GET | `/api/users/{user_id}` | ユーザー詳細 |
| PUT | `/api/users/{user_id}` | ユーザー更新。body: `{email?, first_name?, last_name?, enabled?}` |
| DELETE | `/api/users/{user_id}` | ソフト削除（`enabled=false` に更新） |
| PUT | `/api/users/{user_id}/toggle` | `enabled` の反転 |

### ロール管理

| Method | Path | 説明 |
| --- | --- | --- |
| GET | `/api/roles` | レルムロール一覧 |
| POST | `/api/users/{user_id}/roles` | ロール付与。body: `{role_name}` |
| DELETE | `/api/users/{user_id}/roles/{role_name}` | ロール剥奪 |

### セッション / イベント

| Method | Path | 説明 |
| --- | --- | --- |
| GET | `/api/sessions?user_id=&client_id=` | アクティブセッション。両方省略時は全クライアントを集約 |
| GET | `/api/events?user=&type=&client=&dateFrom=&dateTo=&first=0&max=100` | ログインイベント |

> **Note:** イベントAPIを使うには Keycloak 管理コンソールの `Realm settings → Events → User events settings` で Save Events を有効にしてください。

### 使用例

```bash
# ユーザー作成
curl -X POST http://localhost:8000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"carol","email":"carol@example.com","password":"pw","enabled":true}'

# ロール付与
curl -X POST http://localhost:8000/api/users/<uid>/roles \
  -H "Content-Type: application/json" \
  -d '{"role_name":"admin"}'

# 有効/無効切り替え
curl -X PUT http://localhost:8000/api/users/<uid>/toggle
```

## Next.js ダッシュボード

App Router + TypeScript + Tailwind CSS + shadcn/ui。「Identifica · Registry Console」というエディトリアル/アーカイブ志向のコンセプトで、紙トーン（warm paper + deep ink）に sienna/forest のアクセント、Fraunces（表示）+ Manrope（本文）+ JetBrains Mono（ID・時刻）を使っています。

### 画面

| ルート | 内容 |
| --- | --- |
| `/` | 概要カード：登録ID数、アクティブセッション、直近イベント |
| `/users` | ユーザー一覧テーブル、新規登録ダイアログ、有効/無効トグル、ロール割当ダイアログ |
| `/events` | ログインイベント一覧（日時、種別、ユーザー、IP、クライアント） |

### データフロー

- **読み取りはすべて Server Component** から `lib/api.ts`（`server-only`）経由でFastAPI（`http://fastapi:8000`、docker内部ホスト名）を呼び出し。
- **変更系（作成・トグル・ロール付与/剥奪）は Server Action**（`app/users/actions.ts`）。成功時に `revalidatePath` でサーバーキャッシュを破棄。
- トースト通知は `sonner` で Client Component から表示。

### 環境変数

Next.js サービスが読む変数（`docker-compose.yml` で設定済み）：

- `API_BASE_URL` — FastAPI のベースURL（docker network 内では `http://fastapi:8000`）

### ブラウザで開く

```
http://localhost:3000/
```

## SSOサンプルアプリ（ポート3001）

Keycloakを使ったSSO（シングルサインオン）を体験するためのサンプルクライアントです。`next-auth` v5（Auth.js）+ Keycloakプロバイダーで、Authorization Code + PKCE フローを実装しています。

### ルート

| ルート | 内容 |
| --- | --- |
| `/` | 未ログイン時は「SSOでログイン」ボタン、ログイン後はユーザー情報（名前・メール・ユーザー名・ロール）を表示 |
| `/api/auth/*` | next-auth のハンドラ（signin / callback / signout / csrf など） |

### Keycloakクライアント

`demo` レルムに `sso-demo` confidential client が `realm-export.json` で自動作成されます：

- `clientId`: `sso-demo`
- `secret`: `sso-demo-secret-please-change` (デモ用、本番では必ず変更)
- `redirectUris`: `http://localhost:3001/*`

### Docker内でのOIDC URL分離

Dockerで動かす場合、「ブラウザ」と「サンプルアプリのコンテナ」はKeycloakに別々のホスト名で到達するため、トークンの `iss` クレームと認可フローを整合させる工夫が必要です。

1. **Keycloak側**: `KC_HOSTNAME=http://localhost:8080` を設定し、どのホストから来たリクエストでも `iss=http://localhost:8080/realms/demo` を返すように固定。
2. **next-auth側**: 以下のように認可/トークンエンドポイントを使い分け（`sso-demo/auth.ts` 参照）。
   - `authorization` → `http://localhost:8080/...`（ブラウザが開く）
   - `token` / `userinfo` / `jwks_endpoint` → `http://keycloak:8080/...`（サンプルアプリのコンテナから内部通信）
   - `issuer` → `http://localhost:8080/realms/demo`（`iss` 検証用）

### デモシナリオ (1)：ユーザー無効化

1. **管理画面でユーザー作成** (`http://localhost:3000/users`)
   - 「新規ユーザー」から任意のユーザーを作成（例: `alice / alice@example.com / password`）。
2. **サンプルアプリA にSSOログイン** (`http://localhost:3001`)
   - 「SSOでログイン」→ Keycloakログイン画面 → 作成したユーザーで認証 → ユーザー情報が表示される。
   - 事前定義の `demouser / demo` でもログイン可能。
3. **管理画面でユーザー無効化**
   - 該当ユーザー行のトグルを OFF。
4. **再度SSOログインを試す**
   - サンプルアプリで「SSOからも完全にログアウトする」→「SSOでログイン」→ Keycloakが `Account is disabled` エラーを表示する。

### デモシナリオ (2)：アプリ間の自動ログイン（シングルサインオン）

サンプルアプリAとBは別々のNext.jsアプリですが、同じKeycloakレルムを共有しているため、片方にログインすればもう片方は自動的にログイン済みになります。

1. `http://localhost:3001` (アプリA) で `demouser / demo` でログイン。
2. そのブラウザのまま `http://localhost:3002` (アプリB) を開く。
3. 「SSOでログイン」ボタンを押す → **ログインフォームが一瞬も出ず**、自分の情報画面が表示される。
4. 各アプリの「このアプリからログアウト」はそのアプリのセッションCookieだけを消すので、もう片方はログイン済みのまま。
5. 「SSOからも完全にログアウトする」を押すと、Keycloak側のSSOセッションも終了し、両アプリで再認証が必要になる。

## テスト

`python-keycloak` クライアントを `MagicMock` に差し替えた単体テストです（実Keycloak不要）。

```bash
# コンテナ内で実行
docker compose run --rm --no-deps fastapi pytest
```

## 停止 / クリーンアップ

```bash
# 停止（データは保持）
docker compose down

# 停止 + ボリューム（PostgreSQLデータ）も削除
docker compose down -v
```

## トラブルシュート

- **Keycloakが起動しない**: PostgreSQLのhealthcheck待ちに時間がかかることがあります。`docker compose logs postgres` で状態を確認してください。
- **realm-export.json の変更が反映されない**: `--import-realm` は既存レルムを上書きしません。レルム定義を変更した場合（`sso-demo` クライアント追加など）は `docker compose down -v` でボリュームごと削除して再起動してください。
- **SSOログインで `invalid redirect URI` が出る**: `sso-demo` クライアントの redirectUris に `http://localhost:3001/*` が登録されているか管理コンソールで確認してください。
- **サンプルアプリのトークン交換で `iss mismatch`**: Keycloak環境変数 `KC_HOSTNAME` が `http://localhost:8080` になっているか、`sso-demo` コンテナの `KEYCLOAK_ISSUER` と一致しているか確認してください。
- **ポート競合**: `8080` / `8000` を別プロセスが使用している場合は `docker-compose.yml` の `ports` を変更してください。

## 今後の拡張予定

- Next.js フロントエンドの追加（ポート 3000）
- FastAPI 側で Keycloak のJWT検証を実装
- demo レルムに紐づく保護APIエンドポイントの追加
