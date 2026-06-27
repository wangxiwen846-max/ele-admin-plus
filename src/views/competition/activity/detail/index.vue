<template>
  <div />
</template>

<script setup>
  import { onMounted } from 'vue';
  import { useRouter } from 'vue-router';

  defineOptions({ name: 'CompetitionActivityDetail' });

  const router = useRouter();
  onMounted(() => {
    router.replace('/competition/activity');
  });
</script>
