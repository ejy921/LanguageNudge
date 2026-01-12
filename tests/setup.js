import { vi } from 'vitest';
import '@testing-library/jest-dom'

// mock global chrome object
global.chrome = {
    runtime: {
        sendMessage: vi.fn(),
        onMessage: {
            addListener: vi.fn(),
        },
    },
    storage: {
        local: {
            get: vi.fn(),
            set: vi.fn(),
        }
    },
};