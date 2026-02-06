/**
 * BaZi Shen Sha (Symbolic Stars) Calculator
 * Based on traditional relationships between Day Master (Day Gan), Year/Day Branch (Year/Day Zhi), and Month Branch (Month Zhi).
 */
// Helper: Get Branch Index
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const getZhiIdx = (z) => ZHI.indexOf(z);
/**
 * Calculate Shen Sha for a single pillar's Earthly Branch
 * @param pillarZhi The Earthly Branch of the pillar to check
 * @param pillarGan The Heavenly Stem of the pillar to check
 * @param dayGan The Day Master
 * @param yearZhi The Year Branch
 * @param monthZhi The Month Branch
 * @param dayZhi The Day Branch
 */
export const getShenShaForPillar = (pillarZhi, pillarGan, dayGan, yearZhi, monthZhi, dayZhi) => {
    const starList = [];
    // --- 1. Day Gan Based Stars (Using Day Master) ---
    // Tian Yi Gui Ren (天乙貴人)
    const tianYiMap = {
        '甲': ['丑', '未'], '戊': ['丑', '未'], '庚': ['丑', '未'],
        '乙': ['子', '申'], '己': ['子', '申'],
        '丙': ['亥', '酉'], '丁': ['亥', '酉'],
        '壬': ['巳', '卯'], '癸': ['巳', '卯'],
        '辛': ['寅', '午']
    };
    if (tianYiMap[dayGan]?.includes(pillarZhi))
        starList.push('天乙貴人');
    // Wen Chang Gui Ren (文昌貴人)
    const wenChangMap = {
        '甲': '巳', '乙': '午', '丙': '申', '丁': '酉', '戊': '申',
        '己': '酉', '庚': '亥', '辛': '子', '壬': '寅', '癸': '卯'
    };
    if (wenChangMap[dayGan] === pillarZhi)
        starList.push('文昌貴人');
    // Tai Ji Gui Ren (太極貴人)
    const taiJiMap = {
        '甲': ['子', '午'], '乙': ['子', '午'],
        '丙': ['酉', '卯'], '丁': ['酉', '卯'],
        '戊': ['辰', '戌', '丑', '未'], '己': ['辰', '戌', '丑', '未'],
        '庚': ['寅', '亥'], '辛': ['寅', '亥'],
        '壬': ['巳', '申'], '癸': ['巳', '申']
    };
    if (taiJiMap[dayGan]?.includes(pillarZhi))
        starList.push('太極貴人');
    // Lu Shen (祿神)
    const luShenMap = {
        '甲': '寅', '乙': '卯', '丙': '巳', '戊': '巳', '丁': '午',
        '己': '午', '庚': '申', '辛': '酉', '壬': '亥', '癸': '子'
    };
    if (luShenMap[dayGan] === pillarZhi)
        starList.push('祿神');
    // Yang Ren (羊刃)
    const yangRenMap = {
        '甲': '卯', '乙': '辰', '丙': '午', '戊': '午', '丁': '未',
        '己': '未', '庚': '酉', '辛': '戌', '壬': '子', '癸': '丑'
    };
    if (yangRenMap[dayGan] === pillarZhi)
        starList.push('羊刃');
    // Xue Ren (血刃)
    const xueRenMap = {
        '甲': '辰', '乙': '丑', '丙': '未', '丁': '酉', '戊': '未',
        '己': '酉', '庚': '戌', '辛': '丑', '壬': '亥', '癸': '申'
    };
    if (xueRenMap[dayGan] === pillarZhi)
        starList.push('血刃');
    // Jin Yu (金輿)
    const jinYuMap = {
        '甲': '辰', '乙': '巳', '丙': '未', '丁': '申', '戊': '未',
        '己': '申', '庚': '戌', '辛': '亥', '壬': '丑', '癸': '寅'
    };
    if (jinYuMap[dayGan] === pillarZhi)
        starList.push('金輿');
    // Tian Guan (天官)
    const tianGuanMap = {
        '甲': '未', '乙': '辰', '丙': '巳', '丁': '寅', '戊': '卯',
        '己': '酉', '庚': '亥', '辛': '申', '壬': '酉', '癸': '午'
    };
    if (tianGuanMap[dayGan] === pillarZhi)
        starList.push('天官貴人');
    // Tian Chu (天廚)
    const tianChuMap = {
        '甲': '巳', '乙': '午', '丙': '子', '丁': '巳', '戊': '午',
        '己': '申', '庚': '寅', '辛': '午', '壬': '酉', '癸': '亥'
    };
    if (tianChuMap[dayGan] === pillarZhi)
        starList.push('天廚貴人');
    // Ci Guan (詞館) - Education/Literature
    // Based on Day Gan.
    // 甲庚寅, 乙辛卯, 丙乙巳, 丁戊午, 戊丁巳, 己庚午, 庚壬申, 辛癸酉, 壬癸亥, 癸壬戌
    const ciGuanMap = {
        '甲': '庚寅', '乙': '辛卯', '丙': '乙巳', '丁': '戊午', '戊': '丁巳',
        '己': '庚午', '庚': '壬申', '辛': '癸酉', '壬': '癸亥', '癸': '壬戌'
    };
    if (ciGuanMap[dayGan] === (pillarGan + pillarZhi))
        starList.push('詞館');
    // --- 2. Month Branch Based Stars ---
    // Tian De (天德)
    const tianDeMap = {
        '寅': '丁', '卯': '申', '辰': '壬', '巳': '辛', '午': '亥', '未': '甲',
        '申': '癸', '酉': '寅', '戌': '丙', '亥': '乙', '子': '巳', '丑': '庚'
    };
    const tdTarget = tianDeMap[monthZhi];
    if (tdTarget) {
        if (GAN.includes(tdTarget)) {
            if (pillarGan === tdTarget)
                starList.push('天德貴人');
        }
        else {
            if (pillarZhi === tdTarget)
                starList.push('天德貴人');
        }
    }
    // Yue De (月德)
    const yueDeMap = {
        '寅': '丙', '午': '丙', '戌': '丙',
        '申': '壬', '子': '壬', '辰': '壬',
        '亥': '甲', '卯': '甲', '未': '甲',
        '巳': '庚', '酉': '庚', '丑': '庚'
    };
    if (yueDeMap[monthZhi] === pillarGan)
        starList.push('月德貴人');
    // Tian De He (天德合)
    const ganHe = { '甲': '己', '己': '甲', '乙': '庚', '庚': '乙', '丙': '辛', '辛': '丙', '丁': '壬', '壬': '丁', '戊': '癸', '癸': '戊' };
    const zhiHe = { '子': '丑', '丑': '子', '寅': '亥', '亥': '寅', '卯': '戌', '戌': '卯', '辰': '酉', '酉': '辰', '巳': '申', '申': '巳', '午': '未', '未': '午' };
    if (tdTarget) {
        let tdHe = '';
        if (GAN.includes(tdTarget)) {
            tdHe = ganHe[tdTarget];
            if (pillarGan === tdHe)
                starList.push('天德合');
        }
        else {
            tdHe = zhiHe[tdTarget];
            if (pillarZhi === tdHe)
                starList.push('天德合');
        }
    }
    // Yue De He (月德合)
    if (yueDeMap[monthZhi]) {
        const yd = yueDeMap[monthZhi];
        const ydHe = ganHe[yd];
        if (pillarGan === ydHe)
            starList.push('月德合');
    }
    // De Xiu (德秀)
    const deXiuMap = {
        '寅': ['丙', '丁'], '午': ['丙', '丁'], '戌': ['丙', '丁'],
        '申': ['壬', '癸'], '子': ['壬', '癸'], '辰': ['壬', '癸'],
        '亥': ['甲', '乙'], '卯': ['甲', '乙'], '未': ['甲', '乙'],
        '巳': ['庚', '辛'], '酉': ['庚', '辛'], '丑': ['庚', '辛']
    };
    if (deXiuMap[monthZhi]?.includes(pillarGan))
        starList.push('德秀貴人');
    // --- 3. Branch Interactions ---
    const checkZhiStars = (baseZhi, source) => {
        if (!baseZhi)
            return;
        // Yi Ma (驛馬)
        if (['申', '子', '辰'].includes(baseZhi) && pillarZhi === '寅')
            starList.push('驛馬');
        if (['寅', '午', '戌'].includes(baseZhi) && pillarZhi === '申')
            starList.push('驛馬');
        if (['巳', '酉', '丑'].includes(baseZhi) && pillarZhi === '亥')
            starList.push('驛馬');
        if (['亥', '卯', '未'].includes(baseZhi) && pillarZhi === '巳')
            starList.push('驛馬');
        // Tao Hua (桃花)
        if (['申', '子', '辰'].includes(baseZhi) && pillarZhi === '酉')
            starList.push('桃花');
        if (['寅', '午', '戌'].includes(baseZhi) && pillarZhi === '卯')
            starList.push('桃花');
        if (['巳', '酉', '丑'].includes(baseZhi) && pillarZhi === '午')
            starList.push('桃花');
        if (['亥', '卯', '未'].includes(baseZhi) && pillarZhi === '子')
            starList.push('桃花');
        // Hua Gai (華蓋)
        if (['申', '子', '辰'].includes(baseZhi) && pillarZhi === '辰')
            starList.push('華蓋');
        if (['寅', '午', '戌'].includes(baseZhi) && pillarZhi === '戌')
            starList.push('華蓋');
        if (['巳', '酉', '丑'].includes(baseZhi) && pillarZhi === '丑')
            starList.push('華蓋');
        if (['亥', '卯', '未'].includes(baseZhi) && pillarZhi === '未')
            starList.push('華蓋');
        // Jiang Xing (將星)
        if (['申', '子', '辰'].includes(baseZhi) && pillarZhi === '子')
            starList.push('將星');
        if (['寅', '午', '戌'].includes(baseZhi) && pillarZhi === '午')
            starList.push('將星');
        if (['巳', '酉', '丑'].includes(baseZhi) && pillarZhi === '酉')
            starList.push('將星');
        if (['亥', '卯', '未'].includes(baseZhi) && pillarZhi === '卯')
            starList.push('將星');
        // Jie Sha (劫煞)
        if (['申', '子', '辰'].includes(baseZhi) && pillarZhi === '巳')
            starList.push('劫煞');
        if (['寅', '午', '戌'].includes(baseZhi) && pillarZhi === '亥')
            starList.push('劫煞');
        if (['巳', '酉', '丑'].includes(baseZhi) && pillarZhi === '寅')
            starList.push('劫煞');
        if (['亥', '卯', '未'].includes(baseZhi) && pillarZhi === '申')
            starList.push('劫煞');
        // Zai Sha (災煞)
        if (['申', '子', '辰'].includes(baseZhi) && pillarZhi === '午')
            starList.push('災煞');
        if (['寅', '午', '戌'].includes(baseZhi) && pillarZhi === '子')
            starList.push('災煞');
        if (['巳', '酉', '丑'].includes(baseZhi) && pillarZhi === '卯')
            starList.push('災煞');
        if (['亥', '卯', '未'].includes(baseZhi) && pillarZhi === '酉')
            starList.push('災煞');
        // Yuan Chen (元辰)
        const yuanChenMap = {
            '子': '未', '丑': '申', '寅': '酉', '卯': '戌', '辰': '亥', '巳': '子',
            '午': '丑', '未': '寅', '申': '卯', '酉': '辰', '戌': '巳', '亥': '午'
        };
        if (yuanChenMap[baseZhi] === pillarZhi)
            starList.push('元辰');
        // Gu Chen (孤辰)
        if (['寅', '卯', '辰'].includes(baseZhi) && pillarZhi === '巳')
            starList.push('孤辰');
        if (['巳', '午', '未'].includes(baseZhi) && pillarZhi === '申')
            starList.push('孤辰');
        if (['申', '酉', '戌'].includes(baseZhi) && pillarZhi === '亥')
            starList.push('孤辰');
        if (['亥', '子', '丑'].includes(baseZhi) && pillarZhi === '寅')
            starList.push('孤辰');
        // Gua Su (寡宿)
        if (['寅', '卯', '辰'].includes(baseZhi) && pillarZhi === '丑')
            starList.push('寡宿');
        if (['巳', '午', '未'].includes(baseZhi) && pillarZhi === '辰')
            starList.push('寡宿');
        if (['申', '酉', '戌'].includes(baseZhi) && pillarZhi === '未')
            starList.push('寡宿');
        if (['亥', '子', '丑'].includes(baseZhi) && pillarZhi === '戌')
            starList.push('寡宿');
        // Tian Luo / Di Wang (天羅地網)
        // Usually: Xu-Hai is Tian Luo. Chen-Si is Di Wang. 
        // Relative to Year or Day. If base is Xu, seeing Hai is Tian Luo?
        // Or if base is Fire NaYin...
        // Simplified Logic: If pillar is Xu or Hai -> Check for presence of other?
        // User screenshot treats it as a star per pillar. 
        // Let's mark it if it hits the corner. 
        // Common: 辰為天羅, 戌為地網? No, 戌亥 Tian Luo.
        // If Base is 戌, and pillar is 亥. Or Base is 亥 and pillar is 戌.
        if ((baseZhi === '戌' && pillarZhi === '亥') || (baseZhi === '亥' && pillarZhi === '戌'))
            starList.push('天羅地網');
        if ((baseZhi === '辰' && pillarZhi === '巳') || (baseZhi === '巳' && pillarZhi === '辰'))
            starList.push('天羅地網');
        if (source === 'Year') {
            // Hong Luan (紅鸞)
            const hongLuanMap = {
                '子': '卯', '丑': '寅', '寅': '丑', '卯': '子', '辰': '亥', '巳': '戌',
                '午': '酉', '未': '申', '申': '未', '酉': '午', '戌': '巳', '亥': '辰'
            };
            if (hongLuanMap[baseZhi] === pillarZhi)
                starList.push('紅鸞');
            // Tian Xi (天喜)
            const tianXiMap = {
                '子': '酉', '丑': '申', '寅': '未', '卯': '午', '辰': '巳', '巳': '辰',
                '午': '卯', '未': '寅', '申': '丑', '酉': '子', '戌': '亥', '亥': '戌'
            };
            if (tianXiMap[baseZhi] === pillarZhi)
                starList.push('天喜');
            // --- 12 Year-Shen (Sui Jian Twelve Gods) ---
            // Sequence starts at Year Zhi.
            // 1. Tai Sui, 2. Qing Long, 3. Sang Men, 4. Liu He, 5. Guan Fu, 6. Xiao Hao, 7. Da Hao, 8. Zhu Que, 9. Bai Hu, 10. Fu De, 11. Diao Ke, 12. Bing Fu
            // Note: Indices. Base=0.
            const yearShenSeq = [
                '太歲', '青龍', '喪門', '六合', '官符', '小耗', '大耗', '朱雀', '白虎', '福德', '弔客', '病符'
            ];
            const baseIdx = getZhiIdx(baseZhi);
            const pIdx = getZhiIdx(pillarZhi);
            // Calculate distance (wrapped)
            const diff = (pIdx - baseIdx + 12) % 12; // 0 for Tai Sui
            const shenName = yearShenSeq[diff];
            // Only push if it's not strictly just the branch itself (avoid clutter? Tai Sui is redundant if it is the year branch).
            // But user might want to see 'Tai Sui' in Year Column or 'Sang Men' in others.
            // Screen shot has 'Sang Men'.
            starList.push(shenName);
        }
    };
    checkZhiStars(yearZhi, 'Year');
    checkZhiStars(dayZhi, 'Day');
    // --- 4. Special Pillar Combinations ---
    // Shi Ling Ri (十靈日)
    if (pillarGan === dayGan && pillarZhi === dayZhi) {
        const shiLing = ['甲辰', '乙亥', '丙辰', '丁酉', '戊午', '庚戌', '庚寅', '辛亥', '壬寅', '癸未'];
        if (shiLing.includes(pillarGan + pillarZhi))
            starList.push('十靈日');
        // Tian She (天赦)
        const gz = pillarGan + pillarZhi;
        if (['寅', '卯', '辰'].includes(monthZhi) && gz === '戊寅')
            starList.push('天赦');
        if (['巳', '午', '未'].includes(monthZhi) && gz === '甲午')
            starList.push('天赦');
        if (['申', '酉', '戌'].includes(monthZhi) && gz === '戊申')
            starList.push('天赦');
        if (['亥', '子', '丑'].includes(monthZhi) && gz === '甲子')
            starList.push('天赦');
    }
    // Kui Gang (魁罡)
    if (pillarGan === dayGan && pillarZhi === dayZhi) {
        if (['庚辰', '庚戌', '壬辰', '戊戌'].includes(pillarGan + pillarZhi))
            starList.push('魁罡');
    }
    return [...new Set(starList)];
};
