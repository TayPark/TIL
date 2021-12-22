# Cognito

- 웹 그리고 모바일에 대한 사용자 인증, 액세스 권한 부여, 사용자 관리를 제공하는 서비스
  - 앱 로그인, 유저 권한 제공
- SAML 또는 OpenID Connect를 지원하는 외부 자격 증명 공급자, 소셜 자격 증명 공급자 등과 연동 가능
- User Pool과 Identity Pool로 나뉨
- Cognito를 사용하고 있지 않다면, AWS STS의 **AssumeRoleWithWebIdentity**를 호출해야 함
- AWS 리소스에 대한 액세스를 제어할 수 있는 임시 보안 자격 증명을 생성하여 신뢰할 수 있는 사용자에게 제공

`User Pool`
- Cognito의 사용자 디렉토리
- User Pool이 있으면 사용자는 Cognito를 통해 웹/앱 로그인 가능
- Cognito의 User Pool로 사용자를 생성
- 사용자 인증 후, Cognito는 JWT를 발행하며 이를 사용하여 API에 대한 액세스, 자격 증명을 수행하거나 AWS 자격 증명으로 교환 가능

`Identity Pool`
- AWS 서비스에 액세스 할 수 있는 임시 자격 증명 제공
- 사용자에게 S3 Bucket 또는 DynamoDB 테이블과 같은 AWS 리소스에 대한 액세스 권한을 부여
- User Pool의 사용자를 비롯하여, 외부 자격 증명 공급자, OAuth 등 연동하여 임시 자격 증명 제공 가능
- AWS IAM을 통해 사용자의 권한을 제어할 수 있음
- 인증되지 않는 사용자에게도 권한 부여가 가능.

User Pool vs Identity Pool
- **인증을 위한 서비스 vs 권한 부여 서비스**