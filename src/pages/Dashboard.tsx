import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, BarChart2, PlusCircle, RefreshCw } from 'lucide-react';
import { useChannels } from '../contexts/ChannelContext';
import { useAuth } from '../contexts/AuthContext';
import { Channel } from '../types';
import ChannelCard from '../components/ChannelCard';

const Dashboard: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { channels, loading, getChannels } = useChannels();
  const [publicChannels, setPublicChannels] = useState<Channel[]>([]);
  
  useEffect(() => {
    getChannels();
    // Fetch some public channels
    const fetchedPublicChannels = channels.filter(c => c.isPublic);
    setPublicChannels(fetchedPublicChannels);
  }, []);

  const handleRefresh = () => {
    getChannels();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero section */}
      <section className="bg-primary text-white rounded-xl p-8 shadow-lg">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">IoT Analytics Platform</h1>
          <p className="text-xl mb-6">
            Collect, analyze, and visualize your IoT data in real-time.
            Build powerful applications with our easy-to-use API.
          </p>
          {isAuthenticated ? (
            <Link to="/channels/new" className="btn btn-lg bg-white text-primary hover:bg-white/90">
              <PlusCircle size={20} className="mr-2" />
              Create New Channel
            </Link>
          ) : (
            <Link to="/register" className="btn btn-lg bg-white text-primary hover:bg-white/90">
              Get Started for Free
            </Link>
          )}
        </div>
      </section>

      {/* Your channels section (for authenticated users) */}
      {isAuthenticated && (
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <BarChart2 size={24} className="mr-2 text-primary" />
              Your Channels
            </h2>
            <button 
              onClick={handleRefresh} 
              className="btn btn-outline btn-sm flex items-center"
              disabled={loading}
            >
              <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center p-12">
              <Activity size={32} className="animate-pulse text-primary" />
            </div>
          ) : channels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {channels.map(channel => (
                <ChannelCard key={channel.id} channel={channel} />
              ))}
              <Link 
                to="/channels/new" 
                className="card border-dashed border-2 hover:border-primary hover:bg-primary/5 flex items-center justify-center min-h-[200px] transform hover:-translate-y-1 transition-all duration-200"
              >
                <div className="flex flex-col items-center text-center p-6">
                  <PlusCircle size={48} className="text-primary mb-4" />
                  <h3 className="text-xl font-semibold">Create New Channel</h3>
                  <p className="text-muted-foreground mt-2">
                    Start collecting and visualizing your data
                  </p>
                </div>
              </Link>
            </div>
          ) : (
            <div className="bg-muted rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">No Channels Yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first channel to start collecting and visualizing data.
              </p>
              <Link to="/channels/new" className="btn btn-primary btn-lg">
                <PlusCircle size={20} className="mr-2" />
                Create Your First Channel
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Featured Public Channels */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Featured Public Channels</h2>
        
        {publicChannels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicChannels.map(channel => (
              <ChannelCard key={channel.id} channel={channel} />
            ))}
          </div>
        ) : (
          <div className="bg-muted rounded-lg p-8 text-center">
            <p className="text-muted-foreground">
              No public channels available yet.
            </p>
          </div>
        )}
      </section>

      {/* Features section */}
      <section className="py-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Platform Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
              <Activity size={24} className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-time Analytics</h3>
            <p className="text-muted-foreground">
              Visualize your IoT data in real-time with customizable charts and dashboards.
            </p>
          </div>
          
          <div className="card p-6">
            <div className="rounded-full bg-secondary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary">
                <path d="M12 19V5"></path>
                <path d="M5 12l7-7 7 7"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Integration</h3>
            <p className="text-muted-foreground">
              Connect your devices with simple REST API or MQTT protocol support.
            </p>
          </div>
          
          <div className="card p-6">
            <div className="rounded-full bg-accent/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Data Analysis</h3>
            <p className="text-muted-foreground">
              Gain insights from your data with built-in analysis tools and custom processing.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;