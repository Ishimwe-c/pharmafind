# PharmaFind - Find Your Nearest Pharmacy

A modern web application that helps patients find nearby pharmacies based on their location, insurance coverage, and medicine availability in Rwanda.

## 🌟 Features

### For Patients
- **🗺️ Interactive Map** - Find pharmacies near you with real-time GPS location
- **🔍 Smart Search** - Search by pharmacy name, location, or insurance
- **💊 Medicine Browser** - Browse available medicines at each pharmacy
- **🏥 Insurance Matching** - Find pharmacies that accept your insurance
- **📍 Driving Directions** - Get turn-by-turn directions to pharmacies
- **📱 PWA Support** - Install as a mobile app for offline access
- **🔔 Notifications** - Get alerts when new pharmacies accept your insurance

### For Pharmacy Owners
- **📊 Dashboard** - Overview of your pharmacy operations
- **💊 Medicine Management** - Add, update, and track medicine inventory
- **🕒 Working Hours** - Set operating hours for each day of the week
- **🏥 Insurance Management** - Manage accepted insurance providers
- **💰 Purchase Tracking** - Track patient purchases and payments
- **📈 Sales Reports** - Generate detailed sales and revenue reports
- **📍 Location Settings** - Set pharmacy location with GPS coordinates

### For Administrators
- **🏢 Pharmacy Management** - Approve and manage pharmacy registrations
- **👥 User Management** - Manage patients and pharmacy owners
- **🏥 Insurance Management** - Add and manage insurance providers
- **📬 Contact Messages** - View and respond to user inquiries
- **📊 Analytics** - System-wide analytics and insights

## 🛠️ Technology Stack

### Backend
- **Laravel 11** - PHP framework
- **SQLite** - Database
- **Laravel Sanctum** - API authentication
- **PHP 8.2+** - Programming language

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client
- **Google Maps API** - Maps and directions

## 📦 Installation

### Prerequisites
- PHP 8.2 or higher
- Composer
- Node.js 18+ and npm
- Google Maps API key

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pharmafind
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Update .env file**
   ```env
   APP_NAME=PharmaFind
   APP_ENV=local
   APP_DEBUG=true
   APP_TIMEZONE=Africa/Kigali

   DB_CONNECTION=sqlite
   ```

5. **Create database and run migrations**
   ```bash
   touch database/database.sqlite
   php artisan migrate
   ```

6. **Seed the database** (optional)
   ```bash
   php artisan db:seed
   ```

7. **Start the backend server**
   ```bash
   php artisan serve
   ```
   Backend will run at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd pharmafind-front
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```

4. **Update .env file**
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```
   Frontend will run at `http://localhost:5173`

## 🚀 Usage

### Default Admin Account
After seeding, you can login with:
- **Email:** admin@pharmafind.com
- **Password:** password

### Creating Accounts

1. **Patient Registration**
   - Go to `/auth/register-options`
   - Click "Register as Patient"
   - Fill in your details
   - Optionally add insurance information

2. **Pharmacy Owner Registration**
   - Go to `/auth/register-options`
   - Click "Register as Pharmacy Owner"
   - Fill in pharmacy details
   - Set location on map
   - Add working hours and insurances

## 📱 PWA Installation

The app can be installed as a Progressive Web App:

1. Visit the website on your mobile device
2. Click "Install" when prompted
3. The app will be added to your home screen
4. Use it like a native app with offline support

## 🗺️ Key Features Explained

### Google Maps Integration
- Real-time pharmacy locations on map
- User's current location tracking
- Driving directions with turn-by-turn navigation
- Distance calculation (straight-line and driving)

### Insurance Matching
- Automatic notifications when pharmacies accept your insurance
- Filter pharmacies by insurance provider
- View insurance coverage details

### Working Hours Management
- Set different hours for each day
- Mark days as closed
- Automatic open/closed status calculation
- Timezone-aware (Africa/Kigali)

### Purchase Reports
- Generate reports by date range
- Filter by insurance provider
- Export as PDF with multiple pages
- Detailed breakdown of sales and revenue

## 🔐 Security Features

- **Laravel Sanctum** - Token-based authentication
- **CORS Protection** - Configured for secure API access
- **Role-Based Access Control** - Patient, Pharmacy Owner, Admin roles
- **Password Hashing** - Bcrypt encryption
- **CSRF Protection** - Built-in Laravel protection

## 📄 API Documentation

### Authentication Endpoints
- `POST /api/register` - Register new user
- `POST /api/login` - Login
- `POST /api/logout` - Logout
- `POST /api/forgot-password` - Request password reset
- `POST /api/reset-password` - Reset password

### Patient Endpoints
- `GET /api/pharmacies` - Get all pharmacies
- `GET /api/pharmacies/nearby` - Get nearby pharmacies
- `GET /api/pharmacy/{id}` - Get pharmacy details
- `GET /api/insurances` - Get all insurances

### Pharmacy Owner Endpoints
- `GET /api/pharmacy/my-pharmacy` - Get own pharmacy
- `PUT /api/pharmacy/{id}` - Update pharmacy
- `GET /api/medicines` - Get medicines
- `POST /api/medicines` - Add medicine
- `GET /api/purchases` - Get purchases
- `GET /api/purchases/reports/printable` - Generate report

### Admin Endpoints
- `GET /api/admin/pharmacies` - Get all pharmacies
- `PUT /api/admin/pharmacies/{id}/verify` - Verify pharmacy
- `GET /api/admin/users` - Get all users
- `GET /api/contact-messages` - Get contact messages

## 🌍 Deployment

### Frontend (Vercel)
The frontend is configured for Vercel deployment with `vercel.json`.

### Backend
Deploy to any PHP hosting that supports Laravel 11.

## 📝 License

This project is open-sourced software licensed under the MIT license.

## 👥 Contributors

- Daniel - Full Stack Developer

## 🙏 Acknowledgments

- Laravel Framework
- React Team
- Google Maps Platform
- Tailwind CSS
- All open-source contributors

---

**Built with ❤️ for Rwanda's healthcare community**
