const HEADERS = {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'en',
    'origin': 'https://food.grab.com',
    'referer': 'https://food.grab.com/',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'x-country-code': 'SG',
    'x-gfc-country': 'SG',
    'x-grab-web-app-version': 'MxSPZshapn7n0LwgM5yFS',
    'x-hydra-jwt': process.env.X_HYDRA_JWT
}
export { HEADERS };