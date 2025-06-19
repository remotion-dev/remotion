import React from "react";
import { Slider } from "./components/ui/slider";

import { SliderLabel } from "./SliderLabel";
import { CheckboxWithLabel } from "./Checkbox";
import { Spacing } from "./Spacing";
import { CodeFrameTabs } from "./CodeFrame";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { PADDING_LEFT } from "./draw-trajectory";

export const Sidebar: React.FC<{
  mass: number;
  damping: number;
  stiffness: number;
  fixedDurationInFrames: number | null;
  calculatedDurationInFrames: number;
  delay: number;
  onMassChange: (e: [number]) => void;
  onDampingChange: (e: [number]) => void;
  onStiffnessChange: (e: [number]) => void;
  onDurationInFramesChange: (e: number | null) => void;
  onDelayChange: (e: number) => void;
  overshootClamping: boolean;
  onRelease: () => void;
  onOvershootClampingChange: (checked: boolean) => void;
  reverse: boolean;
  onReverseChange: (checked: boolean) => void;
}> = ({
  mass,
  onDampingChange,
  onMassChange,
  onStiffnessChange,
  onDurationInFramesChange,
  fixedDurationInFrames,
  overshootClamping,
  onRelease,
  damping,
  stiffness,
  calculatedDurationInFrames,
  onOvershootClampingChange,
  onReverseChange,
  reverse,
  delay,
  onDelayChange,
}) => {
  return (
    <div
      id="sidebar"
      style={{
        padding: PADDING_LEFT,
        display: "flex",
        flexDirection: "column",
        borderLeft: "1px solid #242424",
      }}
    >
      <Tabs defaultValue="configuration">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
        <TabsContent value="configuration">
          <Spacing y={3} />
          <Slider
            value={[mass]}
            min={0.3}
            step={0.1}
            max={10}
            onValueChange={onMassChange}
            onPointerUp={onRelease}
          />
          <SliderLabel label="mass" value={mass} toggleable={null} />
          <br />
          <Slider
            min={1}
            max={200}
            value={[damping]}
            onValueChange={onDampingChange}
            onPointerUp={onRelease}
          />
          <SliderLabel label="damping" value={damping} toggleable={null} />
          <br />
          <Slider
            min={1}
            max={200}
            value={[stiffness]}
            onValueChange={onStiffnessChange}
            onPointerUp={onRelease}
          />
          <SliderLabel toggleable={null} label="stiffness" value={stiffness} />
          <br />
          <Slider
            min={0}
            max={400}
            value={[delay]}
            onValueChange={(val) => {
              onDelayChange(val[0]);
            }}
            onPointerUp={onRelease}
          />
          <SliderLabel label="delay" toggleable={null} value={delay} />
          <br />
          <>
            <Slider
              min={1}
              max={200}
              value={[fixedDurationInFrames ?? calculatedDurationInFrames]}
              style={{ opacity: fixedDurationInFrames === null ? 0.5 : 1 }}
              onValueChange={(val) => {
                onDurationInFramesChange(val[0]);
              }}
              onPointerUp={onRelease}
            />
            <SliderLabel
              label="durationInFrames"
              toggleable={(enabled) => {
                if (enabled) {
                  onDurationInFramesChange(calculatedDurationInFrames);
                } else {
                  onDurationInFramesChange(null);
                }
              }}
              value={fixedDurationInFrames ?? null}
            />
          </>
          <br />
          <CheckboxWithLabel
            checked={overshootClamping}
            id="overshootClamping"
            onCheckedChange={onOvershootClampingChange}
          />
          <CheckboxWithLabel
            checked={reverse}
            id="reverse"
            onCheckedChange={onReverseChange}
          />
          <Spacing y={2} />
        </TabsContent>
        <TabsContent value="code">
          <CodeFrameTabs
            delay={delay}
            damping={damping}
            mass={mass}
            stiffness={stiffness}
            overshotClamping={overshootClamping}
            reverse={reverse}
            durationInFrames={fixedDurationInFrames}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
