import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-xl mb-4">
              <Heart className="h-5 w-5 text-primary fill-primary" />
              <span>SangVital</span>
            </div>
            <p className="text-sm text-background/60">
              Votre dossier médical accessible partout, à tout moment. Sauvez des vies grâce au don de sang.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm text-background/60">
              <li><Link to="/" className="hover:text-background transition-colors">Accueil</Link></li>
              <li><Link to="/fonctionnalites" className="hover:text-background transition-colors">Fonctionnalités</Link></li>
              <li><Link to="/comment-ca-marche" className="hover:text-background transition-colors">Comment ça marche</Link></li>
              <li><Link to="/contact" className="hover:text-background transition-colors">Contact</Link></li>
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
              <li>contact@sangvital.ma</li>
              <li>+212 600 000 000</li>
              <li>Maroc</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-background/20 mt-8 pt-8 text-center text-sm text-background/40">
          <p>© 2026 SangVital — Créé par Aya Asrir & Hassania El-Falah</p>
        </div>
      </div>
    </footer>
  );
}
