import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Vocabs from '../src/components/Vocabs';

// --- 1. Robust Supabase Mock Setup ---
// We need to mock chainable methods (.select().eq(), .insert().select(), etc.)
let mockSelect = vi.fn();
let mockEq = vi.fn();
let mockInsert = vi.fn();
let mockUpdate = vi.fn();
let mockDelete = vi.fn();
let mockFrom = vi.fn();

vi.mock('../src/supabaseClient', () => {
  const _mockSelect = vi.fn();
  const _mockEq = vi.fn();
  const _mockInsert = vi.fn();
  const _mockUpdate = vi.fn();
  const _mockDelete = vi.fn();
  const _mockFrom = vi.fn(() => ({ select: _mockSelect, insert: _mockInsert, update: _mockUpdate, delete: _mockDelete }));

  globalThis.__TEST_MOCKS__ = globalThis.__TEST_MOCKS__ || {};
  Object.assign(globalThis.__TEST_MOCKS__, {
    mockSelect: _mockSelect,
    mockEq: _mockEq,
    mockInsert: _mockInsert,
    mockUpdate: _mockUpdate,
    mockDelete: _mockDelete,
    mockFrom: _mockFrom,
  });

  return {
    supabase: {
      from: _mockFrom,
    },
  };
});

describe('Vocabs Component', () => {
  const mockDeckId = 123;
  const mockNavigate = vi.fn();

  // Helper to create dummy data
  const createMockVocabs = (count = 2) => 
    Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      front: `Front ${i + 1}`,
      back: `Back ${i + 1}`,
      deck_id: mockDeckId,
      created_at: new Date(Date.now() - i * 1000).toISOString(), // Staggered times for sort tests
    }));

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Reassign to factory-exposed mocks if present
    if (globalThis.__TEST_MOCKS__) {
      ({ mockSelect, mockEq, mockInsert, mockUpdate, mockDelete, mockFrom } = globalThis.__TEST_MOCKS__);
    }

    // Default Chain Configuration
    // This allows calls to return "this" so chains don't crash
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    });
    
    mockSelect.mockReturnValue({ eq: mockEq });
    mockInsert.mockReturnValue({ select: mockSelect });
    mockUpdate.mockReturnValue({ eq: mockEq }); // update().eq()
    mockDelete.mockReturnValue({ eq: mockEq }); 
    
    // Handle the specific chain for update: .update().eq().select()
    // We need eq to return an object with select in this specific path
    mockEq.mockImplementation(() => ({
       select: mockSelect, // For update().eq().select()
       // If the chain ends at eq() (like fetch or delete), we usually just await this object
       // But in your code, you await the chain. To make a mock awaitable, 
       // we usually use mockResolvedValue on the *last* function. 
       // We will set specific return values in the tests below.
    }));
  });

  it('renders and fetches vocabs for the deck', async () => {
    const mockData = createMockVocabs(2);

    // Setup Mock: .from().select().eq() -> returns data
    mockEq.mockResolvedValue({ data: mockData, error: null });

    render(React.createElement(Vocabs, { deckId: mockDeckId, navigate: mockNavigate }));

    // Check if Supabase was called correctly
    expect(mockFrom).toHaveBeenCalledWith('vocab');
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Front 1')).toBeInTheDocument();
      expect(screen.getByText('Back 1')).toBeInTheDocument();
      expect(screen.getByText('Front 2')).toBeInTheDocument();
    });
  });

  it('opens the add card popup and saves a new card', async () => {
    const existingData = createMockVocabs(1);
    const newCard = { id: 99, front: 'New Front', back: 'New Back', deck_id: mockDeckId };

    // 1. Mock Fetch (Initial load)
    mockEq.mockResolvedValueOnce({ data: existingData, error: null });
    
    // 2. Mock Insert Chain: .insert().select()
    // Ensure the insert call returns a select() that resolves to the new card (avoid consuming mockSelect used for fetch)
    mockInsert.mockReturnValueOnce({ select: () => Promise.resolve({ data: [newCard], error: null }) });

    const { container } = render(React.createElement(Vocabs, { deckId: mockDeckId, navigate: mockNavigate }));

    // Wait for load
    await waitFor(() => expect(screen.getByText('Front 1')).toBeInTheDocument());

    // Click the Plus Icon (CirclePlus)
    // Since it's an icon, we use the class provided by Lucide
    const addButton = container.querySelector('.lucide-circle-plus');
    fireEvent.click(addButton);

    // Check Popup
    expect(screen.getByText('Add new card')).toBeInTheDocument();

    // Fill Form
    fireEvent.change(screen.getByPlaceholderText('Front'), { target: { value: 'New Front' } });
    fireEvent.change(screen.getByPlaceholderText('Back'), { target: { value: 'New Back' } });

    // Click Save
    fireEvent.click(screen.getByText('Save'));

    // Assertions
    await waitFor(() => {
      // Supabase insert check
      expect(mockInsert).toHaveBeenCalledWith([
        { front: 'New Front', back: 'New Back', deck_id: mockDeckId }
      ]);
      // UI Update check
      expect(screen.getByText('New Front')).toBeInTheDocument();
    });
  });

  it('edits an existing card', async () => {
    const mockData = createMockVocabs(1); // One card: Front 1
    const updatedCard = { ...mockData[0], front: 'Edited Front' };

    // 1. Mock Fetch
    mockEq.mockResolvedValueOnce({ data: mockData, error: null });

    // 2. Mock Update Chain: .update().eq().select()
    // Here, eq().select() should resolve to the updated card without interfering with the initial fetch
    mockEq.mockReturnValueOnce({ select: () => Promise.resolve({ data: [updatedCard], error: null }) });

    const { container } = render(React.createElement(Vocabs, { deckId: mockDeckId, navigate: mockNavigate }));
    await waitFor(() => expect(screen.getByText('Front 1')).toBeInTheDocument());

    // Open the individual menu (EllipsisVertical)
    const menuButton = container.querySelector('.lucide-ellipsis-vertical');
    fireEvent.click(menuButton);

    // Click "Edit" in dropdown
    const editOption = screen.getByText('Edit');
    fireEvent.click(editOption);

    // Check Popup values pre-filled
    const frontInput = screen.getByPlaceholderText('Front');
    expect(frontInput.value).toBe('Front 1');

    // Change value
    fireEvent.change(frontInput, { target: { value: 'Edited Front' } });
    fireEvent.click(screen.getByText('Save'));

    // Assertions
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({ front: 'Edited Front', back: 'Back 1' });
      expect(screen.getByText('Edited Front')).toBeInTheDocument();
      expect(screen.queryByText('Front 1')).not.toBeInTheDocument();
    });
  });

  it('deletes a card', async () => {
    const mockData = createMockVocabs(1);

    // Mock fetch and delete chains explicitly to avoid ordering issues
    mockFrom.mockReturnValueOnce({
      select: () => ({ eq: () => Promise.resolve({ data: mockData, error: null }) }),
      delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
    });

    const { container } = render(React.createElement(Vocabs, { deckId: mockDeckId, navigate: mockNavigate }));
    await waitFor(() => expect(screen.getByText('Front 1')).toBeInTheDocument());

    // Open menu
    const menuButton = container.querySelector('.lucide-ellipsis-vertical');
    fireEvent.click(menuButton);

    // Click Delete option
    fireEvent.click(screen.getByText('Delete'));

    // Verify Confirmation Popup
    expect(screen.getByText('Delete card')).toBeInTheDocument();

    // Confirm Delete (use role to pick the actual button)
    const confirmBtn = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(confirmBtn);

    // Assertions
    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalled();
      expect(screen.queryByText('Front 1')).not.toBeInTheDocument();
    });
  });

  it('deletes the deck, clears cache, and navigates home', async () => {
    // 1. Setup Supabase Mocks
    // Call #1: Initial Fetch (Vocabs) -> Returns empty list
    // Call #2: Delete Deck (Deck) -> Returns success (error: null)
    mockEq
      .mockResolvedValueOnce({ data: [], error: null }) 
      .mockResolvedValueOnce({ error: null });          

    // 2. Render
    const { container } = render(React.createElement(Vocabs, { deckId: mockDeckId, navigate: mockNavigate }));

    // Wait for initial load
    await waitFor(() => expect(mockFrom).toHaveBeenCalledWith('vocab'));

    // 3. Find and Click the Trash Icon
    // This opens your custom "Mini Popup"
    const trashIcon = container.querySelector('.lucide-trash-2');
    fireEvent.click(trashIcon);

    // 4. Verify Your Custom Popup UI appears
    expect(screen.getByText('Delete deck')).toBeInTheDocument();

    // 5. Click the Red "Delete" button inside your UI
    // We target the button specifically
    const deleteBtn = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(deleteBtn);

    // 6. Assertions
    await waitFor(() => {
        // A. Check Supabase 'delete' flow (No window.confirm needed!)
        expect(mockFrom).toHaveBeenCalledWith('decks'); 
        expect(mockDelete).toHaveBeenCalled();
        expect(mockEq).toHaveBeenCalledWith('id', mockDeckId);

        // B. Check Cache Clearing
        expect(localStorage.getItem(`supabase_vocabs_cache_${mockDeckId}`)).toBeNull();

        // C. Check Navigation
        expect(mockNavigate).toHaveBeenCalledWith('home');
    });
  });

  it('handles sorting options', async () => {
    // Create 3 items with specific names to test sorting
    const vocabA = { id: 1, front: 'Apple', back: 'A', created_at: '2023-01-01', deck_id: 123 };
    const vocabB = { id: 2, front: 'Banana', back: 'B', created_at: '2023-01-02', deck_id: 123 };
    const vocabC = { id: 3, front: 'Carrot', back: 'C', created_at: '2023-01-03', deck_id: 123 };
    
    const mockData = [vocabB, vocabA, vocabC]; // Random order initially

    // Mock the fetch chain directly so select/eq chaining won't get consumed
    mockFrom.mockReturnValueOnce({ select: () => ({ eq: () => Promise.resolve({ data: mockData, error: null }) }) });

    const { container } = render(React.createElement(Vocabs, { deckId: mockDeckId, navigate: mockNavigate }));
    await waitFor(() => expect(screen.getByText('Apple')).toBeInTheDocument());

    // Open Sort Menu
    const sortIcon = container.querySelector('.lucide-chevron-down');
    fireEvent.click(sortIcon);

    // Click "Name"
    fireEvent.click(screen.getByText('Name'));

    // Get all rows
    const rows = container.querySelectorAll('.vocab-row span:first-child');
    // Expect alphabetical order: Apple, Banana, Carrot
    expect(rows[0]).toHaveTextContent('Apple');
    expect(rows[1]).toHaveTextContent('Banana');
    expect(rows[2]).toHaveTextContent('Carrot');

    // Open Sort Menu again
    fireEvent.click(sortIcon);
    // Click "Newest"
    fireEvent.click(screen.getByText('Newest'));
    
    const rowsNewest = container.querySelectorAll('.vocab-row span:first-child');
    // Expect: Carrot (Jan 3), Banana (Jan 2), Apple (Jan 1)
    expect(rowsNewest[0]).toHaveTextContent('Carrot');
    expect(rowsNewest[1]).toHaveTextContent('Banana');
    expect(rowsNewest[2]).toHaveTextContent('Apple');
  });

  it('uses localStorage cache if available', async () => {
    const cachedData = [{ id: 10, front: 'Cached Vocab', back: 'C', deck_id: mockDeckId }];
    localStorage.setItem(`supabase_vocabs_cache_${mockDeckId}`, JSON.stringify(cachedData));

    const serverData = [{ id: 20, front: 'Server Vocab', back: 'S', deck_id: mockDeckId }];

    // Make sure the server fetch returns serverData and doesn't consume the factory's default chain
    mockFrom.mockReturnValueOnce({ select: () => ({ eq: () => Promise.resolve({ data: serverData, error: null }) }) });

    render(React.createElement(Vocabs, { deckId: mockDeckId, navigate: mockNavigate }));

    // cached item should be rendered immediately
    expect(screen.getByText('Cached Vocab')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Server Vocab')).toBeInTheDocument();
      expect(localStorage.getItem(`supabase_vocabs_cache_${mockDeckId}`)).toContain('Server Vocab');
    });
  });
})