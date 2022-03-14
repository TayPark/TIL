# Apache Druid Design

source: https://druid.apache.org/docs/latest/design/architecture.html

드루이드는 멀티 프로세스, 분산 아키텍처를 사용하여 클라우드 친화적이고 운영하기 쉽도록 디자인되었다. 각 드루이드 프로세스 타입은 별개로 지정할 수 있고, 독립적으로 확장이 가능하여 클러스터 활용에 있어 최대의 유연성을 제공한다. 또한 하나의 컴포넌트가 다운되더라도 다른 곳에 즉시 영향이 가지 않도록 내결함성도 지녔다.

## 프로세스와 서버

드루이드 내부적으로는 프로레스와 서버로 구성된다. 드루이드는 여러개의 **프로세스 타입**과 **서터 타입**이 있다. 드루이드 프로세스들은 마음대로 배포할 수 있지만 서버 타입에 맞게 정의하는 것을 권장한다. 정리하면 다음과 같다.

- `Master`: Coordinator와 Overload 프로세스를 동작하며 **데이터 가용성을 관리하고 수집(data ingestion) 프로세스를 제어**한다.
  - `Coordinator`: 클러스터에서 데이터 가용성을 관리한다.
  - `Overload`: 데이터 수집 워크로드의 제어를 담당한다.
- `Query`: Broker와 Router 프로세스를 동작하며 **외부 클라이언트의 쿼리를 핸들링**한다.
  - `Broker`: 외부 클라이언트 쿼리를 핸들링한다.
  - `Router`: 부가적인 프로세스로, Broker, Coordinator, Overload에게 요청을 라우팅한다.
- `Data`: Historical, MiddleManager 프로세스를 동작하며 **데이터 수집 워크로드와 쿼리가능 데이터를 저장**한다.
  - `Historical`: 쿼리 가능한 데이터를 저장한다.
  - `MiddleManager`: 데이터 추출을 담당한다.

