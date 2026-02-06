import pkg from 'lunar-javascript';
const { Lunar, Solar, Gan, Zhi, WuXing } = pkg;

// Setup
const y = 1987;
const m = 4;
const d = 10;
const h = 0; 
const lunar = Lunar.fromYmd(y, m, d);
const solar = lunar.getSolar();
const solarWithTime = Solar.fromYmdHms(solar.getYear(), solar.getMonth(), solar.getDay(), h, 0, 0);
const lunarWithTime = Lunar.fromSolar(solarWithTime);
const baZi = lunarWithTime.getEightChar();

const yearGan = baZi.getYearGan();
const yearZhi = baZi.getYearZhi();
const dayGan = baZi.getDayGan(); // Day Master

console.log(`Day Master: ${dayGan}`);

// 1. Ten Gods (Shi Shen)
console.log("\n=== Ten Gods ===");
try {
    const dmGan = Gan.fromName(dayGan);
    const yGan = Gan.fromName(yearGan);
    
    // Check if distinct methods exist
    // Actually typically we iterate columns.
    // For Year Gan:
    // Ten Gods logic: yearGan relative to dayGan? Yes.
    // "What is Year Gan TO Day Master?"
    // If Day Master is Fire, Year Gan is Wood -> Wood produces Fire -> Resource (Yin).
    // Let's check if method exists.
    if (dmGan) {
         // Methods on Gan
         const props = Object.getOwnPropertyNames(Object.getPrototypeOf(dmGan));
         // Look for 'shishen' or 'relation'
         // console.log("Gan Methods:", props.filter(n => !n.startsWith('_')));
    }
    
    // IMPORTANT: In lunar-javascript, typically usage is:
    // const shiShen = ShiShen.lookup(dayGan, targetGan); Or similar. 
    // Or method on Gan.
    // Documentation isn't available so we guess.
    
} catch (e) {
    console.error("Error with Gan/Zhi lookup:", e);
}

// 2. Hidden Stems (Cang Gan)
console.log("\n=== Hidden Stems & Their Ten Gods ===");
try {
    const yZhi = Zhi.fromName(yearZhi);
    const hidden = yZhi.getHideGan(); // likely returns strings
    console.log(`Year Zhi (${yearZhi}) contains: ${hidden}`);
    
    // 3. Wu Xing Strength
    console.log("\n=== Wu Xing Strength ===");
    const g = Gan.fromName(yearGan);
    const z = Zhi.fromName(yearZhi);
    console.log(`Year Gan ${yearGan} WuXing: ${g.getWuXing()}`);
    console.log(`Year Zhi ${yearZhi} WuXing: ${z.getWuXing()}`);
} catch (e) { console.error(e); }

// 4. Di Shi (12 Life Stages)
console.log("\n=== Di Shi ===");
try {
    const dm = Gan.fromName(dayGan);
    const yz = Zhi.fromName(yearZhi);
    // Usually dm.getDiShi(yz)
    // Let's list prototype of Gan to see methods
    console.log("Gan Proto:", Object.getOwnPropertyNames(Object.getPrototypeOf(dm)).filter(x=>!x.startsWith('_')));
} catch(e) { console.error(e); }

// 5. Shen Sha
console.log("\n=== Shen Sha ===");
// Usually getShenSha on Lunar or BaZi
try {
    console.log("Lunar Proto:", Object.getOwnPropertyNames(Object.getPrototypeOf(lunar)));
    // or BaZi
    console.log("BaZi Proto:", Object.getOwnPropertyNames(Object.getPrototypeOf(baZi)));
} catch(e) {}
