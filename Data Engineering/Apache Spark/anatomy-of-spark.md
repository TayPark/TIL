# Anatomy of Spark application

source: https://luminousmen.com/post/spark-anatomy-of-spark-application

Apache Spark는 하둡의 대체제로 고려된다. Spark는 더 사용하기 쉽고, 강력하며 빅 데이터를 위한 도구와 다양한 챌린지들에 유용하게 사용된다. 산업계에선 빅데이터 프레임워크에서 주류로 떠오르고 있다. Spark는 Hadoop 2.0 버전부터 하둡의 일부가 되어는데, 이는 파이썬을 사용하는 빅데이터 엔지니어들에게 가장 사랑받는 기술이기도 하다.

## 컴포넌트

Spark 애플리케이션의 컴포넌트는 다음과 같이 구성된다.
- Driver
- ApplicationMaster
- SparkContext
- ClusterResourceManager(aka ClusterManager)
- Executors

Spark는 `Driver`라고 불리는 중앙 코디네이터와 다양한 노드에 있는 `executors`라는 실행 가능한 워크플로우 세트와 함께 마스터/슬레이브 아키텍처를 사용한다.

### Driver

Driver(or Driver Program)는 유저 애플리케이션을 `tasks`라는 더 작은 실행 단위로 변환한 다음 executors에서 ClusterManager로 실행되도록 스케줄링한다. 또한 드라이버는 Spark 애플리케이션의 실행을 책임지고 애플리케이션 상태와 결과를 유저에게 반환하는 역할을 한다.

SparkDriver는 여러 컴포넌트를 포함하며 이들은 유저 코드를 Spark 클러스터 위에서 동작하는 실제 jobs로 변환하는 역할을 한다.
- DAGScheduler
- TaskScheduler
- BackendScheduler
- BlockManager

이 외에 SparkDriver의 특징으로는 다음과 같다.
- 고가용성을 위해 독립 프로세스로 실행하거나 워커 노드위에서 동작할 수 있다.
- 파티션에 있는 RDD의 메타 데이터를 저장한다.
- 유저가 ClusterManager에게 Spark 애플리케이션을 전달할 때 생선된다.
- 자신의 JVM위에서 동작한다.
- 로컬 DAG transformation을 최적화하고 가능하면 그들을 **스테이지**에 묶어서 최적의 성능을 낼 수 있도록 결정한다.
- 애플리케이션 상세 정보르 이용하여 Spark WebUI를 생성한다. 

### ApplicationMaster

ApplicationMaster는 ResourceManager와 리소스를 협상하고 NodeManager와 함께 애플리케이션 작업을 수행하고 동작을 모니터링하는 프레임워크별 엔터티이다. 각 애플리케이션은 그들의 클러스터에서 동작하여 각자의 ApplicationMaster 인스턴스가 존재한다.

Spark Master는 사용자가 Spark에게 `spark-submit`을 제출했을 때 동일한 노드(클러스터 모드일 경우)에 Driver와 동시에 생성된다.

Driver는 ApplicationMaster에게 사용자의 요구사항을 애플리케이션에게 알리고 ApplicationMaster는 ResourceManager와 리소스를 협상하여 실행기를 호스팅한다.

오프라인 모드에서는 Spark Master가 ClusterManager의 역할을 수행한다.

### SparkContext

SparkContext는 Spark 기능의 주요 진입점이므로 **Spark 애플리케이션의 핵심이다.** SparkDriver는 ClusterResourceManager를 통해 클러스터에 액세스 할 수 있으며 RDD, Accumulator 및 Broadcast variable을 만드는 데 사용할 수 있다. SparkContext는 정기적인 heartbeat 메시지를 전송하여 실시간으로 노드들을 추적한다.

SparkContext는 사용자가 Spark 애플리케이션을 처음 제출할 때 SparkDriver에 의해 생성되며 Spark 애플리케이션의 런타임 내내 존재한다. 이는 Spark 애플리케이션이 끝나면 작동을 멈춘다.

각 JVM에 대해 하나의 SparkContext만 활성화 될 수 있다. 새 SparkContext를 만드려면 `stop()`을 이용하여 SparkContext를 활성화 해야한다.

### ClusterResourceManager

분산 Spark 애플리케이션의 ClusterManager는 클러스터 내에서 컨테이너 형태로 컴퓨팅 리소스를 제어하고, 관리하고, 예약한다. 이 컨테이너들은 ApplicationMaster의 요청에 의해 예약되고 사용 가능하거나 릴리즈될 때 ApplicationMaster에게 할당된다.

