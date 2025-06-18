import React from "react";
import { Card, Table } from "antd";
import type { ChartData } from "../types/index";

interface DataPreviewProps {
  data: ChartData | null;
  maxRows?: number;
}

const DataPreview: React.FC<DataPreviewProps> = ({ data, maxRows = 10 }) => {
  if (!data) return null;

  const columns = data.features.map((feature: string, index: number) => ({
    title: feature,
    dataIndex: index,
    key: index,
  }));

  const dataSource = data.records
    .slice(0, maxRows)
    .map((record: (string | number)[], index: number) => ({
      key: index,
      ...record.reduce(
        (
          acc: Record<string, string | number>,
          val: string | number,
          idx: number
        ) => ({ ...acc, [idx]: val }),
        {}
      ),
    }));

  return (
    <Card className="card fade-in mt-4">
      <h3 className="text-lg font-semibold mb-4">データプレビュー</h3>
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        size="small"
        scroll={{ x: true }}
      />
      {data.records.length > maxRows && (
        <p className="text-sm text-gray-500 mt-2">
          表示: {maxRows}行 / 全{data.records.length}行
        </p>
      )}
    </Card>
  );
};

export default DataPreview;
