/* eslint-disable no-restricted-globals */
import * as XLSX from "xlsx";

self.onmessage = async (event) => {
  const { file, hasHeader, encoding } = event.data;

  try {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error("ファイルの読み込みに失敗しました");
        }

        const fileExtension = file.name.split(".").pop()?.toLowerCase();
        let headers: string[];
        let records: (string | number)[][];

        if (fileExtension === "csv") {
          const text = data as string;
          const rows = text.split("\n").filter((row) => row.trim() !== "");
          if (rows.length === 0) {
            throw new Error("ファイルが空です");
          }

          let dataStartIndex: number;

          if (hasHeader) {
            headers = rows[0].split(",").map((h) => h.trim());
            dataStartIndex = 1;
          } else {
            const firstRow = rows[0].split(",");
            headers = firstRow.map((_, index) => `列 ${index + 1}`);
            dataStartIndex = 0;
          }

          records = [];
          for (let i = dataStartIndex; i < rows.length; i++) {
            if (rows[i].trim() === "") continue;
            const values = rows[i].split(",").map((v) => {
              const trimmedV = v.trim();
              const num = Number(trimmedV);
              return isNaN(num) ? trimmedV : num;
            });
            records.push(values);
          }
        } else if (fileExtension === "xlsx" || fileExtension === "xls") {
          const workbook = XLSX.read(data, { type: "binary" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
          }) as (string | number)[][];

          if (jsonData.length === 0) {
            throw new Error("ファイルが空です");
          }

          if (hasHeader) {
            headers = jsonData[0].map(String);
            records = jsonData.slice(1);
          } else {
            const firstRow = jsonData[0];
            headers = firstRow.map((_, index) => `列 ${index + 1}`);
            records = jsonData;
          }
        } else {
          throw new Error("サポートされていないファイル形式です");
        }

        self.postMessage({
          status: "success",
          data: { features: headers, records },
        });
      } catch (error: any) {
        self.postMessage({ status: "error", message: error.message });
      }
    };

    reader.onerror = (error) => {
      self.postMessage({
        status: "error",
        message: "ファイルの読み込みに失敗しました",
      });
    };

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (["xlsx", "xls"].includes(fileExtension || "")) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file, encoding);
    }
  } catch (error: any) {
    self.postMessage({ status: "error", message: error.message });
  }
};
