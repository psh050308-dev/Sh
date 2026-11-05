# wiw 아지트 출석부

친구들끼리 쓰는 아지트 출석부 웹사이트예요. 구글로 로그인해서 캐릭터를 만들고, 3D 아지트 방을 돌아다니다가 방 안의 출석부를 열 수 있어요. 아지트에 도착하면 폰 위치로 자동 체크인되고 그날 출석 도장이 찍혀요.

| 파일 | 내용 |
| --- | --- |
| `index.html` | 출석부 사이트 본체 (로그인, 캐릭터 만들기, 위치 체크인, 손글씨 달력 출석부, 그림/코멘트) |
| `room.html` | 3D 아지트 방 (three.js). 단독으로 열어도 되고, `index.html` 안에서는 `room.html?embed=1`로 열려요 |
| `look.js` | 캐릭터 모양 정의 (색, 머리 모양, 옷 종류). `index.html`과 `room.html`이 같이 써요 |
| `firestore.rules` | Firestore 보안 규칙 |

빌드 과정은 없어요. 정적 파일 그대로 올리면 돼요.

## 데모로 미리 보기

`index.html`의 `AZIT_CONFIG.firebase.apiKey`가 `YOUR_...` 그대로면 **데모 모드**로 돌아가요 (예시 친구 + 위치 시뮬레이션).

```bash
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000
```

`index.html`을 파일로 바로 열면(`file://`) 3D 방 iframe과 postMessage가 막힐 수 있으니 꼭 로컬 서버로 열어 주세요.

## 실제로 켜기 (Firebase)

1. [Firebase 콘솔](https://console.firebase.google.com)에서 프로젝트를 만들어요.
2. **Authentication → 로그인 방법**에서 **Google**을 켜요.
3. **Firestore Database**를 만들고, **규칙** 탭에 `firestore.rules` 내용을 붙여넣고 게시해요.
4. **프로젝트 설정 → 내 앱 → 웹 앱 추가** 후 나오는 `firebaseConfig` 값을 `index.html`의 `AZIT_CONFIG.firebase`에 넣어요.
5. **아지트 위치 넣기**: Firestore에서 `settings` 컬렉션 → 문서 ID `agit` → 필드 `lat`(number, 위도), `lng`(number, 경도)를 넣어요. 구글 지도에서 아지트를 길게 누르면 좌표가 나와요. 도착 반경을 바꾸려면 `radius`(number, m)도 넣어요 (기본 80). 위치는 코드에 넣지 않아서 저장소가 공개여도 멤버만 볼 수 있어요.
6. **초대 코드 정하기**: Firestore에서 `config` 컬렉션 → 문서 ID `invite` → 필드 `code`(string)에 초대 코드를 넣어요. 처음 로그인한 친구는 이 코드를 한 번 입력하면 자동으로 `members/{구글 이메일}`에 등록돼요. 코드를 바꾸면 그다음부터 새로 들어오는 사람만 새 코드를 써야 하고, 이미 멤버인 사람은 그대로예요. `members`에 이메일 문서를 직접 추가해도 멤버가 돼요.
7. 사이트를 배포해요 (GitHub Pages, Firebase Hosting, Netlify 등 아무 정적 호스팅).
8. **Authentication → 설정 → 승인된 도메인**에 배포한 주소의 도메인을 추가해요. 빠뜨리면 로그인할 때 `auth/unauthorized-domain` 오류가 나요.

### GitHub Pages로 배포

저장소 **Settings → Pages**에서 브랜치와 루트(`/`) 폴더를 고르면 `https://<아이디>.github.io/<저장소>/`로 열려요. 그 도메인(`<아이디>.github.io`)을 8번 승인된 도메인에 추가하세요.

### Firebase Hosting (https://wiw-agit.web.app)

`firebase.json`과 `.github/workflows/firebase-hosting.yml`로, 이 브랜치에 푸시하면 자동으로 배포돼요.

1. Firebase 콘솔 → **Hosting** → 시작하기 → **다른 사이트 추가**에서 사이트 ID `wiw-agit`을 만들어요.
2. Firebase 콘솔 → 프로젝트 설정 → **서비스 계정** → **새 비공개 키 생성**으로 JSON 키를 받아요.
3. GitHub 저장소 → Settings → **Secrets and variables → Actions** → New repository secret: 이름 `FIREBASE_SERVICE_ACCOUNT`, 값은 JSON 파일 내용 전체.
4. Authentication → 설정 → 승인된 도메인에 `wiw-agit.web.app`을 추가해요.
5. GitHub 저장소 → **Actions** 탭에서 "Firebase Hosting 배포"를 실행하거나 아무 커밋이나 푸시하면 배포돼요.

## 데이터 구조 (Firestore)

| 컬렉션 / 문서 ID | 내용 | 쓰기 권한 |
| --- | --- | --- |
| `settings/agit` | 아지트 위치 (`lat`, `lng`, 선택: `radius`, `exitMargin`) — 멤버만 읽어요 | 콘솔에서만 |
| `config/invite` | 초대 코드 (`code`) — 아무도 읽을 수 없어요 | 콘솔에서만 |
| `members/{이메일}` | 멤버 명단 | 초대 코드가 맞을 때 본인 등록, 또는 콘솔 |
| `villagers/{uid}` | 이름, 캐릭터 모양, 아지트에 있는지(`here`, `since`, `seen`) | 본인 |
| `attendance/{yyyy-mm-dd}_{uid}` | 출석 도장 (`first`, `last`) | 본인, 오늘 것만 |
| `days/{uid}_{yyyymmdd}` | 그날 칸 그림 (data URL, 최대 190000자) | 본인, 오늘 것만 |
| `comments/{주인uid}_{yyyymmdd}_{id}` | 그날 칸 코멘트 (최대 200자) | 멤버 누구나, 오늘 것만 |

"오늘"은 한국 시간 기준이에요. 정확한 위치 좌표는 저장하지 않고, 아지트 안/밖 여부와 시각만 저장해요.

## 자동 체크인 주소

- `https://(사이트 주소)/?checkin` — 도착할 때
- `https://(사이트 주소)/?checkout` — 떠날 때

문 앞 NFC 스티커/QR이나 폰 위치 자동화(아이폰 단축어, 갤럭시 모드 및 루틴)에 넣어 쓰면 돼요. 자세한 방법은 사이트의 "나 → 더 자동으로"에 있어요.
