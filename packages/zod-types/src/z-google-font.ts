import {getAvailableFonts} from '@remotion/google-fonts';
import {z} from 'zod';

const fonts = getAvailableFonts();
const fontImportNames = fonts.map(({importName}) => importName);

export const zGoogleFont = () => z.enum(['Roboto', ...fontImportNames]);
