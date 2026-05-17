<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisation de votre mot de passe</title>
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
            background: linear-gradient(135deg, #be123c 0%, #e11d48 50%, #f43f5e 100%);
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
            background-color: #e11d48;
            clip-path: polygon(50% 100%, 0 0, 100% 0);
        }
        .logo {
            background-color: #ffffff;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 15px;
            padding: 5px;
            border-radius: 8px;
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
            background: linear-gradient(135deg, #e11d48, #be123c);
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 40px;
            border-radius: 50px;
            font-size: 16px;
            font-weight: 700;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 15px rgba(225, 29, 72, 0.3);
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
            color: #e11d48;
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
            </div><br>
            <div class="welcome-badge">🔑 Mot de passe</div>
            <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Demande de réinitialisation</p>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">Bonjour {{ $name }},</div>

            <p class="message-text">
                Vous recevez cet email car nous avons reçu une demande de réinitialisation de mot de passe pour votre compte sur la plateforme <strong>DonSang</strong>.
            </p>

            <!-- CTA Button -->
            <div class="cta-container">
                <a href="{{ $resetUrl }}" class="cta-button">
                    Réinitialiser mon mot de passe
                </a>
            </div>

            <p class="message-text" style="margin-top: 25px; font-size: 13px; color: #64748b;">
                Ce lien de réinitialisation de mot de passe expirera dans 60 minutes.<br>
                Si vous n'avez pas demandé de réinitialisation de mot de passe, aucune autre action n'est requise de votre part.
            </p>

            <!-- Warning -->
            <div class="warning-box">
                ⚠️ <strong>Sécurité :</strong> Ne partagez jamais cet email ou ce lien avec qui que ce soit.
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
