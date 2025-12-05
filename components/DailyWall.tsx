import React, { useState, useEffect } from 'react';
import { generateDailyMessage, generateAffectionMessage } from '../services/geminiService';
import { Calendar, Quote, History, Heart, Sparkles, RefreshCw, Loader2, Edit2, Save, X } from 'lucide-react';
import { useSharedState } from '../hooks/useSharedState';

interface DailyItem {
  date: string;
  content: string;
}

export const DailyWall: React.FC = () => {
  // Use shared state for messages
  const [loveMessages, setLoveMessages] = useSharedState<DailyItem[]>('love_daily_messages', []);
  const [affectionMessages, setAffectionMessages] = useSharedState<DailyItem[]>('love_daily_affections', []);
  
  const [loadingLove, setLoadingLove] = useState(false);
  const [loadingAffection, setLoadingAffection] = useState(false);

  // Editing state
  const [editingType, setEditingType] = useState<'love' | 'affection' | null>(null);
  const [tempContent, setTempContent] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const todayLove = loveMessages.find(m => m.date === today) || null;
  const todayAffection = affectionMessages.find(m => m.date === today) || null;

  // Auto-generate content if missing for today
  useEffect(() => {
    const generateIfNeeded = async () => {
      // Check Love Message
      if (!todayLove && !loadingLove && loveMessages.length === 0) { 
         // Initial load check
      }
      
      if (!todayLove && !loadingLove) {
        setLoadingLove(true);
        try {
          const text = await generateDailyMessage();
          const newItem = { date: today, content: text };
          setLoveMessages(prev => [newItem, ...prev]);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingLove(false);
        }
      }

      // Check Affection Message
      if (!todayAffection && !loadingAffection) {
        setLoadingAffection(true);
        try {
          const text = await generateAffectionMessage();
          const newItem = { date: today, content: text };
          setAffectionMessages(prev => [newItem, ...prev]);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingAffection(false);
        }
      }
    };

    generateIfNeeded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today]);

  const handleRefreshLove = async () => {
    setLoadingLove(true);
    try {
        const text = await generateDailyMessage();
        setLoveMessages(prev => {
            // Remove old today message if exists
            const filtered = prev.filter(m => m.date !== today);
            return [{ date: today, content: text }, ...filtered];
        });
    } catch (e) {
        console.error(e);
    } finally {
        setLoadingLove(false);
    }
  };

  const handleRefreshAffection = async () => {
    setLoadingAffection(true);
    try {
        const text = await generateAffectionMessage();
        setAffectionMessages(prev => {
            const filtered = prev.filter(m => m.date !== today);
            return [{ date: today, content: text }, ...filtered];
        });
    } catch (e) {
        console.error(e);
    } finally {
        setLoadingAffection(false);
    }
  };

  const startEditing = (type: 'love' | 'affection', content: string) => {
    setEditingType(type);
    setTempContent(content);
  };

  const saveEdit = () => {
    if (!editingType) return;
    
    if (editingType === 'love') {
        setLoveMessages(prev => {
            const filtered = prev.filter(m => m.date !== today);
            return [{ date: today, content: tempContent }, ...filtered];
        });
    } else {
        setAffectionMessages(prev => {
            const filtered = prev.filter(m => m.date !== today);
            return [{ date: today, content: tempContent }, ...filtered];
        });
    }
    setEditingType(null);
  };

  const cancelEdit = () => {
    setEditingType(null);
    setTempContent('');
  };

  const historyLove = loveMessages.filter(m => m.date !== today);
  const historyAffection = affectionMessages.filter(m => m.date !== today);

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-script font-bold text-rose-600 mb-2">Nossas Palavras do Dia</h2>
        <p className="text-gray-500">Palavras que tocam a alma e aquecem o dia.</p>
      </div>

      {/* Today's Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        
        {/* Love Wall (Deep) */}
        <div className="relative group h-full">
           <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-red-100 rounded-3xl transform -rotate-1 group-hover:rotate-0 transition-transform duration-500"></div>
           <div className="bg-white rounded-3xl shadow-lg p-8 relative border border-rose-100 h-full flex flex-col items-center text-center hover:shadow-xl transition-shadow">
             
             {/* Edit Button */}
             {!editingType && !loadingLove && (
                 <button 
                    onClick={() => startEditing('love', todayLove?.content || '')}
                    className="absolute top-4 right-4 text-rose-300 hover:text-rose-500 p-2 rounded-full hover:bg-rose-50 transition opacity-0 group-hover:opacity-100"
                    title="Editar mensagem"
                 >
                    <Edit2 size={18} />
                 </button>
             )}

             <div className="bg-rose-100 text-rose-500 p-4 rounded-full mb-6 shadow-sm">
                <Heart size={32} fill="currentColor" className="text-rose-500" />
             </div>
             
             <h3 className="text-sm font-bold text-rose-300 mb-6 uppercase tracking-widest flex items-center gap-2">
               Palavras do Dia
               <button 
                  onClick={handleRefreshLove} 
                  disabled={loadingLove || editingType === 'love'}
                  className="hover:bg-rose-50 p-1.5 rounded-full transition-colors text-rose-300 hover:text-rose-500 disabled:opacity-30"
                  title="Gerar nova mensagem"
               >
                  <RefreshCw size={14} className={loadingLove ? "animate-spin" : ""} />
               </button>
             </h3>

             <div className="flex-1 flex items-center justify-center w-full">
                {loadingLove && !todayLove ? (
                  <div className="py-8 flex flex-col items-center gap-3">
                    <Loader2 size={24} className="animate-spin text-rose-400" />
                    <p className="text-rose-300 text-sm animate-pulse">Buscando sentimentos...</p>
                  </div>
                ) : (
                  editingType === 'love' ? (
                     <div className="w-full flex flex-col gap-3 animate-fade-in">
                        <textarea
                           value={tempContent}
                           onChange={(e) => setTempContent(e.target.value)}
                           className="w-full font-script text-3xl text-gray-700 text-center border-b-2 border-rose-200 focus:border-rose-500 outline-none bg-rose-50/50 resize-none leading-relaxed p-4 rounded-t-lg"
                           rows={4}
                           autoFocus
                           placeholder="Escreva sua mensagem de amor..."
                        />
                        <div className="flex justify-center gap-2">
                           <button onClick={cancelEdit} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition" title="Cancelar"><X size={20}/></button>
                           <button onClick={saveEdit} className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition" title="Salvar"><Save size={20}/></button>
                        </div>
                     </div>
                  ) : (
                    <blockquote className="font-script text-3xl text-gray-700 leading-relaxed px-4 whitespace-pre-wrap">
                        "{todayLove?.content}"
                    </blockquote>
                  )
                )}
             </div>
           </div>
        </div>

        {/* Affection Wall (Sweet/Cute) */}
        <div className="relative group h-full">
           <div className="absolute inset-0 bg-gradient-to-bl from-pink-50 to-purple-50 rounded-3xl transform rotate-1 group-hover:rotate-0 transition-transform duration-500"></div>
           <div className="bg-white rounded-3xl shadow-lg p-8 relative border border-pink-100 h-full flex flex-col items-center text-center hover:shadow-xl transition-shadow">
             
             {/* Edit Button */}
             {!editingType && !loadingAffection && (
                 <button 
                    onClick={() => startEditing('affection', todayAffection?.content || '')}
                    className="absolute top-4 right-4 text-pink-300 hover:text-pink-500 p-2 rounded-full hover:bg-pink-50 transition opacity-0 group-hover:opacity-100"
                    title="Editar mensagem"
                 >
                    <Edit2 size={18} />
                 </button>
             )}

             <div className="bg-pink-100 text-pink-500 p-4 rounded-full mb-6 shadow-sm">
                <Sparkles size={32} />
             </div>
             
             <h3 className="text-sm font-bold text-pink-300 mb-6 uppercase tracking-widest flex items-center gap-2">
               Palavras do Dia
               <button 
                  onClick={handleRefreshAffection} 
                  disabled={loadingAffection || editingType === 'affection'}
                  className="hover:bg-pink-50 p-1.5 rounded-full transition-colors text-pink-300 hover:text-pink-500 disabled:opacity-30"
                  title="Gerar nova mensagem"
               >
                  <RefreshCw size={14} className={loadingAffection ? "animate-spin" : ""} />
               </button>
             </h3>

             <div className="flex-1 flex items-center justify-center w-full">
                {loadingAffection && !todayAffection ? (
                  <div className="py-8 flex flex-col items-center gap-3">
                    <Loader2 size={24} className="animate-spin text-pink-400" />
                    <p className="text-pink-300 text-sm animate-pulse">Criando chamego...</p>
                  </div>
                ) : (
                   editingType === 'affection' ? (
                     <div className="w-full flex flex-col gap-3 animate-fade-in">
                        <textarea
                           value={tempContent}
                           onChange={(e) => setTempContent(e.target.value)}
                           className="w-full font-serif italic text-xl text-gray-600 text-center border-b-2 border-pink-200 focus:border-pink-500 outline-none bg-pink-50/50 resize-none leading-relaxed p-4 rounded-t-lg"
                           rows={4}
                           autoFocus
                           placeholder="Escreva sua mensagem de carinho..."
                        />
                        <div className="flex justify-center gap-2">
                           <button onClick={cancelEdit} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition" title="Cancelar"><X size={20}/></button>
                           <button onClick={saveEdit} className="p-2 text-pink-500 hover:text-pink-600 hover:bg-pink-50 rounded-full transition" title="Salvar"><Save size={20}/></button>
                        </div>
                     </div>
                  ) : (
                    <p className="text-xl font-medium text-gray-600 leading-relaxed px-4 font-serif italic whitespace-pre-wrap">
                        "{todayAffection?.content}"
                    </p>
                  )
                )}
             </div>
           </div>
        </div>

      </div>

      {/* History Section */}
      {(historyLove.length > 0 || historyAffection.length > 0) && (
        <div className="border-t border-rose-100 pt-12">
          <div className="flex items-center justify-center gap-3 mb-10">
            <History className="text-rose-400" size={24} />
            <h3 className="text-2xl font-script font-bold text-gray-700">Arquivo de Sentimentos</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Love History */}
            <div>
               <h4 className="text-center font-bold text-rose-400 mb-6 uppercase text-xs tracking-wider flex items-center justify-center gap-2">
                 <Quote size={12} /> Palavras do Dia - Amor
               </h4>
               <div className="grid grid-cols-2 gap-4">
                 {historyLove.map((msg, index) => (
                   <div key={index} className="bg-white p-4 rounded-xl border border-rose-50 shadow-sm hover:shadow-md transition flex flex-col h-32 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-2 opacity-10">
                         <Heart size={40} className="text-rose-200" fill="currentColor"/>
                      </div>
                      <div className="text-[10px] font-bold text-rose-300 mb-2 flex items-center gap-1 uppercase tracking-wide">
                        <Calendar size={10} /> {new Date(msg.date).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-700 font-script text-base text-center line-clamp-3 leading-tight">"{msg.content}"</p>
                      </div>
                   </div>
                 ))}
                 {historyLove.length === 0 && <p className="text-center text-gray-400 text-sm italic col-span-2">Nenhum histórico ainda.</p>}
               </div>
            </div>

            {/* Affection History */}
            <div>
               <h4 className="text-center font-bold text-pink-400 mb-6 uppercase text-xs tracking-wider flex items-center justify-center gap-2">
                 <Sparkles size={12} /> Palavras do Dia - Carinho
               </h4>
               <div className="grid grid-cols-2 gap-4">
                 {historyAffection.map((msg, index) => (
                   <div key={index} className="bg-white p-4 rounded-xl border border-pink-50 shadow-sm hover:shadow-md transition flex flex-col h-32 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-2 opacity-10">
                         <Sparkles size={40} className="text-pink-200" />
                      </div>
                      <div className="text-[10px] font-bold text-pink-300 mb-2 flex items-center gap-1 uppercase tracking-wide">
                        <Calendar size={10} /> {new Date(msg.date).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-600 font-serif italic text-sm text-center line-clamp-3 leading-tight">"{msg.content}"</p>
                      </div>
                   </div>
                 ))}
                 {historyAffection.length === 0 && <p className="text-center text-gray-400 text-sm italic col-span-2">Nenhum histórico ainda.</p>}
               </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};