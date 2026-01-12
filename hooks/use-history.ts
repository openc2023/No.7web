
import { useState, useCallback } from 'react';

export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useHistory<T>(initialState: T | (() => T)) {
  const [history, setHistory] = useState<HistoryState<T>>(() => {
    const present = typeof initialState === 'function' 
      ? (initialState as () => T)() 
      : initialState;
      
    return {
      past: [],
      present,
      future: []
    };
  });

  const { past, present, future } = history;

  // Standard Set: Pushes current to past
  const set = useCallback((newState: T | ((prev: T) => T)) => {
    setHistory(current => {
      const calculatedNewState = typeof newState === 'function' 
        ? (newState as (prev: T) => T)(current.present) 
        : newState;
      
      if (calculatedNewState === current.present) return current;

      return {
        past: [...current.past, current.present],
        present: calculatedNewState,
        future: [] // Clear future on new branch
      };
    });
  }, []);

  // Replace: Updates current without pushing to history (for syncs/loading)
  const replace = useCallback((newState: T) => {
    setHistory(current => ({
      ...current,
      present: newState
    }));
  }, []);

  // Reset: Clears history and sets new state (for new project/hard reload)
  const reset = useCallback((newState: T) => {
    setHistory({
      past: [],
      present: newState,
      future: []
    });
  }, []);

  const undo = useCallback(() => {
    setHistory(current => {
      if (current.past.length === 0) return current;
      
      const previous = current.past[current.past.length - 1];
      const newPast = current.past.slice(0, -1);
      
      return {
        past: newPast,
        present: previous,
        future: [current.present, ...current.future]
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory(current => {
      if (current.future.length === 0) return current;
      
      const next = current.future[0];
      const newFuture = current.future.slice(1);
      
      return {
        past: [...current.past, current.present],
        present: next,
        future: newFuture
      };
    });
  }, []);

  return {
    state: present,
    set,
    replace,
    reset,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    history // exposed for debugging if needed
  };
}
