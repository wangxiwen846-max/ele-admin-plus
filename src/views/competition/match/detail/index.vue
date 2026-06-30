<template>
  <div />
</template>

<script setup>
  import { onMounted } from 'vue';
  import { useRouter } from 'vue-router';

  defineOptions({ name: 'CompetitionMatchDetail' });

  const router = useRouter();
  onMounted(() => {
    router.replace('/competition/match');
  });
</script>
