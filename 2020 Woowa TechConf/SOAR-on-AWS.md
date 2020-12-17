# AWS 침해대응 업무에 업무에 SOAR 한 스푼 얹기
IoC 활용 노하우와 SOAR

`SOAR`: Security Orchestration Automation and Response

## AWS 보안 감사와 탐지의 어려움

클라우드 환경의 로그를 수집해야하는데 많은 비용이 소모되며, 보안 관리자도 있어야한다. 리소스도 많아 관리하기 어렵다. 

## AWS Guardduty
: AWS 모든 리소스들의 네트워크 활동을 모니터링 하는 서비스

VPC, CloudTrail, DNS로그를 모니터링하는 하나의 툴. 워크로드에 영향을 미치지 않고 가용성에 영향을 미치지 않는 서비스임.

다만 사용자 정의 서비스를 추가할 수는 없다.

## 공격 수법 파헤치기

네트워크 공격 수법을 파헤치기 위해서는 **아웃바운드 로그**가 중요하다. 네트워크 공격 패킷들은 공격 스크립트를 다운받는 등의 네트워크 행위를 하는 특성을 가진다. 이 때 해당 데이터를 얻기위한 명령 제어 서버의 IP주소를 얻을 수 있는데, 방어 측에서는 이 IP를 **threat list**에 추가하여 공격을 방지할 수 있다.

Indicate of Compromise, 침해 지표 혹은 `IoC`를 기반으로 한 대응 방식을 사용하는데, 공격측에서도 이를 이용한 방어 방법을 알고 있으므로 IoC정보는 시간이 갈 수록 가치가 떨어진다는 특성을 지닌다. 즉, 침해 대응팀은 실시간으로 공격자들이 사용하는 IoC정보를 빠르게 추출하고 업데이트 해주는게 핵심이다.

참고로 공격자는 여러 PC들을 공격할 때 공격마다 일정한 시간의 텀이 있다. 만약 A서버에서 공격을 당하고 Guardduty에 threat list에 등록을 했다면, B 서버에는 이 threat list를 A 서버와 동일하게 업데이트 할 필요가 있다.

이를 SOAR모델을 적용했고 Ansible playbook으로 만들어 자동화했다. 만약 실시간성을 생각한다면 AWS Lambda가 더 좋을 수 있으므로 참고 바람.