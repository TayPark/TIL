# Apache spark definitive guide

## 챕터 5 - 구조적 API 기본 연산

- `DataFrame`은 Row 타입의 **레코드**와 각 레코드에 수행할 연산 표현식을 나타내는 여러 **컬럼**으로 구성된다.
- `스키마`는 각 **컬럼명**과 **데이터 타입**을 정의한다.
- DataFrame의 **파티셔닝**은 DataFrame이나 Dataset이 클러스터에서 물리적으로 배치되는 형태를 정의한다.
- 파티셔닝 스키마는 파티션을 배치하는 방법을 정의한다.
  - 파티셔닝의 분할 기준은 특정 컬럼이나 비결정론적(매번 변하는)값을 기반으로 설정할 수 있다.

### 5.1 스키마

- 스키마는 DataFrame의 컬럼명과 데이터 타입을 정의
- 데이터소스에서 스키마를 얻거나(inference) 직접 정의

참고: 데이터를 읽기 전 스키마를 정해야하는 여부는 상황에 따라 달라진다. 비정형 분석(ad-hoc analysis)에서는 schema-on-read가 대부분 잘 동작하지만 Long 데이터 타입을 Integer 타입으로 잘못 인식하는 등 정밀도 문제가 생길 수 있어 ETL 작업에 스파크를 사용할 때에는 직접 정의하는 것이 좋다.

- 스키마는 여러 개의 **StructField** 타입 필드로 구성된 **StructType** 객체이다.
  - 이름, 데이터 타입, 컬럼이 값이 없거나 null일 수 있는 boolean 값을 가진다.
  - 스파크는 런타임에 데이터 타입이 스카마의 데이터 타입과 일치하지 않으면 오류를 발생시킨다.
  - 필요한 경우 컬럼과 관련된 메타데이터를 지정할 수 있다.
    - 메타데이터를 해당 컬럼과 관련된 정보이며 Spark MLlib에서 사용한다.
  - 스파크는 자체 데이터 타입 정보를 사용하므로 프로그래밍 언어의 데이터 타입을 스파크의 데이터 타입으로 설정할 수 없다.

### 5.2 컬럼과 표현식

- 사용자는 **표현식**으로 DataFrame의 컬럼을 선택, 조작, 제거할 수 있다.
- 스파크의 컬럼은...,

## 챕터 9 - 데이터 소스

### 9.1 데이터 API 구조

#### 9.1.1 읽기 API 구조

데이터 읽기의 핵심 구조는 다음과 같다.

```scala
DataFrameReader
  .format(...)
  .option("key", "value")
  .schema(...)
  .load(PATH)
```

- `format()` 메서드는 선택적으로 사용. 기본 값은 **parquet**
- `option()` 메서드를 이용하여 데이터를 읽는 방법에 대한 파라미터를 K-V로 설정
- `schema()` 메서드는 데이터 소스에서 스키마를 제공하거나 스키마 추론 기능을 사용하려는 경우 사용

#### 9.1.2 데이터 읽기 기초

- 스파크에서 데이터를 읽을 때에는 기본적으로 `DataFrameReader`를 사용한다.
  - 이는 `SparkSession.read` 로 접근한다.
- DataFrameReader를 얻은 다음 다음의 값을 지정해야한다.
  - format
  - schema
  - option
  - read mode
    - permissive: 기본 값. 오류 레코드의 모든 필드를 null로 지정하고 _corrupt_record라는 문자열 컬럼에 기록
    - dropMalformed: 형식에 맞지 않는 레코드가 포함된 로우를 제거
    - failFast: 형식에 맞지 않는 레코드를 만나면 즉시 종료

#### 9.1.3 쓰기 API 구조

```scala
DataFrameWriter
  .format(...)
  .option(...)
  .partitionBy(...)
  .bucketBy(...)
  .sortBy(...)
  .save()
```

- `format()`: 기본 값은 **parquet**
- `option()`: 데이터 쓰기 방법 설정
- `partitionBy, bucketBy, sortBy`: **파일 기반 데이터소스**에서 동작. 최종 파일 배치 형태 제어

#### 9.1.4 데이터 쓰기 기초

데이터소스에 데이터를 기록하기에 DataFrame의 write 속성을 이용하여 DataFrame별로 DataFrameWriter에 접근해야 한다.

```scala
dataFrame.write.format("csv")
  .option("mode", "OVERWRITE")
  .option("dataFormat", "yyyy-MM-dd")
  .option("path", PATH_TO_FILE)
  .save()
```

**저장 모드**

`.option("mode", ...)`로 설정하는 저장 모드는 스파크가 지정된 위치에서 동일한 파일이 발견됐을 때 동작 방식을 지정하는 옵션

- append: 해당 경로/파일에 덧붙임
- overwrite: 덮어씀
- errorIfExists: 기본 값. 오류를 발생시키며 작업 종료
- ignore: 아무 일도 하지 않음

### 9.2 CSV

CSV 파일은 구조적으로 보이지만 까다로운 포맷 중 하나이다. 운영 환경에서 어떤 내용이 들어있는지 어떤 구조로 되어있는지 모르기 때문이다. 그러므로 CSV reader는 많은 수의 옵션을 제공한다.

#### 9.2.1 CSV 옵션

생략

**CSV 읽기**

```scala
spark.read.format("csv")
  .option("header", "true") // 첫 번째 줄이 컬럼명인지 여부
  .option("mode", "FAILFAST") // 읽기 모드. 형식에 맞지 않으면 즉시 종료
  .option("inferSchema", "true")  // 컬럼의 데이터 타입 추론 여부
  .load(DATA_PATH)
```

스파크는 lazy execution 이므로 DataFrame 정의 시점이 아닌 runtime 시점에 오류가 발생한다. 예를 들어 DataFrame을 정의하는 시점에 존재하는 파일을 지정해도 오류가 발생하지 않는다.

#### 9.2.3 CSV 파일 쓰기

maxColumns, inferSchema 등 read에서만 가능한 옵션들을 제외하면 거의 똑같다.

### 9.3 JSON

- **multiLine** 옵션을 사용하여 줄로 구분된 방식과 여러 줄로 구성된 방식을 선택적으로 사용할 수 있다.
  - true 로 지정하면 전체 파일을 하나의 JSON 객체로 읽을 수 있다.
- JSON은 객체이기에 CSV보다 옵션 수가 적다

**읽기/쓰기**

```scala
spark.read.format("json")
  .option("mode", "FASTFAIL")
  .schema(mySchema)
  .load(DATA_PATH)
```

### 9.4 Parquet 파일

- **Parquet**은 컬럼 기반의 데이터 저장 방식을 가지며 다양한 스토리지 최적화 기술을 제공하는 오픈소스
- 분석 워크로드에 최적화
- 저장소 공간을 절약할 수 있고 전체 파일을 읽는 대신 개별 컬럼을 읽을 수 있음
- 컬럼 기반의 압축(Snappy, gzip 등)을 제공
- 읽기 연산 시 JSON이나 CSV보다 훨씬 효율적으로 동작하므로 장기 저장용 데이터로 최적
- 복합 데이터 타입 지원
  - 배열, 맵, 구조체 데이터 타입도 지원

**Parquet 읽기/쓰기**

- 옵션이 거의 없음
  - 데이터를 저장할 때 자체 스키마를 사용하여 데이터를 저장하기 때문
    - 스키마가 파일 자체에 내장되어 있어 추정이 불필요
  - DataFrame으로 표현하기 위해 정확한 스키마가 필요한 경우에만 스키마 설정
    - 하지만 이것도 거의 불필요
    - CSV의 inferSchema처럼 읽는 시점에 스키마를 알 수 있기 때문(schema-on-read)

```scala
spark.read.format("parquet")
  .load(DATA_PATH)
```

**Parquet 옵션**

| 읽기/쓰기 | 키 | 사용 가능한 값 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| 모두 | compression 또는 codec | none, uncompressed, bzip2, deflate, gzip, lz4, snappy | none | 스파크가 파일을 읽고 쓸 때 사용하는 압축 코덱 정의 |
| 읽기 | mergeSchema | true, false | spark.sql.parquet.mergeSchema 속성 설정값 | 값 설정으로 동일 테이블이나 폴더에 신규 parquet 파일에 컬럼을 점진적으로 추가할 수 있다. |

### 9.5 ORC 파일

- `ORC`는 하둡 워크로드를 위해 설계된 자기 기술적이며 데이터 타입을 인식할 수 있는 컬럼 기반의 파일 포맷
- 대규모 스트리밍 읽기에 최적화
- 필요한 레코드를 신속하게 찾아낼 수 있는 기능 통합
- 스파크는 별도의 옵션 지정 없이 데이터를 읽을 수 있음
- Parquet vs. ORC
  - Parquet는 스파크 최적화
  - ORC는 HIVE 최적화

**ORC 읽기/쓰기**

```scala
spark.read.format("orc")
  .load(DATA_PATH)
```

### 9.6 SQL DB

