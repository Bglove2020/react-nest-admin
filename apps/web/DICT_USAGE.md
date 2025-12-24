# 字典使用指南

## 快速开始

字典模块已经实现，现在你可以轻松在前端表单中使用字典数据了！

## 两种使用方式

### 方式一：使用 DictSelect 组件（推荐）⭐

最简单的方式，直接使用封装好的组件：

```typescript
import { DictSelect } from "@/components/dict-select";
import { Controller } from "react-hook-form";

<Controller
  name="status"
  control={control}
  render={({ field }) => (
    <DictSelect
      dictType="sys_normal_disable"  // 字典类型
      value={field.value}
      onChange={field.onChange}
      placeholder="请选择状态"
    />
  )}
/>
```

### 方式二：使用 useDictOptions Hook

如果需要更多控制，可以直接使用 hook：

```typescript
import { useDictOptions } from "@/lib/dictQueries";
import { SingleSelect } from "@/components/single-select";

const { options, isLoading } = useDictOptions("sys_user_sex");

<SingleSelect
  options={options}
  value={value}
  onChange={onChange}
  disabled={isLoading}
  placeholder="请选择性别"
/>
```

## 实际使用示例

### 在角色管理对话框中使用字典

假设你想将状态字段改为使用字典（需要先在后端创建对应的字典类型）：

```typescript
// 在 add-role.tsx 中
import { DictSelect } from "@/components/dict-select";

// 将原来的 RadioGroup 替换为：
<Field orientation="grid">
  <FieldLabel>状态</FieldLabel>
  <Controller
    name="status"
    control={control}
    render={({ field }) => (
      <DictSelect
        dictType="sys_normal_disable"  // 字典类型，需要在字典管理中配置
        value={field.value}
        onChange={field.onChange}
        placeholder="请选择状态"
      />
    )}
  />
  {errors.status && (
    <FieldError errors={[errors.status]} className="col-start-2" />
  )}
</Field>
```

## 步骤说明

1. **配置字典**：在系统管理 -> 字典管理中创建字典类型和字典数据
   - 例如：创建字典类型 `sys_normal_disable`
   - 添加字典数据：
     - 标签：正常，键值：1
     - 标签：停用，键值：0

2. **在前端使用**：
   - 导入 `DictSelect` 组件或 `useDictOptions` hook
   - 传入字典类型（`dictType`）
   - 绑定到表单字段

## 可用的 API

### Hooks

- `useDictOptions(dictType, enabled, filterStatus)` - 获取选项数组（最推荐）
- `useDictDataByTypeQuery(dictType, enabled)` - 获取原始字典数据
- `useDictTypesQuery(enabled)` - 获取所有字典类型
- `useDictDataQuery(params, enabled)` - 通过 publicId 和 type 获取数据

### 工具函数

- `dictDataToOptions(dictData, filterStatus)` - 将字典数据转换为选项格式

### 组件

- `<DictSelect />` - 字典选择器组件（推荐使用）

## 详细文档

更多详细的使用示例和说明，请查看：
- `src/lib/dictUsageExample.md` - 完整的使用示例和说明

## 常见问题

**Q: 字典类型在哪里配置？**
A: 在系统管理 -> 字典管理中创建和配置字典类型。

**Q: 如何知道字典类型是什么？**
A: 在字典管理页面，字典类型（type）字段的值就是你需要传入的 `dictType`。

**Q: 字典数据会自动排序吗？**
A: 是的，会根据 `sortOrder` 字段自动排序。

**Q: 停用的字典数据会显示吗？**
A: 默认不会，`useDictOptions` 和 `DictSelect` 默认只返回启用状态的数据。如果需要包含停用数据，设置 `filterStatus={false}`。

