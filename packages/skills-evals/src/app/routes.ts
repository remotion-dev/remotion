import type {BunRequest} from 'bun';
import {renderComparison} from './comparison';
import {loadComparison} from './comparison-data';
import {serveRunFile} from './files';
import {renderHome} from './home';
import {getJob, getScenario, startComparison} from './jobs';
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
};
