# PetSchool 后端 API 文档

## 基础信息

- **基础路径**: `/api`
- **API 文档**: 启动后访问 `http://localhost:8080/api/doc.html`

## 接口列表

### 1. 宠物管理

#### 1.1 分页查询宠物列表

```
GET /api/pets
```

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| pageNum | Integer | 否 | 页码，默认 1 |
| pageSize | Integer | 否 | 每页数量，默认 10 |
| studentId | String | 否 | 学号筛选 |
| name | String | 否 | 宠物名称模糊搜索 |
| species | String | 否 | 物种筛选 |

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "total": 5,
    "pages": 1,
    "pageNum": 1,
    "pageSize": 10,
    "list": [
      {
        "id": 1,
        "studentId": "P20240001",
        "name": "旺财",
        "species": "狗",
        "breed": "金毛",
        "age": 24,
        "weight": 25.5,
        "gender": 1,
        "genderLabel": "公",
        "photoUrl": "/images/pets/wangcai.jpg",
        "description": "活泼可爱的金毛",
        "ownerName": "张三",
        "ownerContact": "13800138001",
        "isVaccinated": 1,
        "vaccinationDate": "2024-01-15",
        "isNeutered": 0,
        "healthStatus": "健康",
        "createTime": "2024-01-01 10:00:00",
        "updateTime": "2024-01-01 10:00:00"
      }
    ]
  }
}
```

#### 1.2 根据 ID 查询宠物详情

```
GET /api/pets/{id}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "studentId": "P20240001",
    "name": "旺财",
    ...
  }
}
```

#### 1.3 根据学号查询宠物

```
GET /api/pets/student/{studentId}
```

#### 1.4 创建宠物

```
POST /api/pets
```

**请求体**:

```json
{
  "studentId": "P20240006",
  "name": "小黑",
  "species": "狗",
  "breed": "哈士奇",
  "age": 12,
  "weight": 15.5,
  "gender": 1,
  "photoUrl": "/images/pets/haoshiqi.jpg",
  "description": "聪明的哈士奇",
  "ownerName": "孙八",
  "ownerContact": "13800138006",
  "isVaccinated": 1,
  "vaccinationDate": "2024-01-15",
  "isNeutered": 0,
  "healthStatus": "健康"
}
```

#### 1.5 更新宠物

```
PUT /api/pets/{id}
```

**请求体**:

```json
{
  "name": " Updated 旺财",
  "weight": 26.0,
  "healthStatus": "状态良好"
}
```

#### 1.6 删除宠物

```
DELETE /api/pets/{id}
```

---

### 2. 轮播图管理

#### 2.1 查询启用的轮播图列表

```
GET /api/carousel
```

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "imageUrl": "/images/carousel/banner1.jpg",
      "title": "欢迎加入宠物学校",
      "linkUrl": "https://yl-pet-school.xyz",
      "sortOrder": 1,
      "status": 1,
      "createTime": "2024-01-01 10:00:00"
    }
  ]
}
```

#### 2.2 根据 ID 查询轮播图

```
GET /api/carousel/{id}
```

---

## 错误码说明

| 错误码 | 说明 |
| :--- | :--- |
| 200 | 操作成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
| 1001 | 宠物信息不存在 |
| 1002 | 学号已存在 |
| 1003 | 轮播图不存在 |
