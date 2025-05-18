import React, { createContext, useContext, useState, useEffect } from 'react';
import { Channel, DataPoint, ChannelContextType } from '../types';
import { channelApi, dataApi } from '../services/api';
import { useAuth } from './AuthContext';

const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

export const ChannelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      getChannels();
    } else {
      setChannels([]);
    }
  }, [isAuthenticated]);

  const getChannels = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await channelApi.getChannels();
      if (response.success && response.data) {
        setChannels(response.data);
      } else {
        setError(response.error || 'Failed to fetch channels');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Error fetching channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChannel = async (id: string): Promise<Channel | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await channelApi.getChannel(id);
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || 'Failed to fetch channel');
        return null;
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Error fetching channel:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createChannel = async (channelData: Omit<Channel, 'id' | 'createdAt' | 'lastEntry' | 'userId' | 'apiKeys'>): Promise<Channel | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await channelApi.createChannel(channelData);
      if (response.success && response.data) {
        setChannels(prev => [...prev, response.data!]);
        return response.data;
      } else {
        setError(response.error || 'Failed to create channel');
        return null;
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Error creating channel:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateChannel = async (id: string, channelData: Partial<Channel>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await channelApi.updateChannel(id, channelData);
      if (response.success && response.data) {
        setChannels(prev => 
          prev.map(channel => channel.id === id ? response.data! : channel)
        );
        return true;
      } else {
        setError(response.error || 'Failed to update channel');
        return false;
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Error updating channel:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteChannel = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await channelApi.deleteChannel(id);
      if (response.success) {
        setChannels(prev => prev.filter(channel => channel.id !== id));
        return true;
      } else {
        setError(response.error || 'Failed to delete channel');
        return false;
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Error deleting channel:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addDataPoint = async (channelId: string, fieldValues: Record<number, number>): Promise<boolean> => {
    setError(null);
    try {
      const response = await dataApi.addDataPoint(channelId, fieldValues);
      if (response.success) {
        // Update the channel's last entry date
        setChannels(prev => 
          prev.map(channel => 
            channel.id === channelId 
              ? { ...channel, lastEntry: new Date().toISOString() } 
              : channel
          )
        );
        return true;
      } else {
        setError(response.error || 'Failed to add data point');
        return false;
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Error adding data point:', error);
      return false;
    }
  };

  const getChannelData = async (channelId: string, days?: number): Promise<DataPoint[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await dataApi.getChannelData(channelId, days);
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || 'Failed to fetch channel data');
        return [];
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Error fetching channel data:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const value: ChannelContextType = {
    channels,
    loading,
    error,
    getChannels,
    getChannel,
    createChannel,
    updateChannel,
    deleteChannel,
    addDataPoint,
    getChannelData,
  };

  return <ChannelContext.Provider value={value}>{children}</ChannelContext.Provider>;
};

export const useChannels = (): ChannelContextType => {
  const context = useContext(ChannelContext);
  if (context === undefined) {
    throw new Error('useChannels must be used within a ChannelProvider');
  }
  return context;
};