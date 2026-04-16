# ID管理（Identity Management）概要

## 1. ID管理とは何か

ID管理とは、**「組織内の人の出入りとシステムへのアクセス権を一箇所で安全に制御する」** 仕組みのことです。

会社で利用するシステムが増えるほど、「誰が」「どのシステムに」「どんな権限で」アクセスできるかの管理が複雑になります。ID管理はこの複雑さを解消し、セキュリティと運用効率の両方を向上させます。

---

## 2. ID管理が解決する問題

### ID管理がない世界

```mermaid
flowchart LR
    Admin["管理者"]

    Admin -->|"① アカウント作成"| SF["Salesforce"]
    Admin -->|"② アカウント作成"| TS["TeamSpirit"]
    Admin -->|"③ アカウント作成"| Slack["Slack"]
    Admin -->|"④ アカウント作成"| AWS["AWS"]
    Admin -->|"⑤ アカウント作成"| Wiki["社内Wiki"]

    style Admin fill:#ef4444,stroke:#dc2626,color:#fff
    style SF fill:#e2e8f0,stroke:#64748b,color:#1e293b
    style TS fill:#e2e8f0,stroke:#64748b,color:#1e293b
    style Slack fill:#e2e8f0,stroke:#64748b,color:#1e293b
    style AWS fill:#e2e8f0,stroke:#64748b,color:#1e293b
    style Wiki fill:#e2e8f0,stroke:#64748b,color:#1e293b
```

- 社員が入社するたびに、各システムに**個別にアカウントを作成**する必要がある
- 退職時は各システムを**手動で一つずつ無効化** → 漏れがあるとセキュリティ事故に
- ユーザーはシステムごとに**別々のID/パスワードを管理**する必要がある
- 「誰がどのシステムにアクセスできるか」の**全体像が見えない**

### ID管理がある世界

```mermaid
flowchart LR
    Admin["管理者"]
    IdP["ID管理基盤<br>（IdP）"]

    Admin -->|"1回の操作で<br>一括管理"| IdP
    IdP -->|"SSO"| SF["Salesforce"]
    IdP -->|"SSO"| TS["TeamSpirit"]
    IdP -->|"SSO"| Slack["Slack"]
    IdP -->|"SSO"| AWS["AWS"]
    IdP -->|"SSO"| Wiki["社内Wiki"]

    style Admin fill:#22c55e,stroke:#16a34a,color:#fff
    style IdP fill:#3b82f6,stroke:#2563eb,color:#fff
    style SF fill:#e2e8f0,stroke:#64748b,color:#1e293b
    style TS fill:#e2e8f0,stroke:#64748b,color:#1e293b
    style Slack fill:#e2e8f0,stroke:#64748b,color:#1e293b
    style AWS fill:#e2e8f0,stroke:#64748b,color:#1e293b
    style Wiki fill:#e2e8f0,stroke:#64748b,color:#1e293b
```

- 管理者は **IdP の1アカウントを管理するだけ** で全システムに反映
- 退職時は **1操作で全システムのアクセスを即時遮断**
- ユーザーは **1回のログインで全システムを利用可能**（SSO）
- 「誰が何にアクセスできるか」を **一覧で把握** できる

---

## 3. ID管理の5つの機能層

ID管理は以下の5つの層で構成されます。

```mermaid
block-beta
    columns 1
    A["❶ ライフサイクル管理<br>アカウントの作成・変更・無効化（入社・異動・退職）"]
    B["❷ 認証（Authentication）<br>「あなたは誰？」を確認する（パスワード・MFA・生体認証）"]
    C["❸ SSO（シングルサインオン）<br>一度のログインで複数システムにアクセス（SAML / OIDC）"]
    D["❹ 認可（Authorization）<br>「何をしていいか」を制御する（RBAC：ロールベースアクセス制御）"]
    E["❺ 監査・コンプライアンス<br>誰がいつ何にアクセスしたかの記録・証跡管理"]

    style A fill:#ef4444,stroke:#dc2626,color:#fff
    style B fill:#f97316,stroke:#ea580c,color:#fff
    style C fill:#eab308,stroke:#ca8a04,color:#fff
    style D fill:#22c55e,stroke:#16a34a,color:#fff
    style E fill:#3b82f6,stroke:#2563eb,color:#fff
```

### 各層の詳細

| 層 | 名称 | 説明 | 具体例 |
|---|---|---|---|
| ❶ | ライフサイクル管理 | 人の出入りに連動してアカウントを管理 | 入社→アカウント作成、異動→権限変更、退職→無効化 |
| ❷ | 認証 | 本人確認 | パスワード、多要素認証（MFA）、生体認証 |
| ❸ | SSO | 一度の認証で複数システムを利用 | SAML 2.0 / OpenID Connect による連携 |
| ❹ | 認可 | アクセス可能な範囲を制御 | 「営業部 → Salesforce利用可」「一般社員 → 管理画面アクセス不可」 |
| ❺ | 監査 | アクセス履歴と権限変更の記録 | ログイン履歴、権限変更ログ、ISMS対応の証跡 |

