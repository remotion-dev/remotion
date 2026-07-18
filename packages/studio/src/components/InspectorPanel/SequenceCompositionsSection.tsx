import React, {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {CompositionOrStillIcon} from '../CompositionOrStillIcon';
import {useSelectComposition} from '../InitialCompositionLoader';
import {InspectorInlineAction} from './common';
import {getCompositionsMatchingSingleChild} from './get-compositions-matching-single-child';
import {detailsContainer, inspectorSectionDivider} from './styles';

const compositionIconStyle: React.CSSProperties = {
	height: 13,
	width: 13,
};

const compositionListStyle: React.CSSProperties = {
	...detailsContainer,
	display: 'flex',
	flexDirection: 'column',
	paddingBottom: 6,
	paddingTop: 6,
};

export const SequenceCompositionsSection: React.FC<{
	readonly track: TrackWithHash;
}> = ({track}) => {
	const {compositions} = useContext(Internals.CompositionManager);
	const selectComposition = useSelectComposition();
	const matchingCompositions = useMemo(
		() =>
			getCompositionsMatchingSingleChild({
				compositions,
				singleChildComponent: track.sequence.singleChildComponent,
			}),
		[compositions, track.sequence.singleChildComponent],
	);

	if (matchingCompositions.length === 0) {
		return null;
	}

	return (
		<>
			<div style={inspectorSectionDivider} />
			<div style={compositionListStyle}>
				{matchingCompositions.map((composition) => (
					<InspectorInlineAction
						key={composition.id}
						disabled={false}
						onClick={() => selectComposition(composition, true)}
						renderIcon={(color) => (
							<CompositionOrStillIcon
								color={color}
								composition={composition}
								style={compositionIconStyle}
							/>
						)}
					>
						{composition.id}
					</InspectorInlineAction>
				))}
			</div>
		</>
	);
};
