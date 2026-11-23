import {Interactive, staticFile, Track} from 'remotion';
import {CloseupShot} from './CloseupShot';

const SetupCloseupsInner = () => (
	<Track name="Close-ups from the other recordings">
		<CloseupShot
			name="01 ENTTEC USB-B connection"
			from={0}
			durationInFrames={240}
			src={staticFile('setup-review/closeups/IMG_0765-preview.mp4')}
			sourceStartSeconds={130}
			sourceName="IMG_0765"
			title="ENTTEC USB-B connection"
			detail="Held toward the camera: USB-B socket and cable plug, then connection."
			category="USB TO DMX"
		/>
		<CloseupShot
			name="02 3-to-5-pin converter"
			from={240}
			durationInFrames={180}
			src={staticFile('setup-review/closeups/IMG_0765-preview.mp4')}
			sourceStartSeconds={147}
			sourceName="IMG_0765"
			title="3-to-5-pin converter"
			detail="Both connector ends face the camera. Useful insert for the adapter explanation."
			category="ADAPTER"
		/>
		<CloseupShot
			name="03 Join the DMX connectors"
			from={420}
			durationInFrames={240}
			src={staticFile('setup-review/closeups/IMG_0765-preview.mp4')}
			sourceStartSeconds={193}
			sourceName="IMG_0765"
			title="Join the DMX connectors"
			detail="Male and female three-pin connectors, then mating. This is a cable join."
			category="DMX CABLE"
		/>
		<CloseupShot
			name="04 Moving-head rear ports"
			from={660}
			durationInFrames={210}
			src={staticFile('setup-review/closeups/IMG_0765-preview.mp4')}
			sourceStartSeconds={176}
			sourceName="IMG_0765"
			title="Moving-head rear ports"
			detail="DMX IN / OUT and mains input are shown as the fixture is lifted toward camera."
			category="DEVICE PORTS"
		/>
		<CloseupShot
			name="05 Set the moving-head address"
			from={870}
			durationInFrames={210}
			src={staticFile('setup-review/closeups/IMG_0759-preview.mp4')}
			sourceStartSeconds={4}
			sourceName="IMG_0759"
			title="Set the moving-head address"
			detail="Tight view of the control panel and address menu; cables are already attached."
			category="ADDRESSING"
		/>
		<CloseupShot
			name="06 Confirm the moving-head address"
			from={1080}
			durationInFrames={165}
			src={staticFile('setup-review/closeups/IMG_0762-preview.mp4')}
			sourceStartSeconds={6}
			sourceName="IMG_0762"
			title="Confirm the moving-head address"
			detail="A cleaner end view of the address display after the hand moves away."
			category="ADDRESSING · ALTERNATE"
		/>
		<CloseupShot
			name="07 Laser DMX and power connections"
			from={1245}
			durationInFrames={75}
			src={staticFile('setup-review/closeups/IMG_0770-preview.mp4')}
			sourceStartSeconds={0}
			sourceName="IMG_0770"
			title="Laser DMX and power connections"
			detail="Rear DMX IN / OUT, mains switch and key/interlock. Both DMX leads are already attached."
			category="DAISY CHAIN"
		/>
		<CloseupShot
			name="08 Set the laser DIP switches"
			from={1320}
			durationInFrames={219}
			src={staticFile('setup-review/closeups/IMG_0771-preview.mp4')}
			sourceStartSeconds={2.2}
			sourceName="IMG_0771"
			title="Set the laser DIP switches"
			detail="Close view of the numbered switch bank and the hand setting switches."
			category="ADDRESSING"
		/>
		<CloseupShot
			name="09 Laser DIP switches — alternate"
			from={1539}
			durationInFrames={216}
			src={staticFile('setup-review/closeups/IMG_0772-preview.mp4')}
			sourceStartSeconds={2.5}
			sourceName="IMG_0772"
			title="Laser DIP switches — alternate"
			detail="Tighter switch-bank view with the status indicator visible."
			category="ADDRESSING · ALTERNATE"
		/>
		<CloseupShot
			name="10 Set the LED-bar mode and address"
			from={1755}
			durationInFrames={225}
			src={staticFile('setup-review/closeups/IMG_0775-preview.mp4')}
			sourceStartSeconds={0}
			sourceName="IMG_0775"
			title="Set the LED-bar mode and address"
			detail="Front-panel buttons and d001 / Pr01 display. Setup detail after physical wiring."
			category="ADDRESSING"
		/>
		<CloseupShot
			name="11 Installed DMX terminator"
			from={1980}
			durationInFrames={189}
			src={staticFile('setup-review/closeups/IMG_0774-preview.mp4')}
			sourceStartSeconds={0}
			sourceName="IMG_0774"
			title="Installed DMX terminator"
			detail="Capped plug in labeled DMX OUT, beside the DMX IN cable. Pullback shows the wired rig; insertion is not filmed."
			category="TERMINATOR"
		/>
		<CloseupShot
			name="12 Terminator — alternate angle"
			from={2169}
			durationInFrames={72}
			src={staticFile('setup-review/closeups/IMG_0773-preview.mp4')}
			sourceStartSeconds={0.4}
			sourceName="IMG_0773"
			title="Terminator — alternate angle"
			detail="Push-in on the same DMX OUT plug. Focus is softer than IMG_0774."
			category="TERMINATOR · ALTERNATE"
		/>
		<CloseupShot
			name="13 Laptop controls the first light"
			from={2241}
			durationInFrames={330}
			src={staticFile('setup-review/closeups/IMG_0763-preview.mp4')}
			sourceStartSeconds={8}
			sourceName="IMG_0763"
			title="Laptop controls the first light"
			detail="Laptop controls and the lit moving head in the same shot."
			category="CONTROL / RESPONSE"
		/>
		<CloseupShot
			name="14 Play the light-show timeline"
			from={2571}
			durationInFrames={210}
			src={staticFile('setup-review/closeups/IMG_0769-preview.mp4')}
			sourceStartSeconds={15}
			sourceName="IMG_0769"
			title="Play the light-show timeline"
			detail="Closer view of the Remotion timeline on the laptop."
			category="CONTROL / RESPONSE"
		/>
		<CloseupShot
			name="15 Software and fixture response"
			from={2781}
			durationInFrames={360}
			src={staticFile('setup-review/closeups/IMG_0782-preview.mp4')}
			sourceStartSeconds={6}
			sourceName="IMG_0782"
			title="Software and fixture response"
			detail="Laptop color controls with the nearby fixtures responding. Added after reviewing the complete short clip."
			category="CONTROL / RESPONSE"
		/>
	</Track>
);

export const SetupCloseups = Interactive.create({
	Component: SetupCloseupsInner,
	layout: 'absolute-fill',
});
