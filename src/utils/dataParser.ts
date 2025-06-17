import type { ChartData } from "../types";
import * as XLSX from "xlsx";

export const parseFile = async (
  file: File,
  hasHeader: boolean = true,
  encoding: string = "Shift-JIS"
): Promise<ChartData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error("ファイルの読み込みに失敗しました");
        }

        // ファイルの拡張子を取得
        const fileExtension = file.name.split(".").pop()?.toLowerCase();

        if (fileExtension === "csv") {
          // CSVファイルの処理
          if (typeof data === "string") {
            const rows = data.split("\n").filter((row) => row.trim() !== "");
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
        } else if (fileExtension === "xlsx" || fileExtension === "xls") {
          // Excelファイルの処理
          const workbook = XLSX.read(data, { type: "binary" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // ワークシートをJSONに変換
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
          }) as (string | number)[][];

          if (jsonData.length === 0) {
            throw new Error("ファイルが空です");
          }

          let headers: string[];
          let records: any[][];

          if (hasHeader) {
            headers = jsonData[0].map(String);
            records = jsonData.slice(1);
          } else {
            const firstRow = jsonData[0];
            headers = firstRow.map((_, index) => `列 ${index + 1}`);
            records = jsonData;
          }

          resolve({ features: headers, records });
        } else {
          throw new Error("サポートされていないファイル形式です");
        }
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () =>
      reject(new Error("ファイルの読み込みに失敗しました"));

    // ファイルの種類に応じて読み込み方法を選択
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (["xlsx", "xls"].includes(fileExtension || "")) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file, encoding);
    }
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
