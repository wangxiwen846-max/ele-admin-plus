<!-- 设项管理查询表单 -->
<template>
  <ele-card :body-style="{ paddingBottom: '2px' }">
    <el-form label-width="82px" @keyup.enter="search" @submit.prevent="">
      <el-row :gutter="8">
        <el-col :lg="8" :md="12" :sm="12" :xs="24">
          <el-form-item label="设项名称">
            <el-input
              v-model.trim="form.itemName"
              clearable
              placeholder="请输入设项名称"
            />
          </el-form-item>
        </el-col>
        <el-col :lg="8" :md="12" :sm="12" :xs="24">
          <el-form-item label="设项来源">
            <el-select
              v-model="form.source"
              clearable
              placeholder="请选择"
              class="ele-fluid"
            >
              <el-option v-for="opt in SOURCE_OPTIONS" :key="opt" :label="opt" :value="opt" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :lg="8" :md="12" :sm="12" :xs="24">
          <el-form-item label="体育项目">
            <el-select
              v-model="form.sport"
              clearable
              placeholder="请选择体育项目"
              class="ele-fluid"
            >
              <el-option v-for="opt in SPORT_OPTIONS" :key="opt" :label="opt" :value="opt" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :lg="8" :md="12" :sm="12" :xs="24">
          <el-form-item label="比赛形式">
            <el-select
              v-model="form.matchForm"
              clearable
              placeholder="请选择"
              class="ele-fluid"
            >
              <el-option
                v-for="opt in MATCH_FORM_OPTIONS"
                :key="opt"
                :label="opt"
                :value="opt"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :lg="8" :md="12" :sm="12" :xs="24">
          <el-form-item label="启用状态">
            <el-select
              v-model="form.status"
              clearable
              placeholder="请选择"
              class="ele-fluid"
            >
              <el-option
                v-for="opt in STATUS_OPTIONS"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :lg="8" :md="12" :sm="12" :xs="24">
          <el-form-item label-width="16px">
            <el-button type="primary" @click="search">查询</el-button>
            <el-button @click="reset">重置</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </ele-card>
</template>

<script setup>
  import { useFormData } from '@/utils/use-form-data';
  import {
    SOURCE_OPTIONS,
    SPORT_OPTIONS,
    MATCH_FORM_OPTIONS,
    STATUS_OPTIONS
  } from '@/views/event-item/data.js';

  const emit = defineEmits(['search']);

  const [form, resetFields] = useFormData({
    itemName: '',
    source: '',
    sport: '',
    matchForm: '',
    status: ''
  });

  const search = () => {
    emit('search', { ...form });
  };

  const reset = () => {
    resetFields();
    search();
  };
</script>
