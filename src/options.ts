import type { RenameOptions } from './types.js';

export const defaultOptions = {
  rename: {
    strategy: 'minimal',
    by: 'whole',
  },
  targetExt: ['html', 'js'],
  matchClasses: (key: string) => `(:^|[^-&;:_])(${key})(?![a-zA-Z0-9_-])(:$|[^-&;:_\./])`,
} satisfies RenameOptions;
