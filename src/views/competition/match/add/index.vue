<template>
  <ele-page hide-footer :multi-card="false" class="step-form-view">
    <match-form-page :data="formData" :mode="formMode" />
  </ele-page>
</template>

<script setup>
  import { onMounted, ref } from 'vue';
  import MatchFormPage from '../components/match-form-page.vue';
  import { createDefaultMatch } from '../data.js';

  defineOptions({ name: 'CompetitionMatchAdd' });

  const formData = ref(createDefaultMatch());
  const formMode = ref('add');

  onMounted(() => {
    const state = history.state ?? {};
    if (state.initialData) {
      formData.value = state.initialData;
      formMode.value = state.formMode || 'copy';
    }
  });
</script>
