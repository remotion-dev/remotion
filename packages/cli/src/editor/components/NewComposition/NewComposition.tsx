import React, {
	ChangeEventHandler,
	useCallback,
	useContext,
	useMemo,
	useState,
} from 'react';
import {Internals} from 'remotion';
import {Checkmark} from '../../icons/Checkmark';
import {ModalsContext} from '../../state/modals';
import {CopyButton} from '../CopyButton';
import {Row, Spacing} from '../layout';
import {ModalContainer} from '../ModalContainer';
import {NewCompHeader} from '../ModalHeader';
import {Combobox, ComboboxValue} from './ComboBox';
import {CompositionType, CompType} from './CompositionType';
import {InputDragger} from './InputDragger';
import {inputArea, leftLabel} from './new-comp-layout';
import {NewCompAspectRatio} from './NewCompAspectRatio';
import {getNewCompositionCode} from './NewCompCode';
import {NewCompDuration} from './NewCompDuration';
import {RemotionInput} from './RemInput';
import {ValidationMessage} from './ValidationMessage';

const panelContent: React.CSSProperties = {
	flexDirection: 'row',
	display: 'flex',
	width: 1100,
	height: 450,
};

const left: React.CSSProperties = {
	padding: 12,
	paddingBottom: 80,
	paddingRight: 12,
	flex: 1,
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
};

const commonFrameRates = [24, 25, 29.97, 30, 48, 50];

export const NewComposition: React.FC<{initialCompType: CompType}> = ({
	initialCompType,
}) => {
	const [selectedFrameRate, setFrameRate] = useState<string>(
		String(commonFrameRates[0])
	);
	const [type, setType] = useState<CompType>(initialCompType);
	const [name, setName] = useState('MyComp');
	const [width, setWidth] = useState('1280');
	const [height, setHeight] = useState('720');
	const [durationInFrames, setDurationInFrames] = useState('150');
	const {setSelectedModal} = useContext(ModalsContext);

	const onQuit = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);

	const onTypeChanged = useCallback((newType: CompType) => {
		setType(newType);
	}, []);

	const onWidthChanged: ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setWidth(e.target.value);
		},
		[]
	);

	const onWidthDirectlyChanged = useCallback((newWidth: number) => {
		setWidth(String(newWidth));
	}, []);

	const onHeightDirectlyChanged = useCallback((newHeight: number) => {
		setHeight(String(newHeight));
	}, []);

	const onHeightChanged: ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setHeight(e.target.value);
		},
		[]
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
		return commonFrameRates.map(
			(frameRate): ComboboxValue => {
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
			}
		);
	}, [onFpsChange, selectedFrameRate]);

	const isValidCompName = Internals.isCompositionIdValid(name);

	return (
		<ModalContainer onOutsideClick={onQuit} onEscape={onQuit}>
			<NewCompHeader title="New composition" />
			<div style={panelContent}>
				<div style={left}>
					<CompositionType onSelected={onTypeChanged} type={type} />
					<Spacing y={3} />
					<form>
						<label>
							<Row align="center">
								<div style={leftLabel}>Name</div>
								<div style={inputArea}>
									<RemotionInput
										value={name}
										onChange={onNameChange}
										type="text"
										placeholder="Composition name"
									/>
									{isValidCompName ? null : (
										<ValidationMessage
											message={Internals.invalidCompositionErrorMessage}
										/>
									)}
								</div>
							</Row>
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
										<Row align="center">
											<div style={leftLabel}>Width</div>
											<div style={inputArea}>
												<InputDragger
													type="number"
													value={width}
													placeholder="Width (px)"
													onChange={onWidthChanged}
													name="width"
													step={2}
													min={2}
													onValueChange={onWidthDirectlyChanged}
												/>
												{Number(width) % 2 === 0 ? null : (
													<ValidationMessage message="Dimension should be divisible by 2, since H264 codec doesn't support odd dimensions.." />
												)}
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
												value={height}
												onChange={onHeightChanged}
												placeholder="Height (px)"
												name="height"
												step={2}
												min={2}
												onValueChange={onHeightDirectlyChanged}
											/>
											{Number(height) % 2 === 0 ? null : (
												<ValidationMessage message="Dimension should be divisible by 2, since H264 codec doesn't support odd dimensions.." />
											)}
										</div>
									</Row>
								</label>
							</div>
							<div>
								<NewCompAspectRatio
									width={Number(width)}
									height={Number(height)}
								/>
							</div>
						</div>
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
										style={{
											width: inputArea.width,
										}}
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
							height: Number(height),
							width: Number(width),
							name,
							raw: false,
						})}
					</pre>
					<div
						style={{
							position: 'absolute',
							bottom: 10,
							right: 10,
						}}
					>
						<CopyButton
							label="Copy code"
							labelWhenCopied="Copied!"
							textToCopy={
								getNewCompositionCode({
									type,
									durationInFrames: Number(durationInFrames),
									fps: Number(selectedFrameRate),
									height: Number(height),
									width: Number(width),
									name,
									raw: true,
								}) as string
							}
						/>
					</div>
				</div>
			</div>
		</ModalContainer>
	);
};
