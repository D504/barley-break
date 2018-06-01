import Application from './application';

const app = new Application();
app.start();

window.addEventListener('resize', () => {
    app.resize(window.innerWidth, window.innerHeight);
});
app.resize(window.innerWidth, window.innerHeight);
