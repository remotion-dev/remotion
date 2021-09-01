import React, {ChangeEventHandler, useCallback, useState} from 'react';
import {BACKGROUND} from '../../helpers/colors';
import {FONT_FAMILY} from '../../helpers/font';
import {Spacing} from '../Spacing';
import {CompositionType, CompType} from './CompositionType';
import {NewCompAspectRatio} from './NewCompAspectRatio';
import {getNewCompositionCode} from './NewCompCode';
import {NewCompHeader} from './NewCompHeader';
import {RemotionInput} from './RemInput';

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
	padding: 12,
	paddingBottom: 80,
	paddingRight: 12,
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

export const NewSequence: React.FC = () => {
	const [type, setType] = useState<CompType>('composition');
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

	const onTypeChanged = useCallback((newType: CompType) => {
		setType(newType);
	}, []);

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
						<CompositionType onSelected={onTypeChanged} type={type} />
						<Spacing y={3} />
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
							<Spacing y={1} />
							<div
								style={{
									display: 'flex',
									flexDirection: 'row',
									alignItems: 'center',
								}}
							>
								<div>
									<div>
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
									</div>
									<Spacing y={1} />
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
								</div>
								<div>
									<NewCompAspectRatio
										width={Number(width)}
										height={Number(height)}
									/>
								</div>
							</div>
							<Spacing y={1} />
							{type === 'composition' ? (
								<div>
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
								</div>
							) : null}
							{type === 'composition' ? (
								<div>
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
								</div>
							) : null}
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
