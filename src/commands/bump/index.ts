import Command from '../../core/Command';
import fs from 'fs';
import util from 'util';
import { Manifest } from '@yarnpkg/core';
import find from 'lodash/find';
import { convertPath, PortablePath, ppath } from '@yarnpkg/fslib/lib/path';
import { xfs } from '@yarnpkg/fslib';

export interface BumpCommandConfig {}

export class BumpCommand extends Command {
  manifest: Manifest = null;
  cwd: PortablePath;

  async initialize() {
    const cwd = (this.cwd = convertPath<PortablePath>(null, process.cwd()));
    this.logger.verbose(this.name, `cwd: ${cwd.toString()}`);

    const exists = util.promisify(fs.exists);
    const isExists = await exists('package.json');
    this.logger.verbose(this.name, `is package exists: ${isExists}`);
    this.manifest = isExists ? await Manifest.find(cwd) : new Manifest();
  }

  async execute(): Promise<void> {
    if (!this.manifest || !this.manifest.name) {
      this.logger.error(this.name, `no package.json found under: ${this.cwd}`);
      return;
    }

    const pkgName = this.options.pkg;
    const pkgVersion = this.options.versionRange;

    this.logger.verbose(this.name, `new package version: ${pkgVersion}`);

    const pkgFound = find([...this.manifest.dependencies.values()], item => {
      return item.name === pkgName;
    });
    if (!pkgFound) {
      this.logger.error(
        this.name,
        `package: ${pkgName} is not found in dependencies.`
      );
      return;
    }

    const range = pkgFound.range;
    const newRange = this.updateRange(range, pkgVersion);
    pkgFound.range = newRange;
    this.manifest.dependencies.set(pkgFound.identHash, pkgFound);

    if (!this.options.dry) {
      await this.persistManifest();
    }

    this.logger.notice(this.name, `updated version range: ${newRange}`);
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

  /**
   * update the commit hash of https+git://github.com/xxx/x.git#abc like url.
   */
  updateRange(range: string, version: string): string {
    const rangeLess = range.split('#')[0];
    return `${rangeLess}#${version}`;
  }
}

export default function factory(argv: any) {
  return new BumpCommand(argv);
}
