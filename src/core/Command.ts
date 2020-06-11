import log, { Logger } from 'npmlog'
import { CommandOption, CommandArgv } from './utils'
import Project from './Project'

const cliPrefix = 'qxjs'

type OnResolved = (value: any) => any
type OnRejected = (err: Error) => PromiseLike<Error>

export default class Command {
  options: CommandOption = {}
  name: string
  runner: Promise<any>
  project?: Project
  readonly argv: CommandArgv

  constructor(cmdArgv: CommandArgv) {
    const argv = (this.argv = Object.assign({}, cmdArgv))
    this.name = this.constructor.name.replace(/Command$/, '').toLowerCase()

    log.pause()
    log.heading = cliPrefix
    log.silly(cliPrefix, 'argv', this.argv)

    this.runner = new Promise((resolve, reject) => {
      let chain = Promise.resolve()
      chain = chain.then(() => {
        this.project = new Project(this.argv.cwd)
      })
      chain = chain.then(() => this.configureLogging())

      chain.then(
        result => {
          resolve(result)
        },
        err => {
          reject(err)
        }
      )
    })

    if (argv.onResolved || argv.onRejected) {
      this.runner = this.runner.then(argv.onResolved, argv.onRejected)

      delete argv.onResolved // eslint-disable-line no-param-reassign
      delete argv.onRejected // eslint-disable-line no-param-reassign
    }
  }

  get logger(): Logger {
    return log['newGroup'](this.name) as Logger
  }

  then(onResolved: OnResolved, onRejected: OnRejected) {
    return this.runner.then(onResolved, onRejected)
  }

  catch(onRejected: OnRejected) {
    return this.runner.catch(onRejected)
  }

  configureLogging() {
    const { loglevel } = this.options
    if (loglevel) {
      log.level = loglevel
    }

    log.addLevel('success', 3001, { fg: 'green', bold: true })
    log.resume()
  }

  enableProgressBar() {
    if (this.options.progress !== false) {
      log.enableProgress()
    }
  }
}
