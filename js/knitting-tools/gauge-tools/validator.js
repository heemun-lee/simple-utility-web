/**
 * Gauge Validation and Conversion
 * @module validator
 */

/**
 * 게이지 측정 기준 단위
 * @constant
 */
export const GAUGE_UNITS = {
  CM: '10cm',
  INCH: '4inch',
};

/**
 * 단위 변환 상수
 * @constant
 */
const INCH_TO_CM = 2.54;
const GAUGE_SIZE_CM = 10;
const GAUGE_SIZE_INCH = 4;

/**
 * cm를 inch로 변환
 * @param {number} value - cm 값
 * @returns {number} inch 값
 */
export const convertCmToInch = (value) => {
  return value / INCH_TO_CM;
};

/**
 * inch를 cm로 변환
 * @param {number} value - inch 값
 * @returns {number} cm 값
 */
export const convertInchToCm = (value) => {
  return value * INCH_TO_CM;
};

/**
 * 4 inch 기준 값을 10cm 기준으로 변환
 * @param {number} value - 4 inch 기준 값
 * @returns {number} 10cm 기준 값
 */
export const convert4InchTo10Cm = (value) => {
  return value * (GAUGE_SIZE_CM / (GAUGE_SIZE_INCH * INCH_TO_CM));
};

/**
 * 10cm 기준 값을 4 inch 기준으로 변환
 * @param {number} value - 10cm 기준 값
 * @returns {number} 4 inch 기준 값
 */
export const convert10CmTo4Inch = (value) => {
  return value * ((GAUGE_SIZE_INCH * INCH_TO_CM) / GAUGE_SIZE_CM);
};

/**
 * 게이지 값 검증
 * @param {number} value - 검증할 값
 * @returns {{valid: boolean, error?: string}} 검증 결과
 */
export const validateGauge = (value) => {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: '값을 입력해주세요' };
  }

  const num = Number(value);

  if (isNaN(num)) {
    return { valid: false, error: '숫자만 입력 가능합니다' };
  }

  if (num <= 0) {
    return { valid: false, error: '0보다 큰 값을 입력해주세요' };
  }

  if (num > 1000) {
    return { valid: false, error: '1000 이하의 값을 입력해주세요' };
  }

  return { valid: true };
};

/**
 * 변환 입력 값 검증
 * @param {number} value - 검증할 값
 * @returns {{valid: boolean, error?: string}} 검증 결과
 */
export const validateConversionInput = (value) => {
  if (value === null || value === undefined || value === '') {
    return { valid: true }; // 선택적 입력
  }

  const num = Number(value);

  if (isNaN(num)) {
    return { valid: false, error: '숫자만 입력 가능합니다' };
  }

  if (num < 0) {
    return { valid: false, error: '0 이상의 값을 입력해주세요' };
  }

  if (num > 10000) {
    return { valid: false, error: '10000 이하의 값을 입력해주세요' };
  }

  return { valid: true };
};

/**
 * 게이지 변환 계산
 * @param {number} input - 변환할 값
 * @param {number} base - 기준 게이지
 * @param {number} actual - 실제 게이지
 * @returns {number} 변환된 값
 * @throws {Error} 기준 게이지가 0인 경우
 */
export const convertGauge = (input, base, actual) => {
  if (base === 0) {
    throw new Error('기준 게이지는 0이 될 수 없습니다');
  }

  const result = input * (actual / base);
  return Math.round(result);
};

/**
 * 단위를 고려한 게이지 변환 계산
 * @param {number} input - 변환할 값
 * @param {number} base - 기준 게이지
 * @param {number} actual - 실제 게이지
 * @param {string} unit - 측정 단위 ('10cm' 또는 '4inch')
 * @returns {number} 변환된 값
 * @throws {Error} 기준 게이지가 0인 경우
 */
export const convertGaugeWithUnit = (input, base, actual, unit) => {
  if (base === 0) {
    throw new Error('기준 게이지는 0이 될 수 없습니다');
  }

  // 4 inch 선택 시: 입력값을 10cm 기준으로 변환 → 계산 → 다시 4 inch로 변환
  if (unit === GAUGE_UNITS.INCH) {
    const inputIn10Cm = convert4InchTo10Cm(input);
    const baseIn10Cm = convert4InchTo10Cm(base);
    const actualIn10Cm = convert4InchTo10Cm(actual);

    const resultIn10Cm = inputIn10Cm * (actualIn10Cm / baseIn10Cm);
    const resultIn4Inch = convert10CmTo4Inch(resultIn10Cm);

    return Math.round(resultIn4Inch);
  }

  // 10cm 선택 시: 기존 로직 사용
  const result = input * (actual / base);
  return Math.round(result);
};

/**
 * 전체 입력 검증
 * @param {Object} inputs - 입력 값 객체
 * @returns {{valid: boolean, errors: string[]}} 검증 결과
 */
export const validateAllInputs = (inputs) => {
  const errors = [];

  // 기준 게이지 검증
  const baseStitchesValidation = validateGauge(inputs.baseStitches);
  if (!baseStitchesValidation.valid) {
    errors.push(`기준 코수: ${baseStitchesValidation.error}`);
  }

  const baseRowsValidation = validateGauge(inputs.baseRows);
  if (!baseRowsValidation.valid) {
    errors.push(`기준 단수: ${baseRowsValidation.error}`);
  }

  // 실제 게이지 검증
  const actualStitchesValidation = validateGauge(inputs.actualStitches);
  if (!actualStitchesValidation.valid) {
    errors.push(`실제 코수: ${actualStitchesValidation.error}`);
  }

  const actualRowsValidation = validateGauge(inputs.actualRows);
  if (!actualRowsValidation.valid) {
    errors.push(`실제 단수: ${actualRowsValidation.error}`);
  }

  // 변환 입력 검증
  const inputStitchesValidation = validateConversionInput(inputs.inputStitches);
  if (!inputStitchesValidation.valid) {
    errors.push(`변환할 코수: ${inputStitchesValidation.error}`);
  }

  const inputRowsValidation = validateConversionInput(inputs.inputRows);
  if (!inputRowsValidation.valid) {
    errors.push(`변환할 단수: ${inputRowsValidation.error}`);
  }

  // 변환 입력 중 최소 하나는 있어야 함
  if (!inputs.inputStitches && !inputs.inputRows) {
    errors.push('변환할 코수 또는 단수 중 하나는 입력해야 합니다');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
