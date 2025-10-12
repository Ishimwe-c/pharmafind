# New Features Implementation - PharmaFind

## Overview
This document outlines the implementation of new features for the PharmaFind pharmacy management system, including medicine management, patient insurance registration, insurance match notifications, and purchase tracking.

## 🏗️ Database Schema Changes

### New Tables Created

#### 1. `medicines` Table
- **Purpose**: Store medicine inventory for each pharmacy
- **Key Fields**:
  - `pharmacy_id` (Foreign Key)
  - `name` - Medicine name
  - `price` - Unit price
  - `stock_quantity` - Available quantity
  - `category` - Medicine category
  - `description` - Detailed description
  - `manufacturer` - Medicine manufacturer
  - `dosage_form` - Tablet, syrup, injection, etc.
  - `strength` - Dosage strength (500mg, 10ml, etc.)
  - `requires_prescription` - Boolean flag
  - `is_active` - Status flag

#### 2. `insurance_patient` Table (Pivot Table)
- **Purpose**: Manage patient insurance relationships
- **Key Fields**:
  - `user_id` (Foreign Key) - Patient
  - `insurance_id` (Foreign Key) - Insurance provider
  - `policy_number` - Patient's policy number
  - `member_id` - Insurance member ID
  - `coverage_start_date` - Coverage start date
  - `coverage_end_date` - Coverage end date
  - `is_active` - Active status
  - `notes` - Additional notes

#### 3. `purchases` Table
- **Purpose**: Track medicine purchases
- **Key Fields**:
  - `pharmacy_id` (Foreign Key)
  - `user_id` (Foreign Key) - Patient
  - `insurance_id` (Foreign Key) - Insurance used
  - `purchase_number` - Unique purchase identifier
  - `total_amount` - Total purchase amount
  - `insurance_coverage` - Amount covered by insurance
  - `patient_payment` - Amount paid by patient
  - `payment_status` - pending, paid, partially_paid, cancelled
  - `payment_method` - cash, insurance, mixed
  - `purchase_date` - Date of purchase

#### 4. `purchase_items` Table
- **Purpose**: Individual items in each purchase
- **Key Fields**:
  - `purchase_id` (Foreign Key)
  - `medicine_id` (Foreign Key)
  - `quantity` - Quantity purchased
  - `unit_price` - Price at time of purchase
  - `total_price` - Quantity × unit_price
  - `insurance_coverage_amount` - Insurance coverage for this item
  - `patient_payment_amount` - Patient payment for this item

## 🔧 Models and Relationships

### New Models Created

#### 1. `Medicine` Model
- **Relationships**:
  - `belongsTo(Pharmacy::class)`
  - `hasMany(PurchaseItem::class)`
- **Scopes**:
  - `active()` - Active medicines only
  - `inStock()` - Medicines with stock > 0
  - `byCategory($category)` - Filter by category
- **Methods**:
  - `isInStock()` - Check if medicine is in stock
  - `reduceStock($quantity)` - Reduce stock quantity

#### 2. `Purchase` Model
- **Relationships**:
  - `belongsTo(Pharmacy::class)`
  - `belongsTo(User::class)` - Patient
  - `belongsTo(Insurance::class)`
  - `hasMany(PurchaseItem::class)`
- **Scopes**:
  - `byPharmacy($pharmacyId)`
  - `byPatient($userId)`
  - `byInsurance($insuranceId)`
  - `byPaymentStatus($status)`
  - `byDateRange($startDate, $endDate)`
- **Methods**:
  - `generatePurchaseNumber()` - Generate unique purchase number
  - `calculateTotals()` - Calculate totals from purchase items

#### 3. `PurchaseItem` Model
- **Relationships**:
  - `belongsTo(Purchase::class)`
  - `belongsTo(Medicine::class)`
- **Methods**:
  - `calculateTotalPrice()` - Calculate total price
  - `calculatePaymentAmounts($insuranceCoveragePercentage)` - Calculate insurance and patient payments

### Updated Existing Models

