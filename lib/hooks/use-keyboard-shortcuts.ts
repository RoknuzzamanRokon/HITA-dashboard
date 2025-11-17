/**
 * Custom hook for managing keyboard shortcuts
 * 
 * Provides keyboard shortcut functionality for the exports page:
 * - Ctrl+E: Create export
 * - Ctrl+R: Refresh jobs
 * 
 * Requirements: 9.5
 */

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
    key: string;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    callback: () => void;
    description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            // Don't trigger shortcuts when user is typing in an input field
            const target = event.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) {
                return;
            }

            // Check each shortcut
            for (const shortcut of shortcuts) {
                const ctrlMatch = shortcut.ctrlKey === undefined || shortcut.ctrlKey === event.ctrlKey;
                const shiftMatch = shortcut.shiftKey === undefined || shortcut.shiftKey === event.shiftKey;
                const altMatch = shortcut.altKey === undefined || shortcut.altKey === event.altKey;
                const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

                if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
                    event.preventDefault();
                    shortcut.callback();
                    break;
                }
            }
        },
        [shortcuts]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);
}
