# IPC(Interprocess Communication)

IPC는 프로세스간 데이터를 공유하기 위해 통신하는 것을 말한다. 공유 메모리(Shared memory), 파이프(Pipe), 그리고 소켓(Unix socket, Network socket)이 있는 것으로 알고있다. 

## IPC의 목적

프로세스간 데이터를 공유하기 위함이다. OS가 관리하며, 일반적으로 클라이언트-서버 형식을 취한다.

IPC는 마이크로커널이나 나노커널을 디자인하는데 굉장히 중요한 요소이다. 이는 모놀리식 커널에 비해 고성능의 커뮤니케이션을 할 수 있게 만들어주기 때문이다. IPC는 동기와 비동기 메커니즘으로 나뉜다. 우리가 흔히 알고있는 프로세스 동기화는 비동기 IPC를 통해 이루어진다.

## IPC를 하는 여러가지 방법

| 방법 | 설명 | 지원 OS |
| --- | --- | --- |
| 파일 | 여러 프로세스가 접근이 가능한 디스크의 파일이나 파일 서버의 파일을 통한 IPC | 대부분의 OS |
| 시그널(비동기 시스템 트랩) | 한 프로세스가 다른 프로세스에게 보내는 시스템 메세지. 데이터를 보내기보다 관련된 프로세스에게 명령어를 전달하는 목적. SIGINT, SIGTERM 등이 있다. | 대부분의 OS |
| 소켓 | 네트워크 인터페이스를 통해 데이터를 전달하는 방법. 한 컴퓨터에서 프로세스간 통신하거나 다른 컴퓨터의 프로세스와 통신할 수 있다. 스트림 지향(TCP), 메세지 지향(UDP, SCTP)가 있다. | 대부분의 OS |
| 유닉스 도메인 소켓 | 인터넷 소켓과 비슷하지만 커널 내에서 발생하는 커뮤니케이션을 위해 사용된다. 모든 통신은 OS 커널 내에서 발생한다. 도메인 소켓은 파일 시스템을 주소 공간처럼 사용한다. 프로세스는 도메인 소켓을 inode로 참조하고 다수의 프로세스가 하나의 소켓을 통해 통신할 수 있다. | POSIX OS와 Windows 10 |
| 메세지 큐 | 소켓과 유사하게 데이터 스트림을 사용하지만, 메세지 바운더리가 보존된다. 일반적으로 OS에 의해 실행되고 다수의 프로세스가 서로 직접 연결하지 않고 메세지 큐를 읽을 수 있도록 한다. | 대부분의 OS |
| 익명 파이프 | stdio 를 이용한 일방향 데이터 채널. 파이프의 write-end 에서 write 한 데이터를 OS가 버퍼링했다가 read-end 가 읽어가는 방식이다. 양방향 통신을 위해서는 두 개의 파이프를 이용해야 한다. | POSIX OS와 Windows |
| 네임드 파이프 | 파일처럼 다뤄지는 파이프를 말한다. 프로세스는 네임드 파이프에 접근하여 파일처럼 데이터를 읽고 쓸 수 있다. | All POSIX systems, Windows, AmigaOS 2.0+ |
| 공유 메모리 | 같은 블록의 메모리를 다수의 프로세스가 참고하는 방식. | All POSIX systems, Windows |
| 메세지 패싱 | 메세지 큐, OS가 아닌 매니지드 채널을 이용하여 다수의 프로그램이 통신할 수 있게 하는 방법. 동시성 모델에서 일반적으로 사용 | Used in LPC, RPC, RMI, and MPI paradigms, Java RMI, CORBA, COM, DDS, MSMQ, MailSlots, QNX, others |
| 메모리 맵드 파일 | 메모리에 매핑된 파일. 스트림으로 출력하는 대신 메모리 주소를 직접 변경하여 수정할 수 있다. | All POSIX systems, Windows |

## 네트워크 소켓

