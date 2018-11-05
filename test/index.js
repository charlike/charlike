import test from 'asia';
import charlike from '../src';

test('should work properly', async (t) => {
  const { locals, project } = await charlike({
    project: { name: '@tunnckocore/foobar', description: 'wo hooo' },
    cwd: './node_modules',
  });

  t.deepStrictEqual(locals.license, { name: 'Apache-2.0', year: '2018' });
  t.strictEqual(locals.repository, 'tunnckoCoreLabs/foobar');
  t.strictEqual(project.name, '@tunnckocore/foobar');
  t.strictEqual(project.owner, 'tunnckoCoreLabs');
  t.strictEqual(project.description, 'wo hooo');
  t.deepStrictEqual(locals.project, project);
});
