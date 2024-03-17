# How to run the program

1. Clone the repository
2. Run the following command to install the required packages:
   ```bash
   npm install
   ```
3. Run the following command to build the project:
   ```bash
    npm run build
   ```
4. Run the following command to start the program:
   ```bash
    npm start
   ```

# Task abstraction:

- [ ] **Handle user input**:
  - [ ] parse the input URL string, optional limit and max rate
  - [ ] input validation (URL, limit, max rate)
  - [ ] setup global variables for the input values
- [ ] **HTTP request**:
  - [ ] function that will handles the get request
  - [ ] calculate response time (ms)
  - [ ] rate limit handling
- [ ] **Histogram data array**:
  - [ ] calculate and update the histogram data array based on the response time
  - [ ] display the histogram (print to console)
- [ ] **Continuous Execution or Limited Execution**:
  - [ ] continuous execution with a delay of 1 second if no limit is provided
  - [ ] limited execution based on the input limit
- [ ] **Exceptions**:
  - [ ] connectivity issues
  - [ ] invalid URL
  - [ ] rate limit exceeded
  - [ ] handling _SIGINT_ (Ctrl+C)
