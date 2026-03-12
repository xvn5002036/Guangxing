
const { Lunar } = require('./node_modules/lunar-javascript/index.js');
const today = new Date('2026-03-13T00:21:18+08:00');
const lunar = Lunar.fromDate(today);

console.log('Day:', lunar.toFullString());
console.log('Sha:', lunar.getDaySha());

const times = lunar.getTimes();
times.forEach(t => {
    console.log(`${t.getZhi()}時: Type=${t.getTianShenType()}, Luck=${t.getTianShenLuck()}, Shen=${t.getTianShen()}`);
});
