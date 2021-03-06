# 배달의민족 마이크로 서비스 여행기

## 2015년
- MSSQL + PHP, ASP
- 대부분 루비DB(MSSQL) 스토어드 프로시저 방식 사용
- 루비DB 장애시 전체 서비스 장애

## 2016년
- 자바 언어로 변경 - 대용량 트래픽에 강하고 개발자 수급에 용이
- **마이크로서비스 시작**
- 결제(자바), 주문 중계(노드) 독립
- IDC에서 AWS로 이전 시작

## 치킨 디도스 사건

2016년 여름, 선착순 5만명에게 치킨 7천원 쿠폰을 뿌리는 날이 있었다. 4일동안 진행되었는데, 시스템들이 모두 IDC에 있었다.

1일차: 트래픽을 버티지 못하고 프론트 서버가 죽어버린다. 2일차 넘어가는 새벽에 프론트 서버 100대를 AWS로 이전한다.
2일차: 이번엔 주문 서비스가 죽는다. 3일차 넘어가는 새벽에 주문 서버도 AWS로 올린다. 
3일차: 결제는 서버가 워낙 고성능이었어서 문제가 되지 않았다. 다만 결제까지 완료가 되었는데 대용량 트래픽을 감당하지 못한 **PG사가 죽어버린다.**
4일차: 성공

## 2017년
- 메뉴, 정산, 가게 목록 시스템 독립
- 트래픽은 늘어나는데 시스템이 레거시라 스케일이 불가능했다. 
- 가게목록 + 검색을 AWS 엘라스틱서치로 빼낸다.

## 2018년
- 오프라인 모드(서버가 죽어도 전화주문은 가능하도록) 추가
- 시스템 장애 최소화가 1순위
- 가게 상세를 분리
- 주문을 이벤트 기반 아키텍처로 구성한다. 

커머스 서비스에서 `주문`은 모든 서비스들과 연관되어있다. 연관된 서비스 들 중 하나가 에러가 나면 전체 서비스에게 영향을 줄 수 있다. 그러므로 주문 하나하나를 메시지 기반의 이벤트로 아키텍처를 바꾸고, 이를 발행하여 연관 시스템들이 `Pub/Sub`하는 방식으로 바꾼다. 이렇게되면 한 서비스가 죽었다 다시 살아나도 기존의 Queue에서 메시지를 다시 Consume하면 정상적으로 동작하며, 다른 서비스들에게는 영향을 주지 않는다. 또한 새로운 서비스가 생겨도 MessageQueue에 붙이기만 하면 된다.

주문을 마이크로 서비스로 나누고 아키텍처를 새로 구성한 후에는 에러가 굉장히 많이 줄었다고 한다.

## 먼데이 프로젝트

API 호출로 아키텍처를 구성하다보니 **연쇄적인 장애가 발생할 가능성**이 있었다. 또한 배달의 민족의 이벤트로 트래픽이 폭증하면, 이 트래픽 또한 모든 API를 호출하는 곳에서도 트래픽을 받게된다.(트래픽 연쇄)

그러므로 아래의 요구사항을 만족하는 아키텍처를 구성해야했다.

1. 성능
  - 대용량 트래픽 대응
  - 15,000 rps 이상
2. 장애 격리
  - 장애가 발생해도 해당 서비스만 장애가 발생하고 다른 곳에 전파가 되지는 않아야 함
3. 데이터 싱크
  - 데이터가 분산되어있을 때 싱크를 맞추는 방법 

## CQRS(Command and Query Responsibility Segregation)

- [gregyoung](http://codebetter.com/gregyoung/2010/02/16/cqrs-task-based-uis-event-sourcing-agh/)
- [CQRS](https://martinfowler.com/bliki/CQRS.html#:~:text=CQRS%20stands%20for%20Command%20Query,you%20use%20to%20read%20information.)

gregyoung이 처음 설명한 패턴이다. 정보를 쓰는 `Command` 시스템, 정보를 읽는 `Query` 시스템을 분리하여 사용하는 개념이다. 

CQRS는 다른 아키텍처 패턴과 자연스럽게 어울린다.
- CRUD를 통해 상호작용하는 단일 표현에서 벗어나 작업 기반 UI로 쉽게 이동할 수 있다.
- CQRS는 **이벤트 기반 프로그래밍 모델에 적합**하다. CQRS 시스템이 이벤트 소싱과 통신하는 별도로 서비스로 분할되는 것이 일반적이다.
- CQRS는 복잡한 도메인에 적합하며 `DDD(Domain Driven Design)`의 이점도 제공
  - 다만 BoundedContext 에서만 사용해야한다.

장점으로는
1. 복잡한 도메인을 쉽게 해결할 수 있다. 다만 CQRS의 적합성은 매우 소수이다.
2. 고성능 애플리케이션을 처리하는 것이다. 읽기/쓰기가 독립적이므로 확장이 가능하다. 또한 읽기/쓰기마다 최적화 전략을 적용할 수 있다. 

이런 장점에도 불구하고 도입할 때 굉장히 조심해야한다. 정보에 대해 write operation을 수행하며 read를 수행하는 시스템에서는 복잡성만 증대시킬 수 있다.

## 그래서?
이벤트 소싱으로 아키텍처를 바꾼다. AWS SQS 모델로 이벤트를 전파하는 형식으로 바꾼다.

- 문제 발생시 해당 시스템이 이벤트만 재발행
- 대부분 Zero-Payload 방식 사용
  - 이벤트에 식별자와 최소한의 정보만 담음
  - 순서를 고려하지 않고 데이터를 경량화
  - 데이터가 필요한 경우에는 해당 식별자로 API를 요청
- 최소 데이터 보관 원칙
- 데이터 싱크 장애 대응
  - 이벤트 재발행
  - 큐 장애 발생
    - 전체 IMPORT API 제공
    - 부분 IMPORT API 제공
      - 최근 업데이트 데이터를 분 단위로 부분 제공
- 서킷 브레이커
- 비동기 논블로킹(스프링 웹플럭스, 리액터)

## 정리

- 배달의 민족은 거대한 CQRS
- 성능이 중요한 외부 시스템와 비즈니스 명령이 많은 내부 시스템으로 분리
- 이벤트 발행을 통한 Eventually Consistency(최종적 일관성)
- 각 시스템은 API 또는 이벤트 방식으로 연동

## 꼭 MSA를 해야하나요?

규모의 경제가 가능해야한다. 서비스의 경제성, 개발자 수급, 트래픽이 어느정도 맞아야한다.