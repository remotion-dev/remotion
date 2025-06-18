
import { useState } from 'react';
import './App.css'
import Display from './display';
import DownloadModel from './downloadModel';
import TranscribeAudio from './transcribeAudio';
import MainTitle from './MainTitle';
import Info from './info';

function VBarrier() {
  return (
    <div style={{
      height: 50,
      borderLeft: '1px solid grey'
    }}></div>
  )
}

function App() {
  const [transcriptionCompleted, setTranscriptionCompleted] = useState(false);
  const [modelDownloading, setModelDownloading] = useState(false);
  const [result, setResult] = useState<any>(null)
  const [file, setFile] = useState<any>(null);

  return (

    <>
      <MainTitle />
      <div style={{ padding: 15, left: 20,  borderRadius: 15, position: 'absolute', display: 'flex', gap: 30, alignItems: 'center', top: 20, background: '#18191a' }}>
        <Info />
        <VBarrier />
        <DownloadModel setDownloadingModel={setModelDownloading} />
        <VBarrier />
        <TranscribeAudio  {...{ setFile, setResult, modelDownloading, file, setTranscriptionCompleted }} />
      </div>
      {
        transcriptionCompleted && (<Display audio={file} result={result} />)
      }
    </>

  )
}

export default App
