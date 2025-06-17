import React from "react";
import { Card, Typography, Space, Divider } from "antd";

const { Title, Text } = Typography;

interface StatisticsPanelProps {
  data: {
    xData: number[];
    yData: number[];
  };
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ data }) => {
  const { xData, yData } = data;

  // 相関係数の計算
  const calculateCorrelation = (x: number[], y: number[]): number => {
    const n = x.length;
    if (n === 0) return 0;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, x, i) => sum + x * y[i], 0);
    const sumX2 = x.reduce((sum, x) => sum + x * x, 0);
    const sumY2 = y.reduce((sum, y) => sum + y * y, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt(
      (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
    );

    return denominator === 0 ? 0 : numerator / denominator;
  };

  // 平均値の計算
  const calculateMean = (arr: number[]): number => {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  };

  // 中央値の計算
  const calculateMedian = (arr: number[]): number => {
    const sorted = [...arr].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    return sorted[middle];
  };

  // 標準偏差の計算
  const calculateStdDev = (arr: number[]): number => {
    const mean = calculateMean(arr);
    const squareDiffs = arr.map((value) => {
      const diff = value - mean;
      return diff * diff;
    });
    const avgSquareDiff = calculateMean(squareDiffs);
    return Math.sqrt(avgSquareDiff);
  };

  const correlation = calculateCorrelation(xData, yData);
  const xMean = calculateMean(xData);
  const yMean = calculateMean(yData);
  const xMedian = calculateMedian(xData);
  const yMedian = calculateMedian(yData);
  const xStdDev = calculateStdDev(xData);
  const yStdDev = calculateStdDev(yData);

  return (
    <Card title="統計情報" className="statistics-panel">
      <Space direction="vertical" style={{ width: "100%" }}>
        <div>
          <Title level={5}>相関係数</Title>
          <Text>{correlation.toFixed(3)}</Text>
        </div>
        <Divider />
        <div>
          <Title level={5}>X軸の統計</Title>
          <Space direction="vertical">
            <Text>平均値: {xMean.toFixed(2)}</Text>
            <Text>中央値: {xMedian.toFixed(2)}</Text>
            <Text>標準偏差: {xStdDev.toFixed(2)}</Text>
          </Space>
        </div>
        <Divider />
        <div>
          <Title level={5}>Y軸の統計</Title>
          <Space direction="vertical">
            <Text>平均値: {yMean.toFixed(2)}</Text>
            <Text>中央値: {yMedian.toFixed(2)}</Text>
            <Text>標準偏差: {yStdDev.toFixed(2)}</Text>
          </Space>
        </div>
      </Space>
    </Card>
  );
};

export default StatisticsPanel;
