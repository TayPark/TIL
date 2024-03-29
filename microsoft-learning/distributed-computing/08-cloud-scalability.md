# 클라우드에서 확장성 문제

분산 프로그램의 디자인 및 구현 중에는 프로그래밍 모델을 선택하고 **동시성, 병렬 처리 및 아키텍처**의 문제를 해결하게 된다. 그 외에도 **확장성, 통신, 이질성, 동기화, 내결함성 및 예약** 관련 문제를 논의해야한다.

## 확장성

분산 프로그램은 사용자, 데이터 및 리소스 수가 현저하게 증가하는 경우에도 효과적으로 유지될 경우 확장 가능한 것으로 간주된다. 리소스와 관련하여 클라우드 데이터 센터에는 수많은 컴퓨터를 이미 호스팅하고 있지만 컴퓨터 수는 훨씬 더 높은 비율로 늘어날 것이라고 예측한다.

n개의 노드 실행은 현실적으로 이상적인 n배의 성능 향상을 충족할 수 없다. 아래의 이유 때문이다.

- 일부 프로그램 부분은 병려화할 수 없다(예: 초기화)
- 태스크 간 부하가 불균형할 가능성이 높으며, 클라우드와 같이 이질성이 주요 원인이 되는 분산 시스템에서는 특히 더 그렇다. 부하 불균형 상태일 때 프로그램이 가장 느린 태스크의 영향을 받으므로 일반적으로 프로그램이 지연된다. 특히 프로그램의 모든 태스크가 완료되더라도 마지막 태스크가 완료되기 전에 프로그램을 커밋할 수 없다.
- 통신 및 동기화 오버헤드 등 다른 심각한 오버헤드는 확장성을 크게 방해할 수 있다.

이러한 문제는 분산 프로그램과 순차 프로그램의 성능을 비교하는 데 중요하다. 순차 프로그램의 시간은 Ts, n개 노드를 사용하는 병렬/분산 버전은 Tp, 또 병렬화가 가능하지 않은 부분을 f, 가능한 부분을 (f-1)이라고 가정하자. **암달의 법칙**에 따라 병렬/분산 실행과 순차 실행의 속도 향상을 다음과 같이 정의할 수 있다.

Speedup = Ts / Tp = Ts / (Ts * f + Ts * (1-f)/n) = 1 / f + (1-f)/n

여기서 제한 없는 수의 컴퓨터가 있는 클러스터가 있고, 상수 s를 사용할 경우 제한 없는 수의 프로세서로 P의 속도 증가를 간단히 계산하여 달성 가능한 최대 속도 증가를 다음과 같이 나타낼 수 있다.

lim(n->INF) Speedup = lim(n->INF) 1 / (f + (1-f)/n) = 1 / f

여기서 만약 병렬화가 불가능한 f를 2%라고 가정해보자. 무제한의 컴퓨터를 사용한다면 최대 50의 속도를 얻을 수 있다. f를 0.5%까지 줄인다면 최대 200의 속도를 얻을 수 있다. 따라서 분산 시스템에서 확장성을 실현하기 위해 **병렬이 불가능한 부분을 최소화 해야한다.** 이 예제에서는 부하 불균형, 동기화 및 통신 오버헤드의 영향을 무시하였으므로 실제로 구현하기 매우 어렵다. 실제로 사용하는 컴퓨터 수가 많을수록 동기화 오버헤드가 지수 증가한다. 모든 컴퓨터가 부족한 물리적 연결을 공유할 수 없으므로 대규모 분산 시스템에서 통신 오버헤드도 크게 증가한다. 마지막으로 부하 불균형은 이기종 환경에서 큰 영향을 미친다. 