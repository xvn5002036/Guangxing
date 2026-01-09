import React, { useState, useEffect, useMemo } from 'react';
import { X, CreditCard, CheckCircle, AlertTriangle, Search, User, Phone, MapPin, Calendar, Trash2, Edit, RefreshCw, ChevronDown } from 'lucide-react';
import { ServiceItem, Registration, TAIWAN_ADDRESS_DATA, COMMON_ROADS, LUNAR_HOURS } from '../types';
import { useData } from '../context/DataContext';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceItem | null;
  initialEventTitle?: string;
}

const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, service, initialEventTitle }) => {
  const { addRegistration, getRegistrationsByPhone, updateRegistration, deleteRegistration } = useData();
  
  const [mode, setMode] = useState<'REGISTER' | 'LOOKUP'>('REGISTER');
  const [step, setStep] = useState(1);
  const [lookupPhone, setLookupPhone] = useState('');
  const [foundRegistrations, setFoundRegistrations] = useState<Registration[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    phone: '',
    birthYear: '民國70',
    birthMonth: '1',
    birthDay: '1',
    birthHour: '吉時 (不限)',
    city: '台北市',
    district: '中正區',
    road: '',
    isManualRoad: false,
    addressDetail: '',
    amount: service?.price || 600
  });

  // Dynamic lists based on selections
  const cityList = useMemo(() => Object.keys(TAIWAN_ADDRESS_DATA), []);
  const districtList = useMemo(() => TAIWAN_ADDRESS_DATA[formData.city] || [], [formData.city]);
  const roadList = useMemo(() => COMMON_ROADS[formData.district] || [], [formData.district]);

  useEffect(() => {
    if (service) {
      setFormData(prev => ({ ...prev, amount: service.price || 600 }));
    }
  }, [service]);

  // Reset district when city changes
  const handleCityChange = (city: string) => {
    const districts = TAIWAN_ADDRESS_DATA[city] || [];
    setFormData(prev => ({
      ...prev,
      city,
      district: districts[0] || '',
      road: '',
      isManualRoad: (COMMON_ROADS[districts[0]] || []).length === 0
    }));
  };

  // Reset road when district changes
  const handleDistrictChange = (district: string) => {
    const roads = COMMON_ROADS[district] || [];
    setFormData(prev => ({
      ...prev,
      district,
      road: '',
      isManualRoad: roads.length === 0
    }));
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
        const payload = {
          name: formData.name,
          phone: formData.phone,
          birthYear: formData.birthYear,
          birthMonth: formData.birthMonth,
          birthDay: formData.birthDay,
          birthHour: formData.birthHour,
          city: formData.city,
          district: formData.district,
          road: formData.road,
          addressDetail: formData.addressDetail,
          amount: formData.amount
        };

        if (formData.id) {
          updateRegistration(formData.id, payload);
        } else {
          addRegistration({
            serviceId: service?.id || 'EVENT',
            serviceTitle: initialEventTitle || service?.title || '未知服務',
            ...payload,
            status: 'PAID'
          });
        }
        setStep(3);
        setIsProcessing(false);
    }, 1500);
  };

  const handleLookup = () => {
    const results = getRegistrationsByPhone(lookupPhone);
    setFoundRegistrations(results);
    if (results.length === 0) alert('查無此電話之報名紀錄');
  };

  const handleEdit = (reg: Registration) => {
    setFormData({
      id: reg.id,
      name: reg.name,
      phone: reg.phone,
      birthYear: reg.birthYear,
      birthMonth: reg.birthMonth,
      birthDay: reg.birthDay,
      birthHour: reg.birthHour,
      city: reg.city,
      district: reg.district,
      road: reg.road,
      isManualRoad: true, // Allow manual edit of existing
      addressDetail: reg.addressDetail,
      amount: reg.amount
    });
    setMode('REGISTER');
    setStep(1);
  };

  const handleDelete = (id: string) => {
    if (confirm('確定要取消此報名紀錄嗎？')) {
      deleteRegistration(id);
      setFoundRegistrations(prev => prev.filter(r => r.id !== id));
    }
  };

  const reset = () => {
    setStep(1);
    setMode('REGISTER');
    setFormData({
      id: '',
      name: '',
      phone: '',
      birthYear: '民國70',
      birthMonth: '1',
      birthDay: '1',
      birthHour: '吉時 (不限)',
      city: '台北市',
      district: '中正區',
      road: '',
      isManualRoad: false,
      addressDetail: '',
      amount: service?.price || 600
    });
    onClose();
  };

  const title = initialEventTitle ? `報名：${initialEventTitle}` : service?.title || '線上服務';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={reset}></div>
      
      <div className="relative bg-mystic-charcoal border border-mystic-gold/30 w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-black/50 p-6 flex justify-between items-center border-b border-white/5 shrink-0">
            <h3 className="text-xl font-bold text-white font-serif tracking-widest">
              {mode === 'REGISTER' ? (formData.id ? `修改：${title}` : title) : '查詢報名紀錄'}
            </h3>
            <div className="flex items-center gap-4">
               <button 
                onClick={() => setMode(mode === 'REGISTER' ? 'LOOKUP' : 'REGISTER')}
                className="text-xs text-mystic-gold border border-mystic-gold/30 px-3 py-1 rounded hover:bg-mystic-gold hover:text-black transition-all flex items-center gap-1"
               >
                 {mode === 'REGISTER' ? <Search size={12} /> : <User size={12} />}
                 {mode === 'REGISTER' ? '查詢/修改紀錄' : '返回報名'}
               </button>
               <button onClick={reset} className="text-gray-400 hover:text-white"><X /></button>
            </div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
            {mode === 'REGISTER' ? (
                <>
                {step === 1 && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 姓名與電話 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-400 text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                                  <User size={14} className="text-mystic-gold" /> 信眾姓名
                                </label>
                                <input required type="text" className="w-full bg-black/40 border border-white/10 p-3 text-white focus:border-mystic-gold outline-none rounded-sm" 
                                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="請輸入姓名" />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                                  <Phone size={14} className="text-mystic-gold" /> 聯絡電話
                                </label>
                                <input required type="tel" className="w-full bg-black/40 border border-white/10 p-3 text-white focus:border-mystic-gold outline-none rounded-sm" 
                                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="09XX-XXXXXX" />
                            </div>
                        </div>

                        {/* 農曆生辰選單 */}
                        <div>
                            <label className="block text-gray-400 text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                              <Calendar size={14} className="text-mystic-gold" /> 農曆生辰
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                <select className="bg-black border border-white/10 p-2 text-white outline-none focus:border-mystic-gold cursor-pointer" value={formData.birthYear} onChange={e => setFormData({...formData, birthYear: e.target.value})}>
                                    {Array.from({length: 100}, (_, i) => 114 - i).map(y => (
                                        <option key={y} value={`民國${y}`}>民國{y}年</option>
                                    ))}
                                </select>
                                <select className="bg-black border border-white/10 p-2 text-white outline-none focus:border-mystic-gold cursor-pointer" value={formData.birthMonth} onChange={e => setFormData({...formData, birthMonth: e.target.value})}>
                                    {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                                        <option key={m} value={m}>{m}月</option>
                                    ))}
                                </select>
                                <select className="bg-black border border-white/10 p-2 text-white outline-none focus:border-mystic-gold cursor-pointer" value={formData.birthDay} onChange={e => setFormData({...formData, birthDay: e.target.value})}>
                                    {Array.from({length: 30}, (_, i) => i + 1).map(d => (
                                        <option key={d} value={d}>{d}日</option>
                                    ))}
                                </select>
                                <select className="bg-black border border-white/10 p-2 text-white outline-none focus:border-mystic-gold cursor-pointer" value={formData.birthHour} onChange={e => setFormData({...formData, birthHour: e.target.value})}>
                                    {LUNAR_HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* 通訊地址選單 - 三級聯動 */}
                        <div>
                            <label className="block text-gray-400 text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                              <MapPin size={14} className="text-mystic-gold" /> 通訊地址
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                                {/* 縣市 */}
                                <select 
                                  className="bg-black border border-white/10 p-2 text-white outline-none focus:border-mystic-gold cursor-pointer" 
                                  value={formData.city} 
                                  onChange={e => handleCityChange(e.target.value)}
                                >
                                    {cityList.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                
                                {/* 鄉鎮市區 */}
                                <select 
                                  className="bg-black border border-white/10 p-2 text-white outline-none focus:border-mystic-gold cursor-pointer" 
                                  value={formData.district} 
                                  onChange={e => handleDistrictChange(e.target.value)}
                                >
                                    {districtList.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>

                                {/* 路/街 選擇器 */}
                                {!formData.isManualRoad ? (
                                  <div className="relative">
                                    <select 
                                      className="w-full bg-black border border-white/10 p-2 text-white outline-none focus:border-mystic-gold cursor-pointer pr-8" 
                                      value={formData.road} 
                                      onChange={e => {
                                        if (e.target.value === "__manual__") {
                                          setFormData({...formData, isManualRoad: true, road: ''});
                                        } else {
                                          setFormData({...formData, road: e.target.value});
                                        }
                                      }}
                                    >
                                        <option value="" disabled>選擇路街</option>
                                        {roadList.map(r => <option key={r} value={r}>{r}</option>)}
                                        <option value="__manual__">+ 其他路街 (手寫)</option>
                                    </select>
                                  </div>
                                ) : (
                                  <div className="flex gap-1">
                                    <input 
                                      required 
                                      className="flex-1 bg-black border border-white/10 p-2 text-white outline-none focus:border-mystic-gold" 
                                      placeholder="請輸入路/街名" 
                                      value={formData.road} 
                                      onChange={e => setFormData({...formData, road: e.target.value})} 
                                    />
                                    {roadList.length > 0 && (
                                      <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, isManualRoad: false})}
                                        className="px-2 bg-gray-800 text-xs text-gray-400 hover:text-white"
                                      >
                                        返回列表
                                      </button>
                                    )}
                                  </div>
                                )}
                            </div>
                            {/* 詳細門牌 */}
                            <input 
                              required 
                              className="w-full bg-black border border-white/10 p-2 text-white outline-none focus:border-mystic-gold" 
                              placeholder="詳細門牌號碼、樓層 (例如：10號2樓)" 
                              value={formData.addressDetail} 
                              onChange={e => setFormData({...formData, addressDetail: e.target.value})} 
                            />
                        </div>

                        <div className="bg-black/20 p-4 border-l-4 border-mystic-gold flex justify-between items-center">
                            <span className="text-gray-400">合計緣金</span>
                            <span className="text-2xl font-bold text-mystic-gold">NT$ {formData.amount}</span>
                        </div>
                        
                        <button type="submit" className="w-full py-4 bg-mystic-gold text-black font-bold tracking-widest hover:bg-white transition-colors shadow-lg">
                            {formData.id ? '確認修改內容' : '下一步：確認付款'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <div className="text-center space-y-6">
                        <p className="text-gray-300">請選擇支付方式完成登記</p>
                        <div className="text-3xl font-bold text-mystic-gold font-serif">NT$ {formData.amount}</div>
                        
                        <div className="bg-red-900/20 border border-red-500/30 p-4 rounded text-sm text-red-400 text-left">
                            <div className="flex items-center gap-2 font-bold mb-1 text-red-300">
                                <AlertTriangle size={16} />
                                <span>測試模式</span>
                            </div>
                            <p className="opacity-80">點擊下方按鈕將模擬付款成功流程，不會扣取真實費用。</p>
                        </div>

                        <div className="space-y-3">
                            <button onClick={handlePayment} disabled={isProcessing} className="w-full p-4 border border-white/10 flex items-center justify-center gap-3 hover:bg-white/5 transition-colors text-white group disabled:opacity-50">
                                {isProcessing ? <RefreshCw className="animate-spin" size={20}/> : <CreditCard size={20} className="text-gray-400 group-hover:text-mystic-gold" />}
                                <span>{isProcessing ? '處理中...' : '信用卡支付 (模擬)'}</span>
                            </button>
                            <button onClick={handlePayment} disabled={isProcessing} className="w-full p-4 border border-white/10 flex items-center justify-center gap-3 hover:bg-white/5 transition-colors text-white group disabled:opacity-50">
                                <span className="font-bold text-gray-400 group-hover:text-mystic-gold">ATM</span> 
                                <span>虛擬轉帳 (模擬)</span>
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="text-center py-12 animate-fade-in-up">
                        <div className="w-20 h-20 bg-green-900/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} />
                        </div>
                        <h4 className="text-2xl font-bold text-white mb-2">{formData.id ? '修改成功' : '報名圓滿'}</h4>
                        <p className="text-gray-400 mb-8 max-w-xs mx-auto">
                            感謝您的支持！疏文已紀錄於系統，將於吉時稟報王爺。祝您闔家平安。
                        </p>
                        <button onClick={reset} className="px-8 py-3 bg-mystic-gold text-black font-bold tracking-widest hover:bg-white transition-colors">
                            關閉視窗
                        </button>
                    </div>
                )}
                </>
            ) : (
                /* LOOKUP MODE */
                <div className="space-y-6 min-h-[400px]">
                    <div className="flex gap-2">
                        <input 
                            type="tel" 
                            className="flex-1 bg-black/40 border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" 
                            placeholder="輸入手機號碼查詢紀錄"
                            value={lookupPhone}
                            onChange={e => setLookupPhone(e.target.value)}
                        />
                        <button onClick={handleLookup} className="bg-mystic-gold text-black px-6 py-3 font-bold">查詢</button>
                    </div>

                    <div className="space-y-4">
                        {foundRegistrations.length > 0 ? (
                            foundRegistrations.map(reg => (
                                <div key={reg.id} className="bg-black/30 border border-white/5 p-4 rounded flex justify-between items-center group">
                                    <div>
                                        <div className="text-mystic-gold font-bold mb-1">{reg.serviceTitle}</div>
                                        <div className="text-sm text-gray-400">
                                            信眾：{reg.name} | 金額：${reg.amount}
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1">報名時間：{new Date(reg.createdAt).toLocaleString()}</div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(reg)} className="p-2 bg-blue-900/20 text-blue-400 hover:bg-blue-900/40 rounded"><Edit size={16}/></button>
                                        <button onClick={() => handleDelete(reg.id)} className="p-2 bg-red-900/20 text-red-400 hover:bg-red-900/40 rounded"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-600 py-12">
                                <Search size={48} className="mx-auto mb-4 opacity-10" />
                                <p>請輸入電話號碼以檢視歷史報名資料</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;
