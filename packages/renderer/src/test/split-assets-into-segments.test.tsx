import {splitAssetsIntoSegments} from '../assets/split-assets-into-segments';
import {MediaAsset} from '../assets/types';

test('Should create segments of audio clips correctly', () => {
	const assets: MediaAsset[] = [
		// Clip from 0-10 seconds
		{
			duration: 300,
			src: 'asset1.mp4',
			startInVideo: 0,
			trimLeft: 0,
			type: 'video',
			volume: 1,
			id: '1',
		},
		// Clip from 5-15 seconds
		{
			duration: 300,
			src: 'asset2.mp4',
			startInVideo: 150,
			trimLeft: 0,
			type: 'video',
			volume: 1,
			id: '2',
		},
	];
	expect(splitAssetsIntoSegments({assets, duration: 450})).toEqual([
		{
			duration: 150,
			src: 'asset1.mp4',
			startInVideo: 0,
			trimLeft: 0,
			type: 'video',
			volume: 1,
			id: '1',
		},
		{
			duration: 150,
			src: 'asset1.mp4',
			startInVideo: 150,
			trimLeft: 150,
			type: 'video',
			volume: 1,
			id: '1',
		},
		{
			duration: 150,
			src: 'asset2.mp4',
			startInVideo: 150,
			trimLeft: 0,
			type: 'video',
			volume: 1,
			id: '2',
		},
		{
			duration: 150,
			src: 'asset2.mp4',
			startInVideo: 300,
			trimLeft: 150,
			type: 'video',
			volume: 1,
			id: '2',
		},
	]);
});

test('Should leave single clip untouched', () => {
	const assets: MediaAsset[] = [
		// Clip from 0-10 seconds
		{
			duration: 300,
			src: 'asset1.mp4',
			startInVideo: 0,
			trimLeft: 0,
			type: 'video',
			volume: 1,
			id: '1',
		},
	];
	expect(splitAssetsIntoSegments({assets, duration: 450})).toEqual([
		{
			duration: 300,
			src: 'asset1.mp4',
			startInVideo: 0,
			trimLeft: 0,
			type: 'video',
			volume: 1,
			id: '1',
		},
	]);
});

test('Should leave two identical clips the same', () => {
	const assets: MediaAsset[] = [
		// Clip from 0-10 seconds
		{
			duration: 300,
			src: 'asset1.mp4',
			startInVideo: 0,
			trimLeft: 0,
			type: 'video',
			volume: 1,
			id: '1',
		},
		{
			duration: 300,
			src: 'asset2.mp4',
			startInVideo: 0,
			trimLeft: 0,
			type: 'video',
			volume: 1,
			id: '2',
		},
	];
	expect(splitAssetsIntoSegments({assets, duration: 450})).toEqual([
		{
			duration: 300,
			src: 'asset1.mp4',
			startInVideo: 0,
			trimLeft: 0,
			type: 'video',
			volume: 1,
			id: '1',
		},
		{
			duration: 300,
			src: 'asset2.mp4',
			startInVideo: 0,
			trimLeft: 0,
			type: 'video',
			volume: 1,
			id: '2',
		},
	]);
});

test('Should not have one-off errors', () => {
	const assets: MediaAsset[] = [
		// Clip from 0-10 seconds
		{
			duration: 2,
			src: 'asset1.mp4',
			startInVideo: 0,
			trimLeft: 0,
			type: 'video',
			volume: 1,
			id: '1',
		},
		{
			duration: 2,
			src: 'asset2.mp4',
			startInVideo: 1,
			trimLeft: 0,
			type: 'video',
			volume: 1,
			id: '2',
		},
		{
			duration: 2,
			src: 'asset3.mp4',
			startInVideo: 2,
			trimLeft: 0,
			type: 'video',
			volume: 1,
			id: '3',
		},
	];
	expect(splitAssetsIntoSegments({assets, duration: 450})).toEqual([
		{
			duration: 1,
			src: 'asset1.mp4',
			startInVideo: 0,
			trimLeft: 0,
			type: 'video',
			volume: 1,
			id: '1',
		},
		{
			duration: 1,
			src: 'asset1.mp4',
			startInVideo: 1,
			trimLeft: 1,
			type: 'video',
			volume: 1,
			id: '1',
		},
		{
			duration: 1,
			src: 'asset2.mp4',
			startInVideo: 1,
			trimLeft: 0,
			type: 'video',
			volume: 1,
			id: '2',
		},
		{
			duration: 1,
			src: 'asset2.mp4',
			startInVideo: 2,
			trimLeft: 1,
			type: 'video',
			volume: 1,
			id: '2',
		},
		{
			duration: 1,
			src: 'asset3.mp4',
			startInVideo: 2,
			trimLeft: 0,
			type: 'video',
			volume: 1,
			id: '3',
		},
		{
			duration: 1,
			src: 'asset3.mp4',
			startInVideo: 3,
			trimLeft: 1,
			type: 'video',
			volume: 1,
			id: '3',
		},
	]);
});
