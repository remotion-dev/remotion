import {getInfo} from '@remotion/google-fonts/InterTight';
import {loadFontFromInfo} from '@remotion/google-fonts/from-info';

const info = getInfo();
const {fontFamily, waitUntilDone} = loadFontFromInfo(info, 'italic');

console.log(fontFamily);
waitUntilDone();
