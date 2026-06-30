<template>
  <ele-page hide-footer :multi-card="false" class="step-form-view">
    <activity-form-page :data="formData" :mode="formMode" />
  </ele-page>
</template>

<script setup>
  import { onMounted, ref } from 'vue';
  import ActivityFormPage from '../components/activity-form-page.vue';
  import { createDefaultActivity } from '../data.js';

  defineOptions({ name: 'CompetitionActivityAdd' });

  const formData = ref(createDefaultActivity());
  const formMode = ref('add');

  onMounted(() => {
    const state = history.state ?? {};
    if (state.initialData) {
      formData.value = state.initialData;
      formMode.value = state.formMode || 'copy';
    }
  });
</script>