#### 1. `Pharmacy` Model
- **New Relationships**:
  - `hasMany(Medicine::class)`
  - `hasMany(Purchase::class)`

#### 2. `Insurance` Model
- **New Relationships**:
  - `belongsToMany(User::class, 'insurance_patient')` - Patients using this insurance
  - `hasMany(Purchase::class)`

#### 3. `User` Model
- **New Relationships**:
  - `belongsToMany(Insurance::class, 'insurance_patient')` - User's insurances
  - `hasMany(Purchase::class)` - User's purchases

## 🚀 API Endpoints

### Medicine Management
```
GET    /api/medicines                    - List medicines (with filters)
POST   /api/medicines                    - Create new medicine
GET    /api/medicines/{id}               - Get specific medicine
PUT    /api/medicines/{id}               - Update medicine
DELETE /api/medicines/{id}               - Delete medicine
GET    /api/medicines/categories         - Get medicine categories
POST   /api/medicines/{id}/stock         - Update stock quantity
```

### Patient Insurance Management
```
GET    /api/patient-insurances           - List user's insurances
POST   /api/patient-insurances           - Add new insurance
GET    /api/patient-insurances/available - Get available insurances
GET    /api/patient-insurances/{id}      - Get specific insurance
PUT    /api/patient-insurances/{id}      - Update insurance
DELETE /api/patient-insurances/{id}      - Remove insurance
POST   /api/patient-insurances/check-coverage/{pharmacyId} - Check coverage
```

### Purchase Management
```
GET    /api/purchases                    - List purchases
POST   /api/purchases                    - Create new purchase
GET    /api/purchases/{id}               - Get specific purchase
PUT    /api/purchases/{id}               - Update purchase
DELETE /api/purchases/{id}               - Delete purchase
GET    /api/purchases/reports/pharmacy   - Pharmacy reports
GET    /api/purchases/reports/insurance  - Insurance reports
```

### Notifications
```
GET    /api/notifications                - List user notifications
POST   /api/notifications/mark-read/{id} - Mark notification as read
POST   /api/notifications/mark-all-read  - Mark all as read
DELETE /api/notifications/{id}           - Delete notification
```

### Insurance Match Alert
```
POST   /api/check-insurance-match        - Check for nearby pharmacies with matching insurance
```

## 🔔 Notification System

### Insurance Match Alert Notification
- **Trigger**: When patient is near a pharmacy that accepts their insurance
- **Channels**: Database notifications, Email
- **Data Included**:
  - Pharmacy information
  - Insurance information
  - Distance from patient
  - Action URL

### InsuranceMatchService
- **Purpose**: Handle insurance matching logic
- **Key Methods**:
  - `checkInsuranceMatches($user, $latitude, $longitude, $radiusKm)` - Check for matches
  - `findNearbyPharmacies($latitude, $longitude, $radiusKm)` - Find nearby pharmacies
  - `calculateDistance($lat1, $lon1, $lat2, $lon2)` - Calculate distance using Haversine formula
  - `getPharmaciesForUserInsurance($user, $latitude, $longitude, $radiusKm)` - Get pharmacies for user's insurance

## 📊 Features Implemented

### 1. Pharmacy Medicine Management ✅
- Pharmacies can register medicines with:
  - Medicine name, price, stock quantity
  - Category and description
  - Manufacturer, dosage form, strength
  - Prescription requirement flag
- Stock management with add/subtract/set operations
- Medicine categorization and search functionality
- Authorization: Only pharmacy owners can manage their medicines

### 2. Patient Insurance Registration ✅
- Patients can add and manage multiple insurance types
- Insurance information includes:
  - Policy number and member ID
  - Coverage dates
  - Active status
  - Notes
- Check insurance coverage for specific pharmacies
- View available insurances not yet registered

### 3. Insurance Match Alert Notifications ✅
- Real-time notifications when patient is near pharmacy with matching insurance
- GPS-based location checking with configurable radius
- Distance calculation using Haversine formula
- Multiple notification channels (database, email)
- Notification includes pharmacy details and distance

