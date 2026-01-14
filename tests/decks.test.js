import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../src/components/Home'; // Adjust path if needed

// mock supabase setup
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockInsert = vi.fn();
const mockDelete = vi.fn();
const mockFrom = vi.fn();
const mockGetUser = vi.fn(); 

vi.mock('../src/supabaseClient', () => ({
  supabase: {
    from: mockFrom,
    auth: {
      getUser: mockGetUser,
    },
  },
}));

describe('Home Component', () => {
  const mockNavigate = vi.fn();
  const mockSession = { user: { id: 'user-123' } };

  const createMockDecks = (count = 2) =>
    Array.from({ length: count }, (_, i) => ({
      id: `deck-${i + 1}`,
      name: `Deck ${i + 1}`,
      user_id: 'user-123',
    }));

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      delete: mockDelete,
    });

    mockSelect.mockReturnValue({ eq: mockEq });
    mockInsert.mockReturnValue({ select: mockSelect });
    mockDelete.mockReturnValue({ eq: mockEq });
    
    mockGetUser.mockResolvedValue({ 
        data: { user: { id: 'user-123' } }, 
        error: null 
    });
  });

  it('renders and fetches decks for the user', async () => {
    const mockDecks = createMockDecks(2);
    mockEq.mockResolvedValue({ data: mockDecks, error: null });

    render(<Home session={mockSession} navigate={mockNavigate} />);

    expect(mockFrom).toHaveBeenCalledWith('decks');

    await waitFor(() => {
      expect(screen.getByText('Deck 1')).toBeInTheDocument();
      expect(screen.getByText('Deck 2')).toBeInTheDocument();
    });
  });

  it('handles creating a new deck', async () => {
    mockEq.mockResolvedValueOnce({ data: [], error: null });

    const newDeck = { id: 'new-deck-id', name: 'Biology 101', user_id: 'user-123' };
    mockSelect.mockResolvedValueOnce({ data: [newDeck], error: null }); // Response for the insert

    const { container } = render(<Home session={mockSession} navigate={mockNavigate} />);

    const addIcon = container.querySelector('.lucide-circle-plus');
    fireEvent.click(addIcon);

    expect(screen.getByText('Create New Deck')).toBeInTheDocument();

    const input = screen.getByPlaceholderText('Deck Name');
    fireEvent.change(input, { target: { value: 'Biology 101' } });

    const createBtn = screen.getByText('Create');
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(mockGetUser).toHaveBeenCalled();
      
      expect(mockInsert).toHaveBeenCalledWith([
        expect.objectContaining({
          name: 'Biology 101',
          user_id: 'user-123'
        })
      ]);

      expect(screen.getByText('Biology 101')).toBeInTheDocument();
      
      // 4. Popup closed
      expect(screen.queryByText('Create New Deck')).not.toBeInTheDocument();
    });
  });

  it('handles deleting a deck', async () => {
    const mockDecks = createMockDecks(1);
    mockEq.mockResolvedValueOnce({ data: mockDecks, error: null }); 
    mockEq.mockResolvedValueOnce({ error: null }); 

    const { container } = render(<Home session={mockSession} navigate={mockNavigate} />);

    await waitFor(() => expect(screen.getByText('Deck 1')).toBeInTheDocument());

    const trashIcon = container.querySelector('.lucide-trash-2');
    fireEvent.click(trashIcon);

    expect(screen.getByText(/Are you sure you want to delete this deck/i)).toBeInTheDocument();

    const deleteBtn = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
        expect(mockDelete).toHaveBeenCalled();
        expect(screen.queryByText('Deck 1')).not.toBeInTheDocument();
    });
  });

  it('navigates to vocabs page when View Deck is clicked', async () => {
    const mockDecks = createMockDecks(1);
    mockEq.mockResolvedValue({ data: mockDecks, error: null });

    render(<Home session={mockSession} navigate={mockNavigate} />);
    await waitFor(() => expect(screen.getByText('Deck 1')).toBeInTheDocument());

    fireEvent.click(screen.getByText('View deck'));

    expect(mockNavigate).toHaveBeenCalledWith('vocabs', 'deck-1');
  });

  it('uses localStorage cache if available', async () => {
    const cachedData = [{ id: 'cache-1', name: 'Cached Deck', user_id: 'user-123' }];
    localStorage.setItem('supabase_decks_cache', JSON.stringify(cachedData));

    const serverData = [{ id: 'server-1', name: 'Server Deck', user_id: 'user-123' }];
    mockEq.mockResolvedValue({ data: serverData, error: null });

    render(<Home session={mockSession} navigate={mockNavigate} />);

    expect(screen.getByText('Cached Deck')).toBeInTheDocument();

    await waitFor(() => {
        expect(screen.getByText('Server Deck')).toBeInTheDocument();
        expect(localStorage.getItem('supabase_decks_cache')).toContain('Server Deck');
    });
  });
});