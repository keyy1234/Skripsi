import React from 'react';
import { LEFT_MENU } from '../data/constants';

const LeftSidebar = ({ activeMenu, onMenuChange }) => {
  return (
    <div className="w-52 flex-shrink-0">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {LEFT_MENU.map(item => (
          <button
            key={item.id}
            onClick={() => onMenuChange(item.id)}
            className="w-full text-left px-4 py-3 text-sm font-medium border-b border-gray-100 last:border-0 transition-colors"
            style={{
              background: activeMenu === item.id ? '#0d9488' : 'transparent',
              color: activeMenu === item.id ? '#fff' : '#4b5563',
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LeftSidebar;