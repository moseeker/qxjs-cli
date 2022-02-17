/**
 * The reason that we have to remove the `devDependences` of the
 * build qxjs package is because npm will install the `devDependences` in
 * the development env.
 * This will cause some dep mismatch issue.
 * Since the `devDependences` is not needed in dev env, so we can remove it safely.
 */
import { Manifest } from '@yarnpkg/core';
import { xfs } from '@yarnpkg/fslib';
import { convertPath, PortablePath, ppath } from '@yarnpkg/fslib/lib/path';
import fs from 'fs';
import util from 'util';
import { SubCommand } from '../../core/SubCommand';
import ValidationError from '../../core/ValidationError';

export interface RemovePkgDevdepConfig {
  cwd?: string;
}

export default class RemovePkgDevdepSubCmd extends SubCommand {
  manifest: Manifest = null;
  cwd: PortablePath;
  config: RemovePkgDevdepConfig = {};

  async execute(): Promise<any> {
    await this.validate();

    const oldCwd = this.enter(this.config.cwd);
    await this.initManifest();

    if (!this.manifest || !this.manifest.name) {
      this.cmd.logger.error(
        this.name,
        `no package.json found under: ${this.config.cwd}`
      );
      return;
    }

    // remove dev dependencies Map.
    // @see https://github.com/yarnpkg/berry/blob/b2c82b9aa7f5d19f3bdb3391d1af4c8dd61f656f/packages/yarnpkg-core/sources/Manifest.ts#L69
    this.manifest.devDependencies = new Map();
    if (!this.cmd.options.dry) {
      await this.persistManifest();
    }

    this.leave(oldCwd);
    this.cmd.logger.success(this.name, 'remove package devDependences done');
  }

  /**
   * Save the manifest data to file.
   */
  async persistManifest() {
    const pkgData = {};
    this.manifest.exportTo(pkgData);

    const path = ppath.join(this.cwd, Manifest.fileName);
    const content = `${JSON.stringify(pkgData, null, this.manifest.indent)}\n`;

    await xfs.changeFilePromise(path, content, {
      automaticNewlines: true
    });
  }

  async validate() {
    if (typeof this.config.cwd !== 'string') {
      throw new ValidationError(this.name, `{config}.cwd must be of string`);
    }
  }

  enter(newCwd: string): string {
    const oldCwd = process.cwd();
    const cwd = this.cmd.resolvePath(newCwd);
    process.chdir(cwd);
    this.cmd.logger.info(this.name, 'enter', process.cwd());
    return oldCwd;
  }

  leave(oldCwd: string) {
    const cwd = this.cmd.resolvePath(oldCwd);
    this.cmd.logger.info(this.name, 'leave', process.cwd());
    process.chdir(cwd);
  }

  async initManifest() {
    const cwd = (this.cwd = convertPath<PortablePath>(
      null,
      this.cmd.resolvePath(this.config.cwd)
    ));
    const exists = util.promisify(fs.exists);
    const isExists = await exists('package.json');
    this.cmd.logger.verbose(this.name, `is package exists: ${isExists}`);
    this.manifest = isExists ? await Manifest.find(cwd) : new Manifest();
  }

  async initialize(config: RemovePkgDevdepConfig) {
    this.config = config;
    this.inited_ = true;
  }
}
