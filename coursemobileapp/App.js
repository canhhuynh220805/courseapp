import React, { useContext, useReducer } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon } from "react-native-paper";
import { MyUserContext } from "./utils/contexts/MyContext";
import MyUserReducer from "./utils/reducers/MyUserReducer";
import Home from "./screens/Home/Home";
import Lesson from "./screens/Home/Lesson";
import LessonDetail from "./screens/Home/LessonDetail";
import Login from "./screens/User/Login";
import Register from "./screens/User/Register";
import User from "./screens/User/User";
import LecturerHome from "./screens/Lecturer/LecturerHome";
import ManageCourse from "./screens/Lecturer/ManageCourse";
import AddCourse from "./screens/Lecturer/AddCourse";
import AddLesson from "./screens/Lecturer/AddLesson";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const CourseStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="CourseHome" component={Home} options={{ title: "Khóa học" }} />
    <Stack.Screen name="Lesson" component={Lesson} options={{ title: "Bài học" }} />
    <Stack.Screen name="LessonDetail" component={LessonDetail} options={{ title: "Chi tiết bài học" }} />
  </Stack.Navigator>
);

const LecturerStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="LecturerHome" component={LecturerHome} options={{ title: "Quản lý giảng dạy" }} />
    <Stack.Screen name="ManageCourse" component={ManageCourse} options={{ title: "Chi tiết khóa học" }} />
    <Stack.Screen name="AddCourse" component={AddCourse} options={{ title: "Tạo khóa học" }} />
    <Stack.Screen name="AddLesson" component={AddLesson} options={{ title: "Thêm bài học" }} />
  </Stack.Navigator>
);

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="Register" component={Register} />
  </Stack.Navigator>
);

const TabNavigator = () => {
  const [user] = useContext(MyUserContext);

  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: "#2563eb" }}>
      <Tab.Screen
        name="Main"
        component={CourseStack}
        options={{
          title: "Trang chủ",
          headerShown: false,
          tabBarIcon: ({ color }) => <Icon color={color} source="home" size={26} />,
        }}
      />

      {user?.role === "LECTURER" && (
        <Tab.Screen
          name="Manage"
          component={LecturerStack}
          options={{
            title: "Giảng dạy",
            headerShown: false,
            tabBarIcon: ({ color }) => <Icon source="school" size={26} color={color} />
          }}
        />
      )}

      <Tab.Screen
        name="ProfileTab"
        component={user ? User : AuthStack}
        options={{
          title: user ? "Cá nhân" : "Đăng nhập",
          headerShown: user ? true : false,
          tabBarIcon: ({ color }) => <Icon color={color} source="account" size={26} />,
        }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  return (
    <MyUserContext.Provider value={[user, dispatch]}>
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </MyUserContext.Provider>
  );
};

export default App;