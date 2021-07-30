import {Vector3} from '@react-three/fiber';

// The distance from which the camera is pointing to the phone.
export const CAMERA_DISTANCE = 2.5;

// A small number to avoid z-index flickering
export const Z_FLICKER_PREVENTION = 0.001;

// Shininess of the phone
export const PHONE_SHININESS = 30;

// In how many segments the phone rounded corners
// are divided. Increase number for smoother phone
export const PHONE_CURVE_SEGMENTS = 8;

// The color of the phone, like a hex color but as a number
// e.g. "#41a7f5" -> 0x41a7f5
export const PHONE_COLOR = 0x41a7f5;

// Calculate phone size. Whichever side is smaller gets
// normalized to the base scale.
const getPhoneHeight = (aspectRatio: number, baseScale: number): number => {
	if (aspectRatio > 1) {
		return baseScale;
	}
	return baseScale / aspectRatio;
};

const getPhoneWidth = (aspectRatio: number, baseScale: number): number => {
	if (aspectRatio < 1) {
		return baseScale;
	}
	return baseScale * aspectRatio;
};

type Layout = {
	position: Vector3;
	height: number;
	width: number;
	radius: number;
};

type PhoneLayout = {
	phone: Layout & {
		thickness: number;
		bevel: number;
	};
	screen: Layout;
};

export const getPhoneLayout = (
	// I recommend building the phone layout based
	// on the aspect ratio of the phone
	aspectRatio: number,
	// This value can be increased or decreased to tweak the
	// base value of the phone.
	baseScale: number
): PhoneLayout => {
	// The depth of the phone body
	const phoneThickness = baseScale * 0.15;

	// How big the border of the phone is.
	const phoneBevel = baseScale * 0.04;

	// The inner radius of the phone, aka the screen radius
	const screenRadius = baseScale * 0.07;

	const phoneHeight = getPhoneHeight(aspectRatio, baseScale);
	const phoneWidth = getPhoneWidth(aspectRatio, baseScale);
	const phonePosition: Vector3 = [-phoneWidth / 2, -phoneHeight / 2, 0];
	const screenWidth = phoneWidth - phoneBevel * 2;
	const screenHeight = phoneHeight - phoneBevel * 2;
	const screenPosition: Vector3 = [
		-screenWidth / 2,
		-screenHeight / 2,
		phoneThickness + Z_FLICKER_PREVENTION,
	];

	// Define the outer radius of the phone.
	// It looks better if the outer radius is a bit bigger than the screen radios,
	// formula taken from https://twitter.com/joshwcomeau/status/134978208002102886
	const phoneRadius =
		screenRadius + (getPhoneWidth(aspectRatio, baseScale) - screenWidth) / 2;

	return {
		phone: {
			position: phonePosition,
			height: phoneHeight,
			width: phoneWidth,
			radius: phoneRadius,
			thickness: phoneThickness,
			bevel: phoneBevel,
		},
		screen: {
			position: screenPosition,
			height: screenHeight,
			width: screenWidth,
			radius: screenRadius,
		},
	};
};
