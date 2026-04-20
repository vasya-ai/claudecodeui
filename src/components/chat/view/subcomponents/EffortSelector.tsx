import { useState, useRef, useEffect, useCallback, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Zap, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { effortLevels } from '../../constants/effortLevels';

type EffortSelectorProps = {
  selectedEffort: string;
  onEffortChange: (effortId: string) => void;
  onClose?: () => void;
  className?: string;
};

function EffortSelector({ selectedEffort, onEffortChange, onClose, className = '' }: EffortSelectorProps) {
  const { t } = useTranslation('chat');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties | null>(null);

  const translatedLevels = effortLevels.map(level => ({
    ...level,
    name: t(`effort.levels.${level.id}.name`),
    description: t(`effort.levels.${level.id}.description`),
  }));

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const updateDropdownPosition = useCallback(() => {
    const trigger = triggerRef.current;
    const dropdown = dropdownRef.current;
    if (!trigger || !dropdown || typeof window === 'undefined') {
      return;
    }

    const triggerRect = trigger.getBoundingClientRect();
    const viewportPadding = window.innerWidth < 640 ? 12 : 16;
    const spacing = 8;
    const width = Math.min(window.innerWidth - viewportPadding * 2, window.innerWidth < 640 ? 320 : 256);
    let left = triggerRect.left + triggerRect.width / 2 - width / 2;
    left = Math.max(viewportPadding, Math.min(left, window.innerWidth - width - viewportPadding));

    const measuredHeight = dropdown.offsetHeight || 0;
    const spaceBelow = window.innerHeight - triggerRect.bottom - spacing - viewportPadding;
    const spaceAbove = triggerRect.top - spacing - viewportPadding;
    const openBelow = spaceBelow >= Math.min(measuredHeight || 320, 320) || spaceBelow >= spaceAbove;
    const availableHeight = Math.min(
      window.innerHeight - viewportPadding * 2,
      Math.max(180, openBelow ? spaceBelow : spaceAbove),
    );
    const panelHeight = Math.min(measuredHeight || availableHeight, availableHeight);
    const top = openBelow
      ? Math.min(triggerRect.bottom + spacing, window.innerHeight - viewportPadding - panelHeight)
      : Math.max(viewportPadding, triggerRect.top - spacing - panelHeight);

    setDropdownStyle({
      position: 'fixed',
      top,
      left,
      width,
      maxHeight: availableHeight,
      zIndex: 80,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setDropdownStyle(null);
      return;
    }

    const rafId = window.requestAnimationFrame(updateDropdownPosition);
    const handleViewportChange = () => updateDropdownPosition();

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [isOpen, updateDropdownPosition]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (containerRef.current?.contains(target) || dropdownRef.current?.contains(target)) {
        return;
      }

      closeDropdown();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDropdown();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeDropdown]);

  const currentLevel =
    translatedLevels.find(level => level.id === selectedEffort) ||
    translatedLevels.find(level => level.id === 'high') ||
    translatedLevels[0];
  const IconComponent = currentLevel.icon || Zap;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (isOpen) {
            closeDropdown();
            return;
          }

          setIsOpen(true);
        }}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 transition-all duration-200 hover:bg-indigo-200 dark:bg-indigo-900 dark:hover:bg-indigo-800 sm:h-10 sm:w-10"
        title={t('effort.buttonTitle', { level: currentLevel.name })}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <IconComponent className={`h-5 w-5 ${currentLevel.color}`} />
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle || { position: 'fixed', top: 0, left: 0, visibility: 'hidden' }}
          className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
          role="dialog"
          aria-modal="false"
        >
          <div className="border-b border-gray-200 p-3 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t('effort.selector.title')}
              </h3>
              <button
                type="button"
                onClick={closeDropdown}
                className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('effort.selector.description')}
            </p>
          </div>

          <div className="min-h-0 overflow-y-auto py-1">
            {translatedLevels.map((level) => {
              const LevelIcon = level.icon;
              const isSelected = level.id === selectedEffort;

              return (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => {
                    onEffortChange(level.id);
                    closeDropdown();
                  }}
                  className={`w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${isSelected ? 'bg-gray-50 dark:bg-gray-700' : ''
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${level.color}`}>
                      <LevelIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                          {level.name}
                        </span>
                        {isSelected && (
                          <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            {t('effort.selector.active')}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {level.description}
                      </p>
                      <code className="mt-1 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-700">
                        --effort {level.id}
                      </code>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="border-t border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Tip:</strong> {t('effort.selector.tip')}
            </p>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default EffortSelector;
