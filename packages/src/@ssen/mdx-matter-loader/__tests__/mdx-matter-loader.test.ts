import matterLoader from '@ssen/mdx-matter-loader';

function compile(source: string): Promise<string | Buffer | undefined> {
  return new Promise<string | Buffer | undefined>((resolve, reject) => {
    const context = {
      async:
        () =>
        (
          err: Error | null | undefined,
          content: string | Buffer | undefined,
        ) => {
          if (err) {
            reject(err);
          } else {
            resolve(content);
          }
        },
    };

    matterLoader.call(context, source);
  });
}

describe('mdx-matter-loader', () => {
  test('should get contents with frontmatter export', async () => {
    const content = [
      '---',
      'num: 1',
      'str: string',
      'bool: false',
      '---',
      '',
      '# Hello World!',
    ].join('\n');

    const data = JSON.stringify({
      num: 1,
      str: 'string',
      bool: false,
    });

    const result = await compile(content);

    expect(result).toBe(
      `\n# Hello World!\n\nexport const frontmatter = ${data};`,
    );
  });

  test('should get contents with blank frontmatter export', async () => {
    const content = '# Hello World!';

    const result = await compile(content);

    expect(result).toBe(`# Hello World!\n\nexport const frontmatter = {};`);
  });
});
