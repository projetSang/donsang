import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  MessageSquare, Mail, Phone, Clock, User, ChevronDown, ChevronUp, Inbox
} from "lucide-react";

export function MessagesTab() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://backend-production-4a57.up.railway.app/api/hospital/contact-messages?type=user")
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching messages:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6 animate-reveal">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-primary" />
          Messages Reçus
        </h1>
        <p className="text-slate-500 mt-1">
          Messages envoyés par les utilisateurs et donneurs via le formulaire de contact.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
          <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center">
            <Inbox className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{messages.length}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total messages</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
          <div className="h-11 w-11 rounded-xl bg-amber-50 flex items-center justify-center">
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{messages.filter(m => m.status === 'pending').length}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">En attente</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Mail className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {messages.filter(m => {
                const d = new Date(m.created_at);
                const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ce mois</div>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        {loading ? (
          <div className="text-center py-12">
            <MessageSquare className="h-8 w-8 text-slate-200 mx-auto mb-3 animate-pulse" />
            <p className="text-slate-400 text-sm">Chargement des messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16">
            <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Inbox className="h-8 w-8 text-slate-300" />
            </div>
            <h4 className="text-slate-900 font-bold text-lg">Aucun message</h4>
            <p className="text-slate-500 max-w-xs mx-auto mt-2 text-sm">
              Vous n'avez reçu aucun message pour le moment.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-xl border transition-all ${
                  expandedId === msg.id ? 'border-primary/30 shadow-md' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                {/* Collapsed Header */}
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/50 rounded-xl transition-colors text-left"
                  onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)}
                  aria-expanded={expandedId === msg.id}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-sm truncate">{msg.name}</div>
                      <div className="text-xs text-slate-500 truncate">
                        {msg.subject || "Message général"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      msg.status === 'pending'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {msg.status === 'pending' ? 'Nouveau' : 'Lu'}
                    </span>
                    <span className="text-xs text-slate-400 hidden sm:block">
                      {new Date(msg.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>
                    {expandedId === msg.id
                      ? <ChevronUp className="h-4 w-4 text-slate-400" />
                      : <ChevronDown className="h-4 w-4 text-slate-400" />
                    }
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedId === msg.id && (
                  <div className="px-4 pb-5 border-t border-slate-100 pt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <a href={`mailto:${msg.email}`} className="text-primary hover:underline font-medium">{msg.email}</a>
                      </div>
                      {msg.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <a href={`tel:${msg.phone}`} className="text-slate-700 hover:text-primary font-medium">{msg.phone}</a>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock className="h-4 w-4 text-slate-400" />
                        {new Date(msg.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>

                    {/* Message body */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Message</p>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg gap-1.5 h-9 border-slate-200 hover:border-primary hover:text-primary"
                        onClick={() => globalThis.location.href = `mailto:${msg.email}?subject=Re: ${msg.subject || 'Votre message'}`}
                      >
                        <Mail className="h-3.5 w-3.5" /> Répondre par email
                      </Button>
                      {msg.phone && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg gap-1.5 h-9 border-slate-200 hover:border-emerald-500 hover:text-emerald-600"
                          onClick={() => globalThis.location.href = `tel:${msg.phone}`}
                        >
                          <Phone className="h-3.5 w-3.5" /> Appeler
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