### 特に重要な2つの層

**❶ ライフサイクル管理** は最も泥臭く、かつ最も重要です。「異動したのにアクセス権が前の部署のまま」「退職したのにアカウントが残っている」という問題は現実に頻発しており、これを自動化・一元管理することがID管理の核心的な価値です。

**❺ 監査** は企業規模が大きくなるほど必須になります。セキュリティ監査やISMS対応で「誰がいつどこにアクセスしたか提示してください」と求められた際に、ログが一元管理されていないと対応できません。

---

## 4. Active Directory だけではなぜダメなのか？

### AD が得意な領域

Active Directory（AD）は、Microsoftが提供するオンプレミス環境向けのID管理基盤です。以下の領域では非常に強力です。

- Windows PCのドメインログオン管理
- ファイルサーバーのアクセス制御
- Exchange（メール）との連携
- グループポリシーによる端末制御

**オンプレのWindowsベースのシステムだけで完結している会社であれば、ADだけで十分にカバーできます。**

### AD だけでは辛くなるケース

近年はSaaS（クラウドサービス）の利用が急増しており、ADだけではカバーしきれない領域が生まれています。

```mermaid
flowchart TB
    subgraph AD_OK["✅ AD が得意な領域"]
        direction TB
        PC["Windows PC"]
        FS["ファイルサーバー"]
        EX["Exchange"]
        OnPrem["社内システム"]
    end

    subgraph AD_NG["⚠️ AD だけでは辛い領域"]
        direction TB
        SF["Salesforce"]
        TS["TeamSpirit"]
        SlackS["Slack / Teams"]
        AWSS["AWS / Azure"]
        GWS["Google Workspace"]
        Zoom["Zoom / Box 等"]
    end

    AD["Active Directory<br>（オンプレ）"]
    AD --- AD_OK
    AD -. "直接連携できない" .- AD_NG

    style AD fill:#3b82f6,stroke:#2563eb,color:#fff
    style AD_OK fill:#dcfce7,stroke:#22c55e,color:#166534
    style AD_NG fill:#fef9c3,stroke:#eab308,color:#854d0e
```

SaaSとADを直接連携できないため、SaaSごとに個別のID/パスワード管理に逆戻りしてしまいます。

### 解決策：Azure AD（Entra ID）との連携

Microsoftはこの課題に対して、ADのクラウド拡張版である **Azure AD（現 Microsoft Entra ID）** を提供しています。

```mermaid
flowchart LR
    AD["オンプレ<br>Active Directory"]
    Connect["Azure AD<br>Connect<br>（同期）"]
    Entra["Microsoft<br>Entra ID"]

    AD --> Connect --> Entra

    Entra -->|"SAML/OIDC"| SF["Salesforce"]
    Entra -->|"SAML/OIDC"| TS["TeamSpirit"]
    Entra -->|"SAML/OIDC"| Slack["Slack"]
    Entra -->|"SAML/OIDC"| AWS["AWS"]
    Entra -->|"Kerberos等"| OnPrem["社内システム"]

    style AD fill:#6366f1,stroke:#4f46e5,color:#fff
    style Connect fill:#a78bfa,stroke:#7c3aed,color:#fff
    style Entra fill:#3b82f6,stroke:#2563eb,color:#fff
    style SF fill:#e2e8f0,stroke:#64748b,color:#1e293b
    style TS fill:#e2e8f0,stroke:#64748b,color:#1e293b
    style Slack fill:#e2e8f0,stroke:#64748b,color:#1e293b
    style AWS fill:#e2e8f0,stroke:#64748b,color:#1e293b
    style OnPrem fill:#e2e8f0,stroke:#64748b,color:#1e293b
```

この構成により、**オンプレADのアカウント情報を源泉としながら、クラウドサービスへのSSO連携** を実現できます。

---

## 5. 自前のID管理アプリが活きるケース

Entra ID + 各SaaSの標準SSO連携で済む会社であれば、自作は不要です。
自前のID管理アプリが価値を持つのは以下のようなケースです。

| ケース | 説明 |
|---|---|
| Entra ID のコストを抑えたい | Entra ID P1/P2 ライセンスはユーザー単価が高い。Keycloak（OSS）なら無料 |
| Entra ID に対応しない社内システムがある | 独自開発の社内アプリや古いシステムとの連携が必要 |
| 管理画面を自社運用に最適化したい | 権限一覧の可視化、承認フロー、独自のレポートなど |
| マルチIdP構成が必要 | AD + Google Workspace など複数の認証基盤を束ねたい |

### 自前構築の構成例（Keycloak ベース）

