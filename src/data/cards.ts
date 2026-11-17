import type { CardOptions } from '../ui/overlays';

/**
 * 이미지 카드 데이터 (책, 사진, 선물).
 *
 * 실제 사진을 쓰려면 `public/images/` 폴더에 아래 이름으로 파일을 넣으면 된다. (파일이 없으면 도트 그림으로 대신 보여줌)
 *   - public/images/book.jpg     교수님 책 표지 (책장 > 저서 발견)
 *   - public/images/sports.jpg   체육대회의 추억 4컷 만화 (책장)
 *   - public/images/wedding.jpg  교수님과 찍은 결혼식 사진
 *   - public/images/gift.png     실제 선물 사진 (보물상자 속)
 * 문구는 모두 임시이며 현서님이 실제 이야기로 바꾼다.
 */
export const CARDS: Record<string, CardOptions> = {
  // 책장 > 교수님의 저서 발견 (3장면)
  book_found: {
    src: 'images/book.jpg',
    kind: 'book',
    caption: '[전설의 레어템 발견!]',
    text: '디지털 게임이란 무엇인가\n전경란 · 커뮤니케이션북스 · 2014',
    button: '책 펼치기',
  },
  book_open: {
    hideMedia: true,
    text: '게임은 단순히 보는 이야기가 아니다.\n플레이어는 게임 속 공간을 탐색하고,\n선택하고, 상호작용하며 이야기를 경험한다.\n그리고 가상의 공간에서 일어난 경험은\n현실의 삶과도 연결될 수 있다.\n\n※ 도서 내용을 바탕으로 재구성한 요약입니다.',
    button: '다음',
  },
  book_end: {
    hideMedia: true,
    text: '혹시 내가...\n게임 속에 있는건 아니겠지? 기분 탓이겠지!',
    button: '닫기',
  },
  // 학과 게시판에 붙어 있는 쪽지
  board_note: {
    note: true,
    hideMedia: true,
    text: '총장님 취임 축하드립니다.\n제 담당교수님이 총장님이 되니\n동의인으로서 더 자랑스럽습니다!\n\n- 06학번 태진 -',
  },
  board_note_changhyun: {
    note: true,
    hideMedia: true,
    text: '교수님, 총장님 되신 것 정말 축하드립니다!\n제자로서 너무 자랑스럽고 든든합니다.\n앞으로 학교를 이끌어가시느라 많이 바빠지시겠지만,\n늘 건강 챙기시면서 승승장구하시길\n마음 깊이 응원하겠습니다.\n\n- 06 창현 -',
  },
  board_note_hyeyoung: {
    note: true,
    hideMedia: true,
    text: '교수님, 안녕하세요\n11학번 김혜영입니다\n총장님이 되셨다는 소식을 들었어요!\n진심으로 축하드립니다\n항상 학생들에게 늘 따뜻하시고,\n웃는 모습이셨던 교수님 ❤️❤️❤️\n덕분에 저 또한 많이 배우고 성장했습니다\n\n앞으로 학교를 이끌어가실\n교수님의 새로운 시작을 응원하겠습니다!\n\n- 11학번 혜영 -',
  },
  board_note_jiun: {
    note: true,
    hideMedia: true,
    text: '교수님!\n총장 취임을 진심으로 축하드립니다!\n그동안의 노력과 헌신이 맺은 값진 결실이란\n생각이 드니 가슴이 벅차오릅니다 ㅠㅠ\n탁월한 리더십으로 교수님의 뜻과 비전을\n멋지게 펼쳐주세요!!\n\n새로운 중책을 맡으신 만큼 건강도 잘 챙기시고,\n하루하루가 소중하고 행복으로 가득하시기를\n누구보다 진심으로 응원하겠습니다!\n\n- 07 지운 -',
  },
  board_note_seunghong: {
    note: true,
    hideMedia: true,
    text: '한결같은 미모에 더 멋있어진 교수님!!\n시간은 제가 다 먹었나 봐요 ㅠㅠ\n\n총장님 되신 거 정말 정말 축하드립니다!!\n신설 학과 교수님으로 오셔서\n총장님이 되시기까지 ㅎㅎ\n교수님이 알려주신 영웅의 여정 12단계를\n적용하니 영화 한 편이 되는 것 같습니다 ㅎㅎ\n\n교수님, 원하시는 것 모~~두 이루시고\n더 승승장구하시고 항상 건강하시고\n행복한 일만 가득하세요~!!\n\n- 06 승홍 -',
  },
  board_note_sueon: {
    note: true,
    hideMedia: true,
    text: '전경란 교수님~\n우리 교수님이 총장님이 되셨다니!!\n너무너무 축하드립니다!!\n\n대학 시절 늘 따뜻하게 대해주시던\n교수님 모습이 아직도 생생한데,\n이렇게 멋진 소식을 들으니\n정말 반갑고 기분이 좋아요.\n\n앞으로도 교수님의 따뜻함과 멋진 리더십으로\n학교를 잘 이끌어주시리라 믿어요!\n항상 건강하시고 행복한 일들만 가득하시길 바랄게요.\n언제나 교수님을 응원할게요!\n\n교수님, 다시 한번 정말 축하드려요! ❤️\n\n- 06 수언 -',
  },
  board_note_chick: {
    note: true,
    hideMedia: true,
    text: '교수님~ 20년째 그대로이신 미모!\n혹시 시간을 되돌리는 비결이 있나요?\n저도 나이 좀 거꾸로 먹고 싶어요 ㅠㅠ\n(비법 전수 받으면 병아리들끼리만 공유할게요)\n\n- 어려 보이고 싶은 병아리 -',
  },
  // 702호 책상 위 편지 (과제를 다 읽으면 나타난다)
  letter_hyeonseo: {
    note: true,
    hideMedia: true,
    text: '교수님께\n\n과제를 제출하는 날이면 늘 설레곤 했어요.\n교수님의 빨간 글씨로 돌아올 답장을 기다렸거든요.\n졸업 후에도 마음이 지치는 날이면\n서랍 깊숙이 넣어둔 과제를 꺼내 보곤 했어요.\n교수님은 과제에 몇 줄의 글을 남기셨지만,\n저는 그 글에 기대어 다시 힘을 내곤 했어요.\n교수님께 받은 따뜻함을\n저도 조금씩 나누며 살아가고 있어요.\n\n— 06 금희였던 현서 드림',
  },
  // 산학협력관 복도 포스터 3장
  poster_dicon: {
    poster: '#ffd84a',
    hideMedia: true,
    caption: 'Enjoy DICON',
    text: '제 1회 개강총회',
  },
  poster_3d: {
    poster: '#5b8fe0',
    hideMedia: true,
    caption: '3D 영상 공모전',
    text: '문의  손국환 교수님',
  },
  poster_motion: {
    poster: '#7a52b8',
    hideMedia: true,
    caption: '모션 그래픽 동아리\n인원 모집',
    text: '문의  박성대 교수님',
  },
  // 702호 이상한 달력 (4장): 페이지를 넘길 때마다 종이 넘김 효과
  cal_2006: { calendar: true, hideMedia: true, caption: '2006', button: '다음 장' },
  cal_2014: { calendar: true, hideMedia: true, caption: '2014', button: '다음 장' },
  cal_2026: { calendar: true, hideMedia: true, caption: '2026', button: '다음 장' },
  cal_end: { calendar: true, hideMedia: true, text: '그다음 페이지는\n아직 쓰이지 않았다.', button: '닫기' },
  // 703호 닭싸움 대진표
  bracket_703: {
    note: true,
    hideMedia: true,
    text: '[체육대회 닭싸움 대진표]\n\n결승전\n병아리급 노현서 vs 헤비급 황소 선배\n\n※ 체급 차이는 열정으로 극복합니다 (아마도)',
  },
  // 701호 UCDC 연습실 포스터
  poster_ucdc: {
    poster: '#c9a0ff',
    hideMedia: true,
    caption: 'UCDC\n정기 공연',
    text: '신입 부원 모집 중!\n연습: 매일 밤 9시 · 산학협력관 701호\n"춤은 몰라도 돼요. 박자는 저희가 맞춰 드립니다."',
  },
  wedding: {
    src: 'images/wedding.jpg',
    kind: 'wedding',
    caption: '교수님과 찍은 결혼식 사진',
    text: '아내가 교수님 이야기를 할 때면 눈빛이 달라집니다.\n그런 스승을 만난 아내가 참 부럽습니다.\n\n저희 부부의 새 출발을 주례로 축복해 주셔서\n늘 감사한 마음입니다.\n그 가르침이 지금 저희 가정에도 이어지고 있습니다.\n존경과 감사의 마음을 담아 인사드립니다.\n\n- 순원 드림',
    placeholder: 'public/images/wedding.jpg 에 결혼식 사진을 넣어 주세요',
  },
  gift: {
    src: 'images/gift.png',
    kind: 'gift',
    caption: '보물상자 속 선물',
    text: '상자 안에서 따뜻한 빛과 함께 선물이 나타났다!',
    placeholder: 'public/images/gift.png 에 실제 선물 사진을 넣어 주세요',
  },
};
