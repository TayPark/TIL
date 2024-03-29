source: https://databricks.com/blog/2020/01/30/what-is-a-data-lakehouse.html

## 개요

`DW(Data Warehouse)`는 수십년간 의사결정과 `BI(Business Intelligence)` 애플리케이션을 지원하는 긴 역사를 가지고 있다. 1980년대 DW의 도래 이후, DW 기술과 `MPP(Massive Parallel Processing)` 아키텍처는 거대한 데이터를 다룰 수 있도록 진화되었다. DW는 정형 데이터에 적합한 솔루션이지만 모던 엔터프라이즈들은 비정형, 반정형의 빅데이터를 다뤄야한다. DW는 이런 유즈 케이스에 대해 비용 효율적이지 않으며 적합하지 않다는 단점을 가진다.

기업들은 큰 데이터를 다양한 데이터 소스로부터 수집했기 때문에, 아키텍트들은 많은 분석 도구와 워크로드를 위한 **단 하나의 데이터 저장 시스템**을 그려왔다. 이는 `DL(Data Lake)`이며, DL은 모든 raw 데이터를 수집하는 용도로 사용한다.

하지만 DL에서는 심각한 문제가 있는데, **트랜잭션을 지원하지 않고**, **데이터 품질을 강제하지 않으며**, **데이터 일관성과 독립성이 부족**하여 배치 및 스트리밍 작업 환경에서 다양한 분석이 불가능하다는 한계가 있다.

기업들은 여전히 SQL 분석, 실시간 모니터링, 데이터 사이언스, 머신러닝에 대한 수요가 높다. 최신 AI 모델은 비정형 데이터에 대해 과거보다 더 복잡한 작업을 수행할 수 있지만 여전히 DW에서는 이러한 데이터들을 정확하게 다루기가 힘들다.

위와 같은 시사점은 아래의 스토리지 및 워크로드를 통합하려는 노력을 가져왔다.
1. DL
2. DW
3. 스트리밍, 시계열, 그래프, 이미지 DB 등

## Lakehouse

DW과 DL의 한계를 극복하기 위해 새로운 시스템을 도입했다. `Lakehouse`는 DL와 DW의 장점을 결합한 것이다. Lakehouse는 다음의 특징을 갖는다.

1. **트랜잭션 서포트**: 엔터프라이즈 lakehouse의 많은 데이터 파이프라인은 동시에 읽고 쓰는 시스템을 가진다. ACID 트랜잭션을 지원하여 다양한 데이터의 읽기 및 쓰기를 지원하며 데이터 일관성을 보장한다.
2. **스키마 강제 및 거버넌스**: DW 스키마를 지원하여 star형 또는 snowflake 스키마를 지원한다. 이는 데이터 무결성을 지원하기 위함이며 견고한 데이터 거버넌스와 감사 메커니즘을 지닌다.
3. **BI 서포트**: 소스 데이터로부터 BI 도구를 지원한다. DL과 DW의 데이터 복사가 일어나지 않으므로 낮은 지연시간을 가질 수 있다.
4. **스토리지가 연산으로부터 분리**: 스토리지와 연산이 각각의 클러스터로 분리되어있어 확장이 가능하다. 여담으로 모던 DW도 이러한 기능이 포함되어있다.
5. **공개**: Lakehouse에서 사용하는 스토리지 포맷은 `Parquet`처럼 공개되어있고 정형화되어있어 API를 제공하고, 다양한 도구와 엔진이 효율적으로 데이터를 접근할 수 있다.
6. **다양한 데이터 형태 지원**: Lakehouse는 애플리케이션의 필요에 따라 저장, 정제, 분석, 접근이 가능하고 이미지, 비디오, 오디오, 반정형 데이터와 텍스트 모두 포함한다.
7. **다양한 워크로드 지원**: 데이터 사이언스, 머신러닝, SQL, 분석을 지원한다.
8. **엔드 투 엔드 스트리밍**: Lakehouse는 스트리밍을 지원하기 때문에 실시간 데이터 애플리케이션을 위한 개별 시스템을 제거할 수 있다.
