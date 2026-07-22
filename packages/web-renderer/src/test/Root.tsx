// bun run studio
import React from 'react';
import {Composition, Folder} from 'remotion';
import {accumulatedTransforms} from './fixtures/accumulated-transforms';
import {backfaceVisibilityMask} from './fixtures/backface-visibility-mask';
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
import {clipPathCircle} from './fixtures/clip-path-circle';
import {clipPathEllipse} from './fixtures/clip-path-ellipse';
import {clipPathInset} from './fixtures/clip-path-inset';
import {clipPathPath} from './fixtures/clip-path-path';
import {clipPathPolygon} from './fixtures/clip-path-polygon';
import {threeDFlattening} from './fixtures/clipped';
import {complexNestedSvg} from './fixtures/complex-nested-svg';
import {deeplyNestedTransform} from './fixtures/deeply-nested-transform';
import {displayNone} from './fixtures/display-none';
import {filter} from './fixtures/filter';
import {filterImage} from './fixtures/filter-image';
import {flexContainer} from './fixtures/flex-container';
import {flexPositionedScaled} from './fixtures/flex-positioned-scaled';
import {gradientTransparentKeyword} from './fixtures/gradient-transparent-keyword';
import {hugeImageTransform} from './fixtures/huge-image-transform';
import {inlineScaleAfterOutline} from './fixtures/inline-scale-after-outline';
import {inside3dTransform} from './fixtures/inside-3d-transform';
import {issue6211MaskWheel} from './fixtures/issue-6211-mask-wheel';
import {issue7050Minimal} from './fixtures/issue-7050-minimal';
import {issue7050Repro} from './fixtures/issue-7050-repro';
import {issue7199ScaleAndDropShadow} from './fixtures/issue-7199-scale-and-drop-shadow';
import {issue7243SvgJapaneseText} from './fixtures/issue-7243-svg-japanese-text';
import {issue7489Minimal} from './fixtures/issue-7489-minimal';
import {issue8650LottieControlChars} from './fixtures/issue-8650-lottie-control-chars';
import {issue9410TwoAxisScale} from './fixtures/issue-9410-two-axis-scale';
import {lineHeight} from './fixtures/line-height';
import {linearGradient} from './fixtures/linear-gradient';
import {manyLayers} from './fixtures/many-layers';
import {maskImage} from './fixtures/mask-image';
import {multiLevelTransformOrigins} from './fixtures/multi-level-transform-origins';
import {nestedHtmlInCanvas} from './fixtures/nested-html-in-canvas';
import {nestedTranslateScale} from './fixtures/nested-translate-scale';
import {objectFit} from './fixtures/object-fit';
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
import {pixelDensity} from './fixtures/pixel-density';
import {pixelTransformOrigin} from './fixtures/pixel-transform-origin';
import {rotatedCanvas} from './fixtures/rotated-canvas';
import {scaleFixture} from './fixtures/scale';
import {scalePrecomposeFixture} from './fixtures/scale-precompose';
import {scaledTranslatedSvg} from './fixtures/scaled-translated-svg';
import {selfTransformOrigin} from './fixtures/self-transform-origin';
import {simpleRotatedSvg} from './fixtures/simple-rotated-svg';
import {svgExplicitDimensions} from './fixtures/svg-explicit-dimensions';
import {backgroundClipText} from './fixtures/text/background-clip-text';
import {backgroundClipText3dTransform} from './fixtures/text/background-clip-text-3d-transform';
import {filterText} from './fixtures/text/filter-text';
import {fontStyle} from './fixtures/text/font-style';
import {fontVariantCaps} from './fixtures/text/font-variant-caps';
import {letterSpacing} from './fixtures/text/letter-spacing';
import {paragraphs} from './fixtures/text/paragraphs';
import {textFixture} from './fixtures/text/text';
import {
	textDecoration,
	textDecorationStyles,
	textDecorationWavy,
} from './fixtures/text/text-decoration';
import {textShadow} from './fixtures/text/text-shadow';
import {textShadowScale} from './fixtures/text/text-shadow-scale';
import {textTransform} from './fixtures/text/text-transform';
import {webkitTextFillColor} from './fixtures/text/webkit-text-fill-color';
import {webkitTextStroke} from './fixtures/text/webkit-text-stroke';
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
import {transitionClockWipe} from './fixtures/transition-clock-wipe';
import {transitionIris} from './fixtures/transition-iris';
import {transitionWipe} from './fixtures/transition-wipe';
import {unwrapped} from './fixtures/unwrapped';
import {whiteSpaceCollapsing} from './fixtures/whitespace-collapsing';
import {whiteSpaceCollapsing2} from './fixtures/whitespace-collapsing-2';

export const Root: React.FC = () => {
	return (
		<>
			<Composition {...simpleRotatedSvg} />
			<Composition {...parentRotatedSvg} />
			<Composition {...selfTransformOrigin} />
			<Composition {...parentTransformOrigin} />
			<Composition {...pixelDensity} />
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
			<Composition {...objectFit} />
			<Composition {...nestedTranslateScale} />
			<Composition {...nestedHtmlInCanvas} />
			<Composition {...scaledTranslatedSvg} />
			<Composition {...svgExplicitDimensions} />
			<Composition {...flexPositionedScaled} />
			<Composition {...displayNone} />
			<Composition {...scaleFixture} />
			<Composition {...scalePrecomposeFixture} />
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
				<Composition {...backfaceVisibilityMask} />
				<Composition {...linearGradient} />
				<Composition {...gradientTransparentKeyword} />
			</Folder>
			<Composition {...outline} />
			<Composition {...inlineScaleAfterOutline} />
			<Composition {...boxShadow} />
			<Folder name="Filter">
				<Composition {...filter} />
				<Composition {...filterImage} />
			</Folder>
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
				<Composition {...textDecoration} />
				<Composition {...textDecorationStyles} />
				<Composition {...textDecorationWavy} />
				<Composition {...fontStyle} />
				<Composition {...fontVariantCaps} />
				<Composition {...lineHeight} />
				<Composition {...webkitTextFillColor} />
				<Composition {...webkitTextStroke} />
				<Composition {...backgroundClipText} />
				<Composition {...backgroundClipText3dTransform} />
				<Composition {...textShadow} />
				<Composition {...textShadowScale} />
				<Composition {...whiteSpaceCollapsing} />
				<Composition {...whiteSpaceCollapsing2} />
				<Composition {...filterText} />
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
				<Composition {...threeDFlattening} />
				<Composition {...issue7050Repro} />
				<Composition {...issue7050Minimal} />
				<Composition {...issue6211MaskWheel} />
				<Composition {...issue7199ScaleAndDropShadow} />
				<Composition {...issue7243SvgJapaneseText} />
				<Composition {...issue7489Minimal} />
			</Folder>
			<Folder name="clip-path">
				<Composition {...clipPathPolygon} />
				<Composition {...clipPathPath} />
				<Composition {...clipPathCircle} />
				<Composition {...clipPathInset} />
				<Composition {...clipPathEllipse} />
			</Folder>
			<Folder name="Transitions">
				<Composition {...transitionWipe} />
				<Composition {...transitionClockWipe} />
				<Composition {...transitionIris} />
			</Folder>
			<Folder name="Issue8650">
				<Composition {...issue8650LottieControlChars} />
			</Folder>
			<Folder name="Issue9410">
				<Composition {...issue9410TwoAxisScale} />
			</Folder>
		</>
	);
};
