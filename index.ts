import * as fs from 'fs';
import * as moment from 'moment';
import * as Bluebird from 'bluebird';
import got from 'got';
import * as cheerio from 'cheerio';

const urls: string[] = [];
let from = moment('2006-02-01', "YYYY-MM-DD");
const to = moment('2007-01-01', "YYYY-MM-DD");

while (from < to) {
    const url = 'https://whoistory.com/' + from.format("YYYY/MM/DD");
    urls.push(url);
    from.add(1, 'days');
}

async function fetchAllDomainsAndWrite(urls: string[]): Promise<void> {
    await Bluebird.map(urls, async url => {
        try {
            const response = await got(url);
            const $ = cheerio.load(response.body);

            $('.left a').each(async (i, elem) => {
                const elementToWrite = $(elem).text();
                fs.promises.appendFile('domains.txt', elementToWrite !== 'Назад' ? `${elementToWrite}\n` : '');
            });
        } catch (error) {
            console.error(error);
        }
    }, { concurrency: 5 });
}

fetchAllDomainsAndWrite(urls);