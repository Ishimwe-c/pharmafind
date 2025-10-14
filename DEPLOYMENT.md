# Deployment Guide

## 🚀 Production Deployment

### Prerequisites
- Domain name
- Hosting server with PHP 8.2+
- MySQL/PostgreSQL database (or SQLite for small scale)
- SSL certificate
- Google Maps API key (production key)

---

## Backend Deployment (Laravel)

### 1. Server Requirements
```
PHP >= 8.2
BCMath PHP Extension
Ctype PHP Extension
Fileinfo PHP Extension
JSON PHP Extension
Mbstring PHP Extension
OpenSSL PHP Extension
PDO PHP Extension
Tokenizer PHP Extension
XML PHP Extension
```

### 2. Deployment Steps

**a) Clone and Install**
```bash
git clone <your-repo>
cd pharmafind
composer install --optimize-autoloader --no-dev
```

**b) Configure Environment**
```bash
cp .env.example .env
nano .env
```

**c) Update .env for Production**
```env
APP_NAME=PharmaFind
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com
APP_TIMEZONE=Africa/Kigali

# Database (example for MySQL)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pharmafind
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

# Session & Cache
SESSION_DRIVER=database
CACHE_DRIVER=file

# CORS
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

**d) Generate Key and Setup**
```bash
php artisan key:generate
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

**e) Database Setup**
```bash
php artisan migrate --force
php artisan db:seed --class=AdminSeeder
php artisan db:seed --class=InsuranceSeeder
```

**f) Set Permissions**
```bash
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### 3. Web Server Configuration

**Apache (.htaccess)**
Already included in Laravel's public directory.

**Nginx**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/pharmafind/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

---

## Frontend Deployment (Vercel/Netlify)

### Option 1: Vercel (Recommended)

**a) Install Vercel CLI**
```bash
npm install -g vercel
```

**b) Deploy**
```bash
cd pharmafind-front
vercel
```

**c) Configure Environment Variables in Vercel**
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Add:
  - `VITE_API_BASE_URL` = https://api.yourdomain.com
  - `VITE_GOOGLE_MAPS_API_KEY` = your_production_key

**d) Automatic Deployments**
- Connect your Git repository
- Every push to main branch auto-deploys

### Option 2: Netlify

**a) Build the Frontend**
```bash
cd pharmafind-front
npm run build
```

**b) Deploy dist folder**
- Drag and drop `dist` folder to Netlify
- Or use Netlify CLI

**c) Configure Redirects**
Create `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 3: Static Hosting (AWS S3, GitHub Pages, etc.)

**a) Build**
```bash
cd pharmafind-front
npm run build
```

**b) Upload**
Upload contents of `dist` folder to your static hosting.

---

## SSL Certificate

### Using Let's Encrypt (Free)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Auto-renewal:
```bash
sudo certbot renew --dry-run
```

---

## Database Backup

### Automated Backups

**a) Create Backup Script**
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u username -p password pharmafind > backup_$DATE.sql
gzip backup_$DATE.sql
```

**b) Add to Cron**
```bash
crontab -e
# Add: Daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```

---

## Monitoring & Maintenance

### Log Monitoring
```bash
# Laravel logs
tail -f storage/logs/laravel.log

# Nginx logs
tail -f /var/log/nginx/error.log
```

### Performance Optimization
```bash
# Clear all caches
php artisan optimize:clear

# Cache everything
php artisan optimize
```

### Updates
```bash
# Pull latest changes
git pull origin main

# Update dependencies
composer install --no-dev
npm install

# Run migrations
php artisan migrate --force

# Clear and cache
php artisan optimize
```

---

## Security Checklist

- [ ] APP_DEBUG=false in production
- [ ] Strong database passwords
- [ ] SSL certificate installed
- [ ] CORS properly configured
- [ ] File upload limits set
- [ ] Regular backups enabled
- [ ] Server firewall configured
- [ ] Keep Laravel and dependencies updated
- [ ] Monitor error logs regularly

---

## Troubleshooting

### Common Issues

**500 Error**
- Check storage permissions: `chmod -R 755 storage`
- Check .env configuration
- Check error logs

**Database Connection Failed**
- Verify database credentials in .env
- Check if database server is running
- Test connection: `php artisan tinker` → `DB::connection()->getPdo();`

**CORS Errors**
- Verify SANCTUM_STATEFUL_DOMAINS in .env
- Check frontend VITE_API_BASE_URL
- Clear cache: `php artisan config:clear`

**Maps Not Loading**
- Verify Google Maps API key
- Check browser console for errors
- Ensure API key has proper restrictions

---

## Support

For issues or questions:
- Check Laravel logs: `storage/logs/laravel.log`
- Check browser console for frontend errors
- Review this deployment guide

---

**Deployment Date:** ___________  
**Deployed By:** ___________  
**Production URL:** ___________

