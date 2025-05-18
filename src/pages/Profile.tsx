import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChannels } from '../contexts/ChannelContext';
import { Activity, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { channels } = useChannels();
  
  if (!user) {
    return (
      <div className="flex justify-center p-12">
        <Activity size={32} className="animate-pulse text-primary" />
      </div>
    );
  }

  const userChannels = channels.filter(channel => channel.userId === user.id);
  const publicChannels = userChannels.filter(channel => channel.isPublic);
  const privateChannels = userChannels.filter(channel => !channel.isPublic);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="card p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="bg-primary/10 rounded-full p-8 flex items-center justify-center">
            <UserIcon size={64} className="text-primary" />
          </div>
          
          <div className="flex-grow">
            <h1 className="text-3xl font-bold mb-2">{user.username}</h1>
            <p className="text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Member since {format(new Date(user.createdAt), 'MMMM d, yyyy')}
            </p>
            
            <div className="flex flex-wrap gap-4 mt-6">
              <button className="btn btn-outline">
                Edit Profile
              </button>
              <button 
                onClick={logout}
                className="btn btn-outline text-error hover:bg-error/10"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex flex-col items-center text-center">
            <div className="text-4xl font-bold text-primary mb-2">{userChannels.length}</div>
            <p className="text-muted-foreground">Total Channels</p>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex flex-col items-center text-center">
            <div className="text-4xl font-bold text-primary mb-2">{publicChannels.length}</div>
            <p className="text-muted-foreground">Public Channels</p>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex flex-col items-center text-center">
            <div className="text-4xl font-bold text-primary mb-2">{privateChannels.length}</div>
            <p className="text-muted-foreground">Private Channels</p>
          </div>
        </div>
      </div>
      
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Account Settings</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              value={user.username}
              disabled
              className="input bg-muted"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="input bg-muted"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value="••••••••"
              disabled
              className="input bg-muted"
            />
          </div>
          
          <div className="pt-4 border-t">
            <button className="btn btn-primary">
              Update Account Information
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;