<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Reset Your Password - PharmaFind</title>
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
        .reset-button {
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
        .reset-button:hover {
            background-color: #0056b3;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🏥 PharmaFind</div>
            <h2 style="color: #333; margin: 0;">Reset Your Password</h2>
        </div>
        
        <p>Hello,</p>
        
        <p>You are receiving this email because we received a password reset request for your PharmaFind account associated with <strong>{{ $email }}</strong>.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $resetUrl }}" class="reset-button">
                Reset Password
            </a>
        </div>
        
        <div class="warning">
            <strong>⚠️ Important:</strong> This password reset link will expire in 60 minutes for security reasons.
        </div>
        
        <p>If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
        
        <p>For your security, if you continue to receive unwanted password reset emails, please contact our support team.</p>
        
        <div class="footer">
            <p><strong>Trouble clicking the button?</strong></p>
            <p>Copy and paste the URL below into your web browser:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 3px;">
                {{ $resetUrl }}
            </p>
            
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            
            <p style="text-align: center; margin: 0;">
                This email was sent from PharmaFind. If you have any questions, please contact our support team.
            </p>
        </div>
    </div>
</body>
</html>
