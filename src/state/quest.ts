import { gameState } from './gameState';

export interface QuestStep {
  id: string;
  /** 이 플래그가 켜지면 단계 완료 */
  done: string;
  /** 화면 상단 "다음 목표" 문구 */
  text: string;
  /** 목표 위치 (해당 맵에서 화살표로 표시) */
  target?: { map: string; tx: number; ty: number };
}

/**
 * 진행 단계 (위에서부터 차례로). 각 단계는 `done` 플래그가 켜지면 끝나고, 다음 단계로 넘어간다.
 * target 이 있으면 그 위치를 화살표로 안내한다. 다른 맵에 있는 목표는 지금 맵의 출구(links)를 가리킨다.
 */
export const QUEST: QuestStep[] = [
  {
    id: 'scared',
    done: 'met_scared',
    text: '비탈길 위쪽에 서 있는 학생에게 말을 걸어 보세요',
    target: { map: 'outdoor', tx: 42, ty: 18 },
  },
  {
    id: 'sound',
    done: 'puppy_found',
    text: '이상한 소리를 확인하자! 본관 왼쪽 수풀을 살펴보세요',
    target: { map: 'outdoor', tx: 39, ty: 10 },
  },
  {
    id: 'report',
    done: 'puppy_reported',
    text: '강아지와 함께 걱정하던 학생에게 돌아가 보세요',
    target: { map: 'outdoor', tx: 42, ty: 18 },
  },
  {
    id: 'slope',
    done: 'arrived_sanhak',
    text: '비탈길을 따라 내려가 산학협력관 앞으로 가 보세요',
    target: { map: 'outdoor', tx: 7, ty: 36 },
  },
  {
    id: 'pizza',
    done: 'pizza_done',
    text: '산학협력관 앞의 피자 배달부와 이야기해 보세요',
    target: { map: 'outdoor', tx: 10, ty: 39 },
  },
  {
    id: 'enter',
    done: 'entered_building',
    text: '산학협력관 안으로 들어가 보세요',
    target: { map: 'outdoor', tx: 7, ty: 34 },
  },
  {
    id: 'knock',
    done: 'knocked',
    text: '복도 끝 702호 연구실 문을 두드려 보세요',
    target: { map: 'hall', tx: 21, ty: 3 },
  },
  {
    id: 'office',
    done: 'hint_found',
    text: '연구실을 둘러보세요. 책상 위 과제 더미가 눈에 띄어요',
    target: { map: 'office', tx: 9, ty: 6 },
  },
  {
    id: 'garden',
    done: 'garden_entered',
    text: '힌트를 따라 비탈길 오른쪽 숲속, 장미 덩굴 대문으로 가 보세요',
    target: { map: 'outdoor', tx: 54, ty: 28 },
  },
  {
    id: 'chest',
    done: 'chest_opened',
    text: '정원 안쪽 큰 나무 아래의 보물상자를 찾아보세요',
    target: { map: 'garden', tx: 13, ty: 6 },
  },
];

export const QUEST_DONE_TEXT = '끝까지 와 주셔서 고맙습니다!';

export function currentStep(): QuestStep | null {
  return QUEST.find((s) => !gameState.has(s.done)) ?? null;
}
