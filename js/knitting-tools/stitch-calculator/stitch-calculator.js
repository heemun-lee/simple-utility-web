/**
 * Stitch Calculator
 * 뜨개질 코수 증감 계산기
 *
 * @module stitch-calculator
 * @description 코수 증감을 균등하게 분배하여 각 단의 코수를 계산합니다.
 */

/* ============================================================================
   Constants
   ========================================================================== */

const INPUT_CONSTRAINTS = {
  MIN_VALUE: 1,
  MAX_VALUE: 10000,
  VALIDATION_DEBOUNCE_MS: 500,
  SAVE_DEBOUNCE_MS: 300,
};

const ERROR_TYPE = {
  REQUIRED: 'required',
  NOT_A_NUMBER: 'not_a_number',
  OUT_OF_RANGE: 'out_of_range',
  NOT_INTEGER: 'not_integer',
};

const FIELD_NAMES = {
  'start-stitches': '시작 코수',
  'target-stitches': '목표 코수',
  'total-rows': '총 단수',
};

const ERROR_MESSAGES = {
  [ERROR_TYPE.REQUIRED]: (fieldName) => `${fieldName}을(를) 입력해주세요.`,
  [ERROR_TYPE.NOT_A_NUMBER]: (fieldName) => `${fieldName}은(는) 숫자여야 합니다.`,
  [ERROR_TYPE.OUT_OF_RANGE]: (fieldName) => `${fieldName}은(는) 1 이상 10000 이하여야 합니다.`,
  [ERROR_TYPE.NOT_INTEGER]: (fieldName) => `${fieldName}은(는) 정수로 입력해주세요.`,
};

const STORAGE_KEYS = {
  CALCULATOR_INPUTS: 'stitchCalculatorInputs',
};

/* ============================================================================
   State
   ========================================================================== */

let debounceTimers = {};

/* ============================================================================
   Validation Functions (T011)
   ========================================================================== */

/**
 * 단일 필드 검증
 *
 * @param {string} field - 필드 ID
 * @param {string} value - 검증할 값
 * @returns {Object|null} 검증 오류 객체 또는 null
 */
function validateField(field, value) {
  const fieldName = FIELD_NAMES[field];

  // Required check
  if (!value || value.trim() === '') {
    return {
      field,
      errorType: ERROR_TYPE.REQUIRED,
      message: ERROR_MESSAGES[ERROR_TYPE.REQUIRED](fieldName),
    };
  }

  // Number check
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return {
      field,
      errorType: ERROR_TYPE.NOT_A_NUMBER,
      message: ERROR_MESSAGES[ERROR_TYPE.NOT_A_NUMBER](fieldName),
    };
  }

  // Integer check
  if (!Number.isInteger(numValue)) {
    return {
      field,
      errorType: ERROR_TYPE.NOT_INTEGER,
      message: ERROR_MESSAGES[ERROR_TYPE.NOT_INTEGER](fieldName),
    };
  }

  // Range check
  if (numValue < INPUT_CONSTRAINTS.MIN_VALUE || numValue > INPUT_CONSTRAINTS.MAX_VALUE) {
    return {
      field,
      errorType: ERROR_TYPE.OUT_OF_RANGE,
      message: ERROR_MESSAGES[ERROR_TYPE.OUT_OF_RANGE](fieldName),
    };
  }

  return null;
}

/**
 * 전체 입력 검증
 *
 * @param {Object} input - 검증할 입력 객체 (문자열 값)
 * @returns {Array} 검증 오류 배열
 */
function validateInput(input) {
  const errors = [];

  const startError = validateField('start-stitches', input.startStitches || '');
  if (startError) errors.push(startError);

  const targetError = validateField('target-stitches', input.targetStitches || '');
  if (targetError) errors.push(targetError);

  const rowsError = validateField('total-rows', input.totalRows || '');
  if (rowsError) errors.push(rowsError);

  return errors;
}

