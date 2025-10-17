<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Pharmacy Found - Your Insurance is Accepted!</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 10px;
        }
        .success-badge {
            background-color: #d4edda;
            color: #155724;
            padding: 10px 20px;
            border-radius: 20px;
            display: inline-block;
            font-weight: bold;
            margin-bottom: 20px;
        }
        .pharmacy-card {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .pharmacy-name {
            font-size: 20px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 10px;
        }
        .pharmacy-details {
            color: #666;
            margin-bottom: 5px;
        }
        .distance-badge {
            background-color: #007bff;
            color: white;
            padding: 5px 15px;
            border-radius: 15px;
            font-size: 14px;
            display: inline-block;
            margin-top: 10px;
        }
        .insurance-badge {
            background-color: #28a745;
            color: white;
            padding: 5px 15px;
            border-radius: 15px;
            font-size: 14px;
            display: inline-block;
            margin: 10px 5px 0 0;
        }
        .action-button {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
            transition: background-color 0.3s;
        }
        .action-button:hover {
            background-color: #0056b3;
        }
        .benefits {
            background-color: #e7f3ff;
            border-left: 4px solid #007bff;
            padding: 15px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
        }
        .map-link {
            color: #007bff;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🏥 PharmaFind</div>
            <div class="success-badge">✅ Insurance Match Found!</div>
        </div>
        
        <h2 style="color: #333; margin: 0 0 20px 0;">Great News, {{ $user->name }}!</h2>
        
        <p>We found a pharmacy near you that accepts your <strong>{{ $insurance->name }}</strong> insurance!</p>
        
        <div class="pharmacy-card">
            <div class="pharmacy-name">🏥 {{ $pharmacy->pharmacy_name }}</div>
            <div class="pharmacy-details">
                📍 <strong>Location:</strong> {{ $pharmacy->location }}
            </div>
            @if($pharmacy->phone_number)
            <div class="pharmacy-details">
                📞 <strong>Phone:</strong> {{ $pharmacy->phone_number }}
            </div>
            @endif
            @if($pharmacy->email)
            <div class="pharmacy-details">
                ✉️ <strong>Email:</strong> {{ $pharmacy->email }}
            </div>
            @endif
            
            @if($distance)
            <div class="distance-badge">📍 {{ round($distance, 1) }} km away</div>
            @endif
            
            <div class="insurance-badge">✅ {{ $insurance->name }} Accepted</div>
        </div>
        
        <div class="benefits">
            <h3 style="margin-top: 0; color: #007bff;">💡 What this means for you:</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>You can purchase medicines with your insurance coverage</li>
                <li>Save money on your prescription costs</li>
                <li>Convenient location near your current position</li>
                <li>Verified pharmacy with quality assurance</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $pharmacyUrl }}" class="action-button">
                View Pharmacy Details
            </a>
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
            <a href="https://maps.google.com/?q={{ urlencode($pharmacy->location) }}" class="map-link" target="_blank">
                📍 Open in Google Maps
            </a>
        </div>
        
        <div class="footer">
            <p><strong>💡 Pro Tip:</strong> You can also check the pharmacy's working hours and available medicines on our platform.</p>
            
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            
            <p style="text-align: center; margin: 0;">
                This notification was sent because you're near a pharmacy that accepts your insurance.<br>
                <strong>PharmaFind</strong> - Your trusted pharmacy finder platform.
            </p>
        </div>
    </div>
</body>
</html>
