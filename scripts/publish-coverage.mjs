import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const coverageRoot = "coverage";
const pythonCoverage = join(coverageRoot, "python");
const nodeCoverage = join(coverageRoot, "node-v8");

rmSync(coverageRoot, { force: true, recursive: true });
mkdirSync(pythonCoverage, { recursive: true });
mkdirSync(nodeCoverage, { recursive: true });

execFileSync(
  "python3",
  [
    "-m",
    "trace",
    "--count",
    "--summary",
    "--coverdir",
    pythonCoverage,
    "scripts/python_coverage_runner.py",
  ],
  {
    env: { ...process.env, PYTHONPATH: "backend", PYTHONPYCACHEPREFIX: ".pycache" },
    stdio: "inherit",
  },
);

execFileSync("node", ["--test", "tests/rendered-html.test.mjs"], {
  env: { ...process.env, NODE_V8_COVERAGE: nodeCoverage },
  stdio: "inherit",
});

const pythonFiles = readdirSync(pythonCoverage).filter((file) => file.endsWith(".cover"));
const nodeFiles = readdirSync(nodeCoverage).filter((file) => file.endsWith(".json"));
const pythonRuntimeCoverage = pythonFiles
  .filter((file) => file.includes("agentic"))
  .map((file) => {
    const content = readFileSync(join(pythonCoverage, file), "utf8");
    const executable = content
      .split("\n")
      .filter((line) => /^\s*\d+:/.test(line) || /^\s*>>>>>>/.test(line)).length;
    const missed = content.split("\n").filter((line) => line.includes(">>>>>>")).length;
    return {
      file,
      executable,
      missed,
      covered: Math.max(0, executable - missed),
    };
  });

const summary = {
  generatedAt: new Date().toISOString(),
  python: {
    artifactDir: pythonCoverage,
    files: pythonFiles.length,
    runtimeFiles: pythonRuntimeCoverage,
  },
  node: {
    artifactDir: nodeCoverage,
    v8Files: nodeFiles.length,
  },
  commands: [
    "python3 -m trace --count --summary --coverdir coverage/python scripts/python_coverage_runner.py",
    "NODE_V8_COVERAGE=coverage/node-v8 node --test tests/rendered-html.test.mjs",
  ],
};

writeFileSync(join(coverageRoot, "coverage-summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
writeFileSync(
  join(coverageRoot, "README.md"),
  [
    "# Coverage Artifacts",
    "",
    `Generated at: \`${summary.generatedAt}\``,
    "",
    "## Python Backend",
    "",
    `Trace artifacts: \`${pythonCoverage}\``,
    "",
    "| File | Covered lines | Missed lines |",
    "| --- | ---: | ---: |",
    ...pythonRuntimeCoverage.map((file) => `| ${file.file} | ${file.covered} | ${file.missed} |`),
    "",
    "## React / API Proxy",
    "",
    `V8 coverage artifacts: \`${nodeCoverage}\``,
    "",
    `V8 JSON files: \`${nodeFiles.length}\``,
    "",
  ].join("\n"),
);

console.log(`Coverage artifacts published under ${coverageRoot}/.`);
