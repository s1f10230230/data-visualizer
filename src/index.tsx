import React from "react";
import { createRoot } from "react-dom/client";
import { ConfigProvider } from "antd";
import jaJP from "antd/locale/ja_JP";
import "./index.css";
import App from "./App";

const container = document.getElementById("root");
if (!container) throw new Error("Failed to find the root element");
const root = createRoot(container);

const AppWithProviders: React.FC = () => (
  <ConfigProvider locale={jaJP}>
    <App />
  </ConfigProvider>
);

root.render(
  <React.StrictMode>
    <AppWithProviders />
  </React.StrictMode>
);
