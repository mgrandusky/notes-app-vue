import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { noteService } from '@/services/noteService';
import type { Note, CreateNoteDto, UpdateNoteDto, NoteFilter } from '@/types/note.types';

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([]);
  const currentNote = ref<Note | null>(null);
  const filter = ref<NoteFilter>({
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });
  const searchQuery = ref('');
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const filteredNotes = computed(() => {
    let result = [...notes.value];

    if (filter.value.isPinned !== undefined) {
      result = result.filter(note => note.isPinned === filter.value.isPinned);
    }

    if (filter.value.isFavorite !== undefined) {
      result = result.filter(note => note.isFavorite === filter.value.isFavorite);
    }

    if (filter.value.isArchived !== undefined) {
      result = result.filter(note => note.isArchived === filter.value.isArchived);
    }

    if (filter.value.tags && filter.value.tags.length > 0) {
      result = result.filter(note =>
        filter.value.tags!.some(tag => note.tags.includes(tag))
      );
    }

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      result = result.filter(
        note =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    const sortBy = filter.value.sortBy || 'updatedAt';
    const sortOrder = filter.value.sortOrder || 'desc';
    
    result.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else {
        const dateA = new Date(a[sortBy]).getTime();
        const dateB = new Date(b[sortBy]).getTime();
        comparison = dateA - dateB;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    const pinnedNotes = result.filter(note => note.isPinned);
    const unpinnedNotes = result.filter(note => !note.isPinned);

    return [...pinnedNotes, ...unpinnedNotes];
  });

  const pinnedNotes = computed(() => notes.value.filter(note => note.isPinned && !note.isArchived));
  const favoriteNotes = computed(() => notes.value.filter(note => note.isFavorite && !note.isArchived));
  const archivedNotes = computed(() => notes.value.filter(note => note.isArchived));
  const allTags = computed(() => {
    const tagSet = new Set<string>();
    notes.value.forEach(note => {
      note.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  });

  const fetchNotes = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      const response = await noteService.getNotes(filter.value);
      notes.value = response.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch notes';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchNoteById = async (id: string) => {
    try {
      isLoading.value = true;
      error.value = null;
      const note = await noteService.getNoteById(id);
      currentNote.value = note;
      return note;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch note';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const createNote = async (data: CreateNoteDto) => {
    try {
      isLoading.value = true;
      error.value = null;
      const note = await noteService.createNote(data);
      notes.value.unshift(note);
      return note;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create note';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateNote = async (id: string, data: UpdateNoteDto) => {
    try {
      isLoading.value = true;
      error.value = null;
      const updatedNote = await noteService.updateNote(id, data);
      
      const index = notes.value.findIndex(note => note.id === id);
      if (index !== -1) {
        notes.value[index] = updatedNote;
      }
      
      if (currentNote.value?.id === id) {
        currentNote.value = updatedNote;
      }
      
      return updatedNote;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update note';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      isLoading.value = true;
      error.value = null;
      await noteService.deleteNote(id);
      notes.value = notes.value.filter(note => note.id !== id);
      
      if (currentNote.value?.id === id) {
        currentNote.value = null;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete note';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const togglePin = async (id: string) => {
    try {
      const updatedNote = await noteService.togglePin(id);
      const index = notes.value.findIndex(note => note.id === id);
      if (index !== -1) {
        notes.value[index] = updatedNote;
      }
      return updatedNote;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to toggle pin';
      throw err;
    }
  };

  const toggleFavorite = async (id: string) => {
    try {
      const updatedNote = await noteService.toggleFavorite(id);
      const index = notes.value.findIndex(note => note.id === id);
      if (index !== -1) {
        notes.value[index] = updatedNote;
      }
      return updatedNote;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to toggle favorite';
      throw err;
    }
  };

  const toggleArchive = async (id: string) => {
    try {
      const updatedNote = await noteService.toggleArchive(id);
      const index = notes.value.findIndex(note => note.id === id);
      if (index !== -1) {
        notes.value[index] = updatedNote;
      }
      return updatedNote;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to toggle archive';
      throw err;
    }
  };

  const duplicateNote = async (id: string) => {
    try {
      const newNote = await noteService.duplicateNote(id);
      notes.value.unshift(newNote);
      return newNote;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to duplicate note';
      throw err;
    }
  };

  const searchNotes = async (query: string) => {
    try {
      isLoading.value = true;
      error.value = null;
      searchQuery.value = query;
      
      if (!query.trim()) {
        await fetchNotes();
        return;
      }
      
      const response = await noteService.searchNotes(query);
      notes.value = response.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to search notes';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const setFilter = (newFilter: Partial<NoteFilter>) => {
    filter.value = { ...filter.value, ...newFilter };
  };

  const clearFilter = () => {
    filter.value = {
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    };
    searchQuery.value = '';
  };

  const setCurrentNote = (note: Note | null) => {
    currentNote.value = note;
  };

  return {
    notes,
    currentNote,
    filter,
    searchQuery,
    isLoading,
    error,
    filteredNotes,
    pinnedNotes,
    favoriteNotes,
    archivedNotes,
    allTags,
    fetchNotes,
    fetchNoteById,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    toggleFavorite,
    toggleArchive,
    duplicateNote,
    searchNotes,
    setFilter,
    clearFilter,
    setCurrentNote,
  };
});
