const { exec } = require("node:child_process");

process.stdin.resume();

function handleSignal() {
  exec("npm run postdev", (error, stdout, stderr) => {
    if (error) {
      console.error(`Exec error: ${error}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);

    // Termina o processo de Node.js após a execução do npm run postdev
    process.exit(0); // Isso termina o processo Node.js e libera o terminal
  });
}

process.on("SIGINT", handleSignal);
