import React, {ChangeEventHandler, useCallback, useState} from 'react';
import {BACKGROUND} from '../helpers/colors';
import {FONT_FAMILY} from '../helpers/font';

const backgroundOverlay: React.CSSProperties = {
	backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
	padding: 20,
	color: 'white',
	fontFamily: FONT_FAMILY,
};

type CompositionType = 'composition' | 'still';

export const NewSequence: React.FC = () => {
	const [type, setType] = useState<CompositionType>('composition');
	const [width, setWidth] = useState('1280');
	const [height, setHeight] = useState('720');

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

	return (
		<div style={backgroundOverlay}>
			<div style={panel}>
				<form>
					<input type="text" placeholder="Composition name" />
					<br />
					<br />
					<label>
						<input
							onChange={onCompositionChanged}
							checked={type === 'composition'}
							name="type"
							type="radio"
						/>
						Composition
					</label>
					<label>
						<input
							onChange={onStillChanged}
							checked={type === 'still'}
							name="type"
							type="radio"
						/>
						Still
					</label>
					<br />
					<br />
					<input
						type="number"
						value={width}
						placeholder="Width (px)"
						onChange={onWidthChanged}
						name="width"
					/>
					<br />
					<input
						type="number"
						value={height}
						onChange={onHeightChanged}
						placeholder="Height (px)"
						name="height"
					/>
					<br />
					<select>
						<option>24fps</option>
						<option>25fps</option>
						<option>29.97fps</option>
						<option>30fps</option>
						<option>48fps</option>
						<option>50fps</option>
						<option>60fps</option>
					</select>
				</form>
			</div>
		</div>
	);
};
