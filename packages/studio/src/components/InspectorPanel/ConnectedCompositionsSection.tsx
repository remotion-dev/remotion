import React, {useContext, useMemo} from 'react';
import type {_InternalTypes} from 'remotion';
import {Internals} from 'remotion';
import {getConnectedCompositions} from '../../helpers/get-connected-compositions';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {CompositionOrStillIcon} from '../CompositionOrStillIcon';
import {useSelectComposition} from '../InitialCompositionLoader';
import {InspectorInlineAction} from './common';

const compositionIconStyle: React.CSSProperties = {
	height: 13,
	width: 13,
};

const compositionListStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	padding: '6px 0',
};

export const useConnectedCompositions = ({
	track,
}: {
	readonly track: TrackWithHash;
}) => {
	const {compositions} = useContext(Internals.CompositionManager);
	return useMemo(
		() =>
			getConnectedCompositions({
				compositions,
				singleChildComponent: track.sequence.singleChildComponent,
			}),
		[compositions, track.sequence.singleChildComponent],
	);
};

export const ConnectedCompositionsSection: React.FC<{
	readonly connectedCompositions: readonly _InternalTypes['AnyComposition'][];
}> = ({connectedCompositions}) => {
	const selectComposition = useSelectComposition();

	return (
		<div style={compositionListStyle}>
			{connectedCompositions.map((composition) => (
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
	);
};
