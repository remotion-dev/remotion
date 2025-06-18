import type { TranscriptionJson } from "@remotion/whisper-web";
import { useEffect, useMemo, useRef, useState } from "react"

export default function Display({result, audio}: {result: TranscriptionJson, audio: File}){
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [transcriptionTextIndex, setTranscriptionTextIndex] = useState(0); 
    const audioUrl = useMemo(() => URL.createObjectURL(audio), [audio]);

    useEffect(() => {
        if(!audioRef.current){
            return
        }
        console.log(result)
        audioRef.current.ontimeupdate = () => {
        if (!audioRef.current) return;
        const activeTime = audioRef.current.currentTime * 1000;
        console.log(activeTime);
        const timedTranscriptionIndex = result.transcription.findIndex((v: any) =>( v.offsets.from <= activeTime && v.offsets.to >= activeTime));
        if(timedTranscriptionIndex >= 0){
            setTranscriptionTextIndex(timedTranscriptionIndex);
            console.log(timedTranscriptionIndex)
        }
    }
    }, [
        audioRef
    ])    
return (
<div style={{borderRadius: 20, padding:20, paddingRight: 40, paddingLeft: 40, justifyContent: 'center', justifyItems: 'center', gap: 20, alignItems: 'center', gridAutoFlow: 'row', display: 'grid',  background: 'rgb(20, 20, 20, 0.8)', backdropFilter: 'blur(20px)', width: 'fit-content'}}>
    <h2>Transcription</h2>
<audio controls ref={audioRef} autoPlay src={audioUrl}></audio>
<p >
    <span style={{ opacity: 1, fontWeight: 900}}>{result.transcription.slice(0, transcriptionTextIndex + 1).map(({text}) => text)}</span>
    <span style={{opacity: 0.5, fontWeight: 900}}>{
        result.transcription.slice(transcriptionTextIndex+ 1).map(({text}) => text).join(" ")
    }</span>
</p>
</div>)
}