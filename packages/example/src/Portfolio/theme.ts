import {loadFont as loadInstrumentSerif} from '@remotion/google-fonts/InstrumentSerif';
import {loadFont as loadInterTight} from '@remotion/google-fonts/InterTight';
import {loadFont as loadJetBrainsMono} from '@remotion/google-fonts/JetBrainsMono';

export const {fontFamily: sans} = loadInterTight('normal', {
	weights: ['500', '600', '700', '800', '900'],
	subsets: ['latin'],
});

export const {fontFamily: serif} = loadInstrumentSerif('italic', {
	weights: ['400'],
	subsets: ['latin'],
});

export const {fontFamily: mono} = loadJetBrainsMono('normal', {
	weights: ['400', '500', '700'],
	subsets: ['latin'],
});

export const colors = {
	ink: '#0B0B0F',
	paper: '#F3EFE6',
	accent: '#FF4A1C',
} as const;

// The reel is cut to 120 BPM: one beat is 15 frames at 30 fps.
export const BEAT = 15;
