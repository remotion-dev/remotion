import React, {useCallback, useContext, useEffect} from 'react';
import {Internals, TComposition} from 'remotion';
import styled from 'styled-components';
import {CurrentComposition} from './CurrentComposition';
import {
	getCurrentCompositionFromUrl,
	getFrameForComposition,
} from './FramePersistor';

const Container = styled.div`
	border-right: 1px solid black;
	position: absolute;
	height: 100%;
	width: 100%;
	flex: 1;
`;

const List = styled.div`
	padding: 8px;
	height: calc(100% - 100px);
	overflow-y: auto;
`;

const Item = styled.a<{
	selected: boolean;
}>`
	background: ${(props) => (props.selected ? 'white' : 'transparent')};
	color: ${(props) => (props.selected ? 'black' : 'white')};
	padding-left: 8px;
	padding-right: 8px;
	padding-top: 6px;
	padding-bottom: 6px;
	font-size: 13px;
	font-family: Arial, Helvetica, sans-serif;
	display: block;
	border-radius: 2px;
	text-decoration: none;
	cursor: default;
`;

export const CompositionSelector: React.FC = () => {
	const {compositions, setCurrentComposition, currentComposition} = useContext(
		Internals.CompositionManager
	);
	const setCurrentFrame = Internals.Timeline.useTimelineSetFrame();

	const selectComposition = useCallback(
		(c: TComposition) => {
			window.history.pushState({}, 'Preview', `/${c.id}`);
			const frame = getFrameForComposition(c.id);
			const frameInBounds = Math.min(c.durationInFrames - 1, frame);
			setCurrentFrame(frameInBounds);
			setCurrentComposition(c.id);
		},
		[setCurrentComposition, setCurrentFrame]
	);

	useEffect(() => {
		if (currentComposition) {
			return;
		}

		const compositionFromUrl = getCurrentCompositionFromUrl();
		if (compositionFromUrl) {
			const exists = compositions.find((c) => c.id === compositionFromUrl);
			if (exists) {
				selectComposition(exists);
				return;
			}
		}

		if (compositions.length > 0) {
			selectComposition(compositions[0]);
		}
	}, [compositions, currentComposition, selectComposition]);

	return (
		<Container>
			<CurrentComposition />
			<List>
				{compositions.map((c) => {
					return (
						<Item
							key={c.id}
							href={c.id}
							selected={currentComposition === c.id}
							onClick={(evt) => {
								evt.preventDefault();
								selectComposition(c);
							}}
						>
							{c.id}
						</Item>
					);
				})}
			</List>
		</Container>
	);
};
