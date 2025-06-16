import type { ChartData } from "../types";

export const parseFile = async (
  file: File,
  hasHeader: boolean = true
): Promise<ChartData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (e.target && typeof e.target.result === "string") {
          const rows = e.target.result
            .split("\n")
            .filter((row) => row.trim() !== "");
          if (rows.length === 0) {
            throw new Error("ファイルが空です");
          }

          let headers: string[];
          let dataStartIndex: number;

          if (hasHeader) {
            headers = rows[0].split(",").map((h) => h.trim());
            dataStartIndex = 1;
          } else {
            const firstRow = rows[0].split(",");
            headers = firstRow.map((_, index) => `列 ${index + 1}`);
            dataStartIndex = 0;
          }

          const records: any[][] = [];

          for (let i = dataStartIndex; i < rows.length; i++) {
            if (rows[i].trim() === "") continue;

            const values = rows[i].split(",").map((v, idx) => {
              const num = Number(v.trim());
              return isNaN(num) ? v.trim() : num;
            });

            records.push(values);
          }

          resolve({ features: headers, records });
        }
      } catch (error) {
        reject(error);
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
