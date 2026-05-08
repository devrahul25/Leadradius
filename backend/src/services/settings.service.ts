import fs from "fs";
import path from "path";
import { logger } from "../config/logger";

const SETTINGS_FILE = path.join(__dirname, "../../settings.json");

interface AppSettings {
  googleApiKey: string;
  useLivePlaces: boolean;
}

const defaultSettings: AppSettings = {
  googleApiKey: "",
  useLivePlaces: false,
};

export const settingsService = {
  getSettings(): AppSettings {
    try {
      if (fs.existsSync(SETTINGS_FILE)) {
        const data = fs.readFileSync(SETTINGS_FILE, "utf-8");
        return { ...defaultSettings, ...JSON.parse(data) };
      }
    } catch (err) {
      logger.error("Failed to read settings.json", { err });
    }
    return defaultSettings;
  },

  updateSettings(updates: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const next = { ...current, ...updates };
    try {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(next, null, 2), "utf-8");
      logger.info("Settings updated", { keys: Object.keys(updates) });
    } catch (err) {
      logger.error("Failed to write settings.json", { err });
    }
    return next;
  },
};
