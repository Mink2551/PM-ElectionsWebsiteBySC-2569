"use client";

import { useEffect, useState } from "react";
import { getDeviceType } from "../utils/getDeviceType";
import { DeviceType } from "../types/deviceType"

export function useDeviceType(): DeviceType {
  const [device, setDevice] = useState<DeviceType>("pc"); // safe default for SSR

  useEffect(() => {
    // Run ONLY on client
    const update = () => {
      setDevice(getDeviceType(window.innerWidth));
    };

    update(); // initial run
    window.addEventListener("resize", update);

    return () => window.removeEventListener("resize", update);
  }, []);

  return device;
}
