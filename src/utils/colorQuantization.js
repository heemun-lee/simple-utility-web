/**
 * K-Means 색상 양자화 알고리즘
 * 이미지의 색상 수를 사용자가 지정한 개수로 줄입니다.
 */

/**
 * 두 RGB 색상 간 유클리드 거리 계산
 */
function colorDistance(c1, c2) {
    return Math.sqrt(
        (c1[0] - c2[0]) ** 2 +
        (c1[1] - c2[1]) ** 2 +
        (c1[2] - c2[2]) ** 2
    );
}

/**
 * K-Means++ 초기 중심점 선택
 * 무작위보다 더 균일하게 분포된 초기 중심점을 선택합니다.
 */
function initializeCentroids(pixels, k) {
    const centroids = [];
    // 첫 번째 중심점은 랜덤 선택
    centroids.push([...pixels[Math.floor(Math.random() * pixels.length)]]);

    for (let i = 1; i < k; i++) {
        // 각 픽셀에 대해 가장 가까운 중심점까지의 거리 계산
        const distances = pixels.map(pixel => {
            const minDist = Math.min(...centroids.map(c => colorDistance(pixel, c)));
            return minDist * minDist; // 거리의 제곱을 가중치로 사용
        });

        // 거리가 먼 픽셀일수록 높은 확률로 선택
        const totalDist = distances.reduce((a, b) => a + b, 0);
        let rand = Math.random() * totalDist;
        let idx = 0;
        while (rand > 0 && idx < distances.length) {
            rand -= distances[idx];
            idx++;
        }
        centroids.push([...pixels[Math.max(0, idx - 1)]]);
    }

    return centroids;
}

/**
 * K-Means 색상 양자화 실행
 * @param {Uint8ClampedArray} imageData - 캔버스 getImageData().data (RGBA 배열)
 * @param {number} k - 목표 색상 수
 * @param {number} maxIterations - 최대 반복 횟수
 * @returns {{ quantizedData: Uint8ClampedArray, palette: Array<{color: number[], count: number, percentage: number}> }}
 */
export function quantizeColors(imageData, k, maxIterations = 20) {
    const pixelCount = imageData.length / 4;
    const pixels = [];

    // RGBA → RGB 변환 (알파 무시)
    for (let i = 0; i < imageData.length; i += 4) {
        pixels.push([imageData[i], imageData[i + 1], imageData[i + 2]]);
    }

    // K-Means++ 초기화
    let centroids = initializeCentroids(pixels, k);
    let assignments = new Array(pixelCount).fill(0);

    for (let iter = 0; iter < maxIterations; iter++) {
        let changed = false;

        // 1단계: 각 픽셀을 가장 가까운 중심점에 할당
        for (let i = 0; i < pixelCount; i++) {
            let minDist = Infinity;
            let bestCluster = 0;
            for (let j = 0; j < k; j++) {
                const dist = colorDistance(pixels[i], centroids[j]);
                if (dist < minDist) {
                    minDist = dist;
                    bestCluster = j;
                }
            }
            if (assignments[i] !== bestCluster) {
                assignments[i] = bestCluster;
                changed = true;
            }
        }

        // 수렴 시 조기 종료
        if (!changed) break;

        // 2단계: 중심점 재계산
        const sums = Array.from({ length: k }, () => [0, 0, 0]);
        const counts = new Array(k).fill(0);

        for (let i = 0; i < pixelCount; i++) {
            const cluster = assignments[i];
            sums[cluster][0] += pixels[i][0];
            sums[cluster][1] += pixels[i][1];
            sums[cluster][2] += pixels[i][2];
            counts[cluster]++;
        }

        for (let j = 0; j < k; j++) {
            if (counts[j] > 0) {
                centroids[j] = [
                    Math.round(sums[j][0] / counts[j]),
                    Math.round(sums[j][1] / counts[j]),
                    Math.round(sums[j][2] / counts[j])
                ];
            }
        }
    }

    // 양자화된 이미지 데이터 생성
    const quantizedData = new Uint8ClampedArray(imageData.length);
    const clusterCounts = new Array(k).fill(0);

    for (let i = 0; i < pixelCount; i++) {
        const cluster = assignments[i];
        const color = centroids[cluster];
        quantizedData[i * 4] = color[0];
        quantizedData[i * 4 + 1] = color[1];
        quantizedData[i * 4 + 2] = color[2];
        quantizedData[i * 4 + 3] = 255; // 불투명
        clusterCounts[cluster]++;
    }

    // 팔레트 생성 (사용 비율 포함, 비율이 높은 순으로 정렬)
    const palette = centroids.map((color, idx) => ({
        color: [...color],
        count: clusterCounts[idx],
        percentage: parseFloat(((clusterCounts[idx] / pixelCount) * 100).toFixed(1))
    })).sort((a, b) => b.percentage - a.percentage);

    return { quantizedData, palette };
}
