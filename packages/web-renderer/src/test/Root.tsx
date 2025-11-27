// bun run studio
import React from 'react';
import {Composition} from 'remotion';
import {accumulatedTransforms} from './fixtures/accumulated-transforms';
import {complexNestedSvg} from './fixtures/complex-nested-svg';
import {flexPositionedScaled} from './fixtures/flex-positioned-scaled';
import {multiLevelTransformOrigins} from './fixtures/multi-level-transform-origins';
import {nestedTranslateScale} from './fixtures/nested-translate-scale';
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
		</>
	);
};
