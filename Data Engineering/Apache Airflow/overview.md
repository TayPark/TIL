# Architecture Overview

`Airflow`는 워크플로우를 만들고 관리하는 플랫폼이다. 워크플로우는 DAG(Directed Acyclic Graph)로 표시되며, 종속성과 데이터 흐름을 고려하여 정렬된 `Task` 라는 개별 작업을 포함한다.

DAG는 작업 간의 종속성과 작업을 실행하고 재시도를 실행하는 순서를 지정한다. 작업 자체는 데이터 가져오기, 분석 실행, 다른 시스템 트리거 등 수행할 작업을 설명한다.

Airflow는 일반적으로 다음 구성요소를 가진다.

- `Scheduler`
  - DAG가 저장된 디렉토리(DAG Bag)을 주기적으로 스캔하여 DAG 최신화
  - 스케줄에 따라 DAG에 정의딘 Task를 Worker에게 작업 명령
- `Executor`
  - 실행중인 Task를 처리
  - 설정에 따라 로컬, 다른 컴퓨터, 컨테이너에서 실행 가능
- `Webserver`: DAG와 Task의 행동을 트리거하거나 디버깅할 수 있는 웹 UI 제공
- `Metadata database`
  - Scheduler에서 사용하며, executor와 webserver의 상태를 저장한다.
  - DAG 정보, 스케줄링 정보, 작업 실행 결과 등 저장
  - PostgreSQL, MySQL 등 지원
- `DAG bag`: Scheduler와 Executor가 읽을 DAG를 저장한다.

대부분의 Executor는 일반적으로 worker에게 통신할 수 있도록 다른 컴포넌트, 예를들어 **task queue**도 포함할 수 있다.

Airflow 자체는 실행 중인 항목에 구애받지 않는다. Airflow provider 중 하나의 고수준 지원을 받거나 shell이나 Python Operator를 사용하는 명령으로 직접 모든 것을 오케스트레이션하고 실행할 수 있다.

## Workloads

- Operator: DAG의 대부분의 구성을 빠르게 구축할 수 있게 미리 정의된 Task
- Sensor: 일어날 외부 이벤트를 기다리는 Operator의 서브클래스

## Control Flow

DAG의 의존성을 표현하는 방법은 다음과 같이 `>>` 또는 `<<` 연산자를 사용한다.

```s
first_task >> [second_task, third_task]
third_task << fourth_task
```

또는 `set_upstream`, **`set_downstream`을** 사용할 수 있다.

```s
first_task.set_downstream([second_task, third_task])
third_task.set_upstream(fourth_task)
```

기본적으로 task는 upstream task 가 성공적으로 종료될 때까지 기다리지만 `Branching`, `LastestOnly`, `Trigger Rules` 등으로 커스터마이징 할 수 있다.

Task 간 데이터를 전달하는 방법은 크게 2가지가 있다.

- XComs(Cross-communication): task를 가질 수 있는 시스템에서 metadata push-pull. 작은 데이터에 적합
- 큰 파일은 스토리지 서비스를 이용하여 업로드/다운로드

Airflow는 Task를 사용 가능한 Worker에게 보내 실행시키기 때문에, DAG의 모든 작업이 동일한 worker 또는 머신에서 실행된다는 보장이 없다.

DAG를 작성함에 따라 로직이 복잡해질 수 있는데, Airflow는 이를 보다 지속가능하도록 여러가지 매커니즘을 제공한다. `SubDAGs`은 재사용가능한 DAG를 다른 DAG에 임베딩 할 수 있고, `TaskGroups`는 UI에서 시각적으로 그루핑할 수 있다.

# DAG

- 실행하고 싶은 Task의 관계와 dependency를 표현하고 있는 Task의 모음
- 작업의 전후/병렬 관계를 시각화하여 쉽게 표시할 수 있음
- 다양한 Operator 지원
- 주요 설정
  - `dag_id`: UI에 표시할 DAG 이름
  - `start_date`: 작업 처리 시점 설정
  - `schedule_interval`: 작업 cron 설정
  - `catchup`: 과거 작업 처리 설정(과거값 기준으로 재실행. 일종의 체크포인트)
  - `on_failure_callback`: DAG실패 시 실행할 함수 설정(Slack alert 등)