- 데이터베이스는 원시 파일 형태가 아니므로 고려해야 할 옵션이 많다.
  - 데이터베이스 인증 정보 및 접속 정보 등
- 스파크 클러스터에서 데이터베이스 시스템에 접속이 가능한지 네트워크 상태 확인 필요
- 데이터베이스 R/W를 위해서는 스파크 classpath에 데이터베이스의 JDBC 드라이버와 그에 맞는 JDBC driver jar를 제공해야 함

```s
$ ./bin/spark-shell \
  --driver-class-path postgres-13.x.jar \
  --jars postgres-13.x.jar
```

- 데이터베이스 옵션은 여러가지가 존재한다.
  - **url**: JDBC URL
  - **dbtable**: 읽을 JDBC 테이블
  - **driver**: 지정한 URL에 접속할 때 사용할 JDBC 드라이버 클래스명 지정
  - **partitionColumn**, **lowerBound**, **upperBound**
    - 세 옵션은 항상 같이 지정해야 하며, numPartitions도 지정해야 한다. 
    - 읽기에만 적용, 다수의 워커에서 병렬로 테이블을 나눠 읽는 방법을 정의
    - partitionColumn은 테이블의 수치형 컬럼
    - lowerBound, upperBound는 각 파티션의 범위를 결정
  - **numPartitions**
    - 테이블의 데이터를 병렬로 읽거나 쓰기 작업에 사용할 수 있는 최대 파티션 수를 결정
    - 동시 JDBC 연결 수 결정
    - 쓰기에 사용되는 파티션 수가 이 값을 초과하는 경우 연산 전 `coalesce(numPartitions)`를 실행하여 파티션 수를 줄임
  - fetchsize: 한 번에 읽을 레코드 수. Oracle은 기본값 10
  - batchsize: 한 번에 쓸 레코드 수. 기본 값 1000
  - isolationLevel: 트랜잭션 격리 수준 정의. 기본값 READ_UNCOMMITED
  - truncate
  - createTableOptions: 테이블 생성 시 특정 테이블의 데이터베이스와 파티션 옵션을 설정할 수 있음
  - createTableColumnTypes: 테이블을 생성할 때 기본값 대신 사용할 데이터베이스 컬럼 데이터 타입을 정의

#### 9.6.1 SQL DB 읽기

```scala
val sqliteDriver = "org.sqlite.JDBC"
val path = "sqlite.db"
val url = s"jdbc:sqlite:/${path}"
val tablename = "flight_info"

// 접속 테스트
import java.sql.DriverManager

val connection = DriverManager.getConnection(url)
connection.isClosed()
connection.close()

// 읽기
val dataFrameFromDb = spark.read.format("jdbc").option("url", url)
  .option("dbtable", tablename)
  .option("driver", sqliteDriver)
  .load()

// 만약 인증이 필요한 데이터베이스의 경우
val pgDF = spark.read.format("jdbc")
  .option("driver", "org.postgresql.Driver")
  .option("url", "jdbc:postgresql://database_server")
  .option("dbtable", "schema.tablename")
  // 인증파트
  .option("user", "username")
  .option("password", "my-secret-password")
  .load()
```

#### 9.6.2 쿼리 푸시다운

- 스파크는 DataFrame을 만들기 전 데이터베이스 자체에서 데이터를 필터링하도록 만들 수 있음
  - DataFrame에 필터를 명시하면 스파크는 해당 필터에 대한 처리를 데이터베이스에 위임(push-down)
  - 실행 계획의 PushedFilters 에서 확인 가능
- 모든 스파크 함수를 SQL DB에 맞게 변환하지 못하므로 전체 쿼리를 전달해 DataFrame으로 받아야 하는 경우도 있음
  - 이 경우 `.option("dbtable", TABLE_NAME)` 의 TABLE_NAME에 SQL을 작성하면 된다.

```scala
val pushdownQuery = """(SELECT DISTINCT(DEST_COUNTRY_NAME) FROM flight_info)
  AS flight_info"""

val dbDataFramePushDown = spark.read.format("jdbc")
  .option("url", url)
  .option("driver", driver)
  .option("dbtable", pushdownQuery)
  .load()
```

**데이터베이스 병렬로 읽기**

- 파티셔닝(분할)과 데이터 처리 시 파티셔닝의 중요성을 이야기함
- 스파크는 파일 크기, 파일 유형, 압축 방식에 따른 **분할 가능성**에 따라 여러 파일을 읽어 하나의 파티션으로 만들거나 여러 파티션을 하나의 파일로 만드는 기본 알고리즘을 가짐
- `numPartitions` 옵션을 사용하여 R/W용 동시 작업 수를 제한할 수 있는 최대 파티션 수를 설정 가능

```scala
val dbDataFrame = spark.read.format("jdbc")
  .option("url", url)
  .option("dbtable", tablename)
  .option("driver", driver)
  .option("numPartitions", 10)
  .load()
```
- 데이터베이스 연결을 통해 명식적으로 조건절을 SQL 데이터베이스에 위임할 수 있다.
- 조건절을 명시하여 특정 파티션에 특정 데이터의 물리적 위치를 제어할 수 있다.
  - 예제로 두 국가에 대한 필터를 데이터베이스에 위임하여 처리된 결과를 반환할 수도 있다.
  - 하지만 스파크 자체 파티션에 결과 데이터를 저장하여 더 많은 처리를 할 수 있다.

```scala
val props = new java.util.Properties
props.setProperty("driver", "org.sqlite.JDBC")
val predicates = Array(
  "DEST_COUNTRY_NAME = 'Sweden' OR ORIGIN_COUNTRY_NAME = 'Sweden'",
  "DEST_COUNTRY_NAME = 'Anguilla' OR ORIGIN_COUNTRY_NAME = 'Anguilla'",
)
spark.read.jdbc(url, tablename, predicates, props).show()
spark.read.jdbc(url, tablename, predicates, props).rdd.getNumPartitions // 2
```

- 연관성이 없는 조건절을 정의하면 중복 레코드가 많이 생길 수 있다.

**슬라이딩 윈도우 기반 파티셔닝**

- 조건절 기반 분할 방법
  - 처음과 마지막 파티션 사이 최소값 최대값 사용
  - 범위 밖 모든 값을 처음 또는 마지막 파티션에 존재
  - 전체 파티션 수를 설정(병렬 처리 수준)
  - 스파크는 데이터베이스에 병렬로 쿼리를 요청하여 numPartitions에 설정된 값만큼 파티션을 반환
  - 파티션에 값을 할당하기 위해 상한값과 하한값 수정

```scala
val colName = "count"
val lowerBound = 0L
val upperBound = 348113L // 예제 데이터베이스의 최대 수
val numPartitions = 10

// 최저~최대값 균등 분배
spark.read.jdbc(url, tablename, colName, lowerBound, upperBound, numPartitions, props).count() // 255
```

### 9.7 텍스트 파일

**텍스트 파일 읽기**

- `.textFile()` 메서드에 파일 경로 지정

**텍스트 파일 쓰기**

- 쓰기는 **컬럼이 하나만 존재해야 한다.**
- 데이터를 저장할 때 파티셔닝 작업을 수행하면 더 많은 컬럼을 저장할 수 있다.
  - 하지만 모든 파일에 컬럼을 추가하는 것이 아니라 텍스트 파일이 저장되는 디렉토리에 폴더별로 컬럼 저장

### 9.8 고급 I/O 개념

- 쓰기 작업 전 파티션 수를 조절하여 병렬로 처리할 파일 수 제어 가능
- **버켓팅**과 **파티셔닝**을 조절하여 데이터의 저장 구조를 제어

#### 9.8.1 분할 가능한 파일 타입과 압축 방식

- 파일 포맷이나 파일 시스템(HDFS 등)에 따라 분할, 분산 저장 방식이 있어 최적화 가능
- 추천하는 방식은 Parquet과 gzip

#### 9.8.2 병렬로 데이터 읽기

- 같은 파일을 동시에 읽을 수는 있지만 여러 파일을 동시에 읽을 수는 없다
- 다수의 파일이 존재하는 폴더를 읽을 때 폴더의 개별 파일은 DataFrame의 파티션이 된다
- 사용 가능한 익스큐터를 이용하여 병렬(익스큐터 수를 넘어가는 파일은 처리중인 파일이 완료될 때까지 대기)로 파일을 읽음

#### 9.8.3 병렬로 데이터 쓰기

- 데이터를 쓰는 시점에 DataFrame이 가진 파티션 수에 따라 달라짐
  - **데이터 파티션당 하나의 파일 작성**
- 옵션에 지정된 파일명은 실제로 다수의 파일을 가진 디렉토리임
  - 디렉토리 안에 파티션당 하나의 파일로 저장

**파티셔닝**

- 어떤 데이터를 어디에 저장할 것인지 제어
- 파티셔닝된 디렉토리 또는 테이블에 파일을 쓸 때 디렉토리별 컬럼 데이터를 인코딩하여 저장
- 데이터를 읽을 때 전체 데이터셋을 스캔하지 않고 필요한 컬럼의 데이터만 읽을 수 있음
  - 파일 기반의 모든 데이터 소스에서 지원
