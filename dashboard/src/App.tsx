import { useState, useEffect } from "react";
import { DroneCard } from "./components/DroneCard";
import { AddDroneForm } from "./components/AddDroneForm";
import type { Drone, DroneCommand } from "./types/drone";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [drones, setDrones] = useState<Drone[]>(() => {
    const savedDrones = localStorage.getItem("drones");
    return savedDrones ? JSON.parse(savedDrones) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDrones, setSelectedDrones] = useState<Set<string>>(new Set());
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    localStorage.setItem("drones", JSON.stringify(drones));
  }, [drones]);


  const handleDroneSelect = (id: string, selected: boolean) => {
    setSelectedDrones((prev) => {
      const newSelection = new Set(prev);
      if (selected) {
        newSelection.add(id);
      } else {
        newSelection.delete(id);
      }
      return newSelection;
    });
  };

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const selectedDronesData = drones.filter((drone) =>
        selectedDrones.has(drone.id)
      );
      const response = await fetch(`${API_URL}/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ips: selectedDronesData.map((drone) => drone.ipAddress),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect to drones");
      }

      setDrones((currentDrones) =>
        currentDrones.map((drone) => ({
          ...drone,
          isConnected: selectedDrones.has(drone.id),
          lastCommunication: selectedDrones.has(drone.id)
            ? new Date().toISOString()
            : drone.lastCommunication,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/disconnect`);

      if (!response.ok) {
        throw new Error("Failed to disconnect from drones");
      }

      setDrones((currentDrones) =>
        currentDrones.map((drone) => ({
          ...drone,
          isConnected: false,
          lastCommunication: new Date().toISOString(),
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disconnect");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckBattery = async () => {
    setLoading(true);
    setError(null);
    try {
      const batteryResponse = await fetch(`${API_URL}/get_battery`);
      if (!batteryResponse.ok) {
        throw new Error("Failed to fetch battery levels");
      }
      const batteryLevels = await batteryResponse.json();

      setDrones((currentDrones) =>
        currentDrones.map((drone) => ({
          ...drone,
          batteryLevel: batteryLevels[drone.ipAddress] ?? null,
          lastCommunication: new Date().toISOString(),
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check battery");
    } finally {
      setLoading(false);
    }
  };

  const handleTakeoff = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/takeoff`);

      if (!response.ok) {
        throw new Error("Failed to initiate takeoff");
      }
      
      setDrones((currentDrones) =>
        currentDrones.map((drone) => ({
          ...drone,
          status: drone.isConnected ? "airborne" : drone.status,
          lastCommunication: drone.isConnected ? new Date().toISOString() : drone.lastCommunication,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to takeoff");
    } finally {
      setLoading(false);
    }
  };

  const handleLand = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/land`);

      if (!response.ok) {
        throw new Error("Failed to initiate landing");
      }

      setDrones((currentDrones) =>
        currentDrones.map((drone) => ({
          ...drone,
          status: drone.isConnected ? "grounded" : drone.status,
          lastCommunication: drone.isConnected ? new Date().toISOString() : drone.lastCommunication,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to land");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDrone = (ipAddressLastDigit: string) => {
    const newDrone: Drone = {
      id: Math.random().toString(36).substr(2, 9),
      ipAddress: ipAddressLastDigit,
      batteryLevel: null,
      status: "grounded",
      isConnected: false,
      lastCommunication: null,
    };
    setDrones([...drones, newDrone]);
  };

  const handleRemoveDrone = (id: string) => {
    setDrones(drones.filter((drone) => drone.id !== id));
    setSelectedDrones((prev) => {
      const newSelection = new Set(prev);
      newSelection.delete(id);
      return newSelection;
    });
  };

  const sendCommand = async (command: DroneCommand) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/command`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ command }),
      });

      if (!response.ok) {
        throw new Error(`Failed to execute command: ${command}`);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to execute command: ${command}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleScanAndConnect = async () => {
    setScanning(true);
    setError(null);
    try {
      // First scan for available drones
      const scanResponse = await fetch(`${API_URL}/scan`);
      if (!scanResponse.ok) {
        throw new Error("Failed to scan for drones");
      }
      const availableIps: string[] = await scanResponse.json();
      
      // Add new drones that aren't already in the list
      const existingIps = new Set(drones.map(drone => drone.ipAddress));
      const newDrones = availableIps
        .filter(ip => !existingIps.has(ip))
        .map(ip => ({
          id: Math.random().toString(36).substr(2, 9),
          ipAddress: ip,
          batteryLevel: null,
          status: "grounded",
          isConnected: false,
          lastCommunication: null,
        }));
      if (newDrones.length > 0) {
        setDrones(currentDrones => [...currentDrones, ...newDrones.map(drone => ({
          ...drone,
          status: "grounded" as const
        }))]);
      }

      // Attempt to connect to all discovered drones
      const connectResponse = await fetch(`${API_URL}/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ips: availableIps,
        }),
      });

      if (!connectResponse.ok) {
        throw new Error("Failed to connect to discovered drones");
      }

      // Update the connection status for all drones
      setDrones(currentDrones =>
        currentDrones.map(drone => ({
          ...drone,
          isConnected: availableIps.includes(drone.ipAddress),
          lastCommunication: availableIps.includes(drone.ipAddress)
            ? new Date().toISOString()
            : drone.lastCommunication,
        }))
      );

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scan and connect");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-slate-800">
              Drone Dashboard
            </h1>
            <span className="px-3 py-1 bg-slate-100 rounded-full text-slate-600 text-sm">
              Total Drones: {drones.length}
            </span>
          </div>
          {loading && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-sm text-blue-500">Processing...</span>
            </div>
          )}
          {error && (
            <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-sm text-red-600" title={error}>
                {error}
              </span>
            </div>
          )}
        </div>

        {/* Control Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Connection Controls */}
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Connection</h2>
            <div className="space-y-3">
              <button
                onClick={handleScanAndConnect}
                className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                disabled={scanning}
              >
                {scanning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Scanning...
                  </>
                ) : (
                  "Scan & Connect All"
                )}
              </button>
              <button
                onClick={handleConnect}
                className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                disabled={drones.length === 0 || selectedDrones.size === 0}
              >
                Connect Selected
              </button>
              <button
                onClick={handleDisconnect}
                className="w-full border border-red-200 text-red-600 px-4 py-2.5 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                disabled={!drones.some((drone) => drone.isConnected)}
              >
                Disconnect All
              </button>
            </div>
          </div>

          {/* Flight Controls */}
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Flight Controls</h2>
            <div className="space-y-3">
              <button
                onClick={handleTakeoff}
                className="w-full bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                disabled={!drones.some((drone) => drone.isConnected)}
              >
                Take Off All
              </button>
              <button
                onClick={handleLand}
                className="w-full bg-amber-600 text-white px-4 py-2.5 rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
                disabled={!drones.some((drone) => drone.isConnected)}
              >
                Land All
              </button>
              <button
                onClick={() => sendCommand("flip")}
                className="w-full border border-purple-200 text-purple-600 px-4 py-2.5 rounded-lg hover:bg-purple-50 disabled:opacity-50 transition-colors"
                disabled={!drones.some((drone) => drone.isConnected)}
              >
                Perform Flip
              </button>
            </div>
          </div>

          {/* Direction Controls */}
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Direction Controls</h2>
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => sendCommand("forward")}
                className="w-full py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
                disabled={!drones.some((drone) => drone.isConnected)}
              >
                Forward
              </button>
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => sendCommand("left")}
                  className="flex-1 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
                  disabled={!drones.some((drone) => drone.isConnected)}
                >
                  Left
                </button>
                <button
                  onClick={() => sendCommand("right")}
                  className="flex-1 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
                  disabled={!drones.some((drone) => drone.isConnected)}
                >
                  Right
                </button>
              </div>
              <button
                onClick={() => sendCommand("backward")}
                className="w-full py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
                disabled={!drones.some((drone) => drone.isConnected)}
              >
                Backward
              </button>
            </div>
          </div>
        </div>

        {/* Drone Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drones.map((drone) => (
            <DroneCard
              key={drone.id}
              drone={drone}
              onRemove={handleRemoveDrone}
              onSelect={handleDroneSelect}
              isSelected={selectedDrones.has(drone.id)}
            />
          ))}
        </div>
        
        {/* Manual Drone Addition moved to bottom */}
        <div className="mt-8 opacity-75 hover:opacity-100 transition-opacity">
          <AddDroneForm onAdd={handleAddDrone} />
        </div>
      </div>
    </div>
  );
}

export default App;
