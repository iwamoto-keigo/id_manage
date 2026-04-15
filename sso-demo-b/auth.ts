import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

/**
 * Sample App B's next-auth configuration.
 *
 * Uses the same realm as Sample App A (`demo`) but with a different
 * confidential client (`sso-demo-b`). Because both clients live in the
 * same realm, Keycloak maintains a single SSO session cookie per browser
 * that is shared across both apps — authenticating in one is enough to
 * silently authenticate the user in the other.
 *
 * See the URL split in the base issuer logic, identical to app A's auth.ts.
 */
const publicIssuer =
  process.env.KEYCLOAK_ISSUER ?? "http://localhost:8080/realms/demo";
const internalIssuer =
  process.env.KEYCLOAK_INTERNAL_ISSUER ?? publicIssuer;

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Keycloak({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: publicIssuer,
      authorization: {
        url: `${publicIssuer}/protocol/openid-connect/auth`,
        params: { scope: "openid profile email" },
      },
      token: `${internalIssuer}/protocol/openid-connect/token`,
      userinfo: `${internalIssuer}/protocol/openid-connect/userinfo`,
      jwks_endpoint: `${internalIssuer}/protocol/openid-connect/certs`,
      wellKnown: undefined,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        try {
          const payload = JSON.parse(
            Buffer.from(
              account.access_token.split(".")[1],
              "base64",
            ).toString("utf-8"),
          );
          token.roles = payload.realm_access?.roles ?? [];
          token.username = payload.preferred_username;
        } catch {
          token.roles = [];
        }
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken as string | undefined,
        idToken: token.idToken as string | undefined,
        roles: (token.roles as string[] | undefined) ?? [],
        user: {
          ...session.user,
          username: token.username as string | undefined,
        },
      };
    },
  },
});