자세한 내용은 [Processes and servers](https://druid.apache.org/docs/latest/design/processes.html)를 참고하자.

## 외부 의존성

서술한 빌트인 프로세스 타입를 제외하고 드루이드는 세 개의 외부 의존성을 가진다. 이들은 인프라를 사용할 수 있도록 해준다.

### Deep storage

드루이드는 시스템에서 데이터를 추출한 모든 데이터를 저장하기 위해 `deep storage`를 사용한다. Deep storage는 공유 파일 스토리지로 모든 드루이드 서버에서 접근이 가능하다. 클러스터 배포의 경우 일반적으로 분산 오브젝트 스토리지인 S3나 HDFS등이 될 수 있고, 네트워크에 마운트된 NFS가 될 수 있다. 싱글 서버 배포의 경우 로컬 디스크가 된다.

드루이드는 deep storage를 데이터 백업과 드루이드 프로세스간 데이터 교환 용도로 사용한다. 이 저장된 데이터를 `세그먼트(segment)`라 한다. Historical 프로세스는 세그먼트를 로컬 디스크에 캐시하고 인메모리 캐시와 함께 쿼리를 제공한다. 이를 통해 드루이드가 쿼리를 실행할 때 스토리지를 액세스하지 않을 수 있고, 최적의 쿼리 지연을 가질 수 있다. 이러한 구조로 인해 사용자는  deep storage와 Historical 서버 전반에 적절한 디스크 공간을 확보해야한다.

자세한 내용은 [Deep storage](https://druid.apache.org/docs/latest/dependencies/deep-storage.html)를 참고하자.

### Metadata storage

메타데이터 스토리지는 세그먼트 사용 정보와 task 정보같은 여러가지 공유 시스템 메타데이터를 가진다. 클러스터 배포에서 PostgreSQL이나 MySQL같은 RDBMS으로 사용되며 싱글 서버 배포에서는 로컬에 저장되는 Apache Derby 데이터베이스가 사용된다.

자세한 내용은 [Metadata storage](https://druid.apache.org/docs/latest/dependencies/metadata-storage.html)를 참고하자.

### Zookeeper

내부 서비스 디스커버리, 조정, leader election 을 위해 사용한다.

자세한 내용은 [Zookeeper](https://druid.apache.org/docs/latest/dependencies/zookeeper.html)를 참고하자.

## Storage design

드루이드 데이터는 우리가 잘 알고있는 RDBMS인 `데이터소스(datasource)`에 저장된다. 각 데이터소스는 시간, 또는 다른 속성으로 나뉘어진다. 시간의 범위는 `chunk`로 나뉘어진다. **Chunk 내에서 데이터는 하나 혹은 여러 개의 세그먼트로 나뉘어진다.** 각 세그먼트는 하나의 파일이며, 일반적으로 수백개의 레코드로 이루어진다.

각 세그먼트는 MiddleManager에 의해 만들어지는데 이 세그먼트는 변할 수 있고, uncommitted 상태이다. 데이터는 이 uncommitted 상태일 때부터 쿼리가 가능하다. 아래와 같이 세그먼트를 만드는 프로세스는 데이터 파일을 작게 만들고 인덱싱을 통해 추후에 있을 쿼리를 가속화시킨다.

- Columnar format으로 변환
- Bitmap index를 이용한 인덱싱
- 압축
  - 사전 인코딩(특히 문자열 컬럼)
  - 비트맵 압축(비트맵 인덱싱)
  - 그리고 모든 컬럼에 대해 가능한 타입에 따른 압축(Type-aware compression)

시간이 지나 세그먼트가 커밋되고 deep storage에 저장되면 세그먼트가 immutable하게 변하고, MiddleManager에서 Historical 프로세스로 옮겨진다. 또한 세그먼트에 대한 `엔트리(entry)`는 메타데이터 스토어에 저장된다. 이 엔트리는 세그먼트에 대한 메타데이터로 자기설명이 가능하며 세그먼트의 스키마, 크기, deep storage에서의 위치 등을 포함한다. 이런 엔트리가 클러스터 데이터 중 가용한 데이터를 Coordinator에게 알려준다.

세그먼트 file에 대한 내용은 [세그먼트 files](https://druid.apache.org/docs/latest/design/세그먼트s.html)를 참조하자. 또, 드루이드에서 데이터를 모델링하는 내용은 [schema design](https://druid.apache.org/docs/latest/ingestion/schema-design.html)을 참조하자.

### 인덱싱과 핸드오프

`인덱싱(indexing)`은 새로운 세그먼트가 만들어지는 매커니즘이고, `핸드오프(handoff)`는 이를 발행하여 Historical 프로세스에 저장하는 것을 말한다.

1. 인덱싱 태스크는 새로운 세그먼트를 만들고 세그먼트의 id를 결정하는 것으로 시작한다. 만약 태스크가 **appending**(예: Kafka append mode)이라면 태스크가 끝남을 Overload의 **allocate** API를 호출하여 기존 세그먼트 셋에 새로운 파티션에 추가한다. 만약 태스크가 **overwriting**(Hadoop task)이라면 interval에 lock을 걸고 새 버전 번호와 새 세그먼트 집합을 생성하여 수행한다.
2. 인덱싱 태스크가 실시간 태스크라면 세그먼트는 즉시 쿼리가 가능하다. 사용이 가능하지만 Deep storage에 발행되지는 않는다.
3. 인덱싱 태스크가 세그먼트의 데이터를 읽는 일이 끝나면, 이를 deep storage에 저장하고 metadata store에 기록하는 것으로 발행한다.
4. 인덱싱 태스크가 실시간 태스크라면, 실시간 데이터를 계속 쿼리할 수 있도록 Hisotrical 프로세스가 세그먼트를 기록하는 것을 기다린다. 실시간이 아니라면 즉시 종료된다.

이 일이 Coordinator / Historical 프로세스의 측면에서는

1. Coordinator가 metadata store를 주기적으로 새롭게 발행된 세그먼트가 있는지 확인한다.
2. Coordinator가 찾은 세그먼트가 발행되었고 사용되었지만 사용할 수 없을 때, Historical 프로세스에게 세그먼트를 저장하고 발행하도록 지시한다.
3. Historical 프로세스가 세그먼트를 저장하면 데이터를 서빙할 수 있다.
4. 이 시점에서 인덱싱 태스크는 handoff를 기다리고 종료된다.

### 세그먼트 식별자

세그먼트는 4개의 요소로 이루어진 ID가 있다.

- Datasource 이름
- 시간 인터벌(세그먼트를 포함하는 time chunk의 경우, 데이터 수집 시간에 지정된 `세그먼트Granularity`에 해당)
- 버전 숫자(세그먼트 set이 시작된 timestamp)
- 파티션 숫자(유니크한 정수로 이루어짐)

각 요소들은 underbar(_)로 이어진다. 예를들어 세그먼트 이름이 **clarity-cloud0**, time chunk가 **2018-05-21T16:00:00.000Z/2018-05-21T17:00:00.000Z**, 버전이 **2018-05-21T15:56:09.909Z**, 파티션 숫자가 **1**이면 다음과 같은 ID가 만들어진다.

**clarity-cloud0_2018-05-21T16:00:00.000Z_2018-05-21T17:00:00.000Z_2018-05-21T15:56:09.909Z_1**

만약 파티션 숫자가 0이라면 마지막의 _1이 없는 ID가 된다.

### 세그먼트 버저닝

세그먼트 ID의 버전은 overwriting 모드의 배치 작업을 지원하기 위한 MVCC 형태이다. 만약 appending 모드였다면 하나의 버전에 time chunk가 계속해서 붙었을 것이다. 하지만 overwriting의 경우, 드루이드는 심리스하게 예전 쿼리에서 최신의 업데이트된 버전으로의 쿼리로 변경할 수 있다. 같은 데이터 소스, 같은 시간 간격을 가지지만 더 높은 버전을 가진다. 이는 드루이드에서 새 버전으로 대체하는 정책 때문이다.

드루이드는 새 데이터를 로드하여 처리하고(이 때 쿼리는 불가능) 새 데이터가 모두 로드되는 즉시 모든 새로운 쿼리를 해당 데이터를 사용하도록 전환하기 때문에 즉시 발생하는 것처럼 보인다. 이전 세그먼트는 수 분 내에 삭제된다.

### 세그먼트 라이프사이클

1. 메타데이터 스토어: 세그먼트 메타데이터(수 KB 이내의 JSON)은 세그먼트가 생성될 때 메타데이터 스토어에 저장된다. 메타스토어에 세그먼트를 넣는 것을 발행(publish)라 한다. 이런 메타데이터 레코드는 used라는 불리언 플래그를 갖고, 이는 세그먼트가 쿼리 가능 여부를 나타낸다. 실시간 태스크로 만들어진 세그먼트는 세그먼트가 추가 데이터를 허용하지 않기 때문에 게시되기 전에 사용할 수 있다.
2. Deep storage: 세그먼트 데이터 파일은 세그먼트가 생성되면 deep storage에 저장된다. 이는 메타데이터가 메타데이터 스토어에 발행되기 전에 일어난다.
3. 쿼리를 위한 준비: 세그먼트가 드루이드 데이터 서버에서 쿼리가 가능해진다.

드루이드 SQL의 `sys.segments` 테이블을 사용하여 액티브 세그먼트를 확인할 수 있다. 이는 아래의 플래그들을 포함한다.

- `is_published`: 세그먼트 메타데이터가 메타데이터 스토어에 발행되었다면 True 이다.
- `is_available`: 쿼리가 가능한 세그먼트라면 True 이다.
- `is_realtime`: 실시간 태스크만을 위한 세그먼트일때 True 이다. 실시간 수집하는 데이터 소스의 경우, 이는 일반적으로 True로 시작하여 세그먼트가 발행되고 hand-off되면 False가 된다.
- `is_overshadowed`: 세그먼트가 발행되었고 다른 발행된 세그먼트에 의해 모두 overshadowed 되었을 경우 True 이다. 일반적으로 전환 상태이고, 세그먼트의 used 플래그가 곧 False가 된다.

## 데이터 가용성과 일치

드루이드는 수집과 쿼리의 구조를 `indexing`과 `hand-off`로 분리하였다. 그러므로 드루이드에서 데이터 가용성과 일치성 속성을 이해하려면 기능을 따로 봐야한다.

수집 측면에서, 드루이드의 수집 방법은 주로 **pull-based**로 동작하며, 트랜잭션의 게런티를 제공한다. 이는 데이터 수집이 전체 혹은 모두 실패라는 트랜잭션 게런티를 제공하는 것을 말한다.

- 드루이드는 Kafka와 Kinesis 같은 스트림 엔진의 오프셋을 세그먼트의 메타데이터와 함께 메타데이터 스토어에 같은 트랜잭션으로 저장한다. 수집에 실패하더라도 세그먼트를 발행하지 않았으므로 롤백이 가능하다는 것을 알아야 한다. 이 경우, 부분적으로 수집한 데이터는 버려지며 드루이드는 스트림 오프셋의 마지막 커밋으로부터 수집을 재개한다.
- Hadoop 기반의 배치 수집은 각 태스크가 모든 세그먼트 메타데이터를 발행하는데, 하나의 트랜잭션으로 실행한다.
- 네이티브 배치 수집의 경우에는, 병렬 모드에서 관리자 태스크가 모든 서브 태스크가 끝났을 때 모든 세그먼트 메타데이터를 하나의 트랜잭션으로 발행한다. 심플 모드(싱글 태스크) 모드에서는 모든 세그먼트 메타데이터를 하나의 트랜잭션에 발행한다.

## 쿼리 프로세싱

쿼리는 드루이드 클러스터에 분산되어있고 Broker 프로세스에 의해 관리된다. 프로세스는 다음과 같다.

1. Broker를 통해 쿼리가 입력되면 어떤 데이터를 가지고 쿼리하는지 우선 식별한다.
2. 세그먼트 항목은 시간을 기반으로 쿼리되며, 데이터 소스가 어떻게 나뉘어져있냐에 따라 다른 속성으로도 가능하다.
3. Broker는 어떤 Historical과 MiddleManager가 세그먼트를 서빙하는지, 각 프로세스들에게 서브쿼리들이 분산되어 실행되는지 식별한다.
4. Historical/MiddleManager 프로세스들은 각 서브쿼리를 수행하고 Broker에게 결과를 반환한다. Broker는 결과를 취합하고 쿼리 요청자에게 결과를 반환한다.

시간과 속성 프루닝(pruning)은 드루이드가 각 쿼리를 위한 데이터의 양을 제한하기 때문에 중요하다. 인덱싱 구조의 각 세그먼트는 Historical 프로세스가 어떤 데이터가 쿼리 필터에 맞는지 식별할 수 있도록 해준다. Historical 프로세스가 어떤 데이터가 특정 쿼리에 맞는 데이터를 알게되면, 그 데이터만 쿼리에 사용한다.

드루이드는 쿼리 성능을 위해 3가지 기술들을 사용한다.

- 쿼리 데이터 양을 줄이기 위한 세그먼트 셋을 평가하고 프루닝
- 각 세그먼트 안에서 인덱스를 사용하여 어떤 데이터가 평가되어야 하는지 식별
- 각 세그먼트 안에서 특정 쿼리에 필요한 데이터만 읽어옴

드루이드 쿼리에 대해서는 [query execution](https://druid.apache.org/docs/latest/querying/query-execution.html)을 참고하자.