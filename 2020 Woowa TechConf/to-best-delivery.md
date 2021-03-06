# 겉바속촉 치킨의 골든타임을 지키기 위해 배민이 하는 일

음식 배달을 시키면 그 음식의 가장 맛있는 시간, 즉 골든타임이 존재한다. 점포부터 배달지점까지 빠르면 빠를수록 좋다. 하지만 점포는 고객와 직접 연결되어있지 않다. 배달업체가 배달을 해주는데, 내 음식을 배달할 라이더가 다른 집을 도느라 오래 걸리면 내 음식의 골든타임을 지키지 못하게된다.

그래서 배민에서는 이를 최적화하기 위해 AI를 도입하도록 결심했고, 아래는 그 노력들이다.

## 그리디 알고리즘
: 최적의 답을 구하는 근사적 방법. 여러 경우에서 한 가지를 결정해야 할 때마다, 결정 시기에서 가장 최적의 답을 선택하는 것을 말함.

지역적 최적이면서 전역적 최적인 문제들에 대해 최적의 방법이라 할 수 있다.

n 개의 배달을 수행하는 최적의 경로 = 이전의 배달을 수행하는 최적의 경로 중 하나의 배달을 사이사이에 처리할 수 있는 모든 경로중 최적의 경로.

cost 최적의 라이더 선정 = 신규 cost - 이전 cost의 값.

`osrm`(C++로 작성된 오픈소스이다. 도로 네트워크에서 shortest path를 찾기위해 사용)을 도입했다. 하지만 매 순간마다 비용을 계산하기에는 서버에 부담이 컸다. 서버는 응답이 빠르지만 최적화가 되진 않았다. 

그래서 배달 가능한 지역을 일정 면적(블록)으로 나누었다. 약 8만개 정도가 나왔다. 이 블럭들 간 거리를 계산해서 캐시하도록 했다.

## Redis

K-V 형태로 저장하는 싱글 스레드 인메모리 데이터베이스이다. Key를 주소1_주소2, Value를 거리로 저장하였다.

## 너무 큰 데이터

너무 큰 데이터는 바이너리 압축 프로토콜을 사용할 수 있으나 빠른 구현을 위해 바이트로 내보냈고, 직렬화가 가능하도록 구현하였다. 그러나 API 명세가 가능한 압축 프로토콜을 사용하는 편이 좋다고 생각한다.
