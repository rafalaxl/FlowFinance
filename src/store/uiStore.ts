// ─── FlowFinance — Zustand UI Store ──────────────────────────────────────────
import { create } from 'zustand'
import { persist, type StorageValue } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface ModalState {
  newTransaction: boolean
  editTransaction: string | null
  deleteTransaction: string | null
}

interface UIStore {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  theme: Theme
  setTheme: (theme: Theme) => void
  modals: ModalState
  openNewTransaction: () => void
  openEditTransaction: (id: string) => void
  openDeleteTransaction: (id: string) => void
  closeAllModals: () => void
}

const DEFAULT_MODALS: ModalState = {
  newTransaction: false,
  editTransaction: null,
  deleteTransaction: null,
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else if (theme === 'light') root.classList.remove('dark')
  else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    prefersDark ? root.classList.add('dark') : root.classList.remove('dark')
  }
}

type PersistedSlice = Pick<UIStore, 'theme' | 'sidebarOpen'>

export const useUIStore = create<UIStore>()(
  persist<UIStore, [], [], PersistedSlice>(
    (set) => ({
      sidebarOpen: true,
      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s: UIStore) => ({ sidebarOpen: !s.sidebarOpen })),

      theme: 'system',
      setTheme: (theme: Theme) => {
        applyTheme(theme)
        set({ theme })
      },

      modals: DEFAULT_MODALS,
      openNewTransaction: () =>
        set({ modals: { ...DEFAULT_MODALS, newTransaction: true } }),
      openEditTransaction: (id: string) =>
        set({ modals: { ...DEFAULT_MODALS, editTransaction: id } }),
      openDeleteTransaction: (id: string) =>
        set({ modals: { ...DEFAULT_MODALS, deleteTransaction: id } }),
      closeAllModals: () => set({ modals: DEFAULT_MODALS }),
    }),
    {
      name: 'ff-ui-store',
      partialize: (s): PersistedSlice => ({ theme: s.theme, sidebarOpen: s.sidebarOpen }),
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          return JSON.parse(str) as StorageValue<PersistedSlice>
        },
        setItem: (name, value) => localStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
)
