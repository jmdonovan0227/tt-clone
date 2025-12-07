import {
  FlatList,
  View,
  Dimensions,
  ViewToken,
  StyleSheet,
  ActivityIndicator,
  Text,
} from "react-native";
import PostListItem from "@/components/PostListItem";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMemo, useRef, useState } from "react";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import FeedTab from "@/components/GenericComponents/FeedTab";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPosts } from "@/services/posts";

const TABS = {
  EXPLORE: "Explore",
  FOR_YOU: "For You",
  FOLLOWING: "Following",
};

// TIP: expo "plugins:" allows us to configure our app at the native level in app.json!
// when we change ths plugin we may have to generate binaries (run native build with ios/android)
// for the app to work properly as when you install dep not included in expo go/edit app.json config,
// you may have to generate binaries.
export default function HomeScreen() {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam }) => fetchPosts(pageParam),
    initialPageParam: { limit: 3, cursor: undefined },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === 0) {
        return undefined;
      }

      return {
        limit: 3,
        cursor: lastPage[lastPage.length - 1].id,
      };
    },
  });

  const posts = useMemo(() => data?.pages.flat() || [], [data]);

  const { height } = Dimensions.get("window");
  const { top, bottom } = useSafeAreaInsets();
  // set current video index
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(TABS.FOR_YOU);

  // ViewToken is an object returned from onViewableItemsChanged callback which reprsents an items in the FlatList
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index || 0);
      }
    }
  );

  if (isLoading) {
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      />
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text
          style={{
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
            fontSize: 18,
          }}
        >
          Error occured while fetching posts: {error.message}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.topBar}>
        <MaterialIcons name="live-tv" size={24} color="black" />

        <View style={styles.navigationBar}>
          <FeedTab
            title={TABS.EXPLORE}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
          <FeedTab
            title={TABS.FOLLOWING}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
          <FeedTab
            title={TABS.FOR_YOU}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
        </View>

        <Ionicons name="search" size={24} color="black" />
      </View>
      <FlatList
        data={posts}
        renderItem={({ item, index }) => (
          <PostListItem postItem={item} isActive={index === currentIndex} />
        )}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        snapToInterval={height - (top + bottom)} // snap to the height of the screen minus the safe area insets
        decelerationRate="fast" // faster snapping
        disableIntervalMomentum // disable momentum when scrolling so we don't skip multiple items when scrolling
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50, // 50% of the item must be visible to be considered as visible
        }}
        onEndReached={() =>
          !isFetchingNextPage && hasNextPage && fetchNextPage()
        }
        onEndReachedThreshold={2} // 2 spaces from the end.
        getItemLayout={(data, index) => ({
          length: height - 80,
          offset: (height - 80) * index,
          index,
        })} // this is used to improve the performance of the FlatList by providing a layout for the
        initialNumToRender={3} // render 3 items initially (helps with performance)
        maxToRenderPerBatch={3} // render 3 items per batch (helps with performance)
        windowSize={5} // render 5 items before and after the current item (helps with performance)
      />
    </View>
  );
}

const styles = StyleSheet.create({
  navigationBar: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  topBar: {
    flexDirection: "row",
    position: "absolute",
    top: 70,
    zIndex: 1,
    paddingHorizontal: 15,
  },
});
