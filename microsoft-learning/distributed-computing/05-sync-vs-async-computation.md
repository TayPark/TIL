# 동기 및 비동기 계산

프로그래밍 모델에 관계 없이, 개발자는 분산 계산을 `동기` 혹은 `비동기`로 지정할 수 있다. 이러한 구분은 태스크 작업을 동기화하는 조정 매커니즘의 여부를 나타낸다. 동기식 분산 프로그램은 구성 요소 태스크가 잠금 단계에서 작동하는 경우를 말한다. 동기 프로그램에서 분산 태스크는 특정 계산이 완료되었거나 데이터가 도착할 때까지 미리 결정된 시점까지 대기해야한다. 계산 비동기성은 성능에 영향을 덜 미치지만, 프로그램의 정확성/유효성을 평가해야 함을 의미한다.

분산 설정의 또 다른 주요 관심사는 **개별 태스크 간의 균일하지 않은 메모리 액세스 대기 시간이나 균등하지 않은 부하로 인해 계산이 느려지지 않도록 데이터를 할당**하는데 있다. `BSP(Bulk Synchronous Parallel) 모델`은 로컬 데이터를 사용하여 균일한 액세스 대기 시간을 승격한다. 실제 태스크 계산을 트리거하기 전에 상위 단계에서 데이터가 전달되므로 모델에서 계산과 통신이 분리된다. 이 분리 때문에 높은 처리량을 제공해야 한다는 점을 제외하고는 특정 네트워크 토폴로지가 선호될 이유가 없다. Butterfly, hypercube, optical crossbar 토폴로지가 모두 허용된다.

상위 단계 내의 태스크에서 데이터 볼륨은 달라질 수 있으며, 태스크 부하는 주로 분산 프로그램과 해당 구성 태스크에 적용되는 책임에 따라 결정된다. 따라서 상위 단계를 완료하는데 필요한 시간은 상위 단계에서 가장 느린 태스크를 따른다. 