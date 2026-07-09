import type {VirtualProject} from '../types';

export const blankTemplateFiles = {
	'/project/src/index.ts': `import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
`,
	'/project/src/Root.tsx': `import { Composition } from "remotion";
import { MyComposition } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        durationInFrames={60}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
`,
	'/project/src/Composition.tsx': `export const MyComposition = () => {
  return null;
};
`,
	'/project/package.json': `{
  "name": "template-empty",
  "version": "1.0.0",
  "description": "My Remotion video",
  "scripts": {
    "dev": "remotion studio",
    "build": "remotion bundle",
    "upgrade": "remotion upgrade",
    "lint": "eslint src && tsc"
  },
  "repository": {},
  "license": "UNLICENSED",
  "dependencies": {
    "@remotion/cli": "workspace:*",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "remotion": "workspace:*"
  },
  "devDependencies": {
    "@remotion/eslint-config-flat": "workspace:*",
    "@types/react": "19.2.7",
    "@types/web": "0.0.166",
    "eslint": "9.19.0",
    "prettier": "3.8.1",
    "typescript": "5.9.3"
  },
  "private": true
}
`,
	'/project/tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2018",
    "module": "commonjs",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "lib": ["es2015"],
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noUnusedLocals": true
  },
  "exclude": ["remotion.config.ts"]
}
`,
} as const;

export const createBlankTemplateProject = (): VirtualProject => ({
	rootDir: '/project',
	entryPoint: '/project/src/index.ts',
	files: {...blankTemplateFiles},
});
