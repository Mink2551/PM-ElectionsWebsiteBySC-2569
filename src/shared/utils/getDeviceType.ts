import { DeviceType } from "../types/deviceType";

export function getDeviceType(width: number): DeviceType {
  if (width <= 640) return "phone";
  if (width <= 1024) return "ipad";
  if (width <= 1280) return "laptop";
  return "pc";
}
