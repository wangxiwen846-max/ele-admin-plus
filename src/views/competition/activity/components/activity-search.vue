<!-- 活动管理查询表单 -->
<template>
  <ele-card :body-style="{ paddingBottom: '2px' }">
    <el-form label-width="82px" @keyup.enter="search" @submit.prevent="">
      <el-row :gutter="8">
        <el-col :lg="8" :md="12" :sm="12" :xs="24">
          <el-form-item label="活动名称">
            <el-input
              v-model.trim="form.activityName"
              clearable
              placeholder="支持模糊搜索"
            />
          </el-form-item>
        </el-col>
        <el-col :lg="8" :md="12" :sm="12" :xs="24">
          <el-form-item label="活动状态">
            <el-select
              v-model="form.status"
              clearable
              placeholder="请选择"
              class="ele-fluid"
            >
              <el-option
                v-for="opt in ACTIVITY_STATUS_OPTIONS"
                :key="opt"
                :label="opt"
                :value="opt"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :lg="8" :md="12" :sm="12" :xs="24">
          <el-form-item label="活动时间">
            <el-date-picker
              v-model="form.dateRange"
              type="daterange"
              value-format="YYYY-MM-DD"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              class="ele-fluid"
            />
          </el-form-item>
        </el-col>
        <el-col :lg="8" :md="12" :sm="12" :xs="24">
          <el-form-item label="主办单位">
            <el-input
              v-model.trim="form.hostUnit"
              clearable
              placeholder="支持按主办单位搜索"
            />
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
  import { ACTIVITY_STATUS_OPTIONS } from '../data.js';

  const emit = defineEmits(['search']);

  const [form, resetFields] = useFormData({
    activityName: '',
    status: '',
    dateRange: [],
    hostUnit: ''
  });

  const search = () => {
    emit('search', { ...form });
  };

  const reset = () => {
    resetFields();
    search();
  };
</script>
