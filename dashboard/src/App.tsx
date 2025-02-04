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

  useEffect(() => {
    localStorage.setItem("drones", JSON.stringify(drones));
  }, [drones]);

  /* health check every minute */
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/health_check`);
        if (!response.ok) {
          throw new Error("Failed to health check drones");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to health check drones"
        );
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

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

  // Add keyboard event handler
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!drones.some((drone) => drone.isConnected)) {
        return; // Don't send commands if no drones are connected
      }

      switch (event.key.toLowerCase()) {
        case "arrowup":
          sendCommand("forward");
          break;
        case "arrowdown":
          sendCommand("backward");
          break;
        case "arrowleft":
          sendCommand("left");
          break;
        case "arrowright":
          sendCommand("right");
          break;
        case "f":
          sendCommand("flip");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [drones]); // Depend on drones array to re-attach listener when drone connection status changes

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Drone Battery Monitor
          </h1>
          {loading && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-sm text-blue-500">Processing...</span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-red-500" title={error}>
                Error
              </span>
            </div>
          )}
        </div>

        <div className="flex space-x-4 items-center flex-wrap gap-y-2">
          <button
            onClick={handleConnect}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={drones.length === 0 || selectedDrones.size === 0}
          >
            Connect to Selected Drones
          </button>
          <button
            onClick={handleDisconnect}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
            disabled={
              drones.length === 0 || !drones.some((drone) => drone.isConnected)
            }
          >
            Disconnect Drones
          </button>
          <button
            onClick={handleCheckBattery}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            disabled={
              drones.length === 0 || !drones.some((drone) => drone.isConnected)
            }
          >
            Check Battery Levels
          </button>
          <button
            onClick={handleTakeoff}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
            disabled={
              drones.length === 0 || !drones.some((drone) => drone.isConnected)
            }
          >
            Take Off All
          </button>
          <button
            onClick={handleLand}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
            disabled={
              drones.length === 0 || !drones.some((drone) => drone.isConnected)
            }
          >
            Land All
          </button>
          <button
            onClick={() => sendCommand("flip")}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
            disabled={
              drones.length === 0 || !drones.some((drone) => drone.isConnected)
            }
          >
            Do a Flip!
          </button>
          <span className="text-gray-600">Total Drones: {drones.length}</span>
        </div>

        <AddDroneForm onAdd={handleAddDrone} />

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

        {/* Add keyboard controls help text */}
        <div className="mt-4 p-4 bg-white rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Keyboard Controls:</h2>
          <ul className="space-y-1 text-gray-600">
            <li>↑ - Move Forward</li>
            <li>↓ - Move Backward</li>
            <li>← - Move Left</li>
            <li>→ - Move Right</li>
            <li>F - Do a Flip</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
