import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="bg-white p-3 rounded-2xl mb-4 w-fit inline-flex shadow-sm">
              <img src="logo_sang.png" alt="SangVital Logo" width={130} height={130} className="object-contain" />
            </div>
            <p className="text-sm text-background/60">
             Donnez votre sang aujourd’hui,  <span className="text-gradient">sauvez des vies</span> demain.</p>
          </div>
          <div> 
            <h4 className="font-semibold mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm text-background/60">
              <li><Link to="/" className="hover:text-background transition-colors">Accueil</Link></li>
              <li><Link to="/UrgentAlerts" className="hover:text-background transition-colors">alertes urgentes</Link></li>
              <li><Link to="/Contact" className="hover:text-background transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Légal</h4>
            <ul className="space-y-2 text-sm text-background/60">
              <li><a href="#" className="hover:text-background transition-colors">Politique de confidentialité</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Conditions d'utilisation</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Protection des données</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-background/60">
              <li>admin@chu.com</li>
              <li>+212 688996655</li>
              <li>Maroc</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-background/20 mt-8 pt-4 text-center text-sm text-background/40">
          <p>© 2026 Donsang — Créé par Aya Asrir & Hassania El-Falah</p>
        </div>
      </div>
    </footer>
  );
}
