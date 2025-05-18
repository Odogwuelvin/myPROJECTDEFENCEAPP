import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertCircle, ArrowLeft } from 'lucide-react';
import { useChannels } from '../contexts/ChannelContext';
import { Field } from '../types';
import FieldForm from '../components/FieldForm';

const CreateChannel: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [fields, setFields] = useState<Field[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { createChannel } = useChannels();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (fields.length === 0) {
      setError('Please add at least one field to your channel');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const newChannel = await createChannel({
        name,
        description,
        fields,
        isPublic,
        tags,
      });
      
      if (newChannel) {
        navigate(`/channels/${newChannel.id}`);
      } else {
        setError('Failed to create channel');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error creating channel:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft size={16} className="mr-1" />
        Back
      </button>
      
      <div className="card p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Create New Channel</h1>
          <p className="text-muted-foreground mt-2">
            Set up a new channel to start collecting and visualizing your IoT data
          </p>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/50 rounded-md p-4 mb-6 flex gap-2 items-start">
            <AlertCircle size={20} className="text-error shrink-0 mt-0.5" />
            <p className="text-error">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Channel Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Temperature Monitor"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input min-h-[100px]"
              placeholder="Monitor temperature and humidity data from sensors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <div 
                  key={index}
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 hover:text-primary/80"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="input flex-grow"
                placeholder="Add tags (e.g., temperature, sensors)"
              />
              <button
                type="button"
                onClick={addTag}
                className="btn btn-outline"
                disabled={!tagInput.trim()}
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="isPublic"
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="isPublic" className="ml-2 block text-sm">
              Make this channel public
            </label>
          </div>

          <FieldForm 
            fields={fields}
            onChange={setFields}
          />

          <div className="pt-4 border-t">
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Activity size={18} className="animate-spin mr-2" />
                  Creating Channel...
                </>
              ) : (
                'Create Channel'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChannel;