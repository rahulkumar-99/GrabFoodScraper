import dotenv from 'dotenv';

dotenv.config();

export const config = {
    headless: process.env.HEADLESS === 'true',
    grabFoodUrl: process.env.GRAB_FOOD_URL,
    requestUrl: process.env.REQUEST_URL,
    proxy: {
        server: 'http://your-proxy-server:port',
        username: 'your-proxy-username',
        password: 'your-proxy-password',
    }
};
