/**
 * 基于 china-area-data 生成省/市两级联动数据，供 el-cascader 使用。
 * value 使用行政区划代码，label 使用中文名称。
 */
import areaData from 'china-area-data';

/** 省级列表（不含港澳台直辖市合并处理） */
const provinceMap = areaData['86'];

/**
 * 省市两级 cascader options
 * [{ value: '440000', label: '广东省', children: [{ value: '440100', label: '广州市' }, ...] }]
 */
export const regionCascaderOptions = Object.entries(provinceMap).map(
  ([provinceCode, provinceName]) => {
    const cityMap = areaData[provinceCode] ?? {};
    const children = Object.entries(cityMap)
      .filter(([code]) => code !== provinceCode) // 排除"省直辖"占位项
      .map(([cityCode, cityName]) => ({
        value: cityCode,
        label: cityName
      }));
    return {
      value: provinceCode,
      label: provinceName,
      children: children.length ? children : undefined
    };
  }
);

/**
 * 根据城市 code 反查完整路径 label，例如 "440300" → "广东省 / 深圳市"
 * @param {string} cityCode  - 市级 code（6位）
 */
export function getRegionPathLabel(cityCode) {
  if (!cityCode) return '';
  for (const [provinceCode, provinceName] of Object.entries(provinceMap)) {
    const cityMap = areaData[provinceCode] ?? {};
    if (cityMap[cityCode]) {
      return `${provinceName} / ${cityMap[cityCode]}`;
    }
  }
  return cityCode;
}

/**
 * 根据城市 code 数组，返回短标签数组（只显示市名）
 * @param {string[]} codes
 */
export function getRegionLabels(codes = []) {
  return codes.map((code) => {
    for (const provinceCode of Object.keys(provinceMap)) {
      const cityMap = areaData[provinceCode] ?? {};
      if (cityMap[code]) return cityMap[code];
    }
    // 省级 code
    if (provinceMap[code]) return provinceMap[code];
    return code;
  });
}

/**
 * 将 cascader 选中的 [provinceCode, cityCode] 路径数组转为城市 code 字符串
 * （单选模式下返回末级 code）
 * @param {string[]} path
 */
export function pathToCode(path = []) {
  return path[path.length - 1] ?? '';
}

/**
 * 将城市 code 转为 cascader 回显路径 [provinceCode, cityCode]
 * @param {string} cityCode
 */
export function codeToPath(cityCode) {
  if (!cityCode) return [];
  // 如果本身就是省级 code
  if (provinceMap[cityCode]) return [cityCode];
  for (const provinceCode of Object.keys(provinceMap)) {
    const cityMap = areaData[provinceCode] ?? {};
    if (cityMap[cityCode]) return [provinceCode, cityCode];
  }
  return [cityCode];
}
