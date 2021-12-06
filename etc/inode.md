# 유니스를 능숙하게 사용하기: inode에 대한 모든 것

source: https://kdata.or.kr/info/info_04_view.html?field=title&keyword=inode&type=techreport&page=1&dbnum=128081&mode=detail&type=techreport

유닉스, 리눅스 시스템은 모두 `inode`를 사용한다. 이 inode에 대해 알아보자.

`inode`는 유닉스 운영체제에서 사용하는 자료구조로, 파일 시스템 내부에서 파일을 유지하는 중요한 정보를 담고있다. 일반적으로 전체 파일 시스템 디스크 용량의 대략 1%를 inode 테이블에 할당한다. 여기서 `inumber`라는 용어도 있는데, 이는 inode를 식별하는 `inode number`를 의미한다.

inode 테이블은 개별 파일 시스템을 위한 모든 inode 숫자 목록을 포함한다. 사용자가 파일에 접근하려면 유닉스 시스템은 inode 테이블에서 inumber를 key로 탐색한다. inumber를 발견하면 사용자가 내린 명령이 inode에 접근해서 가능하다면 적절한 변경 작업을 진행한다. 예를들어 `vi`로 파일을 변경한다면 inumber를 inode 테이블에서 찾아 inode를 열고, 작업이 끝나면 inode가 닫히며 해제된다. 사용자 두 명이 같은 파일을 동시에 편집한다면, inode 편집 세션을 연 사용자 ID에 할당되기 때문에 다른 사용자는 inode가 해제되기를 기다려야 한다.

## inode 구조체

inode 구조체는 파일에 대한 굉장히 많은 정보를 담고있다.

inumber, stat C 함수에서 사용되는 파일 유형을 이해하기 위한 모드 정보, 파일 링크 숫자, 소유주 UID와 GID, 파일 크기, 파일이 사용하는 실제 블록 개수, 마지막으로 수정/접근/변경된 시각 등을 포함한다. 즉 파일의 실제 이름과 파일의 내용을 제외한 모든 정보를 담고있다. 그러므로 inode가 없다면 파일이 손상당하거나 사용 불가능한 상황에 놓인다.

디렉토리와 파일은 다른 운영체제와 비교했을때 다르지 않다. 유닉스에서 디렉토리는 inode에 몇 가지 추가 설정이 가해진 파일일 뿐이다. 디렉토리는 기본적으로 다른 파일을 담고있는 파일이다. 또한 모드 정보는 파일이 실제로 디렉토리(**d**)라는 사실을 시스템에 알리는 플래그 집합을 포함한다.

## inode로 작업하기

`df`

일반적으로 파일 시스템에 할당된 inode 숫자는 충분하지만, inode가 다 떨어질 가능성도 항상 고려해야한다. 이를 감시하기 위해 df 결과를 살펴본다.

```s
❯ df -k | head -3
Filesystem     1024-blocks      Used Available Capacity iused      ifree %iused  Mounted on
/dev/disk3s1s1   239362496  14981164 103591736    13%  553787 2393071173    0%   /
devfs                  351       351         0   100%    1218          0  100%   /dev
```

df를 사용하면 특정 파일 시스템이나 모든 마운트된 파일 시스템의 정보를 확인할 수 있다. 명령 결과에서 각 파일시스템에서 사용된 inode 숫자는 물론 전체 파일 시스템에서 사용한 비율도 볼 수 있다. 파일 시스템 inode 사용도가 100%에 다다르면 추가적인 파일, 디바이스, 디렉토리 등을 생성할 수 없다. 

`istat`, `stat`

AIX에서 inode를 검사하는 빠른 방법으로 istat 명령어가 있다. istat은 UINX에서 사용하는 명령어이고 리눅스에서는 stat을 사용할 수 있다.

```s
❯ stat /usr/bin
16777230 1152921500312764965 drwxr-xr-x 1036 root wheel 0 33152 "Jan  1 17:00:00 2020" "Jan  1 17:00:00 2020" "Jan  1 17:00:00 2020" "Jan  1 17:00:00 2020" 4096 0 0x80000 /usr/bin

❯ stat /bin/bash
16777230 1152921500312764781 -r-xr-xr-x 1 root wheel 0 1296704 "Jan  1 17:00:00 2020" "Jan  1 17:00:00 2020" "Jan  1 17:00:00 2020" "Jan  1 17:00:00 2020" 4096 1368 0x80020 /bin/bash
```


`ls`

유닉스의 대다수 명령어는 스위치, 옵션을 허용하므로 `-`이나 `--`으로 시작하는 파일을 rm, mv, cp 같은 명령어를 사용하기 까다롭다. 그 경우에 ls를 사용하면 inumber를 볼 수 있다.

```s
❯ ls -i
 0443034 aws                         8614913 k8s-kube                   11606226 spark-kinesis-integration
 19013432 coding-test-fry            17821859 kafka-and-elk-example       6091599 transfer-learning
```
