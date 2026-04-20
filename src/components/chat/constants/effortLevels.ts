import { Gauge, Brain, Zap, Sparkles, Atom } from 'lucide-react';

export const EFFORT_STORAGE_KEY = 'claude-effort';
export const DEFAULT_EFFORT = 'high';

export const EFFORT_LEVELS = ['low', 'medium', 'high', 'xhigh', 'max'] as const;
export type EffortLevel = (typeof EFFORT_LEVELS)[number];

const KNOWN_EFFORT_SET: ReadonlySet<string> = new Set(EFFORT_LEVELS);

export function isEffortLevel(value: unknown): value is EffortLevel {
  return typeof value === 'string' && KNOWN_EFFORT_SET.has(value);
}

export const effortLevels = [
  {
    id: 'low',
    icon: Gauge,
    color: 'text-slate-500',
  },
  {
    id: 'medium',
    icon: Brain,
    color: 'text-blue-600',
  },
  {
    id: 'high',
    icon: Zap,
    color: 'text-indigo-600',
  },
  {
    id: 'xhigh',
    icon: Sparkles,
    color: 'text-purple-600',
  },
  {
    id: 'max',
    icon: Atom,
    color: 'text-red-600',
  },
] as const;
