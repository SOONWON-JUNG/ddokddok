import type { Script } from '../ui/dialogue';

/**
 * 대사 데이터. S2는 동작 확인용 임시 대사이며, S4~S6에서 실제 이야기로 교체된다.
 * 노드 구조: { speaker?, text, next?, choices?, set? } — `start` 노드부터 시작.
 */
export const SCRIPTS: Record<string, Script> = {
  // ── S4: 피자 배달 이벤트 (Scene 03). 첫 두 줄과 선택지는 기획서 문구 ──
  pizza: {
    start: {
      speaker: '피자 배달부',
      portrait: 'pizza',
      text: '저기요! 혹시 산학협력관 702호가 어디인지 아시나요?',
      next: 'ask',
    },
    ask: {
      speaker: '피자 배달부',
      portrait: 'pizza',
      text: '전경란 교수님이 주문하신 피자인데, 학생들이 기다리고 있대요!',
      choices: [
        { label: '702호요? 제가 잘 알죠!', next: 'yes' },
        { label: '우리 아이들이 기다리고 있어요!', next: 'yes2' },
      ],
    },
    yes: {
      speaker: '피자 배달부',
      portrait: 'pizza',
      text: '정말요? 휴, 다행이다! 그런데 어라… 저기 누가 나오는데요?',
      set: { talked_npc: true },
    },
    yes2: {
      speaker: '피자 배달부',
      portrait: 'pizza',
      text: '아, 자주 시켜 주시나 봐요? 학생들이 기다릴 만하네요! 그런데 어라… 저기 누가 나오는데요?',
      set: { talked_npc: true },
    },
  },
  // 병아리 제자들의 반응 (첫 줄은 기획서 문구, 나머지는 임시 문구)
  pizza_cheer: {
    start: { speaker: '현서', portrait: 'chick_hs', text: '와아! 교수님 감사합니다!', next: 'b' },
    b: { speaker: '창현', portrait: 'chick_ch', text: '피자다! 수업 내내 이것만 기다렸어요!', next: 'c' },
    c: { speaker: '태진', portrait: 'chick_ty', text: '역시 우리 교수님이 최고예요! 잘 먹겠습니다!' },
  },
  pizza_prof: {
    start: {
      speaker: '교수님',
      portrait: 'professor',
      text: '하하, 다들 맛있게 먹어요.',
    },
  },
  pizza_after: {
    start: {
      speaker: '피자 배달부',
      portrait: 'pizza',
      text: '맛있게 드세요! 학생들 표정이 정말 밝던데요.',
    },
  },

  // ── S3: 본관 현수막 (문구 확정) ──
  banner: {
    start: {
      text: '본관 앞에 커다란 현수막이 걸려 있다.',
      next: 'text',
    },
    text: {
      text: '전경란 교수님 총장 취임을 축하드립니다.\n06학번 현서, 창현, 태진',
      set: { saw_banner: true },
    },
  },

  // ── S3: 추억 클릭 포인트 (문구는 모두 임시. 현서님이 실제 추억으로 교체) ──
  // 본관 앞 미션 표지판
  mem_sign: {
    start: {
      text: '[아직 쓰이지 않은 마지막 장]\n\n2006년, 702호에서 시작된 이야기가 있다.',
      next: 'b',
    },
    b: { text: '스무 해가 흘렀지만,\n그 이야기에는 여전히 진행중이다.', next: 'c' },
    c: {
      text: '오래전 닫힌 문을 다시 두드리면,\n그다음 이야기가 열릴지도 모른다.',
      choices: [{ label: '702호로 향하기', next: 'go' }],
    },
    go: { text: '표지판 너머, 비탈길이 산학협력관으로 이어져 있다.\n천천히 내려가 보자.' },
  },
  mem_vending: {
    start: {
      text: '자판기가 윙— 하고 돌아가고 있다.\n수업 사이사이 목을 축이던 그 자판기일지도.\n우유가 맛있었다는 소문이...',
    },
  },
  mem_bench: {
    start: {
      text: '벤치에 앉으면 그 시절이 떠오른다.\n날씨가 좋을때 야외 수업이 기억에 남는다.',
    },
  },

  // ── S3: 수덕전(파르페 가게) 문구는 임시 ──
  parfait_sign: {
    start: {
      portrait: 'parfait',
      text: '[수덕전]\n딸기파르페\n',
    },
  },
  shop_door: {
    start: {
      text: '수덕전 문은 닫혀 있다.\n가게 앞에서 무언가 반짝인다…\n',
    },
  },

  // ── S3: 추억의 아이템 (문구는 기획서 그대로) ──
  parfait: {
    start: {
      text: '길가에 무언가 반짝이고 있다…!',
      next: 'item',
    },
    item: {
      portrait: 'parfait',
      text: '[추억의 아이템 발견!]\nITEM  수덕전 딸기파르페\n효과: 등교 피로 회복 +100\n추가 효과: 캠퍼스 기분 전환 +50\n숨겨진 효과: 사랑이 싹틀 확률 상승 ♡',
      next: 'note',
    },
    note: {
      portrait: 'parfait',
      text: '※ 현재 판매 여부는 확인되지 않았습니다.',
      set: { got_parfait: true },
    },
  },

  main_door: {
    start: {
      text: '본관 문은 아직 열리지 않아요.\n',
    },
  },

  // ── S5: 산학협력관 복도 (Scene 04) — 문구는 모두 임시 ──
  board: {
    start: {
      text: '[디지털콘텐츠학과 게시판]\n초록 게시판 가득 공지문과 종이가 붙어 있다. 한쪽에는 DICON 화살표가 그려져 있다.',
      next: 'memo',
    },
    memo: { text: '시간표, 공모전 포스터… 그 사이에 쪽지 한 장이 붙어 있다.' },
  },
  // ── 이상한 소리 퀘스트 (겁먹은 신입생 + 강아지) ──
  scared_intro: {
    start: { speaker: '신입생', portrait: 'npc_student', text: '저, 저기… 교수님! 혹시 들으셨어요?', next: 'b' },
    b: {
      speaker: '신입생',
      portrait: 'npc_student',
      text: '아까부터 본관 왼쪽 수풀에서 이상한 소리가 나요. 바스락… 끼잉… 하고요.',
      next: 'c',
    },
    c: {
      speaker: '신입생',
      portrait: 'npc_student',
      text: '너무 무서워서 가까이 못 가겠어요… 교수님이 한 번만 확인해 주시면 안 될까요?',
    },
  },
  scared_wait: {
    start: {
      speaker: '신입생',
      portrait: 'npc_student',
      text: '본관 왼쪽 수풀이에요… 으, 생각만 해도 소름이… 부탁드려요, 교수님!',
    },
  },
  bush_sound: {
    start: { text: '수풀에서 바스락, 바스락 소리가 난다.\n…끼잉?' },
  },
  puppy_hello: {
    start: {
      text: '수풀에서 작고 동그란 강아지가 폴짝 튀어나왔다!\n꼬리를 붕붕 흔들며 교수님 발치를 맴돈다.',
      next: 'b',
    },
    b: { text: '이제부터 이 강아지가 교수님을 졸졸 따라다닌다.\n' },
  },
  scared_react_a: {
    start: {
      speaker: '신입생',
      portrait: 'npc_student',
      text: '아, 교수님! 확인해 보셨… 으아아악! 뒤, 뒤에 뭐가 따라와요!!',
    },
  },
  scared_react_b: {
    start: { speaker: '신입생', portrait: 'npc_student', text: '…어? 어라? 강아지?', next: 'b' },
    b: {
      speaker: '신입생',
      portrait: 'npc_student',
      text: '아~ 귀여운 강아지였구나! 저는 또 귀신인 줄 알고 밤새 이불 속에서 떨었다고요…',
      next: 'c',
    },
    c: {
      speaker: '신입생',
      portrait: 'npc_student',
      text: '그런데 얘, 교수님만 졸졸 따라다니네요? 완전 교수님 껌딱지!',
      next: 'd',
    },
    d: { speaker: '신입생', portrait: 'npc_student', text: '제가 겁먹었던 건 우리 둘만의 비밀이에요, 교수님… 알았죠?', next: 'e' },
    e: { text: '멍멍!' },
  },
  scared_after: {
    start: {
      speaker: '신입생',
      portrait: 'npc_student',
      text: '이제 하나도 안 무서워요! 아, 강아지는 조금 무섭지만… 아니, 귀여워요! 귀여워!',
    },
  },
  garden_dig_done: {
    start: { text: '강아지가 멍멍 짖으며 열심히 땅을 파헤치자,\n덩굴 아래 묻혀 있던 대문이 모습을 드러냈다!', next: 'b' },
    b: { text: '정원으로 가는 길이 열렸다.' },
  },

  // 복도의 박성대 교수님과 창현 병아리
  hall_chick: {
    start: { text: '박성대 교수님과 병아리 한 마리가 마주 보고 이야기하고 있다.\n가만히 귀를 기울여 보자.\n\n[의문의 병아리]', next: 'a' },
    a: { speaker: '박성대 교수님', portrait: 'prof_ps', text: '어? 새로 오신 교수님이세요?', next: 'b' },
    b: { speaker: '창현', portrait: 'chick_ch', text: '……저 학생인데요.' },
  },
  // ── 701호: 댄스 동아리 UCDC 연습실, 브레이크 댄스 추는 병아리 태진 ──
  taejin_dance: {
    start: {
      text: '쿵짝쿵짝— 음악 소리 사이로, 병아리 한 마리가 골판지 위에서 빙글빙글 돌고 있다.',
      next: 'a',
    },
    a: {
      speaker: '태진',
      portrait: 'chick_ty',
      text: '어?! 교수님! (헤드스핀 하다 벌떡) 이, 이건 땡땡이가 아니라… "신체 활동을 통한 창의성 연구"입니다!',
      next: 'b',
    },
    b: { speaker: '교수님', portrait: 'professor', text: '태진 학생, 그 연구 계획서는 언제 냈어요?', next: 'c' },
    c: {
      speaker: '태진',
      portrait: 'chick_ty',
      text: '…지금 머릿속으로 쓰는 중입니다. 제목은 "헤드스핀이 두피 혈액순환과 학점에 미치는 영향".',
      next: 'd',
    },
    d: { speaker: '교수님', portrait: 'professor', text: '결론부터 말해 볼래요?', next: 'e' },
    e: {
      speaker: '태진',
      portrait: 'chick_ty',
      text: '혈액순환은 좋아지는데요… 학점도 같이 돌아갑니다. 빙글빙글~',
      choices: [
        { label: 'UCDC가 뭐예요?', next: 'ucdc' },
        { label: '나도 한 번 춰 볼까요?', next: 'try' },
      ],
    },
    ucdc: {
      speaker: '태진',
      portrait: 'chick_ty',
      text: '저희 댄스 동아리 UCDC요! 뜻은… 선배들도 잘 몰라요. 근데 이름이 멋있어서 다들 그냥 씁니다.',
      next: 'ucdc2',
    },
    ucdc2: {
      speaker: '태진',
      portrait: 'chick_ty',
      text: '교수님 오시는 줄 알았으면, 복도부터 윈드밀로 돌면서 마중 나갔을 텐데요!',
      next: 'ucdc3',
    },
    ucdc3: { speaker: '교수님', portrait: 'professor', text: '복도는 걸어 다니는 곳이에요.', next: 'ucdc4' },
    ucdc4: { speaker: '태진', portrait: 'chick_ty', text: '…네. 걸어서 돌겠습니다.' },
    try: { speaker: '교수님', portrait: 'professor', text: '그 빙글빙글 도는 거, 나도 한 번 해 볼까요?', next: 'try2' },
    try2: {
      speaker: '태진',
      portrait: 'chick_ty',
      text: '아, 안 됩니다 교수님! 헤드스핀 하시다 머리 모양 망가지시면… 나중에 큰 행사 사진이 전설로 남습니다!',
      next: 'try3',
    },
    try3: {
      speaker: '태진',
      portrait: 'chick_ty',
      text: '대신 교수님께 바치는 특별 무대를 준비했습니다. 이름하여… "빨간 펜 프리즈"!',
      next: 'try4',
    },
    try4: {
      text: '태진이 한쪽 날개로 물구나무를 선 채, 다른 날개로 허공에 빨간 동그라미를 크게 그린다.',
      next: 'try5',
    },
    try5: { speaker: '교수님', portrait: 'professor', text: '…동그라미는 잘 그렸네요. 띄어쓰기도 맞았고.', next: 'try6' },
    try6: { speaker: '태진', portrait: 'chick_ty', text: '감사합니다! 오늘 연습은 이걸로 A+ 받은 걸로 하겠습니다! (다시 빙글빙글)' },
  },
  door_703: { start: { text: '703호. 안쪽이 조용하다. 지금은 아무도 없는 것 같다.' } },
  door_702: {
    start: {
      text: '702호. 전경란 교수님의 연구실.\n문패 아래 시간표는 화·수·목에 빼곡하다. 월요일과 금요일은 텅 비어 있다.',
      next: 'knock',
    },
    knock: { text: '…똑똑, 하고 문을 두드려 볼까?' },
  },

  // ── S5~S6: 702호 연구실 (Scene 05~06) — 문구는 모두 임시 ──
  office_intro: {
    start: { text: '문이 열리자, 스무 해 전 그대로의 702호가 눈앞에 펼쳐진다.', next: 'b' },
    b: { text: '…그런데 방 안에는 아무도 없다.\n분명 "들어오세요"라는 목소리를 들었는데.', next: 'c' },
    c: { text: '책상 위에는 과제 더미와 빨간 펜이 놓여 있다.\n이 방의 주인이었던 내가, 오늘은 이 방의 방문자가 되었다.' },
  },
  // 702호 문을 두드리면 안에서 들려오는 2006년의 교수님 목소리
  knock_reply: {
    start: { text: '문 안쪽에서 과거의 내가 대답한다.', next: 'a' },
    a: { speaker: '전경란 교수님', portrait: 'professor', text: '네, 들어오세요!' },
  },
  red_pen: {
    start: { text: '책상 위의 빨간 펜. 뚜껑에 닳은 자국이 있다.', next: 'b' },
    b: {
      text: '이 펜으로 수없이 많은 과제에 맞춤법과 띄어쓰기, 그리고 따뜻한 한마디를 남겨 주셨다.',
      set: { pen_seen: true },
    },
  },
  papers_done: {
    start: {
      text: '마지막 장 끝에 적힌 한 줄이 마음에 오래 남는다.\n…비탈길 오른쪽 숲속, 장미 덩굴 대문 뒤라고 했지.',
    },
  },

  // ── S7: 보물상자와 마지막 축하 메시지 — 문구는 임시 ──
  chest_start: {
    start: { text: '큰 나무 아래, 덩굴 사이로 낡은 보물상자가 보인다.', next: 'b' },
    b: { text: '…열어 볼까?' },
  },
  chest_msg: {
    start: {
      speaker: '현서',
      portrait: 'kid_hs',
      text: '교수님, 총장 취임을 진심으로 축하드립니다!\n오래전 702호에서 받은 마음, 오늘은 저희가 돌려드릴게요.',
      next: 'b',
    },
    b: { speaker: '창현', portrait: 'kid_ch', text: '그때 702호 문 두드리던 저희가 이렇게 컸네요!', next: 'c' },
    c: { speaker: '태진', portrait: 'kid_ty', text: '교수님, 저희 마음 받아 주세요!', next: 'real' },
    real: {
      text: '이 선물은 화면 밖에도 있어요.\n제자들이 직접 전해 드릴게요. 앞을 봐 주세요 :)',
    },
  },
  chest_after: { start: { text: '상자는 이미 열려 있다. 안은 따뜻한 빛으로 가득하다.' } },
};
