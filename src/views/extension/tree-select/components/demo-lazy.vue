<template>
  <ele-card header="更多示例">
    <div style="margin-bottom: 8px">懒加载:</div>
    <div style="max-width: 240px">
      <el-tree-select
        lazy
        :load="loadTreeData"
        multiple
        clearable
        show-checkbox
        check-strictly
        check-on-click-node
        node-key="menuId"
        :props="{ label: 'title' }"
        v-model="selectedValue"
        placeholder="请选择"
        class="ele-fluid"
        :popper-options="{ strategy: 'fixed' }"
      />
    </div>
    <div style="margin: 18px 0 8px 0">多选无复选框:</div>
    <div style="max-width: 240px">
      <el-tree-select
        multiple
        clearable
        :data="treeData"
        node-key="menuId"
        :props="{ label: 'title' }"
        v-model="selectedValue2"
        placeholder="请选择"
        class="ele-fluid"
        :popper-options="{ strategy: 'fixed' }"
      />
    </div>
  </ele-card>
</template>

<script setup>
  import { ref } from 'vue';
  import { EleMessage, toTree } from 'ele-admin-plus';
  import { listMenus } from '@/api/system/menu';

  /** 选中值 */
  const selectedValue = ref([]);

  /** 懒加载 */
  const loadTreeData = (node, resolve) => {
    listMenus({ parentId: node.level === 0 ? 0 : node.data.menuId })
      .then((data) => {
        data.forEach((d) => {
          if ([339, 341, 342].includes(d.menuId)) {
            d.disabled = true;
          }
        });
        resolve(data);
      })
      .catch((e) => {
        EleMessage.error({ message: e.message, plain: true });
        resolve([]);
      });
  };

  /** 选中值 */
  const selectedValue2 = ref([]);

  /** 数据 */
  const treeData = ref([]);

  listMenus()
    .then((list) => {
      treeData.value = toTree({
        data: list,
        idField: 'menuId',
        parentIdField: 'parentId'
      });
    })
    .catch((e) => {
      EleMessage.error({ message: e.message, plain: true });
    });
</script>