```mermaid
flowchart TB
    User["ユーザー"]
    Admin["管理者"]
    NextJS["管理画面<br>（Next.js）"]
    FastAPI["API<br>（FastAPI）"]
    KC["Keycloak<br>（IdP）"]
    DB["PostgreSQL"]

    Admin --> NextJS --> FastAPI --> KC
    User --> KC

    KC --> DB
    KC -->|"SAML/OIDC"| SF["Salesforce"]
    KC -->|"SAML/OIDC"| TS["TeamSpirit"]
    KC -->|"SAML/OIDC"| App["社内アプリ"]
    KC -.->|"LDAP連携"| AD["既存 AD"]

    style User fill:#22c55e,stroke:#16a34a,color:#fff
    style Admin fill:#22c55e,stroke:#16a34a,color:#fff
    style NextJS fill:#0ea5e9,stroke:#0284c7,color:#fff
    style FastAPI fill:#10b981,stroke:#059669,color:#fff
    style KC fill:#ef4444,stroke:#dc2626,color:#fff
    style DB fill:#6366f1,stroke:#4f46e5,color:#fff
    style SF fill:#e2e8f0,stroke:#64748b,color:#1e293b
    style TS fill:#e2e8f0,stroke:#64748b,color:#1e293b
    style App fill:#e2e8f0,stroke:#64748b,color:#1e293b
    style AD fill:#a78bfa,stroke:#7c3aed,color:#fff
```

この構成では、Keycloakが認証プロトコル（SAML/OIDC）の処理を担い、FastAPI + Next.js で独自の管理ダッシュボードを構築します。既存のADがある場合は、KeycloakのLDAP連携機能でユーザー情報を同期できます。

---

## 6. Keycloak とは

### 概要

Keycloak（キークローク）は、Red Hat社が開発を主導するオープンソースの **IAM（Identity and Access Management）** ソフトウェアです。2014年にバージョン1.0.0がリリースされ、Apacheライセンス 2.0で公開されています。

一言でいえば、**「アプリケーション開発者が認証・認可の仕組みを一から作らなくて済むようにする」** ためのソフトウェアです。Keycloakを導入すれば、SSO・多要素認証・ユーザー管理・アクセス制御といった機能を、コードをほとんど書かずに利用できます。

```mermaid
flowchart LR
    subgraph Keycloak["Keycloak（IdP）"]
        direction TB
        SSO["SSO<br>SAML / OIDC"]
        MFA["多要素認証<br>OTP / WebAuthn"]
        UM["ユーザー管理<br>登録 / 無効化"]
        RBAC["アクセス制御<br>RBAC"]
        Audit["監査ログ<br>イベント記録"]
    end

    User["ユーザー"] --> Keycloak
    Admin["管理者"] --> Keycloak

    Keycloak --> App1["Webアプリ A"]
    Keycloak --> App2["Webアプリ B"]
    Keycloak --> App3["SaaS"]

    style Keycloak fill:#ef4444,stroke:#dc2626,color:#fff
    style User fill:#22c55e,stroke:#16a34a,color:#fff
    style Admin fill:#22c55e,stroke:#16a34a,color:#fff
    style SSO fill:#fca5a5,stroke:#ef4444,color:#1e293b
    style MFA fill:#fca5a5,stroke:#ef4444,color:#1e293b
    style UM fill:#fca5a5,stroke:#ef4444,color:#1e293b
    style RBAC fill:#fca5a5,stroke:#ef4444,color:#1e293b
    style Audit fill:#fca5a5,stroke:#ef4444,color:#1e293b
    style App1 fill:#e2e8f0,stroke:#64748b,color:#1e293b
    style App2 fill:#e2e8f0,stroke:#64748b,color:#1e293b
    style App3 fill:#e2e8f0,stroke:#64748b,color:#1e293b
```

### 主な機能

| 機能 | 説明 |
|---|---|
| **シングルサインオン（SSO）** | SAML 2.0 / OpenID Connect / OAuth 2.0 に対応。一度の認証で複数のアプリケーションを利用可能 |
| **多要素認証（MFA）** | ワンタイムパスワード（OTP）、WebAuthn（生体認証・パスキー）に対応し、パスワードだけに頼らない認証を実現 |
| **ユーザー管理** | ユーザーの登録・プロファイル管理・グループ管理を管理コンソールから操作可能。ユーザー自身によるパスワードリセットやアカウント管理も可能 |
| **ロールベースアクセス制御（RBAC）** | ユーザーやグループにロールを割り当て、アプリケーションごとのアクセス権限をきめ細かく制御 |
| **外部IdP連携** | Active Directory / LDAP との連携に対応。既存のユーザーデータベースをそのまま活用可能 |
| **ソーシャルログイン** | Google、Facebook、GitHub 等のアカウントを使ったログインを管理コンソールの設定だけで実現 |
| **監査ログ** | ログインイベント（ログイン・ログアウト・パスワード変更等）と管理イベント（管理コンソール上の操作）を記録・閲覧可能 |
| **マルチテナント** | 「レルム」という単位で設定を分離でき、複数の組織やプロジェクトを1つのKeycloakインスタンスで管理可能 |
| **REST API** | すべての機能をREST API経由で操作可能。外部システムとの連携やカスタム管理画面の構築が容易 |

