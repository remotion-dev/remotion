import styled from 'styled-components';
import {Logo} from './Logo';

const Title = styled.div`
	font-size: 210px;
	font-weight: 700;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
		Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

export const LogoWithTitle: React.FC<{
	yOffset: number;
}> = ({yOffset}) => {
	return (
		<div
			style={{
				flex: 1,
				display: 'flex',
				backgroundColor: 'white',
				flexDirection: 'row',
				alignItems: 'center',
				fontFamily: 'Helvetica',
			}}
		>
			<Logo size={1100} />
			<div style={{flex: 1}}>
				<Title style={{transform: `translateY(${yOffset}px)`}}>Remotion</Title>
			</div>
		</div>
	);
};
