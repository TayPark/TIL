# Route 53

- AWS DNS 서비스
  - **도메인 등록**
  - **DNS 라우팅**
  - **DNS 헬스 체크**
- 도메인 등록시 12,000원 정도를 지불, 최대 3일 소요
- **엄격한 SLA의 경우 Global Accelerator 사용 고려**
- 해당 도메인을 AWS 서비스와 연결할 수 있고 AWS 외 요소와 연결도 가능
- 도메인 생성 후 레코드 세트를 생성하여 서브 도메인 등록 가능
- 레코드 세트 등록시에는 IP 주소, 도메인, Alias 등을 지정하여 쿼리 라우팅 가능
- 라우팅 정책
  - Simple: 동일 레코드 내의 다수 IP를 지정하여 라우팅. 값을 다수 지정한 경우 무작위 반환(RR algorithm)
  - Weighted: 리전별 부하 분산. 각 가중치를 가진 동일한 이름의 A 레코드를 만들어 IP를 다르게 줌(Weighted RR)
  - LBR(Latency-based): 지연시간이 가장 적은 리전으로 쿼리 요청
  - Failover: A/S 설정에서 사용. Main과 DR로 나누어 Main 장애시 DR로 쿼리
  - Geolocation: 지역을 기반으로 가까운 리전으로 쿼리 수행. 레코드 생성시 지역을 지정할 수 있음
  - Geo-proximity: Traffic flow를 이용한 사용자 정의 DNS 쿼리 생성 가능
  - Multi-value answer: 다수의 IP를 지정하는 것을 simple과 비슷하지만 헬스체크 가능(실패시 자동 failover)
- Alias
  - AWS 리소스는 도메인으로 이루어져 있는데, 이 도메인을 쿼리 대상으로 지정할 수 있도록 하는 기능
  - Route 53에서 별칭 레코드에 대한 DNS 쿼리를 받으면 다음 리소스로 응답
    - Cloudfront Distribution
    - ELB
    - 웹사이트 정적 호스팅이 가능한 S3
    - Elastic Beanstalk
    - VPC Interface Endpoint
    - 동일한 호스팅 영역의 다른 Route 53 레코드