/* ============================================================================
   Calculation Algorithm (T012)
   ========================================================================== */

/**
 * 코수 분배 계산 알고리즘
 * 두 가지 분배 방식을 지원합니다:
 * 1. 균등 간격 (even): 모든 변화 간격이 동일 (기본값, 뜨개질 패턴 외우기 쉬움)
 * 2. 최적 분배 (optimal): 수학적으로 최적화된 분배 (마지막 단까지 정확하게 도달)
 *
 * @param {Object} input - 계산 입력
 * @param {number} input.startStitches - 시작 코수
 * @param {number} input.targetStitches - 목표 코수
 * @param {number} input.totalRows - 총 단수
 * @param {string} [input.distributionMode='even'] - 분배 방식 ('even' 또는 'optimal')
 * @returns {Object} 계산 결과
 */
function calculateStitchDistribution(input) {
  const startTime = performance.now();

  const { startStitches, targetStitches, totalRows, distributionMode = 'even' } = input;

  // Calculate total change
  const totalChange = targetStitches - startStitches;
  const changeType = totalChange > 0 ? 'increase' : totalChange < 0 ? 'decrease' : 'none';

  // If no change needed
  if (totalChange === 0) {
    const rows = Array.from({ length: totalRows }, (_, i) => ({
      rowNumber: i + 1,
      stitches: startStitches,
      isChanged: false,
      changeAmount: 0,
    }));

    return {
      input,
      rows,
      totalChange: 0,
      changeType: 'none',
      changedRowsCount: 0,
      distributionMode,
      calculationTime: performance.now() - startTime,
    };
  }

  const absChange = Math.abs(totalChange);
  const sign = totalChange > 0 ? 1 : -1;

  // Generate results for each row
  const rows = [];
  let currentStitches = startStitches;
  let changedRowsCount = 0;

  if (distributionMode === 'even') {
    // 균등 간격 방식: 모든 간격이 동일
    // 한 단당 기본 변화량 계산
    const baseChangePerRow = Math.floor(absChange / totalRows);

    if (baseChangePerRow === 0) {
      // 케이스 1: 총 변화량 <= 총 단수 (한 단에 최대 1코 변화)
      // 최대 간격 계산: k = floor((총단수 - 1) / (변화횟수 - 1))
      // 필요 단수 = 1 + (변화횟수 - 1) × 간격
      // 예: 40단에 14코 변화 → 간격 3 → 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, 37, 40
      // 예: 45단에 14코 변화 → 간격 3 → 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42
      const maxInterval = Math.floor((totalRows - 1) / (absChange - 1));
      const changeRows = new Set();

      // 필요한 최소 단수 계산
      const requiredRows = 1 + (absChange - 1) * maxInterval;

      // 여유 공간 = 총 단수 - 필요 단수
      // 앞뒤로 균등하게 분배
      const remainingRows = totalRows - requiredRows;
      const startOffset = Math.floor(remainingRows / 2);

      // 첫 변화 위치
      let position = startOffset + 1;

      for (let i = 0; i < absChange; i++) {
        changeRows.add(position);
        position += maxInterval;
      }

      for (let rowNumber = 1; rowNumber <= totalRows; rowNumber++) {
        const hasChange = changeRows.has(rowNumber);
        const changeAmount = hasChange ? sign : 0;

        currentStitches += changeAmount;

        if (hasChange) {
          changedRowsCount++;
        }

        rows.push({
          rowNumber,
          stitches: currentStitches,
          isChanged: hasChange,
          changeAmount,
        });
      }
    } else {
      // 케이스 2: 총 변화량 > 총 단수 (한 단에 여러 코 변화)
      // 모든 단에 기본 변화 + 일부 단에 추가 변화
      // 예: 7단에 14코 변화 → 모든 단 2코 (14/7=2, 나머지 0)
      // 예: 5단에 12코 변화 → 3단은 3코, 2단은 2코 (12/5=2, 나머지 2)
      const extraChanges = absChange % totalRows;
      const extraChangeRows = new Set();

      if (extraChanges > 0) {
        // 추가 변화를 균등 간격으로 배치
        const extraInterval = Math.floor(totalRows / extraChanges);
        let position = extraInterval;

        for (let i = 0; i < extraChanges; i++) {
          extraChangeRows.add(Math.min(position, totalRows));
          position += extraInterval;
        }
      }

      for (let rowNumber = 1; rowNumber <= totalRows; rowNumber++) {
        const hasExtraChange = extraChangeRows.has(rowNumber);
        const changeAmount = sign * (baseChangePerRow + (hasExtraChange ? 1 : 0));

        currentStitches += changeAmount;
        changedRowsCount++;

        rows.push({
          rowNumber,
          stitches: currentStitches,
          isChanged: true,
          changeAmount,
        });
      }
    }
  } else {
    // 최적 분배 방식: 수학적으로 균등하게 분배하여 마지막 단까지 정확하게 도달
    // 각 변화를 이상적 위치에 배치 (항상 1코씩만 변화)
    // 예: 45단에 14코 변화 → 3, 6, 10, 13, 16, 19, 23, 26, 29, 32, 35, 39, 42, 45
    const changeRows = new Set();

    for (let i = 1; i <= absChange; i++) {
      const idealRow = (i * totalRows) / absChange;
      const actualRow = Math.round(idealRow);
      changeRows.add(actualRow);
    }

    for (let rowNumber = 1; rowNumber <= totalRows; rowNumber++) {
      const hasChange = changeRows.has(rowNumber);
      const changeAmount = hasChange ? sign : 0;

      currentStitches += changeAmount;

      if (hasChange) {
        changedRowsCount++;
      }

      rows.push({
        rowNumber,
        stitches: currentStitches,
        isChanged: hasChange,
        changeAmount,
      });
    }
  }

  const calculationTime = performance.now() - startTime;

  return {
    input,
    rows,
    totalChange,
    changeType,
    changedRowsCount,
    distributionMode,
    calculationTime,
  };
}

