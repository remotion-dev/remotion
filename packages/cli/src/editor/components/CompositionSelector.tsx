import React, {useContext} from 'react';
import {CompositionManager, useTimelineSetFrame} from 'remotion';
import styled from 'styled-components';

const Container = styled.div`
	border-right: 1px solid black;
	position: absolute;
	height: 100%;
	width: 100%;
	overflow-y: auto;
	flex: 1;
	padding: 8px;
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

	return (
		<Container>
			{compositions.map((c) => {
				return (
					<Item
						key={c.name}
						selected={currentComposition === c.name}
						onClick={() => {
							window.history.pushState({}, 'Preview', `/${c.name}`);
							setCurrentFrame(0);
							setCurrentComposition(c.name);
						}}
					>
						{c.name}
					</Item>
				);
			})}
		</Container>
	);
};
