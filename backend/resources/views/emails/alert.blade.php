<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alerte Urgente - Don de Sang</title>
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
            background: linear-gradient(135deg, #e11d48 0%, #9f1239 50%, #be123c 100%);
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
            background-color: #9f1239;
            clip-path: polygon(50% 100%, 0 0, 100% 0);
        }
        .logo {
            background-color: #ffffff;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 15px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: 0.5px;
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

        /* Urgent badge */
        .urgent-badge {
            display: inline-block;
            background-color: #fef2f2;
            border: 2px solid #fca5a5;
            color: #dc2626;
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

        /* Blood type badge */
        .blood-type-section {
            text-align: center;
            margin: 25px 0;
        }
        .blood-type-badge {
            display: inline-block;
            width: 80px;
            height: 80px;
            line-height: 80px;
            border-radius: 50%;
            background: linear-gradient(135deg, #e11d48, #be123c);
            color: #ffffff;
            font-size: 28px;
            font-weight: 800;
            text-align: center;
            box-shadow: 0 8px 25px rgba(225, 29, 72, 0.35);
        }
        .blood-type-label {
            display: block;
            margin-top: 8px;
            font-size: 13px;
            color: #94a3b8;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        /* Info card */
        .info-card {
            background-color: #fff1f2;
            border-left: 4px solid #e11d48;
            padding: 18px 20px;
            border-radius: 0 8px 8px 0;
            margin: 25px 0;
        }
        .info-row {
            display: flex;
            align-items: center;
            margin: 8px 0;
            font-size: 14px;
        }
        .info-icon {
            margin-right: 10px;
            font-size: 18px;
        }
        .info-label {
            font-weight: 600;
            color: #0f172a;
            margin-right: 6px;
        }
        .info-value {
            color: #475569;
        }
        .highlight {
            font-weight: 700;
            color: #be123c;
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
            transition: all 0.3s ease;
        }

        /* Motivation */
        .motivation {
            text-align: center;
            font-size: 15px;
            font-weight: 500;
            color: #334155;
            margin: 25px 0 5px;
            padding: 15px;
            background: #fefce8;
            border-radius: 8px;
            border: 1px solid #fef08a;
        }

        /* Footer */
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
            color: #be123c;
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
            </div>
            <div class="urgent-badge">🚨 Alerte Urgente</div>
            <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Un besoin urgent de don de sang a été signalé</p>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">Bonjour {{ $donor->full_name }},</div>

            <p class="message-text">
                Une alerte urgente pour le groupe sanguin <strong class="highlight">{{ $alert->blood_type }}</strong> vient d'être lancée par l'établissement <strong>{{ $hospital->name }}</strong> situé à proximité de vous.
            </p>

            <!-- Blood Type Badge -->
            <div class="blood-type-section">
                <div class="blood-type-badge">{{ $alert->blood_type }}</div>
                <span class="blood-type-label">Groupe sanguin demandé</span>
            </div>

            <!-- Info Card -->
            <div class="info-card">
                <div class="info-row">
                    <span class="info-icon">🏥</span>
                    <span class="info-label">Établissement :</span>
                    <span class="info-value">{{ $hospital->name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-icon">📍</span>
                    <span class="info-label">Ville :</span>
                    <span class="info-value">{{ $hospital->city }}</span>
                </div>
                @if($alert->urgency_level)
                <div class="info-row">
                    <span class="info-icon">⚡</span>
                    <span class="info-label">Niveau d'urgence :</span>
                    <span class="highlight">{{ $alert->urgency_level }}</span>
                </div>
                @endif
                @if($alert->quantity)
                <div class="info-row">
                    <span class="info-icon">🩸</span>
                    <span class="info-label">Quantité nécessaire :</span>
                    <span class="info-value">{{ $alert->quantity }}</span>
                </div>
                @endif
                @if($alert->description)
                <div class="info-row">
                    <span class="info-icon">📝</span>
                    <span class="info-label">Description :</span>
                    <span class="info-value">{{ $alert->description }}</span>
                </div>
                @endif
                @if($alert->direct_phone)
                <div class="info-row">
                    <span class="info-icon">📞</span>
                    <span class="info-label">Contact direct :</span>
                    <span class="highlight">{{ $alert->direct_phone }}</span>
                </div>
                @endif
            </div>

            <!-- CTA Button -->
            <div class="cta-container">
                <a href="{{ $appUrl }}/UrgentAlerts" class="cta-button">
                    Voir l'alerte
                </a>
            </div>

            <!-- Motivation -->
            <div class="motivation">
                💛 Votre geste noble peut sauver une vie aujourd'hui.<br>
                Chaque don compte !
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Cet email a été envoyé automatiquement par la plateforme <span class="footer-brand">DonSang</span>.</p>
            <p>Merci de faire partie de notre communauté de héros. 🩸</p>
            <p style="margin-top: 10px; font-size: 11px; color: #94a3b8;">© {{ date('Y') }} DonSang — Plateforme de don de sang</p>
        </div>
    </div>
</body>
</html>
