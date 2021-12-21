# VPC(Virtual Private Cloud)

[Source](https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html)

VPC는 사용자가 정의한 프라이빗 네트워크 내에서 AWS 리소스를 사용할 수 있도록 해준다. 가상 네트워크는 IDC같은 전통적인 네트워크와 거의 유사하면서 AWS의 확장가능한 인프라스트럭처의 장점을 제공한다.

![AWS_VPC_CONCEPT](https://docs.aws.amazon.com/vpc/latest/userguide/images/case-1.png)

## VPC Concepts

VPC는 [AWS EC2](https://aws.amazon.com/ko/ec2/?ec2-whats-new.sort-by=item.additionalFields.postDateTime&ec2-whats-new.sort-order=desc)의 네트워크 레이어이다. 핵심 개념들은 아래와 같다.

- VPC: AWS 계정에 속한 가상 네트워크
- Subnet: VPC에서 IP의 범위
- Route table: 네트워크 트래픽이 어떠한 규칙에 따라 향하는지 명시한 것
- Internet gateway: VPC에 연결하여 VPC와 인터넷 사이에서 리소스를 교환할 수 있는 게이트웨이
- VPC endpoint: AWS 서비스를 이용하기 위해 VPC에 연결하거나 [PrivateLink](https://aws.amazon.com/ko/privatelink/?privatelink-blogs.sort-by=item.additionalFields.createdDate&privatelink-blogs.sort-order=desc)를 이용하여 인터넷 게이트웨이, NAT 디바이스, VPN 커넥션, AWS 다이렉트 커넥션 없이 VPC 엔드포인트 서비스를 이용할 수 있다. VPN 내의 인스턴스간 네트워크 커뮤니케이션은 공공 IP를 필요로 하지 않고, AWS 네트워크를 이탈하지도 않는다.
- CIDR block: [Classless Inter-Domain Routing](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing). IP주소 할당과 라우팅 방법.

### Security

AWS는 VPC 보안 강화를 위해 두 가지 기능을 제공한다. 시큐리티 그룹과 NACLs(Network Access Control Lists)이다.

`시큐리티 그룹`은 인스턴스의 인바운드/아웃바운드 트래픽을 관리한다. `NACL`은 서브넷의 인바운드/아웃바운드 트래픽을 관리한다. 그러므로 대부분의 보안 요구사항은 시큐리티 그룹으로도 만족하지만, 필요하다면 NACL로 보안 수준을 올릴 수 있다.

만약 웹서버에 대한 시큐리티 그룹을 만든다면 아래의 예제 시큐리티 그룹을 만들 수 있다.

| 인바운드  | | | 
| --- | --- | --- |
| 소스 | 프로토콜 | 포트범위 | 코멘트 | 
| 0.0.0.0/0 | TCP | 80 | HTTP 포트 |
| 0.0.0.0/0 | TCP | 443 | HTTPS 포트 |
| 사용자 네트워크의 ***공공*** IPv4 범위 | TCP | 22 | IPv4를 사용하는 인바운드 SSH IP범위이다. http://checkip.amazonaws.com 에 접속하면 IPv4 주소를 얻을 수 있다. 만약 ISP에 연결되어있거나 정적 IP 주소 없이 방화벽을 사용하고 있다면 클라이언트 컴퓨터의 IP 주소 범위를 명시해야한다. |
| 시큐리티 그룹 ID(sg-xxxxxxxx) | ALL | ALL | 옵셔널. 동일 시큐리티 그룹에서의 모든 트래픽을 허용한다. |

| 아웃바운드 | | |
| --- | --- | --- |
| 데스티네이션 | 프로토콜 | 포트범위 | 코멘트 |
| 0.0.0.0/0 | ALL | ALL | 기본 규칙이며 모든 IPv4 범위에 트래픽을 허용한다. 소프트웨어 업데이트나 외부 네트워크로 리소스를 교환하려면 이 아웃바운드 규칙을 유지해야한다. |

여기서 Ephemeral ports 를 전체 TCP 범위를 허용하지 않고 부분적으로 허용할 수 있다. 그 범위는 아래와 같다.

- Many Linux kernels (including the Amazon Linux kernel) use ports 32768-61000.
- Requests originating from Elastic Load Balancing use ports 1024-65535.
- Windows operating systems through Windows Server 2003 use ports 1025-5000.
- Windows Server 2008 and later versions use ports 49152-65535.
- A NAT gateway uses ports 1024-65535.
- AWS Lambda functions use ports 1024-65535.

AWS문서에서는 웹서버를 위한 시큐리티 그룹의 경우 인바운드/아웃바운드 HTTP, HTTPS, SSH를 제외한 TCP의 허용 범위를 모든 IP에서 32768-65535번 까지 허용하는 것을 권장한다. 이는 서브넷에서 시작된 요청에 응답하는 인터넷 호스트의 인바운드/아웃바운드 트래픽을 허용려는 의도이다. 이는 예제이므로 필요시 위를 참고하여 수정해야한다.

## 퍼블릭, 프라이빗 서브넷과 NAT

이 예제는 백엔드 서버가 인터넷에 연결되지 않는 것을 요구사항으로 한다. 멀티 티어 웹사이트에서는 웹서버를 퍼블릭 서브넷에, 데이터베이스 서버를 프라이빗 서브넷에 둔다. 보안 설정과 라우팅으로 웹 서버가 데이터베이스 서버와 통신할 수 있도록 할 수 있다. 

이를 위해서는 웹서버와 데이터베이스 서버의 통신을 VPC로 묶인 서브넷간 통신이 CIDR를 기반으로 가능하도록 시큐리티 그룹을 구성하고(인바운드, 아웃바운드에 CIDR 추가), 퍼블릭 서브넷만 허용된 포트로 외부 트래픽을 받을 수 있도록 해야한다. 여기서 프라이빗 서브넷에 존재하는 서버들 또한 인터넷 연결이 필요할 수 있다(소프트웨어 업데이트 등). 이를 위해 프라이빗 서브넷의 인스턴스들은 인터넷과 연결될 수 있는 퍼블릭 서브넷의  NAT 게이트웨이를 통해 인터넷에 접근할 수 있다. 즉, 인터넷에 데이터베이스 서버를 개방하지 않고, 인터넷과 데이터베이스 서버의 연결이 맺어지지 않아도 인터넷을 사용할 수 있게 하는 것이 핵심이다.

VPC에서 기본 서브넷이 아닌 추가 서브넷은 기본적으로 프라이빗 서브넷이다. 만약 퍼블릭 서브넷으로 변경하고 싶다면 라우트 테이블을 변경하면 된다.

## 서브넷에서 VPC와 AWS Site-to-Site VPN 액세스

프라이빗 게이트웨이는 사용자 네트워크를 통해 IPsec과 VPN 터널링을 사용하여 VPN을 사용할 수 있게 해준다. 이 장에서는 퍼블릭 서브넷에서 존재하는 확장가능 멀티티어 웹 프론트엔드 애플리케이션과 홈 네트워크와 연결된 IPsec AWS Site-to-Site VPN 커넥션을 맺은 프라이빗 서브넷과 통신하는 예제를 든다.

- VPC는 /16 서브넷 마스크를 가진 IPv4 CIDR를 테이블을 가진다.
- 퍼블릭 서브넷은 /24 서브넷 마스크를 가지며 인터넷 게이트웨이에 접근할 수 있다.
- Site-to-Site VPN 커넥션은 AWS의 Virtual Gateway와 고객 네트워크의 Customer gateway로 구성된다.
- 프라이빗 서브넷의 Main route table에는 Virtual Gateway를 타겟으로 하는 라우트 테이블로 구성되어있다.
- 퍼블릭 서브넷의 Custom route table에는 Internet Gateway르 타겟으로 하는 라우트 테이블로 구성되어있다.

### 라우팅

이 예제에서는 서브넷을 2개로 나누어 프라이빗 서브넷에서는 VGW(Virtual Gateway)와 통신을 허용하는 라우트 테이블을 구성하고 퍼블릭 서브넷은 IGW(Internet Gateway)와 통신을 허용하는 라우트 테이블을 구성했다. 

VPN을 사용하는 프라이빗 서브넷은 인터넷에 개방되어있지 않다. 인터넷 트래픽은 사용자 네트워크의 VGW를 통과해야하며 사용자 방화벽과 보안 정책들을 거치게 된다. AWS 인스턴스에 의한 인바운드 트래픽(EC2 API, S3 등)의 경우에도 사용자 네트워크의 VGW를 먼저 거친다. 단, EIP(Elastic IP)를 향한 트래픽은 인터넷에 개방되어 있기 때문에 VGW를 거치지 않는다. 사용자는 시큐리티 그룹 규칙을 변경하여 VGW를 거쳐 퍼블릭 서브넷으로 트래픽을 향하게 할 수 있다.

Site-to-Site VPN 커넥션은 정적 라우팅 VPN과 [BGP](https://en.wikipedia.org/wiki/Border_Gateway_Protocol)를 이용한 동적 라우팅 VPN으로 구성할 수 있다. 정적 라우팅을 구성한다면 VPN 커넥션을 구성하기 전에 IP prefix를 입력해야 한다. 동적 라우팅은 BGP를 이용하여 자동으로 입력된다.

만약 프라이빗 서브넷의 인스턴스가 네트워크에 액세스하고 싶다면 `NAT 게이트웨이`나 인스턴스를 퍼블릭 서브넷에 만들고 **인터넷-바운드 트래픽을 NAT 게이트웨이로 라우팅을 설정**할 수 있다. VPN 전용 서브넷의 인스턴스가 소프트웨어 업데이트 등을 인터넷 게이트웨이를 통해 요청할 수 있다. 이 경우 프라이빗 서브넷의 시큐리티 그룹 규칙을 **NAT 게이트웨이의 트래픽을 허용하도록 수정**해야 한다.

## 프라이빗 서브넷만 사용하는 Site-to-Site VPN 액세스

이 예제에서는 하나의 프라이빗 서브넷을 가지는 VPC에서 사용자 네트워크와 통신이 가능한 VGW를 구성하며 인터넷과의 통신을 위한 인터넷 게이트웨이가 없다. 이 예제는 사용자 네트워크를 인터넷에 노출하지 않으면서 AWS 인프라스트럭처를 활용하여 사용자 네트워크를 확장하는 사용자에게 권장한다.

위 예제와 다른 점은 퍼블릭 서브넷과 인터넷 게이트웨이가 없어 VPC CIDR와 VGW 통신을 위한 라우트 테이블만 구성하면 된다는 점이다. 기본 시큐리티 그룹 규칙에서 인바운드 트래픽에서 사용자 네트워크 범위를 갖는 SSH와 사용하는 데이터베이스 서버 포트만 개방하면 된다.

## VPC peering

`VPC peering 커넥션`은 트래픽을 라우팅하는 VPC간 프라이빗 통신을 말한다. 사용자는 같은 계정의 다른 VPC, 다른 AWS 계정, 다른 AWS 리전의 VPC간 VPC peering 커넥션을 만들 수 있다. AWS는 게이트웨이나 AWS Site-to-Site VPN 커넥션을 이용하여 VPC peering을 구현한다. 

## VPC Flow Logs

`VPC Flow Logs`(이하 플로우 로그)는 VPC의 네트워크 인터페이스로부터 들어오는 IP 트래픽의 정보를 캡처하는 것을 말한다. Flow log 데이터는 `CloudWatch Logs`나 `S3`를 데스티네이션으로 설정할 수 있고, Flow log를 만든 후부터 선택한 데스티네이션으로부터 로그 검색과 열람이 가능하다.

Flow logs는 아래의 일을 돕는다.

- 시큐리티 그룹 규칙 진단
- 인스턴스 트래픽 모니터링
- 네트워크 인터페이스로 들어오는 트래픽 방향 확인

### Flow logs 기본

플로우 로그는 VPC, 서브넷, 또는 네트워크 인터페이스에서 생성이 가능하며, 생성직후 모니터링된다. 플로우로그는 아래의 서비스에서 생성할 수 있다. 

- ELB
- RDS
- ElastiCache
- RedShift
- WorkSpaces
- NAT gateways
- Transit gateways

네트워크 인터페이스와 관계없이 EC2 콘솔이나 EC2 API를 이용하여 플로우 로그를 위한 네트워크 인터페이스를 생성해야한다. 플로우 로그에는 태그를 달 수 있다. 태그는 키를 가지며 값을 옵션으로 가질 수 있다. 태그를 이용하면 플로우 로그를 정리하는데 사용할 수 있다.

#### 플로우 로그 삭제 

플로우 로그가 더이상 필요하지 않다면 삭제할 수 있다. 플로우 로그를 삭제하면 더이상 새로운 플로우 로그 레코드가 만들어지거나 데스티네이션으로 발행되지 않는다. 플로우 로그의 삭제는 기존의 플로우 로그 레코드나 로그 스트림, 또는 로그 오브젝트를 삭제하지 않는다. 로그 스트림을 삭제하려면 CloudWatch 콘솔을 이용하면 되고, 로그 오브젝트를 삭제하려면 S3를 사용하면 된다. 플로우 로그 삭제 후 수 분이 지나면 데이터 수집을 멈춘다.

#### 플로우 로그 레코드

플로우 로그 레코드는 VPC의 네트워크 플로우를 표현한다. 기본적으로 각 레코드는 *aggregation interval(capture window)*마다 발생하는 IP 트래픽을 캡처한다. 각 레코드는 스페이스로 나눠진 문자열이고 네트워크 소스, 데스티네이션, 프로토콜 등을 포함하는 IP프로토콜 정보를 갖는다. 플로우 로그를 생성하면 기본 레코드 포맷을 사용할 수 있고, 커스텀 레코드 포맷을 사용할 수도 있다.

