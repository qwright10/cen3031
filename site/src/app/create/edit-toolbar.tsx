import React from 'react';
import { AddCircle } from '@/icons/add_circle';

interface EditToolbarProps {
  readonly addQuestion: () => void;
}

/**
 * Toolbar displayed between each question during quiz creation
 * @param addQuestion
 */
export function EditToolbar({ addQuestion }: EditToolbarProps) {
  return (
    <div className="h-6 w-full relative">
      <div className="absolute flex items-center justify-center top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 hover:bg-slate-800 px-2 py-1 rounded-full group transition-all">
        <button
          className="text-xs focus:text-sm group-hover:text-sm transition-all flex items-center gap-x-1.5 opacity-25 focus:opacity-100 group-hover:opacity-100"
          onClick={() => { addQuestion(); }}>
          <AddCircle fill="" className="fill-cyan-400 w-4" />
          <span className="text-cyan-400">Add question</span>
        </button>
      </div>
    </div>
  );
}
