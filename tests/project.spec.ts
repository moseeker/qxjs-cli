import Path from 'path';
import test from 'ava';
import Project from '../src/core/Project';

const rootPath = Path.resolve('__fixtures__/project');
let project: Project;

test.beforeEach(() => {
  project = new Project('__fixtures__/project');
});

test('create project', t => {
  t.truthy(project.config);
  t.is(project.rootPath, rootPath);
});

test('get version', t => {
  t.is(project.version, '1.0.0');
});

test('get config', t => {
  t.is(project.get('config.version'), '1.0.0');
});

test('has version', t => {
  t.log(project.config);
  t.true(project.has('config.version'));
});
