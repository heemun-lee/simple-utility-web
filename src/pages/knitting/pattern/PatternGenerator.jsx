import { useState, useRef, useCallback, useEffect } from 'react';
import { loadImage, cropImage, resizeImage, calculateHeight, createPixelGrid, drawPreview } from '../../../utils/imageProcessor.js';
import { quantizeColors } from '../../../utils/colorQuantization.js';
import { exportToExcel, exportToPdf } from '../../../utils/exportUtils.js';
import { FILTERS, applyFilter } from '../../../utils/imageFilters.js';
import ImageCropper from '../../../components/ImageCropper.jsx';

/**
 * 커스텀 팔레트로 픽셀 그리드를 다시 매핑
 */
function remapWithCustomPalette(imageData, width, height, customPalette) {
    const pixelCount = width * height;
    const grid = [];
    const counts = new Array(customPalette.length).fill(0);

    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = imageData[idx], g = imageData[idx + 1], b = imageData[idx + 2];
            let bestIdx = 0, bestDist = Infinity;
            for (let p = 0; p < customPalette.length; p++) {
                const [pr, pg, pb] = customPalette[p].color;
                const dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
                if (dist < bestDist) { bestDist = dist; bestIdx = p; }
            }
            row.push(bestIdx);
            counts[bestIdx]++;
        }
        grid.push(row);
    }

    const updatedPalette = customPalette.map((entry, i) => ({
        ...entry,
        count: counts[i],
        percentage: parseFloat(((counts[i] / pixelCount) * 100).toFixed(1))
    }));

    return { grid, palette: updatedPalette };
}

/**
 * 이미지에서 고유 색상 수 추정
 */
function estimateDistinctColors(img) {
    const sampleSize = 64;
    const canvas = document.createElement('canvas');
    const w = Math.min(img.width, sampleSize);
    const h = Math.min(img.height, sampleSize);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;

    const colorSet = new Set();
    for (let i = 0; i < data.length; i += 4) {
        const r = Math.round(data[i] / 8) * 8;
        const g = Math.round(data[i + 1] / 8) * 8;
        const b = Math.round(data[i + 2] / 8) * 8;
        colorSet.add(`${r},${g},${b}`);
    }
    return colorSet.size;
}

