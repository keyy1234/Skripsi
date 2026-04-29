import React from 'react';

export const FormField = ({ label, children }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
    {children}
  </div>
);

export const Input = ({ value, onChange, placeholder = '', suffix, type = 'text' }) => (
  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-teal-500">
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex-1 px-3 py-2 text-sm outline-none"
    />
    {suffix && <span className="px-3 py-2 bg-gray-50 border-l border-gray-300 text-xs text-gray-500 whitespace-nowrap">{suffix}</span>}
  </div>
);

export const TextArea = ({ value, onChange, rows = 4, placeholder = '' }) => (
  <textarea
    rows={rows}
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 resize-y"
  />
);

export const RadioGroup = ({ options, value, onChange }) => (
  <div className="flex items-center gap-6">
    {options.map(opt => (
      <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          className="accent-teal-500 w-4 h-4 cursor-pointer"
          checked={value === opt.value}
          onChange={() => onChange(opt.value)}
        />
        <span className="text-sm text-gray-700">{opt.label}</span>
      </label>
    ))}
  </div>
);

export const Select = ({ value, onChange, options, placeholder = '' }) => (
  <div className="relative">
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </div>
);

export const TagGroup = ({ tags, active, onToggle }) => (
  <div className="flex flex-wrap gap-2 mb-2">
    {tags.map(t => (
      <button
        key={t}
        onClick={() => onToggle(t)}
        className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
          active.includes(t) ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {t}
      </button>
    ))}
  </div>
);