import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Categories from "../../components/Categories";
import { useNavigation } from "@react-navigation/native";
import { useLayoutEffect } from "react";
import Logout from "../Login/Logout";

const Home = () => {
  const nav = useNavigation();
  useLayoutEffect(() => {
    nav.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => Logout(nav)}
          style={{ marginRight: 10 }}
        >
          <Text style={{ color: "red", fontWeight: "bold" }}>Đăng xuất</Text>
        </TouchableOpacity>
      ),
    });
  }, [nav]);
  return (
    <View>
      <Categories />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
  },
});
export default Home;
