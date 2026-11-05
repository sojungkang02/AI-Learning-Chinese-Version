# Render에서 데모 열기

## 자동 설정으로 배포

1. Render 대시보드에서 **New → Blueprint**를 선택합니다.
2. `sojungkang02/AI-Learning-Chinese-Version` 저장소를 연결합니다.
3. 브랜치는 `main`, Blueprint 파일은 `render.yaml`을 사용합니다.
4. 서비스가 **Free**인지 확인한 후 배포를 시작합니다.
5. 상태가 **Live**가 되면 서비스 상단의 `.onrender.com` 주소를 엽니다.

이 저장소는 무료 Web Service 하나만 선언합니다. AI API Key나 유료 데이터베이스를 추가할 필요가 없습니다. Render 화면의 버튼 명칭은 변경될 수 있습니다.

## Web Service를 이미 만들었다면

**Settings**에서 다음 값을 입력하고 저장한 뒤 **Manual Deploy → Deploy latest commit**을 선택합니다.

| 항목 | 값 |
| --- | --- |
| Branch | `main` |
| Root Directory | 비워 두기 |
| Runtime | Node |
| Build Command | `npm ci --include=dev && npm run build` |
| Start Command | `npm run db:seed && npm start` |
| Health Check Path | `/api/health` |
| Instance Type | Free |

**Environment**에 다음 비밀이 아닌 변수를 설정합니다.

```text
NODE_VERSION=24.19.0
NODE_ENV=production
LLM_PROVIDER=mock
DATA_DIR=/tmp/comiclingo
```

Render가 제공하는 `PORT`를 Next.js가 사용합니다. 별도로 3000으로 고정하지 마세요.

## 무료 데모의 저장 제한

SQLite는 서버의 로컬 파일에 저장됩니다. Free 서비스에서는 재시작·재배포 등으로 이 파일이 사라질 수 있으므로 실제 학습 기록의 영구 보관 용도로 사용하지 마세요. 무료 서비스의 유휴 정지 후 첫 접속에는 시간이 걸릴 수 있습니다.

기록 보관이 필요하면 사용자가 직접 유료 영구 디스크를 추가하고, 디스크 마운트 경로 아래로 DATA_DIR를 변경해야 합니다. 이 설정은 유료 자원을 자동 생성하지 않습니다.

## 확인

- 공개 주소 접속 시 학습 공간이 표시됩니다.
- `/api/health` 요청이 `{"status":"ok"}`를 반환합니다.
- API Key 없이 만화 생성 → 측정 퀴즈 → 반려동물 포인트 교환을 진행할 수 있습니다.
- 외부 배포가 성공한 것은 Render가 **Live**를 표시하고 실제 공개 주소의 요청이 성공한 뒤 확인됩니다. 로컬 빌드 성공이나 GitHub 업로드만으로 배포가 완료되지는 않습니다.
