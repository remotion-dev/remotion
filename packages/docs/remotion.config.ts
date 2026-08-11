import path from 'path';
import {Config} from '@remotion/cli/config';

Config.setPublicDir(path.join(process.cwd(), 'static'));