네트워크 소켓은 컴퓨터 네트워크에서 **데이터를 주고받는 엔드포인트 역할**을 수행한다. 네트워크 소켓은 프로세스가 실행중인 상태에서만 유효하다. 인터넷의 발달에 따른 TCP/IP의 표준화로 네트워크 소켓은 인터넷 프로토콜에서 가장 일반적으로 사용되며, 인터넷 소켓이라고도 한다. 여기에서 소켓은 다른 호스트에게 `소켓 주소`로 식별되며, 우리가 흔히 알고있는 `전송 프로토콜 + 호스트 주소 + 포트(protocol://host:port)`이다. 소켓이라는 용어는 내부 통신을 위한 IPC에서도 사용되며, 네트워크 소켓과 동일한 API를 종종 사용한다.

네트워크 프로토콜 스택을 위한 API는 각 소켓에 대해 핸들을 생성하며, 일반적으로 소켓 디스크립터(Socket descriptor)라 한다. 유닉스 계열의 OS에서는 파일 디스크립터의 한 종류이다. 이는 애플리케이션 프로세스에 내장되며 통신 채널에서 읽기와 쓰기를 수행할 때 사용된다. 네트워크 소켓은 API로 생성할 때 전송에 사용할 네트워크 프로토콜 유형, 호스트 네트워크 주소 및 포트 번호의 조합으로 바인딩된다. 

네트워크 소켓은 두 노드 간 통신을 위한 영구 연결 전용일 수 있고, 연결 없는 멀티캐스트(한 번의 송신으로 여러 컴퓨터에 동시 전송) 통신에 참여할 수도 있다.

OS는 IP 및 전송 프로토콜 헤더에서 소켓 주소 정보를 추출하고 애플리케이션 프로그램 데이터에서 헤더를 제거하여 들어오는 IP 패킷의 페이로드를 애플리케이션에 전달한다(decapsulation. 반대는 encapsulation). 소켓에서 데이터를 보내기만 하는 경우 소스 주소가 필요하지 않지만 데이터를 주고받을 경우에는 소스 주소 바인딩이 필요하다.

## 버클리 소켓

버클리 소켓은 네트워크 소켓과 유닉스 도메인 소켓을 위한 API 이다. 소켓 프로그래밍을 할 때, 일반적으로 사용되는 API이다.

- `socket()`
  - 통신을 위한 엔드포인트를 만들고 소켓 디스크립터를 반환한다. 아래의 3개의 인자를 받는다.
  - domain: 프로토콜 패밀리를 지정한다.
    - AF_INET(IPv4), AF_INET6(IPv6), AF_UNIX(Unix domain socket)
  - type
    - SOCK_STREAM(스트림 지향), SOCK_DGRAM(데이터그램 지향), SOCK_SEQPACKET, SOCK_RAW
  - protocol: 전송 프로토콜을 지정한다. IPROTO_TCP, IPROTO_SCTP, IPROTO_UDP, IPROTO_DCCP 등을 지정할 수 있다.
  - 음수값이 나온다면 에러가 발생한 것이고, 정수 값이 나온다면 소켓 디스크립터를 반환한다.
- `bind()`
  - socket() 으로 만든 소켓 디스크립터를 지정하는 주소에 바인딩한다. 아래 3개의 인자를 받는다.
  - sockfd: 소켓 디스크립터
  - my_addr: 바인딩할 주소
  - addrlen: socklen_t 의 크기 지정
  - -1 일때 에러, 0일 때 성공한다.
- `listen()`
  - 바인딩이 된 이후에 유입되는 커넥션을 준비한다. 이는 TCP와 같은 stream-oriented 에서만 필요하다. 아래 2개의 인자를 받는다.
    - sockfd: 유효한 소켓 디스크립터
    - backlog: 큐에 대기중인 커넥션의 수를 나타낸다. 
- `accept()`
  - 커넥션 요청이 들어왔을 때 커넥션을 초기화하는 역할을 수행한다. 각 커넥션에 대해 새로운 소켓을 만들며 listening queue 의 커넥션을 제거한다. 3개의 인자를 받을 수 있다.
  - sockfd
  - cliaddr: 클라이언트의 주소 정보를 받는다.
  - addrlen: 
- `connect()`
  - 소켓 디스크립터를 통해 식별한 원격 호스트와의 통신 링크를 수립한다. 비연결지향 프로토콜의 경우(예를들어 UDP), connect 는 send()와 recv() 함수로 데이터를 주고 받기 위해 원격 주소를 정의한다. 이 경우 다른 소스에서 데이터그램을 수신하는 것을 막는다.

