<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Confirmation de rendez-vous</title>
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
            padding: 24px;
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
            background-color: #be123c;
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
        .content {
            padding: 40px 30px;
            line-height: 1.6;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 20px;
        }
        .card {
            background-color: #fff1f2;
            border-left: 4px solid #e11d48;
            padding: 20px;
            border-radius: 0 8px 8px 0;
            margin: 25px 0;
        }
        .card p {
            margin: 5px 0;
        }
        .highlight {
            font-weight: 700;
            color: #be123c;
        }
        .button-container {
            text-align: center;
            margin-top: 30px;
        }
        .footer {
            background-color: #f1f5f9;
            padding: 20px;
            text-align: center;
            font-size: 13px;
            color: #64748b;
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="motif-bg"></div>
            <div class="logo">
                <img src="{{ $message->embed(public_path('logo_sangg.png')) }}" alt="logo" width="140" height="80" style=" object-fit: cover;">
            </div>
            <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">Confirmation de Rendez-vous Urgent</p>
        </div>
        
        <div class="content">
            <div class="greeting">Bonjour {{ $patient->full_name }},</div>
            
            <p>Nous vous remercions infiniment pour votre réactivité et votre générosité. Votre disponibilité est cruciale.</p>
            
            <p>Nous vous confirmons votre rendez-vous pour effectuer votre don de sang.</p>
            
            <div class="card">
                <p><strong>Groupe sanguin demandé :</strong> <span class="highlight">{{ $patient->blood_type }}</span></p>
                <p><strong>Lieu :</strong> {{ $hospitalName }}</p>
                <p><strong>Ville :</strong> {{ $hospitalCity }}</p>
                <p><strong>Heure :</strong> Dans les plus brefs délais</p>
            </div>
            
            <p style="text-align: center; font-size: 15px; font-weight: 500; color: #334155;">
                🩸 Votre geste noble peut sauver une vie aujourd'hui.
            </p>
        </div>
        
        <div class="footer">
            <p>Cet email a été envoyé automatiquement par la plateforme DonSang.<br>
            Merci de faire partie de notre communauté de héros.</p>
        </div>
    </div>
</body>
</html>
