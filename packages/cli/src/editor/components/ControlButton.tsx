import styled from 'styled-components';

export const ControlButton = styled.button`
	opacity: ${(p) => (p.disabled ? 0.5 : 1)};
	display: inline-flex;
	background: none;
	border: none;
	padding: 6px;
`;
