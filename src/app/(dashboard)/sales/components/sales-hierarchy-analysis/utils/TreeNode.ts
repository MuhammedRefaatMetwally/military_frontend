import {
  BRANCHES,
  CATS,
  PROD_NAMES,
  srand,
  SUB_MAP,
  THIRD_GROUPS,
} from "./data";

const TOTAL = 1847520;

export interface TreeNode {
  id: string;
  label: string;
  labelEn?: string;
  value: number;
  children?: TreeNode[];
}

export const treeData: TreeNode = {
  id: "root",
  label: "صافي المبيعات",
  labelEn: "Net Sales",
  value: TOTAL,
  children: BRANCHES.map((branch, branchIndex) => {
    const branchValue = Math.round(TOTAL * branch.pct + srand() * 5000);

    return {
      id: `b${branchIndex}`,
      label: branch.label,
      value: branchValue,
      children: CATS.map((category, categoryIndex) => {
        const categoryValue = Math.round(
          branchValue * category.pct + srand() * 2000,
        );
        const subcategories = SUB_MAP[category.label] || [
          "متفرقات",
          "عام",
          "أخرى",
        ];

        return {
          id: `b${branchIndex}-c${categoryIndex}`,
          label: category.label,
          value: categoryValue,
          children: subcategories.map((subcategory, subcategoryIndex) => {
            const subcategoryValue = Math.round(
              (categoryValue / subcategories.length) *
                (1 - subcategoryIndex * 0.07) +
                srand() * 800,
            );

            return {
              id: `b${branchIndex}-c${categoryIndex}-s${subcategoryIndex}`,
              label: subcategory,
              value: subcategoryValue,
              children: THIRD_GROUPS.map((thirdGroup, thirdGroupIndex) => {
                const thirdGroupValue = Math.round(
                  (subcategoryValue / THIRD_GROUPS.length) *
                    (1 - thirdGroupIndex * 0.06) +
                    srand() * 350,
                );
                const productCount = 4 + Math.round(srand() * 2);

                return {
                  id: `b${branchIndex}-c${categoryIndex}-s${subcategoryIndex}-g${thirdGroupIndex}`,
                  label: thirdGroup,
                  value: thirdGroupValue,
                  children: Array.from(
                    { length: productCount },
                    (_, productIndex) => {
                      const nameIndex =
                        (subcategoryIndex * 7 +
                          thirdGroupIndex * 5 +
                          productIndex) %
                        PROD_NAMES.length;

                      return {
                        id: `b${branchIndex}-c${categoryIndex}-s${subcategoryIndex}-g${thirdGroupIndex}-p${productIndex}`,
                        label: PROD_NAMES[nameIndex],
                        value: Math.round(
                          (thirdGroupValue / productCount) *
                            (1 - productIndex * 0.05) +
                            srand() * 200,
                        ),
                      };
                    },
                  ),
                };
              }),
            };
          }),
        };
      }),
    };
  }),
};
