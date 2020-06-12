import log from 'npmlog';
import Path from 'path';
import get from 'lodash/get';
import has from 'lodash/has';
import { cosmiconfigSync } from 'cosmiconfig';
import ValidationError from './ValidationError';

export interface ProjectConfig {
  [key: string]: any;
}

export default class Project {
  cwd: string;
  config_?: ProjectConfig;
  rootConfigLocation?: string;
  rootPath?: string;

  /**
   * @param {String} cwd - Current working directory.
   * @return {Project}
   */
  constructor(cwd: string) {
    this.cwd = cwd;
    log.verbose('cwd', cwd);

    const explore = cosmiconfigSync('qxjs', {
      searchPlaces: ['qxjs.config.js', 'qxjs.config.json', 'package.json'],
      transform(obj) {
        if (!obj) {
          log.error(
            'qxjs',
            `couldn't find config in cwd: ${Path.resolve(cwd || '.')}`
          );

          return {
            config: {},
            filepath: Path.resolve(cwd || '.', 'qxjs.config.js')
          };
        }

        return obj;
      }
    });

    try {
      const result = explore.search(cwd);
      this.config_ = result.config;
      this.rootConfigLocation = result.filepath;
      this.rootPath = Path.dirname(result.filepath);

      log.verbose('rootPath', this.rootPath);
    } catch (err) {
      if (err.name === 'JSONError') {
        throw new ValidationError(err.name, err.message);
      }

      throw err;
    }
  }

  get version() {
    return this.config.version;
  }

  set version(val: string) {
    if (!this.config_) {
      log.verbose('set version', 'config not loaded');
      return;
    }
    this.config_.version = val;
  }

  /**
   * Project configuration.
   */
  get config() {
    return this.config_ || {};
  }

  /**
   * Easy access helper.
   */
  get<T = unknown>(
    keyPath: string | (string | number)[],
    defaultValue?: any
  ): T {
    const bag = {
      config: this.config
    };

    return get(bag, keyPath, defaultValue) as T;
  }

  has(keyPath: string): boolean {
    const bag = {
      config: this.config
    };

    return has(bag, keyPath);
  }
}
