import {expect, test} from 'bun:test';
import {
	acceptPendingCompositionMetadataValue,
	failPendingCompositionMetadataValue,
	type PendingCompositionMetadata,
	type PendingCompositionMetadataValue,
	reconcilePendingCompositionMetadata,
} from '../components/InspectorPanel/optimistic-composition-metadata';

const makePendingValue = (
	baseline: object,
): PendingCompositionMetadataValue => ({
	baseline,
	status: 'saving',
	value: 1920,
});

test('keeps the optimistic value until HMR updates the resolved config', () => {
	const baseline = {width: 1280};
	const value = makePendingValue(baseline);
	const pending: PendingCompositionMetadata = {width: value};
	const accepted = acceptPendingCompositionMetadataValue({
		currentConfig: baseline,
		field: 'width',
		pending,
		value,
	});

	expect(accepted.width).toEqual({...value, status: 'awaiting-hmr'});
	expect(
		reconcilePendingCompositionMetadata({
			currentConfig: baseline,
			pending: accepted,
		}).width,
	).toBeDefined();
	expect(
		reconcilePendingCompositionMetadata({
			currentConfig: {width: 1920},
			pending: accepted,
		}).width,
	).toBeUndefined();
});

test('reconciles when undo produces a new config with the original value', () => {
	const baseline = {width: 1280};
	const value = makePendingValue(baseline);
	const accepted = acceptPendingCompositionMetadataValue({
		currentConfig: baseline,
		field: 'width',
		pending: {width: value},
		value,
	});

	expect(
		reconcilePendingCompositionMetadata({
			currentConfig: {width: 1280},
			pending: accepted,
		}).width,
	).toBeUndefined();
});

test('handles HMR completing before the codemod response', () => {
	const baseline = {width: 1280};
	const value = makePendingValue(baseline);
	const pending: PendingCompositionMetadata = {width: value};
	const refreshed = {width: 1920};

	expect(
		reconcilePendingCompositionMetadata({
			currentConfig: refreshed,
			pending,
		}),
	).toBe(pending);
	expect(
		acceptPendingCompositionMetadataValue({
			currentConfig: refreshed,
			field: 'width',
			pending,
			value,
		}).width,
	).toBeUndefined();
});

test('does not clear a newer pending edit when an older request fails', () => {
	const baseline = {width: 1280};
	const older = makePendingValue(baseline);
	const newer = {...makePendingValue(baseline), value: 2560};
	const pending: PendingCompositionMetadata = {width: newer};

	expect(
		failPendingCompositionMetadataValue({
			field: 'width',
			pending,
			value: older,
		}),
	).toBe(pending);
});
