import {useContext} from "react";
import {Button} from "react-native-paper";
import {MyUserContext} from "../../utils/contexts/MyContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MyStyles from "../../styles/MyStyles";
import React, {useState} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import UserStyle from "./UserStyle";
const User = () => {
  const [user, dispatch] = useContext(MyUserContext);

  const logout = async () => {
    AsyncStorage.removeItem("token");
    dispatch({
      type: "logout",
    });
  };

  return (
    <View style={UserStyle.container}>
      <View style={UserStyle.profileCard}>
        {/* Phần Avatar & Thông tin */}
        <View style={UserStyle.avatarContainer}>
          <Image
            source={{uri: user.avatar || "https://i.pravatar.cc/300"}}
            style={UserStyle.avatar}
          />
        </View>
        <Text style={UserStyle.userName}>
          WELCOME! {user.first_name} {user.last_name}
        </Text>
        <Text style={UserStyle.userEmail}>{user.email || "Chưa có email"}</Text>
        <TouchableOpacity style={UserStyle.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={24} color="#e11d48" />
          <Text style={UserStyle.logoutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default User;
