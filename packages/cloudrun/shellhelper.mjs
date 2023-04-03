
import { exec, spawn } from "child_process";

// execute a single shell command where "cmd" is a string
const shellExec = function(cmd, cb){
  // this would be way easier on a shell/bash script :P
  const parts = cmd.split(/\s+/g);
  const p = spawn(parts[0], parts.slice(1), {stdio: 'inherit'});
  p.on('exit', (code)=> {
      let err = null;
      if (code) {
          err = new Error('command "'+ cmd +'" exited with wrong status code "'+ code +'"');
          err.code = code;
          err.cmd = cmd;
      }

      if (cb) cb(err);
  });
};


// execute multiple commands in series
// this could be replaced by any flow control lib
const shellSeries = function(cmds, cb){
  const execNext = function(){
      exec(cmds.shift(), (err)=> {
          if (err) {
              cb(err);
          } else if (cmds.length) execNext();
              else cb(null);
      });
  };

  execNext();
};

export {shellExec, shellSeries}