import React from 'react';
import { TOP_TABS } from '../data/constants';

const TopTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex border-t border-gray-200 overflow-x-auto">
      {TOP_TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className="flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap"
          style={{
            borderBottomColor: activeTab === tab.id ? '#f97316' : 'transparent',
            background: activeTab === tab.id ? '#f97316' : 'transparent',
            color: activeTab === tab.id ? '#fff' : '#6b7280',
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
          </svg>
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TopTabs;