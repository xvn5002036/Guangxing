import pkg from 'lunar-javascript';
const { Solar, Lunar } = pkg;
const solar = Solar.fromYmd(2026, 3, 14);
const lunar = solar.getLunar();

console.log('--- 2026-03-14 ---');
const times = lunar.getTimes();
if (times.length > 0) {
  const t = times[0];
  console.log('Methods on LunarTime:', Object.getOwnPropertyNames(Object.getPrototypeOf(t)).filter(m => !m.startsWith('_')));
}

times.forEach(t => {
  const tsLuck = t.getTianShenLuck();
  console.log(`${t.getZhi()}時 | TianShenLuck: ${tsLuck} | TianShen: ${t.getTianShen()}`);
});