- 필터링을 자주 사용하는 테이블을 가진 경우 사용할 수 있는 가장 쉬운 최적화
  - 지난주 데이터의 통계만 필요하다면 날짜를 기준으로 파티션을 만들 수 있음

**버켓팅**

- 각 파일에 저장된 데이터를 제어할 수 있는 **파일 조직화 기법**
- 동일한 버킷 ID를 가진 데이터가 하나의 물리적 파티션에 모두 모여있기 때문에 데이터를 읽을 때 셔플을 피할 수 있음
  - 데이터가 이후 사용 방식에 맞춰 사전에 파티셔닝되므로 조인이나 집계 시 발생하는 고비용의 셔플을 피함
- 특정 컬럼을 파티셔닝하면 수억 개의 디렉토리도 생성 가능 -> 데이터 버켓팅 필요

## 챕터 10 - Spark SQL

#### 10.10.1 복합 데이터 타입

- 표준 SQL에 존재하지 않는 구조체, 리스트, 맵 타입을 다루는 방법

**구조체**

```sql
-- 괄호로 묶기
CREATE VIEW IF NOT EXISTS nested_data AS
  SELECT (DEST_COUNTRY_NAME, ORIGIN_COUNTRY_NAME) as country, count
  FROM flights

-- 개별 컬럼 조회
SELECT country.DEST_COUNTRY_NAME, count
FROM nested_data

-- 전체도 가능
SELECT country.*, count FROM nested_data
```

**리스트**

- 값의 리스트를 만드는 방법은 `collect_list`나 중복 없는 집합 생성 함수인 `collect_set` 사용
  - 두 함수 모두 집계 함수이므로 집계 연산시에만 사용

```sql
-- 집계 연산으로 사용
SELECT DEST_COUNTRY_NAME as new_name, collect_list(count) as flight_counts, collect_set(ORIGIN_COUNTRY_NAME) as origin_set
FROM flights
GROUP BY DEST_COUNTRY_NAME

-- 직접 배열 생성
SELECT DEST_COUNTRY_NAME, ARRAY(1, 2, 3) FROM flights

-- 배열 쿼리 구문으로 리스트의 특정 위치의 데이터를 쿼리
SELECT DEST_COUNTRY_NAME as new_name, collect_list(count)[0]
FROM flights
GROUP BY DEST_COUNTRY_NAME

-- **explode** 함수를 사용하여 배열을 여러 레코드로 분할
CREATE OR REPLACE TEMP VIEW flights_agg AS
  SELECT DESET_COUNTRY_NAME, collect_list(count) as collected_counts
  FROM flights
  GROUP BY DEST_COUNTRY_NAME

-- explode는 collect의 반대로 동작하기 때문에 이전의 DataFrame과 동일한 결과 반환
SELECT explode(collected_counts), DEST_COUNTRY_NAME FROM flights_agg
```

## 챕터 11 - Dataset

- Dataset은 구조적 API의 기본 데이터 타입
  - DataFrame은 Row 타입의 Dataset
    - 실제로 `type DataFrame = Dataset[Row]`로 선언
    - DataFrame API를 사용할 때 Row 객체를 변환하여 데이터 처리
- Dataset은 JVM 언어인 Java와 Scala에서만 사용 가능

- Dataset을 사용하여 데이터셋에서 원하는 객체 타입을 만들 수 있음
  - 도메인별 특정 객체를 효과적으로 지원하기 위해 **인코더(특정 객체 T를 스파크 내부 데이터 타입으로 매핑)** 사용 
    - 인코더는 런타임에서 특정 도메인 객체(case class)를 바이너리 구조로 직렬화하는 코드를 생성하도록 스파크에게 지시
    - 도메인 특화 객체를 사용하려면 스칼라의 `case class`나 자바의 `JavaBean`형태로 사용자 정의 데이터 타입을 정의해야 함
      - 이를 **Typed API** 라고도 함
    - 표준 구조적 API(DataFrame API)를 사용하면 Row 타입의 직렬화된 바이너리 구조로 변환함
    - Dataset API를 사용하면 스파크는 데이터셋에 접근할 때마다 **사용자 정의 데이터 타입으로 변환**
      - 성능 하락이 있으나 Python UDF 만큼은 아님
        - 프로그래밍 언어 변환이 UDDT(User Defined Data Type)을 사용하는 것 보다 느림
      - **프로그래밍 유연성 제공**
      - **사용 이유**
        - DataFrame 기능만으로 수행할 연산을 표현할 수 없는 경우
        - 성능 저하를 감수하더라도 타입 세이프 데이터 타입을 사용하고 싶은 경우
        - 복잡한 비즈니스 로직을 SQL이나 DataFrame 대신 단일 함수로 인코딩해야 하는 경우 발생
          - 데이터 타입이 유효하지 않은 작업은 런타임이 아닌 컴파일 타임에 오류가 발생
          - **정확도와 방어적인 코딩을 중요시한다면 성능을 희생하더라도 Dataset API를 사용하는 것이 현명**
        - 단일 노드의 워크로드와 스파크 워크도르에서 전체 로우에 대한 다양한 트랜스포메이션을 재사용할 때
          - Spark API는 Scala Sequence 타입의 API가 일부 반영되어 있지만 분산 방식으로 동작
          - Dataset을 사용하는 장점 중 하나는 로컬과 분산 환경의 워크로드에서 재사용할 수 있다는 점
            - Scala `case class`로 정의된 데이터 타입을 사용하여 모든 데이터와 트랜스포메이션을 정의하면 재사용 가능
            - 올바른 클래스와 데이터 타입이 지정된 DataFramed을 로컬 디스크에 저장하면 다음 처리 과정에서 사용할 수 있음

### 11.2 Dataset 생성

**자바**

```java
import org.apache.spark.sql.Encoders;

public class Flight implements Serializable {
  String DEST_COUNTRY_NAME;
  String ORIGIN_COUNTRY_NAME;
  Long DEST_COUNTRY_NAME;
}

Dataset<Flight> flights = spark.read.parquet(DATA_PATH)
  .as(Encoders.bean(Flight.class));
```

**스칼라**

스칼라의 `case class`는 다음과 같은 특징을 가진 정규 클래스이다.
- 불변
  - 객체가 어디서 변경되었는지 추적 필요 X
- 패턴 매칭으로 분해 가능
  - 원시 데이터 타입의 값처럼 비교
  - 로직 분기를 단순화하여 버그를 줄이고 가독성 향상
- 참조값 대신 클래스 구조를 기반으로 비교
- 사용하기 쉽고 다루기 편함

```scala
case class Flight(
  DEST_COUNTRY_NAME: String,
  ORIGIN_COUNTRY_NAME: String,
  count: BigInt  
)

val flightsDF = spark.read.parquet(DATA_PATH)
val flights = flightDF.as[Flight]
```

### 11.3 액션

- Dataset과 DataFrame에 collect, take, count 같은 액션을 적용할 수 있다.
- case class에 실제로 접근할 때 속성명을 지정하면 속성에 맞는 값과 데이터 타입 모두를 반환받을 수 있다.

### 11.4 트랜스포메이션

- DataFrame의 모든 트랜스포메이션은 Dataset에서 사용할 수 있다.
- JVM 데이터 타입을 다루기 때문에 DataFrame보다 더 복잡하고 강력한 데이터 타입으로 트랜스포메이션을 사용할 수 있다.

#### 11.4.1 필터링

```scala
// 함수 정의
def originIsDestination(flight_row: Flight): Boolean = {
  return flight_row.ORIGIN_COUNTRY_NAME == flight_row.DEST_COUNTRY_NAME
}

// 실제 필터링
flights.filter(filght_row => originIsDestination(flight_row)).first()
```

#### 11.4.2 맵핑

- 추출

```scala
val destinations = flights.map(f => f.DEST_COUNTRY_NAME)
```

### 11.5 조인

- `joinWith`같은 메소드 제공
  - co-group 과 거의 유사
  - Dataset 안쪽에 다른 두 개의 중첩된 Dataset으로 구성
- 조인 수행 시 더 많은 정보를 유지할 수 있음

```scala
case class FlightMetaData(count: BigInt, randomData: BigInt)

val flightsMeta = spark.range(500).map(x => (x, scala.util.Random.nextLong))
  .withColumnRenamed("_1", "count").withColumnRenamed("_2", "randomData")
  .as[FlightMetaData]

val flights2 = flights
  .joinWith(flightsMeta, flights.col("count") === flightsMeta.col("count"))
```

- 일반 조인도 잘 동작하나 DataFrame을 반환하므로 JVM 데이터 타입 정보를 잃음
- 이 정보를 다시 얻으려면 Dataset을 정의 해야함

### 11.6 그룹화와 집계

- groupBy, rollup, cube 사용 가능
  - **Dataset 대신 DataFrame을 반환하여 타입 정보를 잃음**
