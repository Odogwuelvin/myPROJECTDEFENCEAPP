export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  fields: Field[];
  isPublic: boolean;
  createdAt: string;
  lastEntry: string | null;
  userId: string;
  tags: string[];
  apiKeys: {
    readKey: string;
    writeKey: string;
  };
}

export interface Field {
  id: string;
  name: string;
  fieldNumber: number;
}

export interface DataPoint {
  id: string;
  channelId: string;
  createdAt: string;
  fieldValues: Record<number, number>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    tension: number;
  }[];
}

export interface ChartOptions {
  responsive: boolean;
  plugins: {
    legend: {
      position: 'top' | 'bottom' | 'left' | 'right';
    };
    title: {
      display: boolean;
      text: string;
    };
  };
  scales: {
    y: {
      beginAtZero: boolean;
    };
  };
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export interface ChannelContextType {
  channels: Channel[];
  loading: boolean;
  error: string | null;
  getChannels: () => Promise<void>;
  getChannel: (id: string) => Promise<Channel | null>;
  createChannel: (channelData: Omit<Channel, 'id' | 'createdAt' | 'lastEntry' | 'userId' | 'apiKeys'>) => Promise<Channel | null>;
  updateChannel: (id: string, channelData: Partial<Channel>) => Promise<boolean>;
  deleteChannel: (id: string) => Promise<boolean>;
  addDataPoint: (channelId: string, fieldValues: Record<number, number>) => Promise<boolean>;
  getChannelData: (channelId: string, days?: number) => Promise<DataPoint[]>;
}