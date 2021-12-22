# API Gateway

- **REST API 및 Websocket API를 생성, 유지, 관리하는 서비스**
- Lambda, AWS Service, VPC, HTTP webpage 등과 연동하여 resource에 대한 HTTP method 정의 가능
- API Gateway와 Lambda를 연동하여 사용하기 용이
  - User -> API Gateway -> Lambda
- 핵심 구성요소로 Resource와 Method, Stage가 있음
- API Gateway 생성시, 최상위에 Root Method(/)가 하나만 존재하는 상태로 시작
- Cloudfront를 통해 정적 페이지는 S3에서 제공하고, 동적 페이지 혹은 데이터는 Cloudfront - API Gateway - Lambda 를 통해 처리하는 방식 사용 가능
- `Resource`
  - 서비스의 대상이 되는 자원
  - REST 특성상 자원마다 다른 URI 보유
  - Lambda를 연결 포인트로 지정시 Lambda function을 호출하여 수행
- `Stage`
  - 리소스를 배포한 것이 Stage
  - 클라이언트가 실제로 사용하기 위해 생성해야 하는 배포판
  - Stage 생성시 각 리소스에 대해 URI가 생성된 것을 확인할 수 있음