import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Activity, 
  ArrowLeft, 
  Copy, 
  Download,
  Edit,
  Info,
  Lock,
  Send,
  Share2,
  Trash,
  Unlock
} from 'lucide-react';
import { useChannels } from '../contexts/ChannelContext';
import { useAuth } from '../contexts/AuthContext';
import { Channel, DataPoint } from '../types';
import DataVisualization from '../components/DataVisualization';
import { format } from 'date-fns';

const ChannelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getChannel, getChannelData, addDataPoint, deleteChannel } = useChannels();
  
  const [channel, setChannel] = useState<Channel | null>(null);
  const [channelData, setChannelData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'1h' | '6h' | '24h' | '7d' | '30d' | 'all'>('24h');
  const [showApiInfo, setShowApiInfo] = useState(false);
  const [fieldValues, setFieldValues] = useState<Record<number, number>>({});
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const loadChannel = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const channelData = await getChannel(id);
        if (channelData) {
          setChannel(channelData);
          loadChannelData(channelData.id);
        } else {
          setError('Channel not found');
        }
      } catch (err) {
        setError('Failed to load channel');
        console.error('Error loading channel:', err);
      }
    };
    
    loadChannel();
  }, [id]);

  const loadChannelData = async (channelId: string) => {
    try {
      const data = await getChannelData(channelId);
      setChannelData(data);
    } catch (err) {
      console.error('Error loading channel data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channel) return;
    
    setIsSending(true);
    try {
      const success = await addDataPoint(channel.id, fieldValues);
      if (success) {
        // Reload data to show the new point
        await loadChannelData(channel.id);
        // Reset form
        setFieldValues({});
      } else {
        setError('Failed to add data point');
      }
    } catch (err) {
      setError('An error occurred while adding data');
      console.error('Error adding data point:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleFieldValueChange = (fieldNumber: number, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      // Remove the field if value is not a number
      const newValues = { ...fieldValues };
      delete newValues[fieldNumber];
      setFieldValues(newValues);
    } else {
      setFieldValues({
        ...fieldValues,
        [fieldNumber]: numValue,
      });
    }
  };

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    // You could add a toast notification here
  };

  const handleDeleteChannel = async () => {
    if (!channel || !confirmDelete) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteChannel(channel.id);
      if (success) {
        navigate('/channels');
      } else {
        setError('Failed to delete channel');
      }
    } catch (err) {
      setError('An error occurred while deleting the channel');
      console.error('Error deleting channel:', err);
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Activity size={32} className="animate-pulse text-primary" />
      </div>
    );
  }

  if (error || !channel) {
    return (
      <div className="bg-error/10 border border-error/50 rounded-md p-6 text-center">
        <h2 className="text-xl font-bold text-error mb-2">Error</h2>
        <p className="text-error/80 mb-4">{error || 'Channel not found'}</p>
        <Link to="/channels" className="btn btn-outline">
          Back to Channels
        </Link>
      </div>
    );
  }

  const isOwner = user && user.id === channel.userId;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{channel.name}</h1>
            {channel.isPublic ? (
              <Unlock size={18} className="text-success" />
            ) : (
              <Lock size={18} className="text-muted-foreground" />
            )}
          </div>
          <p className="text-muted-foreground mt-1">{channel.description}</p>
        </div>
        
        {isOwner && (
          <div className="flex gap-2">
            <button 
              onClick={() => setShowApiInfo(!showApiInfo)}
              className="btn btn-outline btn-sm"
            >
              <Info size={16} className="mr-1" />
              API Info
            </button>
            <Link to={`/channels/${channel.id}/edit`} className="btn btn-outline btn-sm">
              <Edit size={16} className="mr-1" />
              Edit
            </Link>
            <button 
              onClick={() => setConfirmDelete(true)}
              className="btn btn-outline btn-sm text-error hover:bg-error/10"
            >
              <Trash size={16} className="mr-1" />
              Delete
            </button>
          </div>
        )}
      </div>
      
      {showApiInfo && (
        <div className="card p-6 animate-fade-in">
          <h2 className="text-xl font-bold mb-4">API Keys and Integration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">API Keys</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Read API Key</span>
                    <button 
                      onClick={() => handleCopyApiKey(channel.apiKeys.readKey)}
                      className="text-primary hover:text-primary/80"
                      title="Copy to clipboard"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <div className="input flex items-center">
                    <code className="text-sm">{channel.apiKeys.readKey}</code>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Write API Key</span>
                    <button 
                      onClick={() => handleCopyApiKey(channel.apiKeys.writeKey)}
                      className="text-primary hover:text-primary/80"
                      title="Copy to clipboard"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <div className="input flex items-center">
                    <code className="text-sm">{channel.apiKeys.writeKey}</code>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">HTTP API Examples</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium mb-1">Read Data:</p>
                  <pre className="bg-muted p-2 rounded-md text-xs overflow-x-auto">
                    GET /api/channels/{channel.id}/feeds?api_key={channel.apiKeys.readKey}
                  </pre>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-1">Write Data:</p>
                  <pre className="bg-muted p-2 rounded-md text-xs overflow-x-auto">
                    POST /api/channels/{channel.id}/feeds?api_key={channel.apiKeys.writeKey}
                    {'\n'}Content-Type: application/json
                    {'\n\n'}{"{"}{'\n'}  "field1": 23.5,{'\n'}  "field2": 65{'\n'}{"}"}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {confirmDelete && (
        <div className="card p-6 border-error animate-fade-in">
          <h2 className="text-xl font-bold text-error mb-2">Delete Channel</h2>
          <p className="mb-4">
            Are you sure you want to delete this channel? This action cannot be undone and all data will be permanently lost.
          </p>
          <div className="flex gap-2 justify-end">
            <button 
              onClick={() => setConfirmDelete(false)}
              className="btn btn-outline btn-sm"
            >
              Cancel
            </button>
            <button 
              onClick={handleDeleteChannel}
              className="btn btn-sm bg-error text-white hover:bg-error/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Activity size={14} className="animate-spin mr-1" />
                  Deleting...
                </>
              ) : (
                'Delete Channel'
              )}
            </button>
          </div>
        </div>
      )}
      
      <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <h2 className="text-2xl font-bold">Channel Visualization</h2>
          
          <div className="flex">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="input"
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
            
            <button className="btn btn-outline ml-2">
              <Download size={18} className="mr-2" />
              Export
            </button>
          </div>
        </div>
        
        <DataVisualization 
          data={channelData} 
          channel={channel} 
          timeframe={timeframe}
        />
      </div>
      
      {isOwner && (
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Add Data Manually</h2>
          
          <form onSubmit={handleSubmitData}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {channel.fields.map(field => (
                <div key={field.id}>
                  <label 
                    htmlFor={`field-${field.fieldNumber}`} 
                    className="block text-sm font-medium mb-1"
                  >
                    {field.name} (Field {field.fieldNumber})
                  </label>
                  <input
                    id={`field-${field.fieldNumber}`}
                    type="number"
                    step="any"
                    value={fieldValues[field.fieldNumber] || ''}
                    onChange={(e) => handleFieldValueChange(field.fieldNumber, e.target.value)}
                    className="input"
                    placeholder="Enter value"
                  />
                </div>
              ))}
            </div>
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSending || Object.keys(fieldValues).length === 0}
            >
              {isSending ? (
                <>
                  <Activity size={18} className="animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} className="mr-2" />
                  Submit Data
                </>
              )}
            </button>
          </form>
        </div>
      )}
      
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Data Feed</h2>
        
        {channelData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 text-left">Entry ID</th>
                  <th className="p-2 text-left">Created At</th>
                  {channel.fields.map(field => (
                    <th key={field.id} className="p-2 text-left">{field.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {channelData.slice(0, 10).map((entry, index) => (
                  <tr key={entry.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-2 border-t">{entry.id.substring(0, 8)}...</td>
                    <td className="p-2 border-t">{format(new Date(entry.createdAt), 'MMM d, yyyy HH:mm:ss')}</td>
                    {channel.fields.map(field => (
                      <td key={field.id} className="p-2 border-t">
                        {entry.fieldValues[field.fieldNumber] !== undefined 
                          ? entry.fieldValues[field.fieldNumber] 
                          : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-6 bg-muted rounded-lg">
            <p className="text-muted-foreground">No data available for this channel yet.</p>
          </div>
        )}
        
        {channelData.length > 10 && (
          <div className="mt-4 text-center">
            <button className="btn btn-outline btn-sm">
              Load More Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelDetail;