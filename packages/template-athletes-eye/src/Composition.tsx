import { getVideoMetadata } from "@remotion/media-utils";
import { useEffect, useState } from "react";
import {
    CalculateMetadataFunction,
    continueRender,
    delayRender,
} from "remotion";
import { z } from "zod";
import { MyRoute } from "../parser/data";
import { gpxParsing } from "../parser/parser";
import { Scene } from "./Scene";

export const schema = z.object({
    videoUrl: z.string(),
    gpxUrl: z.string(),
    audioUrl: z.string(),
    audioFrom: z.number(),
    audioTrimLeft: z.number(),
});

export type Props = z.infer<typeof schema>;

export const calculateMetadata: CalculateMetadataFunction<Props> = async ({
    props,
}) => {
    const { durationInSeconds } = await getVideoMetadata(
        props.videoUrl as string
    );

    return {
        durationInFrames: Math.floor(durationInSeconds * 30),
    };
};

export const MyComposition: React.FC<Props> = ({
    videoUrl,
    gpxUrl,
    audioUrl,
    audioFrom,
    audioTrimLeft,
}) => {
    const [parsedFile, setParsedFile] = useState<MyRoute | null>(null);
    const [loadGpxHandle] = useState(() => delayRender());

    useEffect(() => {
        const handle = delayRender();
        fetch(gpxUrl)
            .then((response) => response.text())
            .then((data: string) => {
                const parsedFile = gpxParsing(data);
                setParsedFile(parsedFile);

                continueRender(loadGpxHandle);
            })
            .catch((err) => {
                console.log("Error loading GPX file: ", err);
            });
        continueRender(handle);
    }, [gpxUrl, loadGpxHandle]);

    if (!videoUrl || !parsedFile) {
        return null;
    }

    return (
        <Scene
            audioFrom={audioFrom}
            audioUrl={audioUrl}
            parsedFile={parsedFile}
            videoUrl={videoUrl}
            audioTrimLeft={audioTrimLeft}
        />
    );
};
