import type { GamifyProject, Scene } from "./types";

export function parseProjectJson(json: string): GamifyProject {
  const parsed = JSON.parse(json) as GamifyProject;
  if (!parsed.id || !parsed.name || !parsed.defaultScenePath) {
    throw new Error("Invalid project file: id, name, and defaultScenePath are required");
  }
  return parsed;
}

export function parseSceneJson(json: string): Scene {
  const parsed = JSON.parse(json) as Scene;
  if (!parsed.id || !parsed.name || !Array.isArray(parsed.entities)) {
    throw new Error("Invalid scene file: id, name, and entities are required");
  }
  return parsed;
}

export function toPrettyJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}
