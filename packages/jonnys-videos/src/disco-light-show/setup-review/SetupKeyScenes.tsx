import {Interactive, staticFile, Track} from 'remotion';
import {SetupScene} from './SetupScene';

const SetupKeyScenesInner = () => (
	<Track name="Setup key scenes">
		<SetupScene
			name="01 Laptop"
			from={0}
			durationInFrames={300}
			src={staticFile('setup-review/short-take-preview.mp4')}
			sourceStartSeconds={31}
			sourceName="SHORT TAKE · IMG_0758 · 07:57"
			stepIndex={0}
			title="Get the laptop out"
			detail="Short take · laptop comes onto the table and opens."
			captions={[]}
		/>
		<SetupScene
			name="02 USB-C adapter"
			from={300}
			durationInFrames={270}
			src={staticFile('setup-review/short-take-preview.mp4')}
			sourceStartSeconds={41}
			sourceName="SHORT TAKE · IMG_0758 · 07:57"
			stepIndex={1}
			title="Attach the USB-C adapter"
			detail="Clear product close-up, then the adapter goes into the laptop."
			captions={[]}
		/>
		<SetupScene
			name="03 ENTTEC introduction"
			from={570}
			durationInFrames={150}
			src={staticFile('setup-review/short-take-preview.mp4')}
			sourceStartSeconds={51}
			sourceName="SHORT TAKE · IMG_0758 · 07:57"
			stepIndex={2}
			title="ENTTEC USB to DMX"
			detail="The interface is shown to camera; its name is spoken."
			captions={[
				{
					text: 'This is the ENTTEC Pro USB.',
					startMs: 51620,
					endMs: 54000,
					timestampMs: 52810,
					confidence: null,
				},
			]}
		/>
		<SetupScene
			name="04 ENTTEC USB connection"
			from={720}
			durationInFrames={480}
			src={staticFile('setup-review/short-take-preview.mp4')}
			sourceStartSeconds={66}
			sourceName="SHORT TAKE · IMG_0758 · 07:57"
			stepIndex={2}
			title="Connect the ENTTEC interface"
			detail="USB-B into the ENTTEC, then USB-A into the laptop adapter."
			captions={[]}
		/>
		<SetupScene
			name="05 3-to-5-pin converter"
			from={1200}
			durationInFrames={390}
			src={staticFile('setup-review/short-take-preview.mp4')}
			sourceStartSeconds={106}
			sourceName="SHORT TAKE · IMG_0758 · 07:57"
			stepIndex={3}
			title="Attach the 3-to-5-pin converter"
			detail="Clear 3-pin / 5-pin adapter close-up, then attachment to the ENTTEC interface."
			captions={[]}
		/>
		<SetupScene
			name="06 DMX cable connectors"
			from={1590}
			durationInFrames={372}
			src={staticFile('setup-review/long-take-preview.mp4')}
			sourceStartSeconds={171.6}
			sourceName="LONG TAKE · 100gb-video · 19:45"
			stepIndex={3}
			title="Join the DMX cable connectors"
			detail="The clean repeat after the explicit “do not use that take” comment."
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
			name="07 First device"
			from={1962}
			durationInFrames={510}
			src={staticFile('setup-review/long-take-preview.mp4')}
			sourceStartSeconds={187}
			sourceName="LONG TAKE · 100gb-video · 19:45"
			stepIndex={4}
			title="Connect the first moving head"
			detail="Close view of the first fixture and its DMX connection."
			captions={[
				{
					text: 'And now this three-point female we can put into one of our equipments.',
					startMs: 185640,
					endMs: 197520,
					timestampMs: 191580,
					confidence: null,
				},
			]}
		/>
		<SetupScene
			name="08 Power the first device"
			from={2472}
			durationInFrames={480}
			src={staticFile('setup-review/long-take-preview.mp4')}
			sourceStartSeconds={205}
			sourceName="LONG TAKE · 100gb-video · 19:45"
			stepIndex={4}
			title="Power the first device"
			detail="Connect mains power and switch the first light on."
			captions={[
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
			name="09 Second moving head"
			from={2952}
			durationInFrames={630}
			src={staticFile('setup-review/long-take-preview.mp4')}
			sourceStartSeconds={252}
			sourceName="LONG TAKE · 100gb-video · 19:45"
			stepIndex={5}
			title="Add the second moving head"
			detail="Remove the one-light terminator and bring in the second moving head."
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
			name="10 Connect second moving head"
			from={3582}
			durationInFrames={750}
			src={staticFile('setup-review/long-take-preview.mp4')}
			sourceStartSeconds={309}
			sourceName="LONG TAKE · 100gb-video · 19:45"
			stepIndex={5}
			title="Connect the second moving head"
			detail="Continue the DMX chain and power the second fixture."
			captions={[]}
		/>
		<SetupScene
			name="11 LED bar"
			from={4332}
			durationInFrames={540}
			src={staticFile('setup-review/long-take-preview.mp4')}
			sourceStartSeconds={350}
			sourceName="LONG TAKE · 100gb-video · 19:45"
			stepIndex={5}
			title="Add the LED bar"
			detail="The long LED bar arrives at the front of the table; cable work continues afterward."
			captions={[]}
		/>
		<SetupScene
			name="12 Connect LED bar"
			from={4872}
			durationInFrames={720}
			src={staticFile('setup-review/long-take-preview.mp4')}
			sourceStartSeconds={438}
			sourceName="LONG TAKE · 100gb-video · 19:45"
			stepIndex={5}
			title="Connect the LED bar"
			detail="Rear-panel cabling is visible here. The bar lights up later during troubleshooting."
			captions={[]}
		/>
		<SetupScene
			name="13 LED panel"
			from={5592}
			durationInFrames={450}
			src={staticFile('setup-review/long-take-preview.mp4')}
			sourceStartSeconds={492}
			sourceName="LONG TAKE · 100gb-video · 19:45"
			stepIndex={5}
			title="Add the LED panel"
			detail="The rectangular panel joins the rig; this is the placement shot."
			captions={[]}
		/>
		<SetupScene
			name="14 Connect LED panel"
			from={6042}
			durationInFrames={480}
			src={staticFile('setup-review/long-take-preview.mp4')}
			sourceStartSeconds={528}
			sourceName="LONG TAKE · 100gb-video · 19:45"
			stepIndex={5}
			title="Connect the LED panel"
			detail="Hands connect the rear panel; there is more cable rework later."
			captions={[]}
		/>
		<SetupScene
			name="15 Laser fixture"
			from={6522}
			durationInFrames={930}
			src={staticFile('setup-review/long-take-preview.mp4')}
			sourceStartSeconds={575}
			sourceName="LONG TAKE · 100gb-video · 19:45"
			stepIndex={5}
			title="Add the laser fixture"
			detail="The fixture with the yellow label joins the other lights."
			captions={[]}
		/>
		<SetupScene
			name="16 Terminator example"
			from={7452}
			durationInFrames={486}
			src={staticFile('setup-review/long-take-preview.mp4')}
			sourceStartSeconds={224.8}
			sourceName="LONG TAKE · 100gb-video · 19:45"
			stepIndex={6}
			title="Add a DMX terminator — clear example"
			detail="ONE-LIGHT DEMO · recorded earlier, before the chain expands. See the following IMG_0774 close-up for the installed state."
			captions={[
				{
					text: "And then finally I'm adding the DMX terminator to it.",
					startMs: 224880,
					endMs: 233800,
					timestampMs: 229340,
					confidence: null,
				},
			]}
		/>
		<SetupScene
			name="17 Installed terminator close-up"
			from={7938}
			durationInFrames={189}
			src={staticFile('setup-review/closeups/IMG_0774-preview.mp4')}
			sourceStartSeconds={0}
			sourceName="CLOSE-UP · IMG_0774"
			stepIndex={6}
			title="Terminator installed on the LED bar"
			detail="Capped plug in DMX OUT beside the incoming cable. This shows the installed state, not the insertion."
			captions={[]}
		/>
		<SetupScene
			name="18 Running rig"
			from={8127}
			durationInFrames={390}
			src={staticFile('setup-review/long-take-preview.mp4')}
			sourceStartSeconds={1172}
			sourceName="LONG TAKE · 100gb-video · 19:45"
			stepIndex={5}
			title="The assembled rig"
			detail="Final wide view of the rig. See IMG_0774 for a separate close-up of the installed terminator."
			captions={[]}
		/>
	</Track>
);

export const SetupKeyScenes = Interactive.create({
	Component: SetupKeyScenesInner,
	layout: 'absolute-fill',
});
