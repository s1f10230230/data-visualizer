import React from "react";
import { Card, Select, InputNumber, Button, Radio, message } from "antd";
import type { RadioChangeEvent } from "antd/es/radio";
import type { GraphSettings } from "../types";

const { Option } = Select;

interface SettingsPanelProps {
  settings: GraphSettings;
  availableFeatures: string[];
  onSettingsChange: (settings: Partial<GraphSettings>) => void;
  onReset: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  availableFeatures,
  onSettingsChange,
  onReset,
}) => {
  return (
    <div className="settings-panel">
      <Card title="軸の設定" className="card fade-in">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">X軸の特徴量</p>
            <Select
              style={{ width: "100%" }}
              placeholder="X軸の特徴量を選択"
              value={settings.xAxisFeature}
              onChange={(value) => onSettingsChange({ xAxisFeature: value })}
              size="large"
            >
              {availableFeatures.map((feature) => (
                <Option key={feature} value={feature}>
                  {feature}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Y軸の特徴量</p>
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              placeholder="Y軸の特徴量を選択"
              value={settings.yAxisFeatures}
              onChange={(value) => onSettingsChange({ yAxisFeatures: value })}
              size="large"
            >
              {availableFeatures
                .filter((f) => f !== settings.xAxisFeature)
                .map((feature) => (
                  <Option key={feature} value={feature}>
                    {feature}
                  </Option>
                ))}
            </Select>
          </div>
        </div>
      </Card>

      <Card title="データフィルタリング" className="card fade-in">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">フィルタ対象の列</p>
            <Select
              placeholder="フィルタ対象の列を選択"
              value={settings.filterFeature}
              onChange={(value) => onSettingsChange({ filterFeature: value })}
              style={{ width: "100%" }}
              size="large"
            >
              {availableFeatures.map((feature) => (
                <Option key={feature} value={feature}>
                  {feature}
                </Option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Select
              value={settings.filterOperator}
              onChange={(value) => onSettingsChange({ filterOperator: value })}
              size="large"
            >
              <Option value=">">より大きい</Option>
              <Option value="<">より小さい</Option>
              <Option value="=">等しい</Option>
              <Option value=">=">以上</Option>
              <Option value="<=">以下</Option>
            </Select>
            <InputNumber
              placeholder="値"
              value={settings.filterValue}
              onChange={(value) => onSettingsChange({ filterValue: value })}
              style={{ width: "100%" }}
              size="large"
            />
          </div>

          <Button
            onClick={() => {
              onSettingsChange({
                filterFeature: "",
                filterValue: null,
              });
              message.success("フィルタをクリアしました");
            }}
            size="large"
            block
          >
            フィルタをクリア
          </Button>
        </div>
      </Card>

      <Card title="データソート" className="card fade-in">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">ソート対象の列</p>
            <Select
              placeholder="ソート対象の列を選択"
              value={settings.sortFeature}
              onChange={(value) => onSettingsChange({ sortFeature: value })}
              style={{ width: "100%" }}
              size="large"
            >
              {availableFeatures.map((feature) => (
                <Option key={feature} value={feature}>
                  {feature}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">ソート順</p>
            <Radio.Group
              value={settings.sortOrder}
              onChange={(e: RadioChangeEvent) =>
                onSettingsChange({ sortOrder: e.target.value })
              }
              className="w-full"
              size="large"
            >
              <div className="grid grid-cols-2 gap-2">
                <Radio.Button value="asc">昇順</Radio.Button>
                <Radio.Button value="desc">降順</Radio.Button>
              </div>
            </Radio.Group>
          </div>

          <Button
            onClick={() => {
              onSettingsChange({ sortFeature: "" });
              message.success("ソートをクリアしました");
            }}
            size="large"
            block
          >
            ソートをクリア
          </Button>
        </div>
      </Card>

      <Card title="グラフ操作" className="card fade-in">
        <div className="flex flex-col gap-3">
          <Button danger onClick={onReset} size="large" block>
            グラフをリセット
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPanel;
