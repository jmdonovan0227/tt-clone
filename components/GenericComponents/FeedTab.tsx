import { TouchableOpacity, Text, StyleSheet, View } from "react-native";

type FeedTabProps = {
  title: string;
  setActiveTab: (tab: string) => void;
  activeTab: string;
};

export default function FeedTab({
  title,
  setActiveTab,
  activeTab,
}: FeedTabProps) {
  return (
    <TouchableOpacity
      style={styles.tabContainer}
      onPress={() => setActiveTab(title)}
    >
      <Text
        style={[styles.tabText, activeTab === title && styles.activeTabText]}
      >
        {title}
      </Text>

      {activeTab === title && <View style={styles.activeLine} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    alignItems: "center",
  },
  tabText: {
    color: "grey",
    fontSize: 17,
    fontWeight: "bold",
  },
  activeTabText: {
    color: "white",
  },
  activeLine: {
    width: 20,
    height: 2,
    backgroundColor: "white",
    marginTop: 4,
  },
});
