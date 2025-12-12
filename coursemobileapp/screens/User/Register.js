import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MyStyles from "../../styles/MyStyles";
import { Button, HelperText, TextInput } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import Apis, { endpoints } from "../../utils/Apis";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

const Register = () => {
  const info = [
    {
      title: "Tên",
      field: "first_name",
      icon: "text",
    },
    {
      title: "Họ và tên lót",
      field: "last_name",
      icon: "text",
    },
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
    {
      title: "Xác nhận mật khẩu",
      field: "confirm",
      icon: "eye",
      secureTextEntry: true,
    },
  ];

  const [user, setUser] = useState({});
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigation();

  const uploadToCloudinary = async (file) => {
    if (!file) return null;
    const data = new FormData();
    data.append("file", {
      uri: file.uri,
      type: file.mimeType || "image/jpeg",
      name: file.fileName || "upload.jpg",
    });
    data.append("upload_preset", "courseapp_preset");
    data.append("cloud_name", "dpl8syyb9");

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dpl8syyb9/image/upload",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      return res.data.secure_url;
    } catch (error) {
      console.error("Lỗi upload ảnh:", error);
      return null;
    }
  };

  const pickImage = async () => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      alert("Permissions denied!");
    } else {
      const result = await ImagePicker.launchImageLibraryAsync();
      if (!result.canceled) {
        setUser({ ...user, avatar: result.assets[0] });
      }
    }
  };

  const validate = () => {
    if (!user.password || user.password !== user.confirm) {
      setErr(true);
      return false;
    }
    //...

    setErr(false);
    return true;
  };

  const register = async () => {
    if (validate() === true) {
      try {
        setLoading(true);

        let avatarUrl = null;
        if (user.avatar) {
          avatarUrl = await uploadToCloudinary(user.avatar);
          if (!avatarUrl) {
            Alert.alert("Lỗi", "Không thể upload ảnh. Vui lòng thử lại.");
            setLoading(false);
            return;
          }
        }
        let form = new FormData();
        for (let key in user)
          if (key !== "confirm" && key !== "avatar") {
            form.append(key, user[key]);
          }

        if (avatarUrl) {
          form.append("avatar", avatarUrl);
        }
        console.info(user);

        let res = await Apis.post(endpoints["register"], form, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (res.status === 201) {
          Alert.alert("Thành công", "Đăng ký thành công! Vui lòng đăng nhập.");
          nav.navigate("Login");
        }
      } catch (ex) {
        console.error(ex);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={MyStyles.padding}>
      <Text style={MyStyles.title}>ĐĂNG KÝ NGƯỜI DÙNG</Text>
      <ScrollView>
        <HelperText type="error" visible={err}>
          Mật khẩu KHÔNG khớp!
        </HelperText>

        {info.map((i) => (
          <TextInput
            key={i.field}
            style={MyStyles.margin}
            value={user[i.field]}
            onChangeText={(t) => setUser({ ...user, [i.field]: t })}
            label={i.title}
            secureTextEntry={i.secureTextEntry}
            right={<TextInput.Icon icon={i.icon} />}
          />
        ))}

        <TouchableOpacity style={MyStyles.margin} onPress={pickImage}>
          <Text>Chọn ảnh đại diện...</Text>
        </TouchableOpacity>

        {user.avatar && (
          <Image source={{ uri: user.avatar.uri }} style={MyStyles.avatar} />
        )}

        <Button
          loading={loading}
          disabled={loading}
          style={MyStyles.margin}
          icon="account"
          mode="contained"
          onPress={register}
        >
          Đăng ký
        </Button>
      </ScrollView>
    </View>
  );
};

export default Register;
