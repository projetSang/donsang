import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Mic } from 'lucide-react';
import { Button } from './button';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const VoiceAssistant: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'fr-FR';
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        handleSendVoiceMessage(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        setIsProcessing(false);
        
        if (event.error === 'network') {
            setErrorMsg("Erreur réseau (vérifiez http://127.0.0.1:5173)");
        } else {
            setErrorMsg(`Erreur : ${event.error}`);
        }
        setTimeout(() => setErrorMsg(null), 5000);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, []);

  const handleSendVoiceMessage = async (message: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('http://localhost:8000/api/assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        const data = await response.json();
        speakResponse(data.response);
      } else {
        speakResponse("Désolé, je rencontre un problème de connexion avec le serveur.");
      }
    } catch (error) {
      console.error('Error sending message to backend:', error);
      speakResponse("Désolé, une erreur s'est produite lors de la communication.");
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = (text: string) => {
    if (!synthesisRef.current) return;
    
    synthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthesisRef.current.speak(utterance);
  };

  const toggleListening = () => {
    if (isSpeaking) {
      synthesisRef.current?.cancel();
      setIsSpeaking(false);
      return;
    }

    setErrorMsg(null);

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error("Microphone start error:", e);
        }
      } else {
        alert("La reconnaissance vocale n'est pas supportée par votre navigateur.");
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {(isListening || isProcessing || isSpeaking) && (
        <div className="bg-white/90 backdrop-blur shadow-lg rounded-full px-4 py-2 text-sm font-medium animate-in fade-in slide-in-from-right-5 border border-red-100 flex items-center gap-2">
          {isListening && (
            <>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-red-600">Je vous écoute...</span>
            </>
          )}
          {isProcessing && (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-red-500" />
              <span className="text-gray-600">Je réfléchis...</span>
            </>
          )}
          {isSpeaking && (
            <>
              <div className="flex gap-1 h-3 items-center">
                <div className="w-1 h-2 bg-blue-500 rounded animate-bounce"></div>
                <div className="w-1 h-3 bg-blue-500 rounded animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-2 bg-blue-500 rounded animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-gray-800 font-semibold">Robo-DonSang parle...</span>
            </>
          )}
        </div>
      )}
      
      {errorMsg && (
        <div className="bg-red-50 text-red-600 border border-red-200 shadow-lg rounded-full px-4 py-2 text-sm font-medium animate-in fade-in slide-in-from-right-5">
          {errorMsg}
        </div>
      )}

      {/* Main Action Button - Doctor Avatar */}
      <Button
        size="icon"
        onClick={toggleListening}
        className={`h-20 w-20 rounded-full shadow-2xl transition-all duration-300 p-0 border-4 relative overflow-hidden group ${
          isListening 
            ? 'border-red-500 ring-4 ring-red-200 scale-110' 
            : isSpeaking
            ? 'border-blue-500 ring-4 ring-blue-200 animate-bounce'
            : 'border-white hover:border-red-400 hover:scale-105'
        }`}
        disabled={isProcessing}
      >
        {isListening && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1.5 shadow z-10">
             <Mic className="w-3 h-3 animate-pulse" />
          </span>
        )}
        
        {isProcessing && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          </div>
        )}
        
        <img 
          src="/doctor-bot.png" 
          alt="Assistant Docteur" 
          className={`w-full h-full object-cover transition-all duration-300 ${
            isListening ? 'scale-110' : 'group-hover:scale-110'
          }`} 
        />
      </Button>
    </div>
  );
};

export default VoiceAssistant;
