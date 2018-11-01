import test from 'asia';
import charlike from '../src';

test('charlike', async (t) => {
  const destPath = await charlike(
    '@aaa/zzzzzzz',
    'quxie hoohy bar desc, that was easy!!!',
    {
      cwd: './node_modules',
      // templates: '~/.jsproject',
      locals: {
        nspId: 'e6fdasdasd4e30caaab',
      },
    },
  );

  t.strictEqual(typeof destPath, 'string');
  t.strictEqual(destPath.endsWith('node_modules/zzzzzzz'), true);
});

test('failing', async (t) => {
  try {
    await charlike(1234);
  } catch (err) {
    t.ok(err);
    t.ok(err.message.includes('expect `name` to be string'));

    try {
      await charlike('sasas');
    } catch (e) {
      t.ok(e);
      t.ok(e.message.includes('expect `desc` to be string'));
    }
  }
});
