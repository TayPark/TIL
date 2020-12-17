# Refactoring

[영상](https://www.youtube.com/watch?v=vwgNI9w_bsQ&list=PL42XJKPNDepZbqM9N11RxL5UY_5PbA_Wo&index=23&ab_channel=TOAST)

이론과 현실은 다르다. 완벽한 이론을 바탕으로 구현을 한다고 해도, 요구사항의 변경과 각종 이슈들로 인해 결과물은 좋지 않기 마련이다. 

## 클레임 도메인

하나의 요구사항을 정확히 할 필요가 있다. `클레임`은 주문에 대한 변경이다.

스냅샷 기준이다. 주문 시점의 금액을 기준으로 계산한다. 

## 모으다에서 나누다로
: 각 도메인을 분리한다.

계산성 코드는 util로 뽑아서 사용하고, 도메인별로 구현체를 나눠서 구현했다. 각 도메인은 공통적인 Abstract가 있고, 이를 일반화해서 사용한다.

## 철저하게 헥사고날 아키텍처 구현
: 모듈들의 결합도를 낮추기 위한 노력

이전에는 모놀로식 애플리케이션이었고, 순환 참조가 발생하는 구조(클레임-쿠폰-페이먼트-오더-쿠폰-...)를 가졌다. 모듈간 종속성이 강하게 잡혀있어, 한 모듈을 수정하고자 할 때는 손이 많이 갔었다.

Presentation 레이어는 Application 레이어를 참조할 수 있고, Application 레이어는 Domain 레이어를 참조할 수 있다. 그러나 반대 방향으로의 참조는 불가능하다. 즉, 양방향이 아닌 일방향 참조만 가능하다. 하지만 참조를 해야할 시기가 있을 수 있다. 이것은 inner 레이어에서 outer 레이어의 데이터를 받아오는 것들을 interface로 정의했다. 이는 inner 레이어에 위치하게 되며, outer 레이에서 Adapter로 해당 interface 를 implement하여 사용했다. 이 경우 역참조가 아니다. 

또한 이러한 일방통행 구조를 가져야 종속성이 적은 것부터 리팩토링을 쉽게 할 수 있다.

## 매개변수는 꼭 필요한 것만
TC 짜기에도 좋고, 필요한 매개변수만 받아야 메서드를 신뢰할 수 있다.

## TC 작성
**꼭 하세요!**

리팩토링 할 때 노가다하는 시간을 줄일 수 있고, 피드백도 빨리 받을 수 있다.

## 좋은 팀에서 좋은 코드가 나옵니다.