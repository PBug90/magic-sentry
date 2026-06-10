# Magic Sentry — VPS deploy

This folder contains the infrastructure files SCPed onto the VPS by `.github/workflows/deploy-web.yml`.

## One-time VPS bootstrap

Perform these steps **once**, as `root` on a fresh Ubuntu/Debian VPS that already has Docker installed.

### 1. Generate the GitHub Actions SSH keypair locally

On your workstation (not the VPS):

```bash
ssh-keygen -t ed25519 -f gha_deploy -N "" -C "github-actions@magic-sentry"
cat gha_deploy.pub   # paste this into step 3
cat gha_deploy        # paste this into the VPS_SSH_KEY GitHub secret
ssh-keyscan <VPS_HOST> > known_hosts && cat known_hosts   # paste into VPS_SSH_KNOWN_HOSTS
```

### 2. Create the deploy user

On the VPS as root:

```bash
adduser --disabled-password --gecos "" deploy
usermod -aG docker deploy
```

### 3. Install the SSH public key for the deploy user

```bash
mkdir -p /home/deploy/.ssh && chmod 700 /home/deploy/.ssh
echo "ssh-ed25519 AAAA... github-actions@magic-sentry" \
  > /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
```

### 4. Create the application directory

```bash
mkdir -p /opt/magic-sentry
chown deploy:deploy /opt/magic-sentry
```

(Caddy stores its data in named Docker volumes — no extra directories needed.)

### 5. Write `/opt/magic-sentry/.env`

As the `deploy` user:

```bash
sudo -u deploy tee /opt/magic-sentry/.env >/dev/null <<'EOF'
PORT=3000
DATABASE_URL=postgresql://<supabase connection string>
TWITCH_CLIENT_ID=<twitch app id>
TWITCH_CLIENT_SECRET=<twitch app secret>
TWITCH_REDIRECT_URI=https://magicsentry.pro/auth/twitch/callback
EOF
chmod 600 /opt/magic-sentry/.env
chown deploy:deploy /opt/magic-sentry/.env
```

`VITE_EXTENSION_URL` is **not** in `.env` — it is baked into the client bundle at image build time via a Dockerfile build arg.

### 6. Firewall

```bash
ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw --force enable
```

### 7. GitHub configuration

In the GitHub repo settings:

**Secrets** (Settings → Secrets and variables → Actions → Secrets):

| Secret | Value |
| --- | --- |
| `VPS_HOST` | IP or hostname of the VPS |
| `VPS_SSH_KEY` | Contents of the `gha_deploy` private key file |
| `VPS_SSH_KNOWN_HOSTS` | Output of `ssh-keyscan <VPS_HOST>` |

**Variables** (Settings → Secrets and variables → Actions → Variables):

| Variable | Value |
| --- | --- |
| `VITE_EXTENSION_URL` | Public Twitch extension URL used by the landing page |

### 8. Smoke test the SSH connection from your workstation

```bash
ssh -i gha_deploy deploy@<VPS_HOST> "docker --version && ls -la /opt/magic-sentry"
```

Expected: prints the Docker version and shows the `.env` file with mode `-rw-------`.

## Deploying

Trigger the **Deploy web** workflow manually from the GitHub Actions UI. The first deploy is expected to fail the post-deploy health check because DNS still points at the old host — see `docs/superpowers/specs/2026-06-10-vps-deploy-design.md` §7 for the cutover sequence.

The workflow writes the deployed image tag to `/opt/magic-sentry/.compose.env`. For any ad-hoc `docker compose` commands on the VPS (e.g. `ps`, `logs`), pass `--env-file .compose.env` so the `${IMAGE_TAG}` reference in `docker-compose.yml` resolves correctly.

## Rolling back

Find the prior good run in the GH Actions UI and click **Re-run jobs** on it — the image tag is the commit SHA, so re-running rebuilds nothing and just redeploys the older image.

Or, on the VPS:

```bash
cd /opt/magic-sentry
IMAGE_TAG=<old-sha> docker compose up -d
```
