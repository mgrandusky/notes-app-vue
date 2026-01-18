import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useNotesStore } from '@/stores/notes';
import type { CreateNoteDto, UpdateNoteDto, NoteFilter } from '@/types/note.types';

export const useNotes = () => {
  const notesStore = useNotesStore();
  const router = useRouter();
  
  const {
    notes,
    currentNote,
    filteredNotes,
    pinnedNotes,
    favoriteNotes,
    archivedNotes,
    allTags,
    isLoading,
    error,
  } = storeToRefs(notesStore);

  const fetchNotes = () => notesStore.fetchNotes();

  const fetchNoteById = (id: string) => notesStore.fetchNoteById(id);

  const createNote = async (data: CreateNoteDto) => {
    const note = await notesStore.createNote(data);
    router.push(`/notes/${note.id}`);
    return note;
  };

  const updateNote = (id: string, data: UpdateNoteDto) => {
    return notesStore.updateNote(id, data);
  };

  const deleteNote = async (id: string) => {
    await notesStore.deleteNote(id);
    if (router.currentRoute.value.params.id === id) {
      router.push('/notes');
    }
  };

  const togglePin = (id: string) => notesStore.togglePin(id);

  const toggleFavorite = (id: string) => notesStore.toggleFavorite(id);

  const toggleArchive = (id: string) => notesStore.toggleArchive(id);

  const duplicateNote = (id: string) => notesStore.duplicateNote(id);

  const searchNotes = (query: string) => notesStore.searchNotes(query);

  const setFilter = (filter: Partial<NoteFilter>) => notesStore.setFilter(filter);

  const clearFilter = () => notesStore.clearFilter();

  const setCurrentNote = (noteId: string | null) => {
    const note = noteId ? notes.value.find(n => n.id === noteId) || null : null;
    notesStore.setCurrentNote(note);
  };

  return {
    notes,
    currentNote,
    filteredNotes,
    pinnedNotes,
    favoriteNotes,
    archivedNotes,
    allTags,
    isLoading,
    error,
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
};
