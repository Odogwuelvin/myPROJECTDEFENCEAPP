import React from 'react';
import { BarChart2, Calendar, Tag, Lock, Unlock } from 'lucide-react';
import { Channel } from '../types';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface ChannelCardProps {
  channel: Channel;
}

const ChannelCard: React.FC<ChannelCardProps> = ({ channel }) => {
  return (
    <Link 
      to={`/channels/${channel.id}`}
      className="card hover:shadow-md transform hover:-translate-y-1 transition-all duration-200"
    >
      <div className="card-header">
        <div className="flex justify-between items-center">
          <h3 className="card-title">{channel.name}</h3>
          {channel.isPublic ? (
            <Unlock size={18} className="text-success" />
          ) : (
            <Lock size={18} className="text-muted-foreground" />
          )}
        </div>
        <p className="card-description">{channel.description}</p>
      </div>
      <div className="card-content">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart2 size={16} />
            <span>{channel.fields.length} Fields</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar size={16} />
            <span>
              {channel.lastEntry 
                ? `Updated ${formatDistanceToNow(new Date(channel.lastEntry))} ago` 
                : 'No data yet'}
            </span>
          </div>
        </div>
        
        {channel.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {channel.tags.map((tag, index) => (
              <div 
                key={index}
                className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full"
              >
                <Tag size={12} />
                <span>{tag}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

export default ChannelCard;