- `groupByKey`는 Dataset 특정 키를 기준으로 그룹화, 형식화된 Dataset 반환
  - 컬럼명 대신 함수를 파라미터로 사용
  - 다만 스파크는 함수와 JVM 데이터 타입을 최적화 할 수 없으므로 trade-off 발생
    - 실행 계획으로 확인 가능

```scala
flights.groupByKey(x => x.DEST_COUNTRY_NAME).count()
```

- Dataset의 키를 이용하여 그룹화를 수행한 다음 결과를 K-V 형태로 함수에 전달해 원시 객체 형태로 그룹화된 데이터를 다룰 수 있음

```scala
def grpSum(countryName: String, values: Iterator[Flight]) = {
  values
    .dropWhile(_.count < 5)
    .map(x => (countryName, x))
}

flights.groupByKey(x => x.DEST_COUNTRY_NAME).flatMapGroups(grpSum).show(5)

// 그룹 축소 예제
def sum2(left: Flight, right: Flight) = {
  Flight(lest.DEST_COUNTRY_NAME, null, left.count + right.count)
}

flights
  .groupByKey(x => x.DEST_COUNTRY_NAME)
  .reduceGroups((l, r) => sum2(l, r))
  .take(5)
```

- groupByKey 메서드는 동일한 결과를 반환하지만 **데이터 스캔 직후에 집계를 수행하는 groupBy보다 고비용**이다.
  - 그러므로 **사용자가 정의한 인코딩으로 세밀한 처리가 필요**하거나 **필요한 경우에만 Dataset의 groupByKey 메서드를 사용**해야 한다.
  - **Dataset은 빅데이터 처리 파이프라인의 처음과 끝 작업에서 주로 사용**

# Part 3. 저수준 API

## 챕터 12. RDD

- 대부분의 상황에서 구조적 API를 사용하는 것이 좋다
  - 비즈니스나 기술적 문제를 고수준의 API를 사용하여 모두 해결할 수 있는건 아니다
- 스파크 저수준 API는 RDD, SparkContext, accumulator, broadcast variable 같은 분산형 공유 변수(distributed shared variables)를 의미

### 12.1 저수준 API란

- 스파크에는 두 가지 저수준 API 존재
  - 분산 데이터 처리를 위한 RDD
  - broadcast variable, accumulator 처럼 분산형 공유 변수를 배포하고 다루기 위한 API
- 언제 사용할까
  - 고수준 API에서 제공하지 않는 기능이 필요한 경우
    - 클러스터의 물리적 데이터 배치를 세밀하기 제어
  - 기존 코드가 RDD
  - 사용자 정의 공유 변수를 다뤄야 하는 경우
- 숙련된 개발자라 하더라도 구조적 API 위주로 사용하는 것을 권장

**저수준 API 사용 방법**

- SparkContext는 저수준 API 기능을 사용하기 위한 진입점
- 스파크 클러스터에서 연산을 수행하는 데 필요한 SparkSession을 이용하여 SparkContext에 접근
  - `spark.sparkContext`

### 12.2 RDD 개요

- 사용자가 실행한 모든 DataFrame와 Dataset은 RDD로 컴파일 된다.
- 스파크 UI에서 RDD단위로 잡이 수행
- RDD란
  - 불변성
  - 병렬로 처리할 수 있는 파티셔닝된 레코드 모음
  - DataFrame의 각 레코드는 스키마를 알고 있는 필드로 구성된 구조화된 로우
  - RDD 레코드는 프로그래머가 선택하는 프로그래밍 언어의 객체
    - 사용자가 원하는 포맷을 사용하여 원하는 모든 데이터를 저장할 수 있음
    - 강력한 제어권을 가지지만 모든 값을 다루거나, 값 사이의 상호작용 과정을 수동으로 정의해야 한다는 단점
  - 레코드의 내부 구조를 스파크에서 파악할 수 없으므로 최적화에 많은 노력 필요
    - 구조적 API에서 제공하는 데이터 최적화와 압축 바이너리 포맷을 구현해야 함
    - 스파크 SQL에서 자동으로 수행되는 필터 재정렬과 집계 등의 최적화도 구현해야
  - RDD와 Dataset 전환은 쉬우므로 두 API를 모두 사용하여 각 API의 장점을 모두 활용할 수 있음

- RDD에 수많은 하위 클래스 존재
- RDD는 DataFrame API에서 최적화된 물리적 실행 계획을 만드는데 사용
- 사용자가 만들 수 있는 RDD는 두 가지
  - `Generic RDD`: 객체 컬렉션 표현
  - `K-V RDD`: 객체 컬렉션 표현 및 특수 연산 및 키를 이용한 사용자 지정 파티셔닝 개념 보유
- RDD의 주요 속성
  - 파티션의 목록
  - 각 파티션 연산 함수
  - 다른 RDD와 의존성 목록
  - K-V RDD를 위한 Partitioner(예: RDD는 Hash-partitioned 라고 말할 수 있음)
  - 각 파티션을 연산하기 위한 기본 위치 목록(예: HDFS 블록 위치)

### 12.3 RDD 생성

- `.rdd()` 메서드를 호출하면 쉽게 변환이 가능
  - Dataset[T]를 RDD로 변환하면 데이터 타입 T를 가진 RDD를 얻을 수 있음
  - 단, 파이썬에서는 DataFrame만 존재하여 Row 타입의 RDD를 얻게됨
- 해당 데이터를 처리하기 위해서는 Row 객체를 올바른 데이터 타입으로 변환하거나 Row 객체에서 값을 추출해야 함
- DataFrame이나 Dataset을 생성할 때에도 동일하게 `toDF()` 메서드를 호출
- 로컬 컬렉션으로 RDD 생성
  - 컬렉션 객체를 RDD로 만드려면 `sparkContext.parallelize()` 를 호출
    - 단일 노드에 있는 컬렉션을 병렬 컬렉션으로 전황

```scala
val myCollection = "Spark the Definitive Guide : Big data processing made simple".split(" ")
val words = spark.sparkContext.parallelize(myCollection, 2)

// RDD에 이름을 지정하면 스파크 UI에 지정한 이름으로 RDD 표시
words.setName("myWords")
words.name // "myWords"

// distinct
words.distinct().count() // 10

// filter
def startsWithS(indivisual: String) = {
  individual.startsWith("S")
}

words.filter(word => startsWithS(word)).collect()

// map
val words = words.map(word => (word, word(0), word.startsWith("S")))

// flatMap
words.flatMap(word => word.toSeq).take(5) // Array[Char] = Array(S, p, a, r, k)

// sortBy(길이가 가장 긴 순서로 나열하는 예제)
words.sortBy(word => word.length() * -1).take(2)

```

### 12.6 액션

- RDD의 모든 값을 하나의 값으로 만드려면 `reduce`를 사용

```scala
// 정수
spark.sparkContext.parallelize(1 to 20).reduce(_ + _) // Int = 210

// 문자열
def wordLengthReducer(leftWord: String, rightWord: String): String = {
  if (leftWord.length > rightWord.length)
    return leftWord
  else
    return rightWord
}

words.reduce(wordLengthReducer)

words.take(5)
words.takeOrdered(5)
words.top(5)
words.takeSample(true, 6, 100L)
```


### 12.8 캐싱

- RDD 캐싱도 DataFrame와 Dataset과 동일한 원칙이 적용
- 캐시와 저장은 메모리에 있는 데이터를 대상으로 한다.
- setName() 을 사용하면 캐시된 RDD에 이름을 지정할 수 있다.
- 저장소 수준은 싱글턴 객체인 org.apache.spark.storage.StorageLevel의 속성 으로 정한다.
  - memory
  - disk
  - off-heap
  - words.getStorageLevel 로 저장소 수준을 알 수 있다.

### 12.9 체크포인팅

- DataFrame에 없는 기능 중 하나
- RDD를 디스크에 저장하는 방식
- 저장된 RDD를 참조할 때에는 원본 데이터 소스를 다시 계산하여 RDD를 생성하지 않고 디스크에 중간 결과 파티션을 참조
- 반복적인 연산 수행시 매우 유용

```scala
spark.sparkContext.setCheckPointDir(SOME_PATH_HERE)
words.checkPoint()
```

### 12.10 RDD를 시스템 명령으로 전송

- pipe 메서드를 사용하면 파이핑 요소로 생성된 RDD를 외부 프로세스로 전달할 수 있음
- 외부 프로세스는 파티션마다 한 번씩 처리해 결과 RDD를 생성
- 각 입력 파티션의 모든 요소는 개행 문자 단위로 분할되어 여러 줄의 입력 데이터로 변경된 후 프로세스의 stdin으로 전달
- 결과 파티션은 프로세스의 stdout으로 생성
- 비어있는 파티션일 처리해도 프로세스 실행

```scala
words.pipe("wc -l").collect()
```

### 13. RDD 고급

