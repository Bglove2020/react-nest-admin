/**
 * 基础扁平节点接口
 */
interface BaseFlatItem {
  id: number;
  parentId: number;
  [key: string]: any;
}

/**
 * 递归树形结构类型
 */
export type Tree<T> = T & {
  children: Tree<T>[];
};

/**
 * 完全通用的从扁平化的结构构造树形结构的方法
 */
export function buildTreeWithAnyData<T, R>(
  data: T[],
  options: {
    parentKey: keyof T;
    indexKey: keyof T;
    mapper: (item: T) => R;
    isRoot: (item: T) => boolean;
  },
): Tree<R>[] {
  const { parentKey, indexKey, mapper, isRoot } = options;
  const nodeMap = new Map<any, Tree<R>>();

  // 初始化所有节点
  data.forEach((item) => {
    nodeMap.set(item[indexKey], { ...mapper(item), children: [] });
  });

  const rootNodes: Tree<R>[] = [];
  data.forEach((item) => {
    const node = nodeMap.get(item[indexKey])!;
    if (isRoot(item)) {
      rootNodes.push(node);
    } else {
      const parent = nodeMap.get(item[parentKey]);
      if (parent) {
        parent.children.push(node);
      }
    }
  });

  return rootNodes;
}

/**
 * 将扁平数据转换为树形结构（基于 id 和 parentId）
 * @param flatData 扁平数据数组
 * @param mapper 将原始数据映射为目标节点的函数
 * @returns 树形结构数组
 */
export function buildTree<T extends BaseFlatItem, R>(
  flatData: T[],
  mapper: (item: T) => R,
): Tree<R>[] {
  // 创建 id 到节点的映射
  const nodeMap = new Map<number, Tree<R>>();

  // 初始化所有节点并添加到映射中
  flatData.forEach((item) => {
    nodeMap.set(item.id, { ...mapper(item), children: [] });
  });

  // 构建树形结构
  const rootNodes: Tree<R>[] = [];

  flatData.forEach((item) => {
    const node = nodeMap.get(item.id)!;

    if (item.parentId === 0 || !nodeMap.has(item.parentId)) {
      // 根节点或父节点不存在，添加到根节点数组
      rootNodes.push(node);
    } else {
      // 找到父节点，将当前节点添加到父节点的 children 中
      const parent = nodeMap.get(item.parentId);
      if (parent) {
        parent.children.push(node);
      }
    }
  });

  return rootNodes;
}
