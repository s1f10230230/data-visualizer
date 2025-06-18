import React, { useRef, useEffect, useMemo } from "react";
import { message, Alert } from "antd";
import * as echarts from "echarts";
import type { EChartsOption } from "echarts";
import FileUpload from "./components/FileUpload";
import Header from "./components/Header";
import ChartPreview from "./components/ChartPreview";
import SettingsPanel from "./components/SettingsPanel";
import CustomizationPanel from "./components/CustomizationPanel";
import DataPreview from "./components/DataPreview";
import FeedbackForm from "./components/FeedbackForm";
import useGraphSettings from "./hooks/useGraphSettings";
import { parseFile } from "./utils/dataParser";
import type { ChartData } from "./types";
import StatisticsPanel from "./components/StatisticsPanel";

// 統計計算用の関数
const calculateBoxplotData = (values: number[]): number[] => {
  const sortedValues = [...values].sort((a, b) => a - b);
  const q1 = sortedValues[Math.floor(sortedValues.length * 0.25)];
  const q2 = sortedValues[Math.floor(sortedValues.length * 0.5)];
  const q3 = sortedValues[Math.floor(sortedValues.length * 0.75)];
  const min = sortedValues[0];
  const max = sortedValues[sortedValues.length - 1];
  return [min, q1, q2, q3, max];
};

// 相関係数を計算する関数を追加
const calculateCorrelation = (xData: number[], yData: number[]): number => {
  const n = xData.length;
  if (n === 0) return 0;

  const sumX = xData.reduce((a, b) => a + b, 0);
  const sumY = yData.reduce((a, b) => a + b, 0);
  const sumXY = xData.reduce((sum, x, i) => sum + x * yData[i], 0);
  const sumX2 = xData.reduce((sum, x) => sum + x * x, 0);
  const sumY2 = yData.reduce((sum, y) => sum + y * y, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
  );

  return denominator === 0 ? 0 : numerator / denominator;
};

