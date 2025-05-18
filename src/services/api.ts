import { v4 as uuidv4 } from 'uuid';
import { Channel, DataPoint, User, ApiResponse } from '../types';

// Simulate API delay for realistic behavior
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Local storage keys
const USERS_KEY = 'thingspeak_users';
const CHANNELS_KEY = 'thingspeak_channels';
const DATA_KEY = 'thingspeak_data';
const CURRENT_USER_KEY = 'thingspeak_current_user';

// Initialize local storage with empty data if not exists
const initializeStorage = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(CHANNELS_KEY)) {
    localStorage.setItem(CHANNELS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(DATA_KEY)) {
    localStorage.setItem(DATA_KEY, JSON.stringify([]));
  }
};

// Get data from local storage
const getFromStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

// Save data to local storage
const saveToStorage = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Authentication API
export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<User>> => {
    initializeStorage();
    await delay(500); // Simulate network delay
    
    const users = getFromStorage<User & { password: string }>(USERS_KEY);
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      const { password, ...userWithoutPassword } = user;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      return { success: true, data: userWithoutPassword };
    }
    
    return { success: false, error: 'Invalid email or password' };
  },
  
  register: async (username: string, email: string, password: string): Promise<ApiResponse<User>> => {
    initializeStorage();
    await delay(500); // Simulate network delay
    
    const users = getFromStorage<User & { password: string }>(USERS_KEY);
    
    if (users.some(u => u.email === email)) {
      return { success: false, error: 'Email already in use' };
    }
    
    const newUser = {
      id: uuidv4(),
      username,
      email,
      password, // In a real app, this would be hashed
      createdAt: new Date().toISOString(),
    };
    
    saveToStorage(USERS_KEY, [...users, newUser]);
    
    const { password: _, ...userWithoutPassword } = newUser;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    
    return { success: true, data: userWithoutPassword };
  },
  
  logout: async (): Promise<ApiResponse<null>> => {
    localStorage.removeItem(CURRENT_USER_KEY);
    return { success: true };
  },
  
  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  },
};

// Channels API
export const channelApi = {
  getChannels: async (): Promise<ApiResponse<Channel[]>> => {
    initializeStorage();
    await delay(300); // Simulate network delay
    
    const currentUser = authApi.getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const channels = getFromStorage<Channel>(CHANNELS_KEY)
      .filter(c => c.userId === currentUser.id || c.isPublic);
    
    return { success: true, data: channels };
  },
  
  getChannel: async (id: string): Promise<ApiResponse<Channel>> => {
    initializeStorage();
    await delay(300); // Simulate network delay
    
    const currentUser = authApi.getCurrentUser();
    const channels = getFromStorage<Channel>(CHANNELS_KEY);
    const channel = channels.find(c => c.id === id);
    
    if (!channel) {
      return { success: false, error: 'Channel not found' };
    }
    
    if (!channel.isPublic && (!currentUser || channel.userId !== currentUser.id)) {
      return { success: false, error: 'Access denied' };
    }
    
    return { success: true, data: channel };
  },
  
  createChannel: async (channelData: Omit<Channel, 'id' | 'createdAt' | 'lastEntry' | 'userId' | 'apiKeys'>): Promise<ApiResponse<Channel>> => {
    initializeStorage();
    await delay(500); // Simulate network delay
    
    const currentUser = authApi.getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const newChannel: Channel = {
      ...channelData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      lastEntry: null,
      userId: currentUser.id,
      apiKeys: {
        readKey: uuidv4().substring(0, 16),
        writeKey: uuidv4().substring(0, 16),
      },
    };
    
    const channels = getFromStorage<Channel>(CHANNELS_KEY);
    saveToStorage(CHANNELS_KEY, [...channels, newChannel]);
    
    return { success: true, data: newChannel };
  },
  
  updateChannel: async (id: string, channelData: Partial<Channel>): Promise<ApiResponse<Channel>> => {
    initializeStorage();
    await delay(500); // Simulate network delay
    
    const currentUser = authApi.getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const channels = getFromStorage<Channel>(CHANNELS_KEY);
    const channelIndex = channels.findIndex(c => c.id === id);
    
    if (channelIndex === -1) {
      return { success: false, error: 'Channel not found' };
    }
    
    if (channels[channelIndex].userId !== currentUser.id) {
      return { success: false, error: 'Access denied' };
    }
    
    const updatedChannel = { ...channels[channelIndex], ...channelData };
    channels[channelIndex] = updatedChannel;
    saveToStorage(CHANNELS_KEY, channels);
    
    return { success: true, data: updatedChannel };
  },
  
  deleteChannel: async (id: string): Promise<ApiResponse<null>> => {
    initializeStorage();
    await delay(500); // Simulate network delay
    
    const currentUser = authApi.getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const channels = getFromStorage<Channel>(CHANNELS_KEY);
    const channel = channels.find(c => c.id === id);
    
    if (!channel) {
      return { success: false, error: 'Channel not found' };
    }
    
    if (channel.userId !== currentUser.id) {
      return { success: false, error: 'Access denied' };
    }
    
    saveToStorage(CHANNELS_KEY, channels.filter(c => c.id !== id));
    
    // Also delete all data for this channel
    const allData = getFromStorage<DataPoint>(DATA_KEY);
    saveToStorage(DATA_KEY, allData.filter(d => d.channelId !== id));
    
    return { success: true };
  },
};

