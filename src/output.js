'use strict';

const colors = require('./utils/colors');
const chalk = require('chalk');
const getCursorPosition = require('@patrickkettner/get-cursor-position');
const readline = require('readline')

class Debugger {

  constructor () {
    this.enabled = true;
    this.capturing = false;
    this.capturedMessages = [];

    const currentPosition = getCursorPosition.sync();
    if(currentPosition && currentPosition.row) {
      this.cursorPosition = currentPosition.row;
    }
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

  info (message) {
    if (this.enabled) {
      const titleFormatted = colors.formatTitle('info', 'I');
      this.log(titleFormatted, message);
    }
  }

  note (message) {
    if (this.enabled) {
      const titleFormatted = colors.formatTitle('note', 'N');
      this.log(titleFormatted, message);
    }
  }

  title (severity, title, subtitle) {
    if (this.enabled) {
      const titleFormatted = colors.formatTitle(severity, title);
      const subTitleFormatted = colors.formatText(severity, subtitle);
      this.log(titleFormatted, subTitleFormatted);
      this.log();
    }
  }

  clearConsole () {
    if (!this.capturing && this.enabled && process.stdout.isTTY) {
      // Account for the fact that someone might clear (cmd + k for example) his terminal window
      const currentPosition = getCursorPosition.sync()
      if(currentPosition && currentPosition.row) {
        if(this.cursorPosition > currentPosition.row) {
          this.cursorPosition = currentPosition.row
        }
      }
      readline.cursorTo(process.stdout, 0, this.cursorPosition)
      readline.clearScreenDown(process.stdout)
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
      this.capturedMessages.push(chalk.stripColor(args.join(' ')).trim());
    } else {
      method.apply(console, args);
    }
  }
}

function capitalizeFirstLetter (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = new Debugger();
