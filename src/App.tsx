import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LiveMap } from './components/LiveMap';
import { SatelliteDetector } from './components/SatelliteDetector';
import { Inventory } from './components/Inventory';
import { GrowthMonitor } from './components/GrowthMonitor';
import { LiveYoloVision } from './components/LiveYoloVision';
import { IoTSensorMonitor } from './components/IoTSensorMonitor';
import { AuthModal } from './components/AuthModal';
import { PlantDetailModal } from './components/PlantDetailModal';
import { QRModal } from './components/QRModal';
import { useGeolocation } from './hooks/useGeolocation';
import { usePlantStore } from './hooks/usePlantStore';
import { PlantRecord, UserAccount } from './types/plant';

export const App: React.FC = () => {
  const geoState = useGeolocation();
  const plantStore = usePlantStore();

  const [activeTab, setActiveTab] = useState<string>('map');
  const [campusName] = useState<string>('Sanjivani University');
  const [apiKey] = useState<string>(() => import.meta.env.VITE_PLANTID_API_KEY || '');

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('biocampus_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<PlantRecord | null>(null);
  const [qrModalTarget, setQrModalTarget] = useState<PlantRecord | null>(null);

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    localStorage.setItem('biocampus_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('biocampus_current_user');
  };

  // Check URL params for plant ID deep linking (e.g. from QR code scan)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plantId = params.get('plantId');
    if (plantId) {
      const found = plantStore.records.find((r) => r.id === plantId);
      if (found) {
        setSelectedPlant(found);
      }
    }
  }, [plantStore.records]);

  return (
    <div className="min-h-screen flex flex-col bg-biolightsurface text-slate-800 font-sans">
      
      {/* Header & Navbar */}
      <Header
        totalTrees={plantStore.records.length}
        uniqueSpecies={plantStore.getUniqueSpecies().length}
        activeZones={plantStore.getActiveZones().length}
        geoState={geoState}
        campusName={campusName}
        activeTab={activeTab}
        currentUser={currentUser}
        onTabChange={setActiveTab}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'map' && (
          <LiveMap
            records={plantStore.records}
            geoState={geoState}
            onSelectPlant={(plant) => setSelectedPlant(plant)}
          />
        )}

        {activeTab === 'satellite' && (
          <SatelliteDetector
            records={plantStore.records}
            geoState={geoState}
            campusName={campusName}
            onPlantSaved={(record) => {
              plantStore.addPlant(record);
            }}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'inventory' && (
          <Inventory
            records={plantStore.records}
            campusName={campusName}
            onDelete={plantStore.deletePlant}
            onSelectPlant={(plant) => setSelectedPlant(plant)}
          />
        )}

        {activeTab === 'growth' && (
          <GrowthMonitor
            records={plantStore.records}
            onAddGrowthLog={plantStore.addGrowthLog}
            onSelectPlant={(plant) => setSelectedPlant(plant)}
          />
        )}

        {activeTab === 'vision' && (
          <LiveYoloVision
            geoState={geoState}
            campusName={campusName}
            apiKey={apiKey}
            onPlantSaved={(record) => {
              plantStore.addPlant(record);
            }}
            onNavigateTab={setActiveTab}
            onRequestApiKey={() => {}}
          />
        )}

        {activeTab === 'iot' && (
          <IoTSensorMonitor
            records={plantStore.records}
            onUpdatePlantMoisture={plantStore.updatePlantMoisture}
          />
        )}
      </main>

      {/* Auth Sliding Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Detailed Plant Passport View */}
      <PlantDetailModal
        plant={selectedPlant}
        onClose={() => setSelectedPlant(null)}
        onOpenQR={(plant) => setQrModalTarget(plant)}
      />

      {/* QR Code Tag Modal */}
      {qrModalTarget && (
        <QRModal
          record={qrModalTarget}
          campusName={campusName}
          onClose={() => setQrModalTarget(null)}
        />
      )}

    </div>
  );
};

export default App;
