import { WebappArgv } from '../types';
import { parseWebappArgv } from './parseWebappArgv';

const defaultArgv: Partial<WebappArgv> = {
  command: 'build',
  app: 'app',
  staticFileDirectories: undefined,
  staticFilePackages: undefined,
  sizeReport: true,
  compress: true,
  output: undefined,
  vendorFileName: 'vendor',
  styleFileName: 'style',
  chunkPath: '',
  port: 3100,
  serverPort: 4100,
  https: false,
};

describe('parseWebappArgv()', () => {
  test('parse', () => {
    expect(parseWebappArgv([
      'build',
      'app',
    ])).toEqual({
      ...defaultArgv,
    });
    
    expect(parseWebappArgv([
      'build',
      'app',
      '--static-file-directories',
      'public static',
      '--static-file-packages',
      'xxx yyy',
    ])).toEqual({
      ...defaultArgv,
      staticFileDirectories: 'public static',
      staticFilePackages: 'xxx yyy',
    });
    
    expect(parseWebappArgv([
      'build',
      'app',
      '--size-report',
      'false',
      '--compress',
      'false',
    ])).toEqual({
      ...defaultArgv,
      sizeReport: false,
      compress: false,
    });
    
    expect(parseWebappArgv([
      'build',
      'app',
      '--vendor-file-name',
      'vendor2',
      '--style-file-name',
      'style2',
    ])).toEqual({
      ...defaultArgv,
      vendorFileName: 'vendor2',
      styleFileName: 'style2',
    });
    
    expect(parseWebappArgv([
      'build',
      'app',
      '--chunk-path',
      'lib/chunks',
    ])).toEqual({
      ...defaultArgv,
      chunkPath: 'lib/chunks',
    });
    
    expect(parseWebappArgv([
      'build',
      'app',
      '--port',
      '7800',
      '--server-port',
      '8800',
    ])).toEqual({
      ...defaultArgv,
      port: 7800,
      serverPort: 8800,
    });
    
    expect(parseWebappArgv([
      'build',
      'app',
      '--https',
      'true',
    ])).toEqual({
      ...defaultArgv,
      https: true,
    });
    
    expect(parseWebappArgv([
      'build',
      'app',
      '--https-key',
      'path-to-custom.key',
      '--https-cert',
      'path-to-custom.crt',
    ])).toEqual({
      ...defaultArgv,
      https: {key: 'path-to-custom.key', cert: 'path-to-custom.crt'},
    });
    
    expect(parseWebappArgv([
      'build',
      'app',
      '--https-key',
      'path-to-custom.key',
    ])).toEqual({
      ...defaultArgv,
      https: false,
    });
  });
  
  test('error cases', () => {
    expect(() => parseWebappArgv([
      'xxx',
      'app',
    ])).toThrowError();
  });
});