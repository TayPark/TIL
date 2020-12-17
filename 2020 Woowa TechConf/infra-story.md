# 나만 알고싶은 우아한 형제들 인프라 스토리

## 퍼블릭 클라우드

이전에는 한 계정에 모든 서비스를 다 올렸다. 현재는 약 40개 계정에 600개 정도의 서비스를 운영하고있다.

멀티 어카운트 전략은
1. 비용 관리
2. 권한 제어
3. 서비스 가용성
4. 유연성

측면에서 유용하다.

## Transit Gateway

서비스 트래픽을 Peering으로, 기타 트래픽을 TGW(Hub & Spoke)방식으로 구현하였다.

## Authentication

1. 웹 콘솔 및 SSH 사용자 접근은 Keycloak 및 Security GW로 인가한다. 
2. 터미널 서비스 접근시 MFA를 강제하고있다.
3. SCP를 통해 권한을 제어하고있다.

## IaC(Infrastructure as Code)

클라우드 인프라의 표준화가 필요했고 시스템 자동화가 요구되었다. 그러므로 IaC를 적용했다.

오픈소스인 `Terraform`과 `Atlantis`(Terraform PR automation tool)로 사용중. 

## Hub Location

네트워크가 Full mesh 형태였다. IDC 기반으로 private network hub를 추가하여 네트워크의 쉬운 스케일링을 가능케 하였다. 

## Fintech in Cloud

Keycloak, IAM, LDAP으로 핀테크 도메인별 어카운트를 분리하고 사용자 그룹별로 권한을 분리하여 운영한다.

## 앞으로 고민

- 멀티 클라우드 고민
  - 퍼블릭 멀티 클라우드 도입시 인프라 환경 제공
  - 로케이션 간 오버레이를 통한 extended-VM 으로 더 좋은 서비스 품질 제공 예정
  - 변화하는 개발 환경에 맞게 유연하고 안정적인 인프라 환경 지원