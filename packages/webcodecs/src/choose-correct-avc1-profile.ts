export const chooseCorrectAvc1Profile = ({
	width,
	height,
	fps,
}: {
	width: number;
	height: number;
	fps: number | null;
}) => {
	// 0x42 = Baseline profile
	// 0x4D = Main profile
	// 0x58 = Extended profile
	// 0x64 = High profile
	// According to Wikipedia, 0x64 is the most widely supported profile.
	// So we always choose 0x64.
	/**
      Ignoring lower levels of <720p, let's only support Players that can play 720p and above.
      •	Level 3.1 = 1F (hex) -> 1,280×720@30.0 (5)
      •	Level 3.2 = 20 (hex) -> 1,280×1,024@42.2 (4)
      •	Level 4.0 = 28 (hex) -> 2,048×1,024@30.0 (4)
      •	Level 4.1 = 29 (hex) -> 2,048×1,024@30.0 (4)
      •	Level 4.2 = 2A (hex) -> 2,048×1,080@60.0 (4)
      •	Level 5.0 = 32 (hex) -> 3,672×1,536@26.7 (5)
      •	Level 5.1 = 33 (hex) -> 4,096×2,304@26.7 (5)
      •	Level 5.2 = 34 (hex) -> 4,096×2,304@56.3 (5)
      •	Level 6.0 = 3C (hex) -> 8,192×4,320@30.2 (5)
      •	Level 6.1 = 3D (hex) -> 8,192×4,320@60.4 (5)
      •	Level 6.2 = 3E (hex) -> 8,192×4,320@120.8 (5)
   */
	const profiles = [
		{level: '3.1', hex: '1F', width: 1280, height: 720, fps: 30.0},
		{level: '3.2', hex: '20', width: 1280, height: 1024, fps: 42.2},
		{level: '4.0', hex: '28', width: 2048, height: 1024, fps: 30.0},
		{level: '4.1', hex: '29', width: 2048, height: 1024, fps: 30.0},
		{level: '4.2', hex: '2A', width: 2048, height: 1080, fps: 60.0},
		{level: '5.0', hex: '32', width: 3672, height: 1536, fps: 26.7},
		{level: '5.1', hex: '33', width: 4096, height: 2304, fps: 26.7},
		{level: '5.2', hex: '34', width: 4096, height: 2304, fps: 56.3},
		{level: '6.0', hex: '3C', width: 8192, height: 4320, fps: 30.2},
		{level: '6.1', hex: '3D', width: 8192, height: 4320, fps: 60.4},
		{level: '6.2', hex: '3E', width: 8192, height: 4320, fps: 120.8},
	];
	const profile = profiles.find((p) => {
		if (width > p.width) {
			return false;
		}

		if (height > p.height) {
			return false;
		}

		// if has no fps, use 60 as a conservative fallback
		const fallbackFps = fps ?? 60;
		return fallbackFps <= p.fps;
	});

	if (!profile) {
		throw new Error(
			`No suitable AVC1 profile found for ${width}x${height}@${fps}fps`,
		);
	}

	return `avc1.6400${profile.hex}`;
};
