# @remotion/skills-evals

## Usage

This internal package runs one-shot skill evaluations and lets you inspect the
result, tool calls, and skill-routing behavior in a web UI.

1. Install Pi:

   ```sh
   npm install -g --ignore-scripts @earendil-works/pi-coding-agent
   ```

2. Start Pi, run `/login`, and connect a ChatGPT subscription or another model
   provider:

   ```sh
   pi
   ```

3. From the repository root, open this package:

   ```sh
   cd packages/skills-evals
   ```

4. Add a scenario to [`scenarios.ts`](./scenarios.ts). You can also ask an agent
   to define it.

5. Start the web UI:

   ```sh
   bun run dev
   ```

6. Open [http://localhost:4321](http://localhost:4321), select the scenario,
   and run it.
