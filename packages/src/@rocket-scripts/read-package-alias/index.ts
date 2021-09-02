import fs from 'fs-extra';
import path from 'path';

export function readPackageAlias(cwd: string): Record<string, string> {
  const src: string = path.join(cwd, 'src');
  const alias: Record<string, string> = {};

  const names: string[] = fs
    .readdirSync(src)
    .filter((name: string) => fs.statSync(path.join(src, name)).isDirectory());

  for (const name of names) {
    const dir: string = path.join(src, name);

    if (/^@/.test(name)) {
      const subnames: string[] = fs
        .readdirSync(dir)
        .filter((subname: string) =>
          fs.statSync(path.join(dir, subname)).isDirectory(),
        );

      for (const subname of subnames) {
        const subdir: string = path.join(dir, subname);
        alias[`${name}/${subname}`] = path.resolve(cwd, subdir);
      }
    } else {
      alias[name] = path.resolve(cwd, dir);
    }
  }

  return alias;
}
