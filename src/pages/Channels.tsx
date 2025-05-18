import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Activity, X } from 'lucide-react';
import { useChannels } from '../contexts/ChannelContext';
import { Channel } from '../types';
import ChannelCard from '../components/ChannelCard';

const Channels: React.FC = () => {
  const { channels, loading, getChannels } = useChannels();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);

  useEffect(() => {
    getChannels();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredChannels(channels);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredChannels(
        channels.filter(channel => 
          channel.name.toLowerCase().includes(term) || 
          channel.description.toLowerCase().includes(term) ||
          channel.tags.some(tag => tag.toLowerCase().includes(term))
        )
      );
    }
  }, [searchTerm, channels]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold">My Channels</h1>
        <Link to="/channels/new" className="btn btn-primary md:self-end">
          <PlusCircle size={18} className="mr-2" />
          Create New Channel
        </Link>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search size={18} className="text-muted-foreground" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10 pr-10 w-full"
          placeholder="Search channels by name, description, or tag..."
        />
        {searchTerm && (
          <button
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={clearSearch}
          >
            <X size={18} className="text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Activity size={32} className="animate-pulse text-primary" />
        </div>
      ) : filteredChannels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChannels.map(channel => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
      ) : (
        <div className="bg-muted rounded-lg p-8 text-center">
          {searchTerm ? (
            <>
              <h3 className="text-xl font-semibold mb-2">No Matching Channels</h3>
              <p className="text-muted-foreground mb-4">
                We couldn't find any channels that match "{searchTerm}".
              </p>
              <button 
                onClick={clearSearch}
                className="btn btn-outline btn-sm"
              >
                Clear Search
              </button>
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold mb-2">No Channels Yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first channel to start collecting and visualizing data.
              </p>
              <Link to="/channels/new" className="btn btn-primary btn-lg">
                <PlusCircle size={20} className="mr-2" />
                Create Your First Channel
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Channels;