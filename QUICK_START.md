# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Start Backend (Terminal 1)
```bash
cd pharmafind
php artisan serve
```
✅ Backend running at: `http://localhost:8000`

### 2. Start Frontend (Terminal 2)
```bash
cd pharmafind-front
npm run dev
```
✅ Frontend running at: `http://localhost:5173`

### 3. Open Browser
Navigate to: `http://localhost:5173`

---

## 👤 Login Credentials

### Admin Account
```
Email: admin@pharmafind.com
Password: password
```

### Create New Accounts
- Click "Get Started" on landing page
- Choose role (Patient or Pharmacy Owner)
- Fill in details and register

---

## 🗺️ Google Maps Setup

If maps aren't loading:

1. Get API key from: https://console.cloud.google.com/
2. Enable these APIs:
   - Maps JavaScript API
   - Directions API
   - Geocoding API
3. Add key to `pharmafind-front/.env`:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_key_here
   ```
4. Restart frontend server

---

## 📊 Sample Data

Run seeders to add sample data:
```bash
php artisan db:seed
```

This adds:
- Admin account
- Insurance providers (RSSB, MMI, Radiant, etc.)
- Sample medicines

---

## ✅ Quick Test

1. **Login as admin:** admin@pharmafind.com
2. **Create pharmacy:** Register → Pharmacy Owner
3. **Add medicines:** Pharmacy Dashboard → Medicines
4. **Test patient view:** Register → Patient
5. **Search pharmacies:** Map should show pharmacies

---

## 🔧 Troubleshooting

**Maps not loading?**
- Check Google Maps API key in .env
- Restart frontend server

**Database error?**
- Run: `php artisan migrate`
- Run: `php artisan db:seed`

**CORS error?**
- Check FRONTEND_URL in backend .env
- Should be: `http://localhost:5173`

---

## 📚 Full Documentation

- **README.md** - Complete guide
- **DEPLOYMENT.md** - Production deployment
- **PRESENTATION_READY.md** - Demo guide

---

**Ready to go!** 🎉

