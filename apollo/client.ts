import { getJwtToken } from "@/lib/auth";
import { ApolloLink } from "@apollo/client";
import { from } from "@apollo/client";
import { InMemoryCache } from "@apollo/client";
import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import UploadHttpLink from "apollo-upload-client/UploadHttpLink.mjs";
import { useMemo } from "react";

let apolloClient: ApolloClient | undefined;

const getHeaders = () => {
  const headers = {} as HeadersInit;
  const token = getJwtToken();
  // @ts-ignore
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

const createIsomorphicLink = () => {
  if (typeof window !== "undefined") {
    const authLink = new ApolloLink((operation, forward) => {
      operation.setContext(({ headers = {} }) => ({
        headers: {
          ...headers,
          ...getHeaders(),
        },
      }));

      return forward(operation);
    });

    // @ts-ignore
    const link = new UploadHttpLink({
      uri:
        process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:3005/graphql",
      credentials: "include",
    });

    const errorLink = onError(({ error, operation }: any) => {
      console.log(error);
      console.log(operation);
      console.log(error?.errors);
      if (error?.errors) {
        error.errors.forEach(({ message, locations, path }: any) => {
          console.log(
            `[GraphQL Error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
          );
          if (message.includes("input")) console.log("Message: ", message);
        });
      }
      if (error?.networkError) {
        console.log("[NetworkError]: ", error.networkError);
        if (error.networkError?.statusCode === 401) {
          console.log("Unauthorized!");
        }
      }
    });

    return from([errorLink, authLink, link]);
  }
};

const createApolloClient = () => {
  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    // @ts-ignore - link is undefined during SSR, which is expected
    link: createIsomorphicLink(),
    cache: new InMemoryCache(),
    resolvers: {},
  });
};

export const initializeApollo = (initialState = null) => {
  const _apolloClient = apolloClient ?? createApolloClient();
  if (initialState) _apolloClient.cache.restore(initialState);
  if (typeof window === "undefined") return _apolloClient;
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
};

export const useApollo = (initialState: any) => {
  return useMemo(() => initializeApollo(initialState), [initialState]);
};
