import React, {useCallback, useContext} from 'react';
import type {Guide} from '../../state/editor-guides';
import {
	EditorShowGuidesContext,
	persistGuidesList,
} from '../../state/editor-guides';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {InputDragger} from '../NewComposition/InputDragger';
import type {TimelineSelection} from '../Timeline/TimelineSelection';
import {
	InspectorDetailRow,
	InspectorMessage,
	InspectorSectionHeader,
} from './common';
import {guideDetailsContainer, selectedContainer} from './styles';

const updateGuidePosition = ({
	guideId,
	persist,
	position,
	setGuidesList,
}: {
	readonly guideId: string;
	readonly persist: boolean;
	readonly position: number;
	readonly setGuidesList: (cb: (prevState: Guide[]) => Guide[]) => void;
}) => {
	setGuidesList((prevState) => {
		const newGuides = prevState.map((guide) => {
			if (guide.id !== guideId) {
				return guide;
			}

			return {
				...guide,
				position: Math.round(position),
				show: true,
			};
		});

		if (persist) {
			persistGuidesList(newGuides);
		}

		return newGuides;
	});
};

export const GuideInspector: React.FC<{
	readonly selection: Extract<TimelineSelection, {type: 'guide'}>;
}> = ({selection}) => {
	const {guidesList, setGuidesList} = useContext(EditorShowGuidesContext);
	const guide = guidesList.find(
		(candidate) => candidate.id === selection.guideId,
	);

	const onValueChange = useCallback(
		(value: number) => {
			updateGuidePosition({
				guideId: selection.guideId,
				persist: false,
				position: value,
				setGuidesList,
			});
		},
		[selection.guideId, setGuidesList],
	);

	const onValueChangeEnd = useCallback(
		(value: number) => {
			updateGuidePosition({
				guideId: selection.guideId,
				persist: true,
				position: value,
				setGuidesList,
			});
		},
		[selection.guideId, setGuidesList],
	);

	if (!guide) {
		return <InspectorMessage>Guide unavailable</InspectorMessage>;
	}

	return (
		<div style={selectedContainer} className={VERTICAL_SCROLLBAR_CLASSNAME}>
			<InspectorSectionHeader>
				{guide.orientation === 'vertical' ? 'Vertical' : 'Horizontal'} guide
			</InspectorSectionHeader>
			<div style={guideDetailsContainer}>
				<InspectorDetailRow
					label={guide.orientation === 'vertical' ? 'X position' : 'Y position'}
				>
					<InputDragger
						type="number"
						value={guide.position}
						status="ok"
						onValueChange={onValueChange}
						onValueChangeEnd={onValueChangeEnd}
						onTextChange={() => undefined}
						step={1}
						formatter={(value) => String(Math.round(Number(value)))}
						rightAlign
						small
					/>
				</InspectorDetailRow>
			</div>
		</div>
	);
};
