// @flow
import blessed from 'blessed';
import util from 'util'

const screen = blessed.screen({
    autoPadding: true,
    smartCSR: true,
    dockBorders: true,
    debug: true,
    title: 'covcov'
});

screen.debugLog.width = '100%';
screen.debugLog.height = '100%';
screen.debugLog.top = 0;
screen.debugLog.left = 0;
screen.debugLog.parseTags = false;

screen.key(['C-c'], () => process.exit(0));

global.log = (...val) => screen.debug(...val);
global.inspect = (obj) => screen.debug(util.inspect(obj));


export default screen;
