/**
 * 参赛名单 Excel 导入：模板下载、解析、校验、写入
 */
import ExcelJS from 'exceljs';
import { download } from '@/utils/common.js';
import {
  STUDENT_OPTIONS,
  addPersonalEntry,
  addTeamEntry,
  getItemOptionsByMatch,
  isStudentRegisteredInItem,
  registrationStore,
  validateParticipantNumberInput
} from './data.js';

export const PERSONAL_IMPORT_TEMPLATE_NAME = '个人赛参赛名单导入模板.xlsx';
export const TEAM_IMPORT_TEMPLATE_NAME = '团体赛参赛名单导入模板.xlsx';

/**
 * 导入模板字段（参赛编号在前，统一学生信息字段顺序）
 * 已选择学校/年级/班级时（按班导入），模板不再重复填写这些字段；
 * 跨班导入时，模板中需要包含学校、年级、班级字段。
 */
const PERSONAL_FIELDS_INCLASS = ['参赛编号', '学生姓名', '班内序号', '性别', '联系电话', '备注'];
const PERSONAL_FIELDS_CROSS = ['参赛编号', '学生姓名', '学校', '年级', '班级', '班内序号', '性别', '联系电话', '备注'];
const TEAM_FIELDS_INCLASS = ['成员参赛编号', '成员姓名', '班内序号', '队伍名称', '联系电话', '备注'];
const TEAM_FIELDS_CROSS = ['成员参赛编号', '成员姓名', '学校', '年级', '班级', '班内序号', '队伍名称', '联系电话', '备注'];

// 统一表头 -> 字段 key 映射（覆盖个人 / 团体、按班 / 跨班全部列）
const HEADER_MAP = {
  参赛编号: 'participantNumber',
  成员参赛编号: 'participantNumber',
  学生姓名: 'studentName',
  成员姓名: 'memberName',
  学校: 'school',
  年级: 'grade',
  班级: 'className',
  班内序号: 'classNo',
  队伍名称: 'teamName',
  性别: 'gender',
  联系电话: 'phone',
  备注: 'remark'
};

// 字段 key -> 展示名称（用于错误明细，区分个人 / 团体）
const PERSONAL_FIELD_LABEL = {
  participantNumber: '参赛编号',
  studentName: '学生姓名',
  school: '学校',
  grade: '年级',
  className: '班级',
  classNo: '班内序号',
  gender: '性别',
  phone: '联系电话',
  remark: '备注'
};
const TEAM_FIELD_LABEL = {
  participantNumber: '成员参赛编号',
  memberName: '成员姓名',
  school: '学校',
  grade: '年级',
  className: '班级',
  classNo: '班内序号',
  teamName: '队伍名称',
  phone: '联系电话',
  remark: '备注'
};

/** 是否跨班导入：未完整选择学校 + 年级 + 班级时按跨班处理 */
function isCrossClass(scope = {}) {
  return !(scope.school && scope.grade && scope.className);
}

/** 按比赛形式 + 导入范围返回模板字段 */
export function getTemplateFields(matchForm, scope = {}) {
  const cross = isCrossClass(scope);
  if (matchForm === '团体') {
    return cross ? TEAM_FIELDS_CROSS : TEAM_FIELDS_INCLASS;
  }
  return cross ? PERSONAL_FIELDS_CROSS : PERSONAL_FIELDS_INCLASS;
}

/** 必填字段（按班导入时学校/年级/班级来自导入范围，无需填写） */
function getRequiredKeys(matchForm, cross) {
  if (matchForm === '团体') {
    const base = ['memberName', 'classNo', 'teamName'];
    return cross ? ['school', 'grade', 'className', ...base] : base;
  }
  const base = ['studentName', 'classNo', 'gender'];
  return cross ? ['school', 'grade', 'className', ...base] : base;
}

function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, '');
}

function normalizeClassName(value) {
  return normalizeText(value).replace(/班/g, '班');
}

function matchStudent({ school, grade, className, classNo, name }) {
  const candidates = STUDENT_OPTIONS.filter(
    (student) =>
      student.school === String(school || '').trim() &&
      student.grade === String(grade || '').trim() &&
      normalizeClassName(student.className) === normalizeClassName(className) &&
      student.name === String(name || '').trim()
  );
  if (!candidates.length) {
    return null;
  }
  // 同班同名时用班内序号进一步区分
  if (classNo) {
    return candidates.find((student) => String(student.classNo) === String(classNo).trim()) ?? null;
  }
  return candidates.length === 1 ? candidates[0] : null;
}

