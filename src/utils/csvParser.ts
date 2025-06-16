import type { ChartData } from "../types";

export const parseCSV = async (file: File): Promise<ChartData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = text.split("\n").map((row) => row.split(","));
        const headers = rows[0];
        const records = rows
          .slice(1)
          .filter((row) => row.length === headers.length);

        resolve({
          features: headers,
          records: records,
        });
      } catch (error) {
        reject(new Error("CSVファイルの解析に失敗しました"));
      }
    };
    reader.onerror = () =>
      reject(new Error("ファイルの読み込みに失敗しました"));
    reader.readAsText(file);
  });
};

export const detectColumnType = (
  values: (string | number)[]
): "number" | "string" | "date" => {
  const numbers = values.filter((v) => !isNaN(Number(v))).length;
  const dates = values.filter((v) => !isNaN(Date.parse(String(v)))).length;

  if (numbers === values.length) return "number";
  if (dates === values.length) return "date";
  return "string";
};
