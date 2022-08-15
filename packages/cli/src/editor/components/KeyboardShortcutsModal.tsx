import React, {useCallback, useContext} from 'react';
import {ArrowLeft, ArrowRight, ShiftIcon} from '../icons/keys';
import {ModalsContext} from '../state/modals';
import {Column, Row, Spacing} from './layout';
import {ModalContainer} from './ModalContainer';
import {NewCompHeader} from './ModalHeader';

const left: React.CSSProperties = {
	width: 100,
	paddingTop: 8,
	paddingBottom: 8,
};

const shortLeft: React.CSSProperties = {
	...left,
	width: 40,
};

const key: React.CSSProperties = {
	background: '#333',
	padding: '3px 6px',
	color: 'white',
	borderRadius: 3,
	border: '1px solid black',
	borderBottomWidth: 3,
	fontSize: 13,
	fontFamily: 'monospace',
};

const right: React.CSSProperties = {
	fontSize: 14,
	color: '#eee',
};

const container: React.CSSProperties = {
	paddingLeft: 20,
	paddingRight: 40,
	paddingTop: 10,
	paddingBottom: 10,
};

const title: React.CSSProperties = {
	fontWeight: 'bold',
	color: 'white',
	fontSize: 14,
	marginBottom: 10,
};

export const KeyboardShortcuts: React.FC = () => {
	const {setSelectedModal} = useContext(ModalsContext);

	const onQuit = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);

	return (
		<ModalContainer onEscape={onQuit} onOutsideClick={onQuit}>
			<NewCompHeader title="Keyboard shortcuts" />
			<Row style={container}>
				<Column>
					<div style={title}>Playback</div>
					<Row align="center">
						<div style={left}>
							<kbd style={key}>
								<ShiftIcon />
							</kbd>
							<Spacing x={0.3} />
							<kbd style={key}>
								<ArrowLeft />
							</kbd>
						</div>
						<div style={right}>1 second back</div>
					</Row>
					<Row align="center">
						<div style={left}>
							<kbd style={key}>
								<ArrowLeft />
							</kbd>
						</div>
						<div style={right}>Previous frame</div>
					</Row>
					<Row align="center">
						<div style={left}>
							<kbd style={key}>Space</kbd>
						</div>
						<div style={right}>Play / Pause</div>
					</Row>
					<Row align="center">
						<div style={left}>
							<kbd style={key}>
								<ArrowRight />
							</kbd>
						</div>
						<div style={right}>Next frame</div>
					</Row>
					<Row align="center">
						<div style={left}>
							<kbd style={key}>
								<ShiftIcon />
							</kbd>
							<Spacing x={0.3} />
							<kbd style={key}>
								<ArrowRight />
							</kbd>
						</div>
						<div style={right}>1 second forward</div>
					</Row>

					<br />
					<br />
					<Row align="center">
						<div style={left}>
							<kbd style={key}>A</kbd>
						</div>
						<div style={right}>Jump to beginning</div>
					</Row>
					<Row align="center">
						<div style={left}>
							<kbd style={key}>E</kbd>
						</div>
						<div style={right}>Jump to end</div>
					</Row>
					<br />
					<br />
					<Row align="center">
						<div style={left}>
							<kbd style={key}>J</kbd>
						</div>
						<div style={right}>Reverse playback</div>
					</Row>
					<Row align="center">
						<div style={left}>
							<kbd style={key}>K</kbd>
						</div>
						<div style={right}>Pause</div>
					</Row>
					<Row align="center">
						<div style={left}>
							<kbd style={key}>L</kbd>
						</div>
						<div style={right}>Play / Speed up</div>
					</Row>
					<Row align="center">
						<div style={left}>
							<kbd style={key}>Enter</kbd>
						</div>
						<div style={right}>Pause & return to playback start</div>
					</Row>
				</Column>
				<Spacing x={8} />
				<Column>
					<div style={title}>Navigation</div>

					<Row align="center">
						<div style={shortLeft}>
							<kbd style={key}>N</kbd>
						</div>
						<div style={right}>New composition</div>
					</Row>
					<Row align="center">
						<div style={shortLeft}>
							<kbd style={key}>T</kbd>
						</div>
						<div style={right}>Toggle checkerboard transparency</div>
					</Row>
					<Row align="center">
						<div style={shortLeft}>
							<kbd style={key}>?</kbd>
						</div>
						<div style={right}>Show keyboard shortcuts</div>
					</Row>
					<br />
					<div style={title}>Playback range</div>

					<Row align="center">
						<div style={shortLeft}>
							<kbd style={key}>I</kbd>
						</div>
						<div style={right}>Set In Point</div>
					</Row>
					<Row align="center">
						<div style={shortLeft}>
							<kbd style={key}>O</kbd>
						</div>
						<div style={right}>Set Out Point</div>
					</Row>
					<Row align="center">
						<div style={shortLeft}>
							<kbd style={key}>X</kbd>
						</div>
						<div style={right}>Clear In/Out Points</div>
					</Row>
				</Column>
			</Row>
		</ModalContainer>
	);
};
