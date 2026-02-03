"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Droplets,
  FlaskConical,
  Activity,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight,
  Baby,
  Heart,
  Star,
  ClipboardList,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/mila/store";
import { useTranslation } from "@/lib/mila/i18n";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItemsConfig = [
  { href: "/app", labelKey: "home" as const, icon: LayoutDashboard, color: "baby-lavender" },
  { href: "/app/timeline", labelKey: "story" as const, icon: Clock, color: "baby-peach" },
  { href: "/app/plans", labelKey: "plans" as const, icon: ClipboardCheck, color: "baby-lavender" },
  { href: "/app/observations", labelKey: "notes" as const, icon: FileText, color: "baby-mint" },
  { href: "/app/transfusions", labelKey: "helpers" as const, icon: Droplets, color: "baby-blue" },
  { href: "/app/labs", labelKey: "tests" as const, icon: FlaskConical, color: "baby-pink" },
  { href: "/app/vitals", labelKey: "hearts" as const, icon: Activity, color: "baby-yellow" },
  { href: "/app/orders", labelKey: "orders" as const, icon: ClipboardList, color: "baby-mint" },
  { href: "/app/settings", labelKey: "settings" as const, icon: Settings, color: "muted" },
];

export function Nav() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const { t } = useTranslation();

  return (
    <TooltipProvider delayDuration={0}>
      <nav
        className={cn(
          "flex flex-col h-full bg-card border-r-2 border-[hsl(var(--baby-lavender))] transition-all duration-300",
          sidebarCollapsed ? "w-20" : "w-60"
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-[hsl(var(--baby-lavender))]">
          <Link href="/app" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--baby-pink))] text-primary-foreground shadow-playful transition-transform group-hover:scale-105">
                <Baby className="w-5 h-5" />
              </div>
              <Heart className="absolute -top-1 -right-1 w-4 h-4 text-[hsl(var(--destructive))] fill-[hsl(var(--destructive)/0.3)] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-[hsl(350,70%,60%)] bg-clip-text text-transparent">
                {t.appName}
              </span>
            )}
          </Link>
        </div>

        {/* Nav Items */}
        <div className="flex-1 py-4 px-3 space-y-2 overflow-y-auto">
          {navItemsConfig.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const label = t.nav[item.labelKey];

            if (sidebarCollapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-center h-12 w-full rounded-2xl transition-all",
                        isActive
                          ? "bg-gradient-to-r from-primary to-[hsl(var(--baby-pink))] text-primary-foreground shadow-playful"
                          : `bg-[hsl(var(--${item.color})/0.5)] hover:bg-[hsl(var(--${item.color}))] text-foreground/70 hover:text-foreground`
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="rounded-xl font-medium">
                    {label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 h-12 px-4 rounded-2xl transition-all group",
                  isActive
                    ? "bg-gradient-to-r from-primary to-[hsl(var(--baby-pink))] text-primary-foreground shadow-playful"
                    : `bg-[hsl(var(--${item.color})/0.3)] hover:bg-[hsl(var(--${item.color}))] text-foreground/70 hover:text-foreground`
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-xl transition-colors",
                  isActive ? "bg-white/20" : `bg-[hsl(var(--${item.color})/0.5)]`
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-medium">{label}</span>
                {isActive && (
                  <Star className="w-4 h-4 ml-auto animate-bounce-soft" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Fun footer decoration */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3 border-t border-[hsl(var(--baby-lavender))]">
            <div className="flex items-center justify-center gap-1 text-muted-foreground/50">
              <Heart className="w-3 h-3 text-[hsl(var(--baby-pink))]" />
              <span className="text-xs">{t.nav.tinyCare}</span>
              <Heart className="w-3 h-3 text-[hsl(var(--baby-pink))]" />
            </div>
          </div>
        )}

        {/* Collapse Toggle */}
        <div className="p-3 border-t border-[hsl(var(--baby-lavender))]">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center rounded-xl hover:bg-[hsl(var(--baby-lavender))]"
            onClick={toggleSidebar}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="ml-2 text-sm">{t.nav.smaller}</span>
              </>
            )}
          </Button>
        </div>
      </nav>
    </TooltipProvider>
  );
}
