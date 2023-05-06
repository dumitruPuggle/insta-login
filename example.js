const { IgApiClient } = require("instagram-private-api");
require("dotenv").config();

const { writeFile } = require("fs/promises");

async function instaSessionSave(data) {
  console.log("Saving IG Session");
  try {
    // Get a promise
    const promise = writeFile("login-data.txt", JSON.stringify(data));
    // Wait while the promise is being delivered to you.
    await promise;
    console.log("Saved IG Session");
  } catch (err) {
    console.error(err);
  }
  return data;
}

const ig = new IgApiClient();
// You must generate device id's before login.
// Id's generated based on seed
// So if you pass the same value as first argument - the same id's are generated every time
ig.state.generateDevice(process.env.IG_USERNAME);
// Optionally you can setup proxy url
ig.state.proxyUrl = process.env.IG_PROXY;
const cookies = new Promise((resolve, reject) => {
  // Execute all requests prior to authorization in the real Android application
  // Not required but recommended
  (async () => {
    await ig.simulate.preLoginFlow();
    ig.request.end$.subscribe(async () => {
      const serialized = await ig.state.serialize();
      resolve(JSON.parse(serialized.cookies));
    });
    await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);

    // The same as preLoginFlow()
    // Optionally wrap it to process.nextTick so we dont need to wait ending of this bunch of requests
    process.nextTick(async () => await ig.simulate.postLoginFlow());
  })();
});

cookies.then((output) => {
  try {
    console.log({
      cookies: output.cookies,
    });
  } catch (e) {}
});