function getCellText(cell) {
  if (!cell || cell.value == null) {
    return '';
  }
  if (typeof cell.value === 'object' && cell.value.text) {
    return String(cell.value.text).trim();
  }
  return String(cell.value).trim();
}

async function buildWorkbook(headers, sampleRows, sheetName) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  sheet.addRow(headers);
  sampleRows.forEach((row) => sheet.addRow(row));
  sheet.getRow(1).font = { bold: true };
  sheet.columns.forEach((column) => {
    column.width = 16;
  });
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

// 模板示例值（按表头标签取值）
const SAMPLE_VALUES = {
  参赛编号: 'HD00001',
  成员参赛编号: 'HD00001',
  学生姓名: '王小明',
  成员姓名: '王小明',
  学校: '第一实验小学',
  年级: '五年级',
  班级: '3班',
  班内序号: '1',
  队伍名称: '五年级跳绳队',
  性别: '男',
  联系电话: '138****1234',
  备注: '-'
};

function buildSampleRow(fields, overrides = {}) {
  return fields.map((label) => overrides[label] ?? SAMPLE_VALUES[label] ?? '');
}

export async function downloadImportTemplate(matchForm, scope = {}) {
  const fields = getTemplateFields(matchForm, scope);
  if (matchForm === '团体') {
    const sampleRows = [
      buildSampleRow(fields),
      buildSampleRow(fields, {
        参赛编号: 'HD00002',
        成员参赛编号: 'HD00002',
        学生姓名: '李思雨',
        成员姓名: '李思雨',
        班内序号: '2'
      })
    ];
    const buffer = await buildWorkbook(fields, sampleRows, '团体赛名单');
    download(buffer, TEAM_IMPORT_TEMPLATE_NAME, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return TEAM_IMPORT_TEMPLATE_NAME;
  }
  const buffer = await buildWorkbook(fields, [buildSampleRow(fields)], '个人赛名单');
  download(buffer, PERSONAL_IMPORT_TEMPLATE_NAME, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  return PERSONAL_IMPORT_TEMPLATE_NAME;
}

function parseSheetRows(worksheet, headerMap, expectedHeaders) {
  const headerRow = worksheet.getRow(1);
  const headers = [];
  headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    headers[colNumber - 1] = getCellText(cell);
  });
  const trimmedHeaders = headers.map((item) => String(item || '').trim()).filter(Boolean);
  const missing = expectedHeaders.filter((header) => !trimmedHeaders.includes(header));
  if (missing.length) {
    throw new Error(`模板列缺失：${missing.join('、')}`);
  }
  const indexMap = {};
  expectedHeaders.forEach((header) => {
    indexMap[headerMap[header]] = trimmedHeaders.indexOf(header);
  });

  const rows = [];
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) {
      return;
    }
    const record = { rowNo: rowNumber };
    let hasValue = false;
    Object.entries(headerMap).forEach(([header, key]) => {
      const colIndex = indexMap[key];
      const value = colIndex >= 0 ? getCellText(row.getCell(colIndex + 1)) : '';
      record[key] = value;
      if (value) {
        hasValue = true;
      }
    });
    if (hasValue) {
      rows.push(record);
    }
  });
  return rows;
}

function pushError(errors, rowNo, fieldKey, reason, fieldLabelMap) {
  errors.push({
    rowNo,
    fieldName: fieldLabelMap[fieldKey] || fieldKey,
    reason
  });
}