```scala
// PairRDD 타입을 만들기 위한 map 연산
words.map(word => (word.toLowerCase, 1))

// 현재 값으로부터 키를 생성 = (s, Spark) 형태의 Array[(String, String)]
val keyword = words.keyBy(word => word.toLowerCase.toSeq(0).toString)

// 값 맵핑
keyword.mapValues(w => w.toUpperCase).collect()

// 모든 value에 대해 split하여 같은 key에 매핑
keyword.flatMapValues(w => w.toUpperCase).collect()

// 키-값 추출
keyword.keys.collect()
keyword.values.collect()

// lookup - 특정 키에 관한 결과 찾기
keyword.lookup("s") // 키가 "s" 인 인자 반환

// sampleByKey

```

### 13.5 파티션 제어

- RDD를 사용하여 데이터가 클러스터 전체에 물리적으로 정확히 분산되는 방식을 정의할 수 있음



```scala
// coalesce: 파티션을 재분배할 때 발생하는 데이터 셔플을 방지하기 위해 동일한 워크에 존재하는 파티션을 합치는 메서드
words.coalesce(1).getNumPartitions // 1

// repartition
words.repartition(10) // 10개 파티션 생성

// repartitionAndSortWithinPartitions
```

#### 13.5.4 사용자 정의 파티셔닝

- 구조적 API에서 사용자 정의 파티셔너를 파라미터로 사용할 수 없음
- RDD를 사용하는 가장 큰 이유 중 하나
  - 데이터 치우침(skew) 문제를 피하고자 클러스터 전체에 걸쳐 데이터를 균등 분해하는 것이 목적
  - PageRank가 대표적
    - 클러스터의 데이터 배치 구조를 제어하고 셔플을 회피
  - 논리적 대응책이 없음
- 저수준 API의 세부적인 구현 방식
- 사용자 정의 파티셔너를 사용하기 위해
  1. 구조적 API로 RDD를 얻고
  2. 사용자 정의 파티셔너를 적용한 다음
  3. 다시 DataFrame이나 Dataset으로 변환
- Partitioner를 확장한 클래스 구현
- 단일 값이나 다수 값(다수 컬럼)을 파티셔닝 해야한다면 DataFrame API를 활용하는 것이 좋음

```scala
import org.apache.spark.HashPartitioner

rdd.map(r => r(6)).take(5).foreach(println)
val keyedRdd = rdd.keyBy(row = row(6).asInstanceOf[Int].toDouble)

keyedRdd.partitionBy(new HashPartitioner(10)).take(10)
```

- HashPartitioner와 RangePartitioner는 기초적인 기능 제공
- 매우 큰 데이터나 심각하게 치우친 키를 다뤄야 한다면 고급 파티셔닝 기능 사용
- 병렬성을 개선하고 실행 과정에서 OOM을 방지할 수 있도록 키를 최대한 분할
- 키가 특정 형태를 띠는 경우에도 키를 분할
  - 데이터셋에 항상 분석 작업을 어렵게 만드는 레코드가 있다면 하나의 그룹으로 묶어 처리할 수도 있음

### 13.6 사용자 정의 직렬화

- **Kryo 직렬화**
  - 자바 직렬화보다 약 10배 이상 성능, 더 간결
  - 최상의 성능을 얻기 위해 사용할 클래스를 사전에 등록 필요
  - SparkConf를 사용하여 초기화하는 시점에서 `spark.serializer` 속성을 `org.apache.spark.serializer.KryoSerializer`로 설정
  - 기본값이 아닌 이유는 사용자가 직접 클래스를 등록해야 하기 때문
  - 스파크 2.0 버전부터는 단순 데이터 타입과 배열, 문자열 데이터 타입의 RDD를 셔플링하면 내부적으로 Kryo 사용
  - 

```scala
class SomeClass extends Serializable {
  var someValue = 0
  def setSomeValue(i: Int) = {
    someValue = i
    this
  }
}

sc.parallelize(1 to 10).map(num => new SomeClass().setSomeValue(num))

// Kryo에 사용자 정의 클래스 등록
val conf = new SparkConf()
  .setMaster()
  .setAppName()
conf.registerKryoClasses(Array(classOf[MyClass1], classOf[MyClass2]...))
val sc = new SparkContext(conf)
```

## 챕터 14. 분산형 공유 변수

### 14.1 브로드캐스트 변수

- 클러스터에서 효율적으로 공유하는 방법을 제공
  - 기존에는 불변성 값을 closure 함수의 변수로 캡슐화
  - 클로저 함수에서 변수를 사용할 때 워커 노드에서 여러 번(태스크 당 1회) 역직렬화가 발생, 비효율적
  - 여러 스파크 액션과 잡에서 동일한 변수를 사용하면 잡을 실행할 때마다 워커로 큰 변수를 재전송
- `브로드캐스트 변수`: 모든 태스크마다 직렬화하지 않고 클러스터의 모든 머신에 캐시하는 공유 변수

```scala
val supplementalData = Map("Spark" -> 1000, "Definitive" -> 200, "Big" -> -300, "Simple" -> 100)
// 액션을 실행할 때 클러스터의 모든 노드에 지연 처리 방식으로 복제
val suppBroadcast = spark.sparkContext.broadcast(supplementalData)
// 브로드캐스트 값 접근. 직렬화된 함수에서 브로드캐스트된 데이터를 직렬화하지 않아도 접근 가능
suppBroadcast.value
// 이를 이용하여 RDD 변환 가능
words.map(word => (word, suppBroadcast.value.getOrElse(word, 0))) // 비어있을 경우 0으로 처리
  .sortBy(wordPair => worPair._2)
  .collect()
```

- 큰 데이터를 사용하는 경우 전체 태스크에서 데이터를 직렬화하는 데 발생하는 부하가 크므로 브로드캐스트 변수 활용
- UDF나 Dataset에서도 사용할 수 있음

### 14.2 Accumulator

- 트랜스포메이션 내부의 다양한 값을 갱신
- 내고장성 보장, 효율적인 방식으로 드라이버에 값 전달
- 스파크 클러스터에서 로우 단위로 안전하게 값을 갱신할 수 있는 변경 가능한 변수 제공
- 디버깅용, 저수준 집계 생성용 사용
  - 파티션별 특정 변수의 값 추적
- ACC 값은 액션을 처리하는 과정에서만 갱신
  - 스파크는 각 태스크에서 ACC를 한 번만 갱신하도록 제어
  - 재시작한 태스크는 ACC값을 갱신할 수 없음
  - 트랜스포메이션에서 태스크나 잡 스테이지를 재처리하는 경우 각 태스크의 갱신 작업이 두 번 이상 적용될 수 있음
- 지연 연산 모델에 영향을 주지 않음
  - RDD 처리 중에 갱신되면 **RDD 연산이 실제로 수행된 시점에 한 번만 값 갱신**
- ACC의 이름은 선택적으로 지정할 수 있으며 이름이 지정된 ACC 실행 결과는 Spark UI에 표시됨
  - 이름이 지정되지 않으면 표시되지 않음

```scala
// 비행 데이터 활용
import org.apache.spark.util.LongAccumulator

val accChina = new LongAccumulator
val accChina2 = spark.sparkContext.longAccumulator("China")
spark.sparkContext.register(accChina, "China")

// 함수 파라미터로 문자열값을 전달하거나 register 함수의 두 번째 파라미터로 이름을 지정
def accChinaFunc(flight_row: Flight) = {
  val dest = flight_row.DEST_COUNTRY_NAME
  val origin = flight_row.ORIGIN_COUNTRY_NAME

  if (dest == "china") {
    accChina.add(flight_row.count.toLong)
  }

  if (origin == "China") {
    accChina.add(flight_row.count.toLong)
  }
}

// 전체 로우 처리
flights.foreach(flight_row => accChinaFunc(flight_row))

// 조회
accChina.value

// 사용자 정의 ACC
import scala.collection.mutable.ArrayBuffer
import org.apache.spark.util.AccumulatorV2

val arr = ArrayBuffer[BigInt]()

class EvenAcc extends AccumulatorV2[BigInt, BigInt] {
  private var num: BigInt = 0
  
  def reset(): Unit = {
    this.num = 0
  }
  def add(value: BigInt): Unit = {
    if (value % 2 == 0) {
      this.num += value
    }
  }
  def merge(other: AccumulatorV2[BigInt, BigInt]): Unit = {
    this.num += other.value
  }
  def value(): BigInt = {
    this.num
  }
  def copy(): AccumulatorV2[BigInt, BigInt] = {
    new EvenAcc
  }
  def isZero(): Boolean = {
    this.num == 0
  }
}

val acc = new EvenAcc
val newAcc = sc.register(acc, "evenAcc")
acc.value
flights.foreach(flight_row => acc.add(flight_row.count))
acc.value
```

## 챕터 15. 클러스터에서 스파크 실행하기

### 스파크 아키텍처

- `스파크 드라이버`
  - 스파크 애플리케이션 **실행 제어**
  - 스파크 클러스터(익스큐터의 상태와 태스크)의 모든 상태정보 유지
  - 물리적 컴퓨팅 자원 확보와 익스큐터 실행을 위해 클러스터 매니저와 통신
  - 물리적 머신 프로세스, 클러스터에서 실행중인 애플리케이션 상태 유지
