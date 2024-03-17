import * as readline from 'readline';
import { ZodError, string } from 'zod';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const URLSchema = string().url();
let URL: string;
let limit: number | undefined;
let maxRate: number;
const DEFAULT_MAX_RATE = 4; // Default maximum rate if not provided by user
const RETRY_DELAY = 1000; // Delay in milliseconds before retrying failed requests
const MAX_RETRIES = 3; // Maximum number of retries for failed requests

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer: string) => {
      resolve(answer);
    });
  });
}

async function getUserInput() {
  // cheap validation
  while (true) {
    try {
      const urlInput = await askQuestion('Enter the URL: ');
      URL = URLSchema.parse(urlInput);
      const limitInput = await askQuestion(
        'Enter limit (press enter to continuous): '
      );
      limit = limitInput ? parseInt(limitInput) : undefined;
      const maxRateInput = await askQuestion(
        'Max rate (requests per second): '
      );
      maxRate = maxRateInput ? parseInt(maxRateInput) : DEFAULT_MAX_RATE;
      break;
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('Invalid URL. Please try again.');
      } else {
        console.error(error);
      }
    }
  }
}
let totalCount = 0;
let responseTimes: number[] = [];
let histogram: number[] = new Array(5).fill(0); // there is no limit for the histogram size(not provided in the question)

async function makeRequest() {
  let tries = 0;
  while (tries < MAX_RETRIES) {
    try {
      const start = Date.now();
      const response = await fetch(URL, {
        signal: AbortSignal.timeout(5000)
      });
      if (!response.ok) {
        // if this fails im not sure if i should retry or not
        // for now i will just throw an error
        // this error could be a connection error or a 404 or 500 error
        throw new Error(response.statusText);
      }
      const end = Date.now();
      const responseTime = end - start;
      responseTimes.push(responseTime);
      updateHistogram(responseTime, histogram);
      totalCount++;
      return;
    } catch (error) {
      console.error(error);
      tries++;
      await sleep();
    }
  }
}

function updateHistogram(responseTime: number, histogram: number[]) {
  // there is no specific information on how to calculate the histogram so I am assuming that we need to divide the response time by 100 and then take the floor of it
  // and the reason why im dividing it by 100 is because the response time is in milliseconds and the histogram is in 100ms pol
  const binIndex = Math.min(
    Math.floor(responseTime / 100),
    histogram.length - 1
  );
  histogram[binIndex]++;
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
        await sleep();
      }
    } else {
      // if i don't limit this will be an infinite loop
      while (totalCount < 4) {
        await makeRequest();
        await sleep();
      }
    }

    console.log('Total requests made:', totalCount);
    console.log('Response times:', responseTimes);
    console.log('Histogram:', histogram);
  } catch (error) {
    console.error(error);
  } finally {
    rl.close();
  }
}

run();

process.stdin.on('keypress', (_str, key) => {
  if (key.ctrl && key.name === 'c') {
    process.exit();
  }
});

function sleep() {
  return new Promise((resolve) => setTimeout(resolve, RETRY_DELAY / maxRate));
}
