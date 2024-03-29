# EFS(Elastic File System)
- 네트워크 파일 시스템(NFS v4)를 사용하는 파일 스토리지 서비스
- **VPC 내에서 생성**되며, 파일 시스템 인터페이스를 통해 EC2에 액세스
- 수천 개의 EC2에서 동시에 액세스 가능하며, 탄력적으로 파일을 추가하고 삭제함에 따라 자동으로 Auto Scaling 가능
  - 미리 프로비저닝 할 필요 없음
- PB단위 데이터까지 확장 가능
- 최대 1천개 파일 시스템 생성 가능
- 가용성
  - 여러 AZ에서 액세스 가능
  - 여러 AZ에서 중복 저장
  - IPSec VPN 또는 Direct Connect를 통해 온프레미스에서 접속 가능
- 성능/처리량 모드
  - 성능 모드에 있어서 대부분의 파일시스템에 Bursting Mode를 권장하지만 처리량이 많을 경우 Provisioned Mode 권장
  - 처리량 모드에 있어 액세스 하는 EC2가 많을 경우, MAX I/O Mode를 사용하는 것이 바람직(다만, 지연 시간 증가)
  - 그 밖의 경우 General Mode 권장
- 수명 주기 관리
  - 스토리지 클래스와 관련된 서비스로 사용자가 지정한 일정 기간동안 액세스하지 않은 파일을 Infrequent Access Class로 옮길 수 있도록 하는 기능
- 파일 시스템 정책
  - EFS를 사용하는 모든 NFS 클라이언트들에게 적용되는 IAM 리소스 정책
  - 전송 중 암호화, 루트 액세스 비활성화, 읽기 전용 액세스 등 설정 가능