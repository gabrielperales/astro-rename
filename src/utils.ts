import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import postcssRename from 'postcss-rename';

import type { AstroConfig } from 'astro';
import type { InternalRenameOptions } from './types.js';
import type { Options as PostcssRenameOptions } from 'postcss-rename';
import type { CSSOptions, UserConfig } from 'vite'; // import CSSOptions type

export const MAPS_DIRECTORY = './class-maps';

export const escapeRegExp = (string: string) =>
  string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const calculatePercent = (before: number, after: number) =>
  (100 - (after / before) * 100) | 0;

export async function* walkFiles(dir: string): AsyncGenerator<string> {
  const dirents = await readdir(dir, { withFileTypes: true });

  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);

    if (dirent.isDirectory()) yield* walkFiles(res);
    else yield res;
  }
}

export const getPostCssConfig = async (
  root: UserConfig['root'],
  postcssInlineOptions: CSSOptions['postcss'],
) => {
  let postcssConfigResult;

  // Check if postcss config is not inlined
  if (
    !(typeof postcssInlineOptions === 'object' && postcssInlineOptions !== null)
  ) {
    // TODO: Check types
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { default: postcssrc } = await import('postcss-load-config');
    const searchPath =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      typeof postcssInlineOptions === 'string' ? postcssInlineOptions : root!;

    try {
      postcssConfigResult = await postcssrc({}, searchPath);
    } catch (e) {
      postcssConfigResult = null;
    }
  }

  return postcssConfigResult;
};

export const getViteConfiguration = async (
  options: InternalRenameOptions['rename'],
  viteConfig: AstroConfig['vite'],
) => {
  // We need to manually load postcss config files because when inlining the tailwind and autoprefixer plugins,
  // that causes vite to ignore postcss config files
  const postcssConfigResult = await getPostCssConfig(
    viteConfig.root,
    viteConfig.css?.postcss,
  );
  const postcssOptions =
    (postcssConfigResult && postcssConfigResult.options) || {};
  const postcssPlugins =
    postcssConfigResult && postcssConfigResult.plugins
      ? postcssConfigResult.plugins.slice()
      : [];

  postcssPlugins.push(postcssRename(options as PostcssRenameOptions));

  return {
    css: {
      postcss: {
        options: postcssOptions,
        plugins: postcssPlugins,
      },
    },
  };
};
