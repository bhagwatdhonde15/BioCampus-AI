import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Printer, Download } from 'lucide-react';
import { PlantRecord } from '../types/plant';

interface QRModalProps {
  record: PlantRecord;
  campusName: string;
  onClose: () => void;
}

export const QRModal: React.FC<QRModalProps> = ({ record, campusName, onClose }) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  // Generate a permanent URL for this plant record
  const plantUrl = `${window.location.origin}/?plantId=${record.id}&species=${encodeURIComponent(record.scientificName)}&lat=${record.latitude}&lng=${record.longitude}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `BioCampus_Tree_Tag_${record.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-slide-up overflow-hidden">
        {/* Modal Header */}
        <div className="bg-bioblue px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">Digital Tree Tag</h2>
          <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Printable QR Plate */}
        <div id="qr-print-zone" className="p-6 bg-white">
          {/* Campus Badge */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 bg-bioblue text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
              🌿 {campusName}
            </div>
          </div>

          {/* QR Code */}
          <div ref={canvasRef} className="flex justify-center mb-4">
            <div className="p-3 border-4 border-bioblue rounded-2xl bg-white shadow-inner">
              <QRCodeCanvas
                value={plantUrl}
                size={180}
                level="H"
                fgColor="#1E3A8A"
                bgColor="#FFFFFF"
                includeMargin={false}
              />
            </div>
          </div>

          {/* Tree Info */}
          <div className="text-center mb-4">
            <h3 className="text-xl font-extrabold text-bioblue leading-tight">{record.commonName}</h3>
            <p className="text-slate-500 italic text-sm mt-0.5">{record.scientificName}</p>
          </div>

          <div className="bg-sky-50 rounded-xl p-4 text-xs text-center space-y-1.5 border border-sky-100">
            <div className="flex justify-between text-slate-600">
              <span className="font-semibold">Tree ID:</span>
              <span className="font-mono font-bold text-bioblue">{record.id}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="font-semibold">Campus Zone:</span>
              <span>{record.zone}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="font-semibold">GPS Coordinates:</span>
              <span className="font-mono">{record.latitude.toFixed(5)}, {record.longitude.toFixed(5)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="font-semibold">Identified:</span>
              <span>{new Date(record.dateMapped).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="font-semibold">AI Confidence:</span>
              <span className="font-bold text-bioskyblue">{(record.confidence * 100).toFixed(1)}%</span>
            </div>
          </div>

          <p className="text-center text-slate-400 text-xs mt-3">
            Scan QR code with phone camera to view live plant passport
          </p>
          <p className="text-center text-slate-300 text-[10px] mt-1">
            Powered by BioCampus AI · Plant.id · OpenStreetMap
          </p>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-sky-100 px-6 py-4 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 bg-bioblue text-white font-semibold py-2.5 rounded-xl hover:bg-bioskyblue transition-colors shadow-lg shadow-bioblue/30"
          >
            <Printer size={18} /> Print Tag
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 bg-sky-50 text-bioblue font-semibold py-2.5 rounded-xl hover:bg-sky-100 border border-sky-200 transition-colors"
          >
            <Download size={18} /> Download PNG
          </button>
        </div>
      </div>
    </div>
  );
};
