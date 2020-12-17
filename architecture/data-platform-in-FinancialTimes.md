# Financial Times의 데이터플랫폼 구축기
	
130년된 신문사의 디지털 트랜스포메이션 이야기

## G1. 2008~2014 : 읽은 기사에 기반한 뉴스추천에 집중. SQL Server 기반

## G2. 2014~2016 : ETL의 도입. 데규모 데이터 분석과 새로운 질문들, 데이타 양 증대
- SQL Server가 병목. Redshift + ETL Framework로 전환
- 일간 몇번씩 SQL실행하도록 스케줄링 자동화
- SQL + Python 으로 복잡한 데이터 모델 지원

## G3. 2016~2018 : 빅데이터@FT 의 시작
- 데이터 레이턴시 최소화를 목표. Data Ingestion 이 하루에 한번(24h). 이걸 줄여야 더 빠르게 트렌드에 대응가능
- 독자의 인터랙션을 모두 전송가능한 자체 트래킹 라이브러리 개발
- 모든 이벤트를 AWS SNS → SQS → Kinesis → Parquet → Redshift
- Raw Event를 처리할 NodeJS서버를 만들어 내외부 데이터를 조합해서 이벤트를 enrich 한후 Kinesis에 올림
- Kinesis Firehose 를 이용해서 이벤트를 CSV로 만들어 S3에 저장
- 이벤트 중복이 일어나는 상황이 있어서, 이를 처리하는 별도의 Redshift 클러스터를 만들었더니 레이턴시가 느려짐

## G4. 2019 : 비즈니스 가치 추가에 중점을 두고 플랫폼을 리빌드
- 데이터 플랫폼을 PaaS로 바꾸고 싶었음
- 쿠버네티스 도입. ECS 에서 `EKS`로
- `Airflow` 도입
  - AWS SNS → SQS → Kinesis → Parquet → Airflow → Redshift

## G5. 2020 : 이제 실시간 데이터의 시대
- G4는 좋았지만 아직도 실시간은 불가능
- SNS, SQS, Kinesis 의 복잡한 세팅에서 Kafka로 전환 ( Amazon MSK )
- 스트림 프로세싱 플랫폼은 Apache Spark
- kafka → spark → parquet(delta lake, redshift) ↔ airflow
- 데이터 검증을 위해서 Apache Avro 도입 : Data Contract
- Redshift, S3, Kafka 등을 쿼리하기 위해서 Presto 사용

## 앞으로의 계획
- 현재 Airflow, Spark, Kafka 3가지 컴포넌트에서 데이터가 들어오는데, 이걸 CDC(Change Data Capture) 기반으로 변경 예정
- 모든 사람들이 실시간 데이터에 접속할수 있도록 변경. Data UI 를 향상시켜서 스트림처리를 드래그 & 드랍으로 가능할수 있도록