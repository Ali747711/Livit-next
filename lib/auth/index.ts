import { initializeApollo } from "@/apollo/client";
import { LOGIN, SIGN_UP } from "@/apollo/user/mutation";
import { jwtDecode } from "jwt-decode";
import { CustomJwtPayload } from "../types/customJwtPayload";
import { userVar } from "@/apollo/store";

export const getJwtToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
};

export const setJwtToken = (token: string) => {
  localStorage.setItem("accessToken", token);
};

export const logIn = async (nick: string, password: string) => {
  try {
    const { jwtToken } = await reqJwtToken({ nick, password });

    if (jwtToken) {
      updateStorage({ jwtToken });
      updateUserinfo(jwtToken);
    }
  } catch (error: any) {
    console.log(error);
    throw error;
  }
};

export const signUp = async (
  nick: string,
  name: string,
  password: string,
  phone: string,
  type: string,
): Promise<void> => {
  try {
    const { jwtToken } = await reqSignUpToken({
      nick,
      name,
      password,
      phone,
      type,
    });
    if (jwtToken) {
      updateStorage({ jwtToken });
      updateUserinfo(jwtToken);
    }
  } catch (error: any) {
    console.warn("Signup Error: ", error.message);
    throw error;
  }
};
const reqJwtToken = async ({
  nick,
  password,
}: {
  nick: string;
  password: string;
}): Promise<{ jwtToken: string }> => {
  const apolloClient = await initializeApollo();

  try {
    const result = await apolloClient.mutate({
      mutation: LOGIN,
      variables: { input: { memberNick: nick, memberPassword: password } },
      fetchPolicy: "network-only",
    });

    console.log("====== LOGIN =======");
    const { accessToken } = (result?.data as any)?.login;

    return { jwtToken: accessToken };
  } catch (error: any) {
    console.log("Error in reqJwtToken Function: ", error.message);
    throw new Error(error.message);
  }
};

export const updateStorage = ({ jwtToken }: { jwtToken: string }) => {
  setJwtToken(jwtToken);
  window.localStorage.setItem("login", Date.now().toString());
};

const reqSignUpToken = async ({
  nick,
  name,
  password,
  phone,
  type,
}: {
  nick: string;
  name: string;
  password: string;
  phone: string;
  type: string;
}): Promise<{ jwtToken: string }> => {
  const apolloClient = await initializeApollo();

  try {
    const result = await apolloClient.mutate({
      mutation: SIGN_UP,
      variables: {
        input: {
          memberNick: nick,
          memberFullName: name,
          memberPassword: password,
          memberPhone: phone,
          memberType: type,
        },
      },
      fetchPolicy: "network-only",
    });
    console.log(" ========== SIGN UP ===========");
    const { accessToken } = (result?.data as any)?.signup;
    return { jwtToken: accessToken };
  } catch (error: any) {
    console.log("Error SignUp Function: ", error.message);
    throw new Error(error.message);
  }
};

export const updateUserinfo = (jwtToken: any) => {
  const decodedUser = jwtDecode<CustomJwtPayload>(jwtToken);
  // console.log(decodedUser);

  userVar({
    _id: decodedUser._id ?? "",
    memberType: decodedUser.memberType ?? "",
    memberStatus: decodedUser.memberStatus ?? "",
    memberAuthType: decodedUser.memberAuthType,
    memberPhone: decodedUser.memberPhone ?? "",
    memberNick: decodedUser.memberNick ?? "",
    memberFullName: decodedUser.memberFullName ?? "",
    memberImage:
      decodedUser.memberImage === null || decodedUser.memberImage === undefined
        ? "/img/profile/defaultUser.svg"
        : `${decodedUser.memberImage}`,
    memberAddress: decodedUser.memberAddress ?? "",
    memberDesc: decodedUser.memberDesc ?? "",
    memberProperties: decodedUser.memberProperties,
    memberRank: decodedUser.memberRank,
    memberArticles: decodedUser.memberArticles,
    memberPoints: decodedUser.memberPoints,
    memberLikes: decodedUser.memberLikes,
    memberViews: decodedUser.memberViews,
    memberWarnings: decodedUser.memberWarnings,
    memberBlocks: decodedUser.memberBlocks,
    createdAt: decodedUser.createdAt,
    updatedAt: decodedUser.updatedAt,
  });
};

export const logOut = () => {
  deleteStorage();
  deleteUserInfo();
  window.location.reload();
};

const deleteStorage = () => {
  localStorage.removeItem("accessToken");
  window.localStorage.setItem("Logged OUT", Date.now().toString());
};

const deleteUserInfo = () => {
  userVar({
    _id: "",
    memberType: "",
    memberStatus: "",
    memberAuthType: "",
    memberPhone: "",
    memberNick: "",
    memberFullName: "",
    memberImage: "",
    memberAddress: "",
    memberDesc: "",
    memberProperties: 0,
    memberRank: 0,
    memberArticles: 0,
    memberPoints: 0,
    memberLikes: 0,
    memberViews: 0,
    memberWarnings: 0,
    memberBlocks: 0,
    createdAt: null,
    updatedAt: null,
  });
};
