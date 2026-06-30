<!-- 比赛管理查询表单 -->
<template>
  <ele-card :body-style="{ paddingBottom: '2px' }">
    <el-form label-width="82px" @keyup.enter="search" @submit.prevent="">
      <el-row :gutter="8">
        <el-col :lg="8" :md="12" :sm="12" :xs="24">
          <el-form-item label="比赛名称">
            <el-input v-model.trim="form.matchName" clearable placeholder="支持模糊搜索" />
          </el-form-item>
        </el-col>
        <el-col :lg="8" :md="12" :sm="12" :xs="24">
          <el-form-item label="所属活动">
            <el-select
              v-model="form.activityId"
              clearable
              filterable
              placeholder="请选择活动"
              class="ele-fluid"
              @change="handleActivityChange"
            >
              <el-option
                v-for="item in activityOptions"
                :key="item.activityId"
                :label="item.activityName"
                :value="item.activityId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :lg="8" :md="12" :sm="12" :xs="24">
          <el-form-item label="所属赛段">
            <el-select
              v-model="form.stageId"
              clearable
              placeholder="请先选择活动"
              class="ele-fluid"
              :disabled="!form.activityId"
            >
              <el-option
                v-for="item in stageOptions"
                :key="item.stageId"
                :label="item.stageName"
                :value="item.stageId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :lg="8" :md="12" :sm="12" :xs="24">
          <el-form-item label="报名状态">
            <el-select v-model="form.registrationStatus" clearable placeholder="请选择" class="ele-fluid">
              <el-option
                v-for="opt in REGISTRATION_STATUS_OPTIONS"
                :key="opt"
                :label="opt"
                :value="opt"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :lg="8" :md="12" :sm="12" :xs="24">
          <el-form-item label="比赛状态">
            <el-select v-model="form.matchStatus" clearable placeholder="请选择" class="ele-fluid">
              <el-option v-for="opt in MATCH_STATUS_OPTIONS" :key="opt" :label="opt" :value="opt" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :lg="8" :md="12" :sm="12" :xs="24">
          <el-form-item label="比赛时间">
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
  import { computed } from 'vue';
  import { useFormData } from '@/utils/use-form-data';
  import {
    getActivityOptions,
    getStageOptions,
    MATCH_STATUS_OPTIONS,
    REGISTRATION_STATUS_OPTIONS
  } from '../data.js';

  const emit = defineEmits(['search']);

  const [form, resetFields] = useFormData({
    matchName: '',
    activityId: void 0,
    stageId: '',
    registrationStatus: '',
    matchStatus: '',
    dateRange: []
  });

  const activityOptions = computed(() => getActivityOptions());

  const stageOptions = computed(() =>
    form.activityId ? getStageOptions(form.activityId) : []
  );

  const handleActivityChange = () => {
    form.stageId = '';
  };

  const search = () => {
    emit('search', { ...form });
  };

  const reset = () => {
    resetFields();
    search();
  };
</script>
