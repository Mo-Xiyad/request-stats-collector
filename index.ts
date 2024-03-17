const DEFAULT_MAX_RATE = 4; // Default maximum rate if not provided by user
const RETRY_DELAY = 1000; // Delay in milliseconds before retrying failed requests
const MAX_RETRIES = 3; // Maximum number of retries for failed requests

let url =
  'https://clerk.com/docs/references/nextjs/read-session-data#app-router';
let limit = 2;
let maxRate = 2;

let totalCount = 0;
let responseTimes: number[] = [];

async function makeRequest() {
  try {
    const start = Date.now();
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const end = Date.now();
    const responseTime = end - start;
    responseTimes.push(responseTime);
    totalCount++;
  } catch (error) {
    console.error(error);
  }
}

async function run() {
  try {
    console.log(`Starting request URL: ${url}`);
    console.log(`Limit: ${limit !== undefined ? limit : 'Continuous'}`);
    console.log(`Max rate: ${maxRate} requests per second`);

    if (limit) {
      for (let i = 0; i < limit; i++) {
        await makeRequest();
      }
    } else {
      while (true) {
        await makeRequest();
      }
    }
    console.log('Total requests made:', totalCount);
    console.log('Response times:', responseTimes);
  } catch (error) {
    console.error(error);
  }
}

run();
