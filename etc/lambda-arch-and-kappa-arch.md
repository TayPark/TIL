# 카파 아키텍처와 람다 아키텍처

source: https://www.informatica.com/blogs/adopt-a-kappa-architecture-for-streaming-and-ingesting-data.html#:~:text=What%20is%20Kappa%20architecture%3F,%2C%20Apache%20Flink%2C%20etc.

https://www.qlik.com/blog/lambda-or-kappa-the-need-for-a-new-data-processing-architecture

## Kappa Architecture

카파 아키텍처는 스트리밍을 우선(Streaming-first)으로 하는 데이터 프로세싱 패턴이다. 카파 아키텍처에서 스트리밍, IoT, CDC 같은 데이터 소스가 메세징 시스템으로 입수되며, 프로세싱 엔진은 메세징 시스템으로부터 데이터를 읽고, transform 하고, (필요시) enrich 하여 다시 메세징 시스템으로 보내서(최종적으로 DW 혹은 DL 같은 프로세싱 엔진과 분리된 분산 스토리지에 적재하여) 실시간 분석이 가능하게 한다. 서빙 레이어는 클라우드 DL, DW 같은 분산 스토리지가 일반적이다.

## 람다 아키텍처와의 차이점?

람다 아키텍처는 데이터 입수 부분에서 배치 레이어(Batch layer)와 실시간 레이어(Speed layer)를 모두 갖는다. 즉, 영구적 데이터 저장소(DB, HDFS, Object Storage 등)에서 특정 시기마다 일괄적으로 데이터를 ETL 하는 작업을 추가로 진행하여 서빙 레이어에 적재한다. 카파 아키텍처는 앞서 설명했듯이 실시간 데이터 입수만을 가진다. 카파 아키텍처는 서빙 레이어에서 데이터 입수부터 분석까지의 낮은 레이턴시를 갖는 요구사항, 즉 입수되는 데이터를 실시간으로 분석하려는 요구사항이 존재할때 적절하다.
