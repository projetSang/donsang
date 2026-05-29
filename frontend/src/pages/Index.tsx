import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Heart, Droplets, Bell, Users, Search, Shield, FileText, Share2, UserPlus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const STEP_ICONS = [UserPlus, Droplets, Bell, Users];
const FEATURE_ICONS = [Droplets, Search, Users, Bell, Shield, Heart];
const BENEFIT_ICONS = [Heart, Shield, Users];

export default function Index() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    fetch("https://backend-production-4a57.up.railway.app/api/hospital/alerts")
      .then(res => res.json())
      .then(data => {
        const activeAlerts = data.filter((a: any) => a.status === "Active");
        setAlerts(activeAlerts);
      })
      .catch(err => console.error("Error fetching alerts on index:", err));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative min-h-[80vh] flex items-center justify-center lg:justify-start overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/Don du sang _ les réserves sont au plus bas.jpeg"
            alt="Hero background"
            className="w-full h-full object-cover scale-[1.1] object-[center_30%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/30 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60"></div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-24 pb-12 md:pt-32 md:pb-20">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-100 backdrop-blur-sm border border-red-500/30 text-sm font-semibold px-6 py-2.5 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />
              {t.hero.badge}
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.15] text-white drop-shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">
              {t.hero.title1} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400 drop-shadow-[0_0_30px_rgba(225,29,72,0.8)] relative inline-block transform hover:scale-105 transition-transform duration-300 mt-2">
                {t.hero.title2}
              </span>{" "}
              {t.hero.title3}
            </h1>

            <p className="text-lg md:text-xl text-slate-200 leading-relaxed max-w-2xl font-light drop-shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              {t.hero.subtitle}
            </p>

            <div className="pt-6 flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
              <Link to="/register">
                <Button size="lg" className="rounded-full px-8 h-14 text-lg font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-[0_8px_30px_rgba(225,29,72,0.4)] hover:shadow-[0_8px_40px_rgba(225,29,72,0.6)] transition-all hover:-translate-y-1 border-none w-full sm:w-auto text-white">
                  {t.hero.joinCta}
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-lg font-bold bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-md hover:shadow-[0_8px_30px_rgba(255,255,255,0.15)] transition-all hover:-translate-y-1 w-full sm:w-auto">
                  {t.hero.loginCta}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-4">{t.howItWorks.title}</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">{t.howItWorks.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {t.steps.map((step, i) => {
              const Icon = STEP_ICONS[i];
              return (
                <div key={step.title} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 text-center group flex flex-col items-center">
                  <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{i + 1}- {step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-4">{t.features.title}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">{t.features.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {t.featuresList.map((f, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <div key={f.title} className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-transform hover:-translate-y-1 duration-300">
                  <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-4">{t.benefits.title}</h2>
            <p className="text-lg text-slate-600 leading-relaxed">{t.benefits.subtitle}</p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <div className="space-y-6">
                {t.benefitsList.map((benefit, index) => {
                  const Icon = BENEFIT_ICONS[index];
                  return (
                    <div key={index} className="flex gap-6 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                      <div className="shrink-0 h-14 w-14 rounded-xl bg-red-50 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{benefit.title}</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">{benefit.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 w-full flex justify-end">
              <div className="relative w-[300px] h-[490px] w-full">
                <div className="absolute inset-0 bg-red-50 rounded-full blur-3xl opacity-80 transform scale-110"></div>
                <img
                  src="/télécharger (24).png"
                  alt="Stéthoscope en forme de cœur"
                  className="relative z-11 w-80 h-auto object-contain drop-shadow-1xl hover:scale-105 transition-transform duration-500 translate-x-[30px]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
