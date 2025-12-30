import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import MyStyles from "../../styles/MyStyles";
import { useContext, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Button, HelperText, TextInput } from "react-native-paper";
import Apis, {
  authApis,
  CLIENT_ID,
  CLIENT_SECRET,
  endpoints,
} from "../../utils/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MyUserContext } from "../../utils/contexts/MyContext";
import LoginStyle from "./LoginStyle";
import { TouchableOpacity } from "react-native";

const Login = () => {
  const info = [
    {
      title: "Tên đăng nhập",
      field: "username",
      icon: "account",
    },
    {
      title: "Mật khẩu",
      field: "password",
      icon: "eye",
      secureTextEntry: true,
    },
  ];

  const [user, setUser] = useState({});
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigation();
  const [, dispatch] = useContext(MyUserContext);

  const validate = () => {
    // if (!user.password || user.password !== user.confirm) {
    //     setErr(true)
    //     return false;
    // }
    // //...

    // setErr(false);
    return true;
  };

  const login = async () => {
    if (validate() === true) {
      try {
        setLoading(true);
        console.info(user);
        // let res = await Apis.post(endpoints["login"], {
        //   ...user,
        //   client_id: CLIENT_ID,
        //   client_secret: CLIENT_SECRET,
        //   grant_type: "password",
        // });

        let res = await Apis.post(
          endpoints["login"],
          `grant_type=password&username=${user.username}&password=${user.password}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        console.info(res.data);
        AsyncStorage.setItem("token", res.data.access_token);

        setTimeout(async () => {
          let user = await authApis(res.data.access_token).get(
            endpoints["current_user"]
          );
          console.info(user.data);

          dispatch({
            type: "login",
            payload: user.data,
          });
        }, 500);
      } catch (ex) {
        console.error(ex);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={LoginStyle.container}
    >
      <View style={LoginStyle.header}>
        <Text style={LoginStyle.title}>ĐĂNG NHẬP</Text>
        <Text style={LoginStyle.subtitle}>Vui lòng đăng nhập để tiếp tục</Text>
      </View>
      <ScrollView
        style={LoginStyle.form}
        contentContainerStyle={LoginStyle.scrollContent}
      >
        <View style={LoginStyle.content}>
          <HelperText type="error" visible={err} style={{ marginBottom: 10 }}>
            Mật khẩu KHÔNG khớp!
          </HelperText>

          {info.map((i) => (
            <View key={i.field} style={LoginStyle.inputContainer}>
              <TextInput
                mode="outlined"
                outlineColor="#e5e7eb"
                activeOutlineColor="#2563eb"
                key={i.field}
                style={{ backgroundColor: "#f9fafb" }}
                value={user[i.field]}
                onChangeText={(t) => setUser({ ...user, [i.field]: t })}
                label={i.title}
                secureTextEntry={i.secureTextEntry}
                right={<TextInput.Icon icon={i.icon} color="#6b7280" />}
              />
            </View>
          ))}
          <TouchableOpacity style={LoginStyle.forgotPassword}>
            <Text style={LoginStyle.forgotPasswordText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          <Button
            loading={loading}
            disabled={loading}
            style={[
              LoginStyle.loginButton,
              { backgroundColor: loading ? "#93c5fd" : "#2563eb" },
            ]}
            icon="login"
            mode="contained"
            onPress={login}
            contentStyle={{ height: 50 }}
            labelStyle={LoginStyle.loginButtonText}
          >
            Đăng nhập
          </Button>
          <View style={LoginStyle.signupContainer}>
            <Text style={LoginStyle.signupText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => nav.navigate("Register")}>
              <Text style={LoginStyle.signupLink}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;
