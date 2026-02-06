import pkg from 'lunar-javascript';
console.log("Exports:", Object.keys(pkg).sort());

// Also try to see if methods exist on Lunar instance that I missed
import { Lunar } from 'lunar-javascript';
const lunar = Lunar.fromYmd(1987, 4, 10);
// iterate over all members in prototype chain
let obj = lunar;
let members = new Set();
while(obj) {
    Object.getOwnPropertyNames(obj).forEach(p => members.add(p));
    obj = Object.getPrototypeOf(obj);
}
console.log("\nLunar Members:", [...members].filter(s => !s.startsWith('_')).sort().slice(0, 50)); 
// Just a subset
