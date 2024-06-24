const moment = require("moment");
const chalk = require("chalk");

module.exports = class Logger {
    static log(msg) {
          console.log(chalk.blue(`[LOG][${moment().format("DD-MM-YYYY kk:mm:ss")}]: ${msg}`));
    }

    static warn(msg) {
        console.log(chalk.yellow(`[WARNING][${moment().format("DD-MM-YYYY kk:mm:ss")}]: ${msg}`));
    }

    static error(msg) {
        console.log(chalk.red(`[ERROR][${moment().format("DD-MM-YYYY kk:mm:ss")}]: ${msg}`));
    }

    static client(msg) {
        console.log(chalk.green(`[CLIENT][${moment().format("DD-MM-YYYY kk:mm:ss")}]: ${msg}`));
    }
}