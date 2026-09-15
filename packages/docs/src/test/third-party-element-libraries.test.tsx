import './register-happydom';
import {afterEach, describe, expect, mock, test} from 'bun:test';
import type {AddElementLibraryToStudioResult} from '@remotion/studio-protocol';
import {cleanup, fireEvent, render, waitFor} from '@testing-library/react';
import React from 'react';
import {thirdPartyElementLibraries} from '../components/Elements/third-party-element-library-data';
import {ThirdPartyElementLibraryList} from '../components/Elements/ThirdPartyElementLibraries';

afterEach(() => {
	cleanup();
});

describe('Third-party Element libraries', () => {
	test('sends verified catalog metadata and waits for Studio confirmation', async () => {
		expect(thirdPartyElementLibraries).toEqual([
			{
				browseUrl: 'https://remocn.dev/docs/components',
				catalogUrl: 'https://remocn.dev/docs/typography',
				description:
					'A shadcn-style library of production-ready Remotion components for product demo videos made with AI agents.',
				displayName: 'Remocn',
			},
		]);

		let resolveRequest: (result: AddElementLibraryToStudioResult) => void = (
			_result,
		) => {
			throw new Error('Expected an Add to Studio request');
		};

		const requestLibraryAddition = mock(
			() =>
				new Promise<AddElementLibraryToStudioResult>((resolve) => {
					resolveRequest = resolve;
				}),
		);
		const view = render(
			<ThirdPartyElementLibraryList
				requestLibraryAddition={requestLibraryAddition}
			/>,
		);
		const browseLink = view.getByRole('link', {name: 'Remocn'});
		expect(browseLink.getAttribute('href')).toBe(
			'https://remocn.dev/docs/components',
		);

		fireEvent.click(view.getByRole('button', {name: 'Add Remocn to Studio'}));
		const loadingButton = view.getByRole('button', {
			name: 'Adding Remocn to Studio',
		}) as HTMLButtonElement;
		expect(loadingButton.disabled).toBe(true);
		expect(requestLibraryAddition).toHaveBeenCalledWith({
			displayName: 'Remocn',
			url: 'https://remocn.dev/docs/typography',
		});

		resolveRequest({
			success: true,
			status: 'awaiting-confirmation',
			target: {
				projectName: 'Product demo',
				studioOrigin: 'http://localhost:3000',
				studioVersion: '4.0.524',
			},
		});
		await waitFor(() => {
			expect(view.getByRole('status').textContent).toContain(
				'Request sent to Product demo. Confirm adding Remocn inside Studio.',
			);
		});

		const retryButton = view.getByRole('button', {
			name: 'Add Remocn to Studio',
		}) as HTMLButtonElement;
		expect(retryButton.disabled).toBe(false);
		fireEvent.click(retryButton);
		await waitFor(() => {
			expect(requestLibraryAddition).toHaveBeenCalledTimes(2);
		});
	});

	test('shows actionable Studio connection and upgrade errors', async () => {
		for (const error of [
			{
				code: 'no-compatible-studio' as const,
				linkName: 'How to start Studio.',
				linkUrl: '/docs/studio',
				message: 'Start Remotion Studio, focus it, and try again.',
			},
			{
				code: 'studio-upgrade-required' as const,
				linkName: 'How to upgrade Remotion.',
				linkUrl: '/docs/upgrading',
				message:
					'This Remotion Studio cannot add an Element catalog through Studio Protocol. Upgrade Remotion to 4.0.518 or newer.',
			},
		]) {
			const requestLibraryAddition = mock(() =>
				Promise.resolve({
					code: error.code,
					message: error.message,
					success: false as const,
				}),
			);
			const view = render(
				<ThirdPartyElementLibraryList
					requestLibraryAddition={requestLibraryAddition}
				/>,
			);
			fireEvent.click(view.getByRole('button', {name: 'Add Remocn to Studio'}));

			const alert = await view.findByRole('alert');
			expect(alert.textContent).toContain(error.message);
			expect(
				view.getByRole('link', {name: error.linkName}).getAttribute('href'),
			).toBe(error.linkUrl);
			cleanup();
		}
	});
});
