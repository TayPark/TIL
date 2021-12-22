# ElastiCache

- AWS In Memory Cache Service
- Memcached와 Redis
- EC2처럼 Type을 가짐
- 각 Node별로 AZ를 따로 둘 수 있지만, Failover가 불가능하고 복제본을 둘 수 없음
- Redis
  - 기본적으로 Cluster로 구성되지는 않지만, Cluster로 구성이 가능하며 샤드와 Node를 가지고 있음
  - 샤드는 여러 Node로 구성되며 하나의 Node가 읽기/쓰기를 담당하고 나머지는 복제본 역할
  - Cluster로 구성되지 않은 Redis는 하나의 샤드만 가짐. Cluster로 구성하면 여러 샤드로 구성
  - 복제본을 가지므로 failover가 가능하며 Multi-AZ가 가능