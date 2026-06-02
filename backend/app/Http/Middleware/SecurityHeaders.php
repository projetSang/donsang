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

        $response->headers->remove('X-Powered-By');
        $response->headers->remove('Server');
        $response->headers->remove('X-Generator');
        $response->headers->set('Content-Security-Policy', "default-src 'self'; connect-src 'self' http://127.0.0.1:8000 ws://localhost:5173 https://lottie.host https://nominatim.openstreetmap.org https://donsang-w5i5.vercel.app https://backend-production-4a57.up.railway.app; img-src 'self' https://{s}.tile.openstreetmap.org https://lottie.host data:; font-src 'self' https://fonts.gstatic.com https://fonts.bunny.net; style-src 'self' https://fonts.googleapis.com https://fonts.bunny.net; script-src 'self' https://lottie.host; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; manifest-src 'self'; worker-src 'self';");
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');
        $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        $response->headers->set('X-Permitted-Cross-Domain-Policies', 'none');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        // Prevent timestamp disclosure in API responses
        $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        $response->headers->set('Pragma', 'no-cache');

        return $response;
    }
}
