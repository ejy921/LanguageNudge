// This file acts as a 'translator' for esbuild to pick up environment variables from .env and hardcode them into the final JavaScript files

import { build } from 'esbuild';
import fs from 'fs'; // file system module to read .env file
require('dotenv').config();

const config = {
  bundle: true,
  define: {
    'process.env.NODE_ENV': '"production"', // make React to work in production (not dev)
    'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL),
    'process.env.SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY),
  },
  loader: {
    '.js': 'jsx', '.png': 'file', '.css': 'copy' 
  },
};

// Build Popup
build({
  ...config,
  entryPoints: ['src/popup.jsx'],
  outfile: 'dist/popup.js',
}).catch(() => process.exit(1));

// Build Background
build({
  ...config,
  entryPoints: ['src/background.js'],
  outfile: 'dist/background.js',
}).catch(() => process.exit(1));

// Copy HTML & CSS to dist
fs.copyFileSync('src/popup.html', 'dist/popup.html');
fs.copyFileSync('src/styles.css', 'dist/styles.css');