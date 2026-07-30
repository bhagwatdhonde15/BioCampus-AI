import React from 'react';
import { Leaf, TreePine, MapPin, Wifi, WifiOff, Activity, Eye, Droplets, User, LogOut } from 'lucide-react';
import { GeolocationState, UserAccount } from '../types/plant';

interface HeaderProps {
  totalTrees: number;
  uniqueSpecies: number;
  activeZones: number;
  geoState: GeolocationState;
  campusName: string;
  activeTab: string;
  currentUser: UserAccount | null;
  onTabChange: (tab: string) => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

const NAV_TABS = [
  { id: 'map',       label: 'Live Satellite Map', icon: MapPin },
  { id: 'inventory', label: 'Inventory',          icon: TreePine },
  { id: 'growth',    label: 'Health & Growth',     icon: Activity },
  { id: 'vision',    label: 'Live AI Vision',      icon: Eye },
  { id: 'iot',       label: 'IoT Moisture',        icon: Droplets },
];

export const Header: React.FC<HeaderProps> = ({
  totalTrees,
  uniqueSpecies,
  activeZones,
  geoState,
  campusName,
  activeTab,
  currentUser,
  onTabChange,
  onOpenAuthModal,
  onLogout,
}) => {
  const isGpsSynced = geoState.isWatching && geoState.lat !== null;

  return (
    <header className="bg-bioblue shadow-xl shadow-bioblue/30 sticky top-0 z-50">
      {/* Main Nav Bar */}
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="bg-bioskyblue rounded-xl p-2 shadow-lg shadow-bioskyblue/40">
            <Leaf className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl tracking-tight leading-none">BioCampus AI</h1>
            <p className="text-blue-300 text-xs font-medium mt-0.5">{campusName}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 bg-white/10 rounded-xl p-1 flex-1 max-w-2xl mx-auto overflow-x-auto">
          {NAV_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium flex-1 justify-center whitespace-nowrap transition-all duration-200
                ${activeTab === id
                  ? 'bg-bioskyblue text-white shadow-lg shadow-bioskyblue/40'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
                }`}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </nav>

        {/* User Account / Auth Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-xl border border-white/20">
              <div className="w-7 h-7 rounded-full bg-bioskyblue flex items-center justify-center text-white font-bold text-xs">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-white font-bold text-xs leading-none">{currentUser.name}</p>
                <p className="text-blue-200 text-[10px]">{currentUser.role}</p>
              </div>
              <button
                onClick={onLogout}
                className="text-blue-200 hover:text-red-300 p-1 transition-colors"
                title="Log Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="bg-bioskyblue hover:bg-bioskyblue/90 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-bioskyblue/30 transition-all"
            >
              <User size={15} /> Sign In
            </button>
          )}
        </div>

      </div>

      {/* Stats Bar */}
      <div className="bg-bioblue-950/60 border-t border-white/10">
        <div className="max-w-screen-xl mx-auto px-4 py-2 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <TreePine className="text-bioskyblue" size={14} />
              <span className="text-blue-200 text-xs">Catalogued Trees</span>
              <span className="text-white font-bold text-sm">{totalTrees}</span>
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="text-emerald-400" size={14} />
              <span className="text-blue-200 text-xs">Unique Species</span>
              <span className="text-white font-bold text-sm">{uniqueSpecies}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="text-amber-400" size={14} />
              <span className="text-blue-200 text-xs">Active Zones</span>
              <span className="text-white font-bold text-sm">{activeZones}</span>
            </div>
          </div>

          {/* GPS Status */}
          <div className="flex items-center gap-2">
            {isGpsSynced ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <Wifi className="text-emerald-400" size={13} />
                <span className="text-emerald-300 text-xs font-medium">
                  GPS Live · {geoState.lat?.toFixed(4)}, {geoState.lng?.toFixed(4)}
                  {geoState.accuracy && <span className="text-blue-300"> ±{geoState.accuracy}m</span>}
                </span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-red-400"></span>
                <WifiOff className="text-red-400" size={13} />
                <span className="text-red-300 text-xs">
                  {geoState.error ?? 'Acquiring GPS...'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
