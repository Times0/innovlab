import React, { useState } from "react";
import { Plus } from "lucide-react";

interface AddDroneFormProps {
  onAdd: (ipAddress: string) => void;
}

export function AddDroneForm({ onAdd }: AddDroneFormProps) {
  const [ipAddress, setIpAddress] = useState("192.168.10.");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onAdd(ipAddress);
    setIpAddress("");
    setError("");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex space-x-4">
        <div className="flex-1">
          <input
            type="text"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            placeholder="Enter drone IP address"
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Drone</span>
        </button>
      </div>
    </form>
  );
}
