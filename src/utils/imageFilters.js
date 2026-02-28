/**
 * 이미지 필터 유틸리티
 * 리사이즈된 ImageData에 적용하는 색상 변환 함수들
 */

/**
 * 필터 목록 정의
 */
export const FILTERS = [
    { id: 'none', name: '없음', description: '원본 그대로' },
    { id: 'grayscale', name: '그레이스케일', description: '흑백 톤' },
    { id: 'pastel', name: '파스텔', description: '부드럽고 연한 색감' },
    { id: 'sepia', name: '세피아', description: '따뜻한 갈색 톤' },
    { id: 'highContrast', name: '고대비', description: '색상 대비 강화' },
    { id: 'warm', name: '따뜻한 톤', description: '붉은/노란 색감 강조' },
    { id: 'cool', name: '차가운 톤', description: '파란/초록 색감 강조' },
    { id: 'invert', name: '반전', description: '색상 반전' },
];

/**
 * ImageData에 필터를 적용하여 새 ImageData 반환
 * @param {ImageData} imageData - 원본 이미지 데이터
 * @param {string} filterId - 적용할 필터 ID
 * @returns {ImageData} - 필터 적용된 이미지 데이터
 */
export function applyFilter(imageData, filterId) {
    if (filterId === 'none') return imageData;

    // 원본을 복사하여 수정
    const data = new Uint8ClampedArray(imageData.data);

    const filterFn = filterMap[filterId];
    if (!filterFn) return imageData;

    for (let i = 0; i < data.length; i += 4) {
        const [r, g, b] = filterFn(data[i], data[i + 1], data[i + 2]);
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
        // alpha는 유지
    }

    return new ImageData(data, imageData.width, imageData.height);
}

// ── 개별 필터 함수 (r, g, b) → [r, g, b] ──

function grayscale(r, g, b) {
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    return [gray, gray, gray];
}

function pastel(r, g, b) {
    // 흰색 방향으로 섞어서 부드럽게 + 채도 약간 낮추기
    const mix = 0.55; // 흰색 비율
    const pr = Math.round(r * (1 - mix) + 255 * mix);
    const pg = Math.round(g * (1 - mix) + 255 * mix);
    const pb = Math.round(b * (1 - mix) + 255 * mix);
    return [pr, pg, pb];
}

function sepia(r, g, b) {
    const sr = Math.min(255, Math.round(r * 0.393 + g * 0.769 + b * 0.189));
    const sg = Math.min(255, Math.round(r * 0.349 + g * 0.686 + b * 0.168));
    const sb = Math.min(255, Math.round(r * 0.272 + g * 0.534 + b * 0.131));
    return [sr, sg, sb];
}

function highContrast(r, g, b) {
    const factor = 1.8; // 대비 계수
    const cr = clamp(Math.round(factor * (r - 128) + 128));
    const cg = clamp(Math.round(factor * (g - 128) + 128));
    const cb = clamp(Math.round(factor * (b - 128) + 128));
    return [cr, cg, cb];
}

function warm(r, g, b) {
    return [
        clamp(r + 25),
        clamp(g + 10),
        clamp(b - 15)
    ];
}

function cool(r, g, b) {
    return [
        clamp(r - 15),
        clamp(g + 5),
        clamp(b + 25)
    ];
}

function invert(r, g, b) {
    return [255 - r, 255 - g, 255 - b];
}

// 헬퍼
function clamp(v) {
    return Math.max(0, Math.min(255, v));
}

// 필터 ID → 함수 매핑
const filterMap = {
    grayscale,
    pastel,
    sepia,
    highContrast,
    warm,
    cool,
    invert,
};
