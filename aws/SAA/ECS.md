# ECS(Elastic Container Service)

- 클러스터에서 도커 컨테이너를 손쉽게 관리하기 위한 컨테이너 관리 서비스
- 클러스터는 Task 또는 서비스로 일컫는 컨테이너의 집합
- 2가지 구성 요소로 시작 가능
  - EC2(Container Instance): EC2를 실행하여 EC2 내에 Task 동작
  - Fargate: EC2를 생성하거나 컨테이너를 실행하기 위한 오케스트레이션을 AWS가 맡아 하는 서비스
- 하나의 클러스터 내에 다수의 Task 혹은 컨테이너 인스턴스로 구성
- 또한 ELB, EBS 볼륨, VPC, IAM과 같은 기능을 사용하여 구성 가능
- 