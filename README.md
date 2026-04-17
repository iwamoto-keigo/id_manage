# ID管理デモアプリ

Keycloak + FastAPI + Next.js を使ったID管理デモアプリです。
管理ダッシュボードでユーザーやロールを管理し、2つのサンプルアプリでシングルサインオン（SSO）の動作を体験できます。

> システム構成・SSOの仕組み・シーケンス図は [`ARCHITECTURE.md`](./docs/ARCHITECTURE.md) を参照してください。

## 構成

| サービス | ポート | 説明 |
| --- | --- | --- |
| PostgreSQL | - | Keycloakのデータストア（内部ネットワークのみ） |
| Keycloak | 8080 | IDプロバイダ（Quarkusベース、OIDC / SSO） |
| FastAPI | 8000 | Keycloak Admin REST API のラッパー（`/api/*`） |
| Next.js（admin） | 3000 | 管理ダッシュボード UI（App Router + shadcn/ui） |
| Next.js（sso-demo A） | 3001 | SSOサンプルアプリ A（next-auth + Keycloak OIDC、`sso-demo` client） |
| Next.js（sso-demo B） | 3002 | SSOサンプルアプリ B（同上、`sso-demo-b` client）— A↔Bのクロス自動ログインを確認 |

## ディレクトリ構成

```
id_manage/
├── docker-compose.yml
├── README.md
├── .gitignore
├── docs/
│   └── ARCHITECTURE.md          # アーキテクチャ解説（Mermaidシーケンス図付き）
├── keycloak/
│   └── import/
│       └── realm-export.json    # demoレルム定義（起動時に自動import）
├── fastapi/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── pytest.ini
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py            # pydantic-settings (KC_* 環境変数)
│   │   ├── keycloak_client.py   # KeycloakAdmin dependency
│   │   ├── schemas.py
│   │   └── routers/
│   │       ├── users.py
│   │       ├── roles.py
│   │       ├── sessions.py
│   │       └── events.py
│   └── tests/
│       ├── conftest.py
│       ├── test_health.py
│       ├── test_users.py
│       ├── test_roles.py
│       ├── test_sessions.py
│       └── test_events.py
├── nextjs/                      # 管理ダッシュボード (:3000)
│   ├── Dockerfile
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── app/
│   │   ├── layout.tsx           # Fraunces + Manrope + JetBrains Mono
│   │   ├── globals.css
│   │   ├── page.tsx             # ダッシュボード
│   │   ├── users/
│   │   │   ├── page.tsx
│   │   │   ├── actions.ts       # Server Actions
│   │   │   ├── create-user-dialog.tsx
│   │   │   └── user-row-actions.tsx
│   │   └── events/page.tsx
│   ├── components/
│   │   ├── site-nav.tsx
│   │   └── ui/                  # shadcn/ui (button, card, dialog, table, ...)
│   └── lib/
│       ├── api.ts               # server-only FastAPI クライアント
│       ├── types.ts
│       └── utils.ts
├── sso-demo/                    # SSOサンプルアプリ A (:3001)
│   ├── Dockerfile
│   ├── package.json
│   ├── auth.ts                  # next-auth v5 + Keycloak OIDC 設定
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx             # ログイン / ユーザー情報 / ログアウト
│   │   ├── globals.css
│   │   └── api/auth/[...nextauth]/route.ts
│   └── lib/utils.ts
└── sso-demo-b/                  # SSOサンプルアプリ B (:3002)
    ├── Dockerfile
    ├── package.json
    ├── auth.ts
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── globals.css
    │   └── api/auth/[...nextauth]/route.ts
    └── lib/utils.ts
```

## 起動手順

### 1. 前提条件

- Docker Desktop がインストール・起動されていること
- ポート `8080`, `8000`, `3000`, `3001`, `3002` が空いていること

### 2. 起動

```bash
docker compose up -d
```

初回起動時はイメージのpullとビルドで数分かかります。

### 3. 起動確認

```bash
docker compose logs -f keycloak   # "Listening on: http://0.0.0.0:8080" が出ればOK
docker compose ps                 # 6コンテナすべて Up を確認
```

### 4. 動作確認

| URL | 内容 |
| --- | --- |
| http://localhost:8080 | Keycloak管理コンソール（`admin` / `admin`） |
| http://localhost:8000/docs | FastAPI Swagger UI |
| http://localhost:3000 | 管理ダッシュボード |
| http://localhost:3001 | SSOサンプルアプリ A |
| http://localhost:3002 | SSOサンプルアプリ B |

## Keycloak demo レルム

`realm-export.json` から起動時に自動で import される `demo` レルムの初期設定：

### クライアント

| clientId | 種別 | 用途 | redirectUris |
| --- | --- | --- | --- |
| `demo-app` | public (PKCE) | 将来の拡張用プレースホルダ | `localhost:3000/*`, `localhost:8000/*` |
| `sso-demo` | confidential | サンプルアプリ A (:3001) | `localhost:3001/*` |
| `sso-demo-b` | confidential | サンプルアプリ B (:3002) | `localhost:3002/*` |

### ロール

- `user` — 標準ユーザーロール
- `admin` — 管理者ロール

### ユーザー

- `demouser` / `demo` — 事前定義のテストユーザー（ロール: `user`、メール: `demouser@example.com`）

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
| GET | `/api/users/{user_id}/roles` | ユーザーに割り当て済みのロール一覧 |
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

## Next.js 管理ダッシュボード（ポート 3000）

App Router + TypeScript + Tailwind CSS + shadcn/ui。紙トーン（warm paper + deep ink）に sienna/forest のアクセント、Fraunces（表示）+ Manrope（本文）+ JetBrains Mono（ID・時刻）を使った日本語UIです。

