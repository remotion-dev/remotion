import {expect, test} from 'bun:test';
import type {InputTrack} from 'mediabunny';
import {MP3, MP4, WEBM} from 'mediabunny';
import type {SupportedConfigs} from '../app/components/get-supported-configs';
import {getConvertActionLabel} from '../app/lib/get-convert-action-label';
import {
	getAudioOperationId,
	getVideoOperationId,
} from '../app/lib/operation-key';

const videoTrack = (id: number, codec: string) =>
	({
		codec,
		id,
		isAudioTrack: () => false,
		isVideoTrack: () => true,
	}) as unknown as InputTrack;

const audioTrack = (id: number, codec: string) =>
	({
		codec,
		id,
		isAudioTrack: () => true,
		isVideoTrack: () => false,
	}) as unknown as InputTrack;

test('labels same-container same-codec video re-encoding as re-encode', () => {
	const operation = {type: 'reencode', videoCodec: 'avc'} as const;
	const supportedConfigs: SupportedConfigs = {
		videoTrackOptions: [
			{
				trackId: 1,
				operations: [operation],
			},
		],
		audioTrackOptions: [],
	};

	expect(
		getConvertActionLabel({
			audioConfigIndexSelection: {},
			enableConvert: true,
			inputContainer: MP4,
			outputContainer: 'mp4',
			supportedConfigs,
			tracks: [videoTrack(1, 'avc')],
			videoConfigIndexSelection: {1: getVideoOperationId(operation)},
		}),
	).toBe('Re-encode');
});

test('keeps convert label when the output container changes', () => {
	const operation = {type: 'reencode', videoCodec: 'avc'} as const;
	const supportedConfigs: SupportedConfigs = {
		videoTrackOptions: [
			{
				trackId: 1,
				operations: [operation],
			},
		],
		audioTrackOptions: [],
	};

	expect(
		getConvertActionLabel({
			audioConfigIndexSelection: {},
			enableConvert: true,
			inputContainer: MP4,
			outputContainer: 'webm',
			supportedConfigs,
			tracks: [videoTrack(1, 'avc')],
			videoConfigIndexSelection: {1: getVideoOperationId(operation)},
		}),
	).toBe('Convert');
});

test('keeps convert label when the selected codec changes', () => {
	const operation = {type: 'reencode', videoCodec: 'vp9'} as const;
	const supportedConfigs: SupportedConfigs = {
		videoTrackOptions: [
			{
				trackId: 1,
				operations: [operation],
			},
		],
		audioTrackOptions: [],
	};

	expect(
		getConvertActionLabel({
			audioConfigIndexSelection: {},
			enableConvert: true,
			inputContainer: WEBM,
			outputContainer: 'webm',
			supportedConfigs,
			tracks: [videoTrack(1, 'vp8')],
			videoConfigIndexSelection: {1: getVideoOperationId(operation)},
		}),
	).toBe('Convert');
});

test('labels same-container same-codec audio re-encoding as re-encode', () => {
	const operation = {
		type: 'reencode',
		audioCodec: 'mp3',
		sampleRate: null,
	} as const;
	const supportedConfigs: SupportedConfigs = {
		videoTrackOptions: [],
		audioTrackOptions: [
			{
				audioCodec: 'mp3',
				trackId: 1,
				operations: [operation],
			},
		],
	};

	expect(
		getConvertActionLabel({
			audioConfigIndexSelection: {1: getAudioOperationId(operation)},
			enableConvert: true,
			inputContainer: MP3,
			outputContainer: 'mp3',
			supportedConfigs,
			tracks: [audioTrack(1, 'mp3')],
			videoConfigIndexSelection: {},
		}),
	).toBe('Re-encode');
});

test('labels same-container copy-only operations as remux', () => {
	const operation = {type: 'copy'} as const;
	const supportedConfigs: SupportedConfigs = {
		videoTrackOptions: [
			{
				trackId: 1,
				operations: [operation],
			},
		],
		audioTrackOptions: [],
	};

	expect(
		getConvertActionLabel({
			audioConfigIndexSelection: {},
			enableConvert: true,
			inputContainer: MP4,
			outputContainer: 'mp4',
			supportedConfigs,
			tracks: [videoTrack(1, 'avc')],
			videoConfigIndexSelection: {1: getVideoOperationId(operation)},
		}),
	).toBe('Remux');
});
