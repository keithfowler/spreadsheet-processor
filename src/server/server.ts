import http from 'http';
import { config } from 'dotenv';
import { App } from './app';

(async function () {
    config();
    const port = Number(process.env.EXPRESS_PORT);
    const app = new App();
    await app.setup();

    http.createServer(app.expressApp).listen(port, () => {
        console.log('  App is running at http://localhost:%d in %s mode', port, app.expressApp.get('env'));
        console.log('  Press CTRL-C to stop\n');
    });
})();
