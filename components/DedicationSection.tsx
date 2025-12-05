import React, { useState } from 'react';
import { PenTool, Save, Quote, HeartHandshake, X } from 'lucide-react';
import { useSharedState } from '../hooks/useSharedState';

interface DedicationData {
  id: number;
  author: string;
  text: string;
}

const DEFAULT_DEDICATIONS: DedicationData[] = [
  { id: 1, author: 'Sua Dedicatória', text: 'Clique aqui para escrever uma mensagem especial que ficará gravada para sempre...' },
  { id: 2, author: 'Sua Dedicatória', text: 'Este espaço é todo seu. Escreva votos, poemas ou apenas diga o quanto você ama...' }
];

export const DedicationSection: React.FC = () => {
  // Use shared state for real-time sync
  const [dedications, setDedications] = useSharedState<DedicationData[]>('love_dedications', DEFAULT_DEDICATIONS);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Temporary state for editing
  const [tempAuthor, setTempAuthor] = useState('');
  const [tempText, setTempText] = useState('');

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (editingId === null) return;

    setDedications(prev => prev.map(d => 
      d.id === editingId ? { ...d, author: tempAuthor, text: tempText } : d
    ));

    setEditingId(null);
  };

  const startEditing = (dedication: DedicationData) => {
    setTempAuthor(dedication.author);
    setTempText(dedication.text);
    setEditingId(dedication.id);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  }

  return (
    <div className="mt-16 mb-8 animate-fade-in-up">
      <div className="flex items-center justify-center gap-3 mb-8">
        <HeartHandshake className="text-rose-400" size={32} />
        <h2 className="text-3xl font-script font-bold text-gray-800 text-center">Nossas Promessas</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {dedications.map((dedication) => (
          <div 
            key={dedication.id} 
            className={`rounded-xl shadow-md border relative transition-all duration-300 ${editingId === dedication.id ? 'bg-white border-rose-300 ring-4 ring-rose-50' : 'bg-[#fff9fa] border-rose-100 hover:shadow-lg cursor-pointer'}`}
            onClick={() => editingId !== dedication.id && startEditing(dedication)}
          >
            {/* Quote Icon Background */}
            <div className="absolute top-4 right-4 opacity-10 text-rose-500 pointer-events-none">
              <Quote size={64} />
            </div>

            <div className="p-8 relative z-10 h-full">
              {editingId === dedication.id ? (
                <div className="flex flex-col gap-4 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">Título / De</label>
                    <input
                      type="text"
                      value={tempAuthor}
                      onChange={(e) => setTempAuthor(e.target.value)}
                      className="w-full text-xl font-script text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-300 focus:bg-white outline-none transition-all"
                      placeholder="Seu nome..."
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">Sua mensagem</label>
                    <textarea
                      value={tempText}
                      onChange={(e) => setTempText(e.target.value)}
                      rows={6}
                      className="w-full text-gray-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-300 focus:bg-white outline-none resize-none leading-relaxed transition-all"
                      placeholder="Escreva algo do fundo do coração..."
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-rose-50">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition flex items-center gap-1"
                    >
                      <X size={16} /> Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="flex items-center gap-2 px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition shadow-md font-medium text-sm hover:-translate-y-0.5"
                    >
                      <Save size={16} /> Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <div className="flex justify-between items-start mb-4 pb-2 border-b border-rose-100">
                    <h3 className="text-2xl font-script text-rose-600 pr-8">
                      {dedication.author}
                    </h3>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(dedication);
                      }}
                      className="text-rose-300 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-full transition"
                      title="Editar dedicatória"
                    >
                      <PenTool size={18} />
                    </button>
                  </div>
                  <p className="text-gray-600 leading-loose italic whitespace-pre-wrap font-serif text-lg flex-1">
                    "{dedication.text}"
                  </p>
                  <p className="text-xs text-rose-300 mt-4 text-center font-medium opacity-60">
                    Clique para editar
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};