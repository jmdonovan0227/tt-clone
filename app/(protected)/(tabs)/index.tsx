import {
  FlatList,
  View,
  Dimensions,
  ViewToken,
  StyleSheet,
} from "react-native";
import PostListItem from "@/components/PostListItem";
import posts from "@/assets/data/posts.json";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRef, useState } from "react";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import FeedTab from "@/components/GenericComponents/FeedTab";

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
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        snapToInterval={height - (top + bottom)} // snap to the height of the screen minus the safe area insets
        decelerationRate="fast" // faster snapping
        disableIntervalMomentum // disable momentum when scrolling so we don't skip multiple items when scrolling
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50, // 50% of the item must be visible to be considered as visible
        }}
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
