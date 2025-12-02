import { FlatList, View, Dimensions, ViewToken } from "react-native";
import PostListItem from "@/components/PostListItem";
import posts from "@/assets/data/posts.json";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRef, useState } from "react";

export default function HomeScreen() {
  const { height } = Dimensions.get("window");
  const { top, bottom } = useSafeAreaInsets();
  // set current video index
  const [currentIndex, setCurrentIndex] = useState(0);

  // ViewToken is an object returned from onViewableItemsChanged callback which reprsents an items in the FlatList
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index || 0);
      }
    }
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={posts}
        renderItem={({ item, index }) => (
          <PostListItem postItem={item} isActive={index === currentIndex} />
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        snapToInterval={height - (top + bottom)} // snap to the height of the screen minus the safe area insets
        decelerationRate="fast" // faster snapping
        disableIntervalMomentum // disable momentum when scrolling so we don't skip multiple items when scrolling
        onViewableItemsChanged={onViewableItemsChanged.current}
      />
    </View>
  );
}
