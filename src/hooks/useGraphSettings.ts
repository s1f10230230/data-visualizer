import { useState, useCallback } from "react";
import { message } from "antd";
import type { GraphSettings, SavedSettings } from "../types/index";

const STORAGE_KEY = "graphSettings";

const useGraphSettings = () => {
  const [settings, setSettings] = useState<GraphSettings>({
    chartType: "bar",
    xAxisFeature: "",
    yAxisFeatures: [],
    xAxisLabel: "",
    yAxisLabel: "",
    legendPosition: "top",
    colorPalette: [
      "#1890ff",
      "#52c41a",
      "#faad14",
      "#f5222d",
      "#722ed1",
      "#13c2c2",
    ],
    zoom: 100,
    filterFeature: "",
    filterOperator: ">",
    filterValue: null,
    sortFeature: "",
    sortOrder: "asc",
  });

  const saveSettings = useCallback(() => {
    const savedSettings = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const newSetting: SavedSettings = {
      ...settings,
      timestamp: new Date().toISOString(),
      name: `設定 ${savedSettings.length + 1}`,
    };
    savedSettings.push(newSetting);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSettings));
    message.success("設定を保存しました");
  }, [settings]);

  const loadSettings = useCallback((savedSetting: SavedSettings) => {
    setSettings(savedSetting);
    message.success("設定を復元しました");
  }, []);

  const getSavedSettings = useCallback((): SavedSettings[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  }, []);

  const deleteSettings = useCallback((index: number) => {
    const savedSettings = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    savedSettings.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSettings));
    message.success("設定を削除しました");
  }, []);

  const updateSettings = useCallback((newSettings: Partial<GraphSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  return {
    settings,
    saveSettings,
    loadSettings,
    getSavedSettings,
    deleteSettings,
    updateSettings,
  };
};

export default useGraphSettings;