- `스파크 익스큐터`
  - 스파크 드라이버가 할당한 **태스크를 수행하는 프로세스**
  - 드라이버가 할당한 태스크를 받아 실행하고 태스크의 상태와 **결과를 드라이버에 보고**
  - 모든 스파크 애플리케이션은 개별 익스큐터 프로세스 사용
- `클러스터 매니저`
  - 애플리케이션 **실행 머신 자원 할당 및 관리**
  - **스파크 애플리케이션과 관련된 프로세스를 유지**
  - 종류
    - 스탠드얼론
    - 아파치 Mesos
    - 하둡 YARN

### 실행 모드

**클러스터 모드**

- 가장 흔하게 사용
- 컴파일된 JAR 파일이나 파이썬 스크립트 또는 R 스크립트를 클러스터 매니저에게 전달
  - 클러스터 매니저는 파일을 받아 워커 노드에게 드라이버와 익스큐터 프로세스 실행

**클라이언트 모드**

- 애플리케이션을 제출한 클라이언트 머신에 스파크 드라이버가 위치
- 클라이언트는 스파크 드라이버 프로세스를 유지, 클러스터 매니저는 익스큐터 프로세스 유지

**로컬 모드**

- 모든 스파크 애플리케이션이 단일 머신에서 실행
- 애플리케이션 병렬 처리를 위해 단일 머신의 스레드 활용
- 테스트, 개발, 실험 용도. 운영용으로 비추천

### 스파크 애플리케이션 생애주기(외부)

spark-summit 명령어를 사용하는 예제

1. 클라이언트 요청
  - 애플리케이션 제출(JAR, 라이브러리 파일)
  - **스파크 드라이버 프로세스의 자원을 함께 요청**
  - 클러스터 매니저는 요청을 수락하고 클러스터 노드 중 하나에 드라이버 프로세스 실행
  - 스파크 잡을 제출한 클라이언트 프로세스는 종료됨
2. 시작
  - 사용자 코드에는 스파크 클러스터를 초기화하는 **SparkSession**이 포함
    - SparkSession은 클러스터 매니저와 통신, 스파크 익스큐터 프로세스의 실행을 요청
   - 클러스터 매니저는 익스큐터 프로세스를 시작하고 결과를 받아 익스큐터의 위치와 관련된 정보를 드라이버 프로세스로 전송
   - 모든 작업이 완료되면 **스파크 클러스터**가 완성
3. 실행
  - 코드 실행
  - 드라이버와 워커노드는 코드를 실행하고 데이터를 이동하는 과정에서 서로 통신
  - 드라이버는 각 워커에 태스크 할당
  - 태스크를 받은 워커는 태스크의 상태와 성공/실패 여부를 드라이버에 전달
4. 완료
  - 성공 또는 실패로 종료
  - 클러스터 매니저는 드라이버가 속한 스파크 클러스터와 모든 익스큐터를 종료시킴
  - 스파크 애플리케이션 성공/실패 여부를 클러스터 매니저에 요청하여 확인 가능

### 스파크 애플리케이션 생애주기(내부)

1. SparkSession
  - 모든 스파크 애플리케이션이 가장 먼저 생성하는 것
  - 대화형 모드에서는 자동으로 생성되지만, 애플리케이션을 만드려면 직접 생성해야 함
    - SparkSession의 `builder()`를 사용하면 스파크와 스파크 SQL 컨텍스트를 안전하게 생성 가능
      - 다수의 라이브러리가 세션을 생성하려는 상황에서 컨텍스트 충돌 방지
2. SparkContext
  - 스파크 클러스터에 대한 연결
  - 스파크 저수준 API 사용(RDD)
  - 대부분 SparkSession으로 SparkContext에 접근할 수 있으므로 명시적인 초기화는 필요없음
3. 논리적 명령
  - (모니터링 관련된 내용은 스파크 UI를 사용하면 더 자세하게 추적 가능)
  - collect 같은 액션을 호출하면 개별 **스테이지**와 **태스크**로 이루어진 스파크 **잡** 실행
4. 스파크 잡
  - 액션 하나당 하나의 스파크 잡 생성, 액션은 항상 결과 반환
  - 스테이지
    - 다수의 머신에서 동일한 연산을 수행하는 태스크 그룹
    - 스파크는 가능한 많은 태스크(트랜스포메이션)을 동일한 스테이지에 묶으려 함
    - 셔플 작업 이후에는 반드시 새로운 스테이지 시작
   - 태스크
     - 스테이지는 태스크로 구성
     - 각 태스크는 **익스큐터에서 실행할 데이터의 블록과 다수의 트랜스포메이션의 조합**
       - 하나의 파티션의 경우 하나의 태스크만 생성
       - 1000개의 작은 파티션으로 구성되어 있다면 1000개의 태스크를 만들어 병렬로 실행 가능
     - 파티션 수를 늘리면 더 높은 병렬성을 얻을 수 있음(최적화)
5. 세부 실행 과정
  - 스파크는 map 연산 후 다른 map 연산이 이어진다면 **함께 실행할 수 있도록 스테이지와 태스크를 자동으로 연결**
  - 스파크는 모든 셔플을 작업할 때 데이터를 안정적인 저장소(디스크 등)에 저장하므로 여러 잡에서 재사용 가능
  - 파이프라이닝
    - 스파크의 최적화는 RDD와 RDD보다 저수준의 파이프라이닝임
    - 노드 간 데이터 이동 없이 각 노드가 데이터를 직접 공급할 수 있는 연산만 모아 태스크의 단일 스테이지로 만듦
    - 스파크 런타임에서 파이프라이닝을 자동으로 수행
  - 셔플 결과 저장(shuffle persistence)
    - 노드 간 복제를 유발하는 연산을 실행하면 엔진에서 파이프라이닝을 수행하지 못하므로 네트워크 셔플이 발생
      - 입력 데이터를 먼저 여러 노드로 복사
      - 소스 태스크의 스테이지가 실행되는 동안 셔플 파일을 로컬 디스크에 기록
      - 그 다음에 그룹화나 reduce를 실행
        - 셔플 파일에서 레코드를 읽어 들인 다음 연산 수행

## 챕터 16. 스파크 애플리케이션 개발

생략

### 16.2 스파크 애플리케이션 테스트

**전략적 원칙**

- 입력 데이터에 대한 유연성
  - 다양한 입력 데이터에 유연하게 대처할 수 있어야
- 비즈니스 로직 변경에 대한 유연성
- 결과의 유연성과 원자성
  - 결과를 의도한 대로 반환하는지 확인
  - 대부분의 스파크 파이프라인은 다른 스파크 파이프라인의 입력으로 사용

**테스트 코드 작성 시 고려사항**

- SparkSession 관리
  - JUnit이나 ScalaTest 프레임워크로 테스트 가능
  - 로컬모드의 SparkSession을 만들어 사용
  - **스파크 코드에서 DI 방식으로 SparkSession을 관리하도록 만들어야 함**
- 테스트 코드용 스파크 API 선정
  - API 유형에 상관없이 각 함수의 입력과 출력 타입을 문서로 만들고 테스트 해야 함
  - 대규모 애플리케이션이나 저수준 API를 사용해 성능을 완전히 제어하려면 Scala, Java 같은 정적 데이터 타입 언어 사용 권장

### 16.3 개발 프로세스

- 대화형 노트북을 활용
  - 운영용 애플리케이션처럼 실행할 수 있는 도구도 참고
- 여러 shell을 활용

### 16.4 애플리케이션 시작

### 16.5 애플리케이션 환경 설정

- 애플리케이션 속성
  - spark.app.name
  - spark.driver.cores
  - spark.driver.maxResultSize
  - spark.driver.memory
  - spark.executor.memory
  - spark.master 등
- 런타임 환경
  - 드라이버와 익스큐터를 위한 추가 클래스패스, 파이썬패스, 파이썬 워커 설정이나 로그 설정 포함
- 셔플 동작 방식
- 스파크 UI
- 압축, 직렬화
- 메모리 관리
- 처리 방식
- 네트워크 설정
- 스케줄링
- 동적 할당
- 보안
- 암호화
- 스파크 SQL
- 스파크 스트리밍
- SparkR

**애플리케이션 잡 스케줄링**

- 스파크 애플리케이션에서 별도의 스레드를 활용하여 여러 잡을 동시에 수행 가능
- 기본적으로 FIFO 방식으로 동작
- 모든 잡이 클러스터 자원을 거의 동일하게 사용할 수 있도록 RR 방식으로 여러 스파크 태스크를 할당

## 챕터 17. 스파크 배포 환경

생략

## 챕터 18. 모니터링과 디버깅

모니터링 범위
- 스파크 애플리케이션과 잡
- JVM
  - jstack, jmap(heap dump), jstat(time series), jconsole(JVM 속성 변수 시각화)
- OS와 머신
  - dstat, iostat, iotop
- 클러스터
  - YARN, Mesos, Standalone 클러스터 매니저 모니터링
  - Ganglia, Prometheus

