## `@remotion/animation-utils`

A React hook for use with [Remotion](https://remotion.dev/) that returns the current second.

### Usage

```tsx
import { useCurrentSecond } from "@remotion/animation-utils";
import { AbsoluteFill } from "remotion";

export const Example: React.FC = () => {
  const second = useCurrentSecond();

  return (
    <AbsoluteFill>
      <h1>Second: {second}</h1>
    </AbsoluteFill>
  );
};
```

## License

See the [LICENSE.md](LICENSE.md) file for the license of this repo.  
To use Remotion, a company license is needed for some entities. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
