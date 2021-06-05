# Anatomy of Spark application

source: https://luminousmen.com/post/spark-anatomy-of-spark-application

아파치 스파크는 하둡의 대체제로 고려된다. 스파크는 더 사용하기 쉽고, 강력하며 빅 데이터를 위한 도구와 다양한 챌린지들에 유용하게 사용된다. 산업계에선 빅데이터 프레임워크에서 주류로 떠오르고 있다. 스파크는 하둡 2.0 버전부터 하둡의 일부가 되어는데, 이는 파이썬을 사용하는 빅데이터 엔지니어들에게 가장 사랑받는 기술이기도 하다.

## 컴포넌트

스파크 애플리케이션의 컴포넌트는 다음과 같이 구성된다.
- Driver
- Application Master
- Spark Context
- Cluster resource manager(aka Cluster Manager)
- Executors

스파크는 `Driver`라고 불리는 중앙 코디네이터와 다양한 노드에 있는`Executors`라는 실행 가능한 워크플로우 세트와 함께 마스터/슬레이브 아키텍처를 사용한다.

### Driver

드라이버(드라이버 프로그램이라고도 한다.)는 유저 애플리케이션을 `tasks`라는 더 작은 실행 단위로 변환한 다음 executors에서 cluster manager로 실행되도록 스케줄링한다. 또한 드라이버는 스파크 애플리케이션의 실행을 책임지고 애플리케이션 상태와 결과를 유저에게 반환하는 역할을 한다.

스파크 드라이버는 여러 컴포넌트를 포함하며 이들은 유저 코드를 스파크 클러스터 위에서 동작하는 실제 jobs로 변환하는 역할을 한다.
- DAGScheduler
- TaskScheduler
- BackendScheduler
- BlockManager

이 외에 스파크 드라이버의 특징으로는 다음과 같다.
- 고가용성을 위해 독립 프로세스로 실행하거나 워커 노드위에서 동작할 수 있다.
- 파티션에 있는 RDD의 메타 데이터를 저장한다.
- 유저가 클러스터 매니저에게 스파크 애플리케이션을 전달할 때 생선된다.
- 자신의 JVM위에서 동작한다.
- 로컬 DAG transformation을 최적화하고 가능하면 그들을 **스테이지**에 묶어서 최적의 성능을 낼 수 있도록 결정한다.
- 애플리케이션 상세 정보르 이용하여 스파크 WebUI를 생성한다. 

### Application Master

애플리케이션 마스터는 프레임워크별 엔티티로 Resource Manager와 리소스를 협상하고 Node Manager와 함께 애플리케이션 작업을 수행하고 동작을 모니터링한다. 각 애플리케이션은 그들의 클러스터에서 동작하여 각자의 Application Master 인스턴스가 존재한다.