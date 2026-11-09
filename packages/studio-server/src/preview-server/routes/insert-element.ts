import type {
	InsertElementRequest,
	InsertElementResponse,
} from '@remotion/studio-shared';
import {installElement} from '../../install-element';
import type {ApiHandler} from '../api-types';

export const insertElementHandler: ApiHandler<
	InsertElementRequest,
	InsertElementResponse
> = ({
	input,
	entryPoint,
	remotionRoot,
	logLevel,
	publicDir,
	binariesDirectory,
}) =>
	installElement({
		...input,
		entryPoint,
		remotionRoot,
		logLevel,
		publicDir,
		binariesDirectory,
		// Studio installs missing dependencies from the browser beforehand, so it
		// can show progress notifications and queue them with other installations.
		installDependencies: false,
		studio: true,
	});
