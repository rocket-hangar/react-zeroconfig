// @ts-ignore
import svgToJsx from '@svgr/plugin-jsx';
import fs from 'fs';

export default function (this: LoaderContext, contents: string) {
  const callback = this.async();

  if (!callback) return contents;

  try {
    const svgCode: string = fs
      .readFileSync(this.resourcePath, 'utf8')
      .replace(/[\r\n]+/gm, '');
    const componentName: string = 'ReactComponent';
    const reactCode: string = svgToJsx(svgCode, {}, { componentName });

    const lines: string[] = reactCode.split('\n');
    const code = [
      ...lines.slice(0, lines.length - 1),
      `export {${componentName}};`,
      contents,
    ].join('\n');

    callback(null, code);
  } catch {
    callback(null, contents);
  }
}

interface LoaderContext {
  resourcePath: string;
  async: () => (
    err: Error | null | undefined,
    content: string | Buffer | undefined,
  ) => void;
}
