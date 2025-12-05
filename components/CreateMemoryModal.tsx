import React, { useState, useRef, useEffect } from 'react';
import { Memory, Mood, MOOD_LABELS, MOOD_EMOJIS } from '../types';
import { X, Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';
import { generateRomanticText, suggestTitle } from '../services/geminiService';

interface CreateMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memory: Omit<Memory, 'id'>) => void;
  initialData?: Memory | null;
}

export const CreateMemoryModal: React.FC<CreateMemoryModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mood, setMood] = useState<Mood>(Mood.ROMANTIC);
  const [image, setImage] = useState<string | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiInput, setShowAiInput] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset or Populate form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setContent(initialData.content);
        setDate(initialData.date);
        setMood(initialData.mood as Mood);
        setImage(initialData.imageUrl || null);
      } else {
        // Reset for new entry
        setTitle('');
        setContent('');
        setDate(new Date().toISOString().split('T')[0]);
        setMood(Mood.ROMANTIC);
        setImage(null);
      }
      setAiPrompt('');
      setShowAiInput(false);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const generatedText = await generateRomanticText(aiPrompt, MOOD_LABELS[mood]);
      setContent(prev => prev ? prev + "\n\n" + generatedText : generatedText);
      setShowAiInput(false);
      setAiPrompt('');
      
      // Auto-suggest title if empty
      if (!title) {
        const suggTitle = await suggestTitle(generatedText);
        setTitle(suggTitle);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: title || 'Momento Especial',
      content,
      date,
      mood,
      imageUrl: image || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-400 to-rose-600 p-6 flex justify-between items-center text-white shrink-0">
          <div>
            <h2 className="text-2xl font-script font-bold">
              {initialData ? 'Editar Memória' : 'Criar Nova Memória'}
            </h2>
            <p className="text-rose-100 text-sm">
              {initialData ? 'Atualize os detalhes deste momento' : 'Eternize este momento'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <form id="create-memory-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Image Uploader */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${image ? 'border-rose-400 bg-rose-50' : 'border-gray-300 hover:border-rose-300 hover:bg-gray-50'}`}
            >
              {image ? (
                <div className="relative group">
                  <img src={image} alt="Preview" className="h-64 w-full object-cover rounded-lg shadow-md" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg text-white font-medium">
                    Trocar foto
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <ImageIcon size={48} className="mb-2 text-rose-300" />
                  <p>Clique para adicionar uma foto especial</p>
                </div>
              )}
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload} 
              />
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Jantar à luz de velas"
                  className="w-full rounded-lg border-gray-200 border focus:border-rose-500 focus:ring focus:ring-rose-200 transition p-2.5 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border-gray-200 border focus:border-rose-500 focus:ring focus:ring-rose-200 transition p-2.5 outline-none"
                  required
                />
              </div>
            </div>

            {/* Mood Selector */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Qual a "vibe" do momento?</label>
               <div className="flex gap-2 flex-wrap">
                 {Object.values(Mood).map((m) => (
                   <button
                    key={m}
                    type="button"
                    onClick={() => setMood(m)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all flex items-center gap-2
                      ${mood === m 
                        ? 'bg-rose-100 border-rose-500 text-rose-700 scale-105 shadow-sm' 
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                   >
                     <span>{MOOD_EMOJIS[m]}</span> {MOOD_LABELS[m]}
                   </button>
                 ))}
               </div>
            </div>

            {/* Content Area with AI */}
            <div className="relative">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">A história</label>
                <button
                  type="button"
                  onClick={() => setShowAiInput(!showAiInput)}
                  className="text-xs flex items-center gap-1 text-rose-600 font-bold hover:text-rose-800 bg-rose-100 px-2 py-1 rounded-md transition"
                >
                  <Sparkles size={12} /> Ajuda Mágica (IA)
                </button>
              </div>

              {showAiInput && (
                <div className="mb-3 bg-rose-50 p-3 rounded-lg border border-rose-200 animate-fade-in-down">
                  <p className="text-xs text-rose-800 mb-2 font-medium">Sobre o que você quer escrever? A IA vai criar algo lindo para você.</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Ex: Como eu me senti quando vi ele sorrindo..."
                      className="flex-1 text-sm rounded-md border-rose-200 p-2 focus:ring-rose-300 focus:border-rose-300 outline-none"
                    />
                    <button 
                      type="button"
                      onClick={handleAiGenerate}
                      disabled={isGenerating}
                      className="bg-rose-500 text-white px-3 py-2 rounded-md text-sm font-bold hover:bg-rose-600 disabled:opacity-50 transition flex items-center gap-1"
                    >
                      {isGenerating ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14} />}
                      Gerar
                    </button>
                  </div>
                </div>
              )}

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva sobre este momento especial..."
                rows={5}
                className="w-full rounded-lg border-gray-200 border focus:border-rose-500 focus:ring focus:ring-rose-200 transition p-3 outline-none resize-none"
                required
              />
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-gray-600 hover:bg-gray-200 font-medium transition"
          >
            Cancelar
          </button>
          <button 
            form="create-memory-form"
            type="submit"
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold hover:shadow-lg hover:from-rose-600 hover:to-pink-700 transition transform hover:-translate-y-0.5"
          >
            {initialData ? 'Atualizar' : 'Salvar Memória'}
          </button>
        </div>

      </div>
    </div>
  );
};