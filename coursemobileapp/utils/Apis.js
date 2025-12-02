import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const endpoints = {
  categories: "/categories/",
  courses: "/courses/",
  login: "/o/token/",
  logout: "/o/revoke_token/",
  "current-user": "/users/current-user/",
};

const CLIENT_ID = process.env.EXPO_PUBLIC_CLIENT_ID;
const CLIENT_SECRET = process.env.EXPO_PUBLIC_CLIENT_SECRET;

export const authApi = async () => {
  const token = await AsyncStorage.getItem("access_token");
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export default axios.create({
  baseURL: BASE_URL,
});

export { CLIENT_ID, CLIENT_SECRET };
