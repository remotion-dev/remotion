import React, {useCallback, useContext, useEffect} from 'react';
import {Internals, TComposition} from 'remotion';
import styled from 'styled-components';
import {CLEAR_HOVER, SELECTED_BACKGROUND} from '../helpers/colors';
import {isCompositionStill} from '../helpers/is-composition-still';
import {FilmIcon} from '../icons/film';
import {StillIcon} from '../icons/still';
import {useZIndex} from '../state/z-index';
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
	padding: 5px;
	height: calc(100% - 100px);
	overflow-y: auto;
`;

const Item = styled.a<{
	selected: boolean;
}>`
	background: ${(props) =>
		props.selected ? SELECTED_BACKGROUND : 'transparent'};
	color: ${(props) => (props.selected ? 'white' : 'rgba(255, 255, 255, 0.6)')};
	padding-left: 8px;
	padding-right: 8px;
	padding-top: 6px;
	padding-bottom: 6px;
	font-size: 13px;
	font-family: Arial, Helvetica, sans-serif;
	display: flex;
	border-radius: 2px;
	text-decoration: none;
	cursor: default;
	align-items: center;
	border-width: 1px;
	border-style: solid;
	border-color: transparent;
	margin-bottom: 1px;
	&:hover {
		border-color: ${(props) => (props.selected ? 'transparent' : CLEAR_HOVER)};
		background: ${(props) =>
			props.selected ? SELECTED_BACKGROUND : CLEAR_HOVER};
		color: white;
	}
`;

const spacer: React.CSSProperties = {
	width: 6,
};

export const CompositionSelector: React.FC = () => {
	const {compositions, setCurrentComposition, currentComposition} = useContext(
		Internals.CompositionManager
	);
	const {tabIndex} = useZIndex();
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
							tabIndex={tabIndex}
							onClick={(evt) => {
								evt.preventDefault();
								selectComposition(c);
							}}
						>
							{isCompositionStill(c) ? (
								<StillIcon style={{height: 18, width: 18}} />
							) : (
								<FilmIcon style={{height: 18, width: 18}} />
							)}
							<div style={spacer} />
							{c.id}
						</Item>
					);
				})}
			</List>
		</Container>
	);
};
