// This file acts as a 'translator' for esbuild to pick up environment variables from .env and hardcode them into the final JavaScript files

import { build } from 'esbuild';
import { copyFileSync } from 'fs';
import 'dotenv/config'; // load environment variables from .env file

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
  jsx: 'automatic',
};

async function runBuild() {
  try {
    await Promise.all([
      build({
        ...config,
        entryPoints: ['src/popup.jsx'],
        outfile: 'dist/popup.js',
      }),
      build({
        ...config,
        entryPoints: ['src/background.js'],
        outfile: 'dist/background.js',
      })
    ]);

    copyFileSync('src/popup.html', 'dist/popup.html');
    copyFileSync('src/popup.css', 'dist/popup.css');
    console.log('Build completed successfully.');

  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

runBuild();