### 画面

| ルート | 内容 |
| --- | --- |
| `/` | ダッシュボード：登録ユーザー数、アクティブセッション、直近イベント |
| `/users` | ユーザー一覧テーブル、新規登録ダイアログ、有効/無効トグル、ロール割当ダイアログ |
| `/events` | 認証イベント一覧（日時、種別、ユーザー、IP、クライアント） |

### データフロー

- **読み取りはすべて Server Component** から `lib/api.ts`（`server-only`）経由で FastAPI（`http://fastapi:8000`、docker内部ホスト名）を呼び出し。
- **変更系（作成・トグル・ロール付与/剥奪）は Server Action**（`app/users/actions.ts`）。成功時に `revalidatePath` でサーバーキャッシュを破棄。
- トースト通知は `sonner` で Client Component から表示。

## SSOサンプルアプリ（ポート 3001 / 3002）

Keycloakを使ったSSO（シングルサインオン）を体験するための2つのサンプルクライアントです。`next-auth` v5（Auth.js）+ Keycloakプロバイダーで、Authorization Code + PKCE フローを実装しています。

- **アプリ A** (`:3001`) — sienna アクセント、client `sso-demo`
- **アプリ B** (`:3002`) — forest アクセント、client `sso-demo-b`

2つのアプリは完全に別のNext.jsプロジェクトですが、同じ Keycloak `demo` レルムを共有しているため、片方にログインするともう片方も自動的にログイン済みになります。

### ルート

| ルート | 内容 |
| --- | --- |
| `/` | 未ログイン時は「SSOでログイン」ボタン + もう片方のアプリへのリンク。ログイン後はユーザー情報（名前・メール・ユーザー名・ロール）を表示 |
| `/api/auth/*` | next-auth のハンドラ（signin / callback / signout / csrf） |

### ログアウトの2段階

| ボタン | 効果 |
| --- | --- |
| **このアプリからログアウト** | そのアプリの `authjs.session-token` Cookie のみ削除。Keycloak SSO Cookie は残るため、もう片方のアプリや再アクセスで自動ログインが効く |
| **SSOからも完全にログアウトする** | Keycloak `end_session` を呼び出し、SSO Cookie も無効化。両アプリで再認証が必要 |

### Docker内での OIDC URL分離

Dockerで動かす場合、「ブラウザ」と「サンプルアプリのコンテナ」はKeycloakに別々のホスト名で到達するため、トークンの `iss` クレームと認可フローを整合させる工夫が必要です。

1. **Keycloak側**: `KC_HOSTNAME=http://localhost:8080` を設定し、どのホストから来たリクエストでも `iss=http://localhost:8080/realms/demo` を返すように固定。
2. **next-auth側**: 以下のように認可/トークンエンドポイントを使い分け（`sso-demo/auth.ts` / `sso-demo-b/auth.ts` 参照）。
   - `authorization` → `http://localhost:8080/...`（ブラウザが開く）
   - `token` / `userinfo` / `jwks_endpoint` → `http://keycloak:8080/...`（コンテナから内部通信）
   - `issuer` → `http://localhost:8080/realms/demo`（`iss` 検証用）

### Keycloakクライアント

| 項目 | アプリ A | アプリ B |
| --- | --- | --- |
| clientId | `sso-demo` | `sso-demo-b` |
| secret | `sso-demo-secret-please-change` | `sso-demo-b-secret-please-change` |
| redirectUris | `http://localhost:3001/*` | `http://localhost:3002/*` |

※ デモ用の固定値です。本番では必ず変更してください。

## デモシナリオ

### シナリオ 1：アプリ間の自動ログイン（SSO）

1. `http://localhost:3001`（アプリA）で `demouser / demo` でログイン。
2. ログイン後の画面に「サンプルアプリ B を開く」リンクがあるのでクリック。
3. `http://localhost:3002`（アプリB）で「SSOでログイン」を押す → **ログインフォームが出ずに** ユーザー情報画面が表示される。
4. 逆方向（B → A）でも同じく自動ログインが効く。

### シナリオ 2：ユーザー無効化

1. `http://localhost:3000/users`（管理画面）で「新規ユーザー」から任意のユーザーを作成（例: `alice / alice@example.com / password`）。
2. `http://localhost:3001`（アプリA）で作成したユーザーでSSOログイン → ユーザー情報が表示される。
3. 管理画面に戻り、該当ユーザー行のトグルを OFF にして無効化。
4. サンプルアプリで「SSOからも完全にログアウトする」→ 再度「SSOでログイン」→ Keycloakが **Account is disabled** エラーを表示する。

## テスト

FastAPI の `python-keycloak` クライアントを `MagicMock` に差し替えた単体テストです（実Keycloak不要）。

```bash
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
- **realm-export.json の変更が反映されない**: `--import-realm` は既存レルムを上書きしません。レルム定義を変更した場合は `docker compose down -v` でボリュームごと削除して再起動してください。
- **SSOログインで `invalid redirect URI` が出る**: 該当クライアントの redirectUris が管理コンソールで正しく登録されているか確認してください。
- **サンプルアプリのトークン交換で `iss mismatch`**: Keycloak環境変数 `KC_HOSTNAME` が `http://localhost:8080` になっているか、サンプルアプリの `KEYCLOAK_ISSUER` と一致しているか確認してください。
- **ポート競合**: `8080` / `8000` / `3000` / `3001` / `3002` を別プロセスが使用している場合は `docker-compose.yml` の `ports` を変更してください。
- **Windows で HMR が効かない**: `WATCHPACK_POLLING=true` と `CHOKIDAR_USEPOLLING=true` が設定済みです（docker-compose.yml）。コンテナ再起動で反映されます。
