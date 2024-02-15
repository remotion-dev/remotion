import {type Size} from '@remotion/player';
import {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import type {AssetMetadata} from '../../helpers/get-asset-metadata';
import type {Dimensions} from '../../helpers/is-current-selected-still';
import {useStudioCanvasDimensions} from '../../helpers/use-studio-canvas-dimensions';
import {EditorShowGuidesContext} from '../../state/editor-guides';
import GuideComp from './Guide';

const EditorGuides: React.FC<{
	canvasSize: Size | null;
	contentDimensions: Dimensions | 'none' | null;
	assetMetadata: AssetMetadata | null;
}> = ({canvasSize, contentDimensions, assetMetadata}) => {
	const {canvasPosition: canvasDimensions, scale} = useStudioCanvasDimensions({
		canvasSize,
		contentDimensions,
		assetMetadata,
	});

	const {canvasContent} = useContext(Internals.CompositionManager);

	if (canvasContent === null || canvasContent.type !== 'composition') {
		throw new Error('Expected to be in a composition');
	}

	const {guidesList} = useContext(EditorShowGuidesContext);

	const guidesForThisComposition = useMemo(() => {
		return guidesList.filter((guide) => {
			return guide.compositionId === canvasContent.compositionId;
		});
	}, [canvasContent.compositionId, guidesList]);

	return (
		<>
			{guidesForThisComposition.map((guide) => {
				return (
					<GuideComp
						key={guide.id}
						guide={guide}
						canvasDimensions={canvasDimensions}
						scale={scale}
					/>
				);
			})}
		</>
	);
};

export default EditorGuides;
