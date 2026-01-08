import React, { useState, useCallback } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Chip } from "react-native-paper";
import Categories from "../../components/Categories";
import Courses from "../../components/Courses";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../utils/Apis";
import { useFocusEffect } from "@react-navigation/native";
import { Alert } from "react-native";
import { jwtDecode } from "jwt-decode";
import styles from "./styles";

const Home = () => {
  const [cate, setCate] = useState(null);
  const [ordering, setOrdering] = useState("newest");

  const sortOptions = [
    { label: "Mới nhất", value: "newest" },
    { label: "Phổ biến", value: "popular" },
    { label: "Giá thấp", value: "price_asc" },
    { label: "Giá cao", value: "price_desc" },
  ];



  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <Categories setCate={setCate} activeCate={cate} />

      <View style={{ backgroundColor: "#fff" }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 10,
            paddingVertical: 10,
            alignItems: 'center'
          }}
        >
          {sortOptions.map((item) => (
            <TouchableOpacity
              key={item.value}
              onPress={() => setOrdering(item.value)}
              activeOpacity={0.8}
            >
              <Chip
                mode="flat"
                selected={ordering === item.value}
                style={{
                  marginRight: 10,
                  backgroundColor: ordering === item.value ? "#2563eb" : "#f0f0f0",
                  height: 36,
                }}
                textStyle={{
                  color: ordering === item.value ? "#fff" : "#333",
                  fontSize: 13,
                }}
              >
                {item.label}
              </Chip>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Courses cate={cate} ordering={ordering} />
    </View>
  );
};

export default Home;