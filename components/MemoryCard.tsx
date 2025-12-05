import React, { useState, useEffect } from 'react';
import { Memory, MOOD_EMOJIS, Mood } from '../types';
import { Trash2, Calendar, Check, X, Edit2 } from 'lucide-react';

interface MemoryCardProps {
  memory: Memory;
  onDelete: (id: string) => void;
  onEdit: (memory: Memory) => void;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onDelete, onEdit }) => {
  const [isConfirming, setIsConfirming] = useState(false);

  // Reset confirmation state if user doesn't click within 3 seconds
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (isConfirming) {
      timeout = setTimeout(() => setIsConfirming(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [isConfirming]);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (isConfirming) {
      onDelete(memory.id);
    } else {
      setIsConfirming(true);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirming(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(memory);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col group border border-rose-100 relative h-full">
      {memory.imageUrl && (
        <div className="relative h-56 w-full overflow-hidden shrink-0">
          <img 
            src={memory.imageUrl} 
            alt={memory.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full text-lg shadow-sm z-10">
            {MOOD_EMOJIS[memory.mood as Mood]}
          </div>
        </div>
      )}
      
      {!memory.imageUrl && (
        <div className="h-4 bg-gradient-to-r from-rose-300 to-rose-400 w-full shrink-0" />
      )}

      <div className="p-6 flex-1 flex flex-col relative">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider flex items-center gap-1">
             <Calendar size={12} /> {new Date(memory.date).toLocaleDateString('pt-BR')}
          </span>
        </div>
        
        <h3 className="font-script text-3xl text-gray-800 mb-3 break-words">{memory.title}</h3>
        
        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap flex-1 text-sm md:text-base break-words">
          {memory.content}
        </p>

        <div className="mt-6 pt-4 border-t border-rose-50 flex justify-end items-center h-10 gap-2">
          {isConfirming ? (
             <div className="flex items-center gap-2 animate-fade-in">
                <span className="text-xs text-rose-600 font-bold mr-1">Excluir?</span>
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  className="bg-gray-200 text-gray-600 p-2 rounded-full hover:bg-gray-300 transition-colors"
                  title="Cancelar"
                >
                   <X size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-md"
                  title="Confirmar exclusão"
                >
                   <Check size={16} />
                </button>
             </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleEditClick}
                className="relative z-10 cursor-pointer text-rose-400 hover:text-rose-600 transition-colors p-2 rounded-full hover:bg-rose-50 active:bg-rose-100"
                title="Editar memória"
              >
                <Edit2 size={20} />
              </button>
              <button 
                type="button"
                onClick={handleDeleteClick}
                className="relative z-10 cursor-pointer text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-100 active:bg-gray-200"
                title="Apagar memória"
                aria-label="Apagar memória"
              >
                <Trash2 size={20} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};