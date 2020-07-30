import { start } from '@rocket-scripts/web/start';
import { createInkWriteStream } from '@ssen/ink-helpers';
import { exec } from '@ssen/promised';
import { copyTmpDirectory } from '@ssen/tmp-directory';
import fs from 'fs-extra';
import path from 'path';
import puppeteer, { Browser, Page } from 'puppeteer';

const timeout = (t: number) => new Promise((resolve) => setTimeout(resolve, t));

describe('start()', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      defaultViewport: {
        width: 1200,
        height: 900,
      },
    });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  test('should read h1 text and the text should change with HMR', async () => {
    // Arrange : project directories
    const cwd: string = await copyTmpDirectory(path.join(process.cwd(), 'test/fixtures/web/start'));
    const staticFileDirectories: string[] = ['{cwd}/public'];
    const app: string = 'app';

    await exec(`npm install`, { cwd });

    // Arrange : stdout
    const stdout = createInkWriteStream();

    // Act : server start
    const { port, close } = await start({
      cwd,
      staticFileDirectories,
      app,
      https: false,
      stdout,
    });

    await timeout(1000 * 5);

    // Arrange : wait server start
    const url: string = `http://localhost:${port}`;

    if (page.url() === url) {
      await page.reload({ waitUntil: 'load' });
    } else {
      await page.goto(url, { timeout: 1000 * 60 });
    }

    await page.waitFor('#app h1', { timeout: 1000 * 60 });

    // Assert
    await expect(page.$eval('#app h1', (e) => e.innerHTML)).resolves.toBe('Hello World!');

    // Act : update the source file to be causing HMR
    const file: string = path.join(cwd, 'src/app/index.tsx');
    const source: string = await fs.readFile(file, 'utf8');
    await fs.writeFile(file, source.replace(/(Hello)/g, 'Hi'), { encoding: 'utf8' });

    // Assert : update browser text by HMR (but, it can fail)
    const waitMs: number = 1000;
    let count: number = 20;
    while (count >= 0) {
      const text: string = await page.$eval('#app h1', (e) => e.innerHTML);
      if (text === 'Hi World!') {
        break;
      } else if (count === 0) {
        // Assert : when HMR did not work
        console.warn(`HMR did not work`);
        await page.reload({ waitUntil: 'load' });
        await timeout(1000 * 2);
        await page.waitFor('#app h1', { timeout: 1000 * 60 });
        await expect(page.$eval('#app h1', (e) => e.innerHTML)).resolves.toBe('Hi World!');
      }
      await timeout(waitMs);
      count -= 1;
    }

    // Arrange : server close
    await close();

    // Assert : print stdout
    console.log(stdout.lastFrame());
  });

  test('should get static files with multiple static file directories', async () => {
    // Arrange : project directories
    const cwd: string = await copyTmpDirectory(
      path.join(process.cwd(), 'test/fixtures/web/static-file-directories'),
    );
    const staticFileDirectories: string[] = ['{cwd}/public', '{cwd}/static'];
    const app: string = 'app';

    await exec(`npm install`, { cwd });

    // Arrange : stdout
    const stdout = createInkWriteStream();

    // Act : server start
    const { port, close } = await start({
      cwd,
      staticFileDirectories,
      app,
      https: false,
      stdout,
    });

    await timeout(1000 * 5);

    // Arrange : wait server start
    const url: string = `http://localhost:${port}`;

    if (page.url() === url) {
      await page.reload({ waitUntil: 'load' });
    } else {
      await page.goto(url, { timeout: 1000 * 60 });
    }

    await page.waitFor('#app h1', { timeout: 1000 * 60 });

    // Assert
    await expect(page.$eval('#app h1', (e) => e.innerHTML)).resolves.toBe('Hello World!');

    const manifest = await fetch(`http://localhost:${port}/manifest.json`);
    expect(manifest.status).toBeLessThan(299);

    const hello = await fetch(`http://localhost:${port}/hello.json`);
    expect(hello.status).toBeLessThan(299);

    // Arrange : server close
    await close();

    // Assert : print stdout
    console.log(stdout.lastFrame());
  });

  test('should use proxy api', async () => {
    // Arrange : project directories
    const cwd: string = await copyTmpDirectory(path.join(process.cwd(), 'test/fixtures/web/github-proxy'));
    const staticFileDirectories: string[] = ['{cwd}/public'];
    const app: string = 'app';

    await exec(`npm install`, { cwd });

    // Arrange : stdout
    const stdout = createInkWriteStream();

    // Act : server start
    const { port, close } = await start({
      cwd,
      staticFileDirectories,
      app,
      https: false,
      stdout,
    });

    await timeout(1000 * 5);

    // Assert
    const api = await fetch(`http://localhost:${port}/api/frontend-fixtures/package.json`);
    expect(api.status).toBeLessThan(299);

    // Arrange : server close
    await close();

    // Assert : print stdout
    console.log(stdout.lastFrame());
  });
});
