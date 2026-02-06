import { getShenShaForPillar } from './src/utils/shenSha.js';
console.log("=== Verifying Shen Sha Calculations ===");
// Helper to run test
const runTest = (name, args, expectedStar) => {
    // args: [pillarZhi, pillarGan, dayGan, yearZhi, monthZhi, dayZhi]
    const result = getShenShaForPillar(args[0], args[1], args[2], args[3], args[4], args[5]);
    const hasStar = result.includes(expectedStar);
    console.log(`[${hasStar ? 'PASS' : 'FAIL'}] ${name}: Expected '${expectedStar}' in result. Got: [${result.join(', ')}]`);
};
// Test 1: Tian De (Month Based)
// Month: 寅 (Tiger). Tian De -> 丁 (Ding).
// Test Pillar: Stem 丁, Branch 卯 (irrelevant for this check unless branch target). 
// Day Master: 甲 (irrelevant for Tian De).
runTest('Tian De - Month Yin vs Stem Ding', ['卯', '丁', '甲', '子', '寅', '申'], // pillarZhi, pillarGan, dayGan, yearZhi, monthZhi, dayZhi
'天德貴人');
// Test 2: Yue De (Month Based)
// Month: 申 (Monkey). Yue De -> 壬 (Ren).
// Test Pillar: Stem 壬.
runTest('Yue De - Month Shen vs Stem Ren', ['午', '壬', '甲', '子', '申', '申'], '月德貴人');
// Test 3: Hong Luan (Year Based)
// Year: 子 (Rat). Hong Luan -> 卯 (Rabbit).
// Test Pillar Branch: 卯.
runTest('Hong Luan - Year Rat vs Branch Rabbit', ['卯', '癸', '甲', '子', '申', '申'], '紅鸞');
// Test 4: Wen Chang (Day Master Based)
// Day Master: 庚 (Geng). Wen Chang -> 亥 (Pig).
// Test Pillar Branch: 亥.
runTest('Wen Chang - DM Geng vs Branch Pig', ['亥', '乙', '庚', '子', '申', '申'], '文昌貴人');
// Test 5: Jie Sha (Branch Interaction)
// Year: 申 (Monkey) (Shen-Zi-Chen water frame). Jie Sha -> 巳 (Snake).
runTest('Jie Sha - Year Shen vs Branch Snake', ['巳', '乙', '甲', '申', '酉', '子'], '劫煞');
// Test 6: Tian De He (Combination)
// Month: 寅 (Tian De = 丁). He of 丁 is 壬.
// Test Pillar Stem: 壬.
runTest('Tian De He - Month Yin (TD=Ding) vs Stem Ren', ['辰', '壬', '甲', '子', '寅', '子'], '天德合');

// Test 7: Ci Guan (Day Gan Based)
// Day Gan: 甲 (Jia). Ci Guan -> 庚寅 (Geng Yin).
runTest('Ci Guan - DM Jia vs Pillar Geng Yin', ['寅', '庚', '甲', '子', '寅', '子'], '詞館');

// Test 8: Sang Men (Year Shen 12 Gods)
// Year: 子 (Rat). Tai Sui=Rat, Qing Long=Ox, Sang Men=Tiger (寅).
// Test Pillar: 寅 (Branch Tiger).
runTest('Sang Men - Year Rat vs Branch Tiger', ['寅', '庚', '甲', '子', '寅', '子'], '喪門');

// Test 9: Tian Luo (Network)
// Base: 戌 (Dog) vs 亥 (Pig).
// Test Pillar: 亥 (Pig). Input Year=戌.
runTest('Tian Luo - Year Dog vs Branch Pig', ['亥', '癸', '甲', '戌', '寅', '子'], '天羅地網');

console.log("=== Verification Complete ===");
