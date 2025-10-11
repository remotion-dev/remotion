import {createComposition, createStill} from './api/create-composition';

export {
	deleteStaticFile,
	DeleteStaticFileResponse,
} from './api/delete-static-file';
export {focusDefaultPropsPath} from './api/focus-default-props-path';
export {getStaticFiles, StaticFile} from './api/get-static-files';
export {goToComposition} from './api/go-to-composition';
export {UpdateDefaultPropsFunction} from './api/helpers/calc-new-props';
export {pause} from './api/pause';
export {play} from './api/play';
export {reevaluateComposition} from './api/reevaluate-composition';
export {restartStudio} from './api/restart-studio';
export {saveDefaultProps} from './api/save-default-props';
export {seek} from './api/seek';
export {toggle} from './api/toggle';
export {updateDefaultProps} from './api/update-default-props';
export {visualControl} from './api/visual-control';
export {watchPublicFolder} from './api/watch-public-folder';
export {watchStaticFile} from './api/watch-static-file';
export {writeStaticFile} from './api/write-static-file';

export const StudioInternals = {
	createComposition,
	createStill,
};
