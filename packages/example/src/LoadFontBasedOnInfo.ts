import {getInfo} from '@remotion/google-fonts/InterTight';
import {loadFontFromInfo} from '@remotion/google-fonts/load-font-from-info';

const info = getInfo();
const {fontFamily, waitUntilDone} = loadFontFromInfo(info, 'italic');

waitUntilDone();
