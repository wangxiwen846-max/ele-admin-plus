<!-- 附件列表（上传 + 预览/下载/删除） -->
<template>
  <div class="attachment-editor" :class="{ 'is-compact': compact, 'is-readonly': readonly }">
    <div class="attachment-toolbar">
      <span class="attachment-title">{{ title }}</span>
      <el-upload
        v-if="!readonly"
        :auto-upload="false"
        :show-file-list="false"
        :disabled="disabled"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp"
        @change="handleUpload"
      >
        <el-button type="primary" link size="small" :disabled="disabled">上传附件</el-button>
      </el-upload>
    </div>

    <div v-if="!list.length" class="attachment-empty">
      <el-empty
        :description="readonly ? '暂无附件' : '暂无附件，请点击右上角上传'"
        :image-size="48"
      />
    </div>
    <el-table v-else :data="list" border size="small" :class="{ 'is-compact-table': compact }">
      <el-table-column prop="name" label="文件名称" min-width="160" show-overflow-tooltip />
      <el-table-column prop="type" label="文件类型" width="90" align="center" />
      <el-table-column prop="uploadTime" label="上传时间" width="150" align="center" />
      <el-table-column label="操作" :width="readonly ? 120 : 160" align="center">
        <template #default="{ row }">
          <el-link type="primary" underline="never" @click="handlePreview(row)">预览</el-link>
          <el-divider direction="vertical" />
          <el-link type="primary" underline="never" @click="handleDownload(row)">下载</el-link>
          <template v-if="!readonly">
            <el-divider direction="vertical" />
            <el-link type="danger" underline="never" @click="handleRemove(row)">删除</el-link>
          </template>
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
  import { ElMessageBox } from 'element-plus';
  import { EleMessage } from 'ele-admin-plus';
  import { formatNow } from '@/views/event-item/data.js';

  defineProps({
    title: String,
    list: { type: Array, default: () => [] },
    disabled: Boolean,
    readonly: Boolean,
    compact: Boolean
  });
  const emit = defineEmits(['add', 'remove']);

  const previewVisible = ref(false);
  const previewRow = ref(null);

  const handleUpload = (file) => {
    emit('add', {
      id: `file_${Date.now()}`,
      name: file.name,
      type: getFileType(file.name),
      uploadTime: formatNow()
    });
  };

  const handlePreview = (row) => {
    previewRow.value = row;
    previewVisible.value = true;
  };

  const handleDownload = (row) => {
    EleMessage.success({ message: `开始下载附件：${row.name}`, plain: true });
  };

  const handleRemove = (row) => {
    ElMessageBox.confirm(`确定删除附件“${row.name}”吗？`, '删除附件', {
      type: 'warning',
      draggable: true
    })
      .then(() => emit('remove', row))
      .catch(() => {});
  };

  function getFileType(name = '') {
    const ext = name.split('.').pop()?.toUpperCase() || '文件';
    if (['DOC', 'DOCX'].includes(ext)) return 'Word';
    if (['XLS', 'XLSX'].includes(ext)) return 'Excel';
    if (['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP'].includes(ext)) return '图片';
    return ext;
  }
</script>

<style lang="scss" scoped>
  .attachment-editor {
    margin: 0 0 4px 132px;

    &.is-compact {
      margin: 0;
    }
  }

  .attachment-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    min-height: 28px;
  }

  .attachment-title {
    color: var(--el-text-color-regular);
    font-size: 13px;
    font-weight: 500;
  }

  .attachment-empty {
    background: var(--el-fill-color-lighter);
    border: 1px dashed var(--el-border-color-lighter);
    border-radius: 4px;

    :deep(.el-empty) {
      padding: 10px 0;
    }

    :deep(.el-empty__description) {
      margin-top: 6px;
      font-size: 12px;
    }
  }

  .is-compact-table :deep(.el-table__cell) {
    padding: 6px 0;
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

  @media (max-width: 768px) {
    .attachment-editor:not(.is-compact) {
      margin-left: 0;
    }
  }
</style>
