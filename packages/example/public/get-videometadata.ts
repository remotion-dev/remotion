import {getVideoMetadata} from '@remotion/renderer';

const data = await getVideoMetadata('./bigbuckbunny.mp4');
console.log(data);
