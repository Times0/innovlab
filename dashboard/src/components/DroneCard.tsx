import React from "react";
import {
  Battery,
  Wifi,
  WifiOff,
  Plane,
  PlaneLanding,
  AlertTriangle,
} from "lucide-react";
import type { Drone } from "../types/drone";

interface DroneCardProps {
  drone: Drone;
  onSelect: (id: string, selected: boolean) => void;
  isSelected: boolean;
  onRemove: (id: string) => void;
}

export function DroneCard({
  drone,
  onSelect,
  isSelected,
  onRemove,
}: DroneCardProps) {
  const statusColor = drone.isConnected ? "bg-green-500" : "bg-red-500";
  const batteryColor =
    drone.batteryLevel !== null && drone.batteryLevel > 70
      ? "text-green-500"
      : drone.batteryLevel !== null && drone.batteryLevel > 30
      ? "text-yellow-500"
      : "text-red-500";

  return (
    <div
      className={`bg-white rounded-lg shadow-lg p-6 space-y-4 cursor-pointer ${
        isSelected ? "ring-2 ring-blue-500" : ""
      }`}
      onClick={() => onSelect(drone.id, !isSelected)}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => e.stopPropagation()}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(drone.id);
            }}
            className="p-1 hover:bg-red-100 rounded-full"
          >
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </button>
          <h3 className="text-lg font-semibold">{drone.ipAddress}</h3>
        </div>
        <div className="flex items-center space-x-2">
          {drone.isConnected ? (
            <Wifi className="text-green-500 w-5 h-5" />
          ) : (
            <WifiOff className="text-red-500 w-5 h-5" />
          )}
          <div className={`w-3 h-3 rounded-full ${statusColor}`} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Battery className={`w-5 h-5 ${batteryColor}`} />
          <span>{drone.batteryLevel}%</span>
        </div>
        <div className="flex items-center space-x-2">
          {drone.status === "airborne" ? (
            <Plane className="w-5 h-5 text-blue-500" />
          ) : (
            <PlaneLanding className="w-5 h-5 text-gray-500" />
          )}
          <span className="capitalize">{drone.status}</span>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        Last Update: {new Date(drone.lastCommunication).toLocaleString()}
      </div>
    </div>
  );
}
