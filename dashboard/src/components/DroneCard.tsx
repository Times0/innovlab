import {
  Battery,
  Plane,
  PlaneLanding,
  X,
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
      className={`bg-white rounded-lg shadow-sm p-6 space-y-4 cursor-pointer relative transition-all ${
        isSelected ? "ring-2 ring-indigo-500" : ""
      }`}
      onClick={() => onSelect(drone.id, !isSelected)}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(drone.id);
        }}
        className="absolute top-3 right-3 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <X className="w-4 h-4 text-slate-400" />
      </button>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => e.stopPropagation()}
            className="w-4 h-4 text-indigo-600 rounded border-slate-300"
          />
          <h3 className="text-lg font-semibold text-slate-800">{drone.ipAddress}</h3>
        </div>
        <div className={`w-3 h-3 rounded-full ${statusColor}`} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2 text-slate-600">
          <Battery className={`w-5 h-5 ${batteryColor}`} />
          <span className="text-sm">{drone.batteryLevel ?? 'N/A'}%</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          {drone.status === "airborne" ? (
            <Plane className="w-5 h-5 text-indigo-500" />
          ) : (
            <PlaneLanding className="w-5 h-5 text-slate-500" />
          )}
          <span className="capitalize text-sm">{drone.status}</span>
        </div>
      </div>
      <div className="text-sm text-slate-500">
        Last Update: {drone.lastCommunication ? new Date(drone.lastCommunication).toLocaleString() : 'Never'}
      </div>
    </div>
  );
}
