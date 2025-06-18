import { resampleTo16Khz, transcribe, type DownloadWhisperModelParams, type TranscriptionJson } from "@remotion/whisper-web";
import { useEffect, useRef, useState } from "react";
import SelectTranscriptionModel from "./selectTranscriptionModel";

export default function TranscribeAudio({
    setResult,
    setTranscriptionCompleted,
    setFile,
    file,
    modelDownloading
}: {
    setResult: (result: TranscriptionJson | null) => void,
    setTranscriptionCompleted: (completed: boolean) => void,
    setFile: (file: File) => void,
    file: File | null,
    modelDownloading: boolean
}) {
    const fileref = useRef<HTMLInputElement>(null)
    const [waveForm, setWaveForm] = useState<Float32Array>(new Float32Array());
    const [loadingLoadedModels, setLoadingLoadedModels] = useState(false);
    const [modelForTranscription, setModelForTranscription] = useState<DownloadWhisperModelParams["model"] | undefined>(undefined)
    const [transcribing, setTranscribing] = useState(false);
    const [progress, setProgress] = useState(0);
    useEffect(()=>{
    }, [modelForTranscription])
    useEffect(() => {
        //sync the file between two input sources
        if (!file || !fileref?.current) {
            return;
        }
        if (file && fileref.current.files && fileref.current.files.length === 0) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileref.current.files = dataTransfer.files;
        }
    },
        [fileref, file])


    return (
        <div style={{
            display: "flex",
            gap: 15,
            alignItems: "center"
        }}>
            <div style={{
                display: "flex",
                flexFlow: "column",
                gap: 10
            }}>
                <input ref={fileref} type='file' onChange={(ch: React.ChangeEvent<HTMLInputElement>) => {
                    setResult(null);
                    setTranscriptionCompleted(false);
                    const file = ch.target?.files?.[0];
                    if (file) {
                        setFile(file);
                        resampleTo16Khz({ file, onProgress: (e) => console.log(e) }).then(waveform => setWaveForm(waveform))

                    }
                }
                } />


                <div
                    onDrop={e => {
                        e.preventDefault();
                        setResult(null);
                        setTranscriptionCompleted(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                            setFile(file);
                            resampleTo16Khz({ file, onProgress: (e) => console.log(e) }).then(waveform => setWaveForm(waveform));
                        }
                    }}
                    onDragOver={e => e.preventDefault()}
                    style={{ border: '2px dashed rgb(230, 230, 230, 0.5)',  padding: 2, marginBottom: 8 }}
                >
                    {file ? `Selected file: ${file.name}` : "Drop here"}
                </div>

            </div>
            <div style={{ display: 'grid', gridAutoFlow: 'row', gap: 10 }}>
                <SelectTranscriptionModel transcribing={transcribing} modelDownloading={modelDownloading}  setModelForTranscription={setModelForTranscription} setLoadingLoadedModels={setLoadingLoadedModels} loadingLoadedModels={loadingLoadedModels} />

                <button disabled={modelDownloading || !modelForTranscription || transcribing || !file || loadingLoadedModels} style={{ background: '#0b84f3' }} onClick={() => {
                    if (!modelForTranscription) return;
                    setTranscribing(true);
                    transcribe({ channelWaveform: waveForm, model: modelForTranscription, threads: 9, onTranscriptionChunk: (e) => console.log(e), onProgress: (p) => setProgress(p) }).then(result => {
                        setResult(result)
                        setTranscribing(false);
                        setTranscriptionCompleted(true);
                        setProgress(0)
                    })

                }

                } >Transcribe</button>
               { transcribing && <progress max={1} value={progress} />}
            </div>
        </div>
    )
}