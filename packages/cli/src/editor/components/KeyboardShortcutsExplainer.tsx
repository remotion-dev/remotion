import React from 'react';
import {cmdOrCtrlCharacter} from '../../preview-server/error-overlay/remotion-overlay/ShortcutHint';
import {
	INPUT_BACKGROUND,
	INPUT_BORDER_COLOR_UNHOVERED,
} from '../helpers/colors';
import {areKeyboardShortcutsDisabled} from '../helpers/use-keybinding';
import {ArrowLeft, ArrowRight, ShiftIcon} from '../icons/keys';
import {Column, Row, Spacing} from './layout';

const left: React.CSSProperties = {
	width: 85,
	paddingTop: 8,
	paddingBottom: 8,
};

const key: React.CSSProperties = {
	background: INPUT_BACKGROUND,
	padding: '3px 6px',
	color: 'white',
	borderRadius: 3,
	border: '1px solid ' + INPUT_BORDER_COLOR_UNHOVERED,
	borderBottomWidth: 3,
	fontSize: 14,
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

const keyboardShortcutsDisabled: React.CSSProperties = {
	padding: 12,
	width: '100%',
	fontSize: 14,
	backgroundColor: 'rgba(255, 255, 255, 0.1)',
};

const ul: React.CSSProperties = {
	marginTop: 0,
	marginBottom: 0,
};

const li: React.CSSProperties = {
	fontSize: 14,
};

export const KeyboardShortcutsExplainer: React.FC = () => {
	return (
		<div>
			{areKeyboardShortcutsDisabled() ? (
				<div style={keyboardShortcutsDisabled}>
					Keyboard shortcuts disabled either due to:
					<ul style={ul}>
						<li style={li}>a) --disable-keyboard-shortcuts being passed</li>
						<li style={li}>
							b) Config.setKeyboardShortcutsEnabled(false) being set or
						</li>
						<li style={li}> c) a Remotion version mismatch.</li>
					</ul>
				</div>
			) : null}
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
					<br />
					<div style={title}>Sidebar</div>
					<Row align="center">
						<div style={left}>
							<kbd style={key}>{cmdOrCtrlCharacter}</kbd>
							<Spacing x={0.3} />
							<kbd style={key}>B</kbd>
						</div>
						<div style={right}>Toggle left sidebar</div>
					</Row>
					<Row align="center">
						<div style={left}>
							<kbd style={key}>{cmdOrCtrlCharacter}</kbd>
							<Spacing x={0.3} />
							<kbd style={key}>J</kbd>
						</div>
						<div style={right}>Toggle right sidebar</div>
					</Row>
					<Row align="center">
						<div style={left}>
							<kbd style={key}>{cmdOrCtrlCharacter}</kbd>
							<Spacing x={0.3} />
							<kbd style={key}>G</kbd>
						</div>
						<div style={right}>Toggle both sidebars</div>
					</Row>
					<br />
				</Column>
				<Spacing x={8} />
				<Column>
					<div style={title}>Navigation</div>
					<Row align="center">
						<div style={left}>
							<kbd style={key}>N</kbd>
						</div>
						<div style={right}>New composition</div>
					</Row>
					<Row align="center">
						<div style={left}>
							<kbd style={key}>R</kbd>
						</div>
						<div style={right}>Render composition</div>
					</Row>
					<Row align="center">
						<div style={left}>
							<kbd style={key}>T</kbd>
						</div>
						<div style={right}>Toggle checkerboard transparency</div>
					</Row>
					<Row align="center">
						<div style={left}>
							<kbd style={key}>?</kbd>
						</div>
						<div style={right}>Show keyboard shortcuts</div>
					</Row>
					<Row align="center">
						<div style={left}>
							<kbd style={key}>{cmdOrCtrlCharacter}</kbd>
							<Spacing x={0.3} />
							<kbd style={key}>K</kbd>
						</div>
						<div style={right}>Quick Switcher</div>
					</Row>
					<br />
					<div style={title}>Playback range</div>
					<Row align="center">
						<div style={left}>
							<kbd style={key}>I</kbd>
						</div>
						<div style={right}>Set In Point</div>
					</Row>
					<Row align="center">
						<div style={left}>
							<kbd style={key}>O</kbd>
						</div>
						<div style={right}>Set Out Point</div>
					</Row>
					<Row align="center">
						<div style={left}>
							<kbd style={key}>X</kbd>
						</div>
						<div style={right}>Clear In/Out Points</div>
					</Row>
					<br />
					<div style={title}>Zoom</div>
					<Row align="center">
						<div style={left}>
							<kbd style={key}>+</kbd>
						</div>
						<div style={right}>Zoom in</div>
					</Row>
					<Row align="center">
						<div style={left}>
							<kbd style={key}>-</kbd>
						</div>
						<div style={right}>Zoom out</div>
					</Row>
					<Row align="center">
						<div style={left}>
							<kbd style={key}>0</kbd>
						</div>
						<div style={right}>Reset zoom</div>
					</Row>
				</Column>
			</Row>
		</div>
	);
};
