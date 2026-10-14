# DevOps 관점에서 본 마이크로서비스로의 여정

[영상](https://www.youtube.com/watch?v=xtiC8-SYmBg&list=PL42XJKPNDepZbqM9N11RxL5UY_5PbA_Wo&index=25&t=15s&ab_channel=TOAST)

NHN Commerce Platform에서 모놀리식 레거시를 MSA로 전환한 여정을 소개한다.

| 구분 | 모놀리식 | 마이크로 서비스 |
| --- | --- | --- |
| 저장소 | 하나의 저장소 | 업무별 저장소(14개) |
| 추가된 업무 | 저장소 내 모듈 추가 | 저장소 추가 | 
| 사용 언어 | Java | Kotlin |
| 프레임워크 | Spring MVC | Spring Cloud |
| 서버 환경 | Host에서 직접 서비스 | Docker |
|  | OpenJDK + Tomcat + Spring Boot | Docker + Netty + Spring(+Spring Boot) |

## DevOps

`DevOps`는 개발과 운영의 합성어이다. 개발부터 운영까지를 큰 틀로 묶고, 관련자들의 소통과 협업을 강조하는 개발 문화를 칭한다. 배포, 운영, 모니터링이 유기적으로 진행될 수 있도록 돕고 `Infrastructure as Code`를 모토로 자동화를 지원하는 역할을 한다.

Config server, Gateway server, Jenkins pipeline script, Provisioning, CI/CD process 등을 개발하며 컨테이너 관리, API 문서화, 배포 자동화, 모니터링 등을 한다.

### Strangler Pattern?
프록시를 사용하여 레거시와 MSA를 공존하게 한 후, 조금씩 레거시를 걷어내는 방식이다.

## 프록시
NGINX를 프록시로 사용했다. Strangler Pattern을 만족하기위해, NGINX config 중 routing 옵션을 MSA 개발 속도에 따라 부분적으로 사용하였고 MSA가 정상적으로 동작하면 레거시를 `@deprecated` 애너테이션을 붙여 삭제하는 방식을 따른다.

## Ansible
Ansible을 사용하면 콘솔에 접속하지 않고 애플리케이션의 배포와 웹 서버의 재기동이 가능하다. 또한 `inventory`를 사용하여 단계별 환경을 나누어서 사용했다.

발표자는 Ansible을 다음의 용도로 사용했다.

1. 빌드 파일 배포
2. 보안 패치 적용
3. 미들웨어 버전 업그레이드
4. SSL 인증서 갱신
5. MySQL - Python을 활용한 동적 인벤토리 구성

## Jenkins
`Groovy`, `scripted pipeline`을 사용했다. 특히 scripted pipeline은 원하는 로직을 자유롭게 구현하여 사용한다.

## 모니터링
MSA로 전환함에 따라 모니터링 할 것들이 많이 생겼다. 이를 어떻게 모니터링 하고 있는지 알아본다.

**Nginx 로그**를 `fluentd` -> `elasticsearch` -> `Grafana` 를 사용하여 모니터링 하고있다. 요청별 최대 응답 시간이 기준치를 초과하면 알람이 오도록 설정하여 모니터링 하고있다.

**애플리케이션은 로그**를 stdout로 내보내면 `Grafana loki` 플러그인이 이를 수집한다. 이 또한 Grafana로 도식화한다.

**미들웨어**는 `Prometheus Exporter`를 사용한다. 

애플리케이션이 동작하는 **머신의 모니터링** 또한 `Prometheus Node Exporter`를 사용한다. CPU, RAM, NIO, DISK 사용량을 확인할 수 있다.

**도커 컨테이너**는 `cAdvisor`를 사용한다. 컨테이너 수, 컨테이너 별 CPU 사용률, 컨테이너 별 메모리 사용율을 확인할 수 있다.

