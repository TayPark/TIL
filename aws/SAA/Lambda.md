# Lambda

- 서버리스 서비스
- 리소스 프로비저닝 없이 코드를 실행하는 서비스
- Cloudwatch, ALB, DynamoDB 등을 트리거로 이용하여 특정 상황에서 코드를 실행 가능
- API Gateway와 Lambda를 조합하여 요청별로 특정 코드를 수행하도록 구성 가능
- Function 정의와 구성
  - 코드를 실행하기 위한 호출할 수 있는 리소스
  - 이벤트를 처리하는 코드, 계층, 트리거, 전달 대상 등으로 구성
  - 함수 코드: 실제 호출되기 실행하는 코드, 런타임, IAM, VPC, 메모리 등으로 구성
  - 트리거: 함수 코드를 발생시키는 서비스(S3, SNS, SQS, DynamoDB, CloudWatch Event/Log 등)
  - 전달대상: 함수가 비동기식으로 호출되거나, 레코드를 처리한 경우 전달될 대상
    - SNS, SQS, 또 다른 Lambda, EventBridge 이벤트 버스로 전달 가능