import {splitAssetsIntoSegments} from '../assets/split-assets-into-segments';
import {MediaAsset} from '../assets/types';

test('Should create segments of audio clips correctly', () => {
	const assets: MediaAsset[] = [
		// Clip from 0-10 seconds
		{
			duration: 300,
			id: '0.1',
			src: 'asset1.mp4',
			startInVideo: 0,
			trimLeft: 0,
			type: 'video',
		},
		// Clip from 5-15 seconds
		{
			duration: 300,
			id: '0.2',
			src: 'asset2.mp4',
			startInVideo: 150,
			trimLeft: 0,
			type: 'video',
		},
	];
	expect(splitAssetsIntoSegments({assets, duration: 450})).toEqual([
		{
			duration: 150,
			id: '0.1',
			src: 'asset1.mp4',
			startInVideo: 0,
			trimLeft: 0,
			type: 'video',
		},
		{
			duration: 150,
			id: '0.1',
			src: 'asset1.mp4',
			startInVideo: 150,
			trimLeft: 150,
			type: 'video',
		},
		{
			duration: 150,
			id: '0.2',
			src: 'asset2.mp4',
			startInVideo: 150,
			trimLeft: 0,
			type: 'video',
		},
		{
			duration: 150,
			id: '0.2',
			src: 'asset2.mp4',
			startInVideo: 300,
			trimLeft: 150,
			type: 'video',
		},
	]);
});

test('Should leave single clip untouched', () => {
	const assets: MediaAsset[] = [
		// Clip from 0-10 seconds
		{
			duration: 300,
			id: '0.1',
			src: 'asset1.mp4',
			startInVideo: 0,
			trimLeft: 0,
			type: 'video',
		},
	];
	expect(splitAssetsIntoSegments({assets, duration: 450})).toEqual([
		{
			duration: 300,
			id: '0.1',
			src: 'asset1.mp4',
			startInVideo: 0,
			trimLeft: 0,
			type: 'video',
		},
	]);
});

test('Should leave two identical clips the same', () => {
	const assets: MediaAsset[] = [
		// Clip from 0-10 seconds
		{
			duration: 300,
			id: '0.1',
			src: 'asset1.mp4',
			startInVideo: 0,
			trimLeft: 0,
			type: 'video',
		},
		{
			duration: 300,
			id: '0.2',
			src: 'asset2.mp4',
			startInVideo: 0,
			trimLeft: 0,
			type: 'video',
		},
	];
	expect(splitAssetsIntoSegments({assets, duration: 450})).toEqual([
		{
			duration: 300,
			id: '0.1',
			src: 'asset1.mp4',
			startInVideo: 0,
			trimLeft: 0,
			type: 'video',
		},
		{
			duration: 300,
			id: '0.2',
			src: 'asset2.mp4',
			startInVideo: 0,
			trimLeft: 0,
			type: 'video',
		},
	]);
});

test('Should not have one-off errors', () => {
	const assets: MediaAsset[] = [
		// Clip from 0-10 seconds
		{
			duration: 2,
			id: '0.1',
			src: 'asset1.mp4',
			startInVideo: 0,
			trimLeft: 0,
			type: 'video',
		},
		{
			duration: 2,
			id: '0.2',
			src: 'asset2.mp4',
			startInVideo: 1,
			trimLeft: 0,
			type: 'video',
		},
		{
			duration: 2,
			id: '0.3',
			src: 'asset3.mp4',
			startInVideo: 2,
			trimLeft: 0,
			type: 'video',
		},
	];
	expect(splitAssetsIntoSegments({assets, duration: 450})).toEqual([
		{
			duration: 1,
			id: '0.1',
			src: 'asset1.mp4',
			startInVideo: 0,
			trimLeft: 0,
			type: 'video',
		},
		{
			duration: 1,
			id: '0.1',
			src: 'asset1.mp4',
			startInVideo: 1,
			trimLeft: 1,
			type: 'video',
		},
		{
			duration: 1,
			id: '0.2',
			src: 'asset2.mp4',
			startInVideo: 1,
			trimLeft: 0,
			type: 'video',
		},
		{
			duration: 1,
			id: '0.2',
			src: 'asset2.mp4',
			startInVideo: 2,
			trimLeft: 1,
			type: 'video',
		},
		{
			duration: 1,
			id: '0.3',
			src: 'asset3.mp4',
			startInVideo: 2,
			trimLeft: 0,
			type: 'video',
		},
		{
			duration: 1,
			id: '0.3',
			src: 'asset3.mp4',
			startInVideo: 3,
			trimLeft: 1,
			type: 'video',
		},
	]);
});
