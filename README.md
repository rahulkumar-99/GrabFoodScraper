# GrabFood Scraper

A web scraper for GrabFood that extracts restaurant data from a specific location and saves it in a compressed NDJSON format.

## Prerequisites

- Node.js (v12+)
- npm

## Installation

1. Clone the repository:

    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

## Configuration

1. Create a `.env` file in the root directory:

    ```plaintext
    HEADLESS=true
    GRAB_FOOD_URL=https://food.grab.com/sg/en/
    REQUEST_URL=specific-url-to-intercept
    ```

## Usage

Start the scraping process:

```bash
npm start

**## Using a Proxy**
To use a proxy, pass true to the scrape method:

```const restaurants = await scraper.scrape(location, true);```

**## Changing the Location**
You can change the location by modifying the location variable:

```const location = 'New Location Address';```
