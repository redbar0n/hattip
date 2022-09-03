import { PluginOption, UserConfig } from "vite";
import { injectConfig } from "./vite-plugins/inject-config";
import vaviteConnect from "@vavite/connect";
import { defaultNodeEntry } from "./vite-plugins/default-node-entry";

interface HattipOptions {
  hattipEntry?: string;
  nodeEntry?: string;
  extraServerEntries?: string | string[] | Record<string, string>;
  clientEntries?: string | string[] | Record<string, string>;
  clientConfig?: UserConfig;
  serverConfig?: UserConfig;
}

export function hattip(options: HattipOptions = {}): PluginOption {
  const cliOptions = (globalThis as any).__hattip_cli_options__;

  options.hattipEntry = options.hattipEntry ?? cliOptions?.hattipEntry;
  options.nodeEntry = options.nodeEntry ?? cliOptions?.nodeEntry;
  options.clientEntries = options.clientEntries ?? cliOptions?.clientEntries;

  const hasClient = !!(options.clientConfig || options.clientEntries);

  return [
    injectConfig(options),
    defaultNodeEntry({ hattipEntry: options.hattipEntry }),
    vaviteConnect({
      handlerEntry: options.nodeEntry || "virtual:hattip:default-node-entry",
      serveClientAssetsInDev: hasClient,
      clientAssetsDir: hasClient ? "dist/client" : undefined,
    }),
  ];
}
