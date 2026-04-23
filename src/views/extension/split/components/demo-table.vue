<template>
  <ele-card
    :flex-table="true"
    :body-style="{ padding: 0 }"
    style="border-radius: 0"
  >
    <ele-split-panel
      :flex-table="true"
      :space="0"
      size="42%"
      :min-size="180"
      :max-size="-180"
      :vertical="true"
      :resizable="true"
      :percentage="true"
      :allow-collapse="true"
      :collapse-btn-offset="2"
      :custom-style="{ border: 'none' }"
      :body-style="{ overflow: 'hidden' }"
    >
      <ele-pro-table
        ref="tableRef"
        row-key="organizationId"
        :columns="columns"
        :datasource="datasource"
        v-model:selections="selections"
        v-model:current="current"
        :highlight-current-row="true"
        :border="true"
        :toolbar="{ theme: 'default', style: { borderRadius: 0 } }"
        :footer-style="{
          borderWidth: '0 1px 0 1px',
          borderStyle: 'solid',
          borderColor: 'var(--el-border-color-light)',
          marginTop: '-0.45px'
        }"
        :pagination="{ style: { padding: '0 0 8px 0' } }"
        :show-overflow-tooltip="true"
        :table-style="{
          '--ele-table-radius': 0,
          '--ele-table-sm-radius': 0,
          '--ele-table-lg-radius': 0
        }"
        :export-config="{ fileName: '机构数据' }"
        style="padding-bottom: 0; overflow: hidden"
        @done="handleDone"
      >
        <template #toolbar>
          <el-button size="small" type="primary" @click="back">返回</el-button>
        </template>
        <template #action>
          <el-link type="primary" underline="never">修改</el-link>
          <el-divider direction="vertical" />
          <el-link type="danger" underline="never">删除</el-link>
        </template>
      </ele-pro-table>
      <template #body>
        <ele-pro-table
          ref="table2Ref"
          row-key="userId"
          :columns="columns2"
          :datasource="datasource2"
          v-model:selections="selections2"
          :border="true"
          :toolbar="{ theme: 'default', style: { borderRadius: 0 } }"
          :footer-style="{
            borderWidth: '0 1px 1px 1px',
            borderStyle: 'solid',
            borderColor: 'var(--el-border-color-light)',
            marginTop: '-0.45px'
          }"
          :pagination="{ style: { padding: '0 0 8px 0' } }"
          :show-overflow-tooltip="true"
          :load-on-created="false"
          :table-style="{
            '--ele-table-radius': 0,
            '--ele-table-sm-radius': 0,
            '--ele-table-lg-radius': 0
          }"
          :export-config="{ fileName: '用户数据' }"
          style="padding-bottom: 0"
        >
          <template #toolbar>
            <span class="hidden-sm-and-down">上下两个表格会自适应高度</span>
          </template>
          <template #action>
            <el-link type="primary" underline="never">修改</el-link>
            <el-divider direction="vertical" />
            <el-link type="danger" underline="never">删除</el-link>
          </template>
        </ele-pro-table>
      </template>
    </ele-split-panel>
  </ele-card>
</template>

<script setup>
  import { ref, nextTick, watch } from 'vue';
  import { pageOrganizations } from '@/api/system/organization';
  import { pageUsers } from '@/api/system/user';

  const emit = defineEmits(['change']);

  /** 返回 */
  const back = () => {
    emit('change');
  };

  /** 表格实例 */
  const tableRef = ref(null);

  /** 表格列配置 */
  const columns = ref([
    {
      type: 'selection',
      columnKey: 'selection',
      width: 50,
      align: 'center'
    },
    {
      type: 'index',
      columnKey: 'index',
      width: 50,
      align: 'center'
    },
    {
      prop: 'organizationName',
      label: '机构名称',
      sortable: 'custom',
      align: 'center',
      minWidth: 140
    },
    {
      prop: 'organizationTypeName',
      label: '机构类型',
      sortable: 'custom',
      align: 'center',
      minWidth: 140
    },
    {
      prop: 'sortNumber',
      label: '排序号',
      sortable: 'custom',
      align: 'center',
      width: 100
    },
    {
      prop: 'createTime',
      label: '创建时间',
      sortable: 'custom',
      align: 'center',
      minWidth: 200
    },
    {
      columnKey: 'action',
      label: '操作',
      width: 128,
      align: 'center',
      resizable: false,
      slot: 'action',
      hideInPrint: true,
      hideInExport: true
    }
  ]);

  /** 表格选中数据 */
  const selections = ref([]);

  /** 表格单选选中数据 */
  const current = ref(null);

  /** 表格数据源 */
  const datasource = ({ pages, where, orders }) => {
    return pageOrganizations({ ...where, ...orders, ...pages });
  };

  /** 表格数据请求完成事件 */
  const handleDone = ({ data }) => {
    if (data?.length) {
      nextTick(() => {
        tableRef.value?.setCurrentRow?.(data[0]);
      });
    }
  };

  /** 刷新表格2数据 */
  watch(current, (row) => {
    table2Ref.value?.reload?.({
      where: { organizationId: row.organizationId }
    });
  });

  /** 表格2实例 */
  const table2Ref = ref(null);

  /** 表格2列配置 */
  const columns2 = ref([
    {
      type: 'selection',
      columnKey: 'selection',
      width: 50,
      align: 'center'
    },
    {
      type: 'index',
      columnKey: 'index',
      width: 50,
      align: 'center'
    },
    {
      prop: 'username',
      label: '用户账号',
      sortable: 'custom',
      align: 'center',
      minWidth: 140
    },
    {
      prop: 'nickname',
      label: '用户名',
      sortable: 'custom',
      align: 'center',
      minWidth: 140
    },
    {
      prop: 'sexName',
      label: '性别',
      sortable: 'custom',
      align: 'center',
      width: 100
    },
    {
      prop: 'createTime',
      label: '创建时间',
      sortable: 'custom',
      align: 'center',
      minWidth: 200
    },
    {
      columnKey: 'action',
      label: '操作',
      width: 128,
      align: 'center',
      resizable: false,
      slot: 'action',
      hideInPrint: true,
      hideInExport: true
    }
  ]);

  /** 表格2选中数据 */
  const selections2 = ref([]);

  /** 表格2数据源 */
  const datasource2 = ({ pages, where, orders }) => {
    return pageUsers({ ...where, ...orders, ...pages });
  };
</script>
