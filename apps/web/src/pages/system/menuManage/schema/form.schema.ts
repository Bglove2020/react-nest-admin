import {
  menuButtonSchema,
  menuCatalogSchema,
  menuFormSchema,
  menuItemSchema,
} from "@ruoyi/contracts";
import type { FrontendMenu, MenuFormPayload } from "@ruoyi/contracts";

export const formSchema = menuFormSchema;

export type TFormSchema = MenuFormPayload;

const BASE_SCHEMAS = {
  M: menuCatalogSchema,
  C: menuItemSchema,
  F: menuButtonSchema,
} as const;

export type MenuType = keyof typeof BASE_SCHEMAS;

export function getFieldKeysByType(type: MenuType) {
  const schema = BASE_SCHEMAS[type];
  return Object.keys(schema.shape);
}

export const DEFAULT_VALUES: Record<MenuType, Partial<TFormSchema>> = {
  M: {
    menuType: "M",
    name: "",
    path: "",
    sortOrder: 0,
    status: "1",
    visible: "1",
    isFrame: "0",
  },
  C: {
    menuType: "C",
    name: "",
    path: "",
    perms: "",
    sortOrder: 0,
    status: "1",
    visible: "1",
    isFrame: "0",
    parentId: "",
  },
  F: {
    menuType: "F",
    name: "",
    perms: "",
    sortOrder: 0,
    status: "1",
    parentId: "",
  },
};

export function extractFieldsByType(
  data: FrontendMenu,
  type: MenuType,
): Partial<TFormSchema> {
  const allowedKeys = getFieldKeysByType(type);
  const result: Partial<FrontendMenu> = {};
  for (const key of allowedKeys) {
    if (key in data) {
      const value = data[key as keyof FrontendMenu];
      result[key as keyof FrontendMenu] =
        value ?? ((key === "path" || key === "perms" ? "" : value) as any);
    }
  }

  return result as Partial<TFormSchema>;
}

export function getInitialValues(
  isCreate: boolean,
  activeData?: FrontendMenu,
): Partial<TFormSchema> {
  console.log("activeData:", activeData);
  console.log("isCreate:", isCreate);
  if (isCreate) {
    if (activeData?.menuType === "M")
      return {
        ...DEFAULT_VALUES["C"],
        parentId: activeData?.id as string,
      };
    if (activeData?.menuType === "C")
      return {
        ...DEFAULT_VALUES["F"],
        parentId: activeData?.id as string,
      };
    // if(activeData?.menuType === "F") return {...DEFAULT_VALUES["F"], parentId: activeData?.id};
    return DEFAULT_VALUES["M"];
  } else {
    const extracted = extractFieldsByType(
      activeData!,
      activeData!.menuType as MenuType,
    );
    console.log("activeData!.menuType:", activeData!.menuType);
    console.log("extracted:", extracted);
    return {
      ...DEFAULT_VALUES[activeData!.menuType as MenuType],
      ...extracted,
      parentId: undefined,
    };
  }
}
