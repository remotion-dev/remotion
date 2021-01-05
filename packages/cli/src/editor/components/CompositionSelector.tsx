import React, {useCallback, useContext, useEffect} from 'react';
import {CompositionManager, TComposition, useTimelineSetFrame} from 'remotion';
import styled from 'styled-components';
import {CurrentComposition} from './CurrentComposition';

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
	padding-top: 4px;
	padding-bottom: 4px;
	font-size: 13px;
	font-family: Arial, Helvetica, sans-serif;
	display: block;
	text-decoration: none;
	border-radius: 6px;
	cursor: default;
`;

export const CompositionSelector: React.FC = () => {
	const {compositions, setCurrentComposition, currentComposition} = useContext(
		CompositionManager
	);
	const setCurrentFrame = useTimelineSetFrame();

	const selectComposition = useCallback(
		(c: TComposition) => {
			window.history.pushState({}, 'Preview', `/${c.id}`);
			setCurrentFrame(0);
			setCurrentComposition(c.id);
		},
		[setCurrentComposition, setCurrentFrame]
	);

	useEffect(() => {
		if (!currentComposition && compositions.length) {
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
							selected={currentComposition === c.id}
							onClick={() => {
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
