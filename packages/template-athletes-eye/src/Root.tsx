import { getVideoMetadata } from "@remotion/media-utils";
import { Composition,staticFile } from "remotion";
import { MyComposition,schema } from "./Composition";

const FPS = 30;

export const RemotionVideo = () => {
    return (
        <>
            <Composition
                id="Compositions"
                fps={FPS}
                width={1080}
                height={1920}
                component={MyComposition}
                schema={schema}
                calculateMetadata={async ({ props }) => {
                    const { durationInSeconds } = await getVideoMetadata(
                        props.videoUrl as string
                    );

                    return {
                        durationInFrames: Math.floor(durationInSeconds * 30),
                    };
                }}
                defaultProps={{"videoUrl":staticFile("gopro-small.mp4"),"gpxUrl":staticFile("Afternoon_Ride.gpx"),"audioUrl":staticFile("jamie-jones.mp3"),"audioFrom":1557,"audioTrimLeft":285}}
            />
        </>
    );
};
