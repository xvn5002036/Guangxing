
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// 環境變數設定 (開發環境/正式環境)
// 已填入您的專案 URL
const SUPABASE_URL = process.env.SUPABASE_URL || "https://gmswwklptwtxceomjrbm.supabase.co";
// 已填入您的 anon public key
const SUPABASE_KEY = process.env.SUPABASE_KEY || "sb_publishable_SbF7J4kDf6jA1-yOzrtX2w_C0WBVg1C";

// 檢查 URL 是否有效
const isValidUrl = (url: string | undefined) => {
    if (!url) return false;
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

let client: SupabaseClient | null = null;

// 只有在 URL 有效且有 Key 時才初始化
if (isValidUrl(SUPABASE_URL) && SUPABASE_KEY) {
    try {
        client = createClient(SUPABASE_URL, SUPABASE_KEY);
    } catch (e) {
        console.warn("Supabase init warning:", e);
    }
}

// 匯出 client。注意：如果未設定，這會是 null。
// 使用端 (DataContext) 必須先檢查 isSupabaseConfigured() 或判斷 supabase 是否為 null。
export const supabase = client as SupabaseClient;

export const isSupabaseConfigured = () => {
    return !!client;
};
