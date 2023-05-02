import {execSync} from 'child_process';
import {expect, test} from 'vitest';
import {startLongRunningCompositor} from '../compositor/compositor';
import {exampleVideos} from './example-videos';

test('Memory usage should be determined ', async () => {
	if (process.platform === 'win32') {
		return;
	}

	const compositor = startLongRunningCompositor(400, false);

	expect(
		getMemoryUsageByPid((compositor.pid as Number).toString())
	).toBeLessThan(10 * 1024 * 1024);

	await compositor.executeCommand('ExtractFrame', {
		input: exampleVideos.bigBuckBunny,
		time: 3.333,
		transparent: false,
	});

	const stats = await compositor.executeCommand('GetOpenVideoStats', {});
	const statsJson = JSON.parse(stats.toString('utf-8'));
	expect(statsJson).toEqual({
		frames_in_cache: 79,
		open_streams: 1,
		open_videos: 1,
	});

	await compositor.executeCommand('ExtractFrame', {
		input: exampleVideos.framerWithoutFileExtension,
		time: 3.333,
		transparent: false,
	});

	const stats2 = await compositor.executeCommand('GetOpenVideoStats', {});
	const statsJson2 = JSON.parse(stats2.toString('utf-8'));
	expect(statsJson2).toEqual({
		frames_in_cache: 179,
		open_streams: 2,
		open_videos: 2,
	});

	await compositor.executeCommand('FreeUpMemory', {
		percent_of_memory: 0.5,
	});

	const stats3 = await compositor.executeCommand('GetOpenVideoStats', {});
	const statsJson3 = JSON.parse(stats3.toString('utf-8'));
	expect(statsJson3.frames_in_cache).toBe(89);

	await compositor.executeCommand('FreeUpMemory', {
		percent_of_memory: 0.5,
	});

	const stats4 = await compositor.executeCommand('GetOpenVideoStats', {});
	const statsJson4 = JSON.parse(stats4.toString('utf-8'));
	expect(statsJson4).toEqual({
		frames_in_cache: 44,
		open_streams: 1,
		open_videos: 1,
	});

	await compositor.executeCommand('FreeUpMemory', {
		percent_of_memory: 1,
	});

	const stats5 = await compositor.executeCommand('GetOpenVideoStats', {});
	const statsJson5 = JSON.parse(stats5.toString('utf-8'));
	expect(statsJson5).toEqual({
		frames_in_cache: 0,
		open_streams: 0,
		open_videos: 0,
	});

	await new Promise((resolve) => {
		setTimeout(resolve, 3000);
	});
	expect(
		getMemoryUsageByPid((compositor.pid as Number).toString())
	).toBeLessThan(30 * 1024 * 1024);

	await compositor.executeCommand('ExtractFrame', {
		input: exampleVideos.framerWithoutFileExtension,
		time: 3.333,
		transparent: false,
	});
});

test('Should respect the maximum frame cache limit', async () => {
	const compositor = startLongRunningCompositor(50, false);

	await compositor.executeCommand('ExtractFrame', {
		input: exampleVideos.bigBuckBunny,
		time: 3.333,
		transparent: false,
	});

	const stats = await compositor.executeCommand('GetOpenVideoStats', {});
	const statsJson = JSON.parse(stats.toString('utf-8'));
	expect(statsJson).toEqual({
		frames_in_cache: 50,
		open_streams: 1,
		open_videos: 1,
	});
});

test('Should be able to take commands for freeing up memory', async () => {
	if (process.platform === 'win32') {
		return;
	}

	const compositor = startLongRunningCompositor(400, false);

	expect(
		getMemoryUsageByPid((compositor.pid as Number).toString())
	).toBeLessThan(10 * 1024 * 1024);

	await compositor.executeCommand('ExtractFrame', {
		input: exampleVideos.bigBuckBunny,
		time: 3.333,
		transparent: false,
	});

	expect(
		getMemoryUsageByPid((compositor.pid as Number).toString())
	).toBeGreaterThan(100 * 1024 * 1024);

	await compositor.executeCommand('CloseAllVideos', {});

	expect(
		getMemoryUsageByPid((compositor.pid as Number).toString())
	).toBeLessThan(20 * 1024 * 1024);
});

function getMemoryUsageByPid(pid: string) {
	const data =
		process.platform === 'darwin'
			? execSync(`top -l 1 -pid ${pid} -stats mem`)
			: execSync(`ps -p ${pid} -o rss= | awk '{print $1 * 1024}'`);
	const str = data.toString('utf-8');
	const lines = str.split('\n');
	const last = lines[lines.length - 2];

	if (last.endsWith('G')) {
		return parseFloat(last.replace('G', '').trim()) * 1024 * 1024 * 1024;
	}

	if (last.endsWith('M')) {
		return parseInt(last.replace('M', '').trim(), 10) * 1024 * 1024;
	}

	if (last.endsWith('K')) {
		return parseInt(last.replace('K', '').trim(), 10) * 1024;
	}

	throw new Error('cannot parse' + last);
}
