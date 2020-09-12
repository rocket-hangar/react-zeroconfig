import { patchConsole } from '@ssen/patch-console';
import fs from 'fs-extra';
import { render } from 'ink';
import path from 'path';
import React, { ReactNode } from 'react';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import tmp from 'tmp';
import { ProxyConfigArray, ProxyConfigMap } from 'webpack-dev-server';
import { merge } from 'webpack-merge';
import { DevServer, DevServerParams } from './DevServer';
import { DevServerUI } from './DevServerUI';
import { TimeMessage } from './types';
import { patchProxyLogger } from './utils/patchProxyLogger';

export interface DevServerStartParams extends DevServerParams {
  stdout?: NodeJS.WriteStream;
  stdin?: NodeJS.ReadStream;
  header?: ReactNode;
  cwd?: string;
  logfile?: string;
  restartAlarm?: Observable<string[]>;
  children?: ReactNode;
}

export async function devServerStart({
  stdout = process.stdout,
  stdin = process.stdin,
  header,
  cwd = process.cwd(),
  logfile = tmp.fileSync({ mode: 0o644, postfix: '.log' }).name,
  port,
  hostname,
  webpackConfig,
  devServerConfig,
  restartAlarm,
  children,
}: DevServerStartParams): Promise<() => Promise<void>> {
  console.clear();
  if (!fs.existsSync(path.dirname(logfile))) {
    fs.mkdirpSync(path.dirname(logfile));
  }
  const stream: NodeJS.WritableStream = fs.createWriteStream(logfile);
  const restoreConsole = patchConsole({
    stdout: stream,
    stderr: stream,
    colorMode: false,
  });

  let proxy: ProxyConfigMap | ProxyConfigArray | undefined = undefined;
  let proxySubject: Subject<TimeMessage[]> | undefined = undefined;
  if (devServerConfig.proxy) {
    proxySubject = new BehaviorSubject<TimeMessage[]>([]);
    proxy = patchProxyLogger({
      proxyConfig: devServerConfig.proxy,
      subject: proxySubject,
    });
  }

  const server: DevServer = new DevServer({
    port,
    hostname,
    webpackConfig: merge(webpackConfig, {
      // TODO
    }),
    devServerConfig: {
      ...devServerConfig,
      // TODO
      proxy,
    },
  });

  const { unmount } = render(
    <DevServerUI
      header={header}
      devServer={server}
      cwd={cwd}
      proxyMessage={proxySubject}
      logfile={logfile}
      restartAlarm={restartAlarm}
      children={children}
    />,
    {
      stdout,
      stdin,
      patchConsole: false,
    },
  );

  await server.waitUntilStart();

  return async () => {
    server.close();
    await server.waitUntilClose();
    unmount();
    if (proxySubject) proxySubject.unsubscribe();
    restoreConsole();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };
}