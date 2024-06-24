require("dotenv").config();

const Bot = require("./structures/bot.js");
const simpleGit = require("simple-git");
const path = require("path");
const fs = require("fs");
const readline = require("readline");
const moment = require("moment");
const chalk = require("chalk");
function startHexalon() {
  const client = new Bot();
  client.connect(process.env.TOKEN);
  client.setMaxListeners(100);
}

if (!fs.existsSync("./node_modules/bugsy")) {
  const git = simpleGit();
  git
    .clone(
      "https://github.com/hexalon-discord/bugsy.git",
      "./node_modules/bugsy"
    )
    .then(() => {
      console.log(
        chalk.magenta(
          `[BUGSY][${moment().format("DD-MM-YYYY kk:mm:ss")}]: Bugsy downloaded`
        )
      );
      startHexalon();
    })
    .catch((err) =>
      console.log(
        chalk.red(
          `[BUGSY ERROR][${moment().format("DD-MM-YYYY kk:mm:ss")}]: ${err}`
        )
      )
    );
} else {
  const repoPath = path.resolve("./node_modules/bugsy");
  const lcgit = simpleGit(repoPath);

  async function getRemoteCommitSha() {
    const url = `https://api.github.com/repos/hexalon-discord/bugsy/commits/main`;
    const response = await fetch(url, {
      headers: { Accept: "application/vnd.github.v3+json" },
    });
    const data = await response.json();
    return data.sha;
  }

  async function getLocalCommitSha() {
    const log = await lcgit.log(["-1"]);
    return log.latest.hash;
  }

  async function checkBugsy() {
    try {
      const remoteSha = await getRemoteCommitSha();
      const localSha = await getLocalCommitSha();

      if (remoteSha !== localSha) {
        function updateBugsy() {
          const git = simpleGit();
          fs.rm("./node_modules/bugsy", { recursive: true }, (err) => {
            if (err) {
              console.log(
                chalk.red(
                  `[BUGSY ERROR][${moment().format(
                    "DD-MM-YYYY kk:mm:ss"
                  )}]: ${err}`
                )
              );
              return;
            }
            console.log(
              chalk.magenta(
                `[BUGSY][${moment().format(
                  "DD-MM-YYYY kk:mm:ss"
                )}]: Old directory deleted succesfully`
              )
            );
          });
          git
            .clone(
              "https://github.com/hexalon-discord/bugsy.git",
              "./node_modules/bugsy"
            )
            .then(() => {
              console.log(
                chalk.magenta(
                  `[BUGSY][${moment().format(
                    "DD-MM-YYYY kk:mm:ss"
                  )}]: updated succesfully`
                )
              );
              startHexalon();
            })
            .catch((err) =>
              console.log(
                chalk.red(
                  `[BUGSY ERROR][${moment().format(
                    "DD-MM-YYYY kk:mm:ss"
                  )}]: ${err}`
                )
              )
            );
        }

        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        const timeout = setTimeout(() => {
          console.log(
            chalk.magenta(
              `[BUGSY][${moment().format(
                "DD-MM-YYYY kk:mm:ss"
              )}]: No response received. Proceeding with the update...`
            )
          );
          updateBugsy();
          rl.close();
        }, 20000);

        rl.question(
          chalk.magenta(`[BUGSY] Outdated, update bugsy? Y/N\n`),
          function (answer) {
            clearTimeout(timeout);
            if (answer.toLowerCase() === "y") {
              updateBugsy();
            }
          }
        );
      } else {
        console.log(
          chalk.magenta(
            `[BUGSY][${moment().format(
              "DD-MM-YYYY kk:mm:ss"
            )}]: Bugsy up-to-date`
          )
        );
        startHexalon();
      }
    } catch (err) {
      console.log(
        chalk.red(
          `[BUGSY ERROR][${moment().format("DD-MM-YYYY kk:mm:ss")}]: ${err}`
        )
      );
    }
  }
  checkBugsy();
}
