import React from 'react';
import { Send, DivideIcon as LucideIcon, AlertTriangle } from 'lucide-react';

interface FleetControlProps {
  onTakeoffAll: () => void;
  onLandAll: () => void;
  onEmergencyAll: () => void;
  connectedCount: number;
  totalCount: number;
}

export function FleetControls({ 
  onTakeoffAll, 
  onLandAll, 
  onEmergencyAll,
  connectedCount,
  totalCount
}: FleetControlProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Fleet Controls</h2>
        <div className="text-sm text-gray-500">
          {connectedCount}/{totalCount} drones connected
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={onTakeoffAll}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          disabled={connectedCount === 0}
        >
          Take Off All
        </button>
        <button
          onClick={onLandAll}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          disabled={connectedCount === 0}
        >
          Land All
        </button>
        <button
          onClick={onEmergencyAll}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
          disabled={connectedCount === 0}
        >
          <AlertTriangle className="w-5 h-5" />
          <span>Emergency Stop All</span>
        </button>
      </div>
    </div>
  );
}