/**
 * 계절 연출 설정 (비탈길을 걸을 때 낙엽 → 눈 → 벚꽃잎 → 낙엽).
 *
 * ★ 끄고 싶으면 `enabled` 를 false 로 바꾸면 됩니다. (파일 삭제 불필요)
 *   비교 테스트용: 개발 서버 주소 끝에 `?season=off` 를 붙여도 꺼집니다.
 *
 * 구간(zones)은 "비탈길 위 위치"로 정합니다. 0 = 본관 앞(길의 위쪽 끝), 1 = 산학협력관 앞(길의 아래쪽 끝).
 * (연도 표시와 같은 길 `map.timeline.line` 을 읽기만 하고, 연도 로직은 건드리지 않습니다.)
 */
export type Season = 'autumn' | 'winter' | 'spring';

export interface SeasonZone {
  id: 'AUTUMN_START' | 'WINTER_START' | 'SPRING_START' | 'AUTUMN_RETURN';
  season: Season;
  /** 이 위치부터 이 계절 (0~1, 위에서 아래로) */
  from: number;
}

export const SEASON_CONFIG = {
  /** 계절 연출 켜기/끄기 */
  enabled: true,
  /** 계절이 바뀔 때 이전 효과가 줄고 다음 효과가 늘어나는 시간(초) */
  fadeSeconds: 1.8,
  /** 계절별 최대 입자 수 (아이패드를 위해 작게 유지) */
  maxParticles: { autumn: 22, winter: 40, spring: 28 } as Record<Season, number>,
  /** 프레임이 낮으면 밀도를 이 비율까지 자동으로 줄인다 */
  lowPerfScale: 0.5,
  /** 위에서 아래로 갈수록 적용되는 구간 (from 오름차순) */
  zones: [
    { id: 'AUTUMN_START', season: 'autumn', from: 0 }, // 본관 주변
    { id: 'WINTER_START', season: 'winter', from: 0.2 }, // 비탈길 상단
    { id: 'SPRING_START', season: 'spring', from: 0.52 }, // 비탈길 하단
    { id: 'AUTUMN_RETURN', season: 'autumn', from: 0.84 }, // 산학협력관 앞
  ] as SeasonZone[],
};
