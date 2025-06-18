import type { ChartData } from "../types/index";

export const parseFile = async (
  file: File,
  hasHeader: boolean = true,
  encoding: string = "Shift-JIS"
): Promise<ChartData> => {
  return new Promise((resolve, reject) => {
    // Web Workerを生成
    const worker = new Worker(
      new URL("../workers/parser.worker.ts", import.meta.url)
    );

    // Workerからのメッセージをリッスン
    worker.onmessage = (event) => {
      if (event.data.status === "success") {
        resolve(event.data.data);
      } else {
        reject(new Error(event.data.message));
      }
      worker.terminate(); // 処理が終わったらWorkerを終了
    };

    worker.onerror = (error) => {
      reject(new Error("Web Workerエラー: " + error.message));
      worker.terminate();
    };

    // Workerにデータを送信
    worker.postMessage({ file, hasHeader, encoding });
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
