import { Lunar, Solar } from 'lunar-javascript';
const lunar = Lunar.fromYmd(1987, 4, 10); // Ding Mao Year
// Add time
const solar = lunar.getSolar();
const solarTime = Solar.fromYmdHms(solar.getYear(), solar.getMonth(), solar.getDay(), 12, 0, 0); // Wu Hour
const l = Lunar.fromSolar(solarTime);
const b = l.getEightChar();

console.log("Day Master:", b.getDayGan());

console.log("\n=== Shi Shen (Ten Gods) ===");
// Method names from previous dump
// getBaZiShiShenGan -> undefined? Wait, listing had it?
// Let's try likely names based on list `getBaZiShiShenYearZhi` etc.

// Note: The previous list was truncated ("slice(0, 50)"). 
// It had `getBaZiShiShenGan` ?? No, it had `getBaZiShiShenDayZhi` etc.
// Wait, looking at the list again:
// [ 'getBaZiShiShenDayZhi', 'getBaZiShiShenGan', 'getBaZiShiShenMonthZhi', 'getBaZiShiShenTimeZhi', 'getBaZiShiShenYearZhi', 'getBaZiShiShenZhi' ]
// "getBaZiShiShenGan" implies ONE Gan? That's weird. Maybe it takes an argument?
// Or maybe it's `getBaZiShiShenYearGan()` which wasn't in the sorted slice?
// Let's try iterating likely names.

const methods = [
    'getBaZiShiShenYearGan', 'getBaZiShiShenMonthGan', 'getBaZiShiShenDayGan', 'getBaZiShiShenTimeGan',
    'getBaZiShiShenYearZhi', 'getBaZiShiShenMonthZhi', 'getBaZiShiShenDayZhi', 'getBaZiShiShenTimeZhi'
];

methods.forEach(m => {
    if (l[m]) {
        console.log(`${m}: ${l[m]()}`);
    } else {
        // Try on BaZi object?
        if (b[m]) console.log(`BaZi.${m}: ${b[m]()}`);
        else console.log(`${m}: Not found`);
    }
});

console.log("\n=== Wu Xing ===");
// List had `getBaZiWuXing`
if (l.getBaZiWuXing) {
    console.log("getBaZiWuXing:", JSON.stringify(l.getBaZiWuXing())); 
    // If it returns list of strings, we count them.
}

console.log("\n=== Hidden Stems (Zhi Cang Gan) ===");
// Need to find method.
// If I can't find it, I'll need a manual map.
// Let's try to lookup `getYearHideGan` on BaZi object again (it worked in script 1? No, script 1 used `getYearHideGan` and printed something. Wait, script 1 output regarding Hidden Stems was: "Year Zhi (卯) contains: 乙".
// Ah! So `baZi.getYearHideGan()` RETURNS ARRAY of strings!
// I must have missed that in script 1? No, script 1 output was "Year Hide Gan: 乙". 
// Wait, is it one string or array? 
// Script 1 line: console.log("Year Hide Gan: " + baZi.getYearHideGan());
// If it's an array ["Yi"], toString is "Yi".
// Confirming if it returns array.
console.log("Year Hide Gan:", b.getYearHideGan());
console.log("Year Hide Gan Type:", Array.isArray(b.getYearHideGan()) ? "Array" : typeof b.getYearHideGan());

// Shen Sha
console.log("\n=== Shen Sha ===");
// If `getShenSha` exists...
if (l.getShenSha) console.log("ShenSha:", l.getShenSha());
