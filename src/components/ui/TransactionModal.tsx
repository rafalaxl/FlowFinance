import * as Dialog from '@radix-ui/react-dialog'
import { useUIStore } from '@/store/uiStore'
import { TransactionForm } from './TransactionForm'

export function TransactionModal() {
  const { modals, closeAllModals } = useUIStore()
  const isOpen = modals.newTransaction

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && closeAllModals()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content aria-describedby={undefined} className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-[var(--color-text-primary)]">
              Novo Lançamento
            </Dialog.Title>
            <Dialog.Close className="rounded-sm opacity-70 ring-offset-[var(--color-bg-elevated)] transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2">
              <span className="sr-only">Fechar</span>
              <svg className="h-4 w-4 text-[var(--color-text-primary)]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Dialog.Close>
          </div>
          <TransactionForm />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
