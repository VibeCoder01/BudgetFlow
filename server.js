// server.js
const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; // Listen on all available interfaces
const port = 3000;

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: undefined,
  cert: undefined,
};

// Define certificate paths
const keyPath = path.join(__dirname, 'key.pem');
const certPath = path.join(__dirname, 'cert.pem');

try {
  httpsOptions.key = fs.readFileSync(keyPath);
  httpsOptions.cert = fs.readFileSync(certPath);
} catch (err) {
  console.error('\n\x1b[31mError: SSL certificate files not found!\x1b[0m');
  console.error('I tried to create an HTTPS server, but I couldn\'t find the certificate files.');
  console.error('Please place your SSL `key.pem` and `cert.pem` files in the root of your project.');
  console.error('Note: The certificates must be for your public domain, not `localhost`.');
  console.error('You can get free certificates from a service like Let\'s Encrypt.\n');
  process.exit(1);
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on https://localhost:${port}`);
  });
});
