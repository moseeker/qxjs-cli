import Path from 'path';
import test from 'ava';

import { resolveSourcePath } from '../src/core/utils';

test('works for string', t => {
  const source = './../src/**/*.scss';

  const { base } = resolveSourcePath(source);
  t.is(base, '');
});

test('works for glob source', t => {
  const source = {
    glob: './../src/**/*.scss',
    base: 'abc'
  };

  const { base } = resolveSourcePath(source);
  t.is(base, source.base);
});