/* ============================================================================
   UI Rendering Functions (T013)
   ========================================================================== */

/**
 * 계산 결과를 테이블로 렌더링
 *
 * @param {Object} result - 계산 결과
 * @param {HTMLElement} containerElement - 컨테이너 엘리먼트
 */
function renderResults(result, containerElement) {
  if (!containerElement) return;

  // Update summary
  document.getElementById('summary-start').textContent = formatNumber(result.input.startStitches);
  document.getElementById('summary-target').textContent = formatNumber(result.input.targetStitches);
  document.getElementById('summary-rows').textContent = formatNumber(result.input.totalRows);
  document.getElementById('summary-changed').textContent = formatNumber(result.changedRowsCount);

  // Create table
  const tableWrapper = containerElement.querySelector('.table-wrapper');
  if (!tableWrapper) return;

  // Use DocumentFragment for performance
  const fragment = document.createDocumentFragment();

  const table = document.createElement('table');
  table.className = 'results-table';
  table.setAttribute('role', 'table');

  // Caption
  const caption = document.createElement('caption');
  caption.textContent = `코수 변화 계산 결과 (총 ${result.rows.length}단)`;
  table.appendChild(caption);

  // Table head
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th scope="col">단</th>
      <th scope="col">코수</th>
      <th scope="col">변화량</th>
    </tr>
  `;
  table.appendChild(thead);

  // Table body
  const tbody = document.createElement('tbody');

  result.rows.forEach((row) => {
    const tr = document.createElement('tr');

    if (row.isChanged) {
      tr.classList.add('changed');
    }

    // Row number
    const tdRow = document.createElement('td');
    tdRow.textContent = row.rowNumber;
    tr.appendChild(tdRow);

    // Stitches count
    const tdStitches = document.createElement('td');
    tdStitches.textContent = formatNumber(row.stitches);
    tr.appendChild(tdStitches);

    // Change amount
    const tdChange = document.createElement('td');
    tdChange.className = 'change-amount';

    if (row.changeAmount > 0) {
      tdChange.classList.add('increase');
      tdChange.textContent = `+${row.changeAmount}`;
    } else if (row.changeAmount < 0) {
      tdChange.classList.add('decrease');
      tdChange.textContent = row.changeAmount;
    } else {
      tdChange.classList.add('no-change');
      tdChange.textContent = '-';
    }

    tr.appendChild(tdChange);
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  fragment.appendChild(table);

  // Clear and append
  tableWrapper.innerHTML = '';
  tableWrapper.appendChild(fragment);

  // Show results section
  containerElement.style.display = 'block';
}

/**
 * 오류 메시지 표시
 *
 * @param {Array} errors - 오류 배열
 * @param {HTMLFormElement} formElement - 폼 엘리먼트
 */
function displayErrors(errors, formElement) {
  if (!formElement) return;

  // Clear previous errors first
  clearErrors(formElement);

  if (errors.length === 0) return;

  // Display field-specific errors
  errors.forEach((error) => {
    const errorSpan = formElement.querySelector(`[data-field="${error.field}"]`);
    if (errorSpan) {
      errorSpan.textContent = error.message;
      errorSpan.style.display = 'block';
      errorSpan.setAttribute('role', 'alert');
    }
  });

  // Display general error in error container
  const errorContainer = document.getElementById('error-container');
  if (errorContainer) {
    const errorList = errors.map(e => e.message).join(' ');
    errorContainer.textContent = errorList;
    errorContainer.style.display = 'block';
  }
}

/**
 * 오류 메시지 제거
 *
 * @param {HTMLFormElement} formElement - 폼 엘리먼트
 */
function clearErrors(formElement) {
  if (!formElement) return;

  // Clear field-specific errors
  const errorSpans = formElement.querySelectorAll('.error-message');
  errorSpans.forEach((span) => {
    span.textContent = '';
    span.style.display = 'none';
  });

  // Clear general error
  const errorContainer = document.getElementById('error-container');
  if (errorContainer) {
    errorContainer.textContent = '';
    errorContainer.style.display = 'none';
  }
}

/* ============================================================================
   Event Handlers (T014)
   ========================================================================== */

/**
 * 폼 제출 이벤트 핸들러
 *
 * @param {Event} event - 이벤트 객체
 */
function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.target;

  // Get raw input values (keep as strings for validation)
  const startValue = document.getElementById('start-stitches').value;
  const targetValue = document.getElementById('target-stitches').value;
  const rowsValue = document.getElementById('total-rows').value;

  // Create input object for validation
  const input = {
    startStitches: startValue,
    targetStitches: targetValue,
    totalRows: rowsValue,
  };

  // Validate input
  const errors = validateInput(input);

  if (errors.length > 0) {
    displayErrors(errors, form);
    return;
  }

  // Clear errors
  clearErrors(form);

  // Convert to numbers after validation
  const validInput = {
    startStitches: Number(startValue),
    targetStitches: Number(targetValue),
    totalRows: Number(rowsValue),
  };

  // Calculate
  const result = calculateStitchDistribution(validInput);

  // Render results
  const resultsContainer = document.getElementById('results-container');
  renderResults(result, resultsContainer);

  // Save to localStorage (optional)
  saveInput(validInput);

  // Scroll to results
  resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * 입력 변경 이벤트 핸들러 (디바운싱)
 *
 * @param {Event} event - 이벤트 객체
 */
function handleInputChange(event) {
  const field = event.target.id;
  const value = event.target.value;

  // Clear previous timer
  if (debounceTimers[field]) {
    clearTimeout(debounceTimers[field]);
  }

  // Debounce validation
  debounceTimers[field] = setTimeout(() => {
    const error = validateField(field, value);
    const form = event.target.closest('form');

    if (error) {
      displayErrors([error], form);
    } else {
      // Clear only this field's error
      const errorSpan = form.querySelector(`[data-field="${field}"]`);
      if (errorSpan) {
        errorSpan.textContent = '';
        errorSpan.style.display = 'none';
      }
    }
  }, INPUT_CONSTRAINTS.VALIDATION_DEBOUNCE_MS);
}

/**
 * 초기화 버튼 클릭 이벤트 핸들러
 *
 * @param {Event} event - 이벤트 객체
 */
function handleReset(event) {
  const form = event.target.closest('form');

  // Clear errors
  clearErrors(form);

  // Hide results
  const resultsContainer = document.getElementById('results-container');
  if (resultsContainer) {
    resultsContainer.style.display = 'none';
  }

  // Clear all debounce timers
  Object.keys(debounceTimers).forEach((key) => {
    clearTimeout(debounceTimers[key]);
  });
  debounceTimers = {};
}

/* ============================================================================
   Utility Functions (T015)
   ========================================================================== */

/**
 * 디바운스 유틸리티
 *
 * @param {Function} func - 실행할 함수
 * @param {number} delay - 지연 시간 (밀리초)
 * @returns {Function} 디바운스된 함수
 */
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * 숫자 포맷팅 (천 단위 구분)
 *
 * @param {number} num - 포맷팅할 숫자
 * @returns {string} 포맷팅된 문자열
 */
function formatNumber(num) {
  return num.toLocaleString('ko-KR');
}

/* ============================================================================
   LocalStorage Functions (Optional)
   ========================================================================== */

/**
 * localStorage에 입력값 저장
 *
 * @param {Object} input - 저장할 입력값
 * @returns {boolean} 저장 성공 여부
 */
function saveInput(input) {
  try {
    const data = {
      ...input,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.CALCULATOR_INPUTS, JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn('Failed to save input to localStorage:', error);
    return false;
  }
}

/**
 * localStorage에서 입력값 복원
 *
 * @returns {Object|null} 복원된 입력값
 */
function restoreInput() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CALCULATOR_INPUTS);
    if (!saved) return null;

    const data = JSON.parse(saved);

    // Return only input fields
    return {
      startStitches: data.startStitches,
      targetStitches: data.targetStitches,
      totalRows: data.totalRows,
    };
  } catch (error) {
    console.warn('Failed to restore input from localStorage:', error);
    return null;
  }
}

/* ============================================================================
   Initialization (T014)
   ========================================================================== */

/**
 * 계산기 초기화
 */
function initCalculator() {
  const form = document.getElementById('calculator-form');
  const calculateButton = document.getElementById('calculate-button');
  const resetButton = document.getElementById('reset-button');

  if (!form) {
    console.error('Calculator form not found');
    return;
  }

  // Attach event listeners
  form.addEventListener('submit', handleFormSubmit);
  resetButton?.addEventListener('click', handleReset);

  // Input change listeners with debouncing
  const inputs = form.querySelectorAll('input[type="number"]');
  inputs.forEach((input) => {
    input.addEventListener('input', handleInputChange);
  });

  // Restore previous input (optional)
  const savedInput = restoreInput();
  if (savedInput) {
    document.getElementById('start-stitches').value = savedInput.startStitches || '';
    document.getElementById('target-stitches').value = savedInput.targetStitches || '';
    document.getElementById('total-rows').value = savedInput.totalRows || '';
  }

  console.log('Stitch Calculator initialized');
}

/* ============================================================================
   Exports
   ========================================================================== */

export {
  initCalculator,
  calculateStitchDistribution,
  validateField,
  validateInput,
  renderResults,
  displayErrors,
  clearErrors,
  handleFormSubmit,
  handleInputChange,
  handleReset,
  debounce,
  formatNumber,
  saveInput,
  restoreInput,
};
