'use strict';


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

  log () {
    if (this.enabled) {
      this.captureConsole(Array.from(arguments), console.log);
    }
  }

  info () {
    if (this.enabled) {
      this.captureConsole(Array.from(arguments), console.info, 'green');
    }
  }

  error () {
    // always show errors
    this.captureConsole(Array.from(arguments), console.error, 'red');
  }

  warn () {
    if (this.enabled) {
      this.captureConsole(Array.from(arguments), console.warn, 'yellow');
    }
  }

  clearConsole () {
    if (!this.capturing && this.enabled) {
      process.stdout.write('\x1bc');
    }
  }

  captureConsole (args, method, color) {
    if (this.capturing) {
      this.capturedMessages.push(chalk.stripColor(args.join(' ').trim()));
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
