import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { URL } from 'node:url';

const port = Number.parseInt(process.env.CONSUMER_FIXTURE_PORT ?? '4174', 10);
const roots = new Map(
  ['react', 'svelte', 'vue'].map((framework) => [
    framework,
    resolve(`apps/consumer-${framework}/dist/client`),
  ]),
);
const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
]);

const server = createServer(async (request, response) => {
  try {
    const url = new URL(
      request.url ?? '/',
      `http://${request.headers.host ?? 'localhost'}`,
    );
    const [, framework, ...segments] = url.pathname.split('/');
    const root = roots.get(framework);

    if (root === undefined) {
      response.writeHead(404).end('Unknown consumer fixture.');
      return;
    }

    const relativePath =
      segments.length === 0 || segments.join('/') === ''
        ? 'index.html'
        : segments.join('/');
    const filePath = resolve(root, relativePath);

    if (filePath !== root && !filePath.startsWith(`${root}${sep}`)) {
      response.writeHead(403).end('Forbidden.');
      return;
    }

    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      response.writeHead(404).end('Not found.');
      return;
    }

    response.writeHead(200, {
      'cache-control': 'no-store',
      'content-type': contentTypes.get(extname(filePath)) ?? 'application/octet-stream',
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404).end('Not found.');
  }
});

server.listen(port, '127.0.0.1');

const stop = () => {
  server.close((error) => {
    if (error) {
      throw error;
    }
  });
};

process.once('SIGINT', stop);
process.once('SIGTERM', stop);
