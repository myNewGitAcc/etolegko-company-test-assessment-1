### This is a test assessment for Etolegko company.

### Requirements:
Need to build CLI script on either Node or Python which accepts url, makes 10 consequent attempts to connect and 
await full response from each of them.
Then it should calculate average time of request processing, total download size and print download speed.

### Requirements
- Node.js 18.3 or newer (built-in fetch and util.parseArgs)
- pnpm

tsx runs the TypeScript file directly, so there is no build step.

### Usage
```bash
pnpm run measure-connection --url <url> --queries <number>
```

Example:

```bash
pnpm run measure-connection --url 'https://www.examplefile.com/file-download/106' --queries 10
```

### Options

| Option      | Required | Description                                      |
| ----------- | -------- | ------------------------------------------------ |
| `--url`     | yes      | URL to fetch                                     |
| `--queries` | yes      | Number of sequential requests (positive integer) |
| `--help`    | no       | Print usage information   


Both options must be passed by name. Bare values such as https://example.com 10 are rejected with a clear error message.

Quote the URL if it contains characters your shell treats specially, such as & or ?.

Example output
```
Successful requests: 10/10
Average time of request processing: 588.36 ms
Total downloaded size: 7.14 MB
Download speed: 1.21 MB/s
```

### How the numbers are calculated:

Successful requests: responses with a 2xx status whose body was downloaded completely. 

Network errors and non-2xx responses are logged to stderr and counted as failures.

Average time of request processing: mean time from sending the request until the full body is received, over successful requests only.

Total downloaded size: sum of body sizes of successful requests. Sizes use binary units (1 MB = 1024 × 1024 bytes), so a 50 MiB file shows as 50.00 MB.

Download speed: total downloaded bytes divided by the total time spent on successful requests.
