import { start } from '@rocket-scripts/web';
import { exec } from '@ssen/promised';
import { copyTmpDirectory } from '@ssen/tmp-directory';
import path from 'path';
import puppeteer from 'puppeteer';

const timeout = (t: number) => new Promise((resolve) => setTimeout(resolve, t));

(async () => {
  const cwd: string = await copyTmpDirectory(
    path.join(process.cwd(), 'test/fixtures/web/puppeteer-recorder-test'),
  );

  await exec(`npm install`, { cwd });
  //await exec(`code ${cwd}`);

  const { port } = await start({
    cwd,
    staticFileDirectories: ['{cwd}/public'],
    app: 'app',
  });

  const browser = await puppeteer.launch({
    userDataDir: process.env.CHROMIUM_USER_DATA_DEBUG,
    headless: false,
    args: ['--start-fullscreen'],
    devtools: true,
  });

  const [page] = await browser.pages();
  await page.goto(`http://localhost:${port}`);

  await timeout(500);

  await page.waitForSelector('body > #app > div > button');
  await page.click('body > #app > div > button');

  await timeout(500);

  await page.waitForSelector('body > #app > div > button');
  await page.click('body > #app > div > button');

  await timeout(500);

  await page.waitForSelector('body > #app > div > button');
  await page.click('body > #app > div > button');

  await timeout(500);

  await page.waitForSelector('body > #app > div > button');
  await page.click('body > #app > div > button');

  await timeout(500);

  const value = await page.$eval('#app h1', (e) => e.innerHTML);
  console.assert(value === 'Count = 4');
})();