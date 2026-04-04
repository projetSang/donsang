import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4">
              <span className="text-gradient">Contactez</span>-nous
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Une question ? Un partenariat ? N'hésitez pas à nous écrire.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Contact info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold mb-6">Nos coordonnées</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-sm text-muted-foreground">contact@sangvital.ma</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Téléphone</div>
                      <div className="text-sm text-muted-foreground">+212 600 000 000</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Adresse</div>
                      <div className="text-sm text-muted-foreground">Casablanca, Maroc</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-accent/50 rounded-xl p-6">
                <h3 className="font-semibold mb-2">Vous êtes un hôpital ?</h3>
                <p className="text-sm text-muted-foreground">
                  Nous proposons des partenariats pour les établissements de santé. Contactez-nous pour en savoir plus sur nos solutions de recherche de donneurs.
                </p>
              </div>
            </div>

            {/* Contact form */}
            <div className="bg-card rounded-xl border border-border p-6">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Message envoyé !</h3>
                  <p className="text-muted-foreground">Nous vous répondrons dans les plus brefs délais.</p>
                </div>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom</Label>
                      <Input id="name" placeholder="Votre nom" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="votre@email.com" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Sujet</Label>
                    <Input id="subject" placeholder="Sujet de votre message" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <textarea
                      id="message"
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[120px] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="Votre message..."
                      required
                    />
                  </div>
                  <Button variant="hero" className="w-full" size="lg">
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer le message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
