export const getCheckerboardBackgroundSize = (size: number) =>
	`${size}px ${size}px`;
export const getCheckerboardBackgroundPos = (size: number) =>
	`0 0, ${size / 2}px 0, ${size / 2}px -${size / 2}px, 0px ${size / 2}px`;

export const checkerboardBackgroundColor = (checkerboard: boolean) => {
	if (checkerboard) {
		return 'white';
	}

	return 'black';
};

export const checkerboardBackgroundImage = (checkerboard: boolean) => {
	if (checkerboard) {
		return `
     linear-gradient(
        45deg,
        rgba(0, 0, 0, 0.1) 25%,
        transparent 25%
      ),
      linear-gradient(135deg, rgba(0, 0, 0, 0.1) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, rgba(0, 0, 0, 0.1) 75%),
      linear-gradient(135deg, transparent 75%, rgba(0, 0, 0, 0.1) 75%)
    `;
	}

	return undefined;
};
