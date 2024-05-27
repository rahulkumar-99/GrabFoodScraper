import { GrabFoodScraper } from './scraper/grabFoodScraper.js';
import { infoLogger, errorLogger } from '../utilities/logger/index.js';

async function startScraping() {
    const scraper = new GrabFoodScraper();
    const location = 'Choa Chu Kang North 6, Singapore, 689577'; // location to scrape

    try {
        const restaurants = await scraper.scrape(location, false);
        infoLogger('GrabFoodScraper', 'scrape', restaurants, 'Restaurants list');
    } catch (error) {
        errorLogger('GrabFoodScraper', 'scrape', error, 'Error occurred while scraping');
        console.error('Error occurred while scraping:', error);
    }
}

startScraping();


