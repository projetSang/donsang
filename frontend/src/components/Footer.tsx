import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();
  const f = t.footer;

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="bg-white p-3 rounded-2xl mb-4 w-fit inline-flex shadow-sm">
              <img src="/logo_sang.png" alt="SangVital Logo" width={130} height={130} className="object-contain" />
            </div>
            <p className="text-sm text-background/60">
              {f.tagline}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">{f.navigation}</h4>
            <ul className="space-y-2 text-sm text-background/60">
              <li><Link to="/" className="hover:text-background transition-colors">{f.home}</Link></li>
              <li><Link to="/UrgentAlerts" className="hover:text-background transition-colors">{f.urgentAlerts}</Link></li>
              <li><Link to="/contact" className="hover:text-background transition-colors">{f.contact}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">{f.legal}</h4>
            <ul className="space-y-2 text-sm text-background/60">
              <li><Link to="/privacy" className="hover:text-background transition-colors">{f.privacy}</Link></li>
              <li><Link to="/terms" className="hover:text-background transition-colors">{f.terms}</Link></li>
              <li><Link to="/data-protection" className="hover:text-background transition-colors">{f.dataProtection}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">{f.contactTitle}</h4>
            <ul className="space-y-2 text-sm text-background/60">
              <li>admin@chu.com</li>
              <li>+212 688996655</li>
              <li>Maroc</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-background/20 mt-8 pt-4 text-center text-sm text-background/40">
          <p>{f.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
