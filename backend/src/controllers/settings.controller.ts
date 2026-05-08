import type { Request, Response } from "express";
import { settingsService } from "../services/settings.service";
import { ApiError } from "../utils/api-error";

export const settingsController = {
  getSettings(req: Request, res: Response) {
    if (req.user?.role !== "admin") throw ApiError.forbidden("Admin only");
    const settings = settingsService.getSettings();
    res.json({ success: true, data: settings });
  },

  updateSettings(req: Request, res: Response) {
    if (req.user?.role !== "admin") throw ApiError.forbidden("Admin only");
    const { googleApiKey, useLivePlaces } = req.body;
    
    const updates: any = {};
    if (typeof googleApiKey === "string") updates.googleApiKey = googleApiKey;
    if (typeof useLivePlaces === "boolean") updates.useLivePlaces = useLivePlaces;
    
    const updated = settingsService.updateSettings(updates);
    res.json({ success: true, data: updated });
  },
};
