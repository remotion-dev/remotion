import {Interactive, staticFile, Track} from 'remotion';
import {SetupScene} from './SetupScene';

const SetupShortTakeInner = () => (
	<Track name="Setup chapters">
		<SetupScene
			name="01 · Prepare power"
			from={0}
			durationInFrames={930}
			src={staticFile('setup-review/short-take-preview.mp4')}
			sourceStartSeconds={0}
			sourceName="SHORT TAKE · IMG_0758 · 07:57"
			stepIndex={0}
			title="Prepare power"
			detail="Power strip and laptop charger before the laptop enters."
			captions={[]}
		/>
		<SetupScene
			name="02 · Get the laptop out"
			from={930}
			durationInFrames={300}
			src={staticFile('setup-review/short-take-preview.mp4')}
			sourceStartSeconds={31}
			sourceName="SHORT TAKE · IMG_0758 · 07:57"
			stepIndex={0}
			title="Get the laptop out"
			detail="Laptop placement and opening."
			captions={[]}
		/>
		<SetupScene
			name="03 · Attach the USB-C adapter"
			from={1230}
			durationInFrames={300}
			src={staticFile('setup-review/short-take-preview.mp4')}
			sourceStartSeconds={41}
			sourceName="SHORT TAKE · IMG_0758 · 07:57"
			stepIndex={1}
			title="Attach the USB-C adapter"
			detail="Clear close-up followed by attachment."
			captions={[]}
		/>
		<SetupScene
			name="04 · ENTTEC and USB cable"
			from={1530}
			durationInFrames={930}
			src={staticFile('setup-review/short-take-preview.mp4')}
			sourceStartSeconds={51}
			sourceName="SHORT TAKE · IMG_0758 · 07:57"
			stepIndex={2}
			title="ENTTEC and USB cable"
			detail="Interface introduction and USB connections."
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
			name="05 · Bring in the first device"
			from={2460}
			durationInFrames={720}
			src={staticFile('setup-review/short-take-preview.mp4')}
			sourceStartSeconds={82}
			sourceName="SHORT TAKE · IMG_0758 · 07:57"
			stepIndex={4}
			title="Bring in the first device"
			detail="First moving head and cable preparation."
			captions={[]}
		/>
		<SetupScene
			name="06 · 3-to-5-pin converter"
			from={3180}
			durationInFrames={420}
			src={staticFile('setup-review/short-take-preview.mp4')}
			sourceStartSeconds={106}
			sourceName="SHORT TAKE · IMG_0758 · 07:57"
			stepIndex={3}
			title="3-to-5-pin converter"
			detail="Clear adapter close-up and connection to the ENTTEC."
			captions={[]}
		/>
		<SetupScene
			name="07 · Prepare the first device"
			from={3600}
			durationInFrames={1350}
			src={staticFile('setup-review/short-take-preview.mp4')}
			sourceStartSeconds={120}
			sourceName="SHORT TAKE · IMG_0758 · 07:57"
			stepIndex={4}
			title="Prepare the first device"
			detail="Cable preparation and a pause before connecting the fixture."
			captions={[]}
		/>
		<SetupScene
			name="08 · Wire and power the first device"
			from={4950}
			durationInFrames={3480}
			src={staticFile('setup-review/short-take-preview.mp4')}
			sourceStartSeconds={165}
			sourceName="SHORT TAKE · IMG_0758 · 07:57"
			stepIndex={4}
			title="Wire and power the first device"
			detail="Continued cable work around the fixture. Mains connection around 3:57–4:05."
			captions={[]}
		/>
		<SetupScene
			name="09 · Configure on the laptop"
			from={8430}
			durationInFrames={2970}
			src={staticFile('setup-review/short-take-preview.mp4')}
			sourceStartSeconds={281}
			sourceName="SHORT TAKE · IMG_0758 · 07:57"
			stepIndex={4}
			title="Configure on the laptop"
			detail="Software and setup adjustments; no additional fixtures."
			captions={[]}
		/>
		<SetupScene
			name="10 · Check the first device"
			from={11400}
			durationInFrames={1200}
			src={staticFile('setup-review/short-take-preview.mp4')}
			sourceStartSeconds={380}
			sourceName="SHORT TAKE · IMG_0758 · 07:57"
			stepIndex={4}
			title="Check the first device"
			detail="Fixture adjustments and response."
			captions={[]}
		/>
		<SetupScene
			name="11 · First-light result"
			from={12600}
			durationInFrames={1710}
			src={staticFile('setup-review/short-take-preview.mp4')}
			sourceStartSeconds={420}
			sourceName="SHORT TAKE · IMG_0758 · 07:57"
			stepIndex={4}
			title="First-light result"
			detail="The single light moves and illuminates."
			captions={[]}
		/>
	</Track>
);

export const SetupShortTake = Interactive.create({
	Component: SetupShortTakeInner,
	layout: 'absolute-fill',
});
