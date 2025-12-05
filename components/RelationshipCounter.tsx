
import React, { useState, useEffect } from 'react';
import { Edit2, Heart, Save, Clock, CalendarHeart } from 'lucide-react';

interface RelationshipCounterProps {
  startDate: string | null;
  onSaveDate: (date: string) => void;
}

export const RelationshipCounter: React.FC<RelationshipCounterProps> = ({ startDate, onSaveDate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempDate, setTempDate] = useState('');
  const [duration, setDuration] = useState({ years: 0, months: 0, days: 0 });

  useEffect(() => {
    if (startDate) {
      const calculateDuration = () => {
        const parts = startDate.split('-');
        // Create date in local time to avoid timezone issues
        const start = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const now = new Date();
        
        // Clear time portion for accurate day calculation
        now.setHours(0, 0, 0, 0);
        
        if (start > now) {
            setDuration({ years: 0, months: 0, days: 0 });
            return;
        }

        let years = now.getFullYear() - start.getFullYear();
        let months = now.getMonth() - start.getMonth();
        let days = now.getDate() - start.getDate();

        if (days < 0) {
            months--;
            // Get days in previous month
            const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            days += prevMonth.getDate();
        }
        
        if (months < 0) {
            years--;
            months += 12;
        }
        setDuration({ years, months, days });
      };
      
      calculateDuration();
    }
  }, [startDate]);

  const handleSave = () => {
    if (tempDate) {
      onSaveDate(tempDate);
      setIsEditing(false);
    }
  };
  
  const startEditing = () => {
      setTempDate(startDate || new Date().toISOString().split('T')[0]);
      setIsEditing(true);
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6 mb-8 max-w-2xl mx-auto animate-fade-in-down">
        <div className="flex flex-col items-center gap-4">
            <h3 className="text-xl font-script font-bold text-rose-600">Quando tudo começou?</h3>
            <div className="flex gap-2 w-full max-w-xs">
                <input 
                    type="date" 
                    value={tempDate}
                    onChange={(e) => setTempDate(e.target.value)}
                    className="flex-1 border-gray-300 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-rose-300 outline-none text-gray-700"
                />
                <button 
                    onClick={handleSave}
                    className="bg-rose-500 text-white p-2 rounded-lg hover:bg-rose-600 transition shadow-md"
                    title="Salvar Data"
                >
                    <Save size={20} />
                </button>
            </div>
        </div>
      </div>
    );
  }

  if (!startDate) {
     return (
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-rose-100 p-6 mb-8 max-w-2xl mx-auto text-center">
            <div className="flex flex-col items-center gap-3">
                <div className="bg-rose-100 p-3 rounded-full text-rose-500">
                    <CalendarHeart size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-700">Há quanto tempo vocês estão juntos?</h3>
                <button 
                    onClick={startEditing}
                    className="text-rose-600 font-bold hover:text-rose-700 hover:underline transition"
                >
                    Definir data de início
                </button>
            </div>
        </div>
     );
  }

  const [sYear, sMonth, sDay] = startDate.split('-').map(Number);
  const formattedStartDate = new Date(sYear, sMonth - 1, sDay).toLocaleDateString('pt-BR');

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6 mb-8 max-w-4xl mx-auto relative group overflow-hidden">
       {/* Background decoration */}
       <div className="absolute top-0 right-0 -mt-4 -mr-4 text-rose-50 opacity-50">
           <Heart size={120} fill="currentColor" />
       </div>

       <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-3">
               <div className="bg-rose-500 p-3 rounded-xl text-white shadow-lg shadow-rose-200">
                   <Clock size={24} />
               </div>
               <div>
                   <h2 className="font-script text-2xl font-bold text-gray-800">Nosso Tempo Juntos</h2>
                   <p className="text-rose-400 text-sm font-medium">Desde {formattedStartDate}</p>
               </div>
           </div>

           <div className="flex gap-4 items-center">
               <div className="text-center px-4">
                   <span className="block text-3xl md:text-4xl font-bold text-gray-800 font-script">{duration.years}</span>
                   <span className="text-xs text-gray-500 uppercase tracking-wider">Anos</span>
               </div>
               <div className="h-8 w-px bg-rose-200"></div>
               <div className="text-center px-4">
                   <span className="block text-3xl md:text-4xl font-bold text-gray-800 font-script">{duration.months}</span>
                   <span className="text-xs text-gray-500 uppercase tracking-wider">Meses</span>
               </div>
               <div className="h-8 w-px bg-rose-200"></div>
               <div className="text-center px-4">
                   <span className="block text-3xl md:text-4xl font-bold text-gray-800 font-script">{duration.days}</span>
                   <span className="text-xs text-gray-500 uppercase tracking-wider">Dias</span>
               </div>
           </div>

           <button 
               onClick={startEditing}
               className="absolute top-4 right-4 text-gray-300 hover:text-rose-500 transition opacity-0 group-hover:opacity-100"
               title="Editar data"
           >
               <Edit2 size={18} />
           </button>
       </div>
    </div>
  );
};
