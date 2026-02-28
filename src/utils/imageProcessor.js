/**
 * 이미지 리사이즈 및 픽셀 데이터 처리 유틸리티
 */

/**
 * 이미지 파일을 로드하여 HTMLImageElement로 반환
 */
export function loadImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

/**
 * 이미지를 지정 영역으로 크롭
 * @param {HTMLImageElement} img - 원본 이미지
 * @param {Object} cropRect - 크롭 영역 (원본 이미지 비율 0~1)
 * @param {number} cropRect.top - 위에서 자를 비율
 * @param {number} cropRect.bottom - 아래에서 자를 비율
 * @param {number} cropRect.left - 왼쪽에서 자를 비율
 * @param {number} cropRect.right - 오른쪽에서 자를 비율
 * @returns {HTMLCanvasElement} - 크롭된 이미지 캔버스
 */
export function cropImage(img, cropRect) {
    const { top, bottom, left, right } = cropRect;
    const sx = Math.round(img.width * left);
    const sy = Math.round(img.height * top);
    const sw = Math.round(img.width * (1 - left - right));
    const sh = Math.round(img.height * (1 - top - bottom));

    const canvas = document.createElement('canvas');
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    return canvas;
}

/**
 * 이미지를 지정된 크기로 리사이즈 (Nearest Neighbor 보간법)
 */
export function resizeImage(img, targetWidth, targetHeight) {
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    return ctx.getImageData(0, 0, targetWidth, targetHeight);
}

/**
 * 원본 이미지 비율을 기반으로 세로 코 수를 계산
 */
export function calculateHeight(img, targetWidth) {
    const aspectRatio = img.height / img.width;
    return Math.round(targetWidth * aspectRatio);
}

/**
 * 양자화된 데이터를 2D 팔레트 인덱스 그리드로 변환
 */
export function createPixelGrid(quantizedData, width, height, palette) {
    const grid = [];
    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = quantizedData[idx];
            const g = quantizedData[idx + 1];
            const b = quantizedData[idx + 2];
            let paletteIdx = 0;
            for (let p = 0; p < palette.length; p++) {
                if (palette[p].color[0] === r &&
                    palette[p].color[1] === g &&
                    palette[p].color[2] === b) {
                    paletteIdx = p;
                    break;
                }
            }
            row.push(paletteIdx);
        }
        grid.push(row);
    }
    return grid;
}

/**
 * 도안 미리보기를 캔버스에 그리기
 * - 그리드 선 + 5코/5단 가이드라인(두꺼운 선) + 메모리 번호(홀수, 오른쪽 아래 기준)
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number[][]} pixelGrid
 * @param {Array<{color: number[]}>} palette
 * @param {number} gridWidth
 * @param {number} gridHeight
 * @param {number} cellSize
 * @param {string} [guidelineColor='#FF0000'] - 가이드라인 색상 (HEX)
 */
export function drawPreview(ctx, pixelGrid, palette, gridWidth, gridHeight, cellSize, guidelineColor = '#FF0000') {
    // 12px 고정 폰트로 최대 숫자의 텍스트 폭 측정
    const labelFontSize = 12;
    ctx.font = `${labelFontSize}px sans-serif`;

    // 오른쪽 여백: 최대 단 번호 텍스트 폭 + 여유
    const maxRowNum = gridHeight;
    const rightMargin = ctx.measureText(String(maxRowNum)).width + 8;

    // 하단 여백: 폰트 높이 + 여유
    const bottomMargin = labelFontSize + 6;

    const gridPixelW = gridWidth * cellSize;
    const gridPixelH = gridHeight * cellSize;
    const canvasWidth = gridPixelW + rightMargin;
    const canvasHeight = gridPixelH + bottomMargin;

    ctx.canvas.width = canvasWidth;
    ctx.canvas.height = canvasHeight;

    // 배경을 흰색으로 채우기 (번호 영역)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 1. 각 셀 색상 채우기
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const colorIdx = pixelGrid[y][x];
            const [r, g, b] = palette[colorIdx].color;
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }

    // 2. 기본 그리드 선 (얇은 선)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 0.5;

    for (let x = 0; x <= gridWidth; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cellSize, 0);
        ctx.lineTo(x * cellSize, gridPixelH);
        ctx.stroke();
    }
    for (let y = 0; y <= gridHeight; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cellSize);
        ctx.lineTo(gridPixelW, y * cellSize);
        ctx.stroke();
    }

    // 3. 가이드라인 (5코/5단마다 두꺼운 선)
    ctx.strokeStyle = guidelineColor;
    ctx.lineWidth = Math.max(1.5, cellSize * 0.15);

    // 코 가이드라인 (세로선) — 오른쪽에서 카운트
    for (let x = 0; x <= gridWidth; x++) {
        const fromRight = gridWidth - x;
        if (fromRight > 0 && fromRight % 5 === 0) {
            ctx.beginPath();
            ctx.moveTo(x * cellSize, 0);
            ctx.lineTo(x * cellSize, gridPixelH);
            ctx.stroke();
        }
    }

    // 단 가이드라인 (가로선) — 아래에서 카운트
    for (let y = 0; y <= gridHeight; y++) {
        const fromBottom = gridHeight - y;
        if (fromBottom > 0 && fromBottom % 5 === 0) {
            ctx.beginPath();
            ctx.moveTo(0, y * cellSize);
            ctx.lineTo(gridPixelW, y * cellSize);
            ctx.stroke();
        }
    }

    // 4. 메모리 번호 — 그리드 바깥 (하단: 코 번호, 오른쪽: 단 번호)
    ctx.font = `${labelFontSize}px sans-serif`;
    ctx.fillStyle = '#333333';

    // 셀 크기에 따라 번호 표시 간격 결정 (글자 겹침 방지)
    // 12px 글자 2자리 ≈ 16px 필요 → 간격 * cellSize >= 16 이상이어야 함
    let labelInterval;
    if (cellSize * 2 >= 18) {
        labelInterval = 2; // 홀수 (1, 3, 5, ...)
    } else if (cellSize * 5 >= 18) {
        labelInterval = 5; // 5의 배수
    } else {
        labelInterval = 10; // 10의 배수
    }

    // 하단: 코 번호 (오른쪽에서 1부터)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let x = 0; x < gridWidth; x++) {
        const stitchNum = gridWidth - x;
        const show = labelInterval === 2
            ? (stitchNum % 2 === 1)
            : (stitchNum % labelInterval === 0);
        if (show) {
            ctx.fillText(stitchNum, x * cellSize + cellSize / 2, gridPixelH + 3);
        }
    }

    // 오른쪽: 단 번호 (아래에서 1부터)
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    for (let y = 0; y < gridHeight; y++) {
        const rowNum = gridHeight - y;
        const show = labelInterval === 2
            ? (rowNum % 2 === 1)
            : (rowNum % labelInterval === 0);
        if (show) {
            ctx.fillText(rowNum, gridPixelW + 3, y * cellSize + cellSize / 2);
        }
    }
}
