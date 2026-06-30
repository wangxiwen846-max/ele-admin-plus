<!-- 比赛详情附件只读列表 -->
<template>
  <div class="match-attachment-readonly">
    <div v-if="!list.length" class="attachment-empty-text">暂无附件</div>
    <el-table v-else :data="list" border size="small">
      <el-table-column prop="name" label="文件名称" min-width="160" show-overflow-tooltip />
      <el-table-column prop="type" label="文件类型" width="90" align="center" />
      <el-table-column prop="uploadTime" label="上传时间" width="150" align="center" />
      <el-table-column label="操作" width="120" align="center">
        <template #default="{ row }">
          <el-link type="primary" underline="never" @click="handlePreview(row)">预览</el-link>
          <el-divider direction="vertical" />
          <el-link type="primary" underline="never" @click="handleDownload(row)">下载</el-link>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="previewVisible"
      title="附件预览"
      width="480px"
      append-to-body
      destroy-on-close
    >
      <el-descriptions v-if="previewRow" :column="1" border>
        <el-descriptions-item label="文件名称">{{ previewRow.name }}</el-descriptions-item>
        <el-descriptions-item label="文件类型">{{ previewRow.type }}</el-descriptions-item>
        <el-descriptions-item label="上传时间">{{ previewRow.uploadTime }}</el-descriptions-item>
      </el-descriptions>
      <div class="preview-placeholder">这里是附件预览区域（mock）</div>
      <template #footer>
        <el-button type="primary" @click="previewVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { EleMessage } from 'ele-admin-plus';

  defineProps({
    list: { type: Array, default: () => [] }
  });

  const previewVisible = ref(false);
  const previewRow = ref(null);

  const handlePreview = (row) => {
    previewRow.value = row;
    previewVisible.value = true;
  };

  const handleDownload = (row) => {
    EleMessage.info({ message: `下载附件：${row.name}（mock）`, plain: true });
  };
</script>

<style scoped lang="scss">
  .attachment-empty-text {
    color: var(--el-text-color-secondary);
    font-size: 13px;
    padding: 4px 0;
  }

  .preview-placeholder {
    margin-top: 16px;
    padding: 40px 16px;
    text-align: center;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color-light);
    border: 1px dashed var(--el-border-color);
    border-radius: 4px;
  }
</style>
