# Setup Judge0 CE on a Linux VPS

This guide walk you through installing, configuring, and securing **Judge0 Community Edition (CE)** on your Linux VPS (Virtual Private Server).

---

## 🛠️ Step 1: Install Docker & Docker Compose on your VPS

Before installing Judge0, make sure Docker and Docker Compose are installed on your Linux VPS (e.g., Ubuntu/Debian).

```bash
# Update package database
sudo apt update

# Install Docker
sudo apt install -y docker.io

# Enable and start Docker service
sudo systemctl enable --now docker

# Install Docker Compose (v2)
sudo apt install -y docker-compose-plugin

# Verify installations
docker --version
docker compose version
```

---

## 📥 Step 2: Download Judge0 Community Edition

Download the official Judge0 Community Edition release package.

```bash
# Create a folder for Judge0
mkdir -p ~/judge0
cd ~/judge0

# Download the latest Judge0 package
wget https://github.com/judge0/judge0/releases/download/v1.13.0/judge0-v1.13.0.tar.gz

# Extract the archive
tar -xzf judge0-v1.13.0.tar.gz
cd judge0-v1.13.0
```

---

## 🔒 Step 3: Secure Judge0 with an Authentication Token

To prevent unauthorized parties from using your VPS compiler instance, you **must** configure authentication.

1. Open the Judge0 configuration file:
   ```bash
   nano judge0.conf
   ```
2. Locate the line or add the line setting `auth_token`:
   ```ini
   # Add or change your custom authentication token
   # This token will be checked via the "X-Auth-Token" HTTP header
   auth_token = "YOUR_SUPER_SECURE_AUTH_TOKEN"
   ```
3. Save the file (`Ctrl + O`, then `Enter`) and exit nano (`Ctrl + X`).

---

## 🚀 Step 4: Start Judge0 Services

Start the Judge0 components (API, DB, Redis, and workers) in the background:

```bash
# Start services
sudo docker compose up -d
```

Check that all containers are running successfully:
```bash
sudo docker compose ps
```

---

## 🌐 Step 5: Configure Firewalls (Open Ports)

Judge0 runs by default on port `2358`. You need to allow connections to port `2358` on your VPS from your application's backend server.

- **Using UFW (Ubuntu Firewall)**:
  ```bash
  # If your backend runs on a specific IP, restrict port access to that IP:
  sudo ufw allow from <YOUR_BACKEND_SERVER_IP> to any port 2358 proto tcp
  
  # Or open it publicly (not recommended without authentication configured):
  # sudo ufw allow 2358/tcp
  
  # Reload firewall
  sudo ufw reload
  ```

---

## 🧪 Step 6: Test connectivity from another machine (e.g. backend host)

You can run this curl command from a remote machine (like your local PC or backend server) to check if the VPS Judge0 instance is accessible:

```bash
curl -X GET "http://<YOUR_VPS_IP>:2358/languages" \
  -H "X-Auth-Token: YOUR_SUPER_SECURE_AUTH_TOKEN"
```

If it returns a list of languages, your VPS compiler is ready!

---

## ⚙️ Step 7: Update `backend/.env` in InterVue

Once the VPS setup is done, update the backend `.env` variables:

```env
# Disable local docker execution
USE_LOCAL_DOCKER_FALLBACK=false

# Point to your VPS
JUDGE0_API_URL="http://<YOUR_VPS_IP>:2358"
JUDGE0_AUTH_TOKEN="YOUR_SUPER_SECURE_AUTH_TOKEN"

# Clear any RapidAPI keys
JUDGE0_RAPIDAPI_KEY=""
JUDGE0_RAPIDAPI_HOST=""
```