### なぜ Keycloak を選ぶのか

ID管理・SSO基盤の選択肢は他にもあります。Keycloakのポジションを整理すると以下のようになります。

```mermaid
quadrantChart
    title ID管理ソリューションの比較軸
    x-axis "低コスト" --> "高コスト"
    y-axis "カスタマイズ性 低" --> "カスタマイズ性 高"
    quadrant-1 "高機能・高コスト"
    quadrant-2 "柔軟だがコスト高"
    quadrant-3 "手軽だが制約あり"
    quadrant-4 "バランス型"
    Keycloak: [0.25, 0.82]
    Entra ID P2: [0.78, 0.55]
    Okta: [0.85, 0.60]
    Auth0: [0.70, 0.70]
    Firebase Auth: [0.35, 0.25]
```

| ソリューション | 種別 | コスト | 特徴 |
|---|---|---|---|
| **Keycloak** | OSS / セルフホスト | 無料（インフラ費のみ） | 高いカスタマイズ性、REST APIで全機能操作可能、AD/LDAP連携が容易。運用は自前で行う必要がある |
| **Microsoft Entra ID** | クラウドサービス | P1: 約¥900/ユーザー/月、P2: 約¥1,350/ユーザー/月 | Microsoft製品との親和性が最高。条件付きアクセスや自動プロビジョニングなど高度な機能 |
| **Okta** | クラウドサービス | $2〜$15+/ユーザー/月 | エンタープライズ向けの定番。対応アプリが非常に多く、導入が容易 |
| **Auth0** | クラウドサービス | 無料枠あり、有料は$35/月〜 | 開発者フレンドリー。カスタマイズ性とクラウドの手軽さを両立 |

**Keycloakが特に適しているのは：**

- ライセンスコストを抑えたい（OSSなのでソフトウェア費用ゼロ）
- 管理画面やフローを自社業務に合わせてカスタマイズしたい
- Docker / Kubernetes 環境で柔軟にデプロイしたい
- REST APIを使って独自の管理ダッシュボードを構築したい（← 今回のプロトタイプ）
- 既存の AD / LDAP と連携しつつ、SaaS への SSO を追加したい

### Keycloak の動作環境

Keycloakは Java ベースのアプリケーションで、Docker コンテナとしてデプロイするのが最も一般的です。

```mermaid
flowchart TB
    subgraph Docker["Docker Compose 環境"]
        KC["Keycloak<br>（Quarkusベース）<br>ポート 8080"]
        PG["PostgreSQL<br>ポート 5432"]
        KC --> PG
    end

    Browser["ブラウザ"] --> KC
    API["FastAPI<br>（Admin API経由）"] --> KC

    style Docker fill:#dbeafe,stroke:#3b82f6,color:#1e3a5f
    style KC fill:#ef4444,stroke:#dc2626,color:#fff
    style PG fill:#6366f1,stroke:#4f46e5,color:#fff
    style Browser fill:#22c55e,stroke:#16a34a,color:#fff
    style API fill:#10b981,stroke:#059669,color:#fff
```

- **Quarkusベース**: 2022年以降、WildFlyからQuarkusに基盤が移行され、起動速度とメモリ効率が向上
- **Docker公式イメージ**: `quay.io/keycloak/keycloak` で提供されており、`docker-compose` で簡単に構築可能
- **管理コンソール**: Keycloak自体にWebベースの管理画面が組み込まれており、ブラウザからユーザー・レルム・クライアント等を操作可能
- **最新バージョン**: v26系（2025〜2026年リリース）。MCP（Model Context Protocol）対応やワークフロー自動化機能などが追加されている

---

## 7. 国内SaaSとのSSO連携（楽楽シリーズの例）

ID管理基盤を導入する際、実際に社内で使っているSaaSとSSO連携できるかが重要です。ここでは国内で広く利用されている「楽楽シリーズ」を例に、連携の可否と仕組みを整理します。

### 楽楽精算のSSO対応状況

楽楽精算は **SAML 2.0 に対応した SP（Service Provider）** です。管理画面（管理 > システム設定 > セキュリティ）から「シングルサインオン設定」を有効化することで、外部のIdPと連携できます。

以下のIdPとの連携実績が確認されています。

