# DataScience와 AI의 개념(공부하는 법)

## 데이터 사이언스

1. 어떠한 모델을 쓸 것인가
    - 선형 회귀, 결정 트리, K-nearest neighbor, Support vector machine, ensemble learning, deep learning 등
2. Y에 영향을 끼치는 좋은 변수가 있는가(데이터 전처리 및 파생 변수 생성)
3. 최적의 변수의 조합을 고려했는가(최종적으로 사용하려는 변수는 어떤 변수인가)
4. 실험 설계를 제대로 했는가(과적합 방지)
5. 모델을 통해서 얻을 수 있는게 어떤 것인가(인사이트)

## 머신러닝의 종류
: 지도학습, 비지도학습

1. 선형 회귀
   1. 독립 변수와 종속 변수가 선형적인 관계가 있다는 가정
   2. 직선을 통해 종속 변수를 예측하기 때문에 독립변수의 중료도와 영향력을 파악하기 쉬움
   3. **모델을 변화시키는 원인을 찾는게 가장 중요**
   4. 다중 선형 회귀분석의 문제점(종속 변수로 인한 과적합)을 해결하기 위해서 `Lasso`나 `Ridge`를 사용하여 완화
2. 의사결정나무
   1. 독립 변수의 조건에 따라 종속변수를 분리
   2. 이해하기 쉬우나 과적합 문제
3. KNN
   1. 새로 들어온 데이터의 주변 k개의 데이터의 class를 분류
4. 뉴럴 네트워크
   1. 입력, 은닉, 출력층으로 구성된 모형으로 각 층을 연결하는 노드의 가중치를 업데이트하며 학습
   2. 과적합 문제
5. SVM(Support Vector Machine)
   1. Class간의 거리(margin)이 최대가 되도록 decision boundary를 만드는 방법
   2. 하이퍼파라미터가 많음
      1. 학습하는 시간이 오래 걸림(지수 증가)
6. Ensemble Learning
   1. 여러 개의 모델을 결합하여 사용하는 모델
   2. 예측력이 좋지만 변수의 해석력을 설명하는 것은 어렵다
   3. 종류
      1. Bagging
      2. Random Forest
      3. Gradient Boosting
         1. XGBoost
         2. LightGBM 가 제일 괜찮다고 함
         3. Cap boost?

머신러닝 순서는
1. 데이터 수집 및 전처리
2. 피쳐 엔지니어링
3. 모델 테스트 및 하이퍼파라미터 튜닝(성능 극한)

## 인공지능

1. 머신러닝
2. 강화학습
3. 딥러닝
   1. 학습할 수 있는 알고리즘의 발달로 깊은 layer를 쌓아서 진행하는 머신러닝
   2. 2개 이상의 hidden layer를 가지는 다중 신경망(DNN)
      1. SAE, SDA, CNN, RNN(텍스트, 음성, 시계열 등) 등으로 발전
   3. Graphical representational Learning (데이터의 복잡한 관계를 멀티 레벨로 모델링)
   4. CNN(Convolution Neural Network)
      1. **이미지처리에 많이 쓰임**
      2. Convolution layer: reception field를 정의하여 입력 층의 이미지를 convolution layer 노드와 연결하며 입력 이미지의 특징을 추출
      3. Pooling layer: scale invariant, location-invariant 한 특징을 발견하는 역할 수행
      4. Fully-connected layer: 이미지를 분류하는 기능 수행
4. 생성모델

## GAN(Generative Adverarial Nets)
: Data를 만들어내는 G(Generator)와 만들어진 data를 평가하는 D(Discriminator)가 서로 대립(Adversarial)적으로 학습해가며 성능을 점차 개선하는 개념
- D의 output: 확률
- G의 output: data
- D를 학습시킬 때에는 D(x) = 1이고 D(G(z))가 0이 되도록 학습
  - 진짜 데이터를 진짜로, 가짜 데이터를 가짜로 판별
- G를 학습시킬 때는 D(G(z))가 1이 되도록 학습
  - 가짜를 D가 구분못하도록 학습. D가 헷갈리도록 하는 것이 목적

## 강화학습
: 현재 상태에서 먼 미래까지 가장 큰 보상을 얻을 수 있는 행동을 학습하게 하는 것

## 딥러닝 이슈
파라미터가 많아지면 일반화 에러를 줄이기 위해 panalty term이 필요하다

## DS/AI 권장 공부 리스트

1. 머신러닝
   1. 선형대수학
   2. 통계학
   3. 미적분
2. 딥러닝
   1. 이미지
   2. 텍스트
   3. 일반화
3. GAN
4. 강화학습
