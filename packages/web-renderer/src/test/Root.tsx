// bun run studio
import React from 'react';
import {Composition, Folder} from 'remotion';
import {accumulatedTransforms} from './fixtures/accumulated-transforms';
import {backgroundColor} from './fixtures/background-color';
import {border} from './fixtures/border';
import {borderIndividualSides} from './fixtures/border-individual-sides';
import {borderRadius} from './fixtures/border-radius';
import {borderRadiusClamped} from './fixtures/border-radius-clamped';
import {borderRadiusDifferent} from './fixtures/border-radius-different';
import {borderRadiusElliptical} from './fixtures/border-radius-elliptical';
import {borderRadiusNested} from './fixtures/border-radius-nested';
import {borderRadiusNestedOverflowHidden} from './fixtures/border-radius-nested-overflow-hidden';
import {borderRadiusNone} from './fixtures/border-radius-none';
import {borderRadiusPercentage} from './fixtures/border-radius-percentage';
import {borderRadiusSimple} from './fixtures/border-radius-simple';
import {boxShadow} from './fixtures/box-shadow';
import {complexNestedSvg} from './fixtures/complex-nested-svg';
import {deeplyNestedTransform} from './fixtures/deeply-nested-transform';
import {displayNone} from './fixtures/display-none';
import {flexContainer} from './fixtures/flex-container';
import {flexPositionedScaled} from './fixtures/flex-positioned-scaled';
import {hugeImageTransform} from './fixtures/huge-image-transform';
import {inside3dTransform} from './fixtures/inside-3d-transform';
import {lineHeight} from './fixtures/line-height';
import {linearGradient} from './fixtures/linear-gradient';
import {manyLayers} from './fixtures/many-layers';
import {maskImage} from './fixtures/mask-image';
import {multiLevelTransformOrigins} from './fixtures/multi-level-transform-origins';
import {nestedTranslateScale} from './fixtures/nested-translate-scale';
import {opacityInherited} from './fixtures/opacity-inherited';
import {opacityNested} from './fixtures/opacity-nested';
import {opacityReset} from './fixtures/opacity-reset';
import {opacitySimple} from './fixtures/opacity-simple';
import {opacityZero} from './fixtures/opacity-zero';
import {outline} from './fixtures/outline';
import {overflowHidden} from './fixtures/overflow-hidden';
import {overflowHidden3dTransform} from './fixtures/overflow-hidden-3d-transform';
import {parentRotatedSvg} from './fixtures/parent-rotated-svg';
import {parentTransformOrigin} from './fixtures/parent-transform-origin';
import {pixelTransformOrigin} from './fixtures/pixel-transform-origin';
import {rotatedCanvas} from './fixtures/rotated-canvas';
import {scaledTranslatedSvg} from './fixtures/scaled-translated-svg';
import {selfTransformOrigin} from './fixtures/self-transform-origin';
import {simpleRotatedSvg} from './fixtures/simple-rotated-svg';
import {svgExplicitDimensions} from './fixtures/svg-explicit-dimensions';
import {backgroundClipText} from './fixtures/text/background-clip-text';
import {letterSpacing} from './fixtures/text/letter-spacing';
import {paragraphs} from './fixtures/text/paragraphs';
import {textFixture} from './fixtures/text/text';
import {textTransform} from './fixtures/text/text-transform';
import {webkitTextFillColor} from './fixtures/text/webkit-text-fill-color';
import {threeDoverflow} from './fixtures/three-d-overflow';
import {threeDTransformOpacity} from './fixtures/three-d-transform-opacity';
import {threeDTransformOutOfBounds} from './fixtures/three-d-transform-out-of-bounds';
import {threeLevelTransformOrigins} from './fixtures/three-level-transform-origins';
import {orthographic} from './fixtures/transforms/orthographic';
import {transformWithAllShorthands} from './fixtures/transforms/transform-with-all-shorthands';
import {transformWithRotate} from './fixtures/transforms/transform-with-rotate';
import {transformWithScale} from './fixtures/transforms/transform-with-scale';
import {transformWithTranslate} from './fixtures/transforms/transform-with-translate';
import {withMargin} from './fixtures/transforms/with-margin';
import {withNegativeMargin} from './fixtures/transforms/with-negative-margin';
import {unwrapped} from './fixtures/unwrapped';

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
			<Composition {...threeDoverflow} />
			<Composition {...threeDTransformOutOfBounds} />
			<Composition {...overflowHidden} />
			<Composition {...overflowHidden3dTransform} />
			<Composition {...hugeImageTransform} />
			<Composition {...nestedTranslateScale} />
			<Composition {...scaledTranslatedSvg} />
			<Composition {...svgExplicitDimensions} />
			<Composition {...flexPositionedScaled} />
			<Composition {...displayNone} />
			<Folder name="Opacity">
				<Composition {...opacitySimple} />
				<Composition {...opacityNested} />
				<Composition {...opacityZero} />
				<Composition {...opacityReset} />
				<Composition {...opacityInherited} />
			</Folder>
			<Composition {...threeDTransformOpacity} />
			<Composition {...backgroundColor} />
			<Folder name="linear-gradient">
				<Composition {...maskImage} />
				<Composition {...linearGradient} />
			</Folder>
			<Composition {...outline} />
			<Composition {...boxShadow} />
			<Folder name="border">
				<Composition {...border} />
				<Composition {...borderRadius} />
				<Composition {...borderRadiusSimple} />
				<Composition {...borderRadiusElliptical} />
				<Composition {...borderRadiusDifferent} />
				<Composition {...borderRadiusPercentage} />
				<Composition {...borderRadiusNone} />
				<Composition {...borderRadiusClamped} />
				<Composition {...borderRadiusNested} />
				<Composition {...borderRadiusNestedOverflowHidden} />
				<Composition {...borderIndividualSides} />
			</Folder>
			<Folder name="Text">
				<Composition {...textFixture} />
				<Composition {...paragraphs} />
				<Composition {...letterSpacing} />
				<Composition {...textTransform} />
				<Composition {...lineHeight} />
				<Composition {...webkitTextFillColor} />
				<Composition {...backgroundClipText} />
			</Folder>
			<Folder name="Projects">
				<Composition {...unwrapped} />
				<Composition {...orthographic} />
				<Composition {...withMargin} />
				<Composition {...withNegativeMargin} />
				<Composition {...transformWithScale} />
				<Composition {...transformWithRotate} />
				<Composition {...transformWithTranslate} />
				<Composition {...transformWithAllShorthands} />
				<Composition {...inside3dTransform} />
				<Composition {...flexContainer} />
				<Composition {...deeplyNestedTransform} />
				<Composition {...manyLayers} />
			</Folder>
		</>
	);
};
