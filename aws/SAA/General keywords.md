# 글로벌 키워드

- `Region`
  - 다수의 AZ로 구성된 IDC의 집합
  - 한 곳의 AZ가 기능 불가하더라도 다른 AZ가 기능을 수행
  - 전 세계 주요 대도시에 분포
  - AWS 사용자는 각 Region마다 별도의 클라우드 망을 구성할 수 있음
- `Availability Zone(AZ)`
  - 가용 영역이라고 불리며, IDC의 역할을 함
  - 각 Region마다 보통 3~4개의 AZ가 존재
  - 하나가 기능하지 않아도 다른 AZ가 수행
  - **네트워크 구성에서 하나의 서브넷은 하나의 AZ를 의미**
- `On-premise`
  - 클라우드 방식이 아닌 자체적으로 보유한 전산실과 같은 인프라를 의미
- `Edge Location`
  - CDN 서비스인 Cloudfront가 사용하는 캐시서버
  - 전세계에 분포되어 있으며, Edge Location끼리 데이터를 공유
- `Elasticity`, `Scalability`
  - 탄력성은 단시간에 요구에 따라 사용량을 늘리거나 줄이는 것을 의미(Scale out)
  - 확장성은 장기적인 관점, 즉 아키텍처적인 관점에서 예상치를 충분히 감당할 수 있는 리소스를 보유하는 것을 의미(Scale up)

