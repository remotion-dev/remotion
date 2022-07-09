import type {
	ChangeEventHandler} from 'react';
import React, {
	useCallback,
	useContext,
	useMemo,
	useState,
} from 'react';
import {Internals} from 'remotion';
import {
	validateCompositionDimension,
	validateCompositionName,
} from '../../helpers/validate-new-comp-data';
import {Checkmark} from '../../icons/Checkmark';
import {
	loadAspectRatioOption,
	persistAspectRatioOption,
} from '../../state/aspect-ratio-locked';
import type {CompType} from '../../state/modals';
import { ModalsContext} from '../../state/modals';
import {CopyButton} from '../CopyButton';
import {Flex, Row, Spacing} from '../layout';
import {ModalContainer} from '../ModalContainer';
import {NewCompHeader} from '../ModalHeader';
import type { ComboboxValue} from './ComboBox';
import {Combobox} from './ComboBox';
import {CopyHint} from './CopyHint';
import {InputDragger} from './InputDragger';
import {inputArea, leftLabel} from './new-comp-layout';
import {NewCompAspectRatio} from './NewCompAspectRatio';
import {getNewCompositionCode} from './NewCompCode';
import {NewCompDuration} from './NewCompDuration';
import {RemotionInput} from './RemInput';
import {ValidationMessage} from './ValidationMessage';

const left: React.CSSProperties = {
	padding: 12,
	paddingBottom: 80,
	paddingRight: 12,
	flex: 1,
	fontSize: 13,
};

const panelRight: React.CSSProperties = {
	width: 400,
	backgroundColor: 'black',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	position: 'relative',
};

const pre: React.CSSProperties = {
	fontSize: 17,
	fontFamily: 'monospace',
};

const comboBoxStyle: React.CSSProperties = {
	width: inputArea.width,
};

const copyRowStyle: React.CSSProperties = {
	position: 'absolute',
	bottom: 10,
	right: 0,
	paddingRight: 10,
	paddingLeft: 20,
	width: '100%',
	alignItems: 'center',
	color: leftLabel.color,
};

const commonFrameRates = [24, 25, 29.97, 30, 48, 50];

