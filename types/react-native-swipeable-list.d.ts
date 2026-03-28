declare module "react-native-swipeable-list" {
  import { ComponentType, ReactNode } from "react";
  import { FlatListProps } from "react-native";

  export interface SwipeableRenderInfo<ItemT> {
    item: ItemT;
    index: number;
  }

  export interface SwipeableFlatListProps<ItemT>
    extends FlatListProps<ItemT> {
    bounceFirstRowOnMount?: boolean;
    maxSwipeDistance?: number | ((info: SwipeableRenderInfo<ItemT>) => number);
    renderQuickActions?: (info: SwipeableRenderInfo<ItemT>) => ReactNode;
  }

  const SwipeableFlatList: ComponentType<SwipeableFlatListProps<any>>;
  export default SwipeableFlatList;
}
