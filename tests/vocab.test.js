import { describt, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Vocabs from '.../src/components/Vocabs';

// mock supabase client before importing component
vi.mock('.../src/supabaseClient', () => ({
    
}

))