import { useRef } from "react";
import "./UploadSection.css";

export default function UploadSection({ setData }) {
  const fileRef = useRef(null);

  const handleFile = () => {
    setData({
      summary: {
        totalIncome: 85000,
        totalExpenses: 40000,
        netSavings: 45000
      }
    });
  };

  return (
    <div className="upload-container">
      <div
        className="drop-zone"
        onClick={() => fileRef.current.click()}
      >
        <h1>Upload Bank Statement</h1>

        <p>PDF or CSV Supported</p>

        <input
          type="file"
          hidden
          ref={fileRef}
          onChange={handleFile}
        />
      </div>
    </div>
  );
}