import { Lunar, Solar, EightChar } from 'lunar-javascript';

// Test Date: 2026-01-28 12:00:00
const solar = Solar.fromYmdHms(2026, 1, 28, 12, 0, 0);
const lunar = Lunar.fromSolar(solar);
const baZi = lunar.getEightChar();

console.log("Day Master:", baZi.getDayGan());

// In lunar-javascript, typically ShenSha is available via specific getters or helpers.
// Let's check typical method names found in this library's Java/JS ports.
// Commonly: getYearShenSha, getMonthShenSha, getDayShenSha, getTimeShenSha might not exist directly on EightChar.
// But there is often a `ShenSha` class or methods on Lunar.

// Let's try to inspect the prototype or known methods if possible, 
// OR just try to log potentially relevant data.
console.log("Checking BaZi Object methods...");
const proto = Object.getPrototypeOf(baZi);
console.log("Methods on EightChar:", Object.getOwnPropertyNames(proto).filter(n => n.includes('Shen') || n.includes('Sha')));

// Let's try fetching ShenSha using the 'ShenSha' util if it exists, or check Lunar methods.
console.log("Checking Lunar Object methods...");
const lunarProto = Object.getPrototypeOf(lunar);
console.log("Methods on Lunar:", Object.getOwnPropertyNames(lunarProto).filter(n => n.includes('Shen') || n.includes('Sha')));

// If the library calculates ShenSha, it usually does so relative to the Day/Year pillar.
// For example:
// Day Zhi vs other Zhi (often for generic stars)
// Day Gan vs other Zhi (Tian Yi Gui Ren, etc.)

// Let's try to print the standard daily ones again to be sure.
console.log("Day Ji Shen (Daily Lucky Spirits):", lunar.getDayJiShen());

// NOTE: If the library doesn't output the full list of Shen Sha (Tian Yi, Tai Ji, Wen Chang, etc.), 
// we might need to implement a lookup map manually.
// Let's try to verify if we can get any specific star (e.g. Tian Yi Gui Ren).

// If no methods found, we'll implement a manual calculator in the next step.