디버깅 생략

## 챕터 19. 성능 튜닝

- 코드 수준 설계
- 보관용 데이터
- 조인
- 집계
- 데이터 전송
- 애플리케이션별 속성
- 익스큐터 프로세스의 JVM
- 워커노드
- 클러스터와 배포 환경 속성
- 테이블 파티셔닝
  - 데이터의 날짜 필드 같은 키를 기준으로 개별 디렉터리에 파일을 저장하는 것
  - **자주 필터링 되는 컬럼을 기준으로 파티션 생성 권장**
    - 쿼리에서 읽어야 하는 데이터 양을 크게 줄일 수 있음
- 버켓팅
  - 사용자가 조인이나 집계를 수행하는 방식에 따라 데이터를 사전 분할할 수 있음
  - 데이터를 한 두 파티션에 치우치지 않고 전체 파티션에 균등하게 분산시킬 수 있음
    - 성능과 안정성 향상
  - 조인전에 발생하는 셔플을 미리 방지 -> 데이터 접근 속도 향상
- 데이터 지역성
  - 네트워크를 통해 데이터 블록을 교환하지 않고 특정 데이터를 가진 노드에서 동작할 수 있도록 지정
  - 저장소 시스템이 스파크와 동일한 노드에 있고 해당 시스템이 데이터 지역성 정보를 제공한다면 스파크는 입력 데이터 블록과 최대한 가까운 노드에 태스크를 할당하려 함
  - 로컬 저장소로부터 데이터를 읽을 수 있을 상황을 알게되면 기본적으로 데이터 지역성을 활용하여 효율적으로 처리
- 통계 수집
  - 스파크 구조적 API를 사용하면 기본적으로 RBO가 동작하지만 정보가 필요하다
    - **사용가능한 테이블과 관련된 통계를 수집하고 유지해야 함**
  - 통계에는 **테이블 수준**과 **컬럼 수준** 두 가지 종류가 있음
  - 통계는 이름이 지정된 테이블에서만 사용할 수 있으며 임의의 DataFrame이나 RDD에서 사용할 수 없음
    - 테이블 수준 통계 수집: `ANALYZE TABLE table_name COMPUTE STATISTICS`
    - 컬럼 수준 통계 수집: `ANALYZE TABLE table_name COMPUTE STATISTICS FOR COLUMNS col1, col2 ...`
      - 컬럼 수준 통계가 수집이 더 오래 걸리지만 RBO에서 사용할 수 있는 데이터 컬럼과 관련된 정보를 더 많이 제공
- 메모리 부족과 가비지 컬렉션
  - 메모리가 부족하거나 메모리 압박으로 인해 태스크를 완료하지 못할 수도 있음 이유로는
    1. 애플리케이션 실행 중 메모리를 너무 많이 사용한 경우
    2. GC가 자주 수행
    3. JVM 내에 객체가 많이 생성되어 더 이상 사용하지 않는 객체를 GC가 정리하면서 실행속도 저하
      -> 구조적 API 활용. 스파크 잡의 효율성이 높아지고 JVM 객체를 생성하지 않음!

- 병렬화
  - `spark.default.parallelism`과 `spark.sql.shuffle.partitions`의 값을 클러스터 코어 수에 맞게 설정
  - 스테이지에서 처리해야 할 데이터양이 매우 많다면 클러스터 CPU 코어당 2-3개의 태스크 할당
- 필터링 향상
  - **스파크 잡에서 필터링을 가장 먼저 수행하도록 유도**
    - 상황에 따라 데이터소스에 필터링을 위임하여 최종 결과와 무관한 데이터를 스파크에서 읽지 않도록 함
- 파티션 재분배와 병합
  - 파티션 재분배는 셔플 수반
  - 하지만 클러스터 전체에 걸쳐 데이터가 균등하게 분배되므로 잡의 전체 실행 단계를 최적화 할 수 있음
  - **일반적으로 가능한 적은 양의 데이터를 셔플하는 것이 좋음**
    - 셔플 대신 동일 노드의 파티션을 하나로 합치는 **`colaesce`를 실행하여 전체 파티션을 먼저 줄임**
  - 파티션 재분배는 조인이나 캐싱(.cache) 호출시 유용
- UDF 사용 피하기
  - UDF는 데이터를 JVM 객체로 변환하고 쿼리에서 레코드당 여러 번 수행되므로 많은 자원 소모
  - 구조적 API를 최대한 활용하는 것이 좋음
- 캐싱
  - 지연 연산 -> 데이터에 접근해야 캐싱이 일어남
  - 대화형 세션이나 스탠드얼론 애플리케이션에서 특정 데이터셋을 다시 사용하려 할 경우 사용
- 조인
  - 동등 조인이 최적화하기 가장 좋으므로 우선적으로 사용하는 것 권장
  - 조인 순서를 변경하는 것도 도움
  - 카테시안 조인과 외부 조인을 피할 것
- 집계
  - 가능하면 groupByKey 대신 reduceByKey 사용

정리
1. 파티셔닝과 효율적인 바이너리 포맷을 사용하여 가능하면 작은 데이터를 읽는다
2. 충분한 병렬성을 보장하고 파티셔닝을 사용하여 데이터 치우침 현상 방지
3. 최적화된 코드를 제공하는 구조적 API를 최대한 활용

## 카탈리스트 옵티마이저

source: https://www.youtube.com/watch?v=GDeePbbCz2g&ab_channel=SparkSummit, https://databricks.com/blog/2015/04/13/deep-dive-into-spark-sqls-catalyst-optimizer.html

카탈리스트 옵티마이저는 predicate pushdown, constant folding, reordering 등의 변환을 통해 **논리적 쿼리 계획에서 최적화된 물리적 쿼리 계획를 생성하는 방법을 말한다.**

### 분석 단계

- SQL 파서가 반환하는 AST(추상 구문 트리) 또는 API를 사용하여 생성된 DataFrame에서 계산
- SparkSQL은 Catalyst 규칙과 모든 데이터 소스의 catalog 개체를 이용하여 최적화
- 해결되지 않은 논리적 계획을 생성한 다음 최적화 시작

### 논리적 최적화

- Constant folding, Predicate pushdown, Projection pruning 등 수행
  - 계산 수행 방법을 정의하지 않고 데이터 세트에 대한 계산 설명
  - 스캔, 필터, 조인, 프로젝션, 집계 등

### 물리적 계획

- 물리 연산자가 Spark 실행 엔진과 일치하는 것을 사용하여 논리적 계획에서 하나 이상의 물리적 계획 형성
- 비용 모델을 사용하여 계획 선택
- 비용 기반 최적화, 조인 알고리즘 선택

### CodeGen

- 각 시스템에서 실행할 Java bytecode를 생성하는 것을 포함
- Whole-stage codegen
  - Spark SQL의 물리적 쿼리 최적화 단계
  - 단일 Java 기능 형성
- 전체 Java 코드 생성은 쿼리 트리의 불필요한 호출을 제거하고 중간 데이터에 CPU 레지스터 캐싱을 활용하여 실행 성능 향상

카탈리스트 옵티마이저는 다음의 순서를 따른다.

1. Unresolved logical pland을 catalog로 분석, Logical plan 생성
2. Logical plan을 데이터 소스로의 최적화 위임(predicate pushdown), 상수 계산 최적화(constant folding), projection, reordering 등으로 Logical plan을 최적화한다.
3. 해당 Logical plan으로 physical plan을 생성
  1. 여러 전략(strategies)으로 변환
  2. Rule executor 로 실행 준비
  3. 물리적 최적화 실행

## 텅스텐 옵티마이저

https://www.linkedin.com/pulse/catalyst-tungsten-apache-sparks-speeding-engine-deepak-rajak/

- CPU 및 메모리 효율성을 위해 Spark 작업을 최적화, Spark 실행 개선(네트워크, 디스크 IO 제외)
  1. 바이너리 인 메모리 데이터 표현 사용, 명시적 메모리 관리(off heap memory management)
  2. 높은 캐시 적중률을 위한 캐시 지역성
  3. 전체 단계 코드 생성(`CodeGen`)

### 파이프라이닝

- 데이터의 단일 파티션에서 가능한 많은 작업을 실행하려는 작업
- 데이터의 단일 파티션이 RAM으로 읽히면 Spark는 가능한 많은 좁은 작업을 단일 작업으로 결합
- 광범위한 작업은 셔플을 강제하고 파이프라인 종료

### 셔플

- 익스큐터 프로그램 간 데이터를 이동해야 하는 경우 셔플이 트리거
- 셔플을 수행하기 위해 Spark 가 다음을 수행
  - Tungsten binary 형식인 `UnsafeRow`로 변환
  - 해당 데이터를 로컬 노드의 디스크에 씀
  - 와이어를 통해 데이터를 다른 익스큐터로 보냄
  - 드라이버는 어떤 익스큐터가 어떤 데이터를 가져오는지 결정
  - 그 다음 익스큐터 프로그램은 다른 익스큐터 프로그램의 셔플 파일에서 필요한 데이터를 가져옴
  - 새 익스큐터 프로그램의 RAM에 데이터를 다시 복사
  - **임시 파일에서 사용가능한 캐시로 변환하는 과정**

