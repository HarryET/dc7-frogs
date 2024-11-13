# Devcon Frogs

Frog collection <3

## How to update the collection
The collection can be updated by sending a curl or using the script below to scrape telegram...

1. Before running the script use devtools to fine the chat scoll container, right click and set global variable
2. Scroll up through telegram to have the messages loaded
3. Paste the below into the dev console

```js
(async () => {
    const collectedUUIDs = new Set();
    let previousScrollTop = temp1.scrollTop;

    // Check if the scroll container exists
    if (!temp1) {
        console.error("Scroll container not found");
        return;
    }

    // Function to follow redirects and get final URL
    const getFinalUrl = async (url) => {
        try {
            const response = await fetch(url, {
                method: 'HEAD',
                redirect: 'follow',
                // Adding headers to avoid some CORS issues
                headers: {
                    'Accept': '*/*',
                    'User-Agent': 'Mozilla/5.0'
                }
            });
            return response.url;
        } catch (error) {
            console.error('Error following redirect for URL:', url, error);
            return url;
        }
    };

    // Function to extract UUID from URL
    const extractUUID = (url) => {
        try {
            const urlObj = new URL(url);
            const qrParam = urlObj.searchParams.get('necklace_qr');
            if (qrParam && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(qrParam)) {
                collectedUUIDs.add(qrParam);
                console.log('Found UUID:', qrParam, 'from URL:', url);
            }
        } catch (error) {
            console.error('Error parsing URL:', url, error);
        }
    };

    // Helper function to collect and process links from the page
    async function collectAndProcessLinks() {
        const links = document.querySelectorAll('a');
        const processPromises = [];

        for (const link of links) {
            const url = link.href;
            if (url.includes("necklace") || url.includes("frogcrypto")) {
                processPromises.push((async () => {
                    try {
                        const finalUrl = await getFinalUrl(url);
                        extractUUID(finalUrl);
                    } catch (error) {
                        console.error('Error processing URL:', url, error);
                    }
                })());
            }
        }

        // Wait for all URLs to be processed before continuing
        await Promise.allSettled(processPromises);
    }

    // Progress indicator
    let scrollCount = 0;
    console.log('Starting scan...');

    // Scroll and collect links until reaching the end
    while (true) {
        await collectAndProcessLinks();
        scrollCount++;
        console.log(`Completed scroll ${scrollCount}, found ${collectedUUIDs.size} unique UUIDs so far`);

        // Scroll up by a large amount to load older messages
        temp1.scrollTop -= temp1.clientHeight;

        // Check if we reached the end (no more content loaded)
        if (temp1.scrollTop === previousScrollTop) {
            console.log('Reached the top of the chat');
            break;
        }
        previousScrollTop = temp1.scrollTop;
    }

    // Print final results
    console.log('Scan complete!');
    console.log('Found UUIDs:', [...collectedUUIDs]);
    console.log('Total unique UUIDs:', collectedUUIDs.size);

    return [...collectedUUIDs];
})();
```

## How to use the collection
Simply run the follwing, all it needs is pupeteer and a chrome instance logged into zupass

1. Login to Zupass
2. Create a next.js project with `pupeteer`
3. Update the constants
4. Run the script

```js
const batchSize = 10; // Number of URLs to open at once
const username = "harryet"; // Update with your username

// Script Below:
const puppeteer = require("puppeteer");
const axios = require("axios");
const fs = require("fs");
(async () => {
  let urls;
  if (fs.existsSync("frogs.json")) {
    console.warn(
      "Using cached frogs, please only change this if it has updated. This uses bandwidth!",
    );
    urls = JSON.parse(fs.readFileSync("frogs.json"));
  } else {
    try {
      const response = await axios.get("https://frogs.harryet.xyz/api/frogs");
      urls = response.data;
      fs.writeFileSync("frogs.json", JSON.stringify(urls));
    } catch (error) {
      console.log(`Error fetching frogs: ${error.message}`);
      return;
    }
  }

  // Launch puppeteer with existing Chrome profile
  const browser = await puppeteer.launch({
    headless: false, // Set to false to view the actions
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: [
      `--user-data-dir=/Users/${username}/Library/Application Support/Google/Chrome`, // Update with your Chrome profile path
    ],
  });

  // Helper function to process a single URL
  async function processURL(page, url) {
    try {
      await page.goto(url, { waitUntil: "load" });

      // Wait for the iframe to load and then access it
      const iframe = await page.waitForSelector("iframe", { timeout: 10000 });
      const frame = await iframe.contentFrame();

      // Wait for the button inside the iframe and click it
      if (frame) {
        await frame.waitForSelector("button.w-48.bg-green-500", {
          timeout: 10000,
        });
        await frame.click("button.w-48.bg-green-500");
        console.log(`Button clicked for URL: ${url}`);
      } else {
        console.log(`Iframe not found for URL: ${url}`);
      }
    } catch (error) {
      console.log(`Error processing URL ${url}: ${error.message}`);
    }
  }

  // Process URLs in batches
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);

    // Open a new page for each URL in the batch
    const pagePromises = batch.map(async (url) => {
      const page = await browser.newPage();
      await processURL(page, `https://dc7.getfrogs.xyz/necklace/${url}`);
      await page.close();
    });

    // Wait for all pages in the batch to complete
    await Promise.all(pagePromises);

    // Add a small delay between batches
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  await browser.close();
})();
```
