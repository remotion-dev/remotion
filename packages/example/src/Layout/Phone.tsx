import React, {HTMLAttributes} from 'react';
import styled from 'styled-components';

export const PhoneWidth = 100;
export const PhoneHeight = 200;

const Container = styled.div`
	width: ${PhoneWidth}px;
	height: ${PhoneHeight}px;
	position: absolute;
`;

export const Phone: React.FC<
	HTMLAttributes<HTMLDivElement> & {
		phoneScale: number;
	}
> = (props) => {
	const img = require('../assets/packs.png').default;
	const {phoneScale, ...otherProps} = props;
	return (
		<Container {...otherProps}>
			<img
				src={img}
				style={{
					height: PhoneHeight,
					width: PhoneHeight,
					marginLeft: -PhoneWidth / 2,
					position: 'absolute',
					transform: `scale(${phoneScale})`,
				}}
			></img>
		</Container>
	);
};
