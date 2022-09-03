/// <reference types="@vavite/multibuild/vite-config" />

import { BuildOptions, InlineConfig, ResolvedConfig } from "vite";
import multibuild from "@vavite/multibuild";
import { version } from "../package.json";
import pico from "picocolors";
import { cleanOptions, GlobalCLIOptions, HattipCliOptions } from ".";
import { hattip } from "./vite-plugin";

export async function build(
  hattipEntry: string | undefined,
  rawOptions: BuildOptions & GlobalCLIOptions & HattipCliOptions,
) {
  const { root, node: nodeEntry, client: clientEntry, ...options } = rawOptions;
  delete (options as any).C;
  const buildOptions: BuildOptions = cleanOptions(options);

  (globalThis as any).__hattip_cli_options__ = {
    hattipEntry,
    nodeEntry,
    clientEntries: clientEntry,
  };

  let config: ResolvedConfig;
  let total: number;

  function logStep(index: number, name: string) {
    config.logger.info(
      "\n" +
        pico.green("HatTip") +
        ": " +
        name +
        " (" +
        pico.green(`${index}/${total}`) +
        ")",
    );
  }

  const inlineConfig: InlineConfig = {
    root,
    base: options.base,
    mode: options.mode,
    configFile: options.config,
    logLevel: options.logLevel,
    clearScreen: options.clearScreen,
    build: buildOptions,
  };

  await multibuild(inlineConfig, {
    onMissingConfigFile() {
      inlineConfig.plugins = [
        hattip({
          hattipEntry,
          nodeEntry,
          clientEntries: clientEntry,
        }),
      ];
      return inlineConfig;
    },

    onInitialConfigResolved(resolvedConfig) {
      config = resolvedConfig;

      if (!config.plugins.some((p) => p.name === "hattip:inject-config")) {
        throw new Error("Please add HatTip Vite plugin to your Vite config");
      }

      config.logger.info(pico.green("\n🎩 HatTip ") + pico.magenta(version));

      total = config.buildSteps?.length || 1;
    },

    onStartBuildStep(info) {
      logStep(info.currentStepIndex + 1, "Building " + info.currentStep.name);
    },
  });
}
