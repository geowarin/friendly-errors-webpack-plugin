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

  clearConsole () {
    if (!this.capturing && this.enabled) {
      process.stdout.write('\x1bc');
    }
  }

  captureLogs (fun) {
    try {
      this.capture();
      fun.call();
      return this.capturedMessages;
    } catch (e) {
      throw e;
    } finally {
      this.endCapture();
    }
  }

  captureConsole (args, method) {
    if (this.capturing) {
      this.capturedMessages.push(chalk.stripColor(args.join(' ').trim()));
    } else {
      method.apply(console, args);
    }
  }
}

module.exports = new Debugger();
