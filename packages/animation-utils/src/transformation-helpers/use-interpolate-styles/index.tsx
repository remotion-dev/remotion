import { useState, useEffect, useMemo } from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  interpolateColors,
} from "remotion";
import { breakDownValueIntoUnitNumberAndFunctions } from "./utils";
import {
  CSSPropertiesKey,
  CSSPropertiesValue,
  InterpolateStylesParams,
  Style,
  UnitNumberAndFunction,
} from "../../type";

const getInterpolatedPartValue = (
  currentFrame: number,
  inputRange: number[],
  startValuePart: UnitNumberAndFunction,
  endValuePart: UnitNumberAndFunction,
  startValue: CSSPropertiesValue,
  endValue: CSSPropertiesValue
): string => {
  if (endValuePart === undefined) {
    throw new TypeError(
      `The start and end values must be of the same type. Start value: ${startValue}, end value: ${endValue}`
    );
  }
  if (startValuePart.color) {
    if (!endValuePart.color) {
      throw new TypeError(
        `The start and end values must be of the same type. Start value: ${startValue}, end value: ${endValue}`
      );
    }
    const interpolatedColor = interpolateColors(currentFrame, inputRange, [
      startValuePart.color,
      endValuePart.color as string,
    ]);
    return `${interpolatedColor}`;
  }
  if (startValuePart.function) {
    if (
      !endValuePart?.function ||
      startValuePart.function.name !== endValuePart.function?.name
    ) {
      throw new TypeError(
        `The start and end values must be of the same type. Start value: ${startValue}, end value: ${endValue}`
      );
    }
    const endValuePartFunction = endValuePart.function;
    const endValuePartFunctionArgs = endValuePartFunction.values || [];
    const interpolatedFunctionArgs = startValuePart.function.values.reduce(
      (acc: string, startValuePartFunctionArg, index) => {
        const endValuePartFunctionArg = endValuePartFunctionArgs[index];
        const interpolatedArg = getInterpolatedPartValue(
          currentFrame,
          inputRange,
          startValuePartFunctionArg,
          endValuePartFunctionArg,
          startValue,
          endValue
        );
        return `${acc}, ${interpolatedArg}`;
      },
      ""
    );
    return `${startValuePart.function.name}(${interpolatedFunctionArgs.slice(
      2
    )})`;
  }

  if (typeof startValuePart.number === "undefined") {
    return `${startValuePart.unit}`;
  }
  if (startValuePart.unit !== endValuePart.unit) {
    throw new TypeError(
      `The units of the start and end values must match. Start value: ${startValue}, end value: ${endValue}`
    );
  }
  const startNumber = startValuePart.number;
  const endNumber = endValuePart.number || 0;
  const interpolatedNumber = interpolate(currentFrame, inputRange, [
    startNumber,
    endNumber,
  ]);
  const interpolatedUnit = startValuePart.unit;
  return `${interpolatedNumber}${interpolatedUnit}`;
};

const getInterpolatedPropertyValue = (
  currentFrame: number,
  inputRange: number[],
  startValue: CSSPropertiesValue,
  endValue: CSSPropertiesValue
) => {
  if (typeof startValue !== typeof endValue) {
    return startValue;
  }
  if (typeof startValue === "number") {
    return interpolate(currentFrame, inputRange, [
      startValue,
      endValue as number,
    ]);
  }

  const startValueParts = breakDownValueIntoUnitNumberAndFunctions(startValue);
  const endValueArray = breakDownValueIntoUnitNumberAndFunctions(endValue);

  const interpolatedValue = startValueParts.reduce(
    (acc, startValuePart, index) => {
      const interpolatedValuePart = getInterpolatedPartValue(
        currentFrame,
        inputRange,
        startValuePart,
        endValueArray[index],
        startValue,
        endValue
      );
      return `${acc} ${interpolatedValuePart}`;
    },
    ""
  );
  return interpolatedValue.slice(1);
};

const interpolateStyles = (
  frame: number,
  [startFrame, endFrame]: number[],
  startStyle: Style,
  endStyle: Style
): Style => {
  const interpolatedStyle = Object.keys(startStyle).reduce((acc, key) => {
    const interpolatedValue = getInterpolatedPropertyValue(
      frame,
      [startFrame, endFrame],
      startStyle[key as CSSPropertiesKey],
      endStyle[key as CSSPropertiesKey]
    );
    return {
      ...acc,
      [key]: interpolatedValue,
    };
  }, {});
  return interpolatedStyle;
};

export const useInterpolateStyles = ({
  inputRangeInFrames,
  inputRangeInSeconds,
  outputStyles,
}: InterpolateStylesParams) => {
  useEffect(() => {
    console.log("rerendering because of inputRangeInFrames");
  }, [inputRangeInFrames]);
  useEffect(() => {
    console.log("rerendering because of inputRangeInSeconds");
  }, [inputRangeInSeconds]);
  useEffect(() => {
    console.log("rerendering because of outputStyles");
  }, [outputStyles]);
  const [currentStyles, setCurrentStyles] = useState<Style>({});
  const [areInputsValid, setAreInputsValid] = useState(false);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const interpolateFrameSteps = useMemo(
    () =>
      inputRangeInFrames ||
      inputRangeInSeconds?.map((duration) => Math.round(duration * fps)) ||
      [],
    [fps, inputRangeInFrames, inputRangeInSeconds]
  );

  useEffect(() => {
    if (interpolateFrameSteps.length !== outputStyles.length) {
      throw new TypeError(
        `The number of steps in the interpolation must match the number of output styles.`
      );
    } else if (interpolateFrameSteps.length < 2) {
      throw new TypeError(
        `The number of steps in the interpolation must be at least 2.`
      );
    } else {
      setAreInputsValid(true);
    }
  }, [interpolateFrameSteps, outputStyles]);

  useEffect(() => {
    const updateCurrentStyles = () => {
      if (!areInputsValid) {
        return outputStyles[0] || {};
      }
      if (frame < interpolateFrameSteps[0]) {
        setCurrentStyles(outputStyles[0]);
        return;
      }
      if (frame >= interpolateFrameSteps[interpolateFrameSteps.length - 1]) {
        setCurrentStyles(outputStyles[outputStyles.length - 1]);
        return;
      }

      const startIndex =
        interpolateFrameSteps.findIndex((step) => frame < step) - 1;
      const endIndex = startIndex + 1;
      const startFrame = interpolateFrameSteps[startIndex];
      const endFrame = interpolateFrameSteps[endIndex];
      const startStyle = outputStyles[startIndex];
      const endStyle = outputStyles[endIndex];
      const currentFrameStyles = interpolateStyles(
        frame,
        [startFrame, endFrame],
        startStyle,
        endStyle
      );
      setCurrentStyles(currentFrameStyles);
    };
    updateCurrentStyles();
  }, [areInputsValid, frame, interpolateFrameSteps, outputStyles]);

  return currentStyles;
};
