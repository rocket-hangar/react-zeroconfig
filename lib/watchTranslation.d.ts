import { Subscribable } from 'rxjs';
import { Config } from './types';
interface Params {
    appDirectory: Config['appDirectory'];
    outputPath: string;
}
declare const _default: ({ appDirectory, outputPath }: Params) => Subscribable<void>;
export = _default;
