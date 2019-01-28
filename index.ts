import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';

const parseHtml = ($: CheerioStatic, year: number) => {
  return $('#list tr')
    .slice(1)
    .map((_, row) => {
        return $(row)
            .text()
            .trim()
            .replace(/^\s+/mg, '')
            .replace(/\n/g, ',')
            // remove index from entry
            .split(',')
            .slice(1)
            .join(',')
    })
    .toArray()
    .map(row => `${year},${row}`)
    .join('\n');
}

const main = async () => {
    // Urls are of the form http://hottest100.org/<year>.html
    const host = 'http://hottest100.org';

    // First year of the count down
    const START_YEAR = 1993;

    const requests = 
        Array(2017 - START_YEAR + 1)
        .fill(0)
        .map(async (_, i) => {
            const year = START_YEAR + i;
            const url = `${host}/${year}.html`;

            const response = await axios.get(url);
            const $ = cheerio.load(response.data);

            return parseHtml($, year);
        });

    const tables = await Promise.all(requests); 
    fs.writeFileSync('./data.csv', [
        'year,title,artist,duration,country',
        ...tables,
        '\n'
    ].join('\n'));
}

main();
