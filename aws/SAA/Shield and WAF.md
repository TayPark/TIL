# AWS Shield and WAF

`Shield`
- DDos로부터 웹 애플리케이션을 보호하는 서비스
- 두 가지 유형으로 나뉨
  - Standard
    - 기본적으로 적용
  - Advanced
    - 추가 비용을 지불, L7 트래픽 모니터링, 사후 분석 등 제공
  - Cloudfront와 통합되어 있기 때문에 AWS 서비스가 아니더라도 Cloudfront의 origin이라면 보호 가능

`WAF(Web Application Firewall)`
- Cloudfront와 ALB를 통해 웹 방화벽 서비스 제공
  - 웹 방화벽: 방화벽은 L3/L4 방어. 웹 방화벽은 L7(HTTP 헤더, HTTP 바디, URI, SQL, 스크립팅 등)을 이용한 공격을 방어
- 다양한 종류의 웹 공격에 대한 정보를 지닌 Rule을 선택하여 활성화
- IP 블랙리스트 기능