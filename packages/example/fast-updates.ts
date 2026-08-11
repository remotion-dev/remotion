import {writeFileSync} from 'fs';
import {join} from 'path';

const filePath = join(__dirname, 'src/VisualModeTests/FastUpdates.tsx');

const makeContent = (seed: number, duplicateLightLeak: boolean) => {
	const lightLeaks = duplicateLightLeak
		? `<LightLeak durationInFrames={60} seed={${seed}} hueShift={0} />
			<LightLeak durationInFrames={60} seed={${seed}} hueShift={0} />`
		: `<LightLeak durationInFrames={60} seed={${seed}} hueShift={0} />`;

	return `// This file can be changed through the script: packages/example/fast-updates.ts
import {LightLeak} from '@remotion/light-leaks';
import React from 'react';
import {AbsoluteFill} from 'remotion';

export const FastUpdates: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			${lightLeaks}
		</AbsoluteFill>
	);
};
`;
};

const makeContentWithoutLightLeak = () => {
	return `// This file can be changed through the script: packages/example/fast-updates.ts
import React from 'react';
import {AbsoluteFill} from 'remotion';

export const FastUpdates: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: 'black'}} />
	);
};
`;
};

let iteration = 0;

const update = () => {
	const step = iteration % 5;

	if (step < 3) {
		const seed = Math.floor(Math.random() * 1000);
		console.log(`Step ${step + 1}/5: Changing seed to ${seed}`);
		writeFileSync(filePath, makeContent(seed, false));
	} else if (step === 3) {
		console.log('Step 4/5: Duplicating <LightLeak>');
		writeFileSync(
			filePath,
			makeContent(Math.floor(Math.random() * 1000), true),
		);
	} else {
		console.log('Step 5/5: Removing <LightLeak>');
		writeFileSync(filePath, makeContentWithoutLightLeak());
	}

	iteration++;
};

update();
setInterval(update, 2000);
