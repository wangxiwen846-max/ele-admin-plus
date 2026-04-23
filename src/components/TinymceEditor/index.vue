<!-- 富文本编辑器 -->
<template>
  <component v-if="inlineEditor" :is="tagName" :id="elementId" />
  <textarea v-else :id="elementId"></textarea>
  <!-- 文件选择弹窗 -->
  <EleFormItemRest>
    <FilePicker
      title="文件选择"
      :limit="1"
      :accept="filePickerAccept ? filePickerAccept + '*' : void 0"
      :params="{ contentType: filePickerAccept }"
      :base-index="19990099"
      v-model="showFilePicker"
      @done="handleFilePickerDone"
      @close="handleFilePickerClose"
    />
  </EleFormItemRest>
</template>

<script setup>
  import {
    ref,
    watch,
    onMounted,
    onBeforeUnmount,
    onActivated,
    onDeactivated,
    nextTick,
    useAttrs
  } from 'vue';
  import FilePicker from '@/components/FilePicker/index.vue';
  import tinymce from 'tinymce/tinymce';
  import 'tinymce/themes/silver';
  import 'tinymce/icons/default';
  import 'tinymce/plugins/code';
  import 'tinymce/plugins/preview';
  import 'tinymce/plugins/fullscreen';
  import 'tinymce/plugins/paste';
  import 'tinymce/plugins/searchreplace';
  //import 'tinymce/plugins/save';
  //import 'tinymce/plugins/autosave';
  import 'tinymce/plugins/link';
  import 'tinymce/plugins/autolink';
  import 'tinymce/plugins/image';
  import 'tinymce/plugins/media';
  import 'tinymce/plugins/table';
  import 'tinymce/plugins/codesample';
  import 'tinymce/plugins/lists';
  import 'tinymce/plugins/advlist';
  import 'tinymce/plugins/hr';
  import 'tinymce/plugins/charmap';
  import 'tinymce/plugins/emoticons';
  import 'tinymce/plugins/anchor';
  import 'tinymce/plugins/directionality';
  import 'tinymce/plugins/pagebreak';
  import 'tinymce/plugins/quickbars';
  import 'tinymce/plugins/nonbreaking';
  import 'tinymce/plugins/visualblocks';
  import 'tinymce/plugins/visualchars';
  import 'tinymce/plugins/wordcount';
  import 'tinymce/plugins/emoticons/js/emojis';
  import { storeToRefs } from 'pinia';
  import { useThemeStore } from '@/store/modules/theme';
  import { uploadFile } from '@/api/system/file';
  import {
    DEFAULT_CONFIG,
    DARK_CONFIG,
    uuid,
    bindHandlers,
    openAlert
  } from './util';

  defineOptions({ name: 'TinymceEditor' });

  const props = defineProps({
    /** 编辑器唯一id */
    id: String,
    /** v-model */
    modelValue: String,
    /** 编辑器配置 */
    init: Object,
    /** 是否内联模式 */
    inline: Boolean,
    /** model events */
    modelEvents: {
      type: String,
      default: 'change input undo redo'
    },
    /** 内联模式标签名 */
    tagName: {
      type: String,
      default: 'div'
    },
    /** 是否禁用 */
    disabled: Boolean,
    /** 是否跟随框架主题 */
    autoTheme: {
      type: Boolean,
      default: true
    },
    /** 不跟随框架主题时是否使用暗黑主题 */
    darkTheme: Boolean
  });

  const emit = defineEmits(['update:modelValue']);

  const attrs = useAttrs();
  const themeStore = useThemeStore();
  const { darkMode } = storeToRefs(themeStore);

  /** 编辑器唯一id */
  const elementId = props.id || uuid('tiny-vue');

  /** 实例导出 */
  const exposeData = {
    /** 编辑器实例 */
    editorIns: null,
    /** 弹出提示框 */
    alert(option) {
      openAlert(this.editorIns, option);
    }
  };

  /** 是否内联模式 */
  const inlineEditor = props.init?.inline || props.inline;

  /** 更新value */
  const updateValue = (value) => {
    emit('update:modelValue', value);
  };

  /** 修改内容 */
  const setContent = (value) => {
    if (
      exposeData.editorIns &&
      typeof value === 'string' &&
      value !== exposeData.editorIns.getContent()
    ) {
      exposeData.editorIns.setContent(value);
    }
  };

  /** 渲染编辑器 */
  const render = () => {
    const isDark = props.autoTheme ? darkMode.value : props.darkTheme;
    tinymce.init({
      ...DEFAULT_CONFIG,
      ...(isDark ? DARK_CONFIG : {}),
      images_upload_handler: (blobInfo, success, error) => {
        const file = blobInfo.blob();
        uploadFile(file, void 0, file.name)
          .then((res) => {
            success(res.url);
          })
          .catch((e) => {
            console.error(e);
            error(e.message);
          });
      },
      file_picker_callback: (callback, _value, meta) => {
        if (meta.filetype === 'image') {
          filePickerAccept.value = 'image/';
        } else if (meta.filetype === 'media') {
          filePickerAccept.value = 'video/';
        } else {
          filePickerAccept.value = void 0;
        }
        showFilePicker.value = true;
        currentEditorCallback = callback;
      },
      ...props.init,
      selector: `#${elementId}`,
      readonly: props.disabled,
      inline: inlineEditor,
      setup: (editor) => {
        exposeData.editorIns = editor;
        editor.on('init', (e) => {
          // 回显初始值
          if (props.modelValue) {
            setContent(props.modelValue);
          }
          // v-model
          editor.on(props.modelEvents, () => {
            updateValue(editor.getContent());
          });
          // valid events
          bindHandlers(e, attrs, editor);
        });
        if (typeof props.init?.setup === 'function') {
          props.init.setup(editor);
        }
      }
    });
  };

  /** 销毁编辑器 */
  const destory = () => {
    if (tinymce != null && exposeData.editorIns != null) {
      tinymce.remove(exposeData.editorIns);
      exposeData.editorIns = null;
    }
  };

  defineExpose(exposeData);

  watch(
    () => props.modelValue,
    (val, prevVal) => {
      if (val !== prevVal) {
        setContent(val || '');
      }
    }
  );

  watch(
    () => props.disabled,
    (disable) => {
      if (exposeData.editorIns !== null) {
        if (typeof exposeData.editorIns.mode?.set === 'function') {
          exposeData.editorIns.mode.set(disable ? 'readonly' : 'design');
        } else {
          exposeData.editorIns.setMode(disable ? 'readonly' : 'design');
        }
      }
    }
  );

  watch(
    () => props.tagName,
    () => {
      destory();
      nextTick(() => {
        render();
      });
    }
  );

  watch(darkMode, () => {
    if (props.autoTheme) {
      destory();
      nextTick(() => {
        render();
      });
    }
  });

  onMounted(() => {
    render();
  });

  onBeforeUnmount(() => {
    destory();
  });

  onActivated(() => {
    render();
  });

  onDeactivated(() => {
    destory();
  });

  /** 是否打开文件选择弹窗 */
  const showFilePicker = ref(false);

  /** 文件选择弹窗限制类型 */
  const filePickerAccept = ref();

  /** 当前修改的文件项 */
  let currentEditorCallback = null;

  /** 文件选择弹窗选择完成事件 */
  const handleFilePickerDone = (files) => {
    showFilePicker.value = false;
    if (files.length) {
      currentEditorCallback(files[0].url, {
        text: files[0].name,
        alt: files[0].name
      });
    }
    currentEditorCallback = null;
  };

  /** 文件选择弹窗关闭事件 */
  const handleFilePickerClose = () => {
    currentEditorCallback = null;
  };
</script>

<style lang="scss">
  @use 'ele-admin-plus/es/style/util.scss' as *;

  body {
    .tox.tox-tinymce-aux,
    &.tox-fullscreen .tox.tox-tinymce-aux {
      z-index: 19990000;
    }

    .tox-menu.tox-collection.tox-collection--list {
      max-height: 420px !important;
    }

    textarea[id^='tiny-vue'] {
      width: 0;
      height: 0;
      margin: 0;
      padding: 0;
      opacity: 0;
      box-sizing: border-box;
    }

    .tox .tox-menubar,
    .tox .tox-toolbar-overlord,
    .tox .tox-edit-area__iframe,
    .tox .tox-statusbar {
      background: none;
    }

    .tox .tox-toolbar,
    .tox .tox-toolbar__overflow,
    .tox .tox-toolbar__primary {
      background: none;
      box-shadow: 0 -0.8px 0 elVar('border-color', 'light') inset;
    }

    .tox.tox-tinymce.tox-fullscreen {
      background: elVar('bg-color');
    }
  }
</style>