// Data API
export const dataApi = {
  addDataPoint: async (channelId: string, fieldValues: Record<number, number>, apiKey?: string): Promise<ApiResponse<DataPoint>> => {
    initializeStorage();
    await delay(300); // Simulate network delay
    
    const channels = getFromStorage<Channel>(CHANNELS_KEY);
    const channel = channels.find(c => c.id === channelId);
    
    if (!channel) {
      return { success: false, error: 'Channel not found' };
    }
    
    // Check if API key is needed and valid
    const currentUser = authApi.getCurrentUser();
    const isOwner = currentUser && channel.userId === currentUser.id;
    
    if (!isOwner && (!apiKey || apiKey !== channel.apiKeys.writeKey)) {
      return { success: false, error: 'Invalid API key' };
    }
    
    // Validate field numbers
    const validFieldNumbers = channel.fields.map(f => f.fieldNumber);
    const allFieldsValid = Object.keys(fieldValues).every(
      key => validFieldNumbers.includes(Number(key))
    );
    
    if (!allFieldsValid) {
      return { success: false, error: 'Invalid field numbers' };
    }
    
    const newDataPoint: DataPoint = {
      id: uuidv4(),
      channelId,
      createdAt: new Date().toISOString(),
      fieldValues,
    };
    
    const allData = getFromStorage<DataPoint>(DATA_KEY);
    saveToStorage(DATA_KEY, [...allData, newDataPoint]);
    
    // Update channel's lastEntry timestamp
    const channelIndex = channels.findIndex(c => c.id === channelId);
    channels[channelIndex] = { ...channel, lastEntry: newDataPoint.createdAt };
    saveToStorage(CHANNELS_KEY, channels);
    
    return { success: true, data: newDataPoint };
  },
  
  getChannelData: async (channelId: string, days?: number, apiKey?: string): Promise<ApiResponse<DataPoint[]>> => {
    initializeStorage();
    await delay(500); // Simulate network delay
    
    const channels = getFromStorage<Channel>(CHANNELS_KEY);
    const channel = channels.find(c => c.id === channelId);
    
    if (!channel) {
      return { success: false, error: 'Channel not found' };
    }
    
    // Check if API key is needed and valid
    const currentUser = authApi.getCurrentUser();
    const isOwner = currentUser && channel.userId === currentUser.id;
    const isPublic = channel.isPublic;
    
    if (!isOwner && !isPublic && (!apiKey || apiKey !== channel.apiKeys.readKey)) {
      return { success: false, error: 'Invalid API key' };
    }
    
    let allData = getFromStorage<DataPoint>(DATA_KEY)
      .filter(d => d.channelId === channelId);
    
    // Filter by date if days parameter is provided
    if (days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      allData = allData.filter(d => new Date(d.createdAt) >= cutoffDate);
    }
    
    // Sort by date (newest first)
    allData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return { success: true, data: allData };
  },
};