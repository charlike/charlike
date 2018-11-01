import fs from 'fs';
import streamCopyDir from 'stream-copy-dir';
import gitconfig from 'git-config-path';
import parse from 'parse-git-config';
import gitLocalUsername from 'git-username';
import createPlugin from './create-plugin';

/**
 * Copy given `src` to `dest` templates which are
 * modified with `createPlugin` and JSTransformer.
 *
 * @name .copy
 * @param {object} `{ src, dest }`
 * @param {object} `{ name, pkgName, desc, opts }`
 * @returns Promise
 * @private
 */
export async function copy({ src, dest }, settings) {
  return copyFolder(src, dest, createPlugin(settings));
}

/**
 * Thin promise wrapper around `stream-copy-dir` module.
 *
 * @param {string} src
 * @param {string} dest
 * @param {function} plugin
 * @returns Promise
 * @private
 */
function copyFolder(src, dest, plugin) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(src)) {
      streamCopyDir(src, dest, plugin)
        .once('error', reject)
        .on('finish', resolve);
    } else {
      resolve();
    }
  });
}

// Workaround for the https://github.com/jonschlinkert/git-username/issues/4
export function gitUsername(options) {
  const opt = Object.assign({ type: 'global' }, options && options.gitconfig);
  const gc = gitconfig(opt);
  const opts = Object.assign({ cwd: '/', path: gc }, options);
  const config = parse.sync(opts) || {};
  return config.user && config.user.username
    ? config.user.username
    : gitLocalUsername();
}
