import { lineDistance, lineString } from "@turf/turf";
import React, { useMemo } from "react";
import {
    AbsoluteFill,
    Audio,
    interpolate,
    OffthreadVideo,
    Sequence,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";
import { MyRoute } from "../parser/data";
import { getPointsOfInterest } from "./get-pois";
import { MapboxMap } from "./Map";
import { distanceBetweenPoints, smoothenPoints } from "./smoothen-points";
import { timeNormalizeRoute } from "./time-normalize-route";
import { Overlay } from "./videoComponents/VisualData";

export const Scene: React.FC<{
    parsedFile: MyRoute;
    videoUrl: string;
    audioUrl: string;
    audioFrom: number;
    audioTrimLeft: number;
}> = ({ parsedFile, videoUrl, audioUrl, audioFrom, audioTrimLeft }) => {
    const { durationInFrames, fps } = useVideoConfig();
    const targetRoute = useMemo(() => {
        return timeNormalizeRoute(parsedFile, durationInFrames, fps);
    }, [durationInFrames, fps, parsedFile]);

    const smoothenedTargetRoute = useMemo(() => {
        return smoothenPoints(targetRoute);
    }, [targetRoute]);

    const pois = useMemo(() => {
        return getPointsOfInterest(smoothenedTargetRoute);
    }, [smoothenedTargetRoute]);

    const frame = useCurrentFrame();
    const index = Math.min(
        Math.floor((frame / durationInFrames) * smoothenedTargetRoute.length),
        smoothenedTargetRoute.length - 1
    );

    const fivePointsAroundCurrent = useMemo(() => {
        return targetRoute.slice(Math.max(0, index - 20), index + 20);
    }, [index, targetRoute]);

    const distanceInKmPassedInSlice = useMemo(() => {
        return fivePointsAroundCurrent
            .map((point, index) => {
                const nextPoint = fivePointsAroundCurrent[index + 1];
                if (!nextPoint) {
                    return 0;
                }

                return distanceBetweenPoints(point, nextPoint);
            })
            .reduce((a, b) => a + b, 0);
    }, [fivePointsAroundCurrent]);

    const timeInSecPassedInSlice = useMemo(() => {
        return fivePointsAroundCurrent
            .map((point, index) => {
                const nextPoint = fivePointsAroundCurrent[index + 1];
                if (!nextPoint) {
                    return 0;
                }

                console.log(nextPoint.time);
                return ((nextPoint.time ?? 0) - (point.time ?? 0)) / 1000;
            })
            .reduce((a, b) => a + b, 0);
    }, [fivePointsAroundCurrent]);

    const speedInKmh = useMemo(() => {
        return distanceInKmPassedInSlice * (3600 / timeInSecPassedInSlice);
    }, [distanceInKmPassedInSlice, timeInSecPassedInSlice]);

    console.log(distanceInKmPassedInSlice, timeInSecPassedInSlice, speedInKmh);

    const distance = useMemo(() => {
        return lineDistance(
            lineString(
                targetRoute
                    .slice(0, Math.max(index, 2))
                    .map((d) => [d.longitude, d.latitude])
            )
        );
    }, [index, targetRoute]);

    const currentPoint = smoothenedTargetRoute[index];

    const currentTime = currentPoint.time;

    const fade = (f: number) =>
        interpolate(
            f,
            [0, 60, durationInFrames - 60, durationInFrames],
            [0, 1, 1, 0]
        );

    return (
        <AbsoluteFill
            style={{
                display: "flex",
                opacity: fade(frame),
            }}
        >
            <Sequence>
                <AbsoluteFill
                    style={{
                        height: "60%",
                        top: "60%",
                    }}
                >
                    <AbsoluteFill style={{}}>
                        <MapboxMap
                            pois={pois}
                            targetRoute={smoothenedTargetRoute}
                            index={index}
                        />
                    </AbsoluteFill>
                </AbsoluteFill>
                <AbsoluteFill
                    style={{
                        height: "60%",
                        width: "100%",
                        overflow: "hidden",
                    }}
                >
                    {videoUrl ? (
                        <OffthreadVideo
                            style={{
                                height: "100%",
                                width: "100%",
                                objectFit: "cover",
                                scale: "1.4",
                            }}
                            src={videoUrl}
                        />
                    ) : null}
                </AbsoluteFill>
                <AbsoluteFill style={{ top: "60%" }}>
                    <Overlay
                        pois={pois}
                        time={currentTime}
                        passedDistance={distance}
                        speed={speedInKmh}
                    />
                </AbsoluteFill>
            </Sequence>
            <Sequence from={audioFrom}>
                <Audio
                    startFrom={audioTrimLeft}
                    volume={(f) => fade(f)}
                    src={audioUrl}
                />
            </Sequence>
        </AbsoluteFill>
    );
};
