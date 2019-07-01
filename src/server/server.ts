import { App } from './app';

(async function () {
    const app = new App();
    await app.setup();

    const server = app.expressApp.listen(app.expressApp.get('port'), () => {
        console.log('  App is running at http://localhost:%d in %s mode', app.expressApp.get('port'), app.expressApp.get('env'));
        console.log('  Press CTRL-C to stop\n');
    });
})();
