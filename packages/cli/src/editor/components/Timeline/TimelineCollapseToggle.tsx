import React, {SVGProps} from 'react';
import styled from 'styled-components';

const Container = styled.div`
	height: 10px;
	width: 10px;
	display: flex;
	justify-content: center;
	align-items: center;
`;

const Icon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg viewBox="0 0 8 10" {...props} style={{height: 10, width: 8}}>
			<path d="M 0 0 L 8 5 L 0 10 z" fill="#ddd" />
		</svg>
	);
};

export const TimelineCollapseToggle: React.FC<{
	collapsed: boolean;
}> = ({collapsed}) => {
	return (
		<Container style={collapsed ? {} : {transform: 'rotate(90deg)'}}>
			<Icon />
		</Container>
	);
};
