import PQueue from 'p-queue';

export const reverseGeocodeQueue = new PQueue({
    interval: 1000, // 1 секунда
    intervalCap: 1, // не более 1 запроса в интервал
});
