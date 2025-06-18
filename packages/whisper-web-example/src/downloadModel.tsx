import { downloadWhisperModel,  type DownloadWhisperModelParams } from "@remotion/whisper-web";
import {  useState } from "react";

export default function DownloadModel({ setDownloadingModel }: { setDownloadingModel: (downloading: boolean) => void }) {
    let modelOptions: DownloadWhisperModelParams["model"][] = [
        "tiny.en",
        "tiny",
        "small",
        "small.en",
        "base",
        "base.en",
       
    ];

    const [selectedModel, setSelectedModel] = useState<DownloadWhisperModelParams["model"]>("tiny.en");
    const [downloadModelProgress, setDownloadProgress] = useState<number>(0);
    
    return (
        <div style={{
            display:"flex",
            gap: 20,
            flexFlow: "column",
        }}>
         <div style={{
            display: "flex",
            gap: 20
         }}>
               <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value as DownloadWhisperModelParams["model"])}
            >
                {modelOptions.map((model) => (
                    <option key={model} value={model}>
                        {model}
                    </option>
                ))}
            </select>
            <button style={{background: "rgb(50, 50, 50)"}} onClick={() => {

                setDownloadingModel(true)
                downloadWhisperModel({ model: selectedModel, onProgress: (v) => setDownloadProgress(v.progress) }).then(()=>setDownloadingModel(false))
            }} >
                download model
            </button>
         </div>
        { (downloadModelProgress !== 0 && downloadModelProgress !== 1) && <progress  value={downloadModelProgress} max={1} />}
        { (downloadModelProgress == 1) && <span>done ✅</span> }
        </div>
    )
}