function PatternGenerator() {
    // State
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [width, setWidth] = useState(50);
    const [height, setHeight] = useState(0);
    const [colorCount, setColorCount] = useState(5);
    const [pdfScale, setPdfScale] = useState(100);
    const [pixelGrid, setPixelGrid] = useState(null);
    const [palette, setPalette] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [guidelineColor, setGuidelineColor] = useState('#FF0000');
    const [genWidth, setGenWidth] = useState(0);
    const [genHeight, setGenHeight] = useState(0);
    const [selectedFilter, setSelectedFilter] = useState('none');
    const [cropRect, setCropRect] = useState({ top: 0, bottom: 0, left: 0, right: 0 });

    const imgRef = useRef(null);
    const canvasRef = useRef(null);
    const resizedDataRef = useRef(null);

    // ── RGB ↔ HEX 변환 ──
    const rgbToHex = (color) => '#' + color.map(c => c.toString(16).padStart(2, '0')).join('');
    const hexToRgb = (hex) => {
        const h = hex.replace('#', '');
        return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
    };

    // ── pixelGrid/palette 변경 시 캔버스에 미리보기 그리기 ──
    useEffect(() => {
        if (!pixelGrid || !palette || !canvasRef.current || !genWidth || !genHeight) return;
        const ctx = canvasRef.current.getContext('2d');
        const cellSize = Math.max(4, Math.min(12, Math.floor(600 / Math.max(genWidth, genHeight))));
        drawPreview(ctx, pixelGrid, palette, genWidth, genHeight, cellSize, guidelineColor);
    }, [pixelGrid, palette, genWidth, genHeight, guidelineColor]);

    // ── 이미지 업로드 처리 ──
    const handleImageUpload = useCallback(async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImageFile(file);
        setPixelGrid(null);
        setPalette(null);
        setImageLoaded(false);
        setSelectedFilter('none');
        setCropRect({ top: 0, bottom: 0, left: 0, right: 0 });

        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target.result);
        reader.readAsDataURL(file);

        const img = await loadImage(file);
        imgRef.current = img;

        // 기본값: 이미지 픽셀 크기 그대로
        setWidth(img.width);
        setHeight(img.height);

        // 이미지에서 고유 색상 수 추출 (최대 5개)
        const distinctColors = estimateDistinctColors(img);
        setColorCount(Math.min(Math.max(distinctColors, 2), 5));

        setImageLoaded(true);
    }, []);

    // ── 가로 코 수 변경 → 세로 자동 계산 (생성은 하지 않음) ──
    const handleWidthChange = useCallback((e) => {
        const val = e.target.value;
        const newWidth = parseInt(val) || 0;
        setWidth(val === '' ? '' : newWidth);
        if (imgRef.current && newWidth > 0) {
            // 크롭 적용된 비율로 세로 계산
            const cropW = imgRef.current.width * (1 - cropRect.left - cropRect.right);
            const cropH = imgRef.current.height * (1 - cropRect.top - cropRect.bottom);
            const ratio = cropH / cropW;
            setHeight(Math.round(newWidth * ratio));
        }
    }, [cropRect]);

    // ── 색상 수 변경 (생성은 하지 않음) ──
    const handleColorCountChange = useCallback((e) => {
        const val = e.target.value;
        setColorCount(val === '' ? '' : (parseInt(val) || 0));
    }, []);

    // ── 크롭 변경 → 기본값 업데이트 ──
    const handleCropChange = useCallback((newCrop) => {
        setCropRect(newCrop);
        if (imgRef.current) {
            const cropW = Math.round(imgRef.current.width * (1 - newCrop.left - newCrop.right));
            const cropH = Math.round(imgRef.current.height * (1 - newCrop.top - newCrop.bottom));
            setWidth(cropW);
            setHeight(cropH);
        }
    }, []);

    // ── [도안 생성] 버튼 클릭 ──
    const handleGenerate = useCallback(async () => {
        if (!imgRef.current) return;

        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 30));

        try {
            const w = width || 1;
            const h = height || 1;

            // 크롭 적용
            const hasCrop = cropRect.top > 0 || cropRect.bottom > 0 || cropRect.left > 0 || cropRect.right > 0;
            const source = hasCrop ? cropImage(imgRef.current, cropRect) : imgRef.current;

            const resizedData = resizeImage(source, w, h);

            // 필터 적용
            const filteredData = applyFilter(resizedData, selectedFilter);
            resizedDataRef.current = filteredData;

            const { quantizedData, palette: newPalette } = quantizeColors(filteredData.data, colorCount);
            const grid = createPixelGrid(quantizedData, w, h, newPalette);

            setGenWidth(w);
            setGenHeight(h);
            setPixelGrid(grid);
            setPalette(newPalette);
        } catch (err) {
            console.error('도안 생성 중 오류:', err);
            alert('도안 생성 중 오류가 발생했습니다.');
        } finally {
            setIsProcessing(false);
        }
    }, [width, height, colorCount, selectedFilter]);

    // ── 색상 수동 변경 → 실시간 미리보기 반영 ──
    const handleColorChange = useCallback((idx, hexValue) => {
        if (!palette || !resizedDataRef.current || !genWidth || !genHeight) return;
        const newRgb = hexToRgb(hexValue);
        const newPalette = palette.map((entry, i) =>
            i === idx ? { ...entry, color: newRgb } : entry
        );

        const { grid, palette: updatedPalette } = remapWithCustomPalette(
            resizedDataRef.current.data, genWidth, genHeight, newPalette
        );
        setPixelGrid(grid);
        setPalette(updatedPalette);
    }, [palette, genWidth, genHeight]);

    // ── 내보내기 ──
    const handleExportExcel = useCallback(async () => {
        if (!pixelGrid || !palette) return;
        setIsExporting(true);
        try {
            await exportToExcel(pixelGrid, palette, genWidth, genHeight, hexToRgb(guidelineColor));
        } catch (err) {
            console.error('엑셀 내보내기 오류:', err);
            alert('엑셀 내보내기 중 오류가 발생했습니다.');
        } finally {
            setIsExporting(false);
        }
    }, [pixelGrid, palette, genWidth, genHeight, guidelineColor]);

    const handleExportPdf = useCallback(() => {
        if (!pixelGrid || !palette) return;
        try {
            exportToPdf(pixelGrid, palette, genWidth, genHeight, pdfScale, hexToRgb(guidelineColor));
        } catch (err) {
            console.error('PDF 내보내기 오류:', err);
            alert('PDF 내보내기 중 오류가 발생했습니다.');
        }
    }, [pixelGrid, palette, genWidth, genHeight, pdfScale, guidelineColor]);

    return (
        <div className="uk-section uk-section-muted">
            <div className="uk-container uk-container-small">
                {/* 헤더 */}
                <div className="uk-margin-large-bottom">
                    <h1 className="uk-heading-medium uk-margin-remove-bottom">배색뜨기 도안 생성기</h1>
                    <p className="uk-text-lead uk-text-muted uk-margin-small-top">
                        이미지를 업로드하여 뜨개질 배색뜨기 도안을 생성하세요
                    </p>
                </div>

                {/* ① 이미지 업로드 */}
                <div className="uk-card uk-card-default uk-margin-medium">
                    <div className="uk-card-header">
                        <h3 className="uk-card-title">① 이미지 업로드</h3>
                    </div>
                    <div className="uk-card-body">
                        <div data-uk-form-custom="target: true">
                            <input
                                id="image-upload-input"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                            <input
                                className="uk-input uk-form-large uk-form-width-large"
                                type="text"
                                placeholder="클릭하여 이미지를 선택하세요"
                                disabled
                                style={{ cursor: 'pointer' }}
                            />
                        </div>

                        {imagePreview && (
                            <div className="uk-margin-top uk-text-center">
                                <ImageCropper
                                    imageSrc={imagePreview}
                                    cropRect={cropRect}
                                    onCropChange={handleCropChange}
                                />
                                <p className="uk-text-meta uk-margin-small-top">
                                    원본: {imgRef.current?.width} × {imgRef.current?.height}px
                                    {(cropRect.top > 0 || cropRect.bottom > 0 || cropRect.left > 0 || cropRect.right > 0) && (
                                        <span>
                                            {' → '}크롭: {Math.round(imgRef.current?.width * (1 - cropRect.left - cropRect.right))} × {Math.round(imgRef.current?.height * (1 - cropRect.top - cropRect.bottom))}px
                                            <button
                                                className="uk-button uk-button-link uk-margin-small-left"
                                                style={{ fontSize: '0.85em', textDecoration: 'underline' }}
                                                onClick={() => handleCropChange({ top: 0, bottom: 0, left: 0, right: 0 })}
                                            >
                                                초기화
                                            </button>
                                        </span>
                                    )}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ② 도안 설정 (이미지 업로드 후 표시) */}
                {imageLoaded && (
                    <>
                        <div className="uk-card uk-card-default uk-margin-medium uk-animation-slide-bottom-small">
                            <div className="uk-card-header">
                                <h3 className="uk-card-title">② 도안 설정</h3>
                                <p className="uk-text-meta">이미지에서 추출한 값이 기본으로 설정됩니다. 필요 시 수정 후 생성 버튼을 눌러주세요.</p>
                            </div>
                            <div className="uk-card-body">
                                <div className="uk-flex uk-flex-column uk-flex-row@s uk-grid-small" data-uk-grid>
                                    <div className="uk-width-1-1 uk-width-1-3@s uk-margin-small-bottom">
                                        <label className="uk-form-label uk-text-bold">가로 코 수</label>
                                        <input
                                            id="width-input"
                                            className="uk-input uk-form-large"
                                            type="number"
                                            value={width}
                                            onChange={handleWidthChange}
                                        />
                                    </div>
                                    <div className="uk-width-1-1 uk-width-1-3@s uk-margin-small-bottom">
                                        <label className="uk-form-label uk-text-bold">세로 코 수 (자동)</label>
                                        <input
                                            id="height-display"
                                            className="uk-input uk-form-large"
                                            type="number"
                                            value={height || '—'}
                                            disabled
                                            style={{ backgroundColor: '#f8f8f8' }}
                                        />
                                    </div>
                                    <div className="uk-width-1-1 uk-width-1-3@s">
                                        <label className="uk-form-label uk-text-bold">색상 수</label>
                                        <input
                                            id="color-count-input"
                                            className="uk-input uk-form-large"
                                            type="number"
                                            value={colorCount}
                                            onChange={handleColorCountChange}
                                        />
                                    </div>
                                </div>

                                {/* 필터 선택 */}
                                <div className="uk-margin-top">
                                    <label className="uk-form-label uk-text-bold">이미지 필터</label>
                                    <select
                                        id="filter-select"
                                        className="uk-select uk-form-large"
                                        value={selectedFilter}
                                        onChange={(e) => setSelectedFilter(e.target.value)}
                                    >
                                        {FILTERS.map(f => (
                                            <option key={f.id} value={f.id}>
                                                {f.name} — {f.description}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 생성 버튼 */}
                        <div className="uk-margin-medium uk-text-center">
                            <button
                                id="generate-button"
                                className="uk-button uk-button-primary uk-button-large uk-width-1-1 uk-border-rounded"
                                onClick={handleGenerate}
                                disabled={isProcessing}
                                style={{ fontSize: '1.2rem', padding: '15px 60px' }}
                            >
                                {isProcessing ? (
                                    <span><span data-uk-spinner="ratio: 0.6"></span> 도안 생성 중...</span>
                                ) : (
                                    '도안 생성'
                                )}
                            </button>
                        </div>
                    </>
                )}

                {/* ③ 결과 영역 (생성 후 표시) */}
                {pixelGrid && palette && (
                    <div className="uk-animation-slide-bottom-small">
                        {/* 미리보기 */}
                        <div className="uk-card uk-card-default uk-margin-medium">
                            <div className="uk-card-header">
                                <h3 className="uk-card-title">도안 미리보기</h3>
                                <p className="uk-text-meta">{genWidth}코 × {genHeight}단 · {palette.length}색</p>
                            </div>
                            <div className="uk-card-body uk-text-center" style={{ overflowX: 'auto' }}>
                                <canvas
                                    ref={canvasRef}
                                    style={{ imageRendering: 'pixelated', maxWidth: '100%' }}
                                />
                            </div>
                        </div>

                        {/* 색상표 (수동 편집 → 실시간 반영) */}
                        <div className="uk-card uk-card-default uk-margin-medium">
                            <div className="uk-card-header">
                                <h3 className="uk-card-title">색상표 (팔레트)</h3>
                                <p className="uk-text-meta">색상을 클릭하여 수동으로 변경하면 미리보기에 실시간 반영됩니다</p>
                            </div>
                            <div className="uk-card-body">
                                {/* 가이드라인 색상 */}
                                <div className="uk-margin-bottom" style={{ paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
                                    <div className="uk-flex uk-flex-middle" style={{ gap: '10px' }}>
                                        <label
                                            style={{
                                                position: 'relative',
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '6px',
                                                backgroundColor: guidelineColor,
                                                border: '2px solid #ddd',
                                                cursor: 'pointer',
                                                flexShrink: 0,
                                                display: 'block'
                                            }}
                                            title="가이드라인 색상 변경"
                                        >
                                            <input
                                                type="color"
                                                value={guidelineColor}
                                                onChange={(e) => setGuidelineColor(e.target.value)}
                                                style={{
                                                    position: 'absolute',
                                                    opacity: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    cursor: 'pointer',
                                                    top: 0,
                                                    left: 0
                                                }}
                                            />
                                        </label>
                                        <div>
                                            <div className="uk-text-bold uk-text-small">가이드라인 색상</div>
                                            <div className="uk-text-meta">5코/5단마다 표시되는 굵은 선 색상</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="uk-grid uk-grid-small uk-child-width-1-2 uk-child-width-1-3@s" data-uk-grid>
                                    {palette.map((entry, idx) => (
                                        <div key={idx}>
                                            <div className="uk-flex uk-flex-middle" style={{ gap: '10px' }}>
                                                <label
                                                    style={{
                                                        position: 'relative',
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '6px',
                                                        backgroundColor: `rgb(${entry.color[0]},${entry.color[1]},${entry.color[2]})`,
                                                        border: '2px solid #ddd',
                                                        cursor: 'pointer',
                                                        flexShrink: 0,
                                                        display: 'block'
                                                    }}
                                                    title="클릭하여 색상 변경"
                                                >
                                                    <input
                                                        type="color"
                                                        value={rgbToHex(entry.color)}
                                                        onChange={(e) => handleColorChange(idx, e.target.value)}
                                                        style={{
                                                            position: 'absolute',
                                                            opacity: 0,
                                                            width: '100%',
                                                            height: '100%',
                                                            cursor: 'pointer',
                                                            top: 0,
                                                            left: 0
                                                        }}
                                                    />
                                                </label>
                                                <div>
                                                    <div className="uk-text-bold uk-text-small">
                                                        {rgbToHex(entry.color).toUpperCase()}
                                                    </div>
                                                    <div className="uk-text-meta">
                                                        {entry.percentage}%
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 내보내기 */}
                        <div className="uk-card uk-card-default uk-margin-medium">
                            <div className="uk-card-header">
                                <h3 className="uk-card-title">내보내기</h3>
                            </div>
                            <div className="uk-card-body">
                                <div className="uk-margin-bottom">
                                    <label className="uk-form-label uk-text-bold">PDF 확대율</label>
                                    <select
                                        id="pdf-scale-select"
                                        className="uk-select"
                                        value={pdfScale}
                                        onChange={(e) => setPdfScale(parseInt(e.target.value))}
                                    >
                                        <option value={100}>100% (1페이지)</option>
                                        <option value={200}>200% (4페이지)</option>
                                        <option value={300}>300% (9페이지)</option>
                                        <option value={400}>400% (16페이지)</option>
                                    </select>
                                </div>
                                <div className="uk-flex uk-flex-column uk-flex-row@s uk-grid-small" data-uk-grid>
                                    <div className="uk-width-1-1 uk-width-1-2@s">
                                        <button
                                            id="export-pdf-button"
                                            className="uk-button uk-button-primary uk-button-large uk-width-1-1 uk-border-rounded"
                                            onClick={handleExportPdf}
                                        >
                                            <span data-uk-icon="icon: file-text" className="uk-margin-small-right"></span>
                                            PDF 다운로드
                                        </button>
                                    </div>
                                    <div className="uk-width-1-1 uk-width-1-2@s">
                                        <button
                                            id="export-excel-button"
                                            className="uk-button uk-button-default uk-button-large uk-width-1-1 uk-border-rounded"
                                            onClick={handleExportExcel}
                                            disabled={isExporting}
                                            style={{ borderColor: 'var(--cherry-blossom)', color: 'var(--cherry-blossom-dark)' }}
                                        >
                                            {isExporting ? (
                                                <span><span data-uk-spinner="ratio: 0.6"></span> 생성 중...</span>
                                            ) : (
                                                <>
                                                    <span data-uk-icon="icon: table" className="uk-margin-small-right"></span>
                                                    엑셀 다운로드
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PatternGenerator;