const App: React.FC = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [chartData, setChartData] = React.useState<ChartData | null>(null);
  const [availableFeatures, setAvailableFeatures] = React.useState<string[]>(
    []
  );
  const [hasHeader, setHasHeader] = React.useState<boolean>(true);
  const [encoding, setEncoding] = React.useState<string>("Shift-JIS");

  const { settings, updateSettings } = useGraphSettings();

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // サンプルデータ
  const sampleData = useMemo<ChartData>(
    () => ({
      features: ["月", "売上高", "利益", "顧客数"],
      records: [
        ["1月", 120, 20, 50],
        ["2月", 200, 40, 60],
        ["3月", 150, 50, 70],
        ["4月", 80, 30, 40],
        ["5月", 70, 40, 50],
        ["6月", 110, 60, 80],
      ],
      isSample: true, // サンプルデータであることを示すフラグ
    }),
    []
  );

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    message.loading("ファイルを解析中...", 0); // 解析中のメッセージを表示
    try {
      // Web Worker経由でファイル解析
      const data = await parseFile(selectedFile, hasHeader, encoding);
      setChartData(data);
      setAvailableFeatures(data.features);

      // デフォルトで最初の列をX軸に、残りをY軸の候補に
      if (data.features.length > 0) {
        updateSettings({
          xAxisFeature: data.features[0],
          yAxisFeatures: data.features.slice(1, 2),
        });
      }
      message.success("ファイルの解析に成功しました");
    } catch (error) {
      message.error("ファイルの解析に失敗しました");
      console.error("File parsing error:", error);
    } finally {
      message.destroy(); // ローディングメッセージを閉じる
    }
  };

  // 初期化時にサンプルデータの特徴量を設定
  useEffect(() => {
    const features = sampleData.features;
    setAvailableFeatures(features);
    updateSettings({
      xAxisFeature: features[0],
      yAxisFeatures: [features[1]],
    });
  }, [sampleData, updateSettings]);

  // チャートの初期化と更新
  useEffect(() => {
    if (chartRef.current) {
      // チャートインスタンスが存在しない場合のみ初期化
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      // チャートのサイズを更新
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

      let data = chartData || sampleData;

      // フィルタリング処理
      if (settings.filterFeature && settings.filterValue !== null) {
        const filterIndex = data.features.indexOf(settings.filterFeature);
        if (filterIndex !== -1) {
          const filteredRecords = data.records.filter((record) => {
            const value = record[filterIndex] as number;
            if (settings.filterValue === null) return true;
            switch (settings.filterOperator) {
              case ">":
                return value > settings.filterValue;
              case "<":
                return value < settings.filterValue;
              case "=":
                return value === settings.filterValue;
              case ">=":
                return value >= settings.filterValue;
              case "<=":
                return value <= settings.filterValue;
              default:
                return true;
            }
          });
          data = { ...data, records: filteredRecords };
        }
      }

      // ソート処理
      if (settings.sortFeature) {
        const sortIndex = data.features.indexOf(settings.sortFeature);
        if (sortIndex !== -1) {
          const sortedRecords = [...data.records].sort((a, b) => {
            const aValue = a[sortIndex];
            const bValue = b[sortIndex];

            if (typeof aValue === "number" && typeof bValue === "number") {
              return settings.sortOrder === "asc"
                ? aValue - bValue
                : bValue - aValue;
            } else {
              const aStr = String(aValue);
              const bStr = String(bValue);
              return settings.sortOrder === "asc"
                ? aStr.localeCompare(bStr, "ja")
                : bStr.localeCompare(aStr, "ja");
            }
          });
          data = { ...data, records: sortedRecords };
        }
      }

      const xIndex = data.features.indexOf(settings.xAxisFeature);

      // X軸の値を取得
      const xAxisData = data.records.map(
        (record: (string | number)[]) => record[xIndex]
      );

      // 選択されたY軸特徴量のインデックスを取得
      const yIndices = settings.yAxisFeatures.map((feature: string) =>
        data.features.indexOf(feature)
      );

      // チャートオプションを設定
      const option: EChartsOption = {
        animation: false,
        title: {
          text: "データビジュアライゼーション",
          left: "center",
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: settings.yAxisFeatures,
          orient: "horizontal",
          [settings.legendPosition]: 10,
          top: settings.legendPosition === "top" ? 50 : undefined,
          bottom: settings.legendPosition === "bottom" ? 10 : undefined,
          left: settings.legendPosition === "left" ? 10 : undefined,
          right: settings.legendPosition === "right" ? 10 : undefined,
          width:
            settings.legendPosition === "left" ||
            settings.legendPosition === "right"
              ? 120
              : undefined,
          height:
            settings.legendPosition === "top" ||
            settings.legendPosition === "bottom"
              ? 60
              : undefined,
        },
        grid: {
          left: settings.legendPosition === "left" ? "15%" : "3%",
          right: settings.legendPosition === "right" ? "15%" : "4%",
          top: settings.legendPosition === "top" ? "15%" : "10%",
          bottom: settings.legendPosition === "bottom" ? "15%" : "10%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          name: settings.xAxisLabel,
          data: xAxisData,
        },
        yAxis: {
          type: "value",
          name: settings.yAxisLabel,
        },
        series: yIndices.map((yIndex: number, seriesIndex: number) => {
          const yData = data.records.map(
            (record: (string | number)[]) => record[yIndex]
          );
          const seriesName = data.features[yIndex];

          const baseConfig = {
            name: seriesName,
            data: yData,
            itemStyle: {
              color:
                settings.colorPalette[
                  seriesIndex % settings.colorPalette.length
                ],
            },
            // パフォーマンス最適化設定
            large: true,
            largeThreshold: 1000, // 1000件以上のデータでlargeモードを有効にする
          };

          switch (settings.chartType) {
            case "bar":
              return {
                ...baseConfig,
                type: "bar",
              };
            case "line":
              return {
                ...baseConfig,
                type: "line",
                smooth: true,
              };
            case "scatter":
              // 散布図の場合、相関係数を計算して表示
              const xNumericData = xAxisData.map((x: string | number) =>
                Number(x)
              );
              const yNumericData = yData.map((y: string | number) => Number(y));
              const correlation = calculateCorrelation(
                xNumericData,
                yNumericData
              );

              return {
                ...baseConfig,
                type: "scatter",
                markPoint: {
                  data: [
                    {
                      type: "max",
                      name: "最大値",
                    },
                    {
                      type: "min",
                      name: "最小値",
                    },
                  ],
                },
                markLine: {
                  data: [
                    {
                      type: "average",
                      name: "平均値",
                    },
                  ],
                },
                title: {
                  text: `相関係数: ${correlation.toFixed(2)}`,
                  left: "center",
                },
              };
            case "area":
              return {
                ...baseConfig,
                type: "line",
                areaStyle: {},
                smooth: true,
              };
            case "boxplot":
              // 箱ひげ図用のデータ変換
              const boxplotData = calculateBoxplotData(
                data.records.map(
                  (record: (string | number)[]) => record[yIndex] as number
                )
              );
              return {
                ...baseConfig,
                type: "boxplot",
                data: [boxplotData],
                boxWidth: ["20%", "50%"],
                itemStyle: {
                  color:
                    settings.colorPalette[
                      seriesIndex % settings.colorPalette.length
                    ],
                  borderColor:
                    settings.colorPalette[
                      (seriesIndex + 1) % settings.colorPalette.length
                    ],
                },
                emphasis: {
                  itemStyle: {
                    borderColor:
                      settings.colorPalette[
                        (seriesIndex + 2) % settings.colorPalette.length
                      ],
                    shadowBlur: 10,
                    shadowColor: "rgba(0, 0, 0, 0.3)",
                  },
                },
              };
            default:
              return {
                ...baseConfig,
                type: "bar",
              };
          }
        }),
        dataZoom: [
          {
            type: "inside",
            start: 0,
            end: 100,
          },
          {
            type: "slider",
            start: 0,
            end: 100,
            bottom: "5%",
          },
        ],
      };

      chartInstance.current.setOption(option as any, true);

      // ズーム処理
      chartRef.current.style.transform = `scale(${settings.zoom / 100})`;

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
  }, [chartData, sampleData, settings]);

  const handleReset = () => {
    setFile(null);
    setChartData(null);
    const features = sampleData.features;
    setAvailableFeatures(features);
    updateSettings({
      xAxisFeature: features[0],
      yAxisFeatures: [features[1]],
    });
    message.success("グラフがリセットされました");
  };

  // チャートオプションの生成
  const chartOptions = useMemo<EChartsOption>(() => {
    let data = chartData || sampleData;

    // フィルタリング処理
    if (settings.filterFeature && settings.filterValue !== null) {
      const filterIndex = data.features.indexOf(settings.filterFeature);
      if (filterIndex !== -1) {
        const filteredRecords = data.records.filter((record) => {
          const value = record[filterIndex] as number;
          if (settings.filterValue === null) return true;
          switch (settings.filterOperator) {
            case ">":
              return value > settings.filterValue;
            case "<":
              return value < settings.filterValue;
            case "=":
              return value === settings.filterValue;
            case ">=":
              return value >= settings.filterValue;
            case "<=":
              return value <= settings.filterValue;
            default:
              return true;
          }
        });
        data = { ...data, records: filteredRecords };
      }
    }

    // ソート処理
    if (settings.sortFeature) {
      const sortIndex = data.features.indexOf(settings.sortFeature);
      if (sortIndex !== -1) {
        const sortedRecords = [...data.records].sort((a, b) => {
          const aValue = a[sortIndex];
          const bValue = b[sortIndex];

          if (typeof aValue === "number" && typeof bValue === "number") {
            return settings.sortOrder === "asc"
              ? aValue - bValue
              : bValue - aValue;
          } else {
            const aStr = String(aValue);
            const bStr = String(bValue);
            return settings.sortOrder === "asc"
              ? aStr.localeCompare(bStr, "ja")
              : bStr.localeCompare(aStr, "ja");
          }
        });
        data = { ...data, records: sortedRecords };
      }
    }

    const xIndex = data.features.indexOf(settings.xAxisFeature);

    // X軸の値を取得
    const xAxisData = data.records.map(
      (record: (string | number)[]) => record[xIndex]
    );

    // 選択されたY軸特徴量のインデックスを取得
    const yIndices = settings.yAxisFeatures.map((feature: string) =>
      data.features.indexOf(feature)
    );

    // チャートオプションを設定
    const option: EChartsOption = {
      animation: false,
      title: {
        text: "データビジュアライゼーション",
        left: "center",
      },
      tooltip: {
        trigger: "axis",
      },
      legend: {
        data: settings.yAxisFeatures,
        orient: "horizontal",
        [settings.legendPosition]: 10,
        top: settings.legendPosition === "top" ? 50 : undefined,
        bottom: settings.legendPosition === "bottom" ? 10 : undefined,
        left: settings.legendPosition === "left" ? 10 : undefined,
        right: settings.legendPosition === "right" ? 10 : undefined,
        width:
          settings.legendPosition === "left" ||
          settings.legendPosition === "right"
            ? 120
            : undefined,
        height:
          settings.legendPosition === "top" ||
          settings.legendPosition === "bottom"
            ? 60
            : undefined,
      },
      grid: {
        left: settings.legendPosition === "left" ? "15%" : "3%",
        right: settings.legendPosition === "right" ? "15%" : "4%",
        top: settings.legendPosition === "top" ? "15%" : "10%",
        bottom: settings.legendPosition === "bottom" ? "15%" : "10%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        name: settings.xAxisLabel,
        data: xAxisData,
      },
      yAxis: {
        type: "value",
        name: settings.yAxisLabel,
      },
      series: yIndices.map((yIndex: number, seriesIndex: number) => {
        const yData = data.records.map(
          (record: (string | number)[]) => record[yIndex]
        );
        const seriesName = data.features[yIndex];

        const baseConfig = {
          name: seriesName,
          data: yData,
          itemStyle: {
            color:
              settings.colorPalette[seriesIndex % settings.colorPalette.length],
          },
          // パフォーマンス最適化設定
          large: true,
          largeThreshold: 1000, // 1000件以上のデータでlargeモードを有効にする
        };

        switch (settings.chartType) {
          case "bar":
            return {
              ...baseConfig,
              type: "bar",
            };
          case "line":
            return {
              ...baseConfig,
              type: "line",
              smooth: true,
            };
          case "scatter":
            // 散布図の場合、相関係数を計算して表示
            const xNumericData = xAxisData.map((x: string | number) =>
              Number(x)
            );
            const yNumericData = yData.map((y: string | number) => Number(y));
            const correlation = calculateCorrelation(
              xNumericData,
              yNumericData
            );

            return {
              ...baseConfig,
              type: "scatter",
              markPoint: {
                data: [
                  {
                    type: "max",
                    name: "最大値",
                  },
                  {
                    type: "min",
                    name: "最小値",
                  },
                ],
              },
              markLine: {
                data: [
                  {
                    type: "average",
                    name: "平均値",
                  },
                ],
              },
              title: {
                text: `相関係数: ${correlation.toFixed(2)}`,
                left: "center",
              },
            };
          case "area":
            return {
              ...baseConfig,
              type: "line",
              areaStyle: {},
              smooth: true,
            };
          case "boxplot":
            // 箱ひげ図用のデータ変換
            const boxplotData = calculateBoxplotData(
              data.records.map(
                (record: (string | number)[]) => record[yIndex] as number
              )
            );
            return {
              ...baseConfig,
              type: "boxplot",
              data: [boxplotData],
              boxWidth: ["20%", "50%"],
              itemStyle: {
                color:
                  settings.colorPalette[
                    seriesIndex % settings.colorPalette.length
                  ],
                borderColor:
                  settings.colorPalette[
                    (seriesIndex + 1) % settings.colorPalette.length
                  ],
              },
              emphasis: {
                itemStyle: {
                  borderColor:
                    settings.colorPalette[
                      (seriesIndex + 2) % settings.colorPalette.length
                    ],
                  shadowBlur: 10,
                  shadowColor: "rgba(0, 0, 0, 0.3)",
                },
              },
            };
          default:
            return {
              ...baseConfig,
              type: "bar",
            };
        }
      }),
      dataZoom: [
        {
          type: "inside",
          start: 0,
          end: 100,
        },
        {
          type: "slider",
          start: 0,
          end: 100,
          bottom: "5%",
        },
      ],
    };

    return option;
  }, [chartData, sampleData, settings]);

  const handleFeedbackSubmit = async (feedback: {
    type: string;
    title: string;
    description: string;
    contact?: string;
  }) => {
    // TODO: 実際のAPIエンドポイントに送信する処理を実装
    console.log("Feedback submitted:", feedback);

    // デモ用のダミー処理
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <div className="app-container">
      <Header
        title="データビジュアライザー"
        description="CSVデータをアップロードして、美しいグラフを作成しましょう"
      />

      <div className="content-wrapper">
        {/* 左側：ファイルアップロードエリア */}
        <div className="sidebar">
          <FileUpload
            onFileSelect={handleFileSelect}
            fileName={file?.name || null}
            hasHeader={hasHeader}
            onHeaderChange={setHasHeader}
            encoding={encoding}
            onEncodingChange={setEncoding}
          />

          <SettingsPanel
            settings={settings}
            availableFeatures={availableFeatures}
            onSettingsChange={updateSettings}
            onReset={handleReset}
          />
        </div>

        {/* 中央：グラフプレビューエリア */}
        <div className="main-content">
          <ChartPreview chartOptions={chartOptions} zoom={settings.zoom} />
          {chartData?.isSample && (
            <Alert
              message="サンプルデータ"
              description="現在表示されているのはサンプルデータです。CSVファイルをアップロードして、実際のデータでグラフを作成できます。"
              type="info"
              showIcon
              className="sample-data-alert"
            />
          )}
          <DataPreview data={chartData || sampleData} />
          <StatisticsPanel
            data={{
              xData:
                chartData?.records.map((record) =>
                  Number(
                    record[chartData.features.indexOf(settings.xAxisFeature)]
                  )
                ) || [],
              yData:
                chartData?.records.map((record) =>
                  Number(
                    record[
                      chartData.features.indexOf(settings.yAxisFeatures[0])
                    ]
                  )
                ) || [],
            }}
          />
        </div>

        {/* 右側：カスタマイズパネル */}
        <div className="sidebar">
          <CustomizationPanel
            settings={settings}
            onSettingsChange={updateSettings}
          />
          <FeedbackForm onSubmit={handleFeedbackSubmit} />
        </div>
      </div>

      <footer className="footer fade-in">
        <p>© 2025 suio shion. All rights reserved.</p>
        <p className="mt-1">
          今日の日付:{" "}
          {new Date().toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </p>
      </footer>
    </div>
  );
};

export default App;
