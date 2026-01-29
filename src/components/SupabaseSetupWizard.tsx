
import React, { useState } from 'react';
import { isSupabaseConfigured } from '../services/supabase';
import { Settings, Database, Copy, ExternalLink, AlertTriangle, Terminal, CheckCircle2 } from 'lucide-react';

const SupabaseSetupWizard: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);

    // If properly configured, do not show this wizard
    if (isSupabaseConfigured() || !isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
            <div className="bg-mystic-charcoal border border-mystic-gold/30 rounded-lg max-w-4xl w-full shadow-2xl flex flex-col my-8">

                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-gray-900 to-mystic-charcoal">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center">
                            <Database size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">連接 Supabase 資料庫</h2>
                            <p className="text-sm text-gray-400">您的專案 URL 已設定，請補上 API Key 以啟用雲端儲存</p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white px-3 py-1 text-xs border border-gray-700 rounded hover:bg-white/10">
                        暫時略過 (僅使用本地模式)
                    </button>
                </div>

                {/* Steps Content */}
                <div className="p-8 space-y-10">

                    {/* Step 1: Get Config */}
                    <div className="flex gap-6">
                        <div className="flex-shrink-0 flex flex-col items-center">
                            <div className="w-10 h-10 bg-mystic-gold text-black font-bold rounded-full flex items-center justify-center text-xl shadow-[0_0_15px_rgba(197,160,89,0.5)]">1</div>
                            <div className="w-1 h-full bg-white/10 my-2"></div>
                        </div>
                        <div className="flex-1 space-y-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Settings size={20} className="text-mystic-gold" />
                                取得 API Key (anon public key)
                            </h3>
                            <div className="bg-black/40 border border-white/5 p-4 rounded text-gray-300 text-sm leading-relaxed space-y-2">
                                <p>1. 前往 <a href="https://supabase.com/dashboard" target="_blank" className="text-green-400 underline">Supabase Dashboard</a> 進入您的專案。</p>
                                <p>2. 點擊 <span className="text-white font-bold">Project Settings</span> (左下角齒輪) ➔ <span className="text-white font-bold">API</span>。</p>
                                <p>3. 複製 <span className="text-white font-bold">anon public key</span>。</p>
                                <p>4. 若是在 Vercel 上部署，請至 <span className="text-white font-bold">Vercel Settings ➔ Environment Variables</span> 加入以下變數：</p>
                                <ul className="list-disc list-inside ml-4 text-orange-200">
                                    <li><code className="bg-gray-800 px-1 rounded">VITE_SUPABASE_URL</code></li>
                                    <li><code className="bg-gray-800 px-1 rounded">VITE_SUPABASE_ANON_KEY</code></li>
                                </ul>
                                <p className="text-xs text-gray-500 mt-2 italic">* 設定完成後需重新部署 (Redeploy) 才會生效。</p>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Create Tables */}
                    <div className="flex gap-6">
                        <div className="flex-shrink-0 flex flex-col items-center">
                            <div className="w-10 h-10 bg-gray-700 text-white font-bold rounded-full flex items-center justify-center text-xl border border-white/20">2</div>
                        </div>
                        <div className="flex-1 space-y-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Terminal size={20} className="text-blue-400" />
                                建立資料表 (SQL Editor)
                            </h3>
                            <div className="bg-gray-900 border border-white/10 p-4 rounded text-gray-300 text-sm">
                                <p className="mb-2">連線成功後，請在 Supabase 的 <span className="text-white font-bold">SQL Editor</span> 執行以下指令以建立資料表：</p>
                                <div className="bg-black p-4 rounded border-l-4 border-green-500 font-mono text-[10px] md:text-xs overflow-x-auto text-green-300">
                                    <pre>{`-- 建立設定表
create table settings (id text primary key, "templeName" text, address text, phone text, "lineUrl" text, "heroTitle" text, "heroSubtitle" text, "heroImage" text, "deityImage" text, "deityTitle" text, "deityIntro" text, "deityBirthday" text, "deityBirthdayLabel" text, "deityDuty" text, "deityDutyLabel" text, "historyImageRoof" text, "historyRoofTitle" text, "historyRoofDesc" text, "historyImageStone" text, "historyStoneTitle" text, "historyStoneDesc" text);

-- 建立其他資料表
create table news (id uuid default gen_random_uuid() primary key, date text, title text, category text);
create table events (id uuid default gen_random_uuid() primary key, date text, "lunarDate" text, title text, description text, time text, type text);
create table services (id uuid default gen_random_uuid() primary key, title text, description text, "iconName" text, price numeric, type text);
create table gallery (id uuid default gen_random_uuid() primary key, type text, url text, title text);
create table org_members (id uuid default gen_random_uuid() primary key, name text, title text, image text, category text);
create table registrations (id uuid default gen_random_uuid() primary key, "serviceId" text, "serviceTitle" text, name text, phone text, "birthYear" text, "birthMonth" text, "birthDay" text, "birthHour" text, city text, district text, road text, "addressDetail" text, amount numeric, status text, "isProcessed" boolean, "createdAt" timestamptz default now(), "paymentMethod" text, "paymentDetails" text);

-- 開啟 Realtime (重要)
alter publication supabase_realtime add table settings, news, events, services, gallery, org_members, registrations;
`}</pre>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 bg-black/20 border-t border-white/10 text-center">
                    <a
                        href="https://supabase.com/dashboard"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded hover:bg-green-500 transition-colors"
                    >
                        <ExternalLink size={18} />
                        前往 Supabase Dashboard
                    </a>
                </div>
            </div>
        </div>
    );
};

export default SupabaseSetupWizard;
