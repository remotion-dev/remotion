import { cleanFnStore } from "../../packages/lambda/src/api/mock-functions";
import { LambdaInternals } from "../../packages/lambda/src/index";

const getConsoleOutput = () => {
  // @ts-expect-error
  return process.stdout.write.mock.calls.map((c) => c[0].toString()).join("\n");
};

test("Deploy function", async () => {
  process.stdout.write = jest.fn();
  await LambdaInternals.executeCommand(["functions", "deploy"]);
  expect(getConsoleOutput()).toContain("Deployed as remotion-render-abcdef\n");
});

test("Deploy function and list it", async () => {
  cleanFnStore();
  await LambdaInternals.executeCommand(["functions", "deploy"]);
  process.stdout.write = jest.fn();
  await LambdaInternals.executeCommand(["functions", "ls"]);
  expect(getConsoleOutput()).toContain("Getting functions...");
  expect(getConsoleOutput()).toContain("Memory (MB)");
  expect(getConsoleOutput()).toMatch(
    /remotion-render-abcdef\s+(.*)\s+1024\s+120/g
  );
});

test("Deploy function and it already exists should fail", async () => {
  cleanFnStore();
  await LambdaInternals.executeCommand(["functions", "deploy"]);
  await expect(() =>
    LambdaInternals.executeCommand(["functions", "deploy"])
  ).rejects.toThrow(/Exited process with code 1/);

  expect(getConsoleOutput()).toMatch(
    /A function with version (.*) is already deployed in region us-east-1, it is called remotion-render-abcdef/
  );
});
