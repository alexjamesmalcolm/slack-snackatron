const fetch = require("node-fetch");

const test = () =>
  new Promise((resolve, reject) => {
    let iteration = 0;
    const limit = 5;
    const intervalId = setInterval(() => {
      iteration++;
      console.log(iteration);
      fetch("http://localhost:8000")
        .then(() => {
          resolve("Success");
          clearInterval(intervalId);
        })
        .catch((e) => {
          if (iteration > limit) {
            console.error(
              `Limit of ${limit} seconds has been reached without success`
            );
            console.error(e);
            clearInterval(intervalId);
            reject(e);
            throw new Error(e);
          }
        });
    }, 1000);
  });

test();
