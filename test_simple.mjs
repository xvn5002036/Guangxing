
import { Solar, Lunar } from './node_modules/lunar-javascript/index.js';

function test() {
    try {
        const today = new Date('2026-03-13T00:21:18+08:00');
        const solar = Solar.fromDate(today);
        const lunar = solar.getLunar();

        console.log('Day:', lunar.toFullString());
        console.log('Sha (getDaySha):', lunar.getDaySha());

        const times = lunar.getTimes();
        const results = times.map(t => ({
            zhi: t.getZhi(),
            type: t.getTianShenType(),
            luck: t.getTianShenLuck(),
            shen: t.getTianShen()
        }));
        console.log('Times:', JSON.stringify(results, null, 2));

        const luckyTimes = times
            .filter(t => t.getTianShenLuck() === '吉')
            .map(t => t.getZhi() + '時');
        console.log('Lucky Hours (Filter "吉" on Luck):', luckyTimes.join(' '));
        
        const luckyTimesType = times
            .filter(t => t.getTianShenType() === '吉')
            .map(t => t.getZhi() + '時');
        console.log('Lucky Hours (Filter "吉" on Type):', luckyTimesType.join(' '));

    } catch (e) {
        console.error('Error:', e);
    }
}

test();
