import React from 'react';
import styled from 'styled-components';
import {Device} from './Device';

const Container = styled.div`
	flex: 1;
	background-color: white;
`;

export const Springy = () => {
	return (
		<Container>
			<Device top={1300} rotationAmount={0} fruit="blueberry" />
			<Device top={1170} rotationAmount={0.15} fruit="kiwi" />
			<Device top={1000} rotationAmount={0.3} fruit="banana" />
			<Device top={790} rotationAmount={0.45} fruit="apricot" />
			<Device top={530} rotationAmount={0.6} fruit="pink" />
			<Device top={230} rotationAmount={0.75} fruit="strawberry" />
			<Device top={-110} rotationAmount={0.9} fruit="cherry" />
		</Container>
	);
};

export default Springy;
