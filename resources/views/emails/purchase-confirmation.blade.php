<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Purchase Confirmation - PharmaFind</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .email-container {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 30px 20px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #2c3e50;
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 20px;
        }
        .status-created {
            background-color: #d4edda;
            color: #155724;
        }
        .status-updated {
            background-color: #fff3cd;
            color: #856404;
        }
        .status-cancelled {
            background-color: #f8d7da;
            color: #721c24;
        }
        .purchase-info {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .info-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        .info-label {
            font-weight: 600;
            color: #495057;
        }
        .info-value {
            color: #212529;
        }
        .pharmacy-info {
            background-color: #e3f2fd;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .pharmacy-name {
            font-size: 20px;
            font-weight: 600;
            color: #1976d2;
            margin-bottom: 10px;
        }
        .pharmacy-details {
            color: #424242;
        }
        .items-section {
            margin: 20px 0;
        }
        .items-title {
            font-size: 18px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 15px;
        }
        .item {
            background-color: #ffffff;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
        }
        .item-name {
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        .item-details {
            display: flex;
            justify-content: space-between;
            color: #6c757d;
            font-size: 14px;
        }
        .total-section {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 16px;
        }
        .total-row.final {
            font-size: 18px;
            font-weight: 600;
            color: #2c3e50;
            border-top: 2px solid #dee2e6;
            padding-top: 10px;
            margin-top: 15px;
        }
        .cta-section {
            text-align: center;
            margin: 30px 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-weight: 600;
            font-size: 16px;
            margin: 10px;
        }
        .cta-button:hover {
            opacity: 0.9;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
        }
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        .divider {
            height: 1px;
            background-color: #e9ecef;
            margin: 20px 0;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .content {
                padding: 20px 15px;
            }
            .info-row {
                flex-direction: column;
            }
            .info-value {
                margin-top: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1>🏥 PharmaFind</h1>
            <p>Your Health, Our Priority</p>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">
                Hello {{ $user->name }}! 👋
            </div>

            @if($type === 'purchase_created')
                <div class="status-badge status-created">
                    ✅ Purchase Confirmed
                </div>
                <p>Great news! Your medicine purchase has been successfully confirmed. Here are the details of your order:</p>
            @elseif($type === 'purchase_updated')
                <div class="status-badge status-updated">
                    📝 Purchase Updated
                </div>
                <p>Your purchase has been updated. Please review the new details below:</p>
            @elseif($type === 'purchase_cancelled')
                <div class="status-badge status-cancelled">
                    ❌ Purchase Cancelled
                </div>
                <p>Your purchase has been cancelled. If you have any questions, please contact the pharmacy directly.</p>
            @endif

            <!-- Purchase Information -->
            <div class="purchase-info">
                <div class="info-row">
                    <span class="info-label">Purchase Number:</span>
                    <span class="info-value"><strong>{{ $purchase->purchase_number }}</strong></span>
                </div>
                <div class="info-row">
                    <span class="info-label">Purchase Date:</span>
                    <span class="info-value">{{ $purchase->purchase_date->format('M d, Y g:i A') }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Payment Status:</span>
                    <span class="info-value">
                        @if($purchase->payment_status === 'paid')
                            ✅ Paid
                        @elseif($purchase->payment_status === 'pending')
                            ⏳ Pending
                        @elseif($purchase->payment_status === 'partially_paid')
                            🔄 Partially Paid
                        @else
                            ❌ {{ ucfirst(str_replace('_', ' ', $purchase->payment_status)) }}
                        @endif
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Payment Method:</span>
                    <span class="info-value">{{ ucfirst(str_replace('_', ' ', $purchase->payment_method)) }}</span>
                </div>
            </div>

            <!-- Pharmacy Information -->
            <div class="pharmacy-info">
                <div class="pharmacy-name">🏥 {{ $pharmacy->pharmacy_name }}</div>
                <div class="pharmacy-details">
                    <p><strong>📍 Location:</strong> {{ $pharmacy->location ?? 'Not specified' }}</p>
                    @if($pharmacy->phone_number)
                        <p><strong>📞 Phone:</strong> {{ $pharmacy->phone_number }}</p>
                    @endif
                    @if($pharmacy->email)
                        <p><strong>📧 Email:</strong> {{ $pharmacy->email }}</p>
                    @endif
                </div>
            </div>

            <!-- Purchase Items -->
            <div class="items-section">
                <div class="items-title">💊 Purchased Medicines</div>
                @foreach($purchase->purchaseItems as $item)
                    <div class="item">
                        <div class="item-name">{{ $item->medicine->name ?? 'Unknown Medicine' }}</div>
                        <div class="item-details">
                            <span>Quantity: {{ $item->quantity }}</span>
                            <span>Unit Price: RWF {{ number_format($item->unit_price, 0) }}</span>
                            <span><strong>Total: RWF {{ number_format($item->total_price, 0) }}</strong></span>
                        </div>
                    </div>
                @endforeach
            </div>

            <!-- Total Section -->
            <div class="total-section">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>RWF {{ number_format($purchase->total_amount, 0) }}</span>
                </div>
                @if($purchase->insurance_coverage > 0)
                    <div class="total-row">
                        <span>Insurance Coverage:</span>
                        <span style="color: #28a745;">- RWF {{ number_format($purchase->insurance_coverage, 0) }}</span>
                    </div>
                    @if($purchase->insurance)
                        <div class="total-row">
                            <span>Insurance Provider:</span>
                            <span>{{ $purchase->insurance->name }}</span>
                        </div>
                    @endif
                @endif
                <div class="total-row final">
                    <span>Amount to Pay:</span>
                    <span>RWF {{ number_format($purchase->patient_payment, 0) }}</span>
                </div>
            </div>

            @if($type !== 'purchase_cancelled')
                <!-- Call to Action -->
                <div class="cta-section">
                    <a href="{{ $purchaseUrl }}" class="cta-button">View Purchase Details</a>
                    <a href="{{ $pharmacyUrl }}" class="cta-button">Visit Pharmacy</a>
                </div>
            @endif

            @if($purchase->notes)
                <div class="divider"></div>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px;">
                    <strong>📝 Notes:</strong><br>
                    {{ $purchase->notes }}
                </div>
            @endif

            <div class="divider"></div>
            
            <p style="text-align: center; color: #6c757d; font-size: 14px;">
                <strong>Thank you for choosing PharmaFind!</strong><br>
                If you have any questions about your purchase, please don't hesitate to contact the pharmacy or our support team.
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>
                <strong>PharmaFind</strong> - Your trusted healthcare partner<br>
                <a href="{{ config('app.frontend_url', 'http://localhost:5173') }}">Visit our website</a> | 
                <a href="mailto:support@pharmafind.com">Contact Support</a>
            </p>
            <p style="margin-top: 15px; font-size: 12px; color: #adb5bd;">
                This email was sent to {{ $user->email }}. If you didn't make this purchase, please contact us immediately.
            </p>
        </div>
    </div>
</body>
</html>
