import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

// Define types for PeerJS since we're using it via CDN
declare global {
  interface Window {
    Peer: any;
  }
}

interface LiveSyncContextType {
  peerId: string | null;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  connectToPartner: (partnerId: string) => void;
  sendUpdate: (key: string, value: any) => void;
  error: string | null;
}

const LiveSyncContext = createContext<LiveSyncContextType>({
  peerId: null,
  connectionStatus: 'disconnected',
  connectToPartner: () => {},
  sendUpdate: () => {},
  error: null,
});

export const useLiveSync = () => useContext(LiveSyncContext);

const BROADCAST_CHANNEL_NAME = 'love_app_sync';

export const LiveSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [peerId, setPeerId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [error, setError] = useState<string | null>(null);
  
  const peerRef = useRef<any>(null);
  const connRef = useRef<any>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Initialize Peer
  useEffect(() => {
    // Only init if window.Peer exists (loaded from CDN)
    if (!window.Peer) {
      setError("Biblioteca de sincronização não carregada.");
      return;
    }

    // Reuse existing ID if saved, otherwise generate new
    const savedId = localStorage.getItem('my_peer_id');
    
    // Create Peer instance
    const peer = new window.Peer(savedId || undefined, {
      debug: 1
    });

    peer.on('open', (id: string) => {
      console.log('My Peer ID is: ' + id);
      setPeerId(id);
      localStorage.setItem('my_peer_id', id);
      setError(null);
    });

    peer.on('connection', (conn: any) => {
      console.log('Incoming connection from: ', conn.peer);
      handleConnection(conn);
    });

    peer.on('error', (err: any) => {
      console.error('Peer error:', err);
      setError('Erro na conexão: ' + err.type);
      setConnectionStatus('error');
    });

    peerRef.current = peer;
    broadcastChannelRef.current = new BroadcastChannel(BROADCAST_CHANNEL_NAME);

    // Auto-connect to saved partner if exists
    const savedPartnerId = localStorage.getItem('partner_peer_id');
    if (savedPartnerId) {
        // Short delay to ensure peer is ready
        setTimeout(() => connectToPartner(savedPartnerId), 1000);
    }

    return () => {
      peer.destroy();
      broadcastChannelRef.current?.close();
    };
  }, []);

  const handleConnection = (conn: any) => {
    connRef.current = conn;
    
    conn.on('open', () => {
      setConnectionStatus('connected');
      localStorage.setItem('partner_peer_id', conn.peer);
      setError(null);
      
      // Initial sync: Send all my data to partner? 
      // For simplicity, we just sync updates as they happen for now, 
      // or we could implement a full sync handshake here.
    });

    conn.on('data', (data: any) => {
      // console.log('Received data', data);
      if (data && data.key && data.value !== undefined) {
        // 1. Update Local Storage
        try {
          localStorage.setItem(data.key, JSON.stringify(data.value));
          
          // 2. Notify other tabs via BroadcastChannel
          broadcastChannelRef.current?.postMessage({ key: data.key, value: data.value, fromRemote: true });

        } catch (e) {
          console.error("Error saving synced data", e);
        }
      }
    });

    conn.on('close', () => {
      setConnectionStatus('disconnected');
      connRef.current = null;
    });
    
    conn.on('error', () => {
        setConnectionStatus('error');
    });
  };

  const connectToPartner = (partnerId: string) => {
    if (!peerRef.current || !peerId) return;
    if (partnerId === peerId) {
        setError("Você não pode conectar consigo mesmo.");
        return;
    }

    setConnectionStatus('connecting');
    console.log("Connecting to...", partnerId);
    
    const conn = peerRef.current.connect(partnerId);
    handleConnection(conn);
  };

  const sendUpdate = (key: string, value: any) => {
    if (connRef.current && connectionStatus === 'connected') {
      connRef.current.send({ key, value });
    }
  };

  return (
    <LiveSyncContext.Provider value={{ peerId, connectionStatus, connectToPartner, sendUpdate, error }}>
      {children}
    </LiveSyncContext.Provider>
  );
};