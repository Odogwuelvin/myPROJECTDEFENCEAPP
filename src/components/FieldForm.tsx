import React, { useState } from 'react';
import { PlusCircle, Trash } from 'lucide-react';
import { Field } from '../types';

interface FieldFormProps {
  fields: Field[];
  onChange: (fields: Field[]) => void;
}

const FieldForm: React.FC<FieldFormProps> = ({ fields, onChange }) => {
  const [newFieldName, setNewFieldName] = useState('');

  const addField = () => {
    if (!newFieldName.trim()) return;
    
    const nextFieldNumber = fields.length > 0 
      ? Math.max(...fields.map(f => f.fieldNumber)) + 1 
      : 1;
    
    const newField: Field = {
      id: Date.now().toString(),
      name: newFieldName,
      fieldNumber: nextFieldNumber,
    };
    
    onChange([...fields, newField]);
    setNewFieldName('');
  };

  const removeField = (id: string) => {
    onChange(fields.filter(field => field.id !== id));
  };

  const updateFieldName = (id: string, name: string) => {
    onChange(
      fields.map(field => 
        field.id === id ? { ...field, name } : field
      )
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Channel Fields</h3>
      <p className="text-sm text-muted-foreground">Define the fields for your channel data.</p>
      
      <div className="space-y-2">
        {fields.map(field => (
          <div 
            key={field.id} 
            className="flex items-center gap-2 p-3 border rounded-md bg-white"
          >
            <div className="flex-grow">
              <input
                type="text"
                value={field.name}
                onChange={(e) => updateFieldName(field.id, e.target.value)}
                className="input"
                placeholder="Field name"
              />
            </div>
            <div className="w-16 px-2 py-1 rounded-md bg-muted text-center text-sm">
              Field {field.fieldNumber}
            </div>
            <button
              type="button"
              onClick={() => removeField(field.id)}
              className="text-error hover:text-error/80"
              title="Remove field"
            >
              <Trash size={18} />
            </button>
          </div>
        ))}
      </div>
      
      <div className="flex gap-2 mt-4">
        <input
          type="text"
          value={newFieldName}
          onChange={(e) => setNewFieldName(e.target.value)}
          className="input flex-grow"
          placeholder="New field name"
        />
        <button
          type="button"
          onClick={addField}
          className="btn btn-secondary"
          disabled={!newFieldName.trim()}
        >
          <PlusCircle size={18} className="mr-2" />
          Add Field
        </button>
      </div>
    </div>
  );
};

export default FieldForm;