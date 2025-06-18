import type { TranscriptionItemWithTimestamp, TranscriptionJson } from "@remotion/whisper-web";
import { useEffect, useMemo, useRef, useState } from "react"

export default function Display({result, audio}: {result: TranscriptionJson | null, audio: File | null}){
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [transcriptionTextIndex, setTranscriptionTextIndex] = useState(0); 
    const audioUrl = useMemo(() => audio ? URL.createObjectURL(audio) : undefined, [audio]);

    useEffect(() => {
        if(!audioRef.current){
            return
        }
        audioRef.current.ontimeupdate = () => {
        if (!audioRef.current) return;
        const activeTime = audioRef.current.currentTime * 1000;
        let timedTranscriptionIndex = -1;
        if (result && result.transcription) {
            timedTranscriptionIndex = result.transcription.findIndex((v: TranscriptionItemWithTimestamp) => (v.offsets.from <= activeTime && v.offsets.to >= activeTime));
        }
        if(timedTranscriptionIndex >= 0){
            setTranscriptionTextIndex(timedTranscriptionIndex);
        }
    }
    }, [
        audioRef,
        result
    ])  
    
    if(!result){
        return("")
    }
return (
<div style={{borderRadius: 20, padding:20, paddingRight: 40, paddingLeft: 40, justifyContent: 'center', justifyItems: 'center', gap: 20, alignItems: 'center', gridAutoFlow: 'row', display: 'grid',  background: 'rgb(20, 20, 20, 0.8)', backdropFilter: 'blur(20px)', width: 'fit-content'}}>
    <h2>Transcription</h2>
<audio controls ref={audioRef} autoPlay src={audioUrl}></audio>
<p >
    <span style={{ opacity: 1, fontWeight: 900}}>
        {result.transcription.slice(0, transcriptionTextIndex + 1).map(({text}) => text)}
    </span>
    <span style={{opacity: 0.5, fontWeight: 900}}>{
        result.transcription.slice(transcriptionTextIndex + 1).map(({text}) => text).join(" ")
    }</span>
</p>
</div>)
}