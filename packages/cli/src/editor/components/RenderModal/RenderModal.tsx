import type {StillImageFormat} from '@remotion/renderer';
import type {ChangeEventHandler} from 'react';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useReducer,
	useRef,
	useState,
} from 'react';
import type {TCompMetadata} from 'remotion';
import {getDefaultOutLocation} from '../../../get-default-out-name';
import {Button} from '../../../preview-server/error-overlay/remotion-overlay/Button';
import {LIGHT_TEXT} from '../../helpers/colors';
import {useFileExistence} from '../../helpers/use-file-existence';
import {ModalsContext} from '../../state/modals';
import {Spacing} from '../layout';
import {ModalContainer} from '../ModalContainer';
import {NewCompHeader} from '../ModalHeader';
import {InputDragger} from '../NewComposition/InputDragger';
import {RemotionInput} from '../NewComposition/RemInput';
import {ValidationMessage} from '../NewComposition/ValidationMessage';
import {addStillRenderJob} from '../RenderQueue/actions';
import type {SegmentedControlItem} from '../SegmentedControl';
import {SegmentedControl} from '../SegmentedControl';
import {leftSidebarTabs} from '../SidebarContent';

type State =
	| {
			type: 'idle';
	  }
	| {
			type: 'success';
	  }
	| {
			type: 'load';
	  }
	| {
			type: 'error';
	  };

const initialState: State = {type: 'idle'};

type Action =
	| {
			type: 'start';
	  }
	| {
			type: 'succeed';
	  }
	| {
			type: 'fail';
	  };

const reducer = (state: State, action: Action): State => {
	if (action.type === 'start') {
		return {
			type: 'load',
		};
	}

	if (action.type === 'fail') {
		return {
			type: 'error',
		};
	}

	if (action.type === 'succeed') {
		return {
			type: 'success',
		};
	}

	return state;
};

const container: React.CSSProperties = {};

const optionRow: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'flex-start',
	minHeight: 40,
	paddingLeft: 16,
	paddingRight: 16,
};

const label: React.CSSProperties = {
	width: 150,
	fontSize: 14,
	lineHeight: '40px',
	color: LIGHT_TEXT,
};

const rightRow: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'flex-end',
	alignSelf: 'center',
	flex: 1,
};

const buttonRow: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'flex-end',
	borderTop: '1px solid black',
	paddingTop: 8,
	paddingBottom: 8,
	paddingLeft: 16,
	paddingRight: 16,
};

const input: React.CSSProperties = {
	minWidth: 250,
};

const MIN_QUALITY = 1;
const MAX_QUALITY = 100;

const MIN_SCALE = 0.1;
const MAX_SCALE = 10;

