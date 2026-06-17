'use client';

import { useState } from 'react';
import { DiffResult } from '../../lib/context/diff';

interface ContextTreeProps {
  data: any;
  diff?: DiffResult | null;
  path?: string;
  isRoot?: boolean;
  name?: string;
}

export function ContextTree({ data, diff, path = '', isRoot = true, name }: ContextTreeProps) {
  const [isExpanded, setIsExpanded] = useState(isRoot || (data && typeof data === 'object' && Object.keys(data).length < 5));

  if (data === null) {
    return <span className="text-gray-500 font-mono text-sm">null</span>;
  }

  if (typeof data === 'string') {
    return <span className="text-green-400 font-mono text-sm whitespace-pre">"{data}"</span>;
  }

  if (typeof data === 'number') {
    return <span className="text-blue-400 font-mono text-sm">{data}</span>;
  }

  if (typeof data === 'boolean') {
    return <span className="text-purple-400 font-mono text-sm">{data ? 'true' : 'false'}</span>;
  }

  if (typeof data === 'object') {
    const isArray = Array.isArray(data);
    const keys = Object.keys(data);
    
    if (keys.length === 0) {
      return <span className="text-gray-500 font-mono text-sm">{isArray ? '[]' : '{}'}</span>;
    }

    const toggleExpand = () => setIsExpanded(!isExpanded);

    return (
      <div className="font-mono text-sm min-w-fit">
        <span 
          onClick={toggleExpand} 
          className="cursor-pointer select-none text-gray-500 hover:text-gray-300 mr-1 inline-block w-4 text-center"
        >
          {isExpanded ? '▼' : '▶'}
        </span>
        <span className="text-gray-500">{isArray ? '[' : '{'}</span>
        
        {isExpanded && (
          <div className="pl-5 border-l border-[var(--border-color)] ml-2 mt-1 mb-1 space-y-0.5">
            {keys.map((key) => {
              const currentPath = path ? (isArray ? `${path}[${key}]` : `${path}.${key}`) : key;
              
              let bgColor = 'bg-transparent';
              if (diff) {
                if (diff.added.includes(currentPath)) bgColor = 'bg-green-500/10 border border-green-500/20';
                else if (diff.removed.includes(currentPath)) bgColor = 'bg-red-500/10 border border-red-500/20';
                else if (diff.changed.includes(currentPath)) bgColor = 'bg-yellow-500/10 border border-yellow-500/20';
              }

              return (
                <div key={key} className={`flex py-1 px-1 rounded ${bgColor} min-w-fit`}>
                  {!isArray && (
                    <span className="text-orange-300 mr-2 flex-shrink-0">
                      "{key}":
                    </span>
                  )}
                  <div className="flex-1">
                    <ContextTree data={data[key as keyof typeof data]} diff={diff} path={currentPath} isRoot={false} name={key} />
                    {key !== keys[keys.length - 1].toString() && <span className="text-gray-500">,</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {!isExpanded && (
          <span className="text-gray-400 italic px-1 cursor-pointer select-none" onClick={toggleExpand}>
            {isArray ? `${name ? name + ' ' : ''}(${keys.length} items)` : `${keys.length} keys...`}
          </span>
        )}
        
        <span className="text-gray-500">{isArray ? ']' : '}'}</span>
      </div>
    );
  }

  return <span className="text-gray-500">{String(data)}</span>;
}
