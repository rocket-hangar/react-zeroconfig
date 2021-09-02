import { readPackageAlias } from '@rocket-scripts/read-package-alias';
import { copyFixture } from '@ssen/copy-fixture';
import path from 'path';

describe('readPackageAlias()', () => {
  test('should get alias from dir', async () => {
    // Arrange
    const cwd: string = await copyFixture(`test/fixtures/web/alias`);

    // Act
    const alias: Record<string, string> = readPackageAlias(cwd);

    // Assert
    expect(alias['app']).toBe(path.join(cwd, 'src/app'));
    expect(alias['a']).toBe(path.join(cwd, 'src/a'));
    expect(alias['b']).toBe(path.join(cwd, 'src/b'));
    expect(alias['c']).toBe(path.join(cwd, 'src/c'));
  });

  test('should get group alias from dir', async () => {
    // Arrange
    const cwd: string = await copyFixture(`test/fixtures/web/alias-group`);

    // Act
    const alias: Record<string, string> = readPackageAlias(cwd);

    // Assert
    expect(alias['app']).toBe(path.join(cwd, 'src/app'));
    expect(alias['@group/a']).toBe(path.join(cwd, 'src/@group/a'));
    expect(alias['@group/b']).toBe(path.join(cwd, 'src/@group/b'));
    expect(alias['@group/c']).toBe(path.join(cwd, 'src/@group/c'));
  });
});
