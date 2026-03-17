import { NormalizationClass } from "./normalization.class";

export function isCanceledState(name?: string | null) {
    const norm = NormalizationClass.normalizeStateName(name);
    return norm.includes("anul") || norm.includes("cancel");
  }