function validatePersonalRows(rows, matchId, itemId, scope = {}) {
  const errors = [];
  const validRows = [];
  const seenKeys = new Set();
  const fileParticipantNumbers = new Map();
  const cross = isCrossClass(scope);
  const requiredKeys = getRequiredKeys('个人', cross);

  rows.forEach((row) => {
    // 按班导入：学校 / 年级 / 班级来自导入范围
    if (!cross) {
      row.school = scope.school;
      row.grade = scope.grade;
      row.className = scope.className;
    }
    const rowErrors = [];
    requiredKeys.forEach((key) => {
      if (!String(row[key] || '').trim()) {
        rowErrors.push(key);
        pushError(errors, row.rowNo, key, '必填字段不能为空', PERSONAL_FIELD_LABEL);
      }
    });

    if (rowErrors.length) {
      return;
    }

    const student = matchStudent({
      school: row.school,
      grade: row.grade,
      className: row.className,
      classNo: row.classNo,
      name: row.studentName
    });
    if (!student) {
      pushError(errors, row.rowNo, 'studentName', '无法匹配学生库，请核对学校、年级、班级、姓名', PERSONAL_FIELD_LABEL);
      return;
    }

    const dupKey = `${row.school}|${row.grade}|${row.className}|${row.studentName}`;
    if (seenKeys.has(dupKey)) {
      pushError(errors, row.rowNo, 'studentName', '导入文件中存在重复学生', PERSONAL_FIELD_LABEL);
      return;
    }
    seenKeys.add(dupKey);

    if (isStudentRegisteredInItem(matchId, itemId, student.studentId)) {
      pushError(errors, row.rowNo, 'studentName', '该学生已在当前比赛设项报名', PERSONAL_FIELD_LABEL);
      return;
    }

    const participantNumber = String(row.participantNumber || '').trim();
    if (participantNumber) {
      const previousStudent = fileParticipantNumbers.get(participantNumber);
      if (previousStudent && previousStudent !== student.studentId) {
        pushError(errors, row.rowNo, 'participantNumber', '导入文件中参赛编号重复', PERSONAL_FIELD_LABEL);
        return;
      }
      fileParticipantNumbers.set(participantNumber, student.studentId);
      const check = validateParticipantNumberInput(matchId, participantNumber, {
        studentId: student.studentId
      });
      if (!check.valid) {
        pushError(errors, row.rowNo, 'participantNumber', check.reason, PERSONAL_FIELD_LABEL);
        return;
      }
    }

    validRows.push({ ...row, student, participantNumber });
  });

  return { errors, validRows };
}

function validateTeamRows(rows, matchId, itemId, scope = {}) {
  const errors = [];
  const validRows = [];
  const teamMeta = new Map();
  const teamMemberKeys = new Map();
  const fileParticipantNumbers = new Map();
  const cross = isCrossClass(scope);
  const requiredKeys = getRequiredKeys('团体', cross);

  // 按班导入：学校 / 年级 / 班级来自导入范围
  if (!cross) {
    rows.forEach((row) => {
      row.school = scope.school;
      row.grade = scope.grade;
      row.className = scope.className;
    });
  }

  rows.forEach((row) => {
    requiredKeys.forEach((key) => {
      if (!String(row[key] || '').trim()) {
        pushError(errors, row.rowNo, key, '必填字段不能为空', TEAM_FIELD_LABEL);
      }
    });
  });

  rows.forEach((row) => {
    const requiredMissing = requiredKeys.some((key) => !String(row[key] || '').trim());
    if (requiredMissing) {
      return;
    }

    const teamKey = String(row.teamName).trim();
    const currentMeta = {
      school: String(row.school).trim(),
      grade: String(row.grade).trim(),
      className: String(row.className).trim()
    };
    if (!teamMeta.has(teamKey)) {
      teamMeta.set(teamKey, currentMeta);
    } else {
      const saved = teamMeta.get(teamKey);
      if (
        saved.school !== currentMeta.school ||
        saved.grade !== currentMeta.grade ||
        normalizeClassName(saved.className) !== normalizeClassName(currentMeta.className)
      ) {
        pushError(
          errors,
          row.rowNo,
          'teamName',
          '同一团队名称下的学校、年级、班级需保持一致',
          TEAM_FIELD_LABEL
        );
        return;
      }
    }

    const student = matchStudent({
      school: row.school,
      grade: row.grade,
      className: row.className,
      classNo: row.classNo,
      name: row.memberName
    });
    if (!student) {
      pushError(errors, row.rowNo, 'memberName', '无法匹配学生库，请核对学校、年级、班级、姓名', TEAM_FIELD_LABEL);
      return;
    }

    const memberKey = `${teamKey}|${student.studentId}`;
    if (!teamMemberKeys.has(teamKey)) {
      teamMemberKeys.set(teamKey, new Set());
    }
    const members = teamMemberKeys.get(teamKey);
    if (members.has(memberKey)) {
      pushError(errors, row.rowNo, 'memberName', '同一团队下成员不可重复', TEAM_FIELD_LABEL);
      return;
    }
    members.add(memberKey);

    if (isStudentRegisteredInItem(matchId, itemId, student.studentId)) {
      pushError(errors, row.rowNo, 'memberName', '该学生已在当前比赛设项报名', TEAM_FIELD_LABEL);
      return;
    }

    const participantNumber = String(row.participantNumber || '').trim();
    if (participantNumber) {
      const previousStudent = fileParticipantNumbers.get(participantNumber);
      if (previousStudent && previousStudent !== student.studentId) {
        pushError(errors, row.rowNo, 'participantNumber', '导入文件中成员参赛编号重复', TEAM_FIELD_LABEL);
        return;
      }
      fileParticipantNumbers.set(participantNumber, student.studentId);
      const check = validateParticipantNumberInput(matchId, participantNumber, {
        studentId: student.studentId
      });
      if (!check.valid) {
        pushError(errors, row.rowNo, 'participantNumber', check.reason, TEAM_FIELD_LABEL);
        return;
      }
    }

    validRows.push({ ...row, student, teamKey, participantNumber });
  });

  if (!rows.length) {
    pushError(errors, 0, 'teamName', '团体报名数据不能为空', TEAM_FIELD_LABEL);
  } else if (!validRows.length && !errors.length) {
    pushError(errors, rows[0].rowNo, 'teamName', '团体成员信息缺失或无效', TEAM_FIELD_LABEL);
  }

  return { errors, validRows };
}

