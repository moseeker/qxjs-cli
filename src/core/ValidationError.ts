/**
 * @see `@lerna/validation-error`.
 */
import log from 'npmlog';

export default class ValidationError extends Error {
  prefix: string = '';

  constructor(prefix: string, message: string, ...rest: any[]) {
    super(message);
    this.name = 'ValidationError';
    this.prefix = prefix;
    log.resume(); // might be paused, noop otherwise
    log.error(prefix, message, ...rest);
  }
}
