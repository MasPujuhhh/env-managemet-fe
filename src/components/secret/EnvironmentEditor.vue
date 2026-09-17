<template>
  <Card>
    <CardHeader>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="grid gap-1">
          <p class="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">Source of truth</p>
          <CardTitle>Environment variables</CardTitle>
          <CardDescription>
            Edit the complete `.env` content. Current values are shown and saved as-is.
          </CardDescription>
        </div>
        <div class="flex items-center gap-2">
          <Badge v-if="dirty" variant="secondary">
            <HugeiconsIcon :icon="Alert01Icon" :size="12" />
            <span>Unsaved changes</span>
          </Badge>
          <Button :disabled="!dirty || loading" @click="save">
            <HugeiconsIcon :icon="SaveIcon" :size="15" />
            <span>{{ loading && dirty ? 'Saving...' : 'Save / Sync' }}</span>
          </Button>
        </div>
      </div>
    </CardHeader>
    <CardContent class="grid gap-3">
      <div v-if="error" class="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        <HugeiconsIcon :icon="Alert01Icon" :size="15" />
        <span>{{ error }}</span>
      </div>
      <div v-if="loading && !content" class="grid place-items-center py-10"><Spinner /></div>
      <Textarea
        v-else
        v-model="content"
        spellcheck="false"
        aria-label="Environment variables editor"
        class="min-h-[430px] font-mono text-[13px] leading-relaxed"
        @input="dirty = true"
      />
      <div v-if="summary" class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <Badge>Saved</Badge>
        <span>Created {{ summary.created }}</span>
        <span>Updated {{ summary.updated }}</span>
        <span>Deleted {{ summary.deleted }}</span>
        <span>Unchanged {{ summary.unchanged }}</span>
      </div>
    </CardContent>
  </Card>
</template>
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { HugeiconsIcon } from '@hugeicons/vue';
import { Alert01Icon, SaveIcon } from '@hugeicons/core-free-icons';
import { secretApi } from '../../services/api/secret.api';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Spinner } from '../ui/spinner';
import { Textarea } from '../ui/textarea';
import { useApiError } from '../../composables/useApiError';
import { useToast } from '../../composables/useToast';
const props = defineProps<{ repositoryId: string }>();
const emit = defineEmits<{ synced: [] }>();
const content = ref('');
const dirty = ref(false);
const loading = ref(true);
const error = ref('');
const summary = ref<{
  created: number;
  updated: number;
  deleted: number;
  unchanged: number;
} | null>(null);
const toast = useToast();
const apiError = useApiError();
function validate(text: string) {
  for (const [index, raw] of text.split(/\r?\n/).entries()) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const normalized = line.startsWith('export ') ? line.slice(7).trimStart() : line;
    const separator = normalized.indexOf('=');
    if (separator <= 0) return `Line ${index + 1}: Expected KEY=value.`;
    const key = normalized.slice(0, separator).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key))
      return `Line ${index + 1}: Invalid environment variable key.`;
  }
  return null;
}
async function load() {
  loading.value = true;
  try {
    const response = await secretApi.list(props.repositoryId);
    content.value = response.data.data
      .map((secret) => {
        if (secret.type === 'COMMENT') return secret.value || '#';
        if (secret.type === 'EMPTY') return '';
        if (!secret.key) return '';
        return `${secret.key}=${secret.value ?? ''}`;
      })
      .join('\n');
    dirty.value = false;
  } catch (e) {
    const message = apiError.message(e, 'Unable to load environment variables.');
    error.value = message;
    toast.push(message, 'error');
  } finally {
    loading.value = false;
  }
}
async function save() {
  const validation = validate(content.value);
  if (validation) {
    error.value = validation;
    return;
  }
  error.value = '';
  loading.value = true;
  try {
    const response = await secretApi.sync(props.repositoryId, content.value);
    summary.value = response.data.data;
    dirty.value = false;
    toast.push('Environment variables saved successfully.', 'success');
    await load();
    emit('synced');
  } catch (e) {
    const message = apiError.message(e, 'Unable to sync environment variables. Check the editor format.');
    error.value = message;
    toast.push(message, 'error');
  } finally {
    loading.value = false;
  }
}
function confirmLeave(event: BeforeUnloadEvent) {
  if (!dirty.value) return;
  event.preventDefault();
  event.returnValue = 'You have unsaved changes.';
}
onMounted(() => {
  load();
  window.addEventListener('beforeunload', confirmLeave);
});
onBeforeUnmount(() => window.removeEventListener('beforeunload', confirmLeave));
</script>
