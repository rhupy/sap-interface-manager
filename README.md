# SAP Interface Manager

## 프로젝트 개요
**SAP Interface Manager**는 **React**와 **Electron**을 사용하여 SAP RFC 데이터를 관리하고, Oracle DB와 연동하여 데이터를 삽입 및 업데이트하며, 인터페이스 관리, 스케줄링, 실시간 로깅 등 다양한 기능을 제공하는 데스크탑 애플리케이션입니다. 이 도구는 SAP 시스템 및 Oracle 데이터베이스와 쉽게 상호작용할 수 있게 해줍니다.

---

## 🚀 주요 기능
- **SAP RFC 연동**: SAP 시스템과 연결하여 데이터를 처리합니다.
- **Oracle DB 연동**: Oracle DB에 데이터를 삽입 및 업데이트합니다.
- **인터페이스 관리**: 다양한 인터페이스를 관리하고 설정할 수 있습니다.
- **스케줄링 & 자동화**: 작업을 예약하고 자동화할 수 있습니다.
- **실시간 로깅 터미널**: 실시간으로 로그를 확인할 수 있는 인터랙티브 터미널을 제공합니다.
- **에러 처리**: 애플리케이션 내 에러를 효율적으로 처리합니다.

---

## 🛠️ 설치 방법

### 필수 조건

- **Node.js** (v16.x 이상)
- **npm** (v7.x 이상)
- **Oracle DB 클라이언트** (oracledb 패키지 사용을 위해 필요)
- **SAP RFC SDK** (v7.50)
  
### 저장소 클론

```bash
git clone https://github.com/rhupy/sap-interface-manager.git
cd sap-interface-manager

