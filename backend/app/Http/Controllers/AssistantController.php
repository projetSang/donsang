<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AssistantController extends Controller
{
    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        $userMessage = $request->message;
        $groqApiKey = env('GROQ_API_KEY');

        if (!$groqApiKey) {
            return response()->json([
                'response' => "La clé API Groq n'est pas configurée. Veuillez l'ajouter dans le fichier point env.",
            ]);
        }

        $systemPrompt = "Tu es l'assistant vocal intelligent et empathique de l'application DonSang. " .
            "DonSang est une plateforme web marocaine dédiée au don de sang. " .
            "Elle permet aux hôpitaux de publier des alertes urgentes de besoin de sang, " .
            "aux patients de consulter leur dossier médical partagé, " .
            "et aux donneurs de trouver où donner leur sang et de répondre aux alertes. " .
            "Règles strictes pour tes réponses : " .
            "1. Tes réponses seront lues à voix haute par une voix de synthèse, elles doivent donc être courtes, directes, et conversationnelles (pas de puces, pas de caractères spéciaux comme *, #, etc). " .
            "2. Réponds toujours en français. " .
            "3. Si tu ne connais pas la réponse, propose gentiment de contacter un hôpital via l'application. " .
            "4. Limite ta réponse à 2 ou 3 phrases maximum pour ne pas être trop long à l'oral.";

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $groqApiKey,
                'Content-Type' => 'application/json',
            ])->post('https://api.groq.com/openai/v1/chat/completions', [
                'model' => 'llama-3.3-70b-versatile',
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $userMessage],
                ],
                'temperature' => 0.7,
                'max_tokens' => 150,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $reply = $data['choices'][0]['message']['content'] ?? "Désolé, je n'ai pas pu générer de réponse.";
                
                return response()->json([
                    'response' => $reply,
                ]);
            } else {
                Log::error('Erreur API Groq : ' . $response->body());
                return response()->json([
                    'response' => "Désolé, j'ai rencontré un problème lors de la communication avec le serveur d'intelligence artificielle.",
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Exception API Groq : ' . $e->getMessage());
            return response()->json([
                'response' => "Une erreur inattendue s'est produite. Veuillez réessayer plus tard.",
            ], 500);
        }
    }
}
