import React from 'react';
import styled from 'styled-components';

const Base = styled.div`
	font-size: 60px;
	font-family: 'Roboto';
	color: white;
	position: relative;
	font-weight: bold;
`;

const Offset = styled.div`
	font-size: 60px;
	font-family: 'Roboto';
	color: #aaa;
	font-weight: bold;
	position: absolute;
	top: 0;
`;

export const TextComp: React.FC = () => {
	return (
		<div
			style={{
				perspective: 100,
			}}
		>
			<div
				style={{
					position: 'relative',
				}}
			>
				{new Array(100)
					.fill(true)
					.map((a, i) => i)
					.map((i) => {
						return (
							<Offset
								key={i}
								style={{
									transform: `translateZ(${-i * 3}px) rotateY(80deg)`,
									transformOrigin: '30% 0%',
								}}
							>
								Text
							</Offset>
						);
					})}
				<Base style={{transform: 'rotateY(80deg)'}}>Text</Base>
			</div>
		</div>
	);
};
