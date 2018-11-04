import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';
import proc from 'process';
import JSTransformer from 'jstransformer';
import transformer from 'jstransformer-jstransformer';
import fastGlob from 'fast-glob';
import arrayify from 'arrify';
import { __dirname } from './cjs-globals';

const jstransformer = JSTransformer(transformer);

export default async function charlike(settings) {
  const options = Object.assign({ engine: 'lodash' }, settings);
  const { project, templates, cwd } = options;

  if (!project || (project && typeof project !== 'object')) {
    throw new TypeError('expect `settings.project` to be an object');
  }
  if (typeof project.dest !== 'string') {
    project.dest = project.name.startsWith('@')
      ? project.name.split('/')[1]
      : project.name;
  }

  project.dest = path.join(cwd || proc.cwd(), project.dest);

  const cfgDir = path.join(os.homedir(), '.config', 'charlike');
  const tplDir = path.join(cfgDir, 'templates');
  const templatesDir = templates ? path.resolve(templates) : null;

  if (templatesDir && fs.existsSync(templatesDir)) {
    project.templates = templatesDir;
  } else if (fs.existsSync(cfgDir) && fs.existsSync(tplDir)) {
    project.templates = tplDir;
  } else {
    project.templates = path.join(path.dirname(__dirname), 'templates');
  }

  if (!fs.existsSync(project.templates)) {
    throw new Error(`source templates folder not exist: ${project.templates}`);
  }

  const locals = Object.assign({}, options.locals, { project });

  const stream = fastGlob.stream('**/*', {
    cwd: project.templates,
    absolute: true,
    ignore: arrayify(null),
  });

  return new Promise((resolve, reject) => {
    stream.on('error', reject);
    stream.on('end', () => {
      // Note: Seems to be called before really write to the destination directory.
      // Stream are still fucking shit even in Node v10.
      // Feels like nothing happend since v0.10.
      // For proof, `process.exit` from inside the `.then` in the CLI,
      // it will end/close the program before even create the dest folder.
      resolve({ locals, project });
    });
    stream.on('data', async (filepath) => {
      try {
        const { body } = await jstransformer.renderFileAsync(
          filepath,
          { engine: options.engine },
          locals,
        );

        const basename = path
          .basename(filepath)
          .replace(/^__/, '')
          .replace(/^\$/, '')
          .replace(/^_/, '.');

        const fp = path.join(project.dest, basename);

        if (!fs.existsSync(project.dest)) {
          await util.promisify(fs.mkdir)(project.dest);
        }

        await util.promisify(fs.writeFile)(fp, body);
      } catch (err) {
        reject(err);
      }
    });
  });
}
