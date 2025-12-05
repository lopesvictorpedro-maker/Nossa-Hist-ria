import React, { useState } from 'react';
import { Memory } from './types';
import { MemoryCard } from './components/MemoryCard';
import { CreateMemoryModal } from './components/CreateMemoryModal';
import { RelationshipCounter } from './components/RelationshipCounter';
import { DedicationSection } from './components/DedicationSection';
import { DailyWall } from './components/DailyWall';
import { SyncModal } from './components/SyncModal';
import { useSharedState } from './hooks/useSharedState';
import { LiveSyncProvider, useLiveSync } from './contexts/LiveSyncContext';
import { Heart, Plus, BookHeart, LayoutGrid, MessageCircleHeart, Share2, Wifi } from 'lucide-react';

// Wrapper component to use context
const AppContent: React.FC = () => {
  // Use shared state for real-time sync across tabs
  const [memories, setMemories] = useSharedState<Memory[]>('love_memories', [{
    id: 'init-1',
    title: 'Nosso Começo',
    content: 'Bem-vindo ao seu diário de amor. Clique no botão "+" para começar a adicionar suas memórias favoritas, fotos e textos gerados com ajuda da nossa IA romântica.',
    date: new Date().toISOString().split('T')[0],
    mood: 'romantic',
    imageUrl: 'https://picsum.photos/800/600'
  }]);
  
  const [startDate, setStartDate] = useSharedState<string | null>('relationship_start_date', null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'journal' | 'wall'>('journal');

  const { connectionStatus } = useLiveSync();

  const handleSaveMemory = (memoryData: Omit<Memory, 'id'>) => {
    if (editingMemory) {
      // Update existing memory
      setMemories(prev => prev.map(m => 
        m.id === editingMemory.id 
          ? { ...memoryData, id: m.id } 
          : m
      ));
    } else {
      // Create new memory
      const newMemory: Memory = {
        ...memoryData,
        id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
      };
      // Add new memory to the top of the list
      setMemories(prev => [newMemory, ...prev]);
    }
  };

  const deleteMemory = (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
  };

  const openCreateModal = () => {
    setEditingMemory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (memory: Memory) => {
    setEditingMemory(memory);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen pb-20 font-sans selection:bg-rose-200 selection:text-rose-900">
      
      {/* Hero Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30 bg-opacity-90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('journal')}>
            <div className="bg-rose-100 p-2 rounded-full">
              <Heart className="text-rose-600 fill-rose-600" size={24} />
            </div>
            <h1 className="text-2xl md:text-3xl font-script text-gray-800 font-bold pt-1">Nossa História</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSyncModalOpen(true)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors font-medium border ${connectionStatus === 'connected' ? 'bg-green-50 text-green-600 border-green-200' : 'text-rose-500 hover:bg-rose-50 border-transparent'}`}
              title="Sincronizar com seu amor"
            >
              {connectionStatus === 'connected' ? <Wifi size={20} /> : <Share2 size={20} />}
              <span className="hidden sm:inline">{connectionStatus === 'connected' ? 'Conectado' : 'Sincronizar'}</span>
            </button>

            <button 
              onClick={openCreateModal}
              className={`hidden md:flex items-center gap-2 bg-rose-500 text-white px-5 py-2.5 rounded-full font-bold shadow-md hover:bg-rose-600 hover:shadow-lg transition-all transform hover:-translate-y-0.5 ${activeTab !== 'journal' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
              <Plus size={20} />
              Nova Memória
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex justify-center mb-6">
          <div className="bg-white/50 p-1 rounded-full shadow-sm flex backdrop-blur-sm border border-rose-100">
            <button
              onClick={() => setActiveTab('journal')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                activeTab === 'journal' 
                  ? 'bg-rose-500 text-white shadow-md' 
                  : 'text-gray-500 hover:text-rose-500 hover:bg-white/50'
              }`}
            >
              <LayoutGrid size={18} />
              Diário
            </button>
            <button
              onClick={() => setActiveTab('wall')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                activeTab === 'wall' 
                  ? 'bg-rose-500 text-white shadow-md' 
                  : 'text-gray-500 hover:text-rose-500 hover:bg-white/50'
              }`}
            >
              <MessageCircleHeart size={18} />
              Mural
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        {activeTab === 'journal' ? (
          <div className="animate-fade-in">
            <RelationshipCounter startDate={startDate} onSaveDate={setStartDate} />

            {memories.length === 0 ? (
              <div className="text-center py-20 animate-fade-in-up">
                <div className="bg-white p-10 rounded-full inline-block shadow-sm mb-6">
                  <BookHeart size={64} className="text-rose-300" />
                </div>
                <h2 className="text-2xl font-bold text-gray-700 mb-2">Seu diário está vazio</h2>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                  Comece a escrever sua história de amor hoje. Adicione fotos e textos que fazem seu coração bater mais forte.
                </p>
                <button 
                  onClick={openCreateModal}
                  className="bg-rose-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-rose-600 transition"
                >
                  Criar Primeira Memória
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {memories.map((memory) => (
                   <MemoryCard 
                    key={memory.id} 
                    memory={memory} 
                    onDelete={deleteMemory} 
                    onEdit={openEditModal}
                  />
                 ))}
              </div>
            )}

            <DedicationSection />
          </div>
        ) : (
          <DailyWall />
        )}

      </main>

      {/* Floating Action Button for Mobile (Only in Journal) */}
      {activeTab === 'journal' && (
        <button 
          onClick={openCreateModal}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-rose-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40 hover:bg-rose-700 transition active:scale-95"
        >
          <Plus size={28} />
        </button>
      )}

      {/* Modals */}
      <CreateMemoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveMemory}
        initialData={editingMemory}
      />
      
      <SyncModal 
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />

    </div>
  );
};

const App: React.FC = () => {
    return (
        <LiveSyncProvider>
            <AppContent />
        </LiveSyncProvider>
    );
};

export default App;