# 테스트에서 FIRST 원칙

source: https://medium.com/@tasdikrahman/f-i-r-s-t-principles-of-testing-1a497acda8d6

우선 `FIRST`는
- Fast
- Isolated/Independent
- Repeatable
- Self-validating
- Thorough

를 의 5가지 원칙을 뜻한다.

## Fast

- **개발자는 개발 사이클에 구애받지 않고 테스트를 수행할 수 있어야** 하며, 결과물을 수 초 안에 확인할 수 있어야 한다.
  - 간단한 계산을 테스트 장비에서 실행하는 것은 가능하지만, DB를 접근하는 서비스 로직을 구현하거나 외부 API로부터 검증하는 트랜잭션가 다수 존재할 경우에는 짧은 시간을 기대할 수 없다.

## Isolated

주어진 테스트를 위해 필요한 환경변수는는 독립적으로 존재해야 한다. 즉, 테스트는 **다른 요인에 의해 영향받지 않아야 한다.**

- 테스트의 3A를 따라야 한다 - Arrange, Act, Assert
  - 흔히 알고있는 `given`, `when`, `then` 이라고도 한다.

## Repeatable

- **테스트는 반복이 가능하고 결정적이어야 하며, 그 값은 다른 환경에 따라 변하지 않아야 한다.**
  - 멱등성(Idempotent)와 같은 의미로 보인다.
- 각 테스트는 그들만의 데이터를 가져서 외부의 요인에 의존하지 않아야 한다.

## Self-validating

- 테스트의 결과를 직접 확인하지 않아야 한다.
  - 테스트 프레임워크를 통해 간접적으로 테스트 결과를 확인할 수 있다.

## Thorough

- **모든 happy path 를 커버할 수 있어야 한다.**
- 사용자로부터 **발생할 수 있는 모든 edge case 에 대해 다루려 노력해야한다.**
  - 부적절한 argument 또는 variable 로부터 실패를 처리할 수 있어야 한다.
  - 보안 이슈를 처리할 수 있어야 한다.
  - 과도하게 큰 값과 경계값에 대해 처리할 수 있어야 한다.
- 100% 커버리지보다 **유저 스토리의 모든 use case 를 커버할 수 있어야 한다.**
