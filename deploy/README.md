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

# Monitoring — filled in during step 9 (optional; omit to disable monitoring).
GC_PROM_URL=
GC_PROM_USERNAME=
GC_PROM_PASSWORD=
GC_LOKI_URL=
GC_LOKI_USERNAME=
GC_LOKI_PASSWORD=
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

### 9. Monitoring — Grafana Cloud (optional)

The `alloy` service in `docker-compose.yml` pushes host + container metrics and container logs to Grafana Cloud. Without the six `GC_*` variables in `.env`, Alloy crash-loops harmlessly; the rest of the stack is unaffected.

To enable:

1. Sign up at https://grafana.com (free tier, no card). Create a stack — this provisions a hosted Prometheus, Loki, and Grafana instance.
2. From the stack's **Connections → Data sources** page, copy the push credentials for both Prometheus and Loki. For each one Grafana shows a "Remote Write Endpoint" URL, a numeric username, and a `glc_...` API token.
3. Fill the six `GC_*` lines in `/opt/magic-sentry/.env`:
   ```
   GC_PROM_URL=https://prometheus-prod-<region>.grafana.net/api/prom/push
   GC_PROM_USERNAME=<numeric id>
   GC_PROM_PASSWORD=glc_xxxxxxxxxxxx
   GC_LOKI_URL=https://logs-prod-<region>.grafana.net/loki/api/v1/push
   GC_LOKI_USERNAME=<numeric id>
   GC_LOKI_PASSWORD=glc_xxxxxxxxxxxx
   ```
4. Reload Alloy: `cd /opt/magic-sentry && docker compose --env-file .compose.env up -d alloy`.
5. In Grafana Cloud → **Connections**, enable the **Linux Server** and **Docker** integrations. The prebuilt dashboards auto-import and start populating within ~1 minute.
6. Configure email alerts:
   - **Alerts & IRM → Contact points → Add contact point** of type *Email*, address `anxiety.pb@googlemail.com`. Send a test.
   - **Alert rules → New rule** — create four warning-level rules, each routed to the contact point (1 h `repeat_interval`, 5 min `group_interval`):

     | Rule | Expression | For |
     | --- | --- | --- |
     | `ContainerRestart` | `increase(container_start_time_seconds{name=~"magic-sentry-(web|caddy)-.*"}[10m]) > 0` | 0m |
     | `ContainerDown` | `absent(container_last_seen{name=~"magic-sentry-(web|caddy)-.*"})` | 2m |
     | `HostMemoryHigh` | `(1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) > 0.85` | 10m |
     | `HostDiskHigh` | `(node_filesystem_size_bytes{mountpoint="/rootfs"} - node_filesystem_avail_bytes{mountpoint="/rootfs"}) / node_filesystem_size_bytes{mountpoint="/rootfs"} > 0.80` | 10m |

7. Test by stopping the web container for 3 minutes:
   ```bash
   docker stop magic-sentry-web-1
   ```
   Expect a `ContainerDown` email within ~3 min. Restart with `docker start magic-sentry-web-1` and you should receive `ContainerRestart`.

**Security note:** Alloy needs read-only access to the Docker socket, which is effectively root on the host. This is the standard tradeoff for container monitoring; only the Alloy container is granted it.

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
