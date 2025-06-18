import React from "react";
import { Card, Button, Input, Radio, ColorPicker, message } from "antd";
import type { Color } from "antd/es/color-picker";
import type { RadioChangeEvent } from "antd/es/radio";
import type { ChangeEvent } from "react";
import {
  BarChartOutlined,
  LineChartOutlined,
  DotChartOutlined,
  AreaChartOutlined,
  BoxPlotOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import type { GraphSettings } from "../types/index";

interface CustomizationPanelProps {
  settings: GraphSettings;
  onSettingsChange: (settings: Partial<GraphSettings>) => void;
}

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  settings,
  onSettingsChange,
}) => {
  const chartTypeButtons = [
    { type: "bar" as const, icon: <BarChartOutlined />, label: "棒グラフ" },
    {
      type: "line" as const,
      icon: <LineChartOutlined />,
      label: "折れ線グラフ",
    },
    { type: "scatter" as const, icon: <DotChartOutlined />, label: "散布図" },
    { type: "area" as const, icon: <AreaChartOutlined />, label: "累積グラフ" },
    { type: "boxplot" as const, icon: <BoxPlotOutlined />, label: "箱ひげ図" },
  ];

  return (
    <div className="space-y-4">
      <Card title="グラフタイプ" className="card fade-in">
        <div className="grid grid-cols-2 gap-2">
          {chartTypeButtons.map((button) => (
            <Button
              key={button.type}
              type={settings.chartType === button.type ? "primary" : "default"}
              icon={button.icon}
              onClick={() => {
                onSettingsChange({ chartType: button.type });
              }}
              size="large"
            >
              {button.label}
            </Button>
          ))}
        </div>
      </Card>

      <Card title="グラフカスタマイズ" className="card fade-in">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">X軸ラベル</p>
            <Input
              value={settings.xAxisLabel}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onSettingsChange({ xAxisLabel: e.target.value })
              }
              placeholder="X軸ラベル"
              size="large"
            />
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Y軸ラベル</p>
            <Input
              value={settings.yAxisLabel}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onSettingsChange({ yAxisLabel: e.target.value })
              }
              placeholder="Y軸ラベル"
              size="large"
            />
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">凡例の位置</p>
            <Radio.Group
              value={settings.legendPosition}
              onChange={(e: RadioChangeEvent) =>
                onSettingsChange({ legendPosition: e.target.value })
              }
              className="w-full"
              size="large"
            >
              <div className="grid grid-cols-2 gap-2">
                <Radio.Button value="top">上部</Radio.Button>
                <Radio.Button value="right">右側</Radio.Button>
                <Radio.Button value="bottom">下部</Radio.Button>
                <Radio.Button value="left">左側</Radio.Button>
              </div>
            </Radio.Group>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">カラーパレット</p>
            <div className="grid grid-cols-5 gap-2">
              {settings.colorPalette.map((color: string, index: number) => (
                <ColorPicker
                  key={index}
                  value={color}
                  onChange={(color: Color) => {
                    const newPalette = [...settings.colorPalette];
                    newPalette[index] = color.toHexString();
                    onSettingsChange({ colorPalette: newPalette });
                  }}
                  size="large"
                />
              ))}
            </div>
          </div>

          <div>
            <Button
              type="primary"
              block
              icon={<SettingOutlined />}
              onClick={() => message.success("設定が適用されました")}
              size="large"
            >
              設定を適用
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CustomizationPanel;
