import { Alert, Button, Text, TextInput, View } from "react-native";
import Apis, { CLIENT_ID, CLIENT_SECRET, endpoints } from "../../utils/Apis";
import { useState } from "react";
import styles from "./styles";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigation();

  const login = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);
      formData.append("grant_type", "password");
      formData.append("client_id", CLIENT_ID);
      formData.append("client_secret", CLIENT_SECRET);
      console.info("Đang đăng nhập...");
      let res = await Apis.post(endpoints["login"], formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.info("Token nhận được:", res.data.access_token);
      // lưu token về máy
      await AsyncStorage.setItem("access_token", res.data.access_token);

      // điều hướng về Home
      nav.navigate("Home");
    } catch (ex) {
      console.error(ex);
      Alert.alert("Lỗi", "Tên đăng nhập hoặc mật khẩu không đúng!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text>Đăng nhập</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        placeholder="Nhập tên đăng nhập"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        placeholder="Nhập mật khẩu"
        secureTextEntry={true}
      />
      <Button
        title={loading ? "Đang đăng nhập..." : "Đăng nhập"}
        onPress={login}
        disabled={loading}
      />
    </View>
  );
};

export default Login;
