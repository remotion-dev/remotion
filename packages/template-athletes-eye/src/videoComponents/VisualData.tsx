import React from "react";
import {
    AbsoluteFill,
    interpolate,
    Sequence,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";
import { Poi } from "../get-pois";

const PoiName: React.FC<{
    name: string;
}> = ({ name }) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const opacity = interpolate(
        frame,
        [
            0,
            10,
            Math.max(11, durationInFrames - 10),
            Math.max(durationInFrames - 1, 12),
        ],
        [0, 1, 1, 0]
    );

    return (
        <div
            style={{
                fontSize: 40,
                opacity,
            }}
        >
            {name}
        </div>
    );
};

export const Overlay: React.FC<{
    passedDistance: number;
    time: number | null;
    pois: Poi[];
    speed: number;
}> = ({ passedDistance, time, pois, speed }) => {
    return (
        <AbsoluteFill>
            <AbsoluteFill
                style={{
                    background: `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(255,255,255,0) 20%)`,
                }}
            />
            <AbsoluteFill>
                <div
                    style={{
                        fontFamily: "Inter",
                        fontSize: 100,
                        fontVariantNumeric: "tabular-nums",
                        fontWeight: "700",
                        color: "white",
                        flexDirection: "row",
                        padding: 50,
                        display: "flex",
                        lineHeight: 1.2,
                        alignItems: "center",
                    }}
                >
                    <div style={{ fontVariantNumeric: "tabular-nums" }}>
                        {Math.round(speed)}km/h
                    </div>
                    <div style={{ flex: 1 }} />
                    <div
                        style={{
                            textAlign: "right",
                            height: 100,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 40,
                                fontVariantNumeric: "tabular-nums",
                            }}
                        >
                            {new Intl.DateTimeFormat("en-US", {
                                hour: "numeric",
                                minute: "numeric",
                            }).format(new Date(time as number))}
                        </div>
                        <div>
                            {pois.map((poi) => {
                                return (
                                    <Sequence
                                        key={poi.name}
                                        layout="none"
                                        from={poi.startFrame}
                                        durationInFrames={
                                            poi.endFrame - poi.startFrame
                                        }
                                    >
                                        <PoiName name={poi.name} />
                                    </Sequence>
                                );
                            })}
                        </div>
                        <div
                            style={{
                                fontSize: 40,
                                fontVariantNumeric: "tabular-nums",
                            }}
                        >
                            {passedDistance.toFixed(2)}km
                        </div>
                    </div>
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
