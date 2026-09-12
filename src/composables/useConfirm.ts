import { ref } from 'vue';

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface ConfirmState extends Required<Omit<ConfirmOptions, 'description'>> {
  description: string;
  open: boolean;
}

const state = ref<ConfirmState>({
  open: false,
  title: '',
  description: '',
  confirmLabel: 'Delete',
  cancelLabel: 'Cancel',
});

let resolver: ((value: boolean) => void) | null = null;

export function useConfirm() {
  function ask(options: ConfirmOptions): Promise<boolean> {
    state.value = {
      open: true,
      title: options.title,
      description: options.description ?? '',
      confirmLabel: options.confirmLabel ?? 'Delete',
      cancelLabel: options.cancelLabel ?? 'Cancel',
    };
    return new Promise<boolean>((resolve) => {
      resolver = resolve;
    });
  }

  function resolve(value: boolean) {
    state.value.open = false;
    resolver?.(value);
    resolver = null;
  }

  function onOpenChange(open: boolean) {
    // Dismiss via overlay / Escape counts as cancel.
    if (!open) resolve(false);
  }

  return { state, ask, resolve, onOpenChange };
}
