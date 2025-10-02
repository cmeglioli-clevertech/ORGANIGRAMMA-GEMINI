import React from 'react';
import { 
  X, 
  Building2, 
  MapPin, 
  Briefcase, 
  Users, 
  User,
  Award,
  UserCheck,
  Calendar,
  Mail,
  Phone
} from 'lucide-react';
import QualificationBadge from './QualificationBadge';
import type { Node } from '../types';
import { getOfficeBackground } from '../utils/officeBackgrounds';

/**
 * Modal Dettagli Dipendente
 * 
 * Mostra tutte le informazioni del dipendente in un modal moderno
 * con animazioni smooth e design glassmorphism
 */

interface EmployeeDetailModalProps {
  node: Node;
  onClose: () => void;
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => {
  if (!value) return null;
  
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-50 
                      flex items-center justify-center text-blue-600">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">
          {label}
        </div>
        <div className="text-sm text-slate-900 font-semibold truncate">
          {value}
        </div>
      </div>
    </div>
  );
};

const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({ node, onClose }) => {
  const [mouseDownPos, setMouseDownPos] = React.useState<{ x: number; y: number } | null>(null);

  // Previeni chiusura al click interno
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Traccia posizione mouse down per distinguere click da drag
  const handleBackdropMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setMouseDownPos({ x: e.clientX, y: e.clientY });
    }
  };

  // Chiudi solo se è un vero click (non drag)
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    
    if (mouseDownPos) {
      const distance = Math.sqrt(
        Math.pow(e.clientX - mouseDownPos.x, 2) + 
        Math.pow(e.clientY - mouseDownPos.y, 2)
      );
      
      // Chiudi solo se il movimento è < 10px (vero click)
      if (distance < 10) {
        onClose();
      }
    }
    setMouseDownPos(null);
  };

  // Chiudi con ESC
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const metadata = node.metadata;
  const backgroundImage = getOfficeBackground(metadata?.office);

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 
                 flex items-center justify-center p-4 animate-fadeIn
                 overflow-y-auto"
      onMouseDown={handleBackdropMouseDown}
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full 
                   my-8 animate-slideUp relative"
        onClick={handleContentClick}
        style={{ maxHeight: 'calc(100vh - 4rem)' }}
      >
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
        {/* Header con foto e info principale */}
        <div 
          className="relative text-white px-8 pt-8 pb-24 rounded-t-2xl"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)), url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          
          {/* Pulsante chiusura */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full 
                       bg-white/20 hover:bg-white/30 backdrop-blur-sm
                       flex items-center justify-center transition-all
                       hover:scale-110"
            aria-label="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Info header */}
          <div className="flex items-center gap-6">
            <img 
              src={node.imageUrl} 
              alt={node.name}
              className="w-24 h-24 rounded-full border-4 border-white 
                         shadow-xl object-cover"
            />
            
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">
                {node.name}
              </h2>
              <p className="text-blue-100 text-lg mb-3">
                {metadata?.mansione || node.role}
              </p>
              
              {metadata?.qualification && (
                <QualificationBadge
                  qualification={metadata.qualification}
                  qualificationKey={metadata.qualificationKey || ''}
                  colorClass={metadata.badgeColorClass || ''}
                  size="large"
                  showTooltip={false}
                />
              )}
            </div>
          </div>
        </div>

        {/* Card statistiche rapide (sovrapposta all'header) - Solo Team */}
        {node.type === 'person' && metadata?.stats?.directs !== undefined && (
          <div className="px-8 -mt-16 relative z-10">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200">
              <div className="px-6 py-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {metadata.stats.directs}
                </div>
                <div className="text-xs text-slate-500 font-medium uppercase">
                  Diretti nel Team
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenuto principale */}
        <div className="px-8 py-6">
          
          {/* Sezioni informazioni */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
            {/* Sezione Organizzazione */}
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 
                             flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Organizzazione
              </h3>
              
              <InfoRow 
                icon={<Building2 className="w-4 h-4" />} 
                label="Azienda" 
                value={metadata?.company} 
              />
              <InfoRow 
                icon={<MapPin className="w-4 h-4" />} 
                label="Sede" 
                value={metadata?.sede} 
              />
              <InfoRow 
                icon={<Briefcase className="w-4 h-4" />} 
                label="Dipartimento" 
                value={metadata?.department} 
              />
              <InfoRow 
                icon={<Users className="w-4 h-4" />} 
                label="Ufficio" 
                value={metadata?.office} 
              />
            </div>

            {/* Sezione Informazioni Personali */}
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3
                             flex items-center gap-2">
                <User className="w-4 h-4" />
                Informazioni
              </h3>
              
              <InfoRow 
                icon={<UserCheck className="w-4 h-4" />} 
                label="Manager" 
                value={metadata?.reportsTo} 
              />
              <InfoRow 
                icon={<Award className="w-4 h-4" />} 
                label="Qualifica" 
                value={metadata?.qualification} 
              />
              <InfoRow 
                icon={<User className="w-4 h-4" />} 
                label="Genere" 
                value={metadata?.gender} 
              />
            </div>
          </div>

          {/* Descrizione qualifica */}
          {metadata?.qualificationDescription && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Descrizione Livello
              </h4>
              <p className="text-sm text-blue-800 leading-relaxed">
                {metadata.qualificationDescription}
              </p>
            </div>
          )}

          {/* Statistiche team (se applicabile) */}
          {metadata?.stats && (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 
                            border border-slate-200 rounded-xl p-6">
              <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Statistiche {node.type === 'sede' ? 'Sede' : node.type === 'department' ? 'Dipartimento' : 'Ufficio'}
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {metadata.stats.sites !== undefined && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {metadata.stats.sites}
                    </div>
                    <div className="text-xs text-slate-600 font-medium">
                      Sedi
                    </div>
                  </div>
                )}
                {metadata.stats.departments !== undefined && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600">
                      {metadata.stats.departments}
                    </div>
                    <div className="text-xs text-slate-600 font-medium">
                      Dipartimenti
                    </div>
                  </div>
                )}
                {metadata.stats.offices !== undefined && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-600">
                      {metadata.stats.offices}
                    </div>
                    <div className="text-xs text-slate-600 font-medium">
                      Uffici
                    </div>
                  </div>
                )}
                {metadata.stats.people !== undefined && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {metadata.stats.people}
                    </div>
                    <div className="text-xs text-slate-600 font-medium">
                      Persone
                    </div>
                  </div>
                )}
                {metadata.stats.directs !== undefined && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-rose-600">
                      {metadata.stats.directs}
                    </div>
                    <div className="text-xs text-slate-600 font-medium">
                      Diretti
                    </div>
                  </div>
                )}
                {metadata.stats.totalReports !== undefined && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600">
                      {metadata.stats.totalReports}
                    </div>
                    <div className="text-xs text-slate-600 font-medium">
                      Totale Team
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer con azioni */}
        <div className="px-8 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 bg-slate-200 text-slate-700 rounded-xl
                       hover:bg-slate-300 transition-all font-semibold
                       hover:scale-105 active:scale-95"
          >
            Chiudi
          </button>
        </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EmployeeDetailModal;

