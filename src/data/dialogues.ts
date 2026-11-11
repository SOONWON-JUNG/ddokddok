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
  jeongja: {
    start: {
      text: '연못 위에 붉은 정자가 떠 있다.\n난간에 기대어 쉬고 있으면 물 위로 시간이 천천히 흐르는 것 같다.',
    },
  },
  lotus_pond: {
    start: {
      text: '연잎 사이로 연꽃이 둥실둥실 떠 있다.\n진흙 속에서도 곱게 피어나는 꽃이라고 한다.',
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
    memo: { text: '시간표, 공모전 포스터… 그 사이에 쪽지 네 장이 붙어 있다.' },
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
    b: { speaker: '창현', portrait: 'chick_ch', text: '……저 학생인데요.', set: { ch_talked: true } },
  },
  // 복도 "교수님 오인 소동" (창현 이벤트)
  ch_ev_intro: {
    start: { speaker: '박성대 교수님', portrait: 'prof_ps', text: '그래도 이 수염이면… 어딜 봐도 교수님이신데.', next: 'b' },
    b: { speaker: '창현', portrait: 'chick_ch', text: '아니라니까요! 저 06학번이에요!', next: 'c' },
    c: { text: '그때, 복도 저쪽에서 병아리 신입생들이 우르르 달려온다.' },
  },
  ch_ev_fresh: {
    start: { speaker: '신입생 병아리', portrait: 'chick_fresh', text: '교수님! 과제 제출합니다!', next: 'b' },
    b: { speaker: '신입생 병아리', portrait: 'chick_fresh', text: '저도요! 늦어서 죄송합니다, 교수님!', next: 'c' },
    c: { speaker: '신입생 병아리', portrait: 'chick_fresh', text: '교수님 수염 너무 멋있으세요! 과제 여기 있습니다!', next: 'd' },
    d: { speaker: '창현', portrait: 'chick_ch', text: '아니, 잠깐만, 나 교수 아니…' },
  },
  ch_ev_pile: {
    start: { text: '와르르—! 과제 더미 사이로 수염만 삐죽 나와 있다.', next: 'b' },
    b: { speaker: '교수님', portrait: 'professor', text: '창현아, 괜찮니? …채점은 내가 해 줄게.' },
  },
  ch_ev_shave1: {
    start: { speaker: '창현', portrait: 'chick_ch', text: '이게 다 이 수염 때문이에요! 학생인 걸 증명하겠습니다!', next: 'b' },
    b: { text: '창현이 주머니에서 면도기를 꺼냈다. 쓱싹쓱싹—' },
  },
  ch_ev_shave2: {
    start: { speaker: '창현', portrait: 'chick_ch', text: '어때요! 이제 누가 봐도 풋풋한 06학번 새내기죠?' },
  },
  ch_ev_shave3: {
    start: { text: '뿅!', next: 'b' },
    b: { speaker: '창현', portrait: 'chick_ch', text: '…어? 다시 났는데요? 아까보다 더? 한 번 더!' },
  },
  ch_ev_end: {
    start: { text: '뿅!! 수염이 바닥까지 자라났다.', next: 'b' },
    b: { speaker: '박성대 교수님', portrait: 'prof_ps', text: '아… 명예교수님이셨구나. 몰라뵈어 죄송합니다.', next: 'c' },
    c: { speaker: '창현', portrait: 'chick_ch_beard3', text: '……저 그냥 학생으로 살고 싶어요.', next: 'd' },
    d: { speaker: '교수님', portrait: 'professor', text: '창현아, 그 수염도 잘 어울려. 아주… 학자 같아.' },
  },
  hall_chick_after: {
    start: { speaker: '창현', portrait: 'chick_ch_beard3', text: '교수님… 수염은 내일 다시 밀어 볼게요. 아마 더 자라겠지만요.', next: 'b' },
    b: { speaker: '박성대 교수님', portrait: 'prof_ps', text: '명예교수님, 이따 차 한잔 하시죠.' },
  },
  // ── 701호: 댄스 동아리 UCDC 연습실, 브레이크 댄스 추는 병아리 태진 ──
  taejin_dance: {
    start: {
      text: '쿵짝쿵짝— 음악 소리 사이로, 병아리 한 마리가 골판지 위에서 빙글빙글 돌고 있다.',
      next: 'a',
    },
    a: {
      set: { taejin_talked: true },
      speaker: '태진',
      portrait: 'chick_ty',
      text: '어?! 교수님! (헤드스핀 하다 벌떡) 이, 이건 땡땡이가 아니라… "신체 활동을 통한 창의성 연구"입니다!',
      next: 'b',
    },
    b: { speaker: '교수님', portrait: 'professor', text: '태진아, 그 연구 계획서는 언제 냈니?', next: 'c' },
    c: {
      speaker: '태진',
      portrait: 'chick_ty',
      text: '…지금 머릿속으로 쓰는 중입니다. 제목은 "헤드스핀이 두피 혈액순환과 학점에 미치는 영향".',
      next: 'd',
    },
    d: { speaker: '교수님', portrait: 'professor', text: '결론부터 말해 볼래?', next: 'e' },
    e: {
      speaker: '태진',
      portrait: 'chick_ty',
      text: '혈액순환은 좋아지는데요… 학점도 같이 돌아갑니다. 빙글빙글~',
      choices: [
        { label: 'UCDC가 뭐야?', next: 'ucdc' },
        { label: '나도 한 번 춰 볼까?', next: 'try' },
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
    ucdc3: { speaker: '교수님', portrait: 'professor', text: '복도는 걸어 다니는 곳이야.', next: 'ucdc4' },
    ucdc4: { speaker: '태진', portrait: 'chick_ty', text: '…네. 걸어서 돌겠습니다.' },
    try: { speaker: '교수님', portrait: 'professor', text: '그 빙글빙글 도는 거, 나도 한 번 해 볼까?', next: 'try2' },
    try2: {
      speaker: '태진',
      portrait: 'chick_ty',
      text: '아, 안 됩니다 교수님! 헤드스핀 하시다 머리 모양 망가지시면… 미모에 흠집이 납니다!',
      next: 'try3',
    },
    try3: {
      speaker: '태진',
      portrait: 'chick_ty',
      text: '대신 교수님께 바치는 특별 무대를 준비했습니다. 이름하여… "병아리 프리즈"!',
      next: 'try4',
    },
    try4: {
      text: '태진이 한쪽 날개로 물구나무를 선 채, 다른 날개로 허공에 나이키를 크게 그린다.',
      next: 'try5',
    },
    try5: { speaker: '교수님', portrait: 'professor', text: '…잘한다. 과제 안 낸 학생 중에서는 제일 잘해...', next: 'try6' },
    try6: { speaker: '태진', portrait: 'chick_ty', text: '감사합니다! 오늘 연습은 이걸로 A+ 받은 걸로 하겠습니다! (다시 빙글빙글)' },
  },
  // ── 703호: 체육대회 닭싸움 결승전 (교수님은 현서에게 반말) ──
  fight_intro: {
    start: { text: '703호 문을 열자 함성이 쏟아진다!\n"청군 이겨라! 백군 이겨라!"', next: 'b' },
    b: {
      text: '체육대회 닭싸움 결승전.\n병아리 현서와… 덩치가 세 배는 되어 보이는 황소 선배가 한 발로 마주 섰다.',
      next: 'c',
    },
    c: { speaker: '현서', portrait: 'chick_hs', text: '선배! 오늘은 제가 이깁니다! 작전이 다 있어요!', next: 'd' },
    d: { speaker: '황소 선배', portrait: 'bull_senior', text: '그래? 살살 할게. 진짜 살살.' },
  },
  fight_after: {
    start: { text: '쿵! …현서 병아리가 공중제비를 세 바퀴 돌아 저 멀리 대자로 떨어졌다.', next: 'b' },
    b: { text: '머리 위로 작은 별이 빙글빙글 돈다.' },
  },
  hs_fallen: {
    start: { text: '현서 병아리가 바닥에 대자로 뻗은 채 천장을 보고 있다.', next: 'a' },
    a: { speaker: '교수님', portrait: 'professor', text: '현서야, 괜찮니? 방금 엄청 멀리 날아가던데.', next: 'b', set: { hs_talked: true } },
    b: {
      speaker: '현서',
      portrait: 'chick_hs',
      text: '교수님… 저 방금 하늘을 날았어요. 병아리도 날 수 있다는 걸 오늘 처음 알았어요.',
      next: 'c',
    },
    c: { speaker: '교수님', portrait: 'professor', text: '그건 난 게 아니라 날아간 거야.', next: 'd' },
    d: { speaker: '현서', portrait: 'chick_hs', text: '…과학적으로 같은 거 아닌가요?', next: 'e' },
    e: { speaker: '교수님', portrait: 'professor', text: '착지가 다르잖아.', next: 'f' },
    f: {
      speaker: '현서',
      portrait: 'chick_hs',
      text: '작전은 완벽했어요. 선배가 무릎을 드는 순간 밑으로 파고들려고 했는데… 선배 무릎이 제 키보다 높았어요.',
      choices: [
        { label: '다음엔 이길 수 있겠어?', next: 'n1' },
        { label: '그만 일어나자', next: 'r1' },
      ],
    },
    n1: {
      speaker: '현서',
      portrait: 'chick_hs',
      text: '네! 다음 체육대회까지 피자 많이 먹고 체급 올려 오겠습니다!',
      next: 'n2',
    },
    n2: { speaker: '교수님', portrait: 'professor', text: '피자는 내가 사 줄게. 대신 과제부터 내고.', next: 'n3' },
    n3: { speaker: '현서', portrait: 'chick_hs', text: '…갑자기 다리에 힘이 하나도 없어요. 조금만 더 누워 있을게요.' },
    r1: { speaker: '교수님', portrait: 'professor', text: '그만 일어나. 손 잡아 줄게.', next: 'r2' },
    r2: {
      speaker: '현서',
      portrait: 'chick_hs',
      text: '교수님… 저 혼자서는 못 일어나요. 날개가 너무 짧아서 바닥에 안 닿아요.',
      next: 'r3',
    },
    r3: { speaker: '교수님', portrait: 'professor', text: '…그럼 조금만 더 누워 있어. 내가 여기서 응원할게. 현서 파이팅!', next: 'r4' },
    r4: { speaker: '현서', portrait: 'chick_hs', text: '(누운 채로 날개를 파닥이며) 파이팅…!' },
  },
  senior_703: {
    start: {
      speaker: '황소 선배',
      portrait: 'bull_senior',
      text: '어, 교수님 안녕하세요! 저 진짜 살짝 닿기만 했어요. 진짜예요. 깃털 하나 안 건드렸어요.',
      next: 'b',
    },
    b: { text: '저 멀리서 현서의 깃털 한 가닥이 팔랑팔랑 떨어진다.', next: 'c' },
    c: { speaker: '황소 선배', portrait: 'bull_senior', text: '…한 가닥은 건드렸네요.' },
  },
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
      next: 'letter',
    },
    letter: {
      text: '그런데 과제 더미 아래에서 편지 한 통이 툭 떨어졌다.\n봉투에는 "교수님께"라고 적혀 있다. 열어 볼까?',
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
