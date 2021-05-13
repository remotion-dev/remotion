import styled from 'styled-components';

export const CONTROL_BUTTON_PADDING = 6;

export const ControlButton = styled.button`
	opacity: ${(p) => (p.disabled ? 0.5 : 1)};
	display: inline-flex;
	background: none;
	border: none;
	padding: ${CONTROL_BUTTON_PADDING}px;
`;

export const ControlDiv = styled.div`
	display: inline-flex;
	background: none;
	border: none;
	padding: ${CONTROL_BUTTON_PADDING}px;
	justify-content: 'center';
	align-items: center;
`;