| IdP | 連携方式 | 備考 |
|---|---|---|
| Microsoft Entra ID（旧 Azure AD） | SAML 2.0 | Entra IDのエンタープライズアプリギャラリーに楽楽精算が登録済み |
| GMOトラスト・ログイン | SAML 2.0 | 2022年11月にSAML認証連携を開始 |
| CloudGate UNO | SAML 2.0 | SAML 2.0のIdP情報を設定して連携 |
| メタップスクラウド | SAML 2.0 | SAML設定の登録で連携 |
| **Keycloak** | **SAML 2.0** | **SAML 2.0対応IdPであれば連携可能なため、Keycloakからも接続可能** |

### 楽楽シリーズ全体のSSO対応

楽楽精算だけでなく、楽楽シリーズの主要製品はいずれもSAML認証に対応しています。

| サービス | SSO対応 | 用途 |
|---|---|---|
| 楽楽精算 | SAML 2.0 ✅ | 経費精算 |
| 楽楽明細 | SAML 2.0 ✅ | 請求書・納品書の電子発行 |
| 楽楽販売 | SAML 2.0 ✅ | 販売管理 |

1つのIdP（Keycloakなど）から楽楽シリーズ全体にSSOできるため、複数の楽楽製品を導入している企業にとっては管理の一元化メリットが大きくなります。

### SSO連携の仕組み（SAML 2.0 フロー）

楽楽精算とKeycloakをSSO連携した場合の認証フローは以下のとおりです。

```mermaid
sequenceDiagram
    actor User as ユーザー
    participant RR as 楽楽精算<br>（SP）
    participant KC as Keycloak<br>（IdP）

    User->>RR: ①楽楽精算にアクセス
    RR->>KC: ②SAML認証リクエスト<br>（リダイレクト）
    KC->>User: ③ログイン画面を表示
    User->>KC: ④ID/パスワードを入力
    KC->>KC: ⑤認証処理
    KC->>RR: ⑥SAMLレスポンス<br>（認証結果＋社員コード）
    RR->>RR: ⑦社員コードで<br>ユーザーを特定
    RR->>User: ⑧ログイン完了
```

### 連携時の注意点

**ユーザー識別子の紐付けが必要**

楽楽精算はユーザーの識別に「社員コード」を使用します。Keycloak側のユーザー属性に社員コードを設定し、SAMLレスポンスの NameID またはカスタム属性として送信する必要があります。

```
Keycloak ユーザー属性             楽楽精算
─────────────────────────────────────────
employeeNumber: "EMP001"  →  社員コード: "EMP001"
（SAMLレスポンスで送信）
```

**設定中のロックアウトリスク**

楽楽精算側でSSO設定を有効化する際、設定を誤るとIdP経由でしかログインできなくなり、管理者がロックアウトされるリスクがあります。設定変更中は楽楽精算の管理画面を閉じないこと、また検証環境で事前にテストすることが重要です。

### 他の国内SaaSのSSO対応状況

楽楽シリーズ以外にも、多くの国内SaaSがSAML 2.0に対応しています。

| カテゴリ | サービス例 | SSO対応 |
|---|---|---|
| 勤怠管理 | TeamSpirit、KING OF TIME、ジョブカン | SAML 2.0 ✅ |
| グループウェア | サイボウズ Office/Garoon、Google Workspace | SAML 2.0 / OIDC ✅ |
| CRM/SFA | Salesforce、HubSpot | SAML 2.0 / OIDC ✅ |
| コミュニケーション | Slack、Microsoft Teams | SAML 2.0 / OIDC ✅ |
| ストレージ | Box、Google Drive、OneDrive | SAML 2.0 / OIDC ✅ |

SAML 2.0 は業界標準のプロトコルであるため、Keycloakを IdP として構築すれば、これらのサービスに対しても同様にSSO連携が可能です。

---

## 8. SSOの認証フロー ― 「一回ログインすれば全部使える」の仕組み

SSOの起点には **2つのパターン** があります。

### パターン1: IdP起点（IdP-Initiated SSO）

最初に **IdP（Keycloakなど）のポータル画面** にログインして、そこから各システムに飛ぶパターンです。Microsoft 365のアプリランチャー（ワッフルメニュー）と同じ体験です。

```mermaid
flowchart LR
    User["ユーザー"] --> KC["Keycloak<br>ポータルにログイン"]
    KC -->|"クリック"| RR["楽楽精算<br>パスワード不要"]
    KC -->|"クリック"| SF["Salesforce<br>パスワード不要"]
    KC -->|"クリック"| Slack["Slack<br>パスワード不要"]

    style User fill:#22c55e,stroke:#16a34a,color:#fff
    style KC fill:#ef4444,stroke:#dc2626,color:#fff
    style RR fill:#e2e8f0,stroke:#64748b,color:#1e293b
    style SF fill:#e2e8f0,stroke:#64748b,color:#1e293b
    style Slack fill:#e2e8f0,stroke:#64748b,color:#1e293b
```

### パターン2: SP起点（SP-Initiated SSO）

