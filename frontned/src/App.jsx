import { useState } from "react";

import UploadSection from "./components/Upload/UploadSection";
import Dashboard from "./components/Dashboard/Dashboard";

export default function App() {
  const [data, setData] = useState(null);

  return (
    <>
      {!data ? (
        <UploadSection setData={setData} />
      ) : (
        <Dashboard data={data} />
      )}
    </>
  );
}