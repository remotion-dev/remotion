import fs from 'fs';
import {expect, test} from '@playwright/test';
import {rootFile, STUDIO_URL} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test('rounds inherited endings and squares explicit cutoffs', async ({
	page,
}) => {
	await startStudio();
	try {
		fs.writeFileSync(
			rootFile,
			`
import React from 'react';
import {Audio, Video} from '@remotion/media';
import {AbsoluteFill, Composition, Sequence, Solid, staticFile} from 'remotion';
const src = staticFile('sine-wave.wav'); // Exactly one second, or 30 frames.
const Layers = () => <>
  <AbsoluteFill name="Fill available time" />
  <AbsoluteFill name="Explicit fill cutoff" durationInFrames={30} />
  <AbsoluteFill name="Explicit composition match" durationInFrames={180} />
  <AbsoluteFill name="Fill clipped before own cutoff" durationInFrames={240} />
  <Sequence name="Fill parent" durationInFrames={30}>
    <AbsoluteFill name="Inherited fill" />
    <AbsoluteFill name="Child clipped before own cutoff" durationInFrames={60} />
  </Sequence>
  <Solid name="Solid cutoff" color="gray" width={100} height={100} from={27} durationInFrames={9} trimBefore={27} />
  <Audio name="Natural end" src={src} durationInFrames={30} />
  <Audio name="Duration cutoff" src={src} durationInFrames={15} />
  <Sequence name="Short parent" durationInFrames={15}>
    <Audio name="Parent cutoff" src={src} />
  </Sequence>
  <Sequence name="Matching parent" durationInFrames={30}>
    <Audio name="Matching child" src={src} />
  </Sequence>
  <Audio name="Trimmed start" src={src} trimBefore={10} durationInFrames={20} />
  <Audio name="Trimmed end" src={src} trimAfter={20} />
  <Audio name="Fast media" src={src} playbackRate={2} durationInFrames={15} />
  <Audio name="Slow media" src={src} playbackRate={0.5} durationInFrames={60} />
  <Audio name="Loop" src={src} loop durationInFrames={60} />
  <Audio name="Frozen" src={src} freeze={0} durationInFrames={30} />
  <Audio name="Loop without cutoff" src={src} loop />
  <Audio name="Freeze without cutoff" src={src} freeze={0} />
  <Audio name="Composition cutoff" src={src} from={165} />
  <Audio name="Composition match" src={src} from={150} />
  <Video name="Video natural end" src={staticFile('blush-1x.webm')} durationInFrames={80} muted />
  <Video name="Video cutoff" src={staticFile('blush-1x.webm')} durationInFrames={79} muted />
  <Video name="Video without cutoff" src={staticFile('blush-1x.webm')} muted />
  <Video name="Video trimmed start" src={staticFile('blush-1x.webm')} from={20} trimBefore={20} muted />
  <Video name="Video shifted start" src={staticFile('blush-1x.webm')} from={20} muted />
  <Video name="Video fast trimmed start" src={staticFile('blush-1x.webm')} from={20} trimBefore={20} playbackRate={2} muted />
  <Video name="Video held frame" src={staticFile('blush-1x.webm')} durationInFrames={120} muted />
</>;
export const E2eTestRoot = () => <Composition id="timeline-edges" component={Layers} durationInFrames={180} fps={30} width={640} height={360} />;
`,
		);
		await page.setViewportSize({width: 1440, height: 1600});
		await page.goto(`${STUDIO_URL}/timeline-edges`);
		for (const [name, radius] of [
			['Fill available time', '2px'],
			['Explicit fill cutoff', '0px'],
			['Explicit composition match', '0px'],
			['Fill clipped before own cutoff', '2px'],
			['Fill parent', '0px'],
			['Inherited fill', '2px'],
			['Child clipped before own cutoff', '2px'],
			['Natural end', '2px'],
			['Solid cutoff', '0px'],
			['Duration cutoff', '0px'],
			['Short parent', '0px'],
			['Parent cutoff', '2px'],
			['Matching parent', '0px'],
			['Matching child', '2px'],
			['Trimmed start', '2px'],
			['Trimmed end', '0px'],
			['Fast media', '2px'],
			['Slow media', '2px'],
			['Loop', '0px'],
			['Frozen', '0px'],
			['Loop without cutoff', '2px'],
			['Freeze without cutoff', '2px'],
			['Composition cutoff', '2px'],
			['Composition match', '2px'],
			['Video natural end', '2px'],
			['Video cutoff', '0px'],
			['Video held frame', '0px'],
			['Video without cutoff', '2px'],
		]) {
			const layer = page.locator(
				`[data-timeline-marquee-item][title="${name}"]`,
			);
			await layer.scrollIntoViewIfNeeded();
			await expect(layer).toHaveCSS('border-top-right-radius', radius);
			await expect(layer).toHaveCSS('border-bottom-right-radius', radius);
		}
		for (const [name, radius] of [
			['Video trimmed start', '0px'],
			['Video shifted start', '2px'],
			['Video fast trimmed start', '0px'],
			['Trimmed start', '0px'],
			['Natural end', '2px'],
		]) {
			const layer = page.locator(
				`[data-timeline-marquee-item][title="${name}"]`,
			);
			await layer.scrollIntoViewIfNeeded();
			await expect(layer).toHaveCSS('border-top-left-radius', radius);
			await expect(layer).toHaveCSS('border-bottom-left-radius', radius);
		}
	} finally {
		await stopStudio();
	}
});
