import React, { useEffect, useState } from "react";
import {
  Activity,
  Droplet,
  Gauge,
  ThermometerSun,
  Waves,
  BarChart3,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { io, Socket } from "socket.io-client";

// ==================== TYPES ====================
interface DataValue {
  value: number;
  unit: string;
}

interface OfftakeData {
  reservoir_water_level_1: DataValue;
  reservoir_turbidity_1: DataValue;
  reservoir_ph_1: DataValue;
  reservoir_chlorine_1: DataValue;
  reservoir_temperature_1: DataValue;
  Matang_Bayu_Flow: DataValue;
  Matang_Bayu_Cubic: DataValue;
  Lhoksukon_Flow: DataValue;
  Lhoksukon_Cubic: DataValue;
  Matang_Bayu_Pressure: DataValue;
  Lhoksukon_Pressure: DataValue;
  Brigif_Pressure: DataValue;
}

interface ScadaData {
  timestamp: string;
  offtake: OfftakeData;
}

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  unit: string;
  color: string;
  bgGradient: string;
  trend?: number;
}

interface FlowCardProps {
  location: string;
  flow: string;
  cubic: string;
  pressure: string;
  index: number;
}

type TabType = "overview" | "reservoir" | "distribution";

// ==================== APP ====================
const App: React.FC = () => {
  const [data, setData] = useState<ScadaData>({
    timestamp: "2025-11-05 09:46:46",
    offtake: {
      reservoir_water_level_1: { value: 2.654, unit: "m" },
      reservoir_turbidity_1: { value: 4.326, unit: "NTU" },
      reservoir_ph_1: { value: 7.701, unit: "pH" },
      reservoir_chlorine_1: { value: 0.217, unit: "mg/L" },
      reservoir_temperature_1: { value: 27.482, unit: "C" },
      Matang_Bayu_Flow: { value: 267.882, unit: "m3/h" },
      Matang_Bayu_Cubic: { value: 4016.091, unit: "m3" },
      Lhoksukon_Flow: { value: 146.174, unit: "m3/h" },
      Lhoksukon_Cubic: { value: 2678.064, unit: "m3" },
      Matang_Bayu_Pressure: { value: 2.789, unit: "bar" },
      Lhoksukon_Pressure: { value: 3.319, unit: "bar" },
      Brigif_Pressure: { value: 3.361, unit: "bar" },
    },
  });

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  useEffect(() => {
    const socket: Socket = io("https://scada.tirtapase.id:5000", {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    let lastUpdate = 0;

    socket.on("connect", () => {
      console.log("✅ Connected to Socket.IO server");
      setIsConnected(true);
    });

    socket.on("mqtt_message", (data) => {
      const now = Date.now();
      if (now - lastUpdate >= 100000) {
        // 10000 ms = 10 detik
        console.log("📨 Received MQTT data:", data);
        setData(data);
        lastUpdate = now;
      }
    });

    socket.on("disconnect", () => {
      console.log("🔌 Disconnected from server");
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
      console.log("👋 Socket disconnected");
    };
  }, []);

  // ==================== COMPONENTS ====================
  const MetricCard: React.FC<MetricCardProps> = ({
    icon: Icon,
    title,
    value,
    unit,
    color,
    bgGradient,
    trend,
  }) => (
    <div className="group relative bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/50 hover:border-slate-700 transition-all duration-500 overflow-hidden">
      {/* Animated background effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
      ></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div
            className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg transform group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="w-7 h-7 text-white" />
          </div>
          {trend && (
            <div
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${
                trend > 0
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}
            >
              {trend > 0 ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span className="text-xs font-semibold">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>

        <h3 className="text-slate-400 text-sm font-medium mb-3 tracking-wide uppercase">
          {title}
        </h3>

        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white tracking-tight">
            {value}
          </span>
          <span className="text-slate-500 text-base font-medium">{unit}</span>
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}
      ></div>
    </div>
  );

  const FlowCard: React.FC<FlowCardProps> = ({
    location,
    flow,
    cubic,
    pressure,
    index,
  }) => {
    const gradients = [
      "from-cyan-500 to-blue-500",
      "from-violet-500 to-purple-500",
      "from-orange-500 to-pink-500",
    ];

    return (
      <div className="group relative bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/50 hover:border-slate-700 transition-all duration-500 overflow-hidden">
        {/* Animated gradient background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradients[index]} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
        ></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`p-2.5 rounded-xl bg-gradient-to-br ${gradients[index]} shadow-lg`}
            >
              <Waves className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">{location}</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 bg-slate-800/40 rounded-xl border border-slate-800/50 hover:bg-slate-800/60 transition-colors duration-200">
              <span className="text-slate-400 text-sm font-medium">
                Flow Rate
              </span>
              <span className="text-white font-bold text-lg">
                {flow}{" "}
                <span className="text-sm text-slate-400 font-normal">m³/h</span>
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-800/40 rounded-xl border border-slate-800/50 hover:bg-slate-800/60 transition-colors duration-200">
              <span className="text-slate-400 text-sm font-medium">
                Total Volume
              </span>
              <span className="text-white font-bold text-lg">
                {cubic}{" "}
                <span className="text-sm text-slate-400 font-normal">m³</span>
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-800/40 rounded-xl border border-slate-800/50 hover:bg-slate-800/60 transition-colors duration-200">
              <span className="text-slate-400 text-sm font-medium">
                Pressure
              </span>
              <span className="text-white font-bold text-lg">
                {pressure}{" "}
                <span className="text-sm text-slate-400 font-normal">bar</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradients[index]} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}
        ></div>
      </div>
    );
  };

  const tabs: {
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "reservoir", label: "Reservoir", icon: Droplet },
    { id: "distribution", label: "Distribution", icon: Waves },
  ];

  // ==================== UI ====================
  return (
    <div className="min-h-screen min-w-[99vw] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative z-10 px-6 py-8 max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-2xl shadow-2xl">
                  <Activity className="w-10 h-10 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent mb-2">
                  IPA Lhoksukon 3
                </h1>
                <p className="text-slate-400 text-base font-medium">
                  Real-time Water Treatment Monitoring System
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-5 py-3 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800/50">
                <div className="relative">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isConnected ? "bg-emerald-400" : "bg-rose-400"
                    }`}
                  ></div>
                  {isConnected && (
                    <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
                  )}
                </div>
                <span className="text-sm font-semibold text-slate-300">
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <div className="px-5 py-3 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800/50">
                <span className="text-sm font-mono text-slate-300">
                  {data.timestamp}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 bg-slate-900/50 backdrop-blur-sm p-2 rounded-2xl border border-slate-800/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-xl shadow-blue-500/25 scale-105"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Reservoir Quality Metrics */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Reservoir Quality Parameters
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
                <MetricCard
                  icon={Droplet}
                  title="Water Level"
                  value={data.offtake.reservoir_water_level_1.value.toFixed(2)}
                  unit="m"
                  color="from-blue-500 to-blue-600"
                  bgGradient="from-blue-500 to-blue-600"
                  trend={2.3}
                />
                <MetricCard
                  icon={AlertCircle}
                  title="Turbidity"
                  value={data.offtake.reservoir_turbidity_1.value.toFixed(2)}
                  unit="NTU"
                  color="from-amber-500 to-orange-600"
                  bgGradient="from-amber-500 to-orange-600"
                  trend={-1.2}
                />
                <MetricCard
                  icon={Activity}
                  title="pH Level"
                  value={data.offtake.reservoir_ph_1.value.toFixed(2)}
                  unit="pH"
                  color="from-emerald-500 to-green-600"
                  bgGradient="from-emerald-500 to-green-600"
                />
                <MetricCard
                  icon={Waves}
                  title="Chlorine"
                  value={data.offtake.reservoir_chlorine_1.value.toFixed(3)}
                  unit="mg/L"
                  color="from-cyan-500 to-teal-600"
                  bgGradient="from-cyan-500 to-teal-600"
                />
                <MetricCard
                  icon={ThermometerSun}
                  title="Temperature"
                  value={data.offtake.reservoir_temperature_1.value.toFixed(1)}
                  unit="°C"
                  color="from-rose-500 to-pink-600"
                  bgGradient="from-rose-500 to-pink-600"
                />
              </div>
            </div>

            {/* Distribution Flow */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500">
                  <Gauge className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Distribution Network
                </h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <FlowCard
                  location="Matang Bayu"
                  flow={data.offtake.Matang_Bayu_Flow.value.toFixed(2)}
                  cubic={data.offtake.Matang_Bayu_Cubic.value.toFixed(2)}
                  pressure={data.offtake.Matang_Bayu_Pressure.value.toFixed(2)}
                  index={0}
                />
                <FlowCard
                  location="Lhoksukon"
                  flow={data.offtake.Lhoksukon_Flow.value.toFixed(2)}
                  cubic={data.offtake.Lhoksukon_Cubic.value.toFixed(2)}
                  pressure={data.offtake.Lhoksukon_Pressure.value.toFixed(2)}
                  index={1}
                />
                <FlowCard
                  location="Brigif"
                  flow="--"
                  cubic="--"
                  pressure={data.offtake.Brigif_Pressure.value.toFixed(2)}
                  index={2}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "reservoir" && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative bg-slate-900/50 backdrop-blur-sm p-8 rounded-full border border-slate-800/50">
                <Activity className="w-20 h-20 text-slate-600" />
              </div>
            </div>
            <p className="text-slate-400 text-lg mt-8 font-medium">
              Reservoir detailed view - Coming soon
            </p>
          </div>
        )}

        {activeTab === "distribution" && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative bg-slate-900/50 backdrop-blur-sm p-8 rounded-full border border-slate-800/50">
                <Waves className="w-20 h-20 text-slate-600" />
              </div>
            </div>
            <p className="text-slate-400 text-lg mt-8 font-medium">
              Distribution network analysis - Coming soon
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
