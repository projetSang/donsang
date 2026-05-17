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
            'language' => 'nullable|string',
        ]);

        $userMessage = $request->message;
        $language = $request->language ?? 'fr-FR';
        $groqApiKey = env('GROQ_API_KEY');

        if (!$groqApiKey) {
            return response()->json([
                'response' => "La clé API Groq n'est pas configurée. Veuillez l'ajouter dans le fichier point env.",
            ]);
        }

        $langInstruction = "";
        if ($language === 'en-US') {
            $langInstruction = "L'utilisateur a sélectionné l'Anglais. Tu DOIS ABSOLUMENT répondre en Anglais.";
        } elseif ($language === 'ar-MA') {
            $langInstruction = "L'utilisateur a sélectionné l'Arabe (Darija). Tu DOIS ABSOLUMENT répondre en Arabe (Darija ou classique).";
        } else {
            $langInstruction = "L'utilisateur a sélectionné le Français. Tu DOIS ABSOLUMENT répondre en Français.";
        }

        $systemPrompt = "Tu es 'Robo-DonSang', l'assistant vocal intelligent et empathique de l'application marocaine DonSang. " .
            "Ton rôle est de répondre aux questions sur le don de sang et sur le fonctionnement du site. " .
            "INFORMATIONS SUR LE SITE : " .
            "- DonSang connecte hôpitaux, donneurs et patients. Les hôpitaux publient des alertes urgentes, les donneurs peuvent y répondre pour sauver des vies, et les patients ont accès à leur dossier médical en ligne. " .
            "- Le site contient les sections : Accueil, Alertes Urgentes, Contact, et un espace Patient/Hôpital. " .
            "INFORMATIONS SUR LE DON DE SANG : " .
            "- Conditions : Être en bonne santé, avoir entre 18 et 60 ans, et peser au moins 50 kg. Ne pas être à jeun avant le don. " .
            "- Fréquence : Les hommes peuvent donner tous les 2 mois (max 6 fois/an), les femmes (max 4 fois/an). " .
            "- Importance : Un seul don prend environ 10 minutes, prélève 450ml de sang (qui se régénère très vite) et peut sauver jusqu'à 3 vies. " .
            "- Groupes sanguins : O négatif (O-) est le donneur universel (peut donner à tout le monde). AB positif (AB+) est le receveur universel. " .
            "RÈGLES STRICTES POUR TES RÉPONSES : " .
            "1. Tes réponses seront lues à voix haute par une voix robotique. Elles doivent être courtes, fluides et naturelles (PAS de puces, PAS de tirets, PAS de symboles comme * ou #). Fais des phrases complètes. " .
            "2. $langInstruction " .
            "3. Si la question est hors sujet (pas sur le sang, la santé ou l'application), recadre poliment la conversation vers le don de sang. " .
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
