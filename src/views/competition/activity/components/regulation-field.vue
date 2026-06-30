<!-- 活动规程：富文本 + PDF 附件 -->
<template>
  <div class="regulation-field">
    <tinymce-editor
      :model-value="text"
      :disabled="disabled"
      :init="editorConfig"
      @update:model-value="emit('update:text', $event)"
    />
    <div class="regulation-upload">
      <el-upload
        v-if="!disabled"
        :auto-upload="false"
        :show-file-list="false"
        accept=".pdf,application/pdf"
        @change="handleUpload"
      >
        <el-button type="primary" link>上传 PDF 附件</el-button>
      </el-upload>
    </div>
    <div v-if="attachments.length" class="regulation-files">
      <div v-for="file in attachments" :key="file.id" class="file-row">
        <span class="file-name" :title="file.name">{{ file.name }}</span>
        <span class="file-size">{{ file.sizeText || '-' }}</span>
        <el-link
          v-if="!disabled"
          type="danger"
          underline="never"
          @click="handleRemove(file)"
        >
          删除
        </el-link>
      </div>
    </div>
    <div v-else-if="!disabled" class="regulation-empty">暂无附件</div>
  </div>
</template>

<script setup>
  import { ElMessageBox } from 'element-plus';
  import { EleMessage } from 'ele-admin-plus';
  import TinymceEditor from '@/components/TinymceEditor/index.vue';
  import { formatNow } from '@/views/event-item/data.js';

  defineProps({
    text: {
      type: String,
      default: ''
    },
    attachments: {
      type: Array,
      default: () => []
    },
    disabled: Boolean
  });

  const emit = defineEmits(['update:text', 'add', 'remove']);

  const editorConfig = {
    height: 280,
    menubar: false,
    statusbar: false,
    plugins: 'lists link autolink',
    toolbar: 'bold italic underline | h2 h3 | numlist bullist | link | removeformat',
    placeholder: '请输入活动规程内容'
  };

  const formatFileSize = (bytes) => {
    if (!bytes) {
      return '-';
    }
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleUpload = (uploadFile) => {
    const raw = uploadFile?.raw;
    const name = raw?.name ?? uploadFile?.name ?? '';
    if (!name.toLowerCase().endsWith('.pdf')) {
      EleMessage.error({ message: '仅支持上传 PDF 文件', plain: true });
      return;
    }
    emit('add', {
      id: `reg_${Date.now()}`,
      name,
      type: 'PDF',
      size: raw?.size ?? 0,
      sizeText: formatFileSize(raw?.size),
      uploadTime: formatNow()
    });
  };

  const handleRemove = (row) => {
    ElMessageBox.confirm(`确定删除附件“${row.name}”吗？`, '删除附件', {
      type: 'warning',
      draggable: true
    })
      .then(() => emit('remove', row))
      .catch(() => {});
  };
</script>

<style scoped lang="scss">
  .regulation-field {
    width: 100%;
  }

  .regulation-upload {
    margin-top: 10px;
  }

  .regulation-files {
    margin-top: 10px;
    padding: 8px 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 4px;
  }

  .file-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 0;

    & + .file-row {
      border-top: 1px dashed var(--el-border-color-lighter);
    }
  }

  .file-name {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    color: var(--el-text-color-regular);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .file-size {
    flex-shrink: 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .regulation-empty {
    margin-top: 8px;
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }
</style>
