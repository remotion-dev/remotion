import {setForceDisableHtmlInCanvasForTesting} from '../html-in-canvas';

// Screenshot tests cover Remotion's built-in DOM composer. Chromium's native
// HTML-in-canvas implementation has separate, explicitly opted-in tests.
setForceDisableHtmlInCanvasForTesting(true);