**各システムに直接アクセス** したときに、まだログインしていなければIdPに飛ばされるパターンです。実際にはこちらの方がより一般的です。

```mermaid
flowchart LR
    User["ユーザー"] --> RR["楽楽精算に<br>直接アクセス"]
    RR -->|"未認証なら<br>リダイレクト"| KC["Keycloak<br>ログイン画面"]
    KC -->|"認証成功"| RR2["楽楽精算<br>ログイン完了"]

    style User fill:#22c55e,stroke:#16a34a,color:#fff
    style RR fill:#fef9c3,stroke:#eab308,color:#854d0e
    style KC fill:#ef4444,stroke:#dc2626,color:#fff
    style RR2 fill:#dcfce7,stroke:#22c55e,color:#166534
```

### なぜ「一回で済む」のか ― セッションの仕組み

SSOの核心は、**IdP（Keycloak）側にセッション（ログイン状態）が保持される** ことです。一度Keycloakで認証が通ると、ブラウザにセッションCookieが保存されます。以降、別のシステムからKeycloakにリダイレクトされても、既にセッションが有効なのでログイン画面は表示されず、即座に認証が完了します。

```mermaid
sequenceDiagram
    actor User as ユーザー
    participant RR as 楽楽精算
    participant KC as Keycloak（IdP）
    participant SF as Salesforce

    Note over User,SF: ── ① 1回目のアクセス（ログインが必要） ──
    User->>RR: 楽楽精算にアクセス
    RR->>KC: 認証リクエスト（リダイレクト）
    KC->>User: ログイン画面を表示
    User->>KC: ID / パスワードを入力
    KC->>KC: 認証成功 → セッション作成
    KC->>RR: 認証結果を返却
    RR->>User: ✅ ログイン完了

    Note over User,SF: ── ② 2回目以降のアクセス（ログイン不要） ──
    User->>SF: Salesforceにアクセス
    SF->>KC: 認証リクエスト（リダイレクト）
    KC->>KC: セッション確認 → まだ有効
    KC->>SF: 認証結果を即返却
    SF->>User: ✅ ログイン画面なしで即ログイン
```

### セッションのライフサイクル

セッションには有効期限があり、運用ポリシーに合わせて設定します。

```mermaid
flowchart TB
    Login["朝 ☀️<br>Keycloakにログイン<br>セッション開始"]
    Active["日中 💻<br>楽楽精算・Salesforce・Slack...<br>すべて再ログインなし"]
    Expire["セッション期限切れ ⏰<br>（例：8時間後）"]
    Relogin["再ログインを要求"]

    Login --> Active --> Expire --> Relogin
    Relogin -->|"再認証"| Login

    style Login fill:#22c55e,stroke:#16a34a,color:#fff
    style Active fill:#3b82f6,stroke:#2563eb,color:#fff
    style Expire fill:#f97316,stroke:#ea580c,color:#fff
    style Relogin fill:#ef4444,stroke:#dc2626,color:#fff
```

| 設定項目 | 説明 | 一般的な設定例 |
|---|---|---|
| セッション有効期限 | アイドル状態でもセッションを維持する最大時間 | 8〜10時間（1営業日） |
| アイドルタイムアウト | 操作がない場合にセッションを切る時間 | 30分〜1時間 |
| リメンバーミー | ブラウザを閉じてもセッションを維持するか | 社内ポリシーによる |
| 強制再認証 | 機密性の高い操作時にパスワードを再要求 | 給与情報の閲覧時など |

Keycloakではこれらの設定をレルム単位で管理でき、管理コンソールから変更可能です。

### 実際の運用での組み合わせ

現実には **両方のパターンを組み合わせて運用** するのが一般的です。

| タイミング | パターン | 動作 |
|---|---|---|
| 朝の業務開始時 | IdP起点 | Keycloakのポータルにログインし、よく使うシステムにアクセス |
| 日中の業務中 | SP起点 | ブックマークやメールのリンクから各システムに直接アクセス → 再ログインなし |
| セッション期限切れ後 | SP起点 | アクセス時にKeycloakのログイン画面が再度表示される |
| 管理者によるアカウント無効化時 | ― | 次回アクセス時にログインが拒否される |

---

## 9. SSOの内部動作 ― リダイレクト・セッション・SAMLアサーション

セクション8ではSSOのユーザー体験を説明しました。ここでは「裏側で何が起きているか」を技術的に掘り下げます。

### SP起点SSOの詳細フロー（認証済みの場合）

2回目以降のアクセス（Keycloakで認証済みの場合）では、以下のことが裏側で起きています。

