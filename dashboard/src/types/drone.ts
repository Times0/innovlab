export interface Drone {
  id: string;
  ipAddress: string;
  batteryLevel: number | null;
  status: "airborne" | "grounded";
  isConnected: boolean;
  lastCommunication: string | null;
}

export interface DroneCommand {
  type: "takeoff" | "land" | "emergency";
  droneId?: string;
}

export type DroneCommand = "forward" | "backward" | "left" | "right" | "flip";
