import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';
import proc from 'process';
import JSTransformer from 'jstransformer';
import transformer from 'jstransformer-jstransformer';
import fastGlob from 'fast-glob';
import arrayify from 'arrify';
import objectAssign from 'object-assign-deep';
import { __dirname } from './cjs-globals';

const jstransformer = JSTransformer(transformer);

export default async function charlike(settings) {
  const options = objectAssign({ engine: 'lodash' }, settings);
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
  project.repo = path.basename(project.dest);

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

  const locals = objectAssign(
    { repository: `${project.owner}/${project.repo}` },
    options.locals,
    { project },
  );

  const stream = fastGlob.stream('**/*', {
    cwd: project.templates,
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
      // One more proof: put one console.log in stream.on('data')
      // and you will see that it still outputs even after calling the resolve()
      resolve({ locals, project });
    });
    stream.on('data', async (filepath) => {
      try {
        const tplFilepath = path.join(project.templates, filepath);
        const { body } = await jstransformer.renderFileAsync(
          tplFilepath,
          { engine: options.engine },
          locals,
        );

        const newFilepath = path
          .join(project.dest, filepath)
          .replace('_circleci', '.circleci');

        const basename = path
          .basename(newFilepath)
          .replace(/^__/, '')
          .replace(/^\$/, '')
          .replace(/^_/, '.');

        const fp = path.join(path.dirname(newFilepath), basename);
        const fpDirname = path.dirname(fp);

        if (!fs.existsSync(fpDirname)) {
          await util.promisify(fs.mkdir)(fpDirname);
        }

        await util.promisify(fs.writeFile)(fp, body);
      } catch (err) {
        reject(err);
      }
    });
  });
}