```mermaid
sequenceDiagram
    actor User as ユーザー
    participant Browser as ブラウザ
    participant RR as 楽楽精算（SP）
    participant KC as Keycloak（IdP）

    User->>Browser: 楽楽精算のURLにアクセス
    Browser->>RR: GETリクエスト
    RR->>RR: 「この人、うちでは未認証」
    RR->>Browser: 302リダイレクト<br>＋ SAML AuthnRequest
    Browser->>KC: リダイレクト先にアクセス<br>＋ セッションCookieを自動送信
    KC->>KC: Cookie確認<br>→ 有効なセッションあり<br>→ ログイン画面は出さない
    KC->>KC: SAMLアサーションを生成<br>＋ 秘密鍵で署名
    KC->>Browser: HTMLフォーム<br>＋ SAMLアサーション
    Browser->>RR: POST（自動送信）<br>＋ SAMLアサーション
    RR->>RR: アサーション検証<br>（署名OK・有効期限OK）<br>→ 社員コード取得<br>→ SPセッション作成
    RR->>Browser: ログイン完了ページ
    Browser->>User: ✅ 表示
```

ユーザーから見ると **一瞬ページが切り替わるだけ** で、リダイレクトが裏で往復しているのはほぼ気づきません。

### セッションが「2つ」存在する

SSOを正しく理解するうえで重要なのが、**IdP側のセッションとSP側のセッションは別物** だということです。

```mermaid
flowchart TB
    subgraph IdP_Session["Keycloak のセッション（IdP側）"]
        direction TB
        IdP_Desc["「この人は本人確認済み」という状態<br>ブラウザのCookieで管理<br>全SP共通で使われる"]
    end

    subgraph SP_Session["楽楽精算のセッション（SP側）"]
        direction TB
        SP_Desc["「この人はうちにログイン済み」という状態<br>楽楽精算独自のCookieで管理<br>楽楽精算だけで有効"]
    end

    Browser["ブラウザ<br>（両方のCookieを保持）"]
    Browser --- IdP_Session
    Browser --- SP_Session

    style IdP_Session fill:#fee2e2,stroke:#ef4444,color:#991b1b
    style SP_Session fill:#dbeafe,stroke:#3b82f6,color:#1e3a5f
    style Browser fill:#22c55e,stroke:#16a34a,color:#fff
    style IdP_Desc fill:#fee2e2,stroke:#ef4444,color:#991b1b
    style SP_Desc fill:#dbeafe,stroke:#3b82f6,color:#1e3a5f
```

この **2つのセッションの組み合わせ** によって、ユーザーの体験が変わります。

| Keycloakセッション | SPセッション | ユーザーの体験 |
|---|---|---|
| ✅ 有効 | ✅ 有効 | そのままシステムを利用できる（リダイレクトも発生しない） |
| ✅ 有効 | ❌ 切れた | リダイレクトは走るが、Keycloakが即SAMLアサーションを返すので **一瞬で再ログイン**（パスワード入力なし） |
| ❌ 切れた | ✅ 有効 | SPのセッションが残っている間はそのまま利用可能 |
| ❌ 切れた | ❌ 切れた | Keycloakのログイン画面が表示され、**パスワードの再入力が必要** |

### SAMLアサーションの中身

Keycloakが生成してSPに返す「SAMLアサーション」は、XML形式の認証証明書のようなものです。主に以下の情報が含まれます。

```mermaid
flowchart TB
    subgraph Assertion["SAMLアサーション"]
        direction TB
        Issuer["発行者（Issuer）<br>https://keycloak.example.com/realms/demo"]
        Subject["対象ユーザー（Subject）<br>NameID: EMP001（社員コード）"]
        Conditions["有効条件（Conditions）<br>有効期限: 数分間<br>対象SP: 楽楽精算のみ"]
        AuthnStmt["認証情報（AuthnStatement）<br>いつ・どうやって認証したか"]
        AttrStmt["属性情報（AttributeStatement）<br>email: user@example.com<br>role: sales<br>department: 営業部"]
        Signature["電子署名（Signature）<br>Keycloakの秘密鍵で署名<br>→ 改ざん防止"]
    end

    style Assertion fill:#fefce8,stroke:#eab308,color:#854d0e
    style Issuer fill:#e2e8f0,stroke:#64748b,color:#1e293b
    style Subject fill:#e2e8f0,stroke:#64748b,color:#1e293b
    style Conditions fill:#e2e8f0,stroke:#64748b,color:#1e293b
    style AuthnStmt fill:#e2e8f0,stroke:#64748b,color:#1e293b
    style AttrStmt fill:#e2e8f0,stroke:#64748b,color:#1e293b
    style Signature fill:#fee2e2,stroke:#ef4444,color:#991b1b
```

実際のXMLは以下のような構造です（簡略化）。

