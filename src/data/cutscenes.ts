import type { Dir } from '../scenes/BootScene';
import type { SfxName } from '../audio/audio';
import type { Flags } from '../state/gameState';

/**
 * 컷신(연출) 데이터. 대화 도중이 아니라, 캐릭터가 걸어 나오고 효과가 터지는 장면을 순서대로 적는다.
 * 컷신이 실행되는 동안 플레이어는 움직일 수 없고, 끝나면 정리(임시 캐릭터 삭제)된다.
 *
 * 등장인물은 id로 부른다: 'player'(교수님), 맵의 NPC id(예: 'npc_pizza'), 컷신 안에서 spawn 한 id.
 */
export type CutStep =
  /** 잠깐 멈춤 */
  | { type: 'wait'; ms: number }
  /** 대사 스크립트(data/dialogues.ts)를 재생. 끝날 때까지 기다림 */
  | { type: 'say'; script: string }
  /** 플래그 켜기 */
  | { type: 'flag'; set: Flags }
  /** 임시 캐릭터를 투명하게 만들어 둔다 (gather 가 보이게 하며 걷기 시작) */
  | { type: 'spawn'; id: string; texture: string; at: { tx: number; ty: number }; facing?: Dir; label?: string; visible?: boolean; scale?: number }
  /** 폴짝 뛰며 박수 친다 (times 번) */
  | { type: 'clap'; ids: string[]; times?: number }
  /** 캐릭터들이 대상 주변으로 모여든다. stagger(ms) 간격으로 차례로 출발 */
  | { type: 'gather'; ids: string[]; around: string; radius?: number; stagger?: number }
  /** 대상을 바라보게 한다 */
  | { type: 'face'; ids: string[]; toward: string }
  /** 머리 위에 말풍선(! / 하트 / 음표)이 잠깐 뜬다 */
  | { type: 'emote'; ids: string[]; kind: 'excl' | 'heart' | 'note' }
  /** 아이템 이미지가 포물선을 그리며 from → to 로 전달된다. 도착 후 id 로 남는다 */
  | { type: 'item'; id: string; texture: string; from: string; to: string }
  /** 색종이가 터진다 (성공 효과) */
  | { type: 'confetti'; at: string }
  /** 걸어서 지정한 칸으로 간 뒤 사라진다 */
  | { type: 'leave'; ids: string[]; to: { tx: number; ty: number }; stagger?: number }
  /** 사라지게 한다 */
  | { type: 'despawn'; ids: string[]; fade?: boolean }
  /** 효과음 */
  | { type: 'sfx'; name: SfxName }
  /** 화면 가운데에 큰 글자가 톡 튀어나온다 (예: 똑똑) */
  | { type: 'pop'; text: string; ms?: number }
  /** 이미지 카드(data/cards.ts)를 띄우고 닫을 때까지 기다린다 */
  | { type: 'card'; card: string }
  /** 강아지 연출: appear(수풀에서 튀어나옴) / run(달려감) / bark(멍멍) / dig(땅 파기) / free(다시 따라다니게 함) */
  | { type: 'puppy'; act: 'appear' | 'run' | 'bark' | 'dig' | 'free' | 'transform' | 'sit'; at?: { tx: number; ty: number }; ms?: number }
  /** 캐릭터 모습이 바뀐다 (병아리 → 사람): 반짝 빛, 꽃폭죽, 색종이와 함께 ids[i] 의 그림이 to[i] 로 바뀐다 */
  | { type: 'morph'; ids: string[]; to: string[]; stagger?: number }
  /** 703호 닭싸움: fight_hs(병아리 현서)와 fight_senior(황소 선배)가 콩콩 다가와 부딪치고, 현서가 멀리 날아가 넘어진다 */
  | { type: 'chickenFight' }
  /** 과제 폭탄: from 의 병아리들이 차례로 종이를 target 머리 위에 쌓고, 흔들흔들하다 와르르 무너져 target 을 덮는다 */
  | { type: 'paperPile'; target: string; from: string[] }
  /** 덮고 있던 종이 더미를 털고 target 이 튀어나온다 */
  | { type: 'unpile'; target: string }
  /** 그림 바꾸기: shave(면도: 반짝 깨끗) / grow(뿅! 하고 자라남) */
  | { type: 'swap'; id: string; texture: string; fx: 'shave' | 'grow' }
  /** 꽃폭죽이 팡팡 터진다 (대상 머리 위 하늘에서 여러 번) */
  | { type: 'flowers'; at: string; rounds?: number }
  /** 맵을 옮긴다 (화면이 어두워졌다 밝아짐). 이후 단계는 실행되지 않는다 */
  | { type: 'goto'; map: string; spawn: string }
  /** 엔딩 크레딧을 재생한다. 끝나면 처음부터 다시 시작한다 */
  | { type: 'credits' };

