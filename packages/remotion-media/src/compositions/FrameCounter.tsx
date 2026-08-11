import {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

/*

the timecode hh:mm:ss:ff is common in video editors, where ff is frames.
how does this work when the fps is 29.97

## How 29.97 fps timecode works (drop-frame vs non-drop-frame)

In video, a timecode like hh:mm:ss:ff expresses hours, minutes, seconds, and frames. At an integer frame rate (e.g., 24, 25, 30 fps), each second has exactly that many frames, so timecode matches real clock time.

With NTSC color video, the actual frame rate is approximately 29.97 fps, i.e. precisely 30/1.001 ≈ 29.97002997… fps. If you count frames as if it were exactly 30 fps, your timecode will drift ahead of real time by about 3.6 seconds per hour.

To solve this, the industry uses two schemes:

-  Non-drop-frame (NDF): Count every frame sequentially as if it were 30 fps. Simple, but the timecode does not match real-time clock. It runs fast by ~3.6 s/hour.
-  Drop-frame (DF): Adjust the numbering to keep timecode aligned with real time. No video frames are actually removed; only some timecode numbers are skipped.

### Drop-frame timecode rules (for 29.97 fps)

-  The timecode numbering skips frame numbers at the start of most minutes to correct the 0.1% rate difference.
-  Specifically, you skip frame numbers 00 and 01 at the start of every minute, except every 10th minute.
-  In other words, in DF mode you do not use:
    - mm:00:00 and mm:00:01 at the start of minutes where mm ∈ {01, 02, 03, 04, 06, 07, 08, 09} (and similarly for 11–19, 21–29, …, 51–59).
    - You do use all frame numbers at minutes 00, 10, 20, 30, 40, 50.
-  This drops 2 timecode numbers per minute × 9 minutes every 10-minute block = 18 numbers per 10 minutes.
-  Over one hour, that totals 108 timecode numbers skipped. At nominal 30 fps numbering, that’s 108/30 = 3.6 seconds worth of numbering, which cancels the 29.97 vs 30 drift. Thus DF timecode stays aligned to wall-clock time.

### Practical implications

-  FF range: At 29.97, editors still display frames 00–29 per second in both DF and NDF modes; the difference is only which frame numbers exist at specific minute boundaries in DF.
-  Display: DF timecode is usually marked with a semicolon or period before frames, e.g. hh:mm:ss;ff (or hh:mm:ss.ff). NDF typically uses a colon hh:mm:ss:ff.
-  Broadcast/delivery: Use drop-frame for North American NTSC-derived systems (59.94i/29.97p/23.976p with 29.97-based timelines) if you need timecode to match real time (e.g., schedules, captions, broadcast logs).
-  Creative/post: Non-drop-frame may be fine within post workflows if absolute clock matching isn’t required, but be aware of the drift.

### Quick examples

-  In DF, after 00:00:59:29 comes 00:01:00:02 (00 and 01 are skipped).
-  At 00:10:59:29, the next is 00:11:00:00 (no skip at the 10th minute).
-  At exactly 01:00:00;00 DF timecode, the real elapsed wall time is exactly one hour; in NDF 01:00:00:00, real time is about 59:56.4.


*/

export const FrameCounter = () => {
	const frame = useCurrentFrame();
	const {fps: fractionalFps} = useVideoConfig();
	const fps = Math.round(fractionalFps);

	const timestamp = useMemo(() => {
		const minutes = Math.floor(frame / (60 * fps));
		const seconds = Math.floor((frame % (60 * fps)) / fps);
		const frames = frame % fps;
		return `${minutes.toString().padStart(2, '0')}:${seconds
			.toString()
			.padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
	}, [frame, fps]);

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				fontSize: 200,
				fontWeight: '600',
				color: 'white',
				fontFamily: 'GT Planar',
				fontFeatureSettings: "'ss03' on",
				fontVariantNumeric: 'tabular-nums',
				padding: 100,
			}}
		>
			<div
				style={{
					backgroundColor: 'rgba(0, 0, 0, 0.7)',
					paddingLeft: 40,
					paddingRight: 40,
					paddingTop: 30,
					paddingBottom: 30,
					display: 'flex',
					flexDirection: 'column',
					width: 1600,
				}}
			>
				<div style={{fontSize: 400}}>{frame}</div>
				<div>{timestamp}</div>
			</div>
		</AbsoluteFill>
	);
};
