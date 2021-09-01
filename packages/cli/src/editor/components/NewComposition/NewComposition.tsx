import React, {ChangeEventHandler, useCallback, useState} from 'react';
import {BACKGROUND} from '../../helpers/colors';
import {FONT_FAMILY} from '../../helpers/font';
import {getNewCompositionCode} from './NewCompCode';
import {NewCompHeader} from './NewCompHeader';
import {RemotionInput} from './RemInput';
import {aspectRatio} from './render-aspect-ratio';

const backgroundOverlay: React.CSSProperties = {
	backgroundColor: 'rgba(255, 255, 255, 0.2)',
	backdropFilter: `blur(1px)`,
	position: 'fixed',
	height: '100%',
	width: '100%',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
};

const panel: React.CSSProperties = {
	backgroundColor: BACKGROUND,
	boxShadow: '0 0 4px black',
	color: 'white',
	fontFamily: FONT_FAMILY,
};

const panelContent: React.CSSProperties = {
	flexDirection: 'row',
	display: 'flex',
};

const left: React.CSSProperties = {
	padding: 20,
	paddingTop: 80,
	paddingBottom: 80,
	paddingRight: 40,
};

const panelRight: React.CSSProperties = {
	width: 400,
	backgroundColor: 'black',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
};

const leftLabel: React.CSSProperties = {
	width: 160,
	display: 'inline-block',
	textAlign: 'right',
	paddingRight: 30,
	fontSize: 14,
	color: '#ddd',
};

const pre: React.CSSProperties = {
	fontSize: 17,
};

type CompositionType = 'composition' | 'still';

export const NewSequence: React.FC = () => {
	const [type, setType] = useState<CompositionType>('composition');
	const [name, setName] = useState('MyComp');
	const [width, setWidth] = useState('1280');
	const [height, setHeight] = useState('720');
	const [fps, setFps] = useState(24);
	const [durationInFrames, setDurationInFrames] = useState('150');

	const onStillChanged: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			if (e.target.checked) {
				setType('still');
			}
		},
		[]
	);

	const onCompositionChanged: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			if (e.target.checked) {
				setType('composition');
			}
		},
		[]
	);

	const onWidthChanged: ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setWidth(e.target.value);
		},
		[]
	);

	const onHeightChanged: ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setHeight(e.target.value);
		},
		[]
	);
	const onDurationInFramesChanged: ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setDurationInFrames(e.target.value);
		},
		[]
	);
	const onNameChange: ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setName(e.target.value);
		},
		[]
	);
	const onFpsChange: ChangeEventHandler<HTMLSelectElement> = useCallback(
		(e) => {
			setFps(Number(e.target.value));
		},
		[]
	);

	return (
		<div style={backgroundOverlay}>
			<div style={panel}>
				<NewCompHeader />
				<div style={panelContent}>
					<div style={left}>
						<form>
							<label>
								<div style={leftLabel}>Name</div>
								<RemotionInput
									value={name}
									onChange={onNameChange}
									type="text"
									placeholder="Composition name"
								/>
							</label>
							<br />
							<br />
							<div>
								<div style={leftLabel}>Type</div>
								<label>
									<RemotionInput
										onChange={onCompositionChanged}
										checked={type === 'composition'}
										name="type"
										type="radio"
									/>
									Composition
								</label>
								<label>
									<RemotionInput
										onChange={onStillChanged}
										checked={type === 'still'}
										name="type"
										type="radio"
									/>
									Still
								</label>
							</div>
							<br />
							<label>
								<div style={leftLabel}>Width</div>
								<RemotionInput
									type="number"
									value={width}
									placeholder="Width (px)"
									onChange={onWidthChanged}
									name="width"
								/>
							</label>
							<br />
							<br />
							<label>
								<div style={leftLabel}>Height</div>
								<RemotionInput
									type="number"
									value={height}
									onChange={onHeightChanged}
									placeholder="Height (px)"
									name="height"
								/>
							</label>
							<br />
							<br />
							<div>
								<div style={leftLabel}>Aspect ratio</div>
								{aspectRatio(Number(width) / Number(height))}
							</div>
							<br />
							<label>
								<div style={leftLabel}> Duration in frames</div>
								<RemotionInput
									type="number"
									value={durationInFrames}
									onChange={onDurationInFramesChanged}
									placeholder="Duration (frames)"
									name="height"
								/>
								<span>
									{(Number(durationInFrames) / Number(fps)).toFixed(2)}sec
								</span>
							</label>
							<br />
							<br />
							<br />
							<br />
							<label>
								<div style={leftLabel}>Framerate</div>
								<select value={fps} onChange={onFpsChange}>
									<option value="24">24fps</option>
									<option value="25">25fps</option>
									<option value="29.97">29.97fps</option>
									<option value="30">30fps</option>
									<option value="48">48fps</option>
									<option value="50">50fps</option>
									<option value="60">60fps</option>
								</select>
							</label>
						</form>
					</div>

					<div style={panelRight}>
						<pre style={pre}>
							{getNewCompositionCode({
								type,
								durationInFrames: Number(durationInFrames),
								fps: Number(fps),
								height: Number(height),
								width: Number(width),
								name,
							})}
						</pre>
					</div>
				</div>
			</div>
		</div>
	);
};
