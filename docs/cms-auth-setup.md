# CMS authentication — one-time manual setup

Decap CMS at `/admin/` uses a **git-gateway** backend: the editor logs in through an external
auth provider, and saves go to GitHub as commits or pull requests. This is configured **once per
deployment**, outside the normal code/agent workflow.

The reference deployment uses [DecapBridge](https://decapbridge.com/docs). Any compatible
git-gateway host works the same way — paste its `identity_url` and `gateway_url` into
`public/admin/config.yml`.

## Steps (DecapBridge)

1. Register a site at [decapbridge.com](https://decapbridge.com/docs).
2. Connect it to your GitHub repo (`backend.repo`, `branch: main` in `public/admin/config.yml`).
3. Copy `identity_url` and `gateway_url` into `public/admin/config.yml`.
4. Create a GitHub personal access token with **Contents: Read and write** and **Pull requests:
   Read and write** (required because this template uses `publish_mode: editorial_workflow`).
5. Paste the token into the DecapBridge site settings.
6. Invite the content editor by email — they never need a GitHub account.

## Fields in `public/admin/config.yml`

```yaml
backend:
  name: git-gateway
  repo: <owner>/<repo>
  branch: main
  identity_url: https://auth.decapbridge.com/sites/<site-id>
  gateway_url: https://gateway.decapbridge.com
```

Also set `site_url` to the public site URL (where "View site" in the CMS should point).

## Troubleshooting

**`Failed to persist entry: API_ERROR: Unexpected end of JSON input`** — the GitHub token is missing
**Pull requests: Read and write**. Update the token at
[github.com/settings/tokens](https://github.com/settings/tokens) and re-paste it in DecapBridge.

## Local editing without auth

For development only, set `local_backend: true` in `public/admin/config.yml` and run
`npx decap-server` alongside `npm run dev`. **Never commit `local_backend: true`.**
