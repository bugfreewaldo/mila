"use client";

import Link from "next/link";
import {
  Baby,
  Activity,
  FlaskConical,
  Droplets,
  Clock,
  Shield,
  Database,
  Sparkles,
  Heart,
  Star,
  Cloud,
  Sun,
  Moon,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/mila/i18n";

export default function LandingPage() {
  const { t, language, setLanguage } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--baby-lavender))] via-[hsl(var(--baby-pink)/0.3)] to-background relative overflow-hidden">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Star className="absolute top-20 left-[10%] w-6 h-6 text-[hsl(var(--baby-yellow))] animate-float opacity-60" style={{ animationDelay: "0s" }} />
        <Heart className="absolute top-32 right-[15%] w-5 h-5 text-[hsl(var(--baby-pink))] animate-float opacity-50" style={{ animationDelay: "0.5s" }} />
        <Cloud className="absolute top-16 right-[30%] w-10 h-10 text-[hsl(var(--baby-blue))] animate-float opacity-40" style={{ animationDelay: "1s" }} />
        <Star className="absolute top-48 left-[25%] w-4 h-4 text-[hsl(var(--baby-peach))] animate-float opacity-50" style={{ animationDelay: "1.5s" }} />
        <Moon className="absolute top-60 right-[8%] w-8 h-8 text-[hsl(var(--baby-lavender))] animate-float opacity-40" style={{ animationDelay: "2s" }} />
        <Sun className="absolute top-40 left-[5%] w-7 h-7 text-[hsl(var(--baby-yellow))] animate-float opacity-50" style={{ animationDelay: "0.8s" }} />
      </div>

      {/* Header */}
      <header className="relative border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--baby-pink))] text-primary-foreground shadow-playful animate-wiggle">
              <Baby className="w-6 h-6" />
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-primary to-[hsl(350,70%,60%)] bg-clip-text text-transparent">
              {t.appName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full px-3 gap-1.5"
              onClick={() => setLanguage(language === "en" ? "es" : "en")}
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-medium">{language === "en" ? "ES" : "EN"}</span>
            </Button>
            <Link href="/app">
              <Button className="rounded-full px-6 shadow-playful font-semibold">
                <Sparkles className="w-4 h-4 mr-2" />
                {t.landing.letsGo}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative container mx-auto px-4 py-16 md:py-24 text-center">
        <div className="max-w-3xl mx-auto">
          {/* Cute baby icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[hsl(var(--baby-pink))] to-[hsl(var(--baby-peach))] flex items-center justify-center shadow-playful-lg animate-bounce-soft">
                <Baby className="w-12 h-12 text-white" />
              </div>
              <Heart className="absolute -top-2 -right-2 w-8 h-8 text-[hsl(var(--destructive))] fill-[hsl(var(--destructive)/0.2)] animate-float" />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary via-[hsl(350,60%,55%)] to-[hsl(var(--baby-peach))] bg-clip-text text-transparent">
              {t.landing.caringFor}
            </span>
            <br />
            <span className="text-foreground">{t.landing.littleOnes}</span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {t.landing.heroDescription}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/app">
              <Button size="lg" className="w-full sm:w-auto rounded-full px-8 shadow-playful-lg font-semibold text-lg h-14">
                <Star className="w-5 h-5 mr-2" />
                {t.landing.startCaring}
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8 font-semibold text-lg h-14 border-2">
              <Heart className="w-5 h-5 mr-2" />
              {t.landing.learnMore}
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold">
            {t.landing.featuresTitle}
          </h2>
          <p className="mt-2 text-muted-foreground">{t.landing.featuresSubtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <FeatureCard
            icon={Activity}
            title={t.landing.happyHearts}
            description={t.landing.happyHeartsDesc}
            color="baby-pink"
          />
          <FeatureCard
            icon={Droplets}
            title={t.landing.tinyTransfusions}
            description={t.landing.tinyTransfusionsDesc}
            color="baby-blue"
          />
          <FeatureCard
            icon={FlaskConical}
            title={t.landing.labResults}
            description={t.landing.labResultsDesc}
            color="baby-mint"
          />
          <FeatureCard
            icon={Clock}
            title={t.landing.storyTimeline}
            description={t.landing.storyTimelineDesc}
            color="baby-peach"
          />
        </div>
      </section>

      {/* Trust section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-card rounded-[2rem] border-2 border-[hsl(var(--baby-lavender))] p-8 md:p-12 max-w-4xl mx-auto shadow-playful-lg">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">
              {t.landing.builtWithLove}
            </h2>
            <p className="mt-2 text-muted-foreground">{t.landing.builtWithLoveSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TrustCard
              icon={Database}
              title={t.landing.worksOffline}
              description={t.landing.worksOfflineDesc}
              color="baby-blue"
            />
            <TrustCard
              icon={Shield}
              title={t.landing.superSafe}
              description={t.landing.superSafeDesc}
              color="baby-mint"
            />
            <TrustCard
              icon={Sparkles}
              title={t.landing.easyPeasy}
              description={t.landing.easyPeasyDesc}
              color="baby-yellow"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="relative bg-gradient-to-br from-primary via-[hsl(300,50%,60%)] to-[hsl(var(--baby-pink))] text-primary-foreground rounded-[2rem] p-12 text-center max-w-3xl mx-auto shadow-playful-lg overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />

          <div className="relative">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                <Baby className="w-8 h-8" />
              </div>
            </div>
            <h2 className="text-3xl font-bold">{t.landing.readyToHelp}</h2>
            <p className="mt-4 text-primary-foreground/90 text-lg">
              {t.landing.readyToHelpDesc}
            </p>
            <Link href="/app">
              <Button size="lg" variant="secondary" className="mt-8 rounded-full px-8 font-semibold text-lg h-14 shadow-lg">
                <Star className="w-5 h-5 mr-2" />
                {t.landing.meetMila}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center gap-1 mb-3">
            <Heart className="w-4 h-4 text-[hsl(var(--baby-pink))]" />
            <Star className="w-4 h-4 text-[hsl(var(--baby-yellow))]" />
            <Heart className="w-4 h-4 text-[hsl(var(--baby-pink))]" />
          </div>
          <p className="text-sm text-muted-foreground">
            {t.appName} - {t.appTagline}
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            {t.appFullName}
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: typeof Activity;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="bg-card rounded-[1.5rem] border-2 border-transparent hover:border-[hsl(var(--baby-lavender))] p-6 text-center transition-all hover:shadow-playful-lg hover:-translate-y-1 group">
      <div className={`flex items-center justify-center w-14 h-14 rounded-2xl bg-[hsl(var(--${color}))] mx-auto mb-4 transition-transform group-hover:scale-110`}>
        <Icon className="w-7 h-7 text-foreground/70" />
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function TrustCard({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: typeof Database;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="text-center">
      <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-[hsl(var(--${color}))] mx-auto mb-3`}>
        <Icon className="w-6 h-6 text-foreground/70" />
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
