import { WebappConfig } from '../types';
export declare function buildServer({ app, sourceMap, mode, cwd, output, publicPath, serverPort, zeroconfigPath, internalEslint, chunkPath, }: WebappConfig): Promise<void>;
