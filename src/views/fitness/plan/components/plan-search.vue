<!-- 体测方案 - 搜索表单 -->
<template>
  <ele-card :body-style="{ paddingBottom: '2px' }">
    <el-form label-width="72px" @keyup.enter="search" @submit.prevent="">
      <el-row :gutter="8">
        <el-col :lg="6" :md="12" :sm="12" :xs="24">
          <el-form-item label="方案名称">
            <el-input
              clearable
              v-model.trim="form.planName"
              placeholder="请输入方案名称"
            />
          </el-form-item>
        </el-col>
        <el-col :lg="6" :md="12" :sm="12" :xs="24">
          <el-form-item label="学段">
            <el-select
              clearable
              v-model="form.stage"
              placeholder="全部学段"
              class="ele-fluid"
            >
              <el-option
                v-for="opt in STAGE_OPTIONS"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :lg="6" :md="12" :sm="12" :xs="24">
          <el-form-item label="学年">
            <el-select
              clearable
              v-model="form.schoolYear"
              placeholder="全部学年"
              class="ele-fluid"
            >
              <el-option
                v-for="opt in SCHOOL_YEAR_OPTIONS"
                :key="opt"
                :label="opt"
                :value="opt"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col v-if="expand" :lg="6" :md="12" :sm="12" :xs="24">
          <el-form-item label="学期">
            <el-select
              clearable
              v-model="form.term"
              placeholder="全部学期"
              class="ele-fluid"
            >
              <el-option
                v-for="opt in TERM_OPTIONS"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col v-if="expand" :lg="6" :md="12" :sm="12" :xs="24">
          <el-form-item label="状态">
            <el-select
              clearable
              v-model="form.status"
              placeholder="全部状态"
              class="ele-fluid"
            >
              <el-option label="启用" :value="1" />
              <el-option label="停用" :value="0" />
            </el-select>
          </el-form-item>
        </el-col>
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
                <el-icon style="vertical-align: -1px">
                  <ArrowUpOutlined />
                </el-icon>
              </template>
              <template v-else>
                <span>展开</span>
                <el-icon style="vertical-align: -2px">
                  <ArrowDownOutlined />
                </el-icon>
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
    STAGE_OPTIONS,
    SCHOOL_YEAR_OPTIONS,
    TERM_OPTIONS
  } from '@/views/fitness/data.js';

  const emit = defineEmits(['search']);

  const expand = ref(false);

  const form = reactive({
    planName: '',
    stage: '',
    schoolYear: '',
    term: '',
    status: ''
  });

  const search = () => emit('search', { ...form });
  const reset = () => {
    form.planName = '';
    form.stage = '';
    form.schoolYear = '';
    form.term = '';
    form.status = '';
    search();
  };
</script>
