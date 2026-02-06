
import { getShenShaForPillar } from './src/utils/shenSha';

// Mock the console.log
const log = (msg: string) => console.log(msg);

const runTests = () => {
    log('Running Shensha Tests...');

    // Test Case 1: San Qi (Heavenly) - Jia Wu Geng
    // Chart: Year: Jia, Month: Wu, Day: Geng, Hour: X
    // Should have '天上三奇'
    const fullStems1 = ['甲', '戊', '庚', '乙'];
    // Note: The function getShenShaForPillar calculates for ONE pillar, but checks full chart for San Qi.
    // We can call it for the Day pillar.
    // Params: pillarZhi, pillarGan, dayGan, yearGan, yearZhi, monthZhi, dayZhi, fullChartStems
    const stars1 = getShenShaForPillar('辰', '庚', '庚', '甲', '子', '午', '辰', fullStems1);
    
    if (stars1.includes('天上三奇')) {
        log('PASS: Jia-Wu-Geng detected as Heavenly San Qi');
    } else {
        log('FAIL: Jia-Wu-Geng NOT detected as Heavenly San Qi. Detected: ' + stars1.join(', '));
    }

    // Test Case 2: San Qi (Heavenly) - Reversed in code? Geng Wu Jia
    const fullStems2 = ['庚', '戊', '甲', '乙'];
    const stars2 = getShenShaForPillar('辰', '甲', '甲', '庚', '子', '午', '辰', fullStems2);
    if (stars2.includes('天上三奇')) {
        log('PASS: Geng-Wu-Jia detected as Heavenly San Qi');
    } else {
        log('FAIL: Geng-Wu-Jia NOT detected as Heavenly San Qi');
    }

    // Test Case 3: Standard Nobleman (Tian Yi)
    // Day: Jia, Branch: Chou. Should have Tian Yi.
    const stars3 = getShenShaForPillar('丑', '己', '甲', '丙', '午', '酉', '子', []);
    if (stars3.includes('天乙貴人')) {
        log('PASS: Jia Day sees Chou branch -> Tian Yi');
    } else {
        log('FAIL: Jia Day sees Chou branch -> Tian Yi missing');
    }
};

runTests();