```xml
<saml:Assertion>
  <!-- 発行者: どのIdPが発行したか -->
  <saml:Issuer>https://keycloak.example.com/realms/demo</saml:Issuer>

  <!-- 対象ユーザー: 誰についてのアサーションか -->
  <saml:Subject>
    <saml:NameID>EMP001</saml:NameID>
  </saml:Subject>

  <!-- 有効条件: いつまで有効か、どのSP向けか -->
  <saml:Conditions NotBefore="2026-04-16T09:00:00Z"
                   NotOnOrAfter="2026-04-16T09:05:00Z">
    <saml:AudienceRestriction>
      <saml:Audience>https://rakurakuseisan.example.com</saml:Audience>
    </saml:AudienceRestriction>
  </saml:Conditions>

  <!-- 認証情報: いつ、どうやって認証したか -->
  <saml:AuthnStatement AuthnInstant="2026-04-16T08:55:00Z">
    <saml:AuthnContext>
      <saml:AuthnContextClassRef>
        urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport
      </saml:AuthnContextClassRef>
    </saml:AuthnContext>
  </saml:AuthnStatement>

  <!-- 属性情報: SPが必要とするユーザーデータ -->
  <saml:AttributeStatement>
    <saml:Attribute Name="email">
      <saml:AttributeValue>tanaka@example.com</saml:AttributeValue>
    </saml:Attribute>
    <saml:Attribute Name="role">
      <saml:AttributeValue>sales</saml:AttributeValue>
    </saml:Attribute>
    <saml:Attribute Name="department">
      <saml:AttributeValue>営業部</saml:AttributeValue>
    </saml:Attribute>
  </saml:AttributeStatement>

  <!-- 電子署名: Keycloakの秘密鍵で署名（改ざん防止） -->
  <ds:Signature>
    <!-- SP側はKeycloakの公開鍵で署名を検証する -->
  </ds:Signature>
</saml:Assertion>
```

### SP側の検証プロセス

楽楽精算（SP）がSAMLアサーションを受け取った後、以下の検証を行ってからログインを許可します。

```mermaid
flowchart TB
    Receive["SAMLアサーション受信"]
    Sig["① 署名検証<br>Keycloakの公開鍵で<br>電子署名を検証"]
    Time["② 有効期限チェック<br>NotBefore〜NotOnOrAfter<br>の範囲内か確認"]
    Audience["③ 宛先確認<br>Audienceが自分（楽楽精算）<br>宛てか確認"]
    User["④ ユーザー特定<br>NameID（社員コード）で<br>楽楽精算のユーザーを検索"]
    Session["⑤ セッション作成<br>楽楽精算側のセッションを発行"]
    Done["✅ ログイン完了"]
    Reject["❌ ログイン拒否"]

    Receive --> Sig
    Sig -->|"OK"| Time
    Sig -->|"NG"| Reject
    Time -->|"OK"| Audience
    Time -->|"期限切れ"| Reject
    Audience -->|"OK"| User
    Audience -->|"宛先不一致"| Reject
    User -->|"ユーザー発見"| Session
    User -->|"該当なし"| Reject
    Session --> Done

    style Receive fill:#3b82f6,stroke:#2563eb,color:#fff
    style Sig fill:#e2e8f0,stroke:#64748b,color:#1e293b
    style Time fill:#e2e8f0,stroke:#64748b,color:#1e293b
    style Audience fill:#e2e8f0,stroke:#64748b,color:#1e293b
    style User fill:#e2e8f0,stroke:#64748b,color:#1e293b
    style Session fill:#e2e8f0,stroke:#64748b,color:#1e293b
    style Done fill:#22c55e,stroke:#16a34a,color:#fff
    style Reject fill:#ef4444,stroke:#dc2626,color:#fff
```

この検証プロセスがあるため、**事前にIdPのメタデータ（公開鍵・証明書）をSP側に登録しておく必要がある** のです。楽楽精算の管理画面でKeycloakの証明書をアップロードするのは、まさにこの署名検証のためです。

---

## 10. まとめ

- **ID管理の本質** は「人の出入りとアクセス権を一箇所で安全に制御する」こと
- **5つの機能層**（ライフサイクル・認証・SSO・認可・監査）で構成される
- **AD** はオンプレWindows環境では強力だが、SaaS連携には **Entra ID** などクラウド側の仕組みが必要
- **自前構築** は、コスト削減・独自システム連携・管理画面カスタマイズなどのニーズがある場合に有効
- **Keycloak** はOSSのIdP基盤として、SSO・MFA・ユーザー管理・RBAC・監査ログを備え、REST APIで全機能を外部から操作可能
- **楽楽精算をはじめとする国内SaaS** の多くはSAML 2.0に対応しており、Keycloakからの SSO 連携が可能
- **SSOの体験** は「一度IdPにログインすればセッションが維持され、他のシステムにも再ログインなしでアクセスできる」こと。IdP起点・SP起点の2パターンがある
- **SSOの内部動作** では、IdP側とSP側で別々のセッションが存在し、SAMLアサーション（電子署名付きXML）によって認証情報が安全に受け渡される
- プロトタイプは **Keycloak + FastAPI + Next.js** の構成で実現可能
