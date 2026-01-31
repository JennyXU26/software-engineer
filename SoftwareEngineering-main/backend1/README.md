完全没问题，我帮你整理好了一个 **可以直接复制进 `README.md` 的版本**，结构清晰、队友/助教/老师都能看懂，Markdown 格式已经做好。

你直接复制到 `backend1/README.md` 就行。

---

```markdown
# Backend1 – Prescription Business API (FastAPI)

## 📌 模块定位

`backend1` 是**处方业务后端服务**，负责完整处方流程：

> **Create → Verify → Dispense（核销）**

它通过 **HTTP 调用 Ledger 子系统（backend2）** 完成“上链 / 状态校验”，不涉及区块链内部实现。

---

## 🧩 职责范围

**负责：**

- 处方业务 API（FastAPI）
- 数据库存储（SQLite）
- 防重放逻辑（已核销不可再次操作）
- 与 Ledger 服务的 HTTP 集成

**不负责：**

- 区块链实现（由 backend2 提供）
- 前端 UI
- 联邦学习算法

---

## 🏗️ 技术栈

- Python 3.9+
- FastAPI
- SQLAlchemy
- SQLite
- Requests（HTTP 调用 Ledger）

---

## 📁 目录结构

```

backend1/
├── main.py              # FastAPI 主入口
├── ledger_client.py     # Ledger HTTP 封装
├── requirements.txt     # Python 依赖
└── README.md            # 本文件

````

---

## 🚀 快速启动

### 1️⃣ 安装依赖

```bash
pip install -r requirements.txt
````

### 2️⃣ 启动服务

在 `backend1` 目录下执行：

```bash
uvicorn main:app --reload
```

* Swagger 文档：[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🔗 外部依赖：Ledger 服务（Backend2）

本服务依赖 Ledger HTTP 服务，请确保它已启动。

* Base URL：`http://localhost:4000`
* 健康检查：

```http
GET /health
```

返回示例：

```json
{ "status": "ok" }
```

---

## 🔌 Ledger 接口约定

| 功能     | 方法   | 路径            |
| ------ | ---- | ------------- |
| 上链创建处方 | POST | /create       |
| 验证处方   | POST | /verify       |
| 核销处方   | POST | /dispense     |
| 记录模型版本 | POST | /record_model |

> ⚠️ Ledger 返回错误（如非法状态流转）时，backend1 会直接返回失败。

---

## 📡 本服务 API（对前端）

### 1️⃣ 创建处方

```http
POST /prescriptions/create
```

**请求体示例**

```json
{
  "payload": {
    "patient": "Alice",
    "drug": "Amoxicillin",
    "dose": "500mg"
  }
}
```

**行为**

* 生成 prescriptionId
* 计算 payload hash
* 保存数据库
* 调用 Ledger `create` 上链

---

### 2️⃣ 验证处方

```http
POST /prescriptions/verify
```

```json
{
  "prescription_id": "xxx"
}
```

* 只能验证未核销的处方
* 调用 Ledger 校验状态

---

### 3️⃣ 核销处方（Dispense）

```http
POST /prescriptions/dispense
```

```json
{
  "prescription_id": "xxx"
}
```

* 已 Dispensed 的处方再次调用 → ❌ 失败
* 本地 DB + Ledger 双重校验

---

### 4️⃣ 查询处方

```http
GET /prescriptions/{id}
```

返回处方当前状态与 hash。

---

## 🧪 验收流程（Demo 用）

使用 Swagger / Postman 完整跑通：

1. `POST /prescriptions/create`
2. `POST /prescriptions/verify`
3. `POST /prescriptions/dispense`
4. 再次 dispense → **必须失败（防重放）**

Ledger 控制台会显示类似：

```
Generating Block #1 TxHash: ...
```

---

## ⚠️ 注意事项

* backend1 **必须在 Ledger 服务启动后运行**
* Ledger 负责状态机合法性校验
* backend1 不缓存 Ledger 状态，以 Ledger 为准


