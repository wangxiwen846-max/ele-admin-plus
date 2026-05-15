<!-- 体测记录 - 搜索表单 -->
<template>
  <ele-card :body-style="{ paddingBottom: '2px' }">
    <el-form label-width="80px" @keyup.enter="search" @submit.prevent="">
      <el-row :gutter="8">
        <el-col :lg="6" :md="12" :sm="12" :xs="24">
          <el-form-item label="学年">
            <el-select
              v-model="form.schoolYear"
              placeholder="全部学年"
              clearable
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
        <el-col :lg="6" :md="12" :sm="12" :xs="24">
          <el-form-item label="学期">
            <el-select
              v-model="form.term"
              placeholder="全部学期"
              clearable
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
        <el-col :lg="6" :md="12" :sm="12" :xs="24">
          <el-form-item label="所在单位">
            <el-select
              v-model="form.unit"
              placeholder="全部单位"
              clearable
              class="ele-fluid"
            >
              <el-option
                v-for="opt in UNIT_OPTIONS"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :lg="6" :md="12" :sm="12" :xs="24">
          <el-form-item label="学校">
            <el-select
              v-model="form.school"
              placeholder="全部学校"
              clearable
              class="ele-fluid"
            >
              <el-option
                v-for="opt in SCHOOL_OPTIONS"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <template v-if="expand">
          <el-col :lg="6" :md="12" :sm="12" :xs="24">
            <el-form-item label="年级">
              <el-select
                v-model="form.grade"
                placeholder="全部年级"
                clearable
                class="ele-fluid"
              >
                <el-option
                  v-for="g in ALL_GRADES"
                  :key="g"
                  :label="g"
                  :value="g"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :lg="6" :md="12" :sm="12" :xs="24">
            <el-form-item label="班级">
              <el-select
                v-model="form.className"
                placeholder="全部班级"
                clearable
                class="ele-fluid"
              >
                <el-option
                  v-for="c in CLASS_OPTIONS"
                  :key="c"
                  :label="c"
                  :value="c"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :lg="6" :md="12" :sm="12" :xs="24">
            <el-form-item label="方案">
              <el-select
                v-model="form.planId"
                placeholder="全部方案"
                clearable
                class="ele-fluid"
              >
                <el-option
                  v-for="p in planStore.list"
                  :key="p.planId"
                  :label="p.planName"
                  :value="p.planId"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :lg="6" :md="12" :sm="12" :xs="24">
            <el-form-item label="测试日期">
              <el-date-picker
                unlink-panels
                type="daterange"
                v-model="form.testDate"
                range-separator="-"
                value-format="YYYY-MM-DD"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                class="ele-fluid"
              />
            </el-form-item>
          </el-col>
          <el-col :lg="6" :md="12" :sm="12" :xs="24">
            <el-form-item label="记录类型">
              <el-select
                v-model="form.recordType"
                placeholder="全部类型"
                clearable
                class="ele-fluid"
              >
                <el-option
                  v-for="opt in RECORD_TYPE_OPTIONS"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :lg="6" :md="12" :sm="12" :xs="24">
            <el-form-item label="学生">
              <el-input
                clearable
                v-model.trim="form.studentKeyword"
                placeholder="姓名 / 学号"
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
    SCHOOL_YEAR_OPTIONS,
    TERM_OPTIONS,
    SCHOOL_OPTIONS,
    UNIT_OPTIONS,
    GRADE_OPTIONS,
    CLASS_OPTIONS,
    RECORD_TYPE_OPTIONS,
    planStore
  } from '@/views/fitness/data.js';

  const emit = defineEmits(['search']);

  const expand = ref(false);

  /** 所有年级（不依赖学段，直接平铺） */
  const ALL_GRADES = Object.values(GRADE_OPTIONS).flat();

  const defaultForm = () => ({
    schoolYear: '',
    term: '',
    unit: '',
    school: '',
    grade: '',
    className: '',
    planId: '',
    testDate: [],
    recordType: '',
    studentKeyword: ''
  });

  const form = reactive(defaultForm());

  const search = () => emit('search', { ...form });
  const reset = () => {
    Object.assign(form, defaultForm());
    search();
  };
</script>
