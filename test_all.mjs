
import { Solar, Lunar } from './node_modules/lunar-javascript/index.js';

function test() {
    const today = new Date('2026-03-13T00:21:18+08:00');
    const solar = Solar.fromDate(today);
    const lunar = solar.getLunar();

    const times = lunar.getTimes();
    console.log('--- ALL TIMES ---');
    times.forEach(t => {
        console.log(`Zhi:${t.getZhi()} Type:${t.getTianShenType()} Luck:${t.getTianShenLuck()} Shen:${t.getTianShen()}`);
    });
}
test();
