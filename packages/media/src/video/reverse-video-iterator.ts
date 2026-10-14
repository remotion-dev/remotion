import type {CanvasSink, EncodedPacketSink, WrappedCanvas} from 'mediabunny';
import {makeStableFramePool, releaseStableFrame} from '../canvas-ahead-of-time';
import {roundTo4Digits} from '../helpers/round-to-4-digits';

// Timestamps are compared with millisecond precision, see roundTo4Digits()
const TIMESTAMP_TOLERANCE = 0.001;

const getBytes = (frame: WrappedCanvas) =>
	frame.canvas.width * frame.canvas.height * 4;

// Video can only be decoded forwards. While playing backwards, decode from the
// keyframe once and keep the frames, instead of decoding from the keyframe
// again for every frame. The frames before the kept ones are decoded ahead of
// time.
export const createReverseVideoIterator = ({
	canvasSink,
	packetSink,
	maxBytesPerRange,
}: {
	canvasSink: CanvasSink;
	packetSink: EncodedPacketSink;
	maxBytesPerRange: number;
}) => {
	const stableFramePool = makeStableFramePool();
	let destroyed = false;
	// Sorted by timestamp, complete up to framesEnd
	let frames: WrappedCanvas[] = [];
	let framesEnd = 0;
	let prefetch: {frames: Promise<WrappedCanvas[]>; end: number} | null = null;
	// Nothing comes before the kept frames
	let reachedStart = false;

	const decodeRange = async (
		timeInRange: number,
		endTimestamp: number,
	): Promise<WrappedCanvas[]> => {
		const keyPacket = await packetSink.getKeyPacket(timeInRange, {
			verifyKeyPackets: true,
		});
		const decoded: WrappedCanvas[] = [];
		let bytes = 0;
		for await (const canvas of canvasSink.canvases(
			keyPacket?.timestamp,
			endTimestamp,
		)) {
			if (destroyed) {
				break;
			}

			const frame = stableFramePool.makeStableFrame(canvas);
			decoded.push(frame);
			bytes += getBytes(frame);
			// The latest frames are shown first. If the range does not fit, the
			// earlier frames get decoded again once playback reaches them.
			while (bytes > maxBytesPerRange && decoded.length > 1) {
				const dropped = decoded.shift()!;
				bytes -= getBytes(dropped);
				releaseStableFrame(dropped);
			}

			// Mediabunny keeps decoding until a frame past the end comes out.
			// Stop as soon as the frame showing at the end has arrived.
			if (
				roundTo4Digits(frame.timestamp + frame.duration) >=
				roundTo4Digits(endTimestamp)
			) {
				break;
			}
		}

		return decoded;
	};

	const getFrame = (time: number): WrappedCanvas | null => {
		const timestamp = roundTo4Digits(time);
		if (timestamp >= roundTo4Digits(framesEnd)) {
			return null;
		}

		// Before the first frame, keep showing it like forward playback does
		const frame =
			frames.findLast(
				(candidate) => roundTo4Digits(candidate.timestamp) <= timestamp,
			) ?? (reachedStart ? frames[0] : undefined);
		if (!frame) {
			return null;
		}

		if (!prefetch && !destroyed) {
			const start = frames[0].timestamp;
			prefetch = {
				frames: decodeRange(start - TIMESTAMP_TOLERANCE, start),
				end: start,
			};
			// Errors surface once playback reaches the prefetched range.
			prefetch.frames.catch(() => undefined);
		}

		return frame;
	};

	const replaceFrames = (newFrames: WrappedCanvas[]) => {
		frames.forEach(releaseStableFrame);
		frames = newFrames;
	};

	const waitForFrame = async (time: number): Promise<WrappedCanvas | null> => {
		if (prefetch) {
			const prefetched = prefetch;
			prefetch = null;
			const earlierFrames = await prefetched.frames;
			if (earlierFrames.length === 0) {
				reachedStart = true;
			} else {
				replaceFrames(earlierFrames);
				framesEnd = prefetched.end;
			}

			const frame = getFrame(time);
			if (frame) {
				return frame;
			}
		}

		const end = time + TIMESTAMP_TOLERANCE;
		replaceFrames(await decodeRange(time, end));
		framesEnd = end;
		reachedStart = false;
		return getFrame(time);
	};

	const releaseFrames = () => {
		frames = [];
		prefetch = null;
	};

	const destroy = () => {
		destroyed = true;
	};

	return {getFrame, waitForFrame, releaseFrames, destroy};
};

export type ReverseVideoIterator = ReturnType<
	typeof createReverseVideoIterator
>;
