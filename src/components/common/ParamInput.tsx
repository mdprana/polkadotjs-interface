import React, { useState } from 'react';

interface ParamInputProps {
  module?: string;
  method?: string;
  name: string;
  type: string;
  isOptional: boolean;
  onChange: (value: string) => void;
}

const ParamInput: React.FC<ParamInputProps> = ({ 
  module = '', 
  method = '', 
  name, 
  type, 
  isOptional, 
  onChange 
}) => {
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange(newValue);
  };

  let placeholder = `${type}`;
  if (isOptional) {
    placeholder += ' (optional)';
  }

  // Determine the best input type based on parameter type and module context
  let input;
  
  // Handle Boolean types
  if (type.toLowerCase().includes('bool')) {
    input = (
      <select
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        value={value}
        onChange={handleChange}
      >
        <option value="">Select...</option>
        <option value="true">True</option>
        <option value="false">False</option>
      </select>
    );
  } 
  // Handle Account/Address types
  else if (
    type.toLowerCase().includes('account') || 
    type.toLowerCase().includes('address') || 
    type.toLowerCase().includes('multiaddress') ||
    name.toLowerCase().includes('dest') ||
    name.toLowerCase().includes('target')
  ) {
    input = (
      <input
        type="text"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        placeholder="5..."
        value={value}
        onChange={handleChange}
      />
    );
  }
  // Handle Balance types specially for 'balances' module
  else if (
    (module === 'balances' && (name === 'value' || name === 'amount')) ||
    type.toLowerCase().includes('balance') || 
    type.toLowerCase().includes('compact<u128>') ||
    type.toLowerCase().includes('compact<balance>')
  ) {
    input = (
      <div>
        <input
          type="number"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="0"
          min="0"
          step="0.000000000001"
          value={value}
          onChange={handleChange}
        />
        <div className="mt-1 text-xs text-gray-500">
          Use decimal notation (e.g., 1.5) - this will be converted to the correct precision
        </div>
      </div>
    );
  }
  // Handle other numeric types
  else if (
    type.toLowerCase().includes('u8') || 
    type.toLowerCase().includes('u16') || 
    type.toLowerCase().includes('u32') || 
    type.toLowerCase().includes('u64') || 
    type.toLowerCase().includes('u128') || 
    type.toLowerCase().includes('i8') || 
    type.toLowerCase().includes('i16') || 
    type.toLowerCase().includes('i32') || 
    type.toLowerCase().includes('i64') || 
    type.toLowerCase().includes('i128') ||
    type.toLowerCase().includes('compact<')
  ) {
    input = (
      <input
        type="number"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        placeholder="0"
        min={type.toLowerCase().startsWith('i') ? undefined : "0"}
        value={value}
        onChange={handleChange}
      />
    );
  }
  // Handle text/string types
  else if (type.toLowerCase().includes('string') || type.toLowerCase().includes('str')) {
    input = (
      <input
        type="text"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
      />
    );
  }
  // Handle array/vec types
  else if (type.toLowerCase().includes('vec') || type.toLowerCase().includes('array')) {
    input = (
      <textarea
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        placeholder={`Array of ${placeholder} (comma separated)`}
        value={value}
        onChange={handleChange}
        rows={3}
      />
    );
  }
  // Handle complex/nested types
  else if (type.toLowerCase().includes('struct') || type.toLowerCase().includes('enum') || type.includes('{')) {
    input = (
      <textarea
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        placeholder="JSON format"
        value={value}
        onChange={handleChange}
        rows={5}
      />
    );
  }
  // Default fallback for any other type
  else {
    input = (
      <input
        type="text"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
      />
    );
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {name} {isOptional ? '(optional)' : ''}
      </label>
      <div className="text-xs text-gray-500 mb-1">{type}</div>
      {input}
    </div>
  );
};

export default ParamInput;