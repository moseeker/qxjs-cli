import Path from 'path';
import test from 'ava';

import { resolveSourcePath } from '../src/core/utils';

test('works', t => {
  const source = './../src/**/*.scss';
  const dest = 'qxjs-dist';

  const { glob, base } = resolveSourcePath(source);
  t.is(base, './../src');
  t.is(Path.join(dest, base), 'src');
  t.truthy(glob);
});
