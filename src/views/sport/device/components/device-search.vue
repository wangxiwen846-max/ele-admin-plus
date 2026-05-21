<!-- 设备绑定 - 搜索表单 -->
<template>
  <ele-card :body-style="{ paddingBottom: '2px' }">
    <el-form label-width="84px" @keyup.enter="search" @submit.prevent="">
      <el-row :gutter="8">
        <el-col :lg="6" :md="12" :sm="12" :xs="24">
          <el-form-item label="设备">
            <el-input
              clearable
              v-model.trim="form.deviceKeyword"
              placeholder="设备名称 / 设备编号"
            />
          </el-form-item>
        </el-col>
        <el-col :lg="6" :md="12" :sm="12" :xs="24">
          <el-form-item label="设备类型">
            <el-select v-model="form.deviceType" placeholder="全部类型" clearable class="ele-fluid">
              <el-option v-for="opt in DEVICE_TYPE_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :lg="6" :md="12" :sm="12" :xs="24">
          <el-form-item label="学校">
            <el-select v-model="form.school" placeholder="全部学校" clearable class="ele-fluid">
              <el-option v-for="opt in SCHOOL_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :lg="6" :md="12" :sm="12" :xs="24">
          <el-form-item label="绑定状态">
            <el-select v-model="form.bindStatus" placeholder="全部状态" clearable class="ele-fluid">
              <el-option v-for="opt in BIND_STATUS_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </el-form-item>
        </el-col>

        <template v-if="expand">
          <el-col :lg="6" :md="12" :sm="12" :xs="24">
            <el-form-item label="年级">
              <el-select v-model="form.grade" placeholder="全部年级" clearable class="ele-fluid">
                <el-option v-for="g in GRADE_OPTIONS" :key="g" :label="g" :value="g" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :lg="6" :md="12" :sm="12" :xs="24">
            <el-form-item label="班级">
              <el-select v-model="form.className" placeholder="全部班级" clearable class="ele-fluid">
                <el-option v-for="c in CLASS_OPTIONS" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :lg="6" :md="12" :sm="12" :xs="24">
            <el-form-item label="学生">
              <el-input clearable v-model.trim="form.studentKeyword" placeholder="请输入学生姓名" />
            </el-form-item>
          </el-col>
          <el-col :lg="12" :md="18" :sm="18" :xs="24">
            <el-form-item label="时间范围">
              <el-date-picker
                unlink-panels
                type="daterange"
                v-model="form.dateRange"
                range-separator="-"
                value-format="YYYY-MM-DD"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                class="ele-fluid"
              />
            </el-form-item>
          </el-col>
        </template>

        <el-col :lg="6" :md="12" :sm="12" :xs="24">
          <el-form-item label-width="16px">
            <el-button type="primary" @click="search">查询</el-button>
            <el-button @click="reset">重置</el-button>
            <el-link
              type="primary"
              underline="never"
              style="margin-left: 12px"
              @click="expand = !expand"
            >
              <template v-if="expand">
                <span>收起</span>
                <el-icon style="vertical-align: -1px"><ArrowUpOutlined /></el-icon>
              </template>
              <template v-else>
                <span>展开</span>
                <el-icon style="vertical-align: -2px"><ArrowDownOutlined /></el-icon>
              </template>
            </el-link>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </ele-card>
</template>

<script setup>
  import { ref, reactive } from 'vue';
  import { ArrowDownOutlined, ArrowUpOutlined } from '@/components/icons';
  import {
    SCHOOL_OPTIONS,
    GRADE_OPTIONS,
    CLASS_OPTIONS,
    DEVICE_TYPE_OPTIONS,
    BIND_STATUS_OPTIONS
  } from '@/views/sport/data.js';

  const emit = defineEmits(['search']);

  const expand = ref(false);

  const defaultForm = () => ({
    deviceKeyword: '',
    deviceType: '',
    school: '',
    grade: '',
    className: '',
    studentKeyword: '',
    bindStatus: '',
    dateRange: []
  });

  const form = reactive(defaultForm());

  const search = () => emit('search', { ...form });
  const reset = () => {
    Object.assign(form, defaultForm());
    search();
  };

  search();
</script>
