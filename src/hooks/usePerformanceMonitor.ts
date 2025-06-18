import { useCallback, useRef } from "react";

interface PerformanceMetrics {
  renderTime: number;
  dataProcessingTime: number;
  chartUpdateTime: number;
}

export const usePerformanceMonitor = () => {
  const metricsRef = useRef<PerformanceMetrics>({
    renderTime: 0,
    dataProcessingTime: 0,
    chartUpdateTime: 0,
  });

  const startTimer = useCallback(() => {
    return performance.now();
  }, []);

  const endTimer = useCallback(
    (startTime: number, metricType: keyof PerformanceMetrics) => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      metricsRef.current[metricType] = duration;

      // パフォーマンスが悪い場合にコンソールに警告を表示
      if (duration > 100) {
        console.warn(
          `パフォーマンス警告: ${metricType}が${duration.toFixed(
            2
          )}msかかりました`
        );
      }

      return duration;
    },
    []
  );

  const getMetrics = useCallback(() => {
    return { ...metricsRef.current };
  }, []);

  const resetMetrics = useCallback(() => {
    metricsRef.current = {
      renderTime: 0,
      dataProcessingTime: 0,
      chartUpdateTime: 0,
    };
  }, []);

  return {
    startTimer,
    endTimer,
    getMetrics,
    resetMetrics,
  };
};
