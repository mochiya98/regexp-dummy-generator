import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { promisify } from "node:util";
import type { InputPluginOption, RollupOptions } from "rollup";
import replace from "@rollup/plugin-replace";
import dts from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";
import { minify } from "rollup-plugin-esbuild";

const UMDName = "RegExpDummyGenerator";

const sizeCompute = (): InputPluginOption => {
  const gzip = promisify(zlib.gzip);
  const formatSize = (size: number) => {
    const units = ["B", "KB", "MB", "GB"];
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };
  const collected: { format: string; raw: number; gzipped: number }[] = [];
  return {
    name: "size-compute",
    async generateBundle(options, bundle) {
      for (const [filename, bundled] of Object.entries(bundle)) {
        if (bundled.type === "chunk") {
          const gzipped = await gzip(bundled.code);
          collected.push({
            format: options.format,
            raw: bundled.code.length,
            gzipped: gzipped.length,
          });
        }
      }
    },
    closeBundle() {
      for (const { format, raw, gzipped } of collected.sort((a, b) =>
        a.format.localeCompare(b.format)
      )) {
        console.log(
          `\x1b[90mminimized ${format.padEnd(
            3,
            "m"
          )}:\x1b[0m \x1b[1;32m${formatSize(
            raw
          )}\x1b[0m / \x1b[1;35m${formatSize(gzipped)} (gzipped)\x1b[0m`
        );
      }
    },
  };
};

const emitPlayground = (): InputPluginOption => {
  return {
    name: "emit-playground",
    generateBundle(options, bundle) {
      const inputPath = path.resolve("src/playground.html");
      let html = fs.readFileSync(inputPath, "utf-8");
      html = html.replace(/"\.\.\/dist\//g, '"./');
      this.emitFile({
        type: "asset",
        fileName: "index.html",
        source: html,
      });
    },
  };
};

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/regexp_dummy_generator.esm.js",
        format: "esm",
        compact: false,
      },
      {
        file: "dist/regexp_dummy_generator.cjs.cjs",
        format: "cjs",
        compact: false,
        exports: "named",
      },
    ],
    plugins: [
      esbuild({
        exclude: ["**/__tests__", "**/*.test.ts"],
        minify: false,
        sourceMap: false,
        target: "esnext",
      }),
    ],
  },
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/regexp_dummy_generator.min.esm.js",
        format: "esm",
        compact: true,
      },
      {
        file: "dist/regexp_dummy_generator.min.cjs.cjs",
        format: "cjs",
        compact: true,
        exports: "named",
      },
      {
        file: "dist/regexp_dummy_generator.min.umd.js",
        format: "umd",
        compact: true,
        exports: "named",
        name: UMDName,
      },
    ],
    plugins: [
      replace({
        preventAssignment: false,
        "RegExpNodeType.Literal": "0",
        "RegExpNodeType.CharClass": "1",
        "RegExpNodeType.Group": "2",
        "RegExpNodeType.Backref": "3",
        "RegExpNodeType.Repeat": "4",
        "RegExpNodeType.Alt": "5",
        "RegExpNodeType.Concat": "6",
        "RegExpNodeType.Assertion": "7",
        "CharClassType.Char": "0",
        "CharClassType.Range": "1",
      }),
      esbuild({
        exclude: ["**/__tests__", "**/*.test.ts"],
        minify: false,
        sourceMap: false,
        target: "esnext",
      }),
      minify({
        sourceMap: false,
        target: "esnext",
        mangleProps: /^_/,
      }),
      sizeCompute(),
    ],
  },
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.d.ts",
      format: "es",
    },
    plugins: [dts(), emitPlayground()],
  },
] satisfies RollupOptions[];
