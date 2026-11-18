import {Interactive, staticFile, Track} from 'remotion';
import {SetupScene} from './SetupScene';

const SetupLongTakeInner = () => (
	<Track name="Setup chapters">
		<SetupScene
			name="01 · Laptop and power"
			from={0}
			durationInFrames={1500}
			src={staticFile('setup-review/long-take-preview.mp4')}
			sourceStartSeconds={0}
			sourceName="LONG TAKE · 100gb-video · 19:45"
			stepIndex={0}
			title="Laptop and power"
			detail="The laptop is already open when this take starts."
			captions={[
				{
					text: 'Okay, I am commenting it a bit just so it will be easier to cut later.',
					startMs: 16060,
					endMs: 22040,
					timestampMs: 19050,
					confidence: null,
				},
				{
					text: 'I just use a regular laptop and it is a good idea to plug it in. Turn on the power switch.',
					startMs: 22200,
					endMs: 38100,
					timestampMs: 30150,
					confidence: null,
				},
				{
					text: 'Now I am adding power to the laptop.',
					startMs: 43420,
					endMs: 47720,
					timestampMs: 45570,
					confidence: null,
				},
			]}
		/>
		<SetupScene
			name="02 · USB-C adapter and USB cable"
			from={1500}
			durationInFrames={1020}
			src={staticFile('setup-review/long-take-preview.mp4')}
			sourceStartSeconds={50}
			sourceName="LONG TAKE · 100gb-video · 19:45"
			stepIndex={1}
			title="USB-C adapter and USB cable"
			detail="Adapter demonstration, then the USB cable."
			captions={[
				{
					text: "Now we need one of these. It's a USB-C to USB-A dongle.",
					startMs: 54160,
					endMs: 61540,
					timestampMs: 57850,
					confidence: null,
				},
				{
					text: 'And in the USB-A, we then connect to USB-B.',
					startMs: 63100,
					endMs: 77500,
					timestampMs: 70300,
					confidence: null,
				},
			]}
		/>
		<SetupScene
			name="03 · ENTTEC USB to DMX"
			from={2520}
			durationInFrames={870}
			src={staticFile('setup-review/long-take-preview.mp4')}
			sourceStartSeconds={84}
			sourceName="LONG TAKE · 100gb-video · 19:45"
			stepIndex={2}
			title="ENTTEC USB to DMX"
			detail="Interface demonstration and first connection attempt."
			captions={[
				{
					text: 'Because we need it for this, the ENTTEC DMX USB Pro.',
					startMs: 89200,
					endMs: 98800,
					timestampMs: 94000,
					confidence: null,
				},
			]}
		/>
		<SetupScene
			name="04 · Retake note: wrong order"
			from={3390}
			durationInFrames={390}
			src={staticFile('setup-review/long-take-preview.mp4')}
			sourceStartSeconds={113}
			sourceName="LONG TAKE · 100gb-video · 19:45"
			stepIndex={2}
			title="Retake note: wrong order"
			detail="Spoken instruction: omit the previous attempt in the edit."
			captions={[
				{
					text: 'Actually, I did it in the wrong order, so in the edit we should not show the previous scene.',
					startMs: 113520,
					endMs: 121500,
					timestampMs: 117510,
					confidence: null,
				},
			]}
		/>
		<SetupScene
			name="05 · 3-to-5-pin converter"
			from={3780}
			durationInFrames={750}
			src={staticFile('setup-review/long-take-preview.mp4')}
			sourceStartSeconds={126}
			sourceName="LONG TAKE · 100gb-video · 19:45"
			stepIndex={3}
			title="3-to-5-pin converter"
			detail="Converter demonstration; a retry is announced around 2:22."
			captions={[
				{
					text: 'Now we need this, a three-to-five-pin adapter.',
					startMs: 126600,
					endMs: 135000,
					timestampMs: 130800,
					confidence: null,
				},
				{
					text: "Let me try to show it again, because I wasn't doing it very smoothly.",
					startMs: 141920,
					endMs: 150000,
					timestampMs: 145960,
					confidence: null,
				},
			]}
		/>
		<SetupScene
			name="06 · Connector attempt — skip"
			from={4530}
			durationInFrames={618}
			src={staticFile('setup-review/long-take-preview.mp4')}
			sourceStartSeconds={151}
			sourceName="LONG TAKE · 100gb-video · 19:45"
			stepIndex={3}
			title="Connector attempt — skip"
			detail="A second take is requested at 2:47."
			captions={[
				{
					text: "Now for the next step, I'm going to connect a three-point connector to each other.",
					startMs: 153740,
					endMs: 164500,
					timestampMs: 159120,
					confidence: null,
				},
				{
					text: "Let's not use that take, I'm going to show it again.",
					startMs: 166680,
					endMs: 169000,
					timestampMs: 167840,
					confidence: null,
				},
			]}
		/>
		<SetupScene
			name="07 · Clean connector demonstration"
			from={5148}
			durationInFrames={402}
			src={staticFile('setup-review/long-take-preview.mp4')}
			sourceStartSeconds={171.6}
			sourceName="LONG TAKE · 100gb-video · 19:45"
			stepIndex={3}
			title="Clean connector demonstration"
			detail="Female and male three-pin connectors are shown and joined."
			captions={[
				{
					text: 'Here is a three-point female connector as well as a three-point male connector. Put it together.',
					startMs: 171640,
					endMs: 181500,
					timestampMs: 176570,
					confidence: null,
				},
			]}
		/>
		<SetupScene
			name="08 · First device and power"
			from={5550}
			durationInFrames={1194}
			src={staticFile('setup-review/long-take-preview.mp4')}
			sourceStartSeconds={185}
			sourceName="LONG TAKE · 100gb-video · 19:45"
			stepIndex={4}
			title="First device and power"
			detail="Connect the first moving head, then power it."
			captions={[
				{
					text: 'And now this three-point female we can put into one of our equipments.',
					startMs: 185640,
					endMs: 197520,
					timestampMs: 191580,
					confidence: null,
				},
				{
					text: 'You also need to power that equipment.',
					startMs: 206560,
					endMs: 209280,
					timestampMs: 207920,
					confidence: null,
				},
				{
					text: 'Turn that on.',
					startMs: 217440,
					endMs: 219000,
					timestampMs: 218220,
					confidence: null,
				},
			]}
		/>
		<SetupScene
			name="09 · Terminator: one-light example"
			from={6744}
			durationInFrames={867}
			src={staticFile('setup-review/long-take-preview.mp4')}
			sourceStartSeconds={224.8}
			sourceName="LONG TAKE · 100gb-video · 19:45"
			stepIndex={6}
			title="Terminator: one-light example"
			detail="Clear demonstration. The chain has only one fixture here."
			captions={[
				{
					text: "And then finally I'm adding the DMX terminator to it.",
					startMs: 224880,
					endMs: 233800,
					timestampMs: 229340,
					confidence: null,
				},
				{
					text: 'And here we go.',
					startMs: 244440,
					endMs: 246000,
					timestampMs: 245220,
					confidence: null,
				},
			]}
		/>
		<SetupScene
			name="10 · Second moving head"
			from={7611}
			durationInFrames={2889}
			src={staticFile('setup-review/long-take-preview.mp4')}
			sourceStartSeconds={253.7}
			sourceName="LONG TAKE · 100gb-video · 19:45"
			stepIndex={5}
			title="Second moving head"
			detail="Remove the terminator to extend the chain."
			captions={[
				{
					text: 'Now if I want to connect a second light...',
					startMs: 253720,
					endMs: 257720,
					timestampMs: 255720,
					confidence: null,
				},
				{
					text: 'I remove the DMX terminator. I move it out.',
					startMs: 261820,
					endMs: 267960,
					timestampMs: 264890,
					confidence: null,
				},
			]}
		/>
		<SetupScene
			name="11 · LED bar and daisy chaining"
			from={10500}
			durationInFrames={4140}
			src={staticFile('setup-review/long-take-preview.mp4')}
			sourceStartSeconds={350}
			sourceName="LONG TAKE · 100gb-video · 19:45"
			stepIndex={5}
			title="LED bar and daisy chaining"
			detail="At 6:56 the narration suggests speeding up this work."
			captions={[
				{
					text: 'Right now I am in the stage of daisy chaining everything together.',
					startMs: 416500,
					endMs: 421480,
					timestampMs: 418990,
					confidence: null,
				},
				{
					text: 'I think this should be sped up in the final video because it will take a while.',
					startMs: 421660,
					endMs: 434920,
					timestampMs: 428290,
					confidence: null,
				},
			]}
		/>
		<SetupScene
			name="12 · LED panel"
			from={14640}
			durationInFrames={2610}
			src={staticFile('setup-review/long-take-preview.mp4')}
			sourceStartSeconds={488}
			sourceName="LONG TAKE · 100gb-video · 19:45"
			stepIndex={5}
			title="LED panel"
			detail="Panel placement and cabling."
			captions={[]}
		/>
		<SetupScene
			name="13 · Laser fixture"
			from={17250}
			durationInFrames={2850}
			src={staticFile('setup-review/long-take-preview.mp4')}
			sourceStartSeconds={575}
			sourceName="LONG TAKE · 100gb-video · 19:45"
			stepIndex={5}
			title="Laser fixture"
			detail="Yellow-label fixture joins the rig; cabling continues."
			captions={[]}
		/>
		<SetupScene
			name="14 · Rewire and organize the chain"
			from={20100}
			durationInFrames={8400}
			src={staticFile('setup-review/long-take-preview.mp4')}
			sourceStartSeconds={670}
			sourceName="LONG TAKE · 100gb-video · 19:45"
			stepIndex={5}
			title="Rewire and organize the chain"
			detail="Repeated cable work. Treat as setup coverage, not a clean single insertion."
			captions={[]}
		/>
		<SetupScene
			name="15 · Test and finish cabling"
			from={28500}
			durationInFrames={6660}
			src={staticFile('setup-review/long-take-preview.mp4')}
			sourceStartSeconds={950}
			sourceName="LONG TAKE · 100gb-video · 19:45"
			stepIndex={5}
			title="Test and finish cabling"
			detail="The LED bar lights up; later narration says connections are still being sorted."
			captions={[
				{
					text: "I'm still figuring out what is connected to what.",
					startMs: 1041000,
					endMs: 1046200,
					timestampMs: 1043600,
					confidence: null,
				},
			]}
		/>
		<SetupScene
			name="16 · Assembled rig"
			from={35160}
			durationInFrames={392}
			src={staticFile('setup-review/long-take-preview.mp4')}
			sourceStartSeconds={1172}
			sourceName="LONG TAKE · 100gb-video · 19:45"
			stepIndex={5}
			title="Assembled rig"
			detail="Final wide view. Final terminator location remains unconfirmed."
			captions={[]}
		/>
	</Track>
);

export const SetupLongTake = Interactive.create({
	Component: SetupLongTakeInner,
	layout: 'absolute-fill',
});
