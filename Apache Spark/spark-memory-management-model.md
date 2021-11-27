source: https://www.tutorialdocs.com/article/spark-memory-management.html

# Deep Understanding of Spark Memory Management Model

일반적으로 스파크 애플리케이션은 2개의 JVM 프로세스를 가지는데, `드라이버`와 `익스큐터`가 그것이다. `드라이버`는 메인 제어 프로세스로, SparkContext를 생성하고 Job을 제출하며, Job을 Task로 쪼개는 역할과 익스큐터 사이에서 Task를 조정하는 역할을 수행한다. `익스큐터`는 Task의 연산을 주로 수행하고 드라이버에게 결과를 반환하는 역할을 한다.

## On-Heap memory and Off-Heap memory

익스큐터는 JVM 프로세스로 동작하므로 메모리 관리는 JVM을 기반으로 한다. JVM 메모리 관리는 2개의 방법을 포함한다.

1. On-Heap memory management: JVM Heap 영역 내에 할당된 객체. GC의 영향을 받는다.
2. Off-Heap memory management: 직렬화나 애플리케이션에 의해 JVM 밖에 할당된 객체를 말한다. GC의 영향을 받지 않아 메모리 해제를 위해 로직을 작성해야한다.

일반적으로 객체의 읽기/쓰기 성능은 **on-heap > off-heap > disk** 이다.

## 메모리 할당

스파크에서 메모리 관리 모드는 **Static Memory Manager**와 **Unified Memory Manager**가 있다.

스파크는 스토리지 메모리와 익스큐션 메모리의 관리를 위해 `메모리 관리자`라는 통합 인터페이스를 제공한다. 익스큐터가 메모리 관리자에게 메모리 할당이나 해제를 요청한다. 스파크 1.6버전 이전에는 Static Memory Management가 기본으로 사용되었고 UnifiedMemoryManager가 1.6버전 이후부터 사용되었다. Static Memory Management는 `spark.memory.useLagacyMode` 파라미터의 설정으로 세팅이 가능하다.

### Static Memory Manager(정적 메모리 관리자)

정적 메모리 관리자 메커니즘은 **스파크 애플리케이션의 실행 중에 바뀌지 않도록 스토리지 메모리, 익스큐션 메모리 등을 고정**하는 방법이며, 사용자는 애플리케이션 시작 전에 변경할 수 있다. 정적 메모리 관리자의 단점은 쉽게 사용할 수 있으나 사용자가 메커니즘에 익숙하지 않아 **적절한 데이터 사이즈와 연산 태스크를 설정하지 않으면 스토리지 메모리와 익스큐션 메모리가 남거나 부족한 현상을 겪을 수 있다.**

### Unified Memory Manager(통합 메모리 관리자)

통합 메모리 관리자 메커닞므은 스파크 1.6버전부터 도입되었다. **정적 관리자와 차이점은 스토리지 메모리와 익스큐션 메모리가 메모리 영역을 공유하고 서로의 자유 공간을 점유할 수 있다는 점이다.**

#### On-heap model

기본적으로 스파크는 On-heap 메모리만 사용한다. On-heap 메모리의 크기는 `--executor-memory`나 `spark.executor.memory` 파라미터로 조정할 수 있다. 익스큐터 내에서 동작하는 동시 동작 Task들은 JVM의 On-heap 메모리를 공유한다.

On-heap 메모리는 4개의 블록으로 나눌 수 있다.

- **Storage Memory**: 스파크의 캐시 데이터를 저장한다. RDD, 브로드캐스트 변수, Unroll 데이터 등을 말한다.
- **Execution Memory**: 셔플, 조인, 정렬, 집계 프로세스에서 사용되는 임시 데이터를 저장하는 용도로 사용한다. 
- **User Memory**: RDD 변환 작업을 위해 사용된다. RDD 의존성 정보등을 포함한다.
- **Reserved Memory**: 시스템과 스파크의 내부 객체를 위한 공간이다.

#### Off-heap model

스파크 1.6부터 Off-heap 메모리를 도입했다. 기본적으로 비활성화되어있지만 `spark.memory.offHeap.enabled` 파라미터와 `spark.memory.offHeap.size`를 수정하여 활성화할 수 있다. Off-heap 메모리는 간단하게 **Storage Memory**와 **Execution Memory**로 이루어져있다.

Off-heap이 활성화되어있으면 On-heap와 Off-heap 모두 익스큐터에 존재하게된다. 이 때, 전체 익스큐션 메모리는 On-heap과 Off-heap에 존재하는 익스큐션 메모리의 합이 된다. 스토리지 메모리도 동일하다.

#### Dynamic occupancy mechanism(동적 점유 메커니즘)

- 스파크 애플리케이션이 제출되면, 스토리지 메모리 영역과 익스큐션 메모리 영역은 `spark.memory.storageFraction` 파라미터에 의해 결정된다.
  - 값이 높아지면 스토리지 메모리가 늘어난다. 기본값은 0.5이다.
- 애플리케이션이 동작 중에, 메모리 공간이 부족하다면 LRU 방식에 의해 eviction되어 disk에 쓰여진다. 스토리지 메모리나 익스큐션 메모리 중 한 쪽이 부족하면 나머지 한 쪽의 자유 공간을 빌린다.
- 스토리지 메모리는 상대방의 메모리를 점유하고 점유된 부분을 하드디스크에 쓴 다음 빌린 공간을 반환한다.
- 익스큐션 메모리는 상대방의 메모리를 차지하며 현재 상태에서 빌린 공간을 반환할 수 없다. 셔플 프로세스에서 생성된 파일은 나중에 사용하기 때문에 메모리를 반환하면 심각한 성능저하가 발생할 수 있기 때문이다.