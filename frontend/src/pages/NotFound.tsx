import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted animate-reveal">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-black text-slate-800">404</h1>
        <p className="mb-6 text-xl text-muted-foreground font-semibold">{t.notFound.title}</p>
        <a 
          href="/" 
          className="bg-primary hover:bg-primary/95 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md inline-block"
        >
          {t.notFound.returnHome}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
