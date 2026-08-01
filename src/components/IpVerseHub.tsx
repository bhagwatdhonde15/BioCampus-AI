import React, { useState, useEffect } from 'react';
import {
  Network, Cpu, Radio, Wifi, WifiOff, RefreshCw, Server, Plus, ShieldCheck, Activity, Terminal, CheckCircle2, Zap, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { IpDeviceNode } from '../types/plant';

const INITIAL_NODES: IpDeviceNode[] = [
  {
    id: 'node-1',
    name: 'ESP8266 Soil Moisture Sensor',
    ip: '10.149.227.4',
    port: '80',
    type: 'sensor',
    status: 'ONLINE',
    latencyMs: 14,
    lastPing: 'Just now',
    details: 'Analog Read Pin A0 · /data endpoint JSON stream',
  },
  {
    id: 'node-2',
    name: 'DroidCam AI Vision Stream',
    ip: '10.149.227.90',
    port: '4747',
    type: 'camera',
    status: 'ONLINE',
    latencyMs: 8,
    lastPing: 'Just now',
    details: 'MJPEG Stream /video endpoint · 60 FPS YOLO v8',
  },
  {
    id: 'node-3',
    name: 'ESP32 Campus Weather Node',
    ip: '10.149.227.15',
    port: '8080',
    type: 'gateway',
    status: 'ONLINE',
    latencyMs: 22,
    lastPing: '2 sec ago',
    details: 'BME280 Ambient Temp & Soil Temp Telemetry',
  },
  {
    id: 'node-4',
    name: 'Smart Irrigation Solenoid Valve',
    ip: '10.149.227.50',
    port: '80',
    type: 'irrigation',
    status: 'STANDBY',
    latencyMs: 18,
    lastPing: '5 sec ago',
    details: 'Relay Control Channel 1 · Auto-Moisture Trigger',
  },
];

export const IpVerseHub: React.FC = () => {
  const [nodes, setNodes] = useState<IpDeviceNode[]>(INITIAL_NODES);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [newIpInput, setNewIpInput] = useState<string>('');
  const [newPortInput, setNewPortInput] = useState<string>('80');
  const [newNameInput, setNewNameInput] = useState<string>('');
  const [activeConsoleLog, setActiveConsoleLog] = useState<string[]>([
    '[IP-VERSE LOG 14:48:00] Initialized IP-Verse Autonomous Intelligence Matrix.',
    '[IP-VERSE LOG 14:48:01] Synced ESP8266 Sensor node at 10.149.227.4 (/data).',
    '[IP-VERSE LOG 14:48:02] Connected DroidCam MJPEG Video Stream at 10.149.227.90:4747.',
    '[IP-VERSE LOG 14:48:05] Multi-agent autonomous pipeline online & active.',
  ]);

  // Periodic latency update simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes((prev) =>
        prev.map((node) => ({
          ...node,
          latencyMs: Math.round(10 + Math.random() * 20),
          lastPing: 'Just now',
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleScanSubnet = () => {
    setIsScanning(true);
    const newLog = `[IP-VERSE SCAN ${new Date().toLocaleTimeString()}] Scanning campus subnet 10.149.227.0/24 for active IoT nodes...`;
    setActiveConsoleLog((prev) => [newLog, ...prev]);

    setTimeout(() => {
      setIsScanning(false);
      const doneLog = `[IP-VERSE SCAN ${new Date().toLocaleTimeString()}] Scan complete. All 4 campus IP nodes verified & connected.`;
      setActiveConsoleLog((prev) => [doneLog, ...prev]);
    }, 1500);
  };

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIpInput.trim()) return;

    const newNode: IpDeviceNode = {
      id: `node-${Date.now()}`,
      name: newNameInput || 'Generic IP Device',
      ip: newIpInput,
      port: newPortInput,
      type: 'sensor',
      status: 'ONLINE',
      latencyMs: 15,
      lastPing: 'Just now',
      details: 'User registered telemetry node',
    };

    setNodes((prev) => [...prev, newNode]);
    const addLog = `[IP-VERSE LOG ${new Date().toLocaleTimeString()}] Successfully registered custom device at http://${newIpInput}:${newPortInput}.`;
    setActiveConsoleLog((prev) => [addLog, ...prev]);

    setNewIpInput('');
    setNewNameInput('');
  };

  const onlineCount = nodes.filter((n) => n.status === 'ONLINE').length;

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
      
      {/* Title & Info Banner */}
      <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-bioblue flex items-center gap-2">
              <Network className="text-bioskyblue animate-pulse" size={26} />
              Sanjivani IP-Verse Hardware Manager
            </h2>
            <p className="text-slate-500 text-xs max-w-2xl">
              Centralized network orchestration hub connecting campus ESP8266 sensors, DroidCam vision streams, smart irrigation gateways, and autonomous AI agents.
            </p>
          </div>

          <button
            onClick={handleScanSubnet}
            disabled={isScanning}
            className="bg-bioskyblue hover:bg-bioskyblue/90 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-bioskyblue/40 transition-all"
          >
            <RefreshCw size={16} className={isScanning ? 'animate-spin' : ''} />
            {isScanning ? 'Scanning Subnet...' : 'Scan Campus 10.149.227.x'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5 flex items-center gap-4">
          <div className="bg-blue-50 text-bioblue p-3 rounded-xl">
            <Server size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">Registered IP Nodes</p>
            <p className="text-2xl font-extrabold text-bioblue mt-0.5">{nodes.length}</p>
            <p className="text-emerald-600 text-xs font-semibold mt-0.5">{onlineCount} Online</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5 flex items-center gap-4">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
            <Activity size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">Avg Subnet Latency</p>
            <p className="text-2xl font-extrabold text-bioblue mt-0.5">14<span className="text-sm font-normal text-slate-400"> ms</span></p>
            <p className="text-emerald-600 text-xs font-semibold mt-0.5">Ultra Low Ping</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5 flex items-center gap-4">
          <div className="bg-sky-50 text-bioskyblue p-3 rounded-xl">
            <Cpu size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">Autonomous Agents</p>
            <p className="text-2xl font-extrabold text-bioblue mt-0.5">4<span className="text-sm font-normal text-slate-400"> Active</span></p>
            <p className="text-bioskyblue text-xs font-semibold mt-0.5">AI Engine Synced</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5 flex items-center gap-4">
          <div className="bg-amber-50 text-amber-600 p-3 rounded-xl">
            <Radio size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">Subnet Range</p>
            <p className="text-sm font-extrabold text-bioblue font-mono mt-1">10.149.227.0/24</p>
            <p className="text-slate-400 text-xs mt-0.5">Campus WiFi Net</p>
          </div>
        </div>
      </div>

      {/* Main Grid: IP Nodes List & Add Node Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active IP Hardware Nodes Table (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-bioblue flex items-center gap-2">
            <Server size={20} className="text-bioskyblue" /> Active IP Devices & Hardware Matrix
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {nodes.map((node) => (
              <div key={node.id} className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-all border-l-4 border-l-bioblue">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      node.status === 'ONLINE' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      ● {node.status}
                    </span>
                    <span className="text-xs font-mono font-bold text-bioskyblue">
                      {node.latencyMs} ms
                    </span>
                  </div>

                  <h4 className="font-extrabold text-bioblue text-base leading-tight">{node.name}</h4>
                  <p className="text-xs font-mono font-bold text-slate-700 bg-sky-50 px-2 py-1 rounded border border-sky-100 mt-1 inline-block">
                    http://{node.ip}:{node.port || '80'}
                  </p>

                  <p className="text-xs text-slate-500 mt-3">{node.details}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-sky-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Last ping: {node.lastPing}</span>
                  <button className="text-bioblue hover:text-bioskyblue font-bold flex items-center gap-1">
                    Connect Node <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Autonomous AI Agents Status Panel */}
          <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-6 space-y-3">
            <h4 className="text-sm font-bold text-bioblue uppercase tracking-wide flex items-center gap-2">
              <Zap size={16} className="text-amber-500" /> IP-Verse Autonomous Multi-Agent Pipeline
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-bioblue">Agent-1: Plant Taxonomy Classifier</p>
                  <p className="text-slate-500 text-[11px]">Plant.id v3 API Engine</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Active</span>
              </div>

              <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-bioblue">Agent-2: Real-time YOLO Vision</p>
                  <p className="text-slate-500 text-[11px]">DroidCam 10.149.227.90:4747</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Active</span>
              </div>

              <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-bioblue">Agent-3: ESP8266 Telemetry Sync</p>
                  <p className="text-slate-500 text-[11px]">10.149.227.4/data (Analog A0)</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Active</span>
              </div>

              <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-bioblue">Agent-4: Automated Care Trigger</p>
                  <p className="text-slate-500 text-[11px]">10.149.227.50 Smart Valve</p>
                </div>
                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">Standby</span>
              </div>
            </div>
          </div>
        </div>

        {/* Add New Node Form & Live Log Console (Right 1 col) */}
        <div className="space-y-6">
          
          {/* Form to Register Custom IP Node */}
          <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-bioblue flex items-center gap-2">
              <Plus size={18} className="text-bioskyblue" /> Register New IP Device Node
            </h3>

            <form onSubmit={handleAddNode} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-bioblue mb-1">Device Name</label>
                <input
                  type="text"
                  placeholder="e.g. Greenhouse ESP32 Sensor"
                  value={newNameInput}
                  onChange={(e) => setNewNameInput(e.target.value)}
                  className="w-full bg-sky-50 border border-sky-200 rounded-xl px-3 py-2 text-slate-700 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block font-bold text-bioblue mb-1">IP Address</label>
                  <input
                    type="text"
                    placeholder="10.149.227.x"
                    value={newIpInput}
                    onChange={(e) => setNewIpInput(e.target.value)}
                    className="w-full bg-sky-50 border border-sky-200 rounded-xl px-3 py-2 text-slate-700 outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-bioblue mb-1">Port</label>
                  <input
                    type="text"
                    placeholder="80"
                    value={newPortInput}
                    onChange={(e) => setNewPortInput(e.target.value)}
                    className="w-full bg-sky-50 border border-sky-200 rounded-xl px-3 py-2 text-slate-700 outline-none font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-bioblue text-white font-bold py-3 rounded-xl hover:bg-bioskyblue transition-colors shadow-lg shadow-bioblue/30 text-xs"
              >
                Register & Attach Node
              </button>
            </form>
          </div>

          {/* IP-Verse Live Terminal Log */}
          <div className="bg-slate-950 text-emerald-400 font-mono rounded-2xl p-4 shadow-xl border border-slate-800 space-y-2 text-[11px]">
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
              <span className="flex items-center gap-1.5 font-bold">
                <Terminal size={14} className="text-bioskyblue" /> IP-Verse System Log
              </span>
              <span className="text-[10px]">LIVE</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {activeConsoleLog.map((log, idx) => (
                <p key={idx} className="leading-relaxed">{log}</p>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
