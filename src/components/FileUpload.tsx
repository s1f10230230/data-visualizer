import React, { useState } from "react";
import { Card, Upload, message, Checkbox } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  fileName: string | null;
  hasHeader: boolean;
  onHeaderChange: (hasHeader: boolean) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  fileName,
  hasHeader,
  onHeaderChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (
      file &&
      (file.type === "text/csv" ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls"))
    ) {
      onFileSelect(file);
    } else {
      message.error("CSVまたはExcelファイルのみアップロード可能です");
    }
  };

  const uploadProps: UploadProps = {
    accept: ".csv,.xlsx,.xls",
    showUploadList: false,
    beforeUpload: (file) => {
      if (
        file.type === "text/csv" ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls")
      ) {
        onFileSelect(file);
        return false;
      }
      message.error("CSVまたはExcelファイルのみアップロード可能です");
      return false;
    },
  };

  return (
    <Card title="ファイルアップロード" className="card fade-in">
      <div
        className={`upload-area ${isDragging ? "dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload {...uploadProps}>
          <div className="text-center">
            <UploadOutlined style={{ fontSize: "48px", color: "#1890ff" }} />
            <p className="mt-4 text-lg">
              {fileName ||
                "CSVまたはExcelファイルをドラッグ＆ドロップまたはクリックしてアップロード"}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              対応フォーマット: CSV, Excel (.xlsx, .xls)
            </p>
          </div>
        </Upload>
      </div>
      <div style={{ marginTop: "16px", padding: "0 16px 16px" }}>
        <Checkbox
          checked={hasHeader}
          onChange={(e) => onHeaderChange(e.target.checked)}
        >
          1行目をヘッダーとして扱う
        </Checkbox>
      </div>
    </Card>
  );
};

export default FileUpload;
