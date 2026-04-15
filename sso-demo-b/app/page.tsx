import { redirect } from "next/navigation";
import { ArrowRight, LogIn, LogOut, ShieldCheck } from "lucide-react";

import { auth, signIn, signOut } from "@/auth";

type DemoSession = {
  user?: { name?: string | null; email?: string | null; username?: string };
  roles?: string[];
  idToken?: string;
};

const OTHER_APP_URL = "http://localhost:3001";
const OTHER_APP_LABEL = "サンプルアプリ A";

export default async function HomePage() {
  const session = (await auth()) as DemoSession | null;

  if (!session) {
    return <SignedOutView />;
  }
  return <SignedInView session={session} />;
}

function SignedOutView() {
  async function login() {
    "use server";
    await signIn("keycloak", { redirectTo: "/" });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-8 py-16 animate-fade-up">
      <div className="space-y-2">
        <p className="eyebrow">サンプルアプリ B</p>
        <h1 className="font-display text-5xl leading-[1.05] tracking-[-0.02em]">
          こちらはアプリ <span className="text-forest">B</span> です
        </h1>
      </div>

      <div className="my-10 h-px w-full bg-rule" />

      <p className="max-w-md text-sm leading-relaxed text-muted">
        アプリAとまったく別のNext.jsアプリケーションです。
        同じKeycloakレルム（<code className="font-mono text-ink">demo</code>）を使っているため、
        アプリAにログイン済みなら「SSOでログイン」を押した瞬間にフォーム表示なしで戻ってきます。
      </p>

      <form action={login} className="mt-10">
        <button
          type="submit"
          className="group inline-flex items-center gap-3 border border-forest bg-forest px-8 py-4 text-sm text-paper transition-colors hover:bg-ink hover:border-ink"
        >
          <LogIn className="h-4 w-4" />
          <span className="tracking-[0.04em]">SSOでログイン</span>
        </button>
      </form>

      <a
        href={OTHER_APP_URL}
        className="mt-6 inline-flex items-center gap-2 text-[12px] text-muted transition-colors hover:text-ink"
      >
        <ArrowRight className="h-3.5 w-3.5" />
        {OTHER_APP_LABEL}を開く
      </a>

      <dl className="mt-16 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 font-mono text-[11px] text-muted">
        <dt className="uppercase tracking-[0.18em]">Client ID</dt>
        <dd className="text-ink">sso-demo-b</dd>
        <dt className="uppercase tracking-[0.18em]">Realm</dt>
        <dd className="text-ink">demo</dd>
        <dt className="uppercase tracking-[0.18em]">Flow</dt>
        <dd className="text-ink">Authorization Code (OIDC)</dd>
      </dl>
    </main>
  );
}

function SignedInView({ session }: { session: DemoSession }) {
  async function logoutLocal() {
    "use server";
    await signOut({ redirect: false });
    redirect("/");
  }

  async function logoutFromSSO() {
    "use server";
    const current = (await auth()) as DemoSession | null;
    const idToken = current?.idToken;
    await signOut({ redirect: false });
    const issuer = process.env.KEYCLOAK_ISSUER!;
    const postLogout = process.env.AUTH_URL ?? "http://localhost:3002";
    const url = new URL(`${issuer}/protocol/openid-connect/logout`);
    if (idToken) url.searchParams.set("id_token_hint", idToken);
    url.searchParams.set("post_logout_redirect_uri", postLogout);
    redirect(url.toString());
  }

  const roles = session.roles ?? [];
  const name = session.user?.name ?? session.user?.username ?? "Unknown";

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-8 py-16 animate-fade-up">
      <div className="flex items-baseline gap-3">
        <ShieldCheck className="h-4 w-4 text-forest" />
        <p className="eyebrow text-forest">SSO認証済み · アプリB</p>
      </div>

      <h1 className="mt-4 font-display text-4xl leading-[1.05] tracking-[-0.02em]">
        こんにちは、
        <span className="text-forest">{name}</span>
        さん。
      </h1>

      <div className="my-10 h-px w-full bg-rule" />

      <p className="eyebrow">Keycloakから受け取った情報</p>

      <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-8 gap-y-5 text-sm">
        <Row label="ユーザー名" value={session.user?.username ?? "—"} mono />
        <Row label="表示名" value={session.user?.name ?? "—"} />
        <Row label="メール" value={session.user?.email ?? "—"} mono />
        <Row
          label="ロール"
          value={
            roles.length === 0 ? (
              <span className="text-muted">—</span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {roles.map((r) => (
                  <span
                    key={r}
                    className="border border-rule px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink"
                  >
                    {r}
                  </span>
                ))}
              </div>
            )
          }
        />
      </dl>

      <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        <a
          href={OTHER_APP_URL}
          className="inline-flex items-center gap-2 border border-forest px-6 py-3 text-sm text-forest transition-colors hover:bg-forest hover:text-paper"
        >
          <ArrowRight className="h-4 w-4" />
          <span className="tracking-[0.04em]">{OTHER_APP_LABEL}を開く</span>
        </a>
        <form action={logoutLocal}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 border border-ink/30 px-6 py-3 text-sm text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
          >
            <LogOut className="h-4 w-4" />
            <span className="tracking-[0.04em]">このアプリからログアウト</span>
          </button>
        </form>
      </div>

      <form action={logoutFromSSO} className="mt-4">
        <button
          type="submit"
          className="text-[11px] text-muted underline-offset-4 transition-colors hover:text-destructive hover:underline"
        >
          SSOからも完全にログアウトする →
        </button>
      </form>

      <p className="mt-10 max-w-md text-[11px] leading-relaxed text-muted">
        「このアプリからログアウト」は、このアプリ B のセッションCookieだけを消します。
        Keycloak側のSSOセッションは残るため、アプリ A や再度この画面を開いた時は
        パスワード入力なしで再ログインします。
        「SSOからも完全にログアウト」は、Keycloak側のSSOセッションも終了させます。
      </p>
    </main>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <>
      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
        {label}
      </dt>
      <dd className={mono ? "font-mono text-[13px] text-ink" : "text-ink"}>
        {value}
      </dd>
    </>
  );
}
