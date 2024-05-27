import puppeteer from 'puppeteer';
import zlib from 'zlib';
import fs from 'fs';
import { config } from '../../config/index.js';
import { infoLogger, errorLogger } from '../../utilities/logger/index.js';
import { HEADERS } from '../../constants/index.js';


export class GrabFoodScraper {
    async scrape(location, scrapeWithProxy = false) {
        const options = {
            headless: config.headless
        };
        if (scrapeWithProxy) {
            options.args = [`--proxy-server=${config.proxy.server}`];
        }
        const browser = await puppeteer.launch(options);
        let page;
        try {
            let searchResponse = null;
            page = await browser.newPage();
            if (scrapeWithProxy && config.proxy.username && config.proxy.password) {
                await page.authenticate({
                    username: config.proxy.username,
                    password: config.proxy.password,
                });
            }

            await page.setRequestInterception(true);

            infoLogger('GrabFoodScraper', 'scrape', location, 'Scraping process initiated');

            page.on('request', (request) => {
                const requestUrl = request.url();

                if (requestUrl.includes(config.requestUrl)) {
                    request.continue({
                        headers: {
                            ...request.headers(),
                            HEADERS
                        },
                    });
                } else {
                    request.continue();
                }
            });
            // Log that the request interception is completed
            infoLogger('GrabFoodScraper', 'scrape', {}, 'Request interception completed');

            page.on('response', async (response) => {
                const requestUrl = response.url();
                const contentType = response.headers()['content-type'];

                if (requestUrl.includes(config.requestUrl) && contentType && contentType.includes('application/json')) {
                    try {
                        searchResponse = await response.json();
                        infoLogger('GrabFoodScraper', 'scrape', {}, 'Response received');
                    } catch (error) {
                        errorLogger('GrabFoodScraper', 'scrape', error, 'Error parsing JSON response');
                    }
                }
            });

            await page.goto(config.grabFoodUrl, { waitUntil: 'networkidle2', timeout: 60000 });
            infoLogger('GrabFoodScraper', 'scrape', {}, 'Response Received');

            await page.waitForSelector('#location-input', { visible: true, timeout: 10000 });
            await page.type('#location-input', location, { delay: 100 });
            infoLogger('GrabFoodScraper', 'scrape', {}, 'Location added');

            await page.waitForSelector('.submitBtn___2roqB', { visible: true, timeout: 5000 });
            await page.click('.submitBtn___2roqB');
            infoLogger('GrabFoodScraper', 'scrape', {}, 'hit search button');

            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
            await page.waitForSelector('.swiper-slide', { visible: true, timeout: 20000 });

            const merchantData = this.extractMerchantData(searchResponse);

            const restaurants = await this.extractRestaurantData(page);

            const result = this.matchData(merchantData, restaurants);
            infoLogger('GrabFoodScraper', 'scrape', result, 'Result');

            const filePath = 'data.ndjson.gz';
            const compressedResult = await this.compressDataToGzipNDJSON(result, filePath);

            infoLogger('GrabFoodScraper', 'scrape', compressedResult, 'Data saved to');
            return result
        } catch (error) {
            errorLogger('GrabFoodScraper', 'scrape', error, 'Error occurred during scraping');
            throw error;
        } finally {
            if (page) {
                await page.close();
            }
            await browser.close();
        }
    }

    extractMerchantData(searchResponse) {
        let merchantData = null;
        if (searchResponse) {
            merchantData = searchResponse?.recommendedMerchantGroups?.[0]?.recommendedMerchants?.map((merchant) => ({
                id: merchant.id,
                name: merchant?.address?.name,
                latitude: merchant.latlng.latitude,
                longitude: merchant.latlng.longitude,
                estimatedDeliveryTime: merchant.merchantData.estimated_delivery_time,
            }));

            infoLogger('GrabFoodScraper', 'scrape', merchantData, 'Merchant Data for specified location Received');
        } else {
            errorLogger('GrabFoodScraper', 'scrape', {}, 'No search response captured.');
        }
        return merchantData;
    }

    async extractRestaurantData(page) {
        const restaurants = await page.evaluate(() => {
            const restaurantElements = document.querySelectorAll('.swiper-slide');
            const restaurantData = [];

            restaurantElements.forEach((restaurant) => {
                const name = restaurant.querySelector('.name___2epcT')?.textContent.trim() || null;
                const cuisine = restaurant.querySelector('.cuisine___T2tCh')?.textContent.trim() || null;
                const rating = restaurant.querySelector('.numbersChild___2qKMV:first-child')?.textContent.trim() || null;
                const deliveryInfoElement = restaurant.querySelector('.numbersChild___2qKMV:nth-child(2)');
                const deliveryInfo = deliveryInfoElement ? deliveryInfoElement.textContent.trim().split('•') : null;
                const deliveryTime = deliveryInfo ? deliveryInfo[0].trim() : null;
                const distance = deliveryInfo ? deliveryInfo[1].trim() : null;
                const promotionalOffer = restaurant.querySelector('.discountText___GQCkj')?.textContent.trim() || null;
                const promo = restaurant.querySelector('.promoTagHead___1bjRG')?.textContent.trim() || null;
                const imageLink = restaurant.querySelector('.realImage___2TyNE')?.src || null;

                if (name || cuisine || rating || deliveryTime || distance || promotionalOffer || promo || imageLink) {
                    restaurantData.push({
                        name,
                        cuisine,
                        rating,
                        deliveryTime,
                        distance,
                        promotionalOffer,
                        promo,
                        imageLink,
                    });
                }
            });

            return restaurantData;
        });

        infoLogger('GrabFoodScraper', 'scrape', restaurants, 'Restaurant Data Received');
        return restaurants;
    }

    matchData(merchantData, restaurants) {
        return merchantData.map((dataItem) => {
            const matchingRestaurant = restaurants.find((restaurant) => restaurant.name === dataItem.name);

            if (matchingRestaurant) {
                return {
                    id: dataItem.id,
                    name: matchingRestaurant.name,
                    cuisine: matchingRestaurant.cuisine,
                    rating: matchingRestaurant.rating,
                    deliveryTime: matchingRestaurant.deliveryTime,
                    distance: matchingRestaurant.distance,
                    promotionalOffer: matchingRestaurant.promotionalOffer,
                    promo: matchingRestaurant.promo,
                    imageLink: matchingRestaurant.imageLink,
                    latitude: dataItem.latitude,
                    longitude: dataItem.longitude,
                    estimatedDeliveryTime: dataItem.estimatedDeliveryTime,
                };
            }
            return null;
        }).filter((item) => item !== null);
    }



    async compressDataToGzipNDJSON(data, filePath) {
        try {
            infoLogger('GrabFoodScraper', 'compressDataToGzipNDJSON', {}, 'compressDataToGzipNDJSON Initiated');

            const ndjsonString = data.map(JSON.stringify).join('\n');
            const buffer = await new Promise((resolve, reject) => {
                zlib.gzip(ndjsonString, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            await fs.promises.writeFile(filePath, buffer);
            infoLogger('GrabFoodScraper', 'compressDataToGzipNDJSON', {}, 'compressDataToGzipNDJSON Completed');

            return filePath;
        } catch (error) {
            errorLogger('GrabFoodScraper', 'compressDataToGzipNDJSON', error, 'Error occurred during compressing data');
            throw error;
        }
    }
}

