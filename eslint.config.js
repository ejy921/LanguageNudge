import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  // IGNORE FILES
  { ignores: ['dist', 'node_modules', 'coverage'] },

  // 2. MAIN CONFIGURATION
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,        // Browser APIs (window, document, fetch)
        ...globals.node,          // Node APIs (needed for your build.js script)
        ...globals.webextensions, // Chrome Extension APIs (chrome.storage, etc.)
        vi: 'readonly',           // Vitest global (if you use it without importing)
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { 
      react: { version: '18.3' } // Tells ESLint to use React 18 rules
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    
    // 3. RULES
    rules: {
      // Load standard recommended rules
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,

      // Custom Tweaks for your project:
      
      // Allow links to open in new tabs without "noreferrer" (safe in modern browsers)
      'react/jsx-no-target-blank': 'off',
      
      // Disable Prop-Types (annoying for personal projects/JS)
      'react/prop-types': 'off',
      
      // Turn off warnings about "undeclared variables" for things like 'chrome' or 'module'
      'no-undef': 'error', 
      
      // Ensure Fast Refresh works correctly in Vite
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // Warn if you leave a console.log in production code (optional, good practice)
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
];