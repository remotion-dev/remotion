import type {BunRequest} from 'bun';
import {exportStaticSite, type StaticExportTarget} from '../export-static-site';
import {renderComparison} from './comparison';
import {loadComparison} from './comparison-data';
import {serveRunFile} from './files';
import {renderHome} from './home';
import {getJob, getScenario, startComparison, startRun} from './jobs';
import {loadRun, renderRun} from './run';
import {renderScenario} from './scenario';
import {htmlResponse, json, notFound} from './shared';

const getRunCount = (request: Request) => {
	const value = new URL(request.url).searchParams.get('runs');

	return value === null ? undefined : Number(value);
};

const shareResponse = async (targets: StaticExportTarget[]) => {
	try {
		return json(await exportStaticSite({targets}));
	} catch (error) {
		return json(
			{error: error instanceof Error ? error.message : String(error)},
			{status: 400},
		);
	}
};

const parseShareTargets = (value: unknown): StaticExportTarget[] => {
	if (!Array.isArray(value)) {
		throw new Error('Expected "targets" to be an array.');
	}

	return value.map((target) => {
		if (!target || typeof target !== 'object' || !('type' in target)) {
			throw new Error('Invalid share target.');
		}

		if (
			target.type === 'run' &&
			'scenarioId' in target &&
			typeof target.scenarioId === 'string' &&
			'runId' in target &&
			typeof target.runId === 'string'
		) {
			return {
				runId: target.runId,
				scenarioId: target.scenarioId,
				type: 'run',
			};
		}

		if (
			target.type === 'comparison' &&
			'scenarioId' in target &&
			typeof target.scenarioId === 'string' &&
			'comparisonId' in target &&
			typeof target.comparisonId === 'string'
		) {
			return {
				comparisonId: target.comparisonId,
				scenarioId: target.scenarioId,
				type: 'comparison',
			};
		}

		throw new Error('Invalid share target.');
	});
};

export const routes = {
	'/': async () => htmlResponse(await renderHome()),

	'/api/compare/:scenarioId': {
		POST: async (request: BunRequest<'/api/compare/:scenarioId'>) => {
			const scenario = getScenario(request.params.scenarioId);

			if (!scenario) {
				return json({error: 'Unknown scenario'}, {status: 404});
			}

			const body = await request.json().catch(() => null);
			const beforeGitRef =
				body &&
				typeof body === 'object' &&
				'beforeGitRef' in body &&
				typeof body.beforeGitRef === 'string'
					? body.beforeGitRef
					: undefined;

			try {
				return json(
					startComparison(scenario, {
						beforeGitRef,
						runCount: getRunCount(request),
					}),
				);
			} catch (error) {
				return json(
					{error: error instanceof Error ? error.message : String(error)},
					{status: 400},
				);
			}
		},
	},

	'/api/jobs/:jobId': (request: BunRequest<'/api/jobs/:jobId'>) => {
		const job = getJob(request.params.jobId);

		if (!job) {
			return json({error: 'Unknown job'}, {status: 404});
		}

		return json(job);
	},

	'/api/run/:scenarioId': {
		POST: (request: BunRequest<'/api/run/:scenarioId'>) => {
			const scenario = getScenario(request.params.scenarioId);

			if (!scenario) {
				return json({error: 'Unknown scenario'}, {status: 404});
			}

			try {
				return json(startRun(scenario, getRunCount(request)));
			} catch (error) {
				return json(
					{error: error instanceof Error ? error.message : String(error)},
					{status: 400},
				);
			}
		},
	},

	'/api/share/comparison/:scenarioId/:comparisonId': {
		POST: (
			request: BunRequest<'/api/share/comparison/:scenarioId/:comparisonId'>,
		) =>
			shareResponse([
				{
					comparisonId: request.params.comparisonId,
					scenarioId: request.params.scenarioId,
					type: 'comparison',
				},
			]),
	},

	'/api/share/run/:scenarioId/:runId': {
		POST: (request: BunRequest<'/api/share/run/:scenarioId/:runId'>) =>
			shareResponse([
				{
					runId: request.params.runId,
					scenarioId: request.params.scenarioId,
					type: 'run',
				},
			]),
	},

	'/api/share/selection': {
		POST: async (request: BunRequest<'/api/share/selection'>) => {
			const body = await request.json().catch(() => null);

			try {
				return shareResponse(
					parseShareTargets(
						body && typeof body === 'object' && 'targets' in body
							? body.targets
							: null,
					),
				);
			} catch (error) {
				return json(
					{error: error instanceof Error ? error.message : String(error)},
					{status: 400},
				);
			}
		},
	},

	'/comparisons/:scenarioId/:comparisonId': async (
		request: BunRequest<'/comparisons/:scenarioId/:comparisonId'>,
	) => {
		const comparisonData = await loadComparison(
			request.params.scenarioId,
			request.params.comparisonId,
		);

		if (!comparisonData) {
			return notFound();
		}

		return htmlResponse(renderComparison(comparisonData));
	},

	'/files/*': (request: Request) => {
		const {pathname} = new URL(request.url);
		let relativePath: string;

		try {
			relativePath = decodeURIComponent(pathname.replace(/^\/files\//, ''));
		} catch {
			return new Response('Bad request', {status: 400});
		}

		return serveRunFile(relativePath);
	},

	'/scenarios/:scenarioId': async (
		request: BunRequest<'/scenarios/:scenarioId'>,
	) => {
		const scenario = getScenario(request.params.scenarioId);

		if (!scenario) {
			return notFound();
		}

		return htmlResponse(await renderScenario(scenario));
	},

	'/runs/:scenarioId/:runId': async (
		request: BunRequest<'/runs/:scenarioId/:runId'>,
	) => {
		const manifest = await loadRun(
			request.params.scenarioId,
			request.params.runId,
		);

		if (!manifest) {
			return notFound();
		}

		return htmlResponse(renderRun(manifest));
	},
};
