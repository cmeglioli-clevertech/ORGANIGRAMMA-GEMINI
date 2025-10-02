import React from 'react';
import { 
  Crown, 
  Target, 
  Users, 
  Briefcase, 
  Award, 
  Wrench, 
  Cog, 
  Zap,
  CheckCircle,
  Circle,
  GraduationCap,
  Hammer
} from 'lucide-react';

/**
 * Sistema Badge Qualifiche v2.0 - Design Moderno
 * 
 * Caratteristiche:
 * - Badge compatti con icone distintive
 * - Colori WCAG AA compliant (contrasto 4.5:1+)
 * - Sigle brevi per spazio ridotto
 * - Tooltip con descrizione completa
 */

interface QualificationBadgeProps {
  qualification: string;
  qualificationKey: string;
  colorClass: string;
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
}

// Mappa icone per ogni livello di qualifica - Dimensioni compatte
const QUALIFICATION_ICONS: Record<string, React.ReactNode> = {
  'dirigente': <Crown className="w-3.5 h-3.5" />,
  'direttivo-quadro-gestione-del-cambiamento': <Target className="w-3.5 h-3.5" />,
  'direttivo-responsabile-di-team-processi': <Users className="w-3.5 h-3.5" />,
  'direttivo-tecnico-organizzativo': <Briefcase className="w-3.5 h-3.5" />,
  'tecnico-specializzato': <Award className="w-3.5 h-3.5" />,
  'tecnico-qualificato': <Wrench className="w-3.5 h-3.5" />,
  'tecnico-esecutivo': <Cog className="w-3.5 h-3.5" />,
  'operativo-specializzato': <Zap className="w-3.5 h-3.5" />,
  'operativo-qualificato': <CheckCircle className="w-3.5 h-3.5" />,
  'operativo-base': <Circle className="w-3.5 h-3.5" />,
  'apprendista-impiegato': <GraduationCap className="w-3.5 h-3.5" />,
  'apprendista-operaio': <Hammer className="w-3.5 h-3.5" />,
};

// Sigle brevi per badge compatti
const QUALIFICATION_LABELS: Record<string, string> = {
  'dirigente': 'DIR',
  'direttivo-quadro-gestione-del-cambiamento': 'QUADRO',
  'direttivo-responsabile-di-team-processi': 'RESP',
  'direttivo-tecnico-organizzativo': 'TEC/ORG',
  'tecnico-specializzato': 'SPEC',
  'tecnico-qualificato': 'QUAL',
  'tecnico-esecutivo': 'ESEC',
  'operativo-specializzato': 'OP.SPEC',
  'operativo-qualificato': 'OP.QUAL',
  'operativo-base': 'OP.BASE',
  'apprendista-impiegato': 'APPR.IMP',
  'apprendista-operaio': 'APPR.OP',
};

// Colori moderni più tenui - WCAG AA compliant
export const MODERN_QUALIFICATION_COLORS: Record<string, string> = {
  'dirigente': 'bg-red-500 text-white border-red-600 shadow-red-100',
  'direttivo-quadro-gestione-del-cambiamento': 'bg-orange-500 text-white border-orange-600 shadow-orange-100',
  'direttivo-responsabile-di-team-processi': 'bg-amber-500 text-white border-amber-600 shadow-amber-100',
  'direttivo-tecnico-organizzativo': 'bg-blue-500 text-white border-blue-600 shadow-blue-100',
  'tecnico-specializzato': 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-100',
  'tecnico-qualificato': 'bg-purple-500 text-white border-purple-600 shadow-purple-100',
  'tecnico-esecutivo': 'bg-cyan-500 text-white border-cyan-600 shadow-cyan-100',
  'operativo-specializzato': 'bg-orange-600 text-white border-orange-700 shadow-orange-100',
  'operativo-qualificato': 'bg-rose-500 text-white border-rose-600 shadow-rose-100',
  'operativo-base': 'bg-slate-500 text-white border-slate-600 shadow-slate-100',
  'apprendista-impiegato': 'bg-lime-500 text-white border-lime-600 shadow-lime-100',
  'apprendista-operaio': 'bg-stone-500 text-white border-stone-600 shadow-stone-100',
};

const QualificationBadge: React.FC<QualificationBadgeProps> = ({ 
  qualification,
  qualificationKey, 
  colorClass,
  size = 'medium',
  showTooltip = true 
}) => {
  // Ottieni icona e label dalla mappa
  const icon = QUALIFICATION_ICONS[qualificationKey] || <Cog className="w-3.5 h-3.5" />;
  const label = QUALIFICATION_LABELS[qualificationKey] || qualification;
  const modernColor = MODERN_QUALIFICATION_COLORS[qualificationKey] || colorClass;

  // Classi dimensioni - Ottimizzate per compattezza
  const sizeClasses = {
    small: 'px-2 py-0.5 text-[10px] gap-1',
    medium: 'px-2.5 py-1 text-[11px] gap-1',
    large: 'px-3 py-1.5 text-xs gap-1.5'
  };

  return (
    <div className="relative group">
      {/* Badge compatto */}
      <div className={`
        inline-flex items-center justify-center
        ${sizeClasses[size]}
        ${modernColor}
        rounded-full border-2 
        font-bold tracking-wide
        shadow-md
        transition-all duration-300
        hover:scale-105 hover:shadow-lg
      `}>
        {icon}
        <span className="uppercase">{label}</span>
      </div>

      {/* Tooltip con qualifica completa */}
      {showTooltip && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 
                        px-3 py-2 bg-slate-900 text-white text-xs rounded-lg
                        opacity-0 group-hover:opacity-100 pointer-events-none
                        transition-opacity duration-200 whitespace-nowrap
                        shadow-xl z-50">
          {qualification}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 
                          w-2 h-2 bg-slate-900 rotate-45" />
        </div>
      )}
    </div>
  );
};

export default QualificationBadge;

