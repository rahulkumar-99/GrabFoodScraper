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
