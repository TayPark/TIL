# Apache Druid Design

source: https://druid.apache.org/docs/latest/design/architecture.html

드루이드는 멀티 프로세스, 분산 아키텍처를 사용하여 클라우드 친화적이고 운영하기 쉽도록 디자인되었다. 각 드루이드 프로세스 타입은 별개로 지정할 수 있고, 독립적으로 확장이 가능하여 클러스터 활용에 있어 최대의 유연성을 제공한다. 또한 하나의 컴포넌트가 다운되더라도 다른 곳에 즉시 영향이 가지 않도록 내결함성도 지녔다.

## 프로세스와 서버

드루이드 내부적으로는 프로레스와 서버로 구성된다. 드루이드는 여러개의 **프로세스 타입**과 **서터 타입**이 있다. 드루이드 프로세스들은 마음대로 배포할 수 있지만 서버 타입에 맞게 정의하는 것을 권장한다. 정리하면 다음과 같다.

- `Master`: Coordinator와 Overload 프로세스를 동작하며 **데이터 가용성을 관리하고 추출(data ingestion) 프로세스를 제어**한다.
  - `Coordinator`: 클러스터에서 데이터 가용성을 관리한다.
  - `Overload`: 데이터 추출 워크로드의 제어를 담당한다.
- `Query`: Broker와 Router 프로세스를 동작하며 **외부 클라이언트의 쿼리를 핸들링**한다.
  - `Broker`: 외부 클라이언트 쿼리를 핸들링한다.
  - `Router`: 부가적인 프로세스로, Broker, Coordinator, Overload에게 요청을 라우팅한다.
- `Data`: Historical, MiddleManager 프로세스를 동작하며 **데이터 추출 워크로드와 쿼리가능 데이터를 저장**한다.
  - `Historical`: 쿼리 가능한 데이터를 저장한다.
  - `MiddleManager`: 데이터 추출을 담당한다.

자세한 내용은 [Processes and servers](https://druid.apache.org/docs/latest/design/processes.html)를 참고하자.

## 외부 의존성

서술한 빌트인 프로세스 타입를 제외하고 드루이드는 세 개의 외부 의존성을 가진다. 이들은 인프라를 사용할 수 있도록 해준다.

### Deep storage

드루이드는 시스템에서 데이터를 추출한 모든 데이터를 저장하기 위해 `deep storage`를 사용한다. Deep storage는 공유 파일 스토리지로 모든 드루이드 서버에서 접근이 가능하다. 클러스터 배포의 경우 일반적으로 분산 오브젝트 스토리지인 S3나 HDFS등이 될 수 있고, 네트워크에 마운트된 NFS가 될 수 있다. 싱글 서버 배포의 경우 로컬 디스크가 된다.

드루이드는 deep storage를 데이터 백업과 드루이드 프로세스간 데이터 교환 용도로 사용한다. 이 저장된 데이터를 `segment`라 한다. Historical 프로세스는 segment를 로컬 디스크에 캐시하고 인메모리 캐시와 함께 쿼리를 제공한다. 이를 통해 드루이드가 쿼리를 실행할 때 스토리지를 액세스하지 않을 수 있고, 최적의 쿼리 지연을 가질 수 있다. 이러한 구조로 인해 사용자는  deep storage와 Historical 서버 전반에 적절한 디스크 공간을 확보해야한다.

자세한 내용은 [Deep storage](https://druid.apache.org/docs/latest/dependencies/deep-storage.html)를 참고하자.

### Metadata storage

메타데이터 스토리지는 segment 사용 정보와 task 정보같은 여러가지 공유 시스템 메타데이터를 가진다. 클러스터 배포에서 PostgreSQL이나 MySQL같은 RDBMS으로 사용되며 싱글 서버 배포에서는 로컬에 저장되는 Apache Derby 데이터베이스가 사용된다.

자세한 내용은 [Metadata storage](https://druid.apache.org/docs/latest/dependencies/metadata-storage.html)를 참고하자.

### Zookeeper

내부 서비스 디스커버리, 조정, leader election 을 위해 사용한다.

자세한 내용은 [Zookeeper](https://druid.apache.org/docs/latest/dependencies/zookeeper.html)를 참고하자.

## Storage design

드루이드 데이터는 우리가 잘 알고있는 RDBMS인 `데이터소스(datasource)`에 저장된다. 각 데이터소스는 시간, 또는 다른 속성으로 나뉘어진다. 시간의 범위는 `chunk`로 나뉘어진다. **Chunk 내에서 데이터는 하나 혹은 여러 개의 segment로 나뉘어진다.** 각 segment는 하나의 파일이며, 일반적으로 수백개의 레코드로 이루어진다.

각 segment는 MiddleManager에 의해 만들어지는데 이 segment는 변할 수 있고, uncommitted 상태이다. 데이터는 이 uncommitted 상태일 때부터 쿼리가 가능하다. 아래와 같이 segment를 만드는 프로세스는 데이터 파일을 작게 만들고 인덱싱을 통해 추후에 있을 쿼리를 가속화시킨다.

- Columnar format으로 변환
- Bitmap index를 이용한 인덱싱
- 압축
  - 사전 인코딩(특히 문자열 컬럼)
  - 비트맵 압축(비트맵 인덱싱)
  - 그리고 모든 컬럼에 대해 가능한 타입에 따른 압축(Type-aware compression)

시간이 지나 segment가 커밋되고 deep storage에 저장되면 segment가 immutable하게 변하고, MiddleManager에서 Historical 프로세스로 옮겨진다. 또한 segment에 대한 `엔트리(entry)`는 메타데이터 스토어에 저장된다. 이 엔트리는 segment에 대한 메타데이터로 자기설명이 가능하며 segment의 스키마, 크기, deep storage에서의 위치 등을 포함한다. 이런 엔트리가 클러스터 데이터 중 가용한 데이터를 Coordinator에게 알려준다.

Segment file에 대한 내용은 [segment files](https://druid.apache.org/docs/latest/design/segments.html)를 참조하자. 또, 드루이드에서 데이터를 모델링하는 내용은 [schema design](https://druid.apache.org/docs/latest/ingestion/schema-design.html)을 참조하자.

