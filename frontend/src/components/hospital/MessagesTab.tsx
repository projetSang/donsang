import { useState, useEffect } from "react";
import { Mail, Clock, User, MessageCircle } from "lucide-react";

export function MessagesTab() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8000/api/hospital/contact-messages")
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching messages:", err);
        setLoading(false);
      });
   },[]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="animate-reveal">

          <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3"><Mail className="h-6 w-6 text-primary" />Messages Reçus</h2>
          <p className="text-slate-500">Consultez les messages de contact des donneurs et partenaires.</p>
        </div>
        </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Chargement des messages...</div>
      ):(
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Nom & Prénom</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Sujet</th>
                  <th className="px-6 py-4 font-semibold">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {messages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {msg.name}
                    </td>
                    <td className="px-6 py-4 text-primary">
                      <a href={`mailto:${msg.email}`} className="hover:underline">{msg.email}</a>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {msg.subject}
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={msg.message}>
                      {msg.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
