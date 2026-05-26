<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        @ini_set('expose_php', '0');// كيمنع PHP من إظهار version ديالو فـ HTTP headers
        @header_remove('X-Powered-By');// زيادة protection ضد information disclosure

        $response = $next($request);

        $response->headers->remove('X-Powered-By');// كيمنع تسريب معلومات على التكنولوجيا المستعملة (Laravel/PHP version)
        $response->headers->set('Content-Security-Policy', "default-src 'self'; connect-src 'self' http://127.0.0.1:8000 ws://localhost:5173 https://lottie.host https://nominatim.openstreetmap.org; img-src 'self' https://{s}.tile.openstreetmap.org https://lottie.host data:; font-src 'self' https://fonts.gstatic.com https://fonts.bunny.net; style-src 'self' https://fonts.googleapis.com https://fonts.bunny.net; script-src 'self' https://lottie.host; object-src 'none'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; manifest-src 'self'; worker-src 'self';");// كيتحكم فاشنو المصادر المسموح للمتصفح يحمل منها scripts/css/images/fonts...// الهدف: الحماية من XSS و code injection
        $response->headers->set('X-Frame-Options', 'DENY');// منع الموقع يتحل داخل iframe // حماية إضافية ضد clickjacking
        $response->headers->set('X-Content-Type-Options', 'nosniff');// منع المتصفح يخمن MIME type // كيحمي من بعض الهجمات المرتبطة بالملفات
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');// كيتحكم فالمعلومات لي كيتبعتو فـ Referer header // strict-origin-when-cross-origin = يرسل origin فقط فـ requests الخارجية
        $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');// تعطيل بعض browser features الحساسة // هنا منعنا geolocation/microphone/camera
        $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');// يجبر المتصفح يستعمل HTTPS فقط لمدة عام// includeSubDomains = حتى subdomains// preload = قابل للإضافة لـ browser preload lists
        $response->headers->set('X-Permitted-Cross-Domain-Policies', 'none');// منع Adobe Flash / PDF clients من استعمال cross-domain policies// زيادة protection إضافية

        return $response;
    }
}
