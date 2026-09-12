<template>
  <AlertDialog :open="state.open" @update:open="onOpenChange">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ state.title }}</AlertDialogTitle>
        <AlertDialogDescription v-if="state.description">{{ state.description }}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <Button variant="outline" type="button" @click="dismiss(false)">{{ state.cancelLabel }}</Button>
        <Button variant="destructive" type="button" @click="dismiss(true)">
          <HugeiconsIcon :icon="Delete02Icon" :size="15" />
          <span>{{ state.confirmLabel }}</span>
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue';
import { Delete02Icon } from '@hugeicons/core-free-icons';
import { useConfirm } from '../../composables/useConfirm';
import { Button } from '../ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

const { state, resolve, onOpenChange } = useConfirm();

function dismiss(value: boolean) {
  state.value.open = false;
  resolve(value);
}
</script>
