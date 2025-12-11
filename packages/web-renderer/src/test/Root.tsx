// bun run studio
import React from 'react';
import {Composition} from 'remotion';
import {accumulatedTransforms} from './fixtures/accumulated-transforms';
import {backgroundColor} from './fixtures/background-color';
import {borderRadius} from './fixtures/border-radius';
import {borderRadiusClamped} from './fixtures/border-radius-clamped';
import {borderRadiusDifferent} from './fixtures/border-radius-different';
import {borderRadiusElliptical} from './fixtures/border-radius-elliptical';
import {borderRadiusNone} from './fixtures/border-radius-none';
import {borderRadiusPercentage} from './fixtures/border-radius-percentage';
import {borderRadiusSimple} from './fixtures/border-radius-simple';
import {complexNestedSvg} from './fixtures/complex-nested-svg';
import {displayNone} from './fixtures/display-none';
import {flexPositionedScaled} from './fixtures/flex-positioned-scaled';
import {multiLevelTransformOrigins} from './fixtures/multi-level-transform-origins';
import {nestedTranslateScale} from './fixtures/nested-translate-scale';
import {opacityNested} from './fixtures/opacity-nested';
import {opacitySimple} from './fixtures/opacity-simple';
import {opacityZero} from './fixtures/opacity-zero';
import {parentRotatedSvg} from './fixtures/parent-rotated-svg';
import {parentTransformOrigin} from './fixtures/parent-transform-origin';
import {pixelTransformOrigin} from './fixtures/pixel-transform-origin';
import {rotatedCanvas} from './fixtures/rotated-canvas';
import {scaledTranslatedSvg} from './fixtures/scaled-translated-svg';
import {selfTransformOrigin} from './fixtures/self-transform-origin';
import {simpleRotatedSvg} from './fixtures/simple-rotated-svg';
import {threeLevelTransformOrigins} from './fixtures/three-level-transform-origins';

export const Root: React.FC = () => {
	return (
		<>
			<Composition {...simpleRotatedSvg} />
			<Composition {...parentRotatedSvg} />
			<Composition {...selfTransformOrigin} />
			<Composition {...parentTransformOrigin} />
			<Composition {...accumulatedTransforms} />
			<Composition {...rotatedCanvas} />
			<Composition {...multiLevelTransformOrigins} />
			<Composition {...threeLevelTransformOrigins} />
			<Composition {...pixelTransformOrigin} />
			<Composition {...complexNestedSvg} />
			<Composition {...nestedTranslateScale} />
			<Composition {...scaledTranslatedSvg} />
			<Composition {...flexPositionedScaled} />
			<Composition {...borderRadius} />
			<Composition {...borderRadiusSimple} />
			<Composition {...borderRadiusElliptical} />
			<Composition {...borderRadiusDifferent} />
			<Composition {...borderRadiusPercentage} />
			<Composition {...borderRadiusNone} />
			<Composition {...borderRadiusClamped} />
			<Composition {...displayNone} />
			<Composition {...opacitySimple} />
			<Composition {...opacityNested} />
			<Composition {...opacityZero} />
			<Composition {...backgroundColor} />
		</>
	);
};
