import React, { useRef, useEffect } from "react";
import { Card, Button, Tooltip, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import * as echarts from "echarts";
import type { EChartsOption } from "echarts";

interface ChartPreviewProps {
  chartOptions: EChartsOption;
  zoom: number;
}

const ChartPreview: React.FC<ChartPreviewProps> = ({ chartOptions, zoom }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      let resizeTimeout: ReturnType<typeof setTimeout>;
      const resizeObserver = new ResizeObserver((entries) => {
        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
        }

        resizeTimeout = setTimeout(() => {
          if (chartInstance.current) {
            chartInstance.current.resize();
          }
        }, 100);
      });

      resizeObserver.observe(chartRef.current);
      chartInstance.current.setOption(chartOptions, true);

      return () => {
        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
        }
        resizeObserver.disconnect();
        if (chartInstance.current) {
          chartInstance.current.dispose();
          chartInstance.current = null;
        }
      };
    }
  }, [chartOptions]);

  const handleExport = () => {
    if (chartInstance.current) {
      const url = chartInstance.current.getDataURL({
        type: "png",
        pixelRatio: 2,
        backgroundColor: "#fff",
      });
      if (url) {
        const a = document.createElement("a");
        a.href = url;
        a.download = "chart-export.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        message.success("グラフをエクスポートしました");
      }
    }
  };

  return (
    <Card className="card fade-in">
      <div className="controls">
        <h2 className="card-title">グラフプレビュー</h2>
        <div className="button-group">
          <Tooltip title="グラフをエクスポート">
            <Button
              icon={<UploadOutlined />}
              onClick={handleExport}
              size="large"
            />
          </Tooltip>
        </div>
      </div>

      <div className="chart-container fade-in">
        <div
          ref={chartRef}
          className="w-full h-[600px] transition-transform origin-top-left"
          style={{ minHeight: "600px", transform: `scale(${zoom / 100})` }}
        ></div>
      </div>
    </Card>
  );
};

export default ChartPreview;
