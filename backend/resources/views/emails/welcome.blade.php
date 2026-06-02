<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenue - Votre Dossier Médical</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            color: #334155;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: 1px solid #f1f5f9;
        }
        .header {
            background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
            padding: 28px 24px;
            text-align: center;
            color: #ffffff;
            position: relative;
        }
        .header::after {
            content: '';
            position: absolute;
            bottom: -20px;
            left: 50%;
            transform: translateX(-50%);
            width: 40px;
            height: 40px;
            background-color:  #be123c;
            clip-path: polygon(50% 100%, 0 0, 100% 0);
        }
        .logo {
            background-color: #ffffff;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 15px;
        }
        .motif-bg {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            opacity: 0.05;
            background-image: radial-gradient(#ffffff 2px, transparent 2px);
            background-size: 20px 20px;
            pointer-events: none;
        }
        .welcome-badge {
            display: inline-block;
            background-color: rgba(255,255,255,0.15);
            border: 2px solid rgba(255,255,255,0.3);
            color: #ffffff;
            padding: 6px 18px;
            border-radius: 50px;
            font-size: 14px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-bottom: 10px;
        }
        .content {
            padding: 40px 30px 30px;
            line-height: 1.7;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 20px;
        }
        .message-text {
            font-size: 15px;
            color: #475569;
            margin-bottom: 25px;
        }

        /* Credentials card */
        .credentials-card {
            background: linear-gradient(135deg, #fdf0f0ff, #fdececff);
            border: 2px solid #e11d48;
            padding: 24px;
            border-radius: 12px;
            margin: 25px 0;
            text-align: center;
        }
        .credentials-title {
            font-size: 14px;
            font-weight: 700;
            color: #5f0606ff;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
        }
        .credential-item {
            background: #ffffff;
            border: 1px solid #fad4d1ff;
            border-radius: 8px;
            padding: 12px 16px;
            margin: 10px 0;
            text-align: left;
        }
        .credential-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
        }
        .credential-value {
            font-size: 16px;
            color: #0f172a;
            font-weight: 700;
            margin-top: 4px;
            font-family: 'Courier New', monospace;
            letter-spacing: 0.5px;
        }

        /* Warning box */
        .warning-box {
            background-color: #fffbeb;
            border: 1px solid #fde68a;
            border-left: 4px solid #f59e0b;
            padding: 14px 18px;
            border-radius: 0 8px 8px 0;
            font-size: 13px;
            color: #92400e;
            margin: 20px 0;
        }

        /* CTA button */
        .cta-container {
            text-align: center;
            margin: 30px 0 10px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #960505ff, #780404ff);
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 40px;
            border-radius: 50px;
            font-size: 16px;
            font-weight: 700;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 15px rgba(150, 15, 5, 0.3);
        }

        .footer {
            background-color: #f1f5f9;
            padding: 20px;
            text-align: center;
            font-size: 13px;
            color: #64748b;
        }
        .footer p {
            margin: 5px 0;
        }
        .footer-brand {
            font-weight: 600;
            color: #960505ff;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="motif-bg"></div>
            <div class="logo">
                <img src="{{ $message->embed(public_path('logo_sangg.png')) }}" alt="DonSang" width="140" height="80" style="object-fit: cover;">
            </div><br/>
            <div class="welcome-badge">✅ Bienvenue</div>
            <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Votre dossier médical a été créé avec succès</p>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">Bonjour {{ $donor->full_name }},</div>

            <p class="message-text">
                Nous sommes heureux de vous informer que votre dossier médical a été créé avec succès sur la plateforme <strong>DonSang</strong>. Voici vos identifiants de connexion :
            </p>

            <!-- Credentials Card -->
            <div class="credentials-card">
                <div class="credentials-title">🔐 Vos identifiants de connexion</div>
                <div class="credential-item">
                    <div class="credential-label">📧 Email</div>
                    <div class="credential-value">{{ $donor->email }}</div>
                </div>
                <div class="credential-item">
                    <div class="credential-label">🔑 Mot de passe</div>
                    <div class="credential-value">{{ $password }}</div>
                </div>
            </div>

            <!-- Warning -->
            <div class="warning-box">
                ⚠️ <strong>Important :</strong> Pour votre sécurité, nous vous recommandons de changer votre mot de passe dès votre première connexion.
            </div>

            <!-- CTA Button -->
            <div class="cta-container">
                <a href="{{ $appUrl }}/login" class="cta-button">
                    Se connecter
                </a>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Cet email a été envoyé automatiquement par la plateforme <span class="footer-brand">DonSang</span>.</p>
            <p>Merci de faire partie de notre communauté. 🩸</p>
            <p style="margin-top: 10px; font-size: 11px; color: #94a3b8;">© {{ date('Y') }} DonSang — Plateforme de don de sang</p>
        </div>
    </div>
</body>
</html>
