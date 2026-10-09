import {Audio, Video} from '@remotion/media';
import React from 'react';
import {Interactive, Series, useVideoConfig} from 'remotion';
import {Callout} from '../elements/Callout';
import {NameLowerThird} from '../elements/NameLowerThird';
import {PoppingWordCaptions} from '../elements/popping-word-captions';

const OfficeInner: React.FC = () => {
	const {fps} = useVideoConfig();

	return (
		<>
			<Series>
				<Series.Sequence
					name="Mehmet"
					trimBefore={1324}
					durationInFrames={38}
					premountFor={fps}
				>
					<Video
						name="IMG_0475"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0475.MOV'
						}
						volume={1}
						premountFor={fps}
						objectFit="cover"
						style={{width: '100%', height: '100%'}}
					/>
					<PoppingWordCaptions
						combineTokensWithinMilliseconds={null}
						name="Captions"
						premountFor={fps}
						width={1600}
						style={{position: 'absolute', bottom: 56, translate: '160px 0px'}}
						captions={[
							{
								text: ' Mehmet,',
								startMs: 44133,
								endMs: 44800,
								timestampMs: 44467,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Would you try it"
					trimBefore={1378}
					durationInFrames={32}
					premountFor={fps}
				>
					<Video
						name="IMG_0475"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0475.MOV'
						}
						volume={1}
						premountFor={fps}
						objectFit="cover"
						style={{width: '100%', height: '100%'}}
					/>
					<PoppingWordCaptions
						combineTokensWithinMilliseconds={null}
						name="Captions"
						premountFor={fps}
						width={1600}
						style={{position: 'absolute', bottom: 56, translate: '160px 0px'}}
						captions={[
							{
								text: ' would',
								startMs: 45950,
								endMs: 46380,
								timestampMs: 46165,
								confidence: null,
							},
							{
								text: ' you',
								startMs: 46380,
								endMs: 46540,
								timestampMs: 46460,
								confidence: null,
							},
							{
								text: ' try',
								startMs: 46540,
								endMs: 46800,
								timestampMs: 46670,
								confidence: null,
							},
							{
								text: ' it?',
								startMs: 46800,
								endMs: 46980,
								timestampMs: 46890,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Scared to be honest"
					trimBefore={1502}
					durationInFrames={244}
					premountFor={fps}
				>
					<Video
						name="IMG_0475"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0475.MOV'
						}
						volume={4.5}
						premountFor={fps}
						objectFit="cover"
						style={{width: '100%', height: '100%'}}
					/>
					<PoppingWordCaptions
						combineTokensWithinMilliseconds={null}
						name="Captions"
						premountFor={fps}
						width={1600}
						style={{position: 'absolute', bottom: 56, translate: '160px 0px'}}
						captions={[
							{
								text: ' If',
								startMs: 50067,
								endMs: 50420,
								timestampMs: 50244,
								confidence: null,
							},
							{
								text: ' you',
								startMs: 50420,
								endMs: 50700,
								timestampMs: 50560,
								confidence: null,
							},
							{
								text: ' give',
								startMs: 50700,
								endMs: 51160,
								timestampMs: 50930,
								confidence: null,
							},
							{
								text: ' me',
								startMs: 51160,
								endMs: 51380,
								timestampMs: 51270,
								confidence: null,
							},
							{
								text: ' a',
								startMs: 51380,
								endMs: 51580,
								timestampMs: 51480,
								confidence: null,
							},
							{
								text: ' one',
								startMs: 51580,
								endMs: 51680,
								timestampMs: 51630,
								confidence: null,
							},
							{
								text: '-on',
								startMs: 51680,
								endMs: 52060,
								timestampMs: 51870,
								confidence: null,
							},
							{
								text: '-one,',
								startMs: 52060,
								endMs: 52900,
								timestampMs: 52480,
								confidence: null,
							},
							{
								text: ' then',
								startMs: 53120,
								endMs: 53600,
								timestampMs: 53360,
								confidence: null,
							},
							{
								text: ' maybe',
								startMs: 53600,
								endMs: 53920,
								timestampMs: 53760,
								confidence: null,
							},
							{
								text: ' I',
								startMs: 53920,
								endMs: 54180,
								timestampMs: 54050,
								confidence: null,
							},
							{
								text: ' would.',
								startMs: 54180,
								endMs: 54400,
								timestampMs: 54290,
								confidence: null,
							},
							{
								text: ' But',
								startMs: 55300,
								endMs: 55640,
								timestampMs: 55470,
								confidence: null,
							},
							{
								text: ' I',
								startMs: 55640,
								endMs: 56520,
								timestampMs: 56080,
								confidence: null,
							},
							{
								text: ' would',
								startMs: 56520,
								endMs: 56700,
								timestampMs: 56610,
								confidence: null,
							},
							{
								text: ' be',
								startMs: 56700,
								endMs: 57000,
								timestampMs: 56850,
								confidence: null,
							},
							{
								text: ' scared',
								startMs: 57000,
								endMs: 57400,
								timestampMs: 57200,
								confidence: null,
							},
							{
								text: ' to',
								startMs: 57400,
								endMs: 57560,
								timestampMs: 57480,
								confidence: null,
							},
							{
								text: ' be',
								startMs: 57560,
								endMs: 57820,
								timestampMs: 57690,
								confidence: null,
							},
							{
								text: ' honest.',
								startMs: 57820,
								endMs: 58000,
								timestampMs: 57910,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="No brakes"
					trimBefore={1844}
					durationInFrames={51}
					premountFor={fps}
				>
					<Video
						name="IMG_0475"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0475.MOV'
						}
						volume={1}
						premountFor={fps}
						objectFit="cover"
						style={{width: '100%', height: '100%'}}
					/>
					<PoppingWordCaptions
						combineTokensWithinMilliseconds={null}
						name="Captions"
						premountFor={fps}
						width={1600}
						style={{position: 'absolute', bottom: 56, translate: '160px 0px'}}
						captions={[
							{
								text: ' Yes,',
								startMs: 61740,
								endMs: 61900,
								timestampMs: 61820,
								confidence: null,
							},
							{
								text: ' there',
								startMs: 62200,
								endMs: 62320,
								timestampMs: 62260,
								confidence: null,
							},
							{
								text: ' are',
								startMs: 62320,
								endMs: 62480,
								timestampMs: 62400,
								confidence: null,
							},
							{
								text: ' no',
								startMs: 62480,
								endMs: 62780,
								timestampMs: 62630,
								confidence: null,
							},
							{
								text: ' brakes.',
								startMs: 62780,
								endMs: 63167,
								timestampMs: 62974,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Brake tomorrow"
					trimBefore={2346}
					durationInFrames={209}
					premountFor={fps}
				>
					<Video
						name="IMG_0475"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0475.MOV'
						}
						volume={1}
						premountFor={fps}
						objectFit="cover"
						style={{width: '100%', height: '100%'}}
					/>
					<PoppingWordCaptions
						combineTokensWithinMilliseconds={null}
						name="Captions"
						premountFor={fps}
						width={1600}
						style={{position: 'absolute', bottom: 56, translate: '160px 0px'}}
						captions={[
							{
								text: ' I',
								startMs: 78400,
								endMs: 78820,
								timestampMs: 78610,
								confidence: null,
							},
							{
								text: " don't",
								startMs: 78820,
								endMs: 79000,
								timestampMs: 78910,
								confidence: null,
							},
							{
								text: ' have',
								startMs: 79000,
								endMs: 79140,
								timestampMs: 79070,
								confidence: null,
							},
							{
								text: ' a',
								startMs: 79140,
								endMs: 79300,
								timestampMs: 79220,
								confidence: null,
							},
							{
								text: ' brake',
								startMs: 79300,
								endMs: 79520,
								timestampMs: 79410,
								confidence: null,
							},
							{
								text: ' right',
								startMs: 79520,
								endMs: 79900,
								timestampMs: 79710,
								confidence: null,
							},
							{
								text: ' now,',
								startMs: 79900,
								endMs: 80000,
								timestampMs: 79950,
								confidence: null,
							},
							{
								text: ' but',
								startMs: 80760,
								endMs: 81120,
								timestampMs: 80940,
								confidence: null,
							},
							{
								text: ' I',
								startMs: 81120,
								endMs: 81420,
								timestampMs: 81270,
								confidence: null,
							},
							{
								text: ' will',
								startMs: 81420,
								endMs: 82600,
								timestampMs: 82010,
								confidence: null,
							},
							{
								text: ' mount',
								startMs: 82600,
								endMs: 82780,
								timestampMs: 82690,
								confidence: null,
							},
							{
								text: ' a',
								startMs: 82780,
								endMs: 83020,
								timestampMs: 82900,
								confidence: null,
							},
							{
								text: ' brake',
								startMs: 83000,
								endMs: 83240,
								timestampMs: 83120,
								confidence: null,
							},
							{
								text: ' on',
								startMs: 83240,
								endMs: 83420,
								timestampMs: 83330,
								confidence: null,
							},
							{
								text: ' my',
								startMs: 83420,
								endMs: 83660,
								timestampMs: 83540,
								confidence: null,
							},
							{
								text: ' shoes',
								startMs: 83660,
								endMs: 84760,
								timestampMs: 84210,
								confidence: null,
							},
							{
								text: ' tomorrow.',
								startMs: 84760,
								endMs: 85000,
								timestampMs: 84880,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Rolls on one side"
					trimBefore={2771}
					durationInFrames={183}
					premountFor={fps}
				>
					<Video
						name="IMG_0475"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0475.MOV'
						}
						volume={1}
						premountFor={fps}
						objectFit="cover"
						style={{width: '100%', height: '100%'}}
					/>
					<PoppingWordCaptions
						combineTokensWithinMilliseconds={null}
						name="Captions"
						premountFor={fps}
						width={1600}
						style={{position: 'absolute', bottom: 56, translate: '160px 0px'}}
						captions={[
							{
								text: ' And',
								startMs: 92560,
								endMs: 93580,
								timestampMs: 93070,
								confidence: null,
							},
							{
								text: ' here',
								startMs: 93580,
								endMs: 93720,
								timestampMs: 93650,
								confidence: null,
							},
							{
								text: ' you',
								startMs: 93720,
								endMs: 93860,
								timestampMs: 93790,
								confidence: null,
							},
							{
								text: ' can',
								startMs: 93860,
								endMs: 94040,
								timestampMs: 93950,
								confidence: null,
							},
							{
								text: ' also',
								startMs: 94040,
								endMs: 94260,
								timestampMs: 94150,
								confidence: null,
							},
							{
								text: ' see',
								startMs: 94260,
								endMs: 94500,
								timestampMs: 94380,
								confidence: null,
							},
							{
								text: ' very',
								startMs: 94500,
								endMs: 94760,
								timestampMs: 94630,
								confidence: null,
							},
							{
								text: ' well',
								startMs: 94760,
								endMs: 95020,
								timestampMs: 94890,
								confidence: null,
							},
							{
								text: ' that',
								startMs: 95020,
								endMs: 95860,
								timestampMs: 95440,
								confidence: null,
							},
							{
								text: ' it',
								startMs: 95860,
								endMs: 96120,
								timestampMs: 95990,
								confidence: null,
							},
							{
								text: ' rolls',
								startMs: 96120,
								endMs: 96300,
								timestampMs: 96210,
								confidence: null,
							},
							{
								text: ' on',
								startMs: 96300,
								endMs: 96840,
								timestampMs: 96570,
								confidence: null,
							},
							{
								text: ' one',
								startMs: 96840,
								endMs: 97140,
								timestampMs: 96990,
								confidence: null,
							},
							{
								text: ' side,',
								startMs: 97140,
								endMs: 97440,
								timestampMs: 97290,
								confidence: null,
							},
							{
								text: ' but',
								startMs: 97840,
								endMs: 98000,
								timestampMs: 97920,
								confidence: null,
							},
							{
								text: ' then',
								startMs: 98080,
								endMs: 98300,
								timestampMs: 98190,
								confidence: null,
							},
							{
								text: '...',
								startMs: 98300,
								endMs: 98340,
								timestampMs: 98310,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Go up a hill"
					trimBefore={2957}
					durationInFrames={246}
					premountFor={fps}
				>
					<Video
						name="IMG_0475"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0475.MOV'
						}
						volume={1}
						premountFor={fps}
						objectFit="cover"
						style={{width: '100%', height: '100%'}}
					/>
					<PoppingWordCaptions
						combineTokensWithinMilliseconds={null}
						name="Captions"
						premountFor={fps}
						width={1600}
						style={{position: 'absolute', bottom: 56, translate: '160px 0px'}}
						captions={[
							{
								text: ' It',
								startMs: 98640,
								endMs: 98940,
								timestampMs: 98790,
								confidence: null,
							},
							{
								text: " doesn't?",
								startMs: 98940,
								endMs: 99360,
								timestampMs: 99150,
								confidence: null,
							},
							{
								text: ' Oh,',
								startMs: 99580,
								endMs: 100620,
								timestampMs: 100100,
								confidence: null,
							},
							{
								text: ' wow.',
								startMs: 101260,
								endMs: 101720,
								timestampMs: 101490,
								confidence: null,
							},
							{
								text: ' This',
								startMs: 101820,
								endMs: 102000,
								timestampMs: 101910,
								confidence: null,
							},
							{
								text: ' is',
								startMs: 102080,
								endMs: 102340,
								timestampMs: 102210,
								confidence: null,
							},
							{
								text: ' cool.',
								startMs: 102340,
								endMs: 102380,
								timestampMs: 102350,
								confidence: null,
							},
							{
								text: ' Locked',
								startMs: 102540,
								endMs: 102740,
								timestampMs: 102640,
								confidence: null,
							},
							{
								text: ' on',
								startMs: 102740,
								endMs: 102840,
								timestampMs: 102790,
								confidence: null,
							},
							{
								text: ' the',
								startMs: 102840,
								endMs: 103000,
								timestampMs: 102920,
								confidence: null,
							},
							{
								text: ' other',
								startMs: 103000,
								endMs: 103280,
								timestampMs: 103140,
								confidence: null,
							},
							{
								text: ' side.',
								startMs: 103280,
								endMs: 103440,
								timestampMs: 103360,
								confidence: null,
							},
							{
								text: ' So',
								startMs: 103540,
								endMs: 104200,
								timestampMs: 103870,
								confidence: null,
							},
							{
								text: ' you',
								startMs: 104200,
								endMs: 104440,
								timestampMs: 104320,
								confidence: null,
							},
							{
								text: ' can',
								startMs: 104440,
								endMs: 105360,
								timestampMs: 104900,
								confidence: null,
							},
							{
								text: ' really',
								startMs: 105360,
								endMs: 105720,
								timestampMs: 105540,
								confidence: null,
							},
							{
								text: ' easily',
								startMs: 105720,
								endMs: 105940,
								timestampMs: 105830,
								confidence: null,
							},
							{
								text: ' go',
								startMs: 105940,
								endMs: 106160,
								timestampMs: 106050,
								confidence: null,
							},
							{
								text: ' up',
								startMs: 106160,
								endMs: 106280,
								timestampMs: 106220,
								confidence: null,
							},
							{
								text: ' a',
								startMs: 106280,
								endMs: 106440,
								timestampMs: 106360,
								confidence: null,
							},
							{
								text: ' hill.',
								startMs: 106440,
								endMs: 106480,
								timestampMs: 106460,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Yeah I see"
					trimBefore={3254}
					durationInFrames={78}
					premountFor={fps}
				>
					<Video
						name="IMG_0475"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0475.MOV'
						}
						volume={2.5}
						premountFor={fps}
						objectFit="cover"
						style={{width: '100%', height: '100%'}}
					/>
					<PoppingWordCaptions
						combineTokensWithinMilliseconds={null}
						name="Captions"
						premountFor={fps}
						width={1600}
						style={{position: 'absolute', bottom: 56, translate: '160px 0px'}}
						captions={[
							{
								text: ' Yeah,',
								startMs: 108660,
								endMs: 108780,
								timestampMs: 108720,
								confidence: null,
							},
							{
								text: ' you',
								startMs: 108800,
								endMs: 108980,
								timestampMs: 108890,
								confidence: null,
							},
							{
								text: ' can',
								startMs: 108980,
								endMs: 109180,
								timestampMs: 109080,
								confidence: null,
							},
							{
								text: ' really,',
								startMs: 109180,
								endMs: 109320,
								timestampMs: 109250,
								confidence: null,
							},
							{
								text: ' yeah,',
								startMs: 109500,
								endMs: 109680,
								timestampMs: 109590,
								confidence: null,
							},
							{
								text: ' I',
								startMs: 109720,
								endMs: 109960,
								timestampMs: 109840,
								confidence: null,
							},
							{
								text: ' see,',
								startMs: 109960,
								endMs: 110080,
								timestampMs: 110020,
								confidence: null,
							},
							{
								text: ' I',
								startMs: 110220,
								endMs: 110360,
								timestampMs: 110290,
								confidence: null,
							},
							{
								text: ' see.',
								startMs: 110360,
								endMs: 110400,
								timestampMs: 110380,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
			</Series>
			<NameLowerThird
				name="Mehmet"
				from={6}
				durationInFrames={284}
				premountFor={fps}
				personName="Mehmet"
				title="Already at work"
				accentColor="#2563eb"
				style={{position: 'absolute', left: 80, top: 70}}
			/>
			<Callout
				name="Confirmed callout"
				from={314}
				durationInFrames={101}
				premountFor={fps}
				label="Confirmed"
				text="Still no brakes"
				icon="cross"
				accentColor="#dc2626"
				style={{position: 'absolute', left: 80, top: 70}}
			/>
			<Audio
				name="Error"
				src="https://remotion.media/windows-xp-error.wav"
				from={316}
				volume={0.35}
				premountFor={fps}
			/>
		</>
	);
};

export const Office = Interactive.withSchema({
	Component: OfficeInner,
	componentName: 'Office',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});
