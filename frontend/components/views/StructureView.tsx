import React, { useState } from 'react';
import { Folder, FileCode, GitBranch, ChevronRight } from 'lucide-react';
import { Card } from '../ui/Primitives';
import { FileNode } from '../../types';

export const StructureView = ({ structure }: { structure: FileNode }) => {
  const renderTree = (node: FileNode, depth = 0) => {
    const [isOpen, setIsOpen] = useState(true);
    const hasChildren = node.children && node.children.length > 0;
    return (
      <div key={node.name} style={{ paddingLeft: depth > 0 ? 20 : 0 }}>
        <div className={`flex items-center py-1.5 px-2 rounded-lg cursor-pointer select-none hover:bg-slate-50`} onClick={() => hasChildren && setIsOpen(!isOpen)}>
          <div className="mr-2 text-slate-400">{hasChildren ? (isOpen ? <ChevronRight className="rotate-90 h-4 w-4" /> : <ChevronRight className="h-4 w-4" />) : <div className="w-4" />}</div>
          <div className="mr-2">{node.type === 'folder' ? <Folder className={`h-4 w-4 ${hasChildren ? 'text-blue-500' : 'text-slate-400'}`} /> : <FileCode className="h-4 w-4 text-slate-400" />}</div>
          <span className={`text-sm ${node.type === 'folder' ? 'font-medium text-slate-700' : 'text-slate-500'}`}>{node.name}</span>
        </div>
        {isOpen && node.children && <div className="border-l border-slate-100 ml-3.5">{node.children.map(child => renderTree(child, depth + 1))}</div>}
      </div>
    );
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      <Card className="p-6 overflow-y-auto lg:col-span-1 h-full">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">File Tree</h3>
        {renderTree(structure)}
      </Card>
      <Card className="p-0 lg:col-span-2 h-full relative overflow-hidden bg-slate-50 border-slate-200 flex items-center justify-center">
         <div className="text-center"><div className="inline-flex p-4 bg-white rounded-full shadow-lg mb-4"><GitBranch className="h-8 w-8 text-blue-500" /></div><p className="text-slate-500 font-medium">Interactive Graph View</p></div>
      </Card>
    </div>
  );
};