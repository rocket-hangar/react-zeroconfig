import { DefinePlugin } from 'webpack';

type DefinePluginDefinitions = ConstructorParameters<typeof DefinePlugin>[0];

export function readEnv(userEnv?: Record<string, string>): NodeJS.ProcessEnv {
  return {
    ...filterReactEnv(process.env),
    NODE_ENV: process.env.NODE_ENV,
    ...userEnv,
  };
}

export function envToDefinePluginDefinitions(
  env: NodeJS.ProcessEnv,
): DefinePluginDefinitions {
  return {
    'process.env': Object.keys(env).reduce((stringifiedEnv, key) => {
      stringifiedEnv[key] = JSON.stringify(env[key]);
      return stringifiedEnv;
    }, {} as Record<string, string>),
  };
}

export function filterReactEnv(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  return Object.keys(env)
    .filter((key) => /^REACT_APP_/i.test(key) || /^APP_/i.test(key))
    .reduce((e, key) => {
      e[key] = env[key];
      return e;
    }, {} as NodeJS.ProcessEnv);
}
