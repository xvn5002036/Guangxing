import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { ChevronLeft, ChevronRight, Clock, MapPin, Calendar as CalendarIcon, Edit3 } from 'lucide-react';
import ServiceModal from './ServiceModal';
import { TempleEvent } from '../types';

const TempleCalendar: React.FC = () => {
    const { events } = useData();
    // Get current real-time date
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(new Date());

    // Helper to format date YYYY-MM-DD
    const formatDateKey = (y: number, m: number, d: number) =>
        `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    // Default select today's date string
    const [selectedDate, setSelectedDate] = useState<string | null>(
        formatDateKey(today.getFullYear(), today.getMonth(), today.getDate())
    );
    const [registerEvent, setRegisterEvent] = useState<TempleEvent | null>(null);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const handleToToday = () => {
        setCurrentDate(new Date());
        setSelectedDate(formatDateKey(today.getFullYear(), today.getMonth(), today.getDate()));
    };

    // Generate grid days
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const getEventsForDay = (day: number) => {
        const dateKey = formatDateKey(year, month, day);
        return events.filter(e => e.date === dateKey);
    };

    const selectedEvents = selectedDate ? events.filter(e => e.date === selectedDate) : [];

    return (
        <section id="calendar" className="py-24 bg-mystic-charcoal relative border-t border-white/5">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <span className="text-mystic-gold text-xs tracking-[0.3em] uppercase block mb-2">Schedule</span>
                    <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">行事曆 & 法會報名</h2>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">

                    {/* Calendar Grid */}
                    <div className="w-full lg:w-2/3 bg-black/40 border border-white/10 rounded-sm p-6 shadow-2xl">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <button onClick={handlePrevMonth} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                                    <ChevronLeft />
                                </button>
                                <button onClick={handleToToday} className="text-xs text-mystic-gold border border-mystic-gold/30 px-2 py-1 hover:bg-mystic-gold hover:text-black transition-all">
                                    今天
                                </button>
                                <button onClick={handleNextMonth} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                                    <ChevronRight />
                                </button>
                            </div>
                            <h3 className="text-2xl font-bold text-mystic-gold tracking-widest font-serif">
                                {year}年 {month + 1}月
                            </h3>
                        </div>

                        {/* Days Header */}
                        <div className="grid grid-cols-7 text-center mb-4 border-b border-white/5 pb-2">
                            {['日', '一', '二', '三', '四', '五', '六'].map((d, i) => (
                                <div key={i} className={`text-sm font-bold ${i === 0 || i === 6 ? 'text-red-500' : 'text-gray-500'}`}>
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-7 gap-1 md:gap-2">
                            {days.map((day, index) => {
                                if (day === null) return <div key={`empty-${index}`} className="aspect-square"></div>;

                                const dateKey = formatDateKey(year, month, day);
                                const dayEvents = getEventsForDay(day);
                                const isSelected = selectedDate === dateKey;
                                const hasEvent = dayEvents.length > 0;
                                const isToday = dateKey === formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

                                return (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDate(dateKey)}
                                        className={`relative aspect-square md:aspect-[4/3] flex flex-col items-center justify-start pt-2 rounded-sm border transition-all duration-200
                                    ${isSelected
                                                ? 'bg-mystic-gold/20 border-mystic-gold text-white'
                                                : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:border-white/10'}
                                    ${isToday && !isSelected ? 'ring-1 ring-mystic-gold/50' : ''}
                                `}
                                    >
                                        <span className={`text-sm md:text-lg font-serif ${hasEvent ? 'font-bold text-gray-200' : ''}`}>
                                            {day}
                                        </span>

                                        {isToday && (
                                            <span className="text-[8px] text-mystic-gold absolute top-1 right-1 font-sans">今</span>
                                        )}

                                        {/* Mobile: Dot */}
                                        {hasEvent && (
                                            <div className="mt-1 md:hidden flex gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                            </div>
                                        )}

                                        {/* Desktop: Event Titles */}
                                        <div className="hidden md:flex flex-col gap-1 w-full px-1 mt-1">
                                            {dayEvents.map((ev, idx) => (
                                                <div key={idx} className={`text-[10px] truncate w-full px-1 py-0.5 rounded text-left
                                            ${ev.type === 'FESTIVAL' ? 'bg-red-900/50 text-red-200' : 'bg-blue-900/50 text-blue-200'}
                                        `}>
                                                    {ev.title}
                                                </div>
                                            ))}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Selected Day Details (Side Panel) */}
                    <div className="w-full lg:w-1/3 flex flex-col">
                        <div className="bg-mystic-dark border-t-4 border-mystic-gold h-full p-6 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-32 bg-mystic-gold/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                            <h4 className="text-gray-500 text-sm tracking-widest uppercase mb-6">
                                {selectedDate ? selectedDate.replace(/-/g, ' . ') : 'Event Details'}
                            </h4>

                            {selectedEvents.length > 0 ? (
                                <div className="space-y-6 relative z-10">
                                    {selectedEvents.map(event => (
                                        <div key={event.id} className="group cursor-default">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`px-2 py-1 text-[10px] font-bold border rounded ${event.type === 'FESTIVAL' ? 'border-red-500 text-red-500' : 'border-blue-500 text-blue-500'
                                                    }`}>
                                                    {event.type === 'FESTIVAL' ? '慶典' : '科儀'}
                                                </span>
                                                <span className="text-gray-400 text-xs font-serif">{event.lunarDate}</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                                            <p className="text-gray-400 text-sm leading-relaxed mb-4">{event.description}</p>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-mystic-gold text-xs">
                                                    <Clock size={12} />
                                                    <span>{event.time}</span>
                                                </div>
                                                <button
                                                    onClick={() => setRegisterEvent(event)}
                                                    className="text-xs bg-mystic-gold text-black px-3 py-1.5 font-bold hover:bg-white transition-colors flex items-center gap-1"
                                                >
                                                    <Edit3 size={12} /> 線上報名
                                                </button>
                                            </div>

                                            <div className="w-full h-[1px] bg-white/10 mt-6 group-last:hidden"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-600 relative z-10">
                                    <CalendarIcon size={48} className="mb-4 opacity-20" />
                                    <p>{selectedDate ? "當日無活動" : "請點選日期查看行程"}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <ServiceModal
                    isOpen={!!registerEvent}
                    onClose={() => setRegisterEvent(null)}
                    service={registerEvent as any}
                    initialEventTitle={registerEvent?.title || ''}
                />
            </div>
        </section>
    );
};

export default TempleCalendar;
