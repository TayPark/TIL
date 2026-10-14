# MSA 환경에서 API 문서 관리하기: 생성부터 배포까지

[영상](https://www.youtube.com/watch?v=qguXHW0s8RY&list=PL42XJKPNDepZbqM9N11RxL5UY_5PbA_Wo&index=31&ab_channel=TOAST)

Swagger: Annotation 기반으로 문서를 생성한다. API 현행화가 쉽고, 화면에서 API를 직접 호출이 가능하다.

그러나 프로덕션 코드에서 문서화를 코드가 들어간다. API 스펙만 분리해서 관리하기 어렵다. 또한 Swagger는 응답객체를 가지고 문서화를 하는데, 실제 로직이 검증되지 않아도 문서화가 된다.

## 첫 번째 고민
MSA 환경은 모든 서버가 분리되어있다. 이 경우, 문서를 보려면 각 서버에 찾아가야한다. 

-> `Swagger UI`를 도입했다. SwaggerUI는 Swagger를 사용하여 OpenAPI스펙(YAML, JSON으로 문서 관리)만 지켜지면 어떤 환경에서도 문서화가 가능하게 만들어주는 오픈소스이다.

## 두 번째 고민
검증된 API 문서 만들기

`Spring REST Docs`: 테스트 케이스가 성공해야 문서화가 가능하다. 또한 프로덕션 코드에 문서화를 위한 코드가 들어가지 않는다. 

그러므로 스프링에서 만든 문서를 restdocs-api-spec으로 OpenAPI 형식으로 변환 후에 Swagger UI에 넣으면 된다.

## 배포
Jenkins pipeline + Ansible

1. 개발자가 저장소에 코드를 push
2. Github에서 Jenkins로 Hook event 발생시킴
3. Jenkins가 Github의 코드 checkout
4. Jenkins가 해당 코드로 Build & Test 실행
5. 성공했을 경우, Ansible playbook을 통해 문서를 문서화 서버에 복사, 다른 개발자들이 열람 할 수 있음.
