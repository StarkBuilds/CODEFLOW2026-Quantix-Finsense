import { useState, useCallback } from 'react';
import UploadSection   from './components/Upload/UploadSection.jsx';
import ProcessingScreen from './components/Processing/ProcessingScreen.jsx';
import Dashboard        from './components/Dashboard/Dashboard.jsx';
import { analyzeStatement } from './utils/claudeApi.js';

/**
 * Application stages:
 *  'upload'     — file selection screen
 *  'processing' — AI analysis in progress
 *  'dashboard'  — results & insights
 */
export default function App() {
  const [stage, setStage] = useState('upload');
  const [logs,  setLogs]  = useState([]);   // progress messages during analysis
  const [data,  setData]  = useState(null); // analysis result from Claude
  const [error, setError] = useState('');   // user-facing error message

  const addLog = (msg) =>
    setLogs((prev) => [...prev, { id: Date.now() + Math.random(), msg }]);

  /** Called when the user selects / drops a file */
  const handleFileSelect = useCallback(async (file) => {
    setStage('processing');
    setError('');
    setLogs([]);

    try {
      const result = await analyzeStatement(file, addLog);

      addLog('Building your dashboard…');
      // Brief pause so users can read the final log entry
      await new Promise((r) => setTimeout(r, 450));

      setData(result);
      setStage('dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Analysis failed. Please try again.');
      setStage('upload');
    }
  }, []);

  /** Reset back to the upload screen */
  const handleNewAnalysis = useCallback(() => {
    setStage('upload');
    setData(null);
    setError('');
    setLogs([]);
  }, []);

  return (
    <>
      {stage === 'upload' && (
        <UploadSection onFileSelect={handleFileSelect} error={error} />
      )}

      {stage === 'processing' && (
        <ProcessingScreen logs={logs} />
      )}

      {stage === 'dashboard' && data && (
        <Dashboard data={data} onNewAnalysis={handleNewAnalysis} />
      )}
    </>
  );
}