**UnsafeRow(텅스텐 바이너리)**

- 텅스텐은 한 JVM에서 다른 JVM으로 데이터를 가져오기 위해 고비용의 객체 직렬화 및 역직렬화를 방지
- 셔플된 데이터는 UnsafeRow보다 일반적으로 Tungsten Binary Format으로 알려진 형식
- UnsafeRow는 SparkSQL, DataFrame, Dataset에 대한 인메모리 저장 형식
- 장점
  - 컴팩트
  - 로우 값이 (RDD와 마찬가지로) JVM객체가 아닌 사용자 지정 인코더를 사용하여 인코딩
  - Spark 2.x의 사용자 지정 인코더를 사용하면 인코딩/디코딩 속도가 압도적으로 증가
  - 사용자 지정 데이터 유형의 경우 사용자 지정 인코더를 처음부터 작성 가능
  - 효율성: Spark는 텅스텐 데이터를 JVM 객체로 직렬/역직렬화 하지 않아도 직접 작동
- 작동 원리
  - 레코드 안에 3개의 데이터(123, "data", "bricks")가 있다고 가정한다.
  - 첫 번째 필드는 처음 자리에 위치한다.
  - 그 다음은 두 번째 필드에 대한 바이트 오프셋(4글자이므로 32L)을 저장한다. 마찬가지로 세 번째 필드에 대한 바이트 오프셋(48L)도 저장한다.
  - 그 다음으로 길이 데이터 4, 그 다음으로 "data"가 들어간다.
  - 마찬가지로 6, "bricks"가 들어간다.

**Stages**

- 데이터를 셔플할 때, stage boundary를 생성한다.
  - stage boundary는 프로세스 병목을 나타낸다.
- 스파크 잡이 다음과 같다고 가정한다
  - Read, Select, Filter, GroupBy, Select, Filter, Write
  - 이 경우 스파크는 두 개의 스테이지로 나눈다.
    - Read, Select, Filter, GroupBy 1/2, shuffle write
    - shuffle read, GroupBy 2/2, Select, Filter, Write
  - 스테이지 1에서 스파크 데이터를 RAM으로 디코딩하는 파이프라인을 만든 다음 순서를 진행한다.
    - 모든 작업이 완료될 때까지 모든 파티션에서 모든 레코드를 그룹화 할 수 없다
    - 모든 작업이 동기화되어야한다.
    - 이로 인해 병목이 발생한다.
      - 병목 외에도 디스크IO, 네트워크IO 등의 성능 저하가 발생
    - 데이터가 셔플된 이후에 실행을 재개할 수 있다.

**Lineage**

- 개발자의 관점에서 Read, Select, Filter, GroupBy, Select, Filter, Write 는 순서대로 실행될 것이라고 생각한다.
- 스파크는 반대로 작업한다.
  - 이미 한 번 실행했다고 가정한다면 데이터 셔플이 발생했을 때, 셔플된 데이터는 다양한 익스큐터에 존재한다.
  - Transformation은 immutable 이기 때문에 변하지 않는다.
  - 즉 마지막 셔플의 결과를 재사용할 수 있다.

**Caching**

- 스파크 캐싱은 한 번만 읽고 캐싱한 다음 이를 여러 트랜스포메이션에서 사용할 수 있도록 한다.
- 즉, 이 Transformation을 위한 작업을 제외한 이전 작업들을 생략할 수 있다.
  - 이전 셔플을 포함하는 lineage의 작업을 수행하지 않는다

## 챕터 20. 스트림 처리의 기초

- 스파크는 2012년부터 map이나 reduce 같은 고수준의 함수형 연산자를 이용하여 스트림 처리를 할 수 있었음
  - Spark Streaming
  - DStream API
    - DStream API는 자바나 파이썬 객체에 대한 저수준 연산만 지원하기 때문에 고수준 최적화에 한계가 있었음
- 이에 2016년, 구조적 스트리밍 추가

### 20.1 스트림 처리란

- 신규 데이터를 끊임없이 처리하여 결과를 만들어내는 행위
- 입력 데이터는 스트림 처리 시스템에 도착한 일련의 이벤트들임
- 스트리밍 애플리케이션은 이벤트 스트림이 도착한 후 다양한 쿼리 연산을 수행

### 20.1.2 스트림 처리의 장점

- 실시간성
- 자동으로 연산 결과의 incremental을 생성하므로 반복 배치작업보다 결과를 수정하는데 더 효율적

### 20.1.3 스트림 처리의 과제

- 입력 데이터가 지연되거나 재전송됐을 때, 순서가 맞지 않을 수 있음
  - 그러기 위해서는 일부 **상태**를 유지해야 함
- 대규모의 상태 정보 유지
- 높은 데이터 스루풋 보장
- 장애에도 정확한 트랜잭션 처리
- 부하 불균형과 뒤처진 서버 다루기
- 이벤트에 빠르게 응답하기
- 다른 저장소 시스템와 외부 데이터 조인
- 신규 이벤트 도착 시 출력 싱크의 갱신 방법 결정
- 출력 시스템에 데이터 저장 시 트랜잭션 보장
- 런타임에 비즈니스 로직 변경

### 20.2 스트림 처리의 핵심 설계 개념

- 레코드 단위 처리(record-at-a-time)와 선언형(declarative) API
  - 각 이벤트를 애플리케이션에 전달하고 사용자 코드에 반응하도록 설계
  - 레코드 단위 처리 API를 사용하는 스트리밍 시스템은 애플리케이션 내부에서 여러 처리 파이프라인을 연결하는 기능만 제공
    - 이런 이유로 최신 스트리밍 시스템에서는 선언형 API 제공
  - 선언형 API는 애플리케이션에서 **how**보다(어떻게 데이터 처리, 어떻게 장애를 복구) **what**을 처리할지 결정
- 이벤트 시간과 처리 시간
  - 선언형 API를 사용하는 시스템을 구현하려면 **자체적으로 이벤트 시간 처리(레코드의 타임스탬프 기반 시계열 데이터)를 지원할지 고민해야 함**
  - 이벤트 시간 처리: 데이터 소스에서 레코드에 기록한 타임 스탬프를 기반으로 데이터 처리
    - 늦게 도착한 이벤트를 처리할 수 있도록 상태 추적
    - 시스템이 해당 시점까지 모든 입력 데이터를 수신했을 가능성이 높은 시기에 데이터 처리 유도
  - 처리 시간 기준 처리: 애플리케이션에 레코드가 도착한 시간을 기반으로 처리
    - 이 경우 순서가 섞일 수 있음
  - 일반적인 **선언형 시스템 API는 이벤트 시간 처리를 기본으로 탑재**, 자동으로 해결중
- 연속형 처리와 마이크로 배치 처리
  - 연속형 처리: 실시간 스트리밍. 레코드 단위 부하가 크기에 최대 처리량이 적음
    - 다음 처리 노드로 메시지 패킷을 보내기 위해 OS를 호출하는 연산 부하 발생
    - 애플리케이션 변경을 위해 시스템 중지 필요
  - 마이크로 배치: 작은 배치로 모아서 처리
    - 최적화 기법 사용 가능
    - 더 높은 노드당 처리량
      - 더 적은 노드로 같은 양의 데이터 처리 가능
    - 레코드별 부하 적거나 없음
    - 마이크로 배치를 모으기 위한 시간이 필요하므로 기본적인 지연 시간 발생
  - 두 가지 방식 중 하나를 선택할 때, **지연 시간 요건과 총 운영 비용(Total Cost of Operation, TCO)**을 고려해야 함

### 20.3 스파크 스트리밍 API

- 기존 스파크 스트리밍 API인 DStream API는 마이크로 배치 방식으로 동작
  - 선언형 API를 가지고 있지만 이벤트 시간 처리를 지원하지 않음
- 구조적 스트리밍 API는 최적화, 이벤트 시간, 실시간 처리 지원

**DStream API**

- RDD 코드를 함께 사용하여 정적 데이터와 조인하는 기능 지원
- 제약사항 존재
  - 자바나 파이썬의 객체와 함수에 매우 의존적
    - 최적화 불가
  - DStream API는 처리 시간을 기준으로 동작
    - 이벤트 시간 기준으로 처리하려면 자체 구현 필요
  - DStream API는 마이크로 배치 형태로만 동작

**Structured Streaming API**

- 구조적 데이터 모델 기반
- 더 많은 최적화 기술 자동으로 수행
- 이벤트 시간 데이터 처리 지원
- 마이크로 배치, 실시간 처리 모두 가능
- 데이터가 도착할 때마다 자동으로 incremental 연산 결과를 만들어냄
  - 개발자는 서로 다른 처리 시스템에 대한 배치 및 스트리밍 코드를 별도로 관리하지 않아도 됨

### 챕터 21. 구조적 스트리밍 기초

