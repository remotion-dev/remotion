import type {BunRequest} from 'bun';
import {renderComparison} from './comparison';
import {loadComparison} from './comparison-data';
import {serveRunFile} from './files';
import {renderHome} from './home';
import {getJob, getScenario, startComparison, startRun} from './jobs';
import {loadRun, renderRun} from './run';
import {renderScenario} from './scenario';
import {htmlResponse, json, notFound} from './shared';

export const routes = {
	'/': async () => htmlResponse(await renderHome()),

	'/api/compare/:scenarioId': {
		POST: (request: BunRequest<'/api/compare/:scenarioId'>) => {
			const scenario = getScenario(request.params.scenarioId);

			if (!scenario) {
				return json({error: 'Unknown scenario'}, {status: 404});
			}

			return json(startComparison(scenario));
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

			return json(startRun(scenario));
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
		const relativePath = decodeURIComponent(pathname.replace(/^\/files\//, ''));

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