export async function parseImportFile(file, matchForm, scope = {}) {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('Excel 文件中没有可用工作表');
  }
  return parseSheetRows(worksheet, HEADER_MAP, getTemplateFields(matchForm, scope));
}

export function validateImportRows(rows, matchForm, matchId, itemId, scope = {}) {
  const totalCount = rows.length;
  if (!totalCount) {
    return {
      totalCount: 0,
      successCount: 0,
      errorCount: 1,
      errors: [{ rowNo: 0, fieldName: '-', reason: '导入文件中没有有效数据' }],
      validRows: []
    };
  }

  const result =
    matchForm === '团体'
      ? validateTeamRows(rows, matchId, itemId, scope)
      : validatePersonalRows(rows, matchId, itemId, scope);

  const errorCount = result.errors.length;
  const failedRowNos = new Set(result.errors.map((item) => item.rowNo));
  const successCount = totalCount - failedRowNos.size;

  return {
    totalCount,
    successCount: Math.max(successCount, 0),
    errorCount,
    errors: result.errors,
    validRows: result.validRows
  };
}

export function confirmImportRows(validRows, matchForm, matchId, itemId) {
  if (matchForm === '团体') {
    const teamMap = new Map();
    validRows.forEach((row) => {
      if (!teamMap.has(row.teamKey)) {
        teamMap.set(row.teamKey, {
          teamName: row.teamName,
          school: row.school,
          remark: row.remark || '',
          memberParticipantNumbers: {},
          memberIds: []
        });
      }
      const team = teamMap.get(row.teamKey);
      if (row.participantNumber) {
        team.memberParticipantNumbers[row.student.studentId] = row.participantNumber;
      }
      if (!team.memberIds.includes(row.student.studentId)) {
        team.memberIds.push(row.student.studentId);
      }
    });
    teamMap.forEach((team) => {
      addTeamEntry({
        matchId,
        itemId,
        teamName: team.teamName,
        school: team.school,
        memberIds: team.memberIds,
        remark: team.remark,
        memberParticipantNumbers: team.memberParticipantNumbers
      });
    });
    return teamMap.size;
  }

  validRows.forEach((row) => {
    addPersonalEntry({
      matchId,
      itemId,
      studentId: row.student.studentId,
      phone: row.phone || '',
      remark: row.remark || '',
      participantNumber: row.participantNumber || undefined
    });
  });
  return validRows.length;
}

export function appendImportLog(payload) {
  registrationStore.importLogs.unshift({
    logId: `log_${Date.now()}`,
    importTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
    operator: '赛事专员',
    itemName: payload.itemName || '',
    importType: payload.importType || '',
    totalCount: payload.totalCount || 0,
    successCount: payload.successCount || 0,
    errorCount: payload.errorCount || 0,
    status: payload.errorCount ? '部分成功' : '成功'
  });
}

export function getItemMatchForm(matchId, itemId) {
  const item = getItemOptionsByMatch(matchId).find((row) => String(row.itemId) === String(itemId));
  return item?.matchForm || '';
}
