import type {ChangeEventHandler} from 'react';
import React, {
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import {Internals} from 'remotion';
import {
	getUniqueCompositionName,
	useCreateComposition,
} from '../../helpers/use-create-composition';
import {Spacing} from '../layout';
import {ModalFooterContainer} from '../ModalFooter';
import {ModalHeader} from '../ModalHeader';
import {label, optionRow, rightRow} from '../RenderModal/layout';
import {CodemodFooter} from './CodemodFooter';
import {DismissableModal} from './DismissableModal';
import {getNewCompositionDefaults} from './get-new-composition-defaults';
import {InputAndValidationContainer} from './InputAndValidationContainer';
import {InputDragger} from './InputDragger';
import {NewCompDuration} from './NewCompDuration';
import {RemotionInput} from './RemInput';
import {ValidationMessage} from './ValidationMessage';

const content: React.CSSProperties = {
	padding: 12,
	paddingRight: 12,
	flex: 1,
	fontSize: 13,
	minWidth: 500,
};

const folderPathStyle: React.CSSProperties = {
	fontSize: 14,
};

const NewCompositionLoaded: React.FC<{
	readonly folderName: string | null;
	readonly parentName: string | null;
	readonly stack: string | null;
}> = ({folderName, parentName, stack}) => {
	const {compositions} = useContext(Internals.CompositionManager);
	const resolvedComposition = Internals.useResolvedVideoConfig(null);
	const initialComposition =
		resolvedComposition?.type === 'success' ||
		resolvedComposition?.type === 'success-and-refreshing'
			? resolvedComposition.result
			: null;
	const initialDimensions = getNewCompositionDefaults(initialComposition);
	const [newId, setName] = useState(() =>
		getUniqueCompositionName(compositions),
	);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const input = inputRef.current;
		if (!input) return;
		input.select();
	}, []);

	const [selectedFrameRate, setFrameRate] = useState(initialDimensions.fps);
	const [size, setSize] = useState(() => ({
		width: initialDimensions.width,
		height: initialDimensions.height,
	}));
	const [durationInFrames, setDurationInFrames] = useState(
		initialDimensions.durationInFrames,
	);

	const onWidthChanged = useCallback((newValue: string) => {
		setSize((s) => {
			return {
				height: s.height,
				width: Number(newValue),
			};
		});
	}, []);

	const onWidthDirectlyChanged = useCallback((newWidth: number) => {
		setSize((s) => {
			return {
				height: s.height,
				width: newWidth,
			};
		});
	}, []);

	const onHeightDirectlyChanged = useCallback((newHeight: number) => {
		setSize((s) => {
			return {
				width: s.width,
				height: newHeight,
			};
		});
	}, []);

	const onHeightChanged = useCallback((newValue: string) => {
		setSize((s) => {
			return {
				width: s.width,
				height: Number(newValue),
			};
		});
	}, []);

	const onNameChange: ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setName(e.target.value);
		},
		[],
	);

	const onTextFpsChange = useCallback((newFps: string) => {
		setFrameRate(Number(newFps));
	}, []);

	const onFpsChange = useCallback((newFps: number) => {
		setFrameRate(newFps);
	}, []);

	const {
		codemod,
		createComposition,
		heightValidationMessage: compHeightErrMessage,
		nameValidationMessage: compNameErrMessage,
		valid,
		widthValidationMessage: compWidthErrMessage,
	} = useCreateComposition({
		compositions,
		durationInFrames,
		folderName,
		newId,
		parentName,
		selectedFrameRate,
		size,
	});

	const onSubmit: React.FormEventHandler<HTMLFormElement> = useCallback((e) => {
		e.preventDefault();
	}, []);

	const folderPath = [parentName, folderName].filter(Boolean).join('/');

	return (
		<>
			<ModalHeader title="New composition" />
			<form onSubmit={onSubmit}>
				<div style={content}>
					{folderPath ? (
						<div style={optionRow}>
							<div style={label}>Folder</div>
							<div style={rightRow}>
								<span style={folderPathStyle}>{folderPath}</span>
							</div>
						</div>
					) : null}
					<div style={optionRow}>
						<div style={label}>ID</div>
						<div style={rightRow}>
							<InputAndValidationContainer>
								<RemotionInput
									ref={inputRef}
									value={newId}
									onChange={onNameChange}
									type="text"
									autoFocus
									placeholder="Composition ID"
									status="ok"
									rightAlign
								/>
								{compNameErrMessage ? (
									<>
										<Spacing y={1} block />
										<ValidationMessage
											align="flex-start"
											message={compNameErrMessage}
											type="error"
										/>
									</>
								) : null}
							</InputAndValidationContainer>
						</div>
					</div>
					<div style={optionRow}>
						<div style={label}>Width</div>
						<div style={rightRow}>
							<InputAndValidationContainer>
								<InputDragger
									type="number"
									value={size.width}
									placeholder="Width"
									onTextChange={onWidthChanged}
									name="width"
									step={2}
									min={2}
									required
									status="ok"
									formatter={(w) => `${w}px`}
									max={100000000}
									onValueChange={onWidthDirectlyChanged}
									rightAlign={false}
								/>
								{compWidthErrMessage ? (
									<>
										<Spacing y={1} block />
										<ValidationMessage
											align="flex-start"
											message={compWidthErrMessage}
											type="error"
										/>
									</>
								) : null}
							</InputAndValidationContainer>
						</div>
					</div>
					<div style={optionRow}>
						<div style={label}>Height</div>
						<div style={rightRow}>
							<InputAndValidationContainer>
								<InputDragger
									type="number"
									value={size.height}
									onTextChange={onHeightChanged}
									placeholder="Height"
									name="height"
									step={2}
									required
									formatter={(h) => `${h}px`}
									min={2}
									status="ok"
									max={100000000}
									onValueChange={onHeightDirectlyChanged}
									rightAlign={false}
								/>
								{compHeightErrMessage ? (
									<>
										<Spacing y={1} block />
										<ValidationMessage
											align="flex-start"
											message={compHeightErrMessage}
											type="error"
										/>
									</>
								) : null}
							</InputAndValidationContainer>
						</div>
					</div>
					<NewCompDuration
						durationInFrames={durationInFrames}
						setDurationInFrames={setDurationInFrames}
					/>
					<div style={optionRow}>
						<div style={label}>FPS</div>
						<div style={rightRow}>
							<InputDragger
								type="number"
								value={selectedFrameRate}
								onTextChange={onTextFpsChange}
								placeholder="Frame rate (fps)"
								name="fps"
								min={1}
								required
								status="ok"
								max={240}
								step={0.01}
								onValueChange={onFpsChange}
								rightAlign={false}
							/>
						</div>
					</div>
				</div>
				<ModalFooterContainer>
					<CodemodFooter
						loadingNotification={null}
						errorNotification="Could not create composition"
						successNotification={`Created ${newId}`}
						genericSubmitLabel="Add to root file"
						submitLabel={({relativeRootPath}) => `Add to ${relativeRootPath}`}
						codemod={codemod}
						stack={stack}
						valid={valid}
						onSuccess={null}
						applyCodemod={({signal, symbolicatedStack}) =>
							createComposition({
								signal,
								symbolicatedStack,
							})
						}
						fallbackToRootFile
					/>
				</ModalFooterContainer>
			</form>
		</>
	);
};

export const NewComposition: React.FC<{
	readonly folderName: string | null;
	readonly parentName: string | null;
	readonly stack: string | null;
}> = ({folderName, parentName, stack}) => {
	return (
		<DismissableModal>
			<NewCompositionLoaded
				folderName={folderName}
				parentName={parentName}
				stack={stack}
			/>
		</DismissableModal>
	);
};
