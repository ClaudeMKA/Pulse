"use client";

import { useState, useEffect } from "react";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRead, setFilterRead] = useState<"all" | "read" | "unread">("all");

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/contact");
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        alert("Erreur lors du chargement des messages");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors du chargement des messages");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number, read: boolean) => {
    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ read }),
      });

      if (response.ok) {
        setMessages(prev => prev.map(msg => 
          msg.id === id ? { ...msg, read } : msg
        ));
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage(prev => prev ? { ...prev, read } : null);
        }
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      alert("Une erreur est survenue lors de la mise à jour");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le message de "${name}" ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessages(prev => prev.filter(msg => msg.id !== id));
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage(null);
        }
        alert("Message supprimé avec succès !");
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Une erreur est survenue lors de la suppression");
    }
  };

  const filteredMessages = messages
    .filter(message => {
      const matchesSearch = 
        message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.message.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = 
        filterRead === "all" ||
        (filterRead === "read" && message.read) ||
        (filterRead === "unread" && !message.read);
      
      return matchesSearch && matchesFilter;
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Messages de contact
            </h1>
            <p className="text-gray-600">
              {messages.length} message{messages.length > 1 ? 's' : ''} au total
              {messages.filter(m => !m.read).length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {messages.filter(m => !m.read).length} non lu{messages.filter(m => !m.read).length > 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Liste des messages */}
        <div className="flex-1">
          {/* Barre de recherche et filtres */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Recherche */}
              <div className="flex-1">
                <label htmlFor="search" className="sr-only">
                  Rechercher un message
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Rechercher par nom, email, sujet ou contenu..."
                  />
                </div>
              </div>

              {/* Filtre statut */}
              <div>
                <select
                  value={filterRead}
                  onChange={(e) => setFilterRead(e.target.value as "all" | "read" | "unread")}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tous les messages</option>
                  <option value="unread">Non lus</option>
                  <option value="read">Lus</option>
                </select>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-4">
            {filteredMessages.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {searchTerm ? "Aucun message trouvé" : "Aucun message"}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm 
                    ? "Essayez de modifier vos critères de recherche."
                    : "Les messages de contact apparaîtront ici."
                  }
                </p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedMessage?.id === message.id ? 'ring-2 ring-blue-500' : ''
                  } ${!message.read ? 'bg-blue-50 border-blue-200' : ''}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        !message.read ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <svg className={`w-5 h-5 ${!message.read ? 'text-blue-600' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          {message.name}
                          {!message.read && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Nouveau
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">{message.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(message.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-900 mb-1">Sujet: {message.subject}</h4>
                    <p className="text-gray-600 line-clamp-2">{message.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Détail du message sélectionné */}
        {selectedMessage && (
          <div className="w-96">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Détails du message</h2>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Info contact */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Contact</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium text-gray-900">{selectedMessage.name}</p>
                    <p className="text-sm text-gray-600">{selectedMessage.email}</p>
                  </div>
                </div>

                {/* Sujet */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Sujet</h3>
                  <p className="text-gray-900">{selectedMessage.subject}</p>
                </div>

                {/* Message */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Message</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>

                {/* Date */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Date d'envoi</h3>
                  <p className="text-gray-600">
                    {new Date(selectedMessage.created_at).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-200 pt-6 space-y-3">
                  <button
                    onClick={() => handleMarkAsRead(selectedMessage.id, !selectedMessage.read)}
                    className={`w-full px-4 py-2 text-sm font-medium rounded-md border ${
                      selectedMessage.read
                        ? 'border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100'
                        : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                    }`}
                  >
                    {selectedMessage.read ? 'Marquer comme non lu' : 'Marquer comme lu'}
                  </button>
                  
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Répondre par email
                  </a>
                  
                  <button
                    onClick={() => handleDelete(selectedMessage.id, selectedMessage.name)}
                    className="w-full px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded-md hover:bg-red-100"
                  >
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}