export const RenderModal: React.FC<{composition: TCompMetadata}> = ({
	composition,
}) => {
	const {setSelectedModal} = useContext(ModalsContext);

	const onQuit = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);

	const isMounted = useRef(true);

	const [state, dispatch] = useReducer(reducer, initialState);

	const [imageFormat, setImageFormat] = useState<StillImageFormat>('png');
	const [quality, setQuality] = useState(80);
	const [scale, setScale] = useState(1);
	const [outName, setOutName] = useState(() =>
		getDefaultOutLocation({
			compositionName: composition.id,
			defaultExtension: imageFormat,
		})
	);

	const dispatchIfMounted: typeof dispatch = useCallback((payload) => {
		if (isMounted.current === false) return;
		dispatch(payload);
	}, []);

	const onValueChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setOutName(e.target.value);
		},
		[]
	);

	const setPng = useCallback(() => {
		setImageFormat('png');
		setOutName((prev) => {
			if (prev.endsWith('.jpeg') || prev.endsWith('.jpg')) {
				return prev.replace(/.jpe?g$/g, '.png');
			}

			return prev;
		});
	}, []);

	const setJpeg = useCallback(() => {
		setImageFormat('jpeg');
		setOutName((prev) => {
			if (prev.endsWith('.png')) {
				return prev.replace(/.png$/g, '.jpeg');
			}

			return prev;
		});
	}, []);

	const onClick = useCallback(() => {
		leftSidebarTabs.current?.selectRendersPanel();
		addStillRenderJob({
			composition,
			outName,
			imageFormat,
			quality: imageFormat === 'jpeg' ? quality : null,
			// TODO: Support still rendering for compositions
			frame: 0,
			scale,
		})
			.then(() => {
				dispatchIfMounted({type: 'succeed'});
				setSelectedModal(null);
			})
			.catch(() => {
				dispatchIfMounted({type: 'fail'});
			});
	}, [
		composition,
		dispatchIfMounted,
		imageFormat,
		outName,
		quality,
		scale,
		setSelectedModal,
	]);

	const onQualityChangedDirectly = useCallback((newQuality: number) => {
		setQuality(newQuality);
	}, []);

	const onQualityChanged: ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setQuality((q) => {
				const newQuality = parseInt(e.target.value, 10);
				if (Number.isNaN(newQuality)) {
					return q;
				}

				const newQualityClamped = Math.min(
					MAX_QUALITY,
					Math.max(newQuality, MIN_QUALITY)
				);
				return newQualityClamped;
			});
		},
		[]
	);

	const onScaleSetDirectly = useCallback((newScale: number) => {
		setScale(newScale);
	}, []);

	const onScaleChanged: ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setScale((q) => {
				const newQuality = parseFloat(e.target.value);
				if (Number.isNaN(newQuality)) {
					return q;
				}

				const newScaleClamped = Math.min(
					MAX_SCALE,
					Math.max(newQuality, MIN_SCALE)
				);
				return newScaleClamped;
			});
		},
		[]
	);

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	const existence = useFileExistence(outName);

	const imageFormatOptions = useMemo((): SegmentedControlItem[] => {
		return [
			{
				label: 'PNG',
				onClick: setPng,
				key: 'png',
				selected: imageFormat === 'png',
			},
			{
				label: 'JPEG',
				onClick: setJpeg,
				key: 'jpeg',
				selected: imageFormat === 'jpeg',
			},
		];
	}, [imageFormat, setJpeg, setPng]);

	return (
		<ModalContainer onOutsideClick={onQuit} onEscape={onQuit}>
			<NewCompHeader title={`Render ${composition.id}`} />
			<div style={container}>
				<Spacing block y={0.5} />
				<div style={optionRow}>
					<div style={label}>Format</div>
					<div style={rightRow}>
						<SegmentedControl items={imageFormatOptions} />
					</div>
				</div>
				<div style={optionRow}>
					<div style={label}>Output name</div>
					<div style={rightRow}>
						<div>
							<RemotionInput
								// TODO: Validate and reject folders or weird file names
								warning={existence}
								style={input}
								type="text"
								value={outName}
								onChange={onValueChange}
							/>
							{existence ? (
								<ValidationMessage message="Will be overwritten" />
							) : null}
						</div>
					</div>
				</div>
				<div style={optionRow}>
					<div style={label}>Scale</div>
					<div style={rightRow}>
						<InputDragger
							value={scale}
							onChange={onScaleChanged}
							placeholder="0.1-10"
							// TODO: Does not allow non-integer steps
							// TODO: Cannot click and type in 0.2
							onValueChange={onScaleSetDirectly}
							name="scale"
							step={0.05}
							min={MIN_SCALE}
							max={MAX_SCALE}
						/>
					</div>
				</div>
				{imageFormat === 'jpeg' && (
					<div style={optionRow}>
						<div style={label}>Quality</div>
						<div style={rightRow}>
							<InputDragger
								value={quality}
								onChange={onQualityChanged}
								placeholder="0-100"
								onValueChange={onQualityChangedDirectly}
								name="quality"
								step={1}
								min={MIN_QUALITY}
								max={MAX_QUALITY}
							/>
						</div>
					</div>
				)}

				<Spacing block y={0.5} />
				<div style={buttonRow}>
					<Button onClick={onClick} disabled={state.type === 'load'}>
						{state.type === 'idle' ? 'Render' : 'Rendering...'}
					</Button>
				</div>
			</div>
		</ModalContainer>
	);
};
