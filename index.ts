import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let URL: string;
let limit: number | undefined;
let maxRate: number;
const DEFAULT_MAX_RATE = 4; // Default maximum rate if not provided by user
const RETRY_DELAY = 1000; // Delay in milliseconds before retrying failed requests
const MAX_RETRIES = 3; // Maximum number of retries for failed requests

async function getUserInput() {
  URL = await askQuestion('Enter the URL: ');
  const limitInput = await askQuestion(
    'Number of requests (press enter for continuous monitoring): '
  );
  limit = limitInput ? parseInt(limitInput) : undefined;
  const maxRateInput = await askQuestion(
    'Maximum rate (requests per second): '
  );
  maxRate = maxRateInput ? parseInt(maxRateInput) : DEFAULT_MAX_RATE;
}

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer: string) => {
      resolve(answer);
    });
  });
}

let totalCount = 0;
let responseTimes: number[] = [];

async function makeRequest() {
  let tries = 0;
  while (tries < MAX_RETRIES) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const start = Date.now();
      const response = await fetch(URL, {
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const end = Date.now();
      const responseTime = end - start;
      responseTimes.push(responseTime);
    } catch (error) {
      console.error(error);
    }
  }
}
async function run() {
  try {
    await getUserInput();

    console.log(`Starting request URL: ${URL}`);
    console.log(`Limit: ${limit !== undefined ? limit : 'Continuous'}`);
    console.log(`Max rate: ${maxRate} requests per second`);

    if (limit) {
      for (let i = 0; i < limit; i++) {
        await makeRequest();
        await new Promise((resolve) => setTimeout(resolve, 1000 / maxRate)); // rate limiting
      }
    } else {
      while (true) {
        // while (limit === undefined && totalCount < 1) {
        await makeRequest();
        await new Promise((resolve) => setTimeout(resolve, 1000 / maxRate));
      }
    }
    console.log('Total requests made:', totalCount);
    console.log('Response times:', responseTimes);
  } catch (error) {
    console.error(error);
  } finally {
    rl.close();
  }
}

run();
