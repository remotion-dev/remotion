# Variable Fonts Support

This package now includes support for variable fonts from Google Fonts, with detailed axis information for popular variable fonts.

## Features

- **Font Detection**: Automatically identifies variable fonts and marks them with `isVariable: true`
- **Axis Information**: Provides detailed axis data including tag, name, min, max, and default values
- **30+ Supported Fonts**: Includes axis data for popular variable fonts like Inter, Roboto Flex, Open Sans, etc.

## Font Type Definition

```typescript
export type FontAxis = {
  tag: string;      // CSS font-variation-settings tag (e.g., 'wght', 'wdth')
  name: string;     // Human-readable name (e.g., 'Weight', 'Width')
  min: number;      // Minimum value for this axis
  max: number;      // Maximum value for this axis
  default: number;  // Default value for this axis
};

export type Font = {
  // ... existing properties
  isVariable: boolean;     // Whether this is a variable font
  axes?: FontAxis[];       // Array of available axes (only for variable fonts)
};
```

## Supported Variable Fonts

The following variable fonts include detailed axis information:

- **Inter** - Weight (100-900)
- **Roboto Flex** - 13 axes including Weight, Width, Slant, Optical Size, Grade, and more
- **Recursive** - Casual, Cursive, Monospace, Slant, Weight
- **Open Sans** - Width, Weight
- **DM Sans** - Optical Size, Weight
- **Playfair Display** - Optical Size, Weight
- **Source Sans 3** - Weight
- **Work Sans** - Weight
- **Fira Code** - Weight
- And 20+ more popular variable fonts

## Usage Example

```typescript
import { googleFonts } from '@remotion/google-fonts';

// Find variable fonts
const variableFonts = googleFonts.filter(font => font.isVariable);

// Get axis information for Inter
const inter = googleFonts.find(font => font.family === 'Inter');
if (inter?.isVariable && inter.axes) {
  console.log(inter.axes);
  // Output: [{ tag: 'wght', name: 'Weight', min: 100, max: 900, default: 400 }]
}
```

## API Key Requirement

To update the database, you need a Google Fonts API key. The script will stop gracefully if:
- No API key is provided
- API key is invalid
- Access is denied

Set your API key in the environment:
```bash
export GOOGLE_FONTS_API_KEY=your_api_key_here
```