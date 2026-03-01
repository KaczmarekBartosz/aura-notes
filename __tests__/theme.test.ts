import test from 'node:test';
import assert from 'node:assert/strict';

import {
  THEMES,
  THEME_CLASSNAMES,
  getNextTheme,
  isValidTheme,
  type ThemeMode,
} from '../types/theme.ts';

test('theme registry includes required themes', () => {
  const ids = THEMES.map((t) => t.id);
  assert.deepEqual(ids, ['brutalist', 'glass-light', 'glass-dark']);
});

test('theme classnames are mapped for all themes', () => {
  const expected: Record<ThemeMode, string> = {
    brutalist: 'theme-brutalist',
    'glass-light': 'theme-glass-light',
    'glass-dark': 'theme-glass-dark',
  };

  assert.deepEqual(THEME_CLASSNAMES, expected);
});

test('getNextTheme cycles through all themes in order', () => {
  assert.equal(getNextTheme('brutalist'), 'glass-light');
  assert.equal(getNextTheme('glass-light'), 'glass-dark');
  assert.equal(getNextTheme('glass-dark'), 'brutalist');
});

test('isValidTheme accepts only supported themes', () => {
  assert.equal(isValidTheme('brutalist'), true);
  assert.equal(isValidTheme('glass-light'), true);
  assert.equal(isValidTheme('glass-dark'), true);
  assert.equal(isValidTheme('dark'), false);
  assert.equal(isValidTheme('light'), false);
  assert.equal(isValidTheme(null), false);
  assert.equal(isValidTheme(undefined), false);
});
