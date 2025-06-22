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

// Define certificate paths for your public domain
const keyPath = path.join(__dirname, 'privkey1.pem');
const certPath = path.join(__dirname, 'fullchain1.pem');

try {
  httpsOptions.key = fs.readFileSync(keyPath);
  httpsOptions.cert = fs.readFileSync(certPath);
} catch (err) {
  console.error('\n\x1b[31mError: SSL certificate files not found!\x1b[0m');
  console.error('I tried to create an HTTPS server, but I couldn\'t find `privkey1.pem` and/or `fullchain1.pem`.');
  console.error('Please make sure `privkey1.pem` (your private key) and `fullchain1.pem` (your full certificate) are in the root of your project.');
  console.error('You can get these from a service like Let\'s Encrypt.\n');
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
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> HTTPS server ready on port ${port}`);
  });
});