### 4. Medicine Purchase & Reporting ✅
- Complete purchase tracking system
- Purchase items with individual medicine details
- Insurance coverage calculation
- Payment status tracking (pending, paid, partially_paid, cancelled)
- Payment methods (cash, insurance, mixed)
- Purchase reports filtered by:
  - Pharmacy
  - Insurance
  - Date range
  - Payment status

## 🗄️ Sample Data

### Medicine Seeder
- Created sample medicines across different categories:
  - Pain Relief (Paracetamol, Ibuprofen)
  - Antibiotics (Amoxicillin)
  - Anti-inflammatory drugs
  - Gastrointestinal medications
  - Antihistamines
  - Diabetes medications
  - Cardiovascular drugs
  - Vitamins and supplements
  - Cough & cold medications
- Each pharmacy gets 3-7 random medicines with varied stock and prices

## 🔐 Security & Authorization

### Medicine Management
- Only pharmacy owners can add/edit/delete medicines in their pharmacy
- Stock updates require pharmacy ownership verification

### Insurance Management
- Users can only manage their own insurance information
- Admins can view any user's insurance information
- Insurance coverage checks are user-specific

### Purchase Management
- Users can only view their own purchases
- Pharmacy owners can view purchases from their pharmacy
- Purchase creation requires valid pharmacy and medicine ownership

## 🚀 Usage Examples

### Adding a Medicine
```bash
POST /api/medicines
{
  "pharmacy_id": 1,
  "name": "Paracetamol 500mg",
  "price": 500,
  "stock_quantity": 100,
  "category": "Pain Relief",
  "description": "Pain reliever and fever reducer",
  "manufacturer": "PharmaCorp",
  "dosage_form": "Tablet",
  "strength": "500mg",
  "requires_prescription": false
}
```

### Adding Patient Insurance
```bash
POST /api/patient-insurances
{
  "insurance_id": 1,
  "policy_number": "POL123456",
  "member_id": "MEM789",
  "coverage_start_date": "2024-01-01",
  "coverage_end_date": "2024-12-31",
  "notes": "Primary insurance"
}
```

### Checking Insurance Match
```bash
POST /api/check-insurance-match
{
  "latitude": -1.9441,
  "longitude": 30.0619,
  "radius_km": 5
}
```

### Creating a Purchase
```bash
POST /api/purchases
{
  "pharmacy_id": 1,
  "insurance_id": 1,
  "purchase_items": [
    {
      "medicine_id": 1,
      "quantity": 2,
      "unit_price": 500
    }
  ],
  "payment_method": "insurance",
  "notes": "Regular prescription refill"
}
```

## 🔄 Next Steps for Frontend Integration

1. **Medicine Management UI**
   - Medicine inventory dashboard for pharmacies
   - Add/edit medicine forms
   - Stock management interface
   - Medicine search and filtering

2. **Patient Insurance UI**
   - Insurance registration form
   - Insurance management dashboard
   - Coverage checker interface

3. **Purchase Management UI**
   - Purchase creation interface
   - Purchase history view
   - Reporting dashboard

4. **Notification System UI**
   - Notification center
   - Real-time notification display
   - Insurance match alerts

5. **Location Services Integration**
   - GPS location detection
   - Automatic insurance match checking
   - Nearby pharmacy display

## 📝 Technical Notes

- All new tables include proper indexing for performance
- Foreign key constraints ensure data integrity
- Soft deletes are supported where appropriate
- Comprehensive validation on all API endpoints
- Error handling with meaningful messages
- Pagination support for list endpoints
- Search and filtering capabilities
- Authorization middleware for security

## 🎯 Benefits

1. **For Pharmacies**:
   - Complete medicine inventory management
   - Purchase tracking and reporting
   - Insurance coverage verification
   - Stock management tools

2. **For Patients**:
   - Insurance management
   - Automatic pharmacy discovery
   - Purchase history tracking
   - Real-time insurance match notifications

3. **For System**:
   - Comprehensive data tracking
   - Detailed reporting capabilities
   - Scalable notification system
   - Secure and authorized access

This implementation provides a solid foundation for the new features while maintaining the existing system's integrity and performance.




