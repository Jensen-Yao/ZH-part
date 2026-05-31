#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const childProcess = require("child_process");

const TARGET = "n?.get(`enable_i18n`,!1)";
const PATCHED = "n?.get(`enable_i18n`,!0)";
const TARGET_BYTES = Buffer.from(TARGET, "utf8");
const PATCHED_BYTES = Buffer.from(PATCHED, "utf8");

if (TARGET_BYTES.length !== PATCHED_BYTES.length) {
  throw new Error("Patch strings must have identical byte length.");
}

function parseArgs(argv) {
  const args = { action: "patch", asarPath: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--verify") args.action = "verify";
    else if (arg === "--restore") args.action = "restore";
    else if (arg === "--build-patched") args.action = "build-patched";
    else if (arg === "--patch") args.action = "patch";
    else if (arg === "--asar") args.asarPath = argv[++i];
    else if (arg === "--help" || arg === "-h") args.action = "help";
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function usage() {
  console.log([
    "Usage:",
    "  node enable-official-zh.js [--patch] [--asar <path>]",
    "  node enable-official-zh.js --build-patched [--asar <path>]",
    "  node enable-official-zh.js --verify [--asar <path>]",
    "  node enable-official-zh.js --restore [--asar <path>]",
    "",
    "This patches Codex Desktop app.asar so the official webview i18n",
    "provider defaults enable_i18n to true. Restart Codex after patching.",
  ].join("\n"));
}

function compareVersions(a, b) {
  const aa = a.split(".").map((x) => Number.parseInt(x, 10) || 0);
  const bb = b.split(".").map((x) => Number.parseInt(x, 10) || 0);
  for (let i = 0; i < Math.max(aa.length, bb.length); i += 1) {
    const diff = (aa[i] || 0) - (bb[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function findInstalledAsar() {
  const appxAsar = findAsarFromAppxPackage();
  if (appxAsar) return appxAsar;

  const runningAsar = findAsarFromRunningProcess();
  if (runningAsar) return runningAsar;

  const roots = [
    path.join(process.env.ProgramFiles || "C:\\Program Files", "WindowsApps"),
    path.join(process.env["ProgramW6432"] || "C:\\Program Files", "WindowsApps"),
  ];
  const candidates = [];
  for (const root of roots) {
    let entries = [];
    try {
      entries = fs.readdirSync(root, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const match = entry.name.match(/^OpenAI\.Codex_([0-9.]+)_x64__2p2nqsd0c76g0$/);
      if (!match) continue;
      const asarPath = path.join(root, entry.name, "app", "resources", "app.asar");
      if (fs.existsSync(asarPath)) {
        candidates.push({ asarPath, version: match[1] });
      }
    }
  }
  candidates.sort((a, b) => compareVersions(b.version, a.version));
  if (candidates.length === 0) {
    throw new Error("Could not find OpenAI.Codex app.asar under WindowsApps.");
  }
  return candidates[0].asarPath;
}

function findAsarFromAppxPackage() {
  try {
    const output = childProcess.execFileSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        "(Get-AppxPackage -Name OpenAI.Codex | Select-Object -First 1 -ExpandProperty InstallLocation)",
      ],
      { encoding: "utf8", windowsHide: true },
    ).trim();
    if (!output) return null;
    const asarPath = path.join(output, "app", "resources", "app.asar");
    return fs.existsSync(asarPath) ? asarPath : null;
  } catch {
    return null;
  }
}

function findAsarFromRunningProcess() {
  try {
    const output = childProcess.execFileSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        "(Get-Process -Name Codex -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Path)",
      ],
      { encoding: "utf8", windowsHide: true },
    ).trim();
    if (!output) return null;
    const asarPath = path.join(path.dirname(output), "resources", "app.asar");
    return fs.existsSync(asarPath) ? asarPath : null;
  } catch {
    return null;
  }
}

function readAsar(buffer) {
  if (buffer.length < 16) throw new Error("File is too small to be an asar archive.");
  const headerLength = buffer.readUInt32LE(12);
  const headerStart = 16;
  const headerEnd = headerStart + headerLength;
  if (headerEnd > buffer.length) throw new Error("Invalid asar header length.");
  const headerText = buffer.slice(headerStart, headerEnd).toString("utf8");
  const header = JSON.parse(headerText);
  return { header, headerText, headerStart, headerEnd, headerLength, dataStart: headerEnd };
}

function getAppMainEntries(header) {
  const files = header.files?.webview?.files?.assets?.files;
  if (!files || typeof files !== "object") {
    throw new Error("Could not find webview/assets in asar header.");
  }
  return Object.entries(files)
    .filter(([name, entry]) => /^app-main-.*\.js$/.test(name) && entry && typeof entry.offset === "string")
    .map(([name, entry]) => ({ name, entry }));
}

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function blockHashes(buffer, blockSize) {
  if (!blockSize || buffer.length <= blockSize) return [sha256(buffer)];
  const blocks = [];
  for (let start = 0; start < buffer.length; start += blockSize) {
    blocks.push(sha256(buffer.subarray(start, Math.min(start + blockSize, buffer.length))));
  }
  return blocks;
}

function replaceAllExact(text, oldValue, newValue) {
  if (!oldValue || oldValue.length !== newValue.length) {
    throw new Error("Header replacement values must be non-empty and identical length.");
  }
  const count = text.split(oldValue).length - 1;
  if (count === 0) throw new Error(`Could not find integrity value ${oldValue} in asar header.`);
  return { text: text.split(oldValue).join(newValue), count };
}

function backupPathFor(asarPath) {
  const backupDir = path.join(__dirname, "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const versionMatch = asarPath.match(/OpenAI\.Codex_([^\\\/]+)_x64__/);
  const version = versionMatch ? versionMatch[1] : "unknown";
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return path.join(backupDir, `app.asar.${version}.official-zh.${stamp}.bak`);
}

function latestBackupFor(asarPath) {
  const backupDir = path.join(__dirname, "backups");
  if (!fs.existsSync(backupDir)) return null;
  const versionMatch = asarPath.match(/OpenAI\.Codex_([^\\\/]+)_x64__/);
  const version = versionMatch ? versionMatch[1] : "";
  const backups = fs.readdirSync(backupDir)
    .filter((name) => name.startsWith(`app.asar.${version}.official-zh.`) && name.endsWith(".bak"))
    .map((name) => path.join(backupDir, name))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return backups[0] || null;
}

function inspect(asarPath) {
  const buffer = fs.readFileSync(asarPath);
  const asar = readAsar(buffer);
  const entries = getAppMainEntries(asar.header);
  const results = [];
  for (const { name, entry } of entries) {
    const start = asar.dataStart + Number(entry.offset);
    const fileBuffer = buffer.subarray(start, start + entry.size);
    const content = fileBuffer.toString("utf8");
    const actualHash = sha256(fileBuffer);
    results.push({
      name,
      hasDisabledDefault: content.includes(TARGET),
      hasEnabledDefault: content.includes(PATCHED),
      integrityOk: !entry.integrity?.hash || entry.integrity.hash === actualHash,
      hash: entry.integrity?.hash || null,
      actualHash,
    });
  }
  return results;
}

function patch(asarPath) {
  assertCodexIsClosed(asarPath);

  const original = fs.readFileSync(asarPath);
  const prepared = preparePatchedArchive(original);
  if (prepared.status === "already-patched") {
    return { status: "already-patched", backup: null };
  }

  const backup = backupPathFor(asarPath);
  fs.writeFileSync(backup, original);

  const fd = fs.openSync(asarPath, "r+");
  try {
    for (const write of prepared.writes) {
      fs.writeSync(fd, write.buffer, 0, write.buffer.length, write.offset);
    }
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }

  const after = inspect(asarPath);
  const failed = after.filter((item) => !item.integrityOk || item.hasDisabledDefault || !item.hasEnabledDefault);
  if (failed.length > 0) {
    throw new Error(`Verification failed after patch: ${JSON.stringify(failed, null, 2)}`);
  }

  return { status: "patched", backup };
}

function preparePatchedArchive(original) {
  const asar = readAsar(original);
  const entries = getAppMainEntries(asar.header);
  let headerText = asar.headerText;
  const writes = [];
  let patchedCount = 0;

  for (const { name, entry } of entries) {
    const start = asar.dataStart + Number(entry.offset);
    const end = start + entry.size;
    const fileBuffer = Buffer.from(original.subarray(start, end));
    const targetOffset = fileBuffer.indexOf(TARGET_BYTES);
    const alreadyPatched = fileBuffer.indexOf(PATCHED_BYTES) >= 0;

    if (targetOffset < 0) {
      if (alreadyPatched) continue;
      throw new Error(`Could not find i18n switch in ${name}. Codex may have changed its bundle.`);
    }

    PATCHED_BYTES.copy(fileBuffer, targetOffset);
    const newHash = sha256(fileBuffer);
    const blockSize = entry.integrity?.blockSize || 4194304;
    const newBlocks = blockHashes(fileBuffer, blockSize);

    if (entry.integrity?.hash) {
      headerText = replaceAllExact(headerText, entry.integrity.hash, newHash).text;
    }
    const oldBlocks = Array.isArray(entry.integrity?.blocks) ? entry.integrity.blocks : [];
    if (oldBlocks.length > 0) {
      if (oldBlocks.length !== newBlocks.length) {
        throw new Error(`Unexpected block count change for ${name}.`);
      }
      for (let i = 0; i < oldBlocks.length; i += 1) {
        if (oldBlocks[i] === entry.integrity?.hash) continue;
        headerText = replaceAllExact(headerText, oldBlocks[i], newBlocks[i]).text;
      }
    }

    writes.push({ offset: start, buffer: fileBuffer });
    patchedCount += 1;
  }

  if (patchedCount === 0) {
    return { status: "already-patched", writes: [] };
  }

  const newHeader = Buffer.from(headerText, "utf8");
  if (newHeader.length !== asar.headerLength) {
    throw new Error("Asar header length changed; refusing to patch in place.");
  }

  return {
    status: "patched",
    writes: [{ offset: asar.headerStart, buffer: newHeader }, ...writes],
  };
}

function buildPatchedCopy(asarPath) {
  const original = fs.readFileSync(asarPath);
  const prepared = preparePatchedArchive(original);
  const outputDir = path.join(__dirname, "patched");
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, "app.asar");

  const patched = Buffer.from(original);
  for (const write of prepared.writes) {
    write.buffer.copy(patched, write.offset);
  }
  fs.writeFileSync(outputPath, patched);
  return { status: prepared.status, outputPath };
}

function restore(asarPath) {
  assertCodexIsClosed(asarPath);

  const backup = latestBackupFor(asarPath);
  if (!backup) throw new Error("No official-zh backup found for this Codex version.");
  const backupBuffer = fs.readFileSync(backup);
  fs.writeFileSync(asarPath, backupBuffer);
  return backup;
}

function findRunningCodexProcesses(asarPath) {
  const installRoot = path.dirname(path.dirname(path.dirname(asarPath))).toLowerCase();
  try {
    const output = childProcess.execFileSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        "Get-CimInstance Win32_Process | Where-Object { $_.Name -in @('Codex.exe','codex.exe') } | Select-Object ProcessId,Name,ExecutablePath,CommandLine | ConvertTo-Json -Depth 3",
      ],
      { encoding: "utf8", windowsHide: true },
    ).trim();
    if (!output) return [];
    const parsed = JSON.parse(output);
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    return rows.filter((row) => {
      const executablePath = String(row.ExecutablePath || "");
      const commandLine = String(row.CommandLine || "");
      return executablePath.toLowerCase().startsWith(installRoot) || commandLine.toLowerCase().includes(installRoot);
    });
  } catch {
    return [];
  }
}

function assertCodexIsClosed(asarPath) {
  const processes = findRunningCodexProcesses(asarPath);
  if (processes.length === 0) return;

  const lines = processes
    .slice(0, 12)
    .map((process) => `  PID ${process.ProcessId}: ${process.Name}`)
    .join("\n");
  throw new Error([
    "Codex is still running, so Windows keeps app.asar locked for writing.",
    lines,
    "",
    "Close all Codex windows first, or run:",
    "  taskkill /IM Codex.exe /F",
    "  taskkill /IM codex.exe /F",
    "",
    "Then run this patch command again.",
  ].join("\n"));
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.action === "help") {
    usage();
    return;
  }

  const asarPath = args.asarPath ? path.resolve(args.asarPath) : findInstalledAsar();
  console.log(`app.asar: ${asarPath}`);

  if (args.action === "verify") {
    console.log(JSON.stringify(inspect(asarPath), null, 2));
    return;
  }

  if (args.action === "restore") {
    const backup = restore(asarPath);
    console.log(`Restored from: ${backup}`);
    console.log("Restart Codex to apply the restored bundle.");
    return;
  }

  if (args.action === "build-patched") {
    const result = buildPatchedCopy(asarPath);
    if (result.status === "already-patched") {
      console.log(`Already patched. Copy written unchanged to: ${result.outputPath}`);
    } else {
      console.log(`Patched copy written to: ${result.outputPath}`);
    }
    return;
  }

  const result = patch(asarPath);
  if (result.status === "already-patched") {
    console.log("Official i18n switch is already patched.");
  } else {
    console.log(`Patched official i18n switch. Backup: ${result.backup}`);
  }
  console.log("Restart Codex to load the official Chinese package.");
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
