import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const endpoints = {
  categories: "/categories/",
  courses: "/courses/",
  lessons: (courseId) => `/courses/${courseId}/lessons/`,
  login: "/o/token/",
  register: "/users/",
  users: "/users/",
  "current-user": "/users/current-user/",
  "course-stats": "/stats/course-stats/",
  "general-stats": "/stats/general-stats/",
  "revenue-stats": "/stats/revenue-stats/",
  "chat-contacts": "/users/chat-contacts/",
  "course-students": (courseId) => `/courses/${courseId}/students/`,
  "add-course": "/courses/",
  "course-details": (courseId) => `/courses/${courseId}/`,
  "add-lesson": "/lessons/",
  "lesson-detail": (lessonId) => `/lessons/${lessonId}/`,
  "enroll-course": (courseId) => `/courses/${courseId}/enroll/`,
  "my-courses": "/courses/my-course/",
  "grant-lecturer": (userId) => `/users/${userId}/grant-lecturer/`,
  "momo-payment": "/payments/momo-pay/",
  "zalo-payment": "/payments/zalo-pay/",
  "vnpay-payment": "/payments/vnpay-payment/",
  comments: (lessonId) => `/lessons/${lessonId}/comments/`,
  "add-comment": (lessonId) => `/lessons/${lessonId}/add-comment/`,
  "mark-lesson-complete": (lessonId) => `/lessons/${lessonId}/complete/`,
  "like-lesson": (lessonId) => `/lessons/${lessonId}/like/`,
  "user-payments": "/payments/",
  'enrollment-stats': '/stats/enrollment-stats/',
};

const CLIENT_ID = process.env.EXPO_PUBLIC_CLIENT_ID;
const CLIENT_SECRET = process.env.EXPO_PUBLIC_CLIENT_SECRET;

// export const authApis = (token) => {
//   return axios.create({
//     baseURL: BASE_URL,
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
// };

export const authApis = (token) => {
  const instance = axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const newToken = await refreshAccessToken();

        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return instance(originalRequest);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

export default axios.create({
  baseURL: BASE_URL,
});
export const refreshAccessToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem("refresh_token");

    if (!refreshToken) {
      return null;
    }

    const res = await axios.post(
      `${BASE_URL}${endpoints["login"]}`,
      `grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const newAccessToken = res.data.access_token;
    const newRefreshToken = res.data.refresh_token;

    await AsyncStorage.setItem("token", newAccessToken);
    if (newRefreshToken) {
      await AsyncStorage.setItem("refresh_token", newRefreshToken);
    }

    return newAccessToken;
  } catch (error) {
    console.log("Lỗi refresh token:", error);
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("refresh_token");
    return null;
  }
};
export { CLIENT_ID, CLIENT_SECRET };