/** 피자 이벤트: 병아리 제자들(texture = 병아리, label = 머리 위 이름) */
const CHICKS = [
  { id: 'chick_hs', texture: 'chick_hs', label: '현서' },
  { id: 'chick_ch', texture: 'chick_ch', label: '창현' },
  { id: 'chick_ty', texture: 'chick_ty', label: '태진' },
];
const STUDENTS = CHICKS.map((c) => c.id);
/** 복도에서 창현에게 과제를 내러 오는 병아리 신입생들 */
const FRESH = ['chick_f1', 'chick_f2', 'chick_f3'];
/** 산학협력관 문 앞(학생들이 나오는 곳) */
const DOOR = { tx: 7, ty: 35 };

/** 병아리(STUDENTS 순서: 현서·창현·태진)와 같은 순서의 사람 모습 */
const KIDS = ['kid_hs', 'kid_ch', 'kid_ty'];
const GARDEN_ENTRY = { tx: 13, ty: 18 };

export const CUTSCENES: Record<string, CutStep[]> = {
  // Scene 03: 피자 배달 이벤트. 학생들이 건물에서 달려 나와 피자를 받고 환호한다.
  pizza_event: [
    { type: 'wait', ms: 250 },
    { type: 'emote', ids: ['npc_pizza'], kind: 'excl' },
    { type: 'wait', ms: 600 },
    ...CHICKS.map((c) => ({ type: 'spawn' as const, id: c.id, texture: c.texture, label: c.label, at: DOOR, facing: 'down' as Dir })),
    { type: 'gather', ids: STUDENTS, around: 'npc_pizza', radius: 2.4, stagger: 300 },
    { type: 'face', ids: STUDENTS, toward: 'npc_pizza' },
    { type: 'emote', ids: STUDENTS, kind: 'excl' },
    { type: 'wait', ms: 800 },
    { type: 'item', id: 'box', texture: 'pizza_box', from: 'npc_pizza', to: 'chick_hs' },
    { type: 'say', script: 'pizza_cheer' },
    { type: 'confetti', at: 'chick_ch' },
    { type: 'emote', ids: STUDENTS, kind: 'heart' },
    { type: 'despawn', ids: ['box'], fade: true },
    { type: 'wait', ms: 1400 },
    { type: 'say', script: 'pizza_prof' },
    { type: 'leave', ids: STUDENTS, to: DOOR, stagger: 200 },
    { type: 'flag', set: { pizza_done: true } },
  ],

  // Scene 05: 702호 문을 두드리고, 문이 열리며 연구실로 들어간다
  knock_702: [
    { type: 'wait', ms: 250 },
    { type: 'face', ids: ['player'], toward: 'door_702' },
    { type: 'sfx', name: 'knock' },
    { type: 'pop', text: '똑' },
    { type: 'wait', ms: 480 },
    { type: 'sfx', name: 'knock' },
    { type: 'pop', text: '똑' },
    { type: 'wait', ms: 900 },
    // 문 안쪽에서 2006년의 전경란 교수님 목소리가 들린다
    { type: 'say', script: 'knock_reply' },
    { type: 'wait', ms: 300 },
    { type: 'flag', set: { knocked: true } }, // 문 그림이 열린 문으로 바뀐다
    { type: 'sfx', name: 'door' },
    { type: 'wait', ms: 1100 },
    { type: 'goto', map: 'office', spawn: 'from_hall' },
  ],

  // 학과 게시판: 대사 뒤에 종이 쪽지 그림을 보여준다 (다시 눌러도 볼 수 있다)
  board_note: [
    { type: 'card', card: 'board_note' },
    { type: 'card', card: 'board_note_changhyun' },
    { type: 'card', card: 'board_note_chick' },
  ],

  // 이상한 소리 퀘스트: 수풀에서 강아지가 튀어나와 그때부터 교수님을 따라다닌다
  puppy_reveal: [
    { type: 'wait', ms: 500 },
    { type: 'sfx', name: 'pop' },
    { type: 'puppy', act: 'appear', at: { tx: 39, ty: 9 } },
    { type: 'puppy', act: 'bark' },
    { type: 'flag', set: { puppy_found: true } },
    { type: 'emote', ids: ['player'], kind: 'heart' },
    { type: 'wait', ms: 500 },
    { type: 'say', script: 'puppy_hello' },
    { type: 'puppy', act: 'free' },
  ],

  // 강아지와 함께 겁먹은 학생에게 돌아가면: 학생이 놀라고, 강아지를 보고 반한다
  npc_puppy_react: [
    { type: 'wait', ms: 250 },
    { type: 'emote', ids: ['npc_scared_react'], kind: 'excl' },
    { type: 'clap', ids: ['npc_scared_react'], times: 2 },
    { type: 'puppy', act: 'bark' },
    { type: 'wait', ms: 400 },
    { type: 'say', script: 'scared_react_b' },
    { type: 'emote', ids: ['npc_scared_react'], kind: 'heart' },
    { type: 'wait', ms: 500 },
    { type: 'flag', set: { puppy_reported: true } },
  ],

  // 비밀 정원 대문: 강아지가 멍멍 짖으며 땅을 파 대문을 드러낸다
  garden_dig: [
    { type: 'wait', ms: 400 },
    { type: 'puppy', act: 'run', at: { tx: 54, ty: 29 } },
    { type: 'puppy', act: 'bark' },
    { type: 'wait', ms: 300 },
    { type: 'puppy', act: 'dig', ms: 1900 },
    { type: 'flag', set: { garden_dug: true } },
    { type: 'wait', ms: 600 },
    { type: 'puppy', act: 'bark' },
    { type: 'puppy', act: 'run', at: { tx: 52, ty: 30 } },
    { type: 'say', script: 'garden_dig_done' },
    { type: 'puppy', act: 'free' },
  ],

  // 703호 체육대회: 닭싸움 결승전 (처음 들어설 때 한 번)
  chicken_fight: [
    { type: 'wait', ms: 300 },
    { type: 'spawn', id: 'fight_hs', texture: 'chick_hs', label: '현서', at: { tx: 7, ty: 8 }, facing: 'right', visible: true },
    { type: 'spawn', id: 'fight_senior', texture: 'bull_senior', at: { tx: 13, ty: 8 }, facing: 'left', visible: true, scale: 1.3 },
    { type: 'say', script: 'fight_intro' },
    { type: 'chickenFight' },
    { type: 'say', script: 'fight_after' },
    { type: 'flag', set: { fight_done: true } },
  ],

  // 복도 "교수님 오인 소동": 신입생들이 창현에게 과제를 내다 와르르, 면도하면 수염이 더 크게 자라난다
  ch_event: [
    { type: 'wait', ms: 300 },
    { type: 'say', script: 'ch_ev_intro' },
    ...FRESH.map((id) => ({ type: 'spawn' as const, id, texture: id, at: { tx: 3, ty: 5 }, facing: 'right' as Dir })),
    { type: 'gather', ids: FRESH, around: 'npc_chick_ch', radius: 1.9, stagger: 250 },
    { type: 'face', ids: FRESH, toward: 'npc_chick_ch' },
    { type: 'emote', ids: FRESH, kind: 'excl' },
    { type: 'say', script: 'ch_ev_fresh' },
    { type: 'paperPile', target: 'npc_chick_ch', from: FRESH },
    { type: 'say', script: 'ch_ev_pile' },
    { type: 'leave', ids: FRESH, to: { tx: 3, ty: 5 }, stagger: 200 },
    { type: 'unpile', target: 'npc_chick_ch' },
    // 면도 장면은 정면으로 보여 준다
    { type: 'face', ids: ['npc_chick_ch'], toward: 'player' },
    { type: 'say', script: 'ch_ev_shave1' },
    { type: 'swap', id: 'npc_chick_ch', texture: 'chick_ch_shaved', fx: 'shave' },
    { type: 'say', script: 'ch_ev_shave2' },
    { type: 'wait', ms: 500 },
    { type: 'swap', id: 'npc_chick_ch', texture: 'chick_ch_beard2', fx: 'grow' },
    { type: 'say', script: 'ch_ev_shave3' },
    { type: 'swap', id: 'npc_chick_ch', texture: 'chick_ch_shaved', fx: 'shave' },
    { type: 'wait', ms: 600 },
    { type: 'swap', id: 'npc_chick_ch', texture: 'chick_ch_beard3', fx: 'grow' },
    { type: 'say', script: 'ch_ev_end' },
    { type: 'flag', set: { ch_event_done: true } },
  ],

  // 연구실에 처음 들어섰을 때
  office_intro: [
    { type: 'wait', ms: 350 },
    { type: 'say', script: 'office_intro' },
  ],

  // Scene 07: 보물상자를 열면 병아리 제자들이 달려와 사람으로 변하고, 축하 메시지, 엔딩 크레딧.
  // (강아지는 상자 뒤에서 앉아 기다리다가, 크레딧이 모두 끝난 뒤 쿠키 영상에서 사람으로 변한다)
  chest_event: [
    { type: 'wait', ms: 300 },
    { type: 'sfx', name: 'chest' },
    { type: 'flag', set: { chest_opened: true } }, // 상자 그림이 열린 상자로 바뀐다
    { type: 'confetti', at: 'chest' },
    { type: 'wait', ms: 700 },
    // 병아리 모습의 제자들이 정원 입구에서 달려온다
    ...CHICKS.map((c) => ({ type: 'spawn' as const, id: c.id, texture: c.texture, label: c.label, at: GARDEN_ENTRY, facing: 'up' as Dir })),
    { type: 'gather', ids: STUDENTS, around: 'chest', radius: 2.2, stagger: 350 },
    // 강아지는 제자들과 겹치지 않게 보물상자 뒤로 가서, 정면을 보고 앉아 귀엽게 기다린다
    { type: 'puppy', act: 'run', at: { tx: 13, ty: 4 } },
    { type: 'puppy', act: 'sit' },
    { type: 'face', ids: STUDENTS, toward: 'player' },
    { type: 'emote', ids: STUDENTS, kind: 'excl' },
    { type: 'wait', ms: 900 },
    // 반짝! 병아리가 사람으로 변한다 (꽃폭죽과 색종이)
    { type: 'morph', ids: STUDENTS, to: KIDS, stagger: 320 },
    { type: 'wait', ms: 600 },
    { type: 'face', ids: STUDENTS, toward: 'player' },
    { type: 'emote', ids: STUDENTS, kind: 'heart' },
    { type: 'sfx', name: 'fanfare' },
    { type: 'clap', ids: STUDENTS, times: 5 },
    { type: 'confetti', at: 'chick_ch' },
    { type: 'wait', ms: 600 },
    { type: 'card', card: 'gift' },
    { type: 'say', script: 'chest_msg' },
    { type: 'credits' },
  ],
};
