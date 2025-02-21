import React, { useState } from "react";
import { Plus } from "lucide-react";

interface AddDroneFormProps {
  onAdd: (ipAddress: string) => void;
}

const ip_start = "192.168.10.";

export function AddDroneForm({ onAdd }: AddDroneFormProps) {
  const [ipAddress, setIpAddress] = useState(ip_start);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(ipAddress);
    setIpAddress(ip_start);
    setError("");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        Manual Drone Addition
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-3">
          <input
            type="text"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            placeholder="Enter drone IP address"
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
    </div>
  );
}
