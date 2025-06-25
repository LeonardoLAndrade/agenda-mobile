import React from "react";
import { BaseToast, ErrorToast, ToastProps } from "react-native-toast-message";

export const toastConfig: {
  [type: string]: (props: ToastProps) => ReturnType<typeof BaseToast>;
} = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#4BB543",
        backgroundColor: "#4BB543",
        zIndex: 9999,
        elevation: 10,
        alignItems: "flex-start",
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
        paddingVertical: 12,
        flex: 1,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 4,
      }}
      text2Style={{ fontSize: 14, color: "#fff", lineHeight: 18 }}
      text1NumberOfLines={0}
      text2NumberOfLines={0}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "#FF3B30",
        backgroundColor: "#FF3B30",
        zIndex: 9999,
        elevation: 10,
        alignItems: "flex-start",
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
        paddingVertical: 12,
        flex: 1,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 4,
      }}
      text2Style={{ fontSize: 14, color: "#fff", lineHeight: 18 }}
      text1NumberOfLines={0}
      text2NumberOfLines={0}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#FFEA02",
        backgroundColor: "#FFEA02",
        zIndex: 9999,
        elevation: 10,
        alignItems: "flex-start",
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
        paddingVertical: 12,
        flex: 1,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 4,
      }}
      text2Style={{ fontSize: 14, color: "#000", lineHeight: 18 }}
      text1NumberOfLines={0}
      text2NumberOfLines={0}
    />
  ),
};
