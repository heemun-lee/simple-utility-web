import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * 이미지 크롭 오버레이 컴포넌트
 * 이미지 위에 드래그 가능한 크롭 영역을 표시합니다.
 */
export default function ImageCropper({ imageSrc, cropRect, onCropChange }) {
    const containerRef = useRef(null);
    const dragRef = useRef(null); // { edge, offset }

    // 드래그 시작: 오프셋 계산 + 저장
    const startDrag = useCallback((edge, e) => {
        e.preventDefault();
        const clientPos = e.touches ? e.touches[0] : e;
        const rect = containerRef.current.getBoundingClientRect();

        // 현재 edge 위치(px)와 마우스 위치의 차이를 저장
        let edgePx;
        if (edge === 'top') {
            edgePx = rect.top + rect.height * cropRect.top;
        } else if (edge === 'bottom') {
            edgePx = rect.bottom - rect.height * cropRect.bottom;
        } else if (edge === 'left') {
            edgePx = rect.left + rect.width * cropRect.left;
        } else {
            edgePx = rect.right - rect.width * cropRect.right;
        }

        const isVertical = edge === 'top' || edge === 'bottom';
        const mousePos = isVertical ? clientPos.clientY : clientPos.clientX;
        const offset = mousePos - edgePx;

        dragRef.current = { edge, offset };

        // 강제 리렌더 대신, 전역 이벤트를 바로 연결
        const moveHandler = (ev) => {
            const pos = ev.touches ? ev.touches[0] : ev;
            const r = containerRef.current.getBoundingClientRect();
            const drag = dragRef.current;
            if (!drag) return;

            const { top, bottom, left, right } = onCropChange.__lastRect || cropRect;

            if (drag.edge === 'top' || drag.edge === 'bottom') {
                const rawY = (pos.clientY - drag.offset - r.top) / r.height;
                const clamped = Math.max(0, Math.min(1, rawY));

                if (drag.edge === 'top') {
                    const maxTop = 1 - cropRect.bottom - 0.05;
                    onCropChange({ ...cropRect, top: Math.min(clamped, maxTop) });
                } else {
                    const rawBottom = 1 - clamped;
                    const maxBottom = 1 - cropRect.top - 0.05;
                    onCropChange({ ...cropRect, bottom: Math.max(0, Math.min(rawBottom, maxBottom)) });
                }
            } else {
                const rawX = (pos.clientX - drag.offset - r.left) / r.width;
                const clamped = Math.max(0, Math.min(1, rawX));

                if (drag.edge === 'left') {
                    const maxLeft = 1 - cropRect.right - 0.05;
                    onCropChange({ ...cropRect, left: Math.min(clamped, maxLeft) });
                } else {
                    const rawRight = 1 - clamped;
                    const maxRight = 1 - cropRect.left - 0.05;
                    onCropChange({ ...cropRect, right: Math.max(0, Math.min(rawRight, maxRight)) });
                }
            }
        };

        const upHandler = () => {
            dragRef.current = null;
            window.removeEventListener('mousemove', moveHandler);
            window.removeEventListener('mouseup', upHandler);
            window.removeEventListener('touchmove', moveHandler);
            window.removeEventListener('touchend', upHandler);
            document.body.style.userSelect = '';
        };

        document.body.style.userSelect = 'none';
        window.addEventListener('mousemove', moveHandler);
        window.addEventListener('mouseup', upHandler);
        window.addEventListener('touchmove', moveHandler, { passive: false });
        window.addEventListener('touchend', upHandler);
    }, [cropRect, onCropChange]);

    const { top, bottom, left, right } = cropRect;
    const hasCrop = top > 0 || bottom > 0 || left > 0 || right > 0;

    const handleStyle = {
        position: 'absolute',
        zIndex: 10,
    };

    const overlayStyle = {
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.5)',
        pointerEvents: 'none',
        zIndex: 5,
    };

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                display: 'inline-block',
            }}
        >
            <img
                src={imageSrc}
                alt="원본 이미지"
                style={{ display: 'block', maxWidth: '100%', maxHeight: '500px' }}
                draggable={false}
            />

            {/* 어두운 오버레이 (잘림 영역) */}
            {top > 0 && (
                <div style={{ ...overlayStyle, top: 0, left: `${left * 100}%`, width: `${(1 - left - right) * 100}%`, height: `${top * 100}%` }} />
            )}
            {bottom > 0 && (
                <div style={{ ...overlayStyle, bottom: 0, left: `${left * 100}%`, width: `${(1 - left - right) * 100}%`, height: `${bottom * 100}%` }} />
            )}
            {left > 0 && (
                <div style={{ ...overlayStyle, top: 0, left: 0, width: `${left * 100}%`, height: '100%' }} />
            )}
            {right > 0 && (
                <div style={{ ...overlayStyle, top: 0, right: 0, width: `${right * 100}%`, height: '100%' }} />
            )}

            {/* 크롭 영역 테두리 */}
            {hasCrop && (
                <div style={{
                    position: 'absolute',
                    top: `${top * 100}%`, left: `${left * 100}%`,
                    width: `${(1 - left - right) * 100}%`, height: `${(1 - top - bottom) * 100}%`,
                    border: '2px dashed #fff', boxSizing: 'border-box',
                    pointerEvents: 'none', zIndex: 8,
                }} />
            )}

            {/* 상단 핸들 */}
            <div
                style={{
                    ...handleStyle,
                    top: `${top * 100}%`, left: `${left * 100}%`,
                    width: `${(1 - left - right) * 100}%`, height: '12px',
                    transform: 'translateY(-6px)', cursor: 'ns-resize',
                }}
                onMouseDown={(e) => startDrag('top', e)}
                onTouchStart={(e) => startDrag('top', e)}
            >
                <div style={{ width: '40px', height: '4px', backgroundColor: '#fff', borderRadius: '2px', margin: '4px auto', boxShadow: '0 1px 3px rgba(0,0,0,0.5)' }} />
            </div>

            {/* 하단 핸들 */}
            <div
                style={{
                    ...handleStyle,
                    bottom: `${bottom * 100}%`, left: `${left * 100}%`,
                    width: `${(1 - left - right) * 100}%`, height: '12px',
                    transform: 'translateY(6px)', cursor: 'ns-resize',
                }}
                onMouseDown={(e) => startDrag('bottom', e)}
                onTouchStart={(e) => startDrag('bottom', e)}
            >
                <div style={{ width: '40px', height: '4px', backgroundColor: '#fff', borderRadius: '2px', margin: '4px auto', boxShadow: '0 1px 3px rgba(0,0,0,0.5)' }} />
            </div>

            {/* 왼쪽 핸들 */}
            <div
                style={{
                    ...handleStyle,
                    top: `${top * 100}%`, left: `${left * 100}%`,
                    width: '12px', height: `${(1 - top - bottom) * 100}%`,
                    transform: 'translateX(-6px)', cursor: 'ew-resize',
                }}
                onMouseDown={(e) => startDrag('left', e)}
                onTouchStart={(e) => startDrag('left', e)}
            >
                <div style={{ width: '4px', height: '40px', backgroundColor: '#fff', borderRadius: '2px', position: 'absolute', top: '50%', left: '4px', transform: 'translateY(-50%)', boxShadow: '0 1px 3px rgba(0,0,0,0.5)' }} />
            </div>

            {/* 오른쪽 핸들 */}
            <div
                style={{
                    ...handleStyle,
                    top: `${top * 100}%`, right: `${right * 100}%`,
                    width: '12px', height: `${(1 - top - bottom) * 100}%`,
                    transform: 'translateX(6px)', cursor: 'ew-resize',
                }}
                onMouseDown={(e) => startDrag('right', e)}
                onTouchStart={(e) => startDrag('right', e)}
            >
                <div style={{ width: '4px', height: '40px', backgroundColor: '#fff', borderRadius: '2px', position: 'absolute', top: '50%', right: '4px', transform: 'translateY(-50%)', boxShadow: '0 1px 3px rgba(0,0,0,0.5)' }} />
            </div>
        </div>
    );
}