const NewComposition: React.FC<{initialCompType: CompType}> = (props) => {
	const {initialCompType} = props;
	const [selectedFrameRate, setFrameRate] = useState<string>(
		String(commonFrameRates[0])
	);
	const {compositions} = useContext(Internals.CompositionManager);
	const [type, setType] = useState<CompType>(initialCompType);
	const [name, setName] = useState('MyComp');
	const [size, setSize] = useState({
		width: '1280',
		height: '720',
	});

	const panelContent: React.CSSProperties = useMemo(() => {
		return {
			flexDirection: 'row',
			display: 'flex',
			width: 950,
			height: type === 'composition' ? 450 : 300,
		};
	}, [type]);

	const [lockedAspectRatio, setLockedAspectRatio] = useState(
		loadAspectRatioOption() ? Number(size.width) / Number(size.height) : null
	);
	const [durationInFrames, setDurationInFrames] = useState('150');

	const setAspectRatioLocked = useCallback(
		(option: boolean) => {
			persistAspectRatioOption(option);
			setLockedAspectRatio(
				option ? Number(size.width) / Number(size.height) : null
			);
		},
		[size.height, size.width]
	);

	const {setSelectedModal} = useContext(ModalsContext);

	const onQuit = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);

	const onTypeChanged = useCallback((newType: CompType) => {
		setType(newType);
	}, []);

	const onWidthChanged: ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setSize((s) => {
				const {height} = s;
				const newWidth = Number(e.target.value);
				return {
					height:
						lockedAspectRatio === null
							? height
							: String(Math.ceil(newWidth / lockedAspectRatio / 2) * 2),
					width: String(newWidth),
				};
			});
		},
		[lockedAspectRatio]
	);

	const onWidthDirectlyChanged = useCallback(
		(newWidth: number) => {
			setSize((s) => {
				const {height} = s;

				return {
					height:
						lockedAspectRatio === null
							? height
							: String(Math.ceil(newWidth / lockedAspectRatio / 2) * 2),
					width: String(newWidth),
				};
			});
		},
		[lockedAspectRatio]
	);

	const onHeightDirectlyChanged = useCallback(
		(newHeight: number) => {
			setSize((s) => {
				const {width} = s;

				return {
					width:
						lockedAspectRatio === null
							? width
							: String(Math.ceil((newHeight / 2) * lockedAspectRatio) * 2),
					height: String(newHeight),
				};
			});
		},
		[lockedAspectRatio]
	);

	const onHeightChanged: ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setSize((s) => {
				const {width} = s;
				const newHeight = Number(e.target.value);
				return {
					width:
						lockedAspectRatio === null
							? width
							: String(Math.ceil((newHeight / 2) * lockedAspectRatio) * 2),
					height: String(newHeight),
				};
			});
		},
		[lockedAspectRatio]
	);
	const onNameChange: ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setName(e.target.value);
		},
		[]
	);
	const onFpsChange = useCallback((newFps: number) => {
		setFrameRate(String(newFps));
	}, []);

	const items: ComboboxValue[] = useMemo(() => {
		return commonFrameRates.map((frameRate): ComboboxValue => {
			return {
				id: String(frameRate),
				label: `${frameRate}fps`,
				onClick: () => onFpsChange(frameRate),
				type: 'item',
				value: frameRate,
				keyHint: null,
				leftItem:
					String(frameRate) === selectedFrameRate ? <Checkmark /> : null,
				subMenu: null,
			};
		});
	}, [onFpsChange, selectedFrameRate]);

	const compNameErrMessage = validateCompositionName(name, compositions);
	const compWidthErrMessage = validateCompositionDimension('Width', size.width);
	const compHeightErrMessage = validateCompositionDimension(
		'Height',
		size.height
	);

	const typeValues: ComboboxValue[] = useMemo(() => {
		return [
			{
				id: 'composition',
				keyHint: null,
				label: '<Composition />',
				leftItem: null,
				onClick: () => onTypeChanged('composition'),
				subMenu: null,
				type: 'item',
				value: 'composition' as CompType,
			},
			{
				id: 'still',
				keyHint: null,
				label: '<Still />',
				leftItem: null,
				onClick: () => onTypeChanged('still'),
				subMenu: null,
				type: 'item',
				value: 'still' as CompType,
			},
		];
	}, [onTypeChanged]);

	return (
		<ModalContainer onOutsideClick={onQuit} onEscape={onQuit}>
			<NewCompHeader title="New composition" />
			<div style={panelContent}>
				<div style={left}>
					<Spacing y={3} />
					<form>
						<label>
							<Row align="center">
								<div style={leftLabel}>Type</div>
								<div style={inputArea}>
									<Combobox
										title="Type of composition"
										style={comboBoxStyle}
										values={typeValues}
										selectedId={type}
									/>
								</div>
							</Row>
							<Spacing y={1} />

							<Row align="center">
								<div style={leftLabel}>Name</div>
								<div style={inputArea}>
									<RemotionInput
										value={name}
										onChange={onNameChange}
										type="text"
										placeholder="Composition name"
									/>
									{compNameErrMessage ? (
										<ValidationMessage message={compNameErrMessage} />
									) : null}
								</div>
							</Row>
						</label>
						<Spacing y={1} />
						<Row align="center">
							<div>
								<div>
									<label>
										<Row align="center">
											<div style={leftLabel}>Width</div>
											<div style={inputArea}>
												<InputDragger
													type="number"
													value={size.width}
													placeholder="Width (px)"
													onChange={onWidthChanged}
													name="width"
													step={2}
													min={2}
													max={100000000}
													onValueChange={onWidthDirectlyChanged}
												/>
												{compWidthErrMessage ? (
													<ValidationMessage message={compWidthErrMessage} />
												) : null}
											</div>
										</Row>
									</label>
								</div>
								<div />
								<Spacing y={1} />
								<div />
								<label>
									<Row align="center">
										<div style={leftLabel}>Height</div>
										<div style={inputArea}>
											<InputDragger
												type="number"
												value={size.height}
												onChange={onHeightChanged}
												placeholder="Height (px)"
												name="height"
												step={2}
												min={2}
												max={100000000}
												onValueChange={onHeightDirectlyChanged}
											/>
											{compHeightErrMessage ? (
												<ValidationMessage message={compHeightErrMessage} />
											) : null}
										</div>
									</Row>
								</label>
							</div>
							<div>
								<NewCompAspectRatio
									width={Number(size.width)}
									height={Number(size.height)}
									aspectRatioLocked={lockedAspectRatio}
									setAspectRatioLocked={setAspectRatioLocked}
								/>
							</div>
						</Row>
						<div />
						<Spacing y={1} />
						{type === 'composition' ? (
							<NewCompDuration
								durationInFrames={durationInFrames}
								fps={selectedFrameRate}
								setDurationInFrames={setDurationInFrames}
							/>
						) : null}
						<div />
						<br />
						<div />
						{type === 'composition' ? (
							<div>
								<div />
								<Spacing y={1} />
								<label>
									<div style={leftLabel}>Framerate</div>
									<Combobox
										title="Framerate"
										style={comboBoxStyle}
										values={items}
										selectedId={selectedFrameRate}
									/>
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
							fps: Number(selectedFrameRate),
							height: Number(size.height),
							width: Number(size.width),
							name,
							raw: false,
						})}
					</pre>
					<Row align="center" style={copyRowStyle}>
						<CopyHint />
						<Flex />
						<CopyButton
							label="Copy code"
							labelWhenCopied="Copied!"
							textToCopy={
								getNewCompositionCode({
									type,
									durationInFrames: Number(durationInFrames),
									fps: Number(selectedFrameRate),
									height: Number(size.height),
									width: Number(size.width),
									name,
									raw: true,
								}) as string
							}
						/>
					</Row>
				</div>
			</div>
		</ModalContainer>
	);
};

export default NewComposition;
