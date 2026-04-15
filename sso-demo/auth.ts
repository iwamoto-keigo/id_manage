import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

/**
 * Keycloak OIDC configuration for a Docker deployment.
 *
 * Keycloak advertises `http://localhost:8080` as its public URL (via
 * KC_HOSTNAME) so the `iss` claim is stable regardless of caller:
 *   - browsers reach it at http://localhost:8080 (redirect / login UI)
 *   - this container reaches it at http://keycloak:8080 (code exchange)
 *
 * We split the OIDC endpoints:
 *   - `authorization` → public URL (browser performs this redirect)
 *   - `token`, `userinfo`, `jwks_endpoint` → internal URL (server-side)
 *   - `issuer` → public URL (used to validate the iss claim)
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
      // We've overridden every endpoint above, so skip OIDC discovery.
      wellKnown: undefined,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;

        // Keycloak returns realm_access.roles in the access token (JWT).
        // Decode the payload (no signature verification needed here —
        // the token was just obtained from Keycloak directly).
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