컨테이너가 ClusterManager에게 할당되면 ApplicationMaster는 컨테이너 리소스를 SparkDriver에게 전송하고 SparkDriver는 여러 단계와 Spark 애플리케이션을 수행하는 일을 한다.

SparkContext는 여러 타입의 ClusterManager를 연결할 수 있다. 일반적으로 단일 ClusterManager와 `YARN`, `Mesos`, `Kubernetes`, `Nomad`가 있다.

재밌는 점은 Mesos를 만든 사람이 Spark 개발자이기도 하다.

### Executors

Executor는 맡은 작업을 수행하는 워커 노드를 담당하는 프로세스이다. 이 작업들은 워더 노드에서 수행되고 결과를 SparkDriver에게 반환한다.

Executor는 Spark 애플리케이션이 실행되면 시작되고 애플리케이션이 종료되기 전 까지 일을 한다. 이를 **Static Allocation of Executors**라고 한다. 사용자는 executor를 전체 워크로드에 맞도록 동적으로 할당할 수 있다(이는 클러스터에서 동작하는 다른 애플리케이션에게 영향을 줄 수 있다.) 만약 하나의 executor에 문제가 생겼을 경우에도 Spark 애플리케이션은 동작을 멈추지 않는다.

수행자들은 인메모리 스토리지를 RDD 파티션을 위해 제공하고 이는 Spark 애플리케이션(로컬, BlockManager)들이나 디스크(localCheckpoint)에 캐싱된다.

그 외에 executor는
- 데이터를 JVM 힙이나 디스크의 캐시에 저장한다.
- 외부 소스로부터 데이터를 읽는다.
- 외부 소스에 데이터를 쓴다.
- 모든 데이터 처리를 담당한다.

### Spark 실행 순서

1. Spark 애플리케이션을 클러스터 모드로 보내면 `spark-submit` 유틸리티가 ClusterResourceManager와 통신하여 ApplicationMaster를 시작한다.
2. ResourceManager는 ApplicationMaster를 실행하는 데 필요한 컨테이너를 선택한다. 그 다음 ResourceManager가 특정 NodeManager에게 ApplicationMaster를 시작하도록 지시한다.
3. ApplicationMaster는 Resource Master에 등록된다. 그 후 클라이언트 프로그램이 ResourceManager로붜 정보를 요청할 수 있으며, 이 정보를 통해 클라이언트 프로그램이 자체 ApplicationMaster와 직접 통신할 수 있다.
4. 그 다음 SparkDriver가 ApplicationMaster에서 실행된다.
5. Driver는 변환 및 작업이 포함된 사용자 코드를 논리적 DAG으로 변환한다. 모든 RDD는 Driver에서 생성되며 작업이 호출될 때까지 아무 작업도 수행하지 않는다. 이 단계에서 Driver는 최적화도 수행한다.
6. 그 다음 DAG을 실제 실행 계획으로 변환한다. 물리적 실행 계획으로 전환하여 Driver는 각 단계에서 `task`라는 물리적 실행 단위를 생성한다.
7. ApplicationMaster는 ClusterManager와 통신하고 리소스를 협상한다. ClusterManager는 컨테이너를 할당하고 적절한 NodeManager에게 선택한 모든 컨테이너에게 실행기를 요구하도록 요청한다. 실행기가 실행되면 Driver에 등록된다.
8. Driver는 데이터 배치에 따라 ClusterManager를 통해 executor에게 task를 보낸다.
9. 사용자 애플리케이션의 코드는 컨테이너 내에서 시작된다. ApplicationMaster에 정보(실행 단계, 상태)를 제공한다.
10. 이 단계에서 코드를 실행한다. 데이터 소스로부터 RDD를 생성하여 다른 노드의 다른 파티션으로 병렬로 읽어 생성한다. 각 노드에는 데이터 하위 집합이 생성된다.
11. 데이터를 읽은 후 각 파티션에서 병렬로 실행되는 변환을 실행한다.
12. 사용자 애플리케이션을 실행하는 동안 클라이언트는 애플리케이션의 상태를 얻기 위해 AppliatioonMaster와 통신한다.
13. 애플리케이션 실행이 완료되고 필요한 모든 작업이 완료되면 애플리케이션 마스터는 ResourceManager와 연결을 끊고 중지하여 다른 용도로 컨테이너를 해제한다.