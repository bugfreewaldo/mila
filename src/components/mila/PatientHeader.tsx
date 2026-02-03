"use client";

import { Baby, Calendar, Scale, Heart, Star, Droplets, Phone, User } from "lucide-react";
import type { Patient } from "@/lib/mila/types";
import { calculateDaysOfLife, formatGestationalAge } from "@/lib/mila/utils/dates";
import { useTranslation } from "@/lib/mila/i18n";

interface PatientHeaderProps {
  patient: Patient;
  compact?: boolean;
}

export function PatientHeader({ patient, compact = false }: PatientHeaderProps) {
  const daysOfLife = calculateDaysOfLife(patient.birthDate);
  const { t } = useTranslation();

  // Get primary contact
  const primaryContact = patient.parentContacts?.find((c) => c.isPrimaryContact) || patient.parentContacts?.[0];

  if (compact) {
    return (
      <div className="flex items-center gap-3 group">
        <div className="relative">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--baby-pink))] to-[hsl(var(--baby-peach))] text-foreground/70 shadow-playful transition-transform group-hover:scale-105">
            <Baby className="w-5 h-5" />
          </div>
          <Heart className="absolute -top-1 -right-1 w-4 h-4 text-[hsl(var(--destructive))] fill-[hsl(var(--destructive)/0.3)] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div>
          <div className="font-semibold text-sm flex items-center gap-1">
            {patient.displayName}
            {patient.bloodType && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded">
                {patient.bloodType}
              </span>
            )}
            <Star className="w-3 h-3 text-[hsl(var(--baby-yellow))]" />
          </div>
          <div className="text-xs text-muted-foreground">
            {t.patient.day} {daysOfLife} · {formatGestationalAge(patient.gestationalAgeWeeks)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-[hsl(var(--baby-pink)/0.3)] to-[hsl(var(--baby-lavender)/0.3)] rounded-2xl border-2 border-[hsl(var(--baby-lavender))] shadow-playful">
      <div className="relative">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--baby-pink))] to-[hsl(var(--baby-peach))] text-foreground/70 shadow-playful">
          <Baby className="w-8 h-8" />
        </div>
        <Heart className="absolute -top-2 -right-2 w-6 h-6 text-[hsl(var(--destructive))] fill-[hsl(var(--destructive)/0.3)] animate-bounce-soft" />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-xl flex items-center gap-2">
            {patient.displayName}
            <Star className="w-5 h-5 text-[hsl(var(--baby-yellow))] fill-[hsl(var(--baby-yellow)/0.3)]" />
          </h2>
          {/* Blood Type Badge */}
          {patient.bloodType && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white rounded-full font-bold text-sm shadow-md">
              <Droplets className="w-4 h-4" />
              {patient.bloodType}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-[hsl(var(--baby-blue)/0.5)] px-3 py-1 rounded-full">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">{t.patient.day} {daysOfLife}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[hsl(var(--baby-mint)/0.5)] px-3 py-1 rounded-full">
            <span className="font-medium">{formatGestationalAge(patient.gestationalAgeWeeks)}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[hsl(var(--baby-peach)/0.5)] px-3 py-1 rounded-full">
            <Scale className="w-4 h-4" />
            <span className="font-medium">{patient.birthWeightGrams}g</span>
          </div>

          {/* Primary Contact Info */}
          {primaryContact && (
            <div className="flex items-center gap-1.5 bg-[hsl(var(--baby-lavender)/0.5)] px-3 py-1 rounded-full">
              <User className="w-4 h-4" />
              <span className="font-medium">{primaryContact.name}</span>
              {primaryContact.phone && (
                <>
                  <span className="text-muted-foreground/50">|</span>
                  <Phone className="w-3 h-3" />
                  <span className="font-mono text-xs">{primaryContact.phone}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
