import React, { useRef, useState } from 'react';
import { X, Download, Upload, Heart, Wifi, AlertCircle, Copy, Check, Globe, FileText, Loader2 } from 'lucide-react';
import { useLiveSync } from '../contexts/LiveSyncContext';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'online' | 'file'>('online');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileStatus, setFileStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copied, setCopied] = useState(false);
  const [partnerInput, setPartnerInput] = useState('');
  
  const { peerId, connectToPartner, connectionStatus, error } = useLiveSync();

  if (!isOpen) return null;

  const handleCopyId = () => {
    if (peerId) {
        navigator.clipboard.writeText(peerId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnect = (e: React.FormEvent) => {
      e.preventDefault();
      if (partnerInput.trim()) {
          connectToPartner(partnerInput.trim());
      }
  };

  // ---- FILE EXPORT LOGIC ----
  const handleExport = () => {
    const data = {
      love_memories: localStorage.getItem('love_memories'),
      relationship_start_date: localStorage.getItem('relationship_start_date'),
      love_dedications: localStorage.getItem('love_dedications'),
      love_daily_messages: localStorage.getItem('love_daily_messages'),
      love_daily_affections: localStorage.getItem('love_daily_affections'),
    };

    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nossa-historia-${new Date().toISOString().split('T')[0]}.love`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setFileStatus('success');
    setTimeout(() => setFileStatus('idle'), 3000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        if (json.love_memories) localStorage.setItem('love_memories', json.love_memories);
        if (json.relationship_start_date) localStorage.setItem('relationship_start_date', json.relationship_start_date);
        if (json.love_dedications) localStorage.setItem('love_dedications', json.love_dedications);
        if (json.love_daily_messages) localStorage.setItem('love_daily_messages', json.love_daily_messages);
        if (json.love_daily_affections) localStorage.setItem('love_daily_affections', json.love_daily_affections);

        setFileStatus('success');
        setTimeout(() => {
            alert("Sincronização concluída! ❤️");
            window.location.reload();
        }, 500);
      } catch (err) {
        console.error(err);
        setFileStatus('error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative transform transition-all scale-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-400 to-rose-600 p-6 text-white text-center relative overflow-hidden shrink-0">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <Heart size={200} className="absolute -top-10 -left-10" />
            </div>
            <h2 className="text-2xl font-script font-bold mb-1 relative z-10">Conectar Corações</h2>
            <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white transition z-10 bg-white/10 rounded-full p-1">
                <X size={20} />
            </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 shrink-0">
            <button 
                onClick={() => setMode('online')}
                className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${mode === 'online' ? 'text-rose-500 border-b-2 border-rose-500 bg-rose-50/50' : 'text-gray-500 hover:text-rose-400'}`}
            >
                <Globe size={18} /> Online (Automático)
            </button>
            <button 
                onClick={() => setMode('file')}
                className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${mode === 'file' ? 'text-rose-500 border-b-2 border-rose-500 bg-rose-50/50' : 'text-gray-500 hover:text-rose-400'}`}
            >
                <FileText size={18} /> Arquivo (Manual)
            </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
            
            {mode === 'online' ? (
                <div className="space-y-6">
                    <div className="text-center">
                        <p className="text-gray-600 mb-4 text-sm">
                            Conecte seus dispositivos para que tudo o que um escrever apareça para o outro em tempo real.
                        </p>
                    </div>

                    {/* Status Box */}
                    <div className={`rounded-xl p-4 border flex items-center gap-3 ${connectionStatus === 'connected' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className={`p-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                            {connectionStatus === 'connecting' ? <Loader2 size={24} className="animate-spin text-rose-500"/> : <Wifi size={24} />}
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-gray-800">
                                {connectionStatus === 'connected' ? 'Conectado com seu amor ❤️' : 
                                 connectionStatus === 'connecting' ? 'Conectando...' : 'Desconectado'}
                            </h4>
                            <p className="text-xs text-gray-500">
                                {connectionStatus === 'connected' ? 'A sincronização está ativa.' : 'Aguardando conexão...'}
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold flex items-center gap-2">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    {/* My Code */}
                    <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                        <label className="block text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">Seu Código de Casal</label>
                        <div className="flex gap-2">
                            <div className="bg-white border border-rose-200 rounded-lg px-3 py-2 flex-1 font-mono text-gray-600 text-sm flex items-center overflow-hidden whitespace-nowrap">
                                {peerId || 'Gerando código...'}
                            </div>
                            <button 
                                onClick={handleCopyId}
                                disabled={!peerId}
                                className="bg-rose-500 text-white px-3 rounded-lg hover:bg-rose-600 transition disabled:opacity-50"
                                title="Copiar código"
                            >
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                            </button>
                        </div>
                        <p className="text-[10px] text-rose-400 mt-2 text-center">Envie este código para seu amor conectar com você.</p>
                    </div>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">OU</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    {/* Partner Code */}
                    <form onSubmit={handleConnect}>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Código do Parceiro(a)</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="Cole o código dele(a) aqui..."
                                value={partnerInput}
                                onChange={(e) => setPartnerInput(e.target.value)}
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition text-sm"
                            />
                            <button 
                                type="submit"
                                disabled={connectionStatus === 'connected' || connectionStatus === 'connecting'}
                                className="bg-gray-800 text-white px-4 rounded-lg font-bold text-sm hover:bg-black transition disabled:opacity-50"
                            >
                                Conectar
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                // FILE MODE (Legacy)
                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                        <p className="flex gap-2">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <span>Use esta opção se não conseguirem conectar online. Funciona salvando um arquivo e enviando manualmente.</span>
                        </p>
                    </div>

                    <div className="grid gap-4">
                        <button 
                            onClick={handleExport}
                            className="flex items-center justify-between w-full bg-white border-2 border-rose-100 text-gray-700 p-4 rounded-xl hover:border-rose-400 hover:bg-rose-50 transition group shadow-sm"
                        >
                            <div className="text-left">
                                <span className="block font-bold text-rose-600 group-hover:text-rose-700">1. Baixar Backup</span>
                                <span className="text-xs text-gray-500">Salva tudo em um arquivo</span>
                            </div>
                            <div className="bg-rose-100 text-rose-500 p-2 rounded-full group-hover:scale-110 transition">
                                <Download size={24} />
                            </div>
                        </button>

                        <div className="relative">
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center justify-between w-full bg-rose-500 border-2 border-rose-500 text-white p-4 rounded-xl hover:bg-rose-600 hover:border-rose-600 transition group shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                <div className="text-left">
                                    <span className="block font-bold">2. Restaurar Backup</span>
                                    <span className="text-xs opacity-90">Carrega dados de um arquivo</span>
                                </div>
                                <div className="bg-white/20 p-2 rounded-full group-hover:scale-110 transition">
                                    <Upload size={24} />
                                </div>
                            </button>
                            <input 
                                ref={fileInputRef}
                                type="file"
                                accept=".love,.json"
                                className="hidden"
                                onChange={handleImport}
                            />
                        </div>
                    </div>

                    {fileStatus === 'success' && (
                        <div className="bg-green-100 text-green-700 p-3 rounded-lg text-center text-sm font-bold flex items-center justify-center gap-2 animate-fade-in">
                            <Heart size={16} fill="currentColor" /> Arquivo carregado!
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};