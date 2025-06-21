import type {VolumeProp} from '../volume-prop.js';
import type {LoopVolumeCurveBehavior} from './use-audio-frame.js';

export type RemotionMainAudioProps = {
	/**
	 * @deprecated Use `trimLeft` instead
	 */
	startFrom?: number;
	/**
	 * @deprecated Use `trimRight` instead
	 */
	endAt?: number;
	/**
	 * Trim the audio from the left (start). Replaces the deprecated `startFrom` prop.
	 */
	trimLeft?: number;
	/**
	 * Trim the audio from the right (end). Replaces the deprecated `endAt` prop.
	 */
	trimRight?: number;
};

export type NativeAudioProps = Omit<
	React.DetailedHTMLProps<
		React.AudioHTMLAttributes<HTMLAudioElement>,
		HTMLAudioElement
	>,
	'autoPlay' | 'controls' | 'onEnded' | 'nonce' | 'onResize' | 'onResizeCapture'
>;

export type RemotionAudioProps = NativeAudioProps & {
	name?: string;
	volume?: VolumeProp;
	playbackRate?: number;
	acceptableTimeShiftInSeconds?: number;
	/**
	 * @deprecated Amplification is now always enabled. To prevent amplification, set `volume` to a value less than 1.
	 */
	allowAmplificationDuringRender?: boolean;
	_remotionInternalNeedsDurationCalculation?: boolean;
	_remotionInternalNativeLoopPassed?: boolean;
	toneFrequency?: number;
	useWebAudioApi?: boolean;
	pauseWhenBuffering?: boolean;
	showInTimeline?: boolean;
	delayRenderTimeoutInMilliseconds?: number;
	delayRenderRetries?: number;
	loopVolumeCurveBehavior?: LoopVolumeCurveBehavior;
};

type IsNever<T> = [T] extends [never] ? true : false;

export type IsExact<T, U> =
	(<G>() => G extends T ? 1 : 2) extends <G>() => G extends U ? 1 : 2
		? IsNever<Exclude<keyof T, keyof U>> extends true
			? IsNever<Exclude<keyof U, keyof T>> extends true
				? true
				: false
			: false
		: false;
