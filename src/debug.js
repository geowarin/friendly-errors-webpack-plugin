const stripAnsi = require('strip-ansi');
const chalk = require('chalk');

class Debugger {

  constructor () {
    this.enabled = true;
    this.capturing = false;
    this.capturedMessages = [];
  }

  enable () {
    this.enabled = true;
  }

  capture () {
    this.enabled = true;
    this.capturing = true;
  }

  endCapture () {
    this.enabled = false;
    this.capturing = false;
    this.capturedMessages = [];
  }

  log (...args) {
    if (this.enabled) {
      this.captureConsole(args, console.log);
    }
  }

  info (...args) {
    if (this.enabled) {
      this.captureConsole(args, console.info, 'green');
    }
  }

  error (...args) {
    // always show errors
    this.captureConsole(args, console.error, 'red');
  }

  warn (...args) {
    if (this.enabled) {
      this.captureConsole(args, console.warn, 'yellow');
    }
  }

  clearConsole () {
    if (!this.capturing && this.enabled) {
      process.stdout.write('\x1bc');
    }
  }

  captureConsole (args, method, color) {
    if (this.capturing) {
      this.capturedMessages.push(stripAnsi(args.join(' ').trim()));
    } else {
      method.apply(console, this.colorize(args, color));
    }
  }

  colorize (array, color) {
    if (!color) {
      return array;
    }
    return array.map(e => {
      if (typeof e === 'string') {
        return chalk[color](e);
      }
      return e;
    })
  }
}

module.exports = new Debugger();
