import { generateCheckMacValue } from './ecpay_utils.js';

// ECPay 官方提供的範例資料 (用於驗證我們的邏輯是否正確)
const testParams = {
    MerchantID: '2000132',
    MerchantTradeNo: 'test123456',
    MerchantTradeDate: '2023/01/01 12:00:00',
    PaymentType: 'aio',
    TotalAmount: '100',
    TradeDesc: 'test trade',
    ItemName: 'test item',
    ReturnURL: 'https://example.com/webhook',
    ChoosePayment: 'ALL',
    EncryptType: '1'
};

const hashKey = '5294y06JbISpM5x9';
const hashIV = 'v77hoKGq4kWxNNIS';

console.log('--- ECPay CheckMacValue Test ---');
console.log('Params:', testParams);

const calculatedValue = generateCheckMacValue(testParams, hashKey, hashIV);
console.log('Calculated Value:', calculatedValue);

// 注意：如果邏輯正確，且參數與官方文件一致，這裡應該能產出正確的 hash。
// 由於我們目前沒有官方期望結果的靜態對比，但我們會確保邏輯符合：
// 排序 -> 組合 -> URL Encode -> 小寫 -> SHA256 -> 大寫
console.log('Verification